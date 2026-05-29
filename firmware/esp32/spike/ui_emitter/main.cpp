// SPIKE: prove a minimal C++ manifest emitter produces a protobuf byte-IDENTICAL
// to the existing TypeScript toolchain (tools/manifest), compiled with host g++
// and NO Node. De-risks the "describe the UI in C++" sub-project.
//
// Build: see build.ps1 (mingw g++ + vendored nanopb). Writes cpp.pb.
//
// Mechanism replicated from tools/manifest/src/compiler:
//   * StringTable  (stringTable.ts): index 0 = "", intern in first-use order, dedup.
//   * assignIds    (assignIds.ts):   per kind, sort entries by string id ascending,
//                                    assign 1-based index in that sorted order.
//   * normalize    (normalize.ts):   the exact field/intern traversal order
//                                    (capabilities -> resources -> actions -> screens
//                                     -> appShell -> nodes, field order within each).
//   * encodeProto  (encodeProto.ts): the esp_control.ManifestBundle wire shape.
//
// IMPORTANT byte-equality finding (see report): the TS path uses protobuf.js'
// generated static encoder, which writes EVERY scalar field that is present on the
// message object -- including zero-valued ones (poll_ms=0, confirm_idx=0, bind{0,0},
// route_key_idx=0, widget_kind=0, text_idx=0, ...). Standard nanopb proto3 struct
// encoding OMITS zero singular scalars, so it cannot match. We therefore encode with
// nanopb's LOW-LEVEL stream primitives (pb_encode_tag / pb_encode_varint /
// pb_encode_string / pb_write) to reproduce the protobuf.js byte stream exactly.
// This still links only g++ + nanopb (no Node in the emit path).

#include <cstdint>
#include <cstdio>
#include <string>
#include <unordered_map>
#include <vector>
#include <algorithm>

#include <pb_encode.h>

// ----------------------------------------------------------------------------
// StringTable -- port of stringTable.ts
// ----------------------------------------------------------------------------
class StringTable {
public:
  StringTable() { intern(""); }  // index 0 is always ""
  uint32_t intern(const std::string& value) {
    auto it = index_.find(value);
    if (it != index_.end()) return it->second;
    const uint32_t next = static_cast<uint32_t>(list_.size());
    list_.push_back(value);
    index_.emplace(value, next);
    return next;
  }
  // internOptional("")/empty -> 0 (matches internOptional in stringTable.ts)
  uint32_t internOptional(const std::string& value) {
    if (value.empty()) return 0;
    return intern(value);
  }
  const std::vector<std::string>& items() const { return list_; }
private:
  std::unordered_map<std::string, uint32_t> index_;
  std::vector<std::string> list_;
};

// ----------------------------------------------------------------------------
// Authoring-level model (what the user "describes"). Slugs are string ids.
// This mirrors the CANONICAL manifest the YAML authoring layer expands to:
// a view's `content` becomes a synthetic STACK root node ("<view>.root") whose
// children are the content widgets. We model that explicitly here.
// ----------------------------------------------------------------------------
enum ValueType { VT_BOOL = 1, VT_INT = 2, VT_UINT = 3, VT_FLOAT = 4, VT_STRING = 5, VT_ENUM = 6, VT_DURATION_MS = 7 };
enum ReadMode  { RM_SNAPSHOT = 1, RM_SUBSCRIBE = 2, RM_POLL = 3 };
enum DangerLevel { DL_NORMAL = 1, DL_ELEVATED = 2, DL_DANGEROUS = 3 };
enum NodeKind  { NK_STACK = 1, NK_ROW = 2, NK_GRID = 3, NK_SECTION = 4, NK_WIDGET = 5 };
enum WidgetKind { WK_TEXT = 1, WK_STAT = 2, WK_TOGGLE = 3, WK_BUTTON = 4, WK_SLIDER = 5,
                  WK_SELECT = 6, WK_TEXT_INPUT = 7, WK_BADGE = 8, WK_PROGRESS = 9, WK_TIMER = 10 };

struct ResourceSrc {
  std::string id, label, unit;
  ValueType valueType;
  ReadMode readMode;
  uint32_t staleAfterMs = 0, pollMs = 0;
  std::vector<std::string> enumValues;
};
struct ActionSrc {
  std::string id, label, confirm, inputSchemaJson, resultSchemaJson;
  DangerLevel dangerLevel;
  uint32_t cooldownMs = 0;
};
struct ScreenSrc {
  std::string id, title, routeKey;
  std::string rootNodeId;  // slug of the root node
};
struct NodeSrc {
  std::string id;          // slug
  NodeKind kind;
  WidgetKind widgetKind = (WidgetKind)0;  // 0 when not a widget
  std::string title, tone, text, formatHint;
  std::vector<std::string> childrenSlugs;
  uint32_t columns = 0;
  std::string bindResource, bindAction;   // slugs ("" => none)
};

// ----------------------------------------------------------------------------
// Normalized model (idx-resolved) -- mirrors NormalizedManifest in normalize.ts
// ----------------------------------------------------------------------------
struct NResource { uint32_t id, slugIdx, labelIdx, unitIdx, valueType, readMode, staleAfterMs, pollMs; std::vector<uint32_t> enumValueIdxs; };
struct NAction   { uint32_t id, slugIdx, labelIdx, dangerLevel, confirmIdx, cooldownMs, inputSchemaIdx, resultSchemaIdx; };
struct NScreen   { uint32_t id, slugIdx, titleIdx, routeKeyIdx, rootNodeId; /* entryRules empty */ };
struct NNode     { uint32_t id, slugIdx, kind, widgetKind, titleIdx, toneIdx; std::vector<uint32_t> childrenIds; uint32_t columns, bindResourceId, bindActionId, textIdx, formatHintIdx; };

struct NManifest {
  uint32_t version = 5, schemaVersion = 1;
  std::string minAppVersion = "1.0.0";
  std::vector<uint32_t> featureIdxs;
  std::vector<NResource> resources;
  std::vector<NAction>   actions;
  std::vector<NScreen>   screens;
  std::vector<NNode>     nodes;
  bool hasAppShell = false;  // tiny manifest has none
  StringTable strings;
};

// assignIds.ts: sort entries by string id ascending, assign 1-based index.
template <typename T>
static std::unordered_map<std::string, uint32_t> assignIds(const std::vector<T>& items) {
  std::vector<std::string> ids;
  ids.reserve(items.size());
  for (const auto& it : items) ids.push_back(it.id);
  std::sort(ids.begin(), ids.end());  // lexicographic ascending (matches JS string < )
  std::unordered_map<std::string, uint32_t> map;
  for (size_t i = 0; i < ids.size(); ++i) map.emplace(ids[i], static_cast<uint32_t>(i + 1));
  return map;
}

// ----------------------------------------------------------------------------
// Build the normalized model from the authoring model, replicating the EXACT
// normalize.ts traversal & intern order so the string table indices match.
//   capabilities features
//   -> resources: slug(=id), label, unit, enumValues
//   -> actions:   slug, label, confirm, inputSchema(JSON)
//   -> screens:   slug, title, routeKey
//   -> appShell navBar items (none here)
//   -> nodes:     slug, title, tone, [children resolved via ids], text, formatHint
// ----------------------------------------------------------------------------
static NManifest normalizeManifest(
    const std::vector<std::string>& requiredCaps,
    const std::vector<std::string>& optionalCaps,
    const std::vector<ResourceSrc>& resources,
    const std::vector<ActionSrc>& actions,
    const std::vector<ScreenSrc>& screens,
    const std::vector<NodeSrc>& nodes) {
  NManifest m;

  const auto resourceIds = assignIds(resources);
  const auto actionIds   = assignIds(actions);
  const auto screenIds   = assignIds(screens);
  const auto nodeIds     = assignIds(nodes);

  // capabilities: required then optional, intern each
  for (const auto& f : requiredCaps) m.featureIdxs.push_back(m.strings.intern(f));
  for (const auto& f : optionalCaps) m.featureIdxs.push_back(m.strings.intern(f));

  // resources (declaration order for the map(), idx interning, but `id` is sorted)
  for (const auto& r : resources) {
    NResource n;
    n.id            = resourceIds.at(r.id);
    n.slugIdx       = m.strings.intern(r.id);
    n.labelIdx      = m.strings.internOptional(r.label);
    n.unitIdx       = m.strings.internOptional(r.unit);
    n.valueType     = (uint32_t)r.valueType;
    n.readMode      = (uint32_t)r.readMode;
    n.staleAfterMs  = r.staleAfterMs;
    n.pollMs        = r.pollMs;
    for (const auto& ev : r.enumValues) n.enumValueIdxs.push_back(m.strings.intern(ev));
    m.resources.push_back(std::move(n));
  }

  // actions
  for (const auto& a : actions) {
    NAction n;
    n.id              = actionIds.at(a.id);
    n.slugIdx         = m.strings.intern(a.id);
    n.labelIdx        = m.strings.internOptional(a.label);
    n.dangerLevel     = (uint32_t)a.dangerLevel;
    n.confirmIdx      = m.strings.internOptional(a.confirm);
    n.cooldownMs      = a.cooldownMs;
    n.inputSchemaIdx  = m.strings.intern(a.inputSchemaJson);  // JSON.stringify result
    n.resultSchemaIdx = a.resultSchemaJson.empty() ? 0 : m.strings.intern(a.resultSchemaJson);
    m.actions.push_back(std::move(n));
  }

  // screens
  for (const auto& s : screens) {
    NScreen n;
    n.id          = screenIds.at(s.id);
    n.slugIdx     = m.strings.intern(s.id);
    n.titleIdx    = m.strings.intern(s.title);
    n.routeKeyIdx = m.strings.internOptional(s.routeKey);
    n.rootNodeId  = nodeIds.at(s.rootNodeId);
    m.screens.push_back(std::move(n));
  }

  // appShell navBar items would intern here (none in the tiny manifest)

  // nodes
  for (const auto& nd : nodes) {
    NNode n;
    n.id            = nodeIds.at(nd.id);
    n.slugIdx       = m.strings.intern(nd.id);
    n.kind          = (uint32_t)nd.kind;
    n.widgetKind    = (nd.kind == NK_WIDGET) ? (uint32_t)nd.widgetKind : 0u;
    n.titleIdx      = m.strings.internOptional(nd.title);
    n.toneIdx       = m.strings.internOptional(nd.tone);
    if (nd.kind != NK_WIDGET)
      for (const auto& c : nd.childrenSlugs) n.childrenIds.push_back(nodeIds.at(c));
    n.columns       = (nd.kind == NK_WIDGET) ? 0u : nd.columns;
    n.bindResourceId = (nd.kind == NK_WIDGET && !nd.bindResource.empty()) ? resourceIds.at(nd.bindResource) : 0u;
    n.bindActionId   = (nd.kind == NK_WIDGET && !nd.bindAction.empty())   ? actionIds.at(nd.bindAction)     : 0u;
    n.textIdx       = (nd.kind == NK_WIDGET) ? m.strings.internOptional(nd.text)       : 0u;
    n.formatHintIdx = (nd.kind == NK_WIDGET) ? m.strings.internOptional(nd.formatHint) : 0u;
    m.nodes.push_back(std::move(n));
  }

  return m;
}

// ----------------------------------------------------------------------------
// Protobuf encoding via nanopb low-level primitives, matching protobuf.js output.
//
// WT0 varint, WT2 length-delimited. protobuf.js' static encoder writes a scalar
// field whenever it is present on the message object; in encodeProto.ts every
// normalized struct sets all scalar fields (even 0), so all are written. We do
// the same: writeUint32Field always writes (incl. 0). Sub-messages are written
// only when present; repeated packed varints only when non-empty.
// ----------------------------------------------------------------------------
static const pb_wire_type_t WT_VARINT = PB_WT_VARINT;
static const pb_wire_type_t WT_LEN    = PB_WT_STRING;

struct Buf { std::vector<uint8_t> bytes; };
static bool bufCb(pb_ostream_t* s, const pb_byte_t* b, size_t c) {
  auto* v = static_cast<std::vector<uint8_t>*>(s->state);
  v->insert(v->end(), b, b + c);
  return true;
}
static pb_ostream_t bufStream(std::vector<uint8_t>* v) {
  pb_ostream_t s = { &bufCb, v, SIZE_MAX, 0, 0 };
  return s;
}

// Always-write scalar uint32 field (varint), matching pbjs writing set fields.
static bool writeUint32Field(std::vector<uint8_t>& out, uint32_t field, uint32_t value) {
  pb_ostream_t s = bufStream(&out);
  return pb_encode_tag(&s, WT_VARINT, field) && pb_encode_varint(&s, (uint64_t)value);
}
// Always-write string field (LEN), even empty -- matches pbjs StringEntry{value:""}.
static bool writeStringField(std::vector<uint8_t>& out, uint32_t field, const std::string& value) {
  pb_ostream_t s = bufStream(&out);
  if (!pb_encode_tag(&s, WT_LEN, field)) return false;
  return pb_encode_string(&s, reinterpret_cast<const pb_byte_t*>(value.data()), value.size());
}
// Write a length-delimited sub-message (tag + len + body bytes).
static bool writeLenField(std::vector<uint8_t>& out, uint32_t field, const std::vector<uint8_t>& body) {
  pb_ostream_t s = bufStream(&out);
  if (!pb_encode_tag(&s, WT_LEN, field)) return false;
  if (!pb_encode_varint(&s, (uint64_t)body.size())) return false;
  return pb_write(&s, body.data(), body.size());
}
// Packed repeated uint32 (only emit when non-empty).
static bool writePackedUint32(std::vector<uint8_t>& out, uint32_t field, const std::vector<uint32_t>& vals) {
  if (vals.empty()) return true;
  std::vector<uint8_t> packed;
  pb_ostream_t ps = bufStream(&packed);
  for (uint32_t v : vals) if (!pb_encode_varint(&ps, (uint64_t)v)) return false;
  return writeLenField(out, field, packed);
}

static std::vector<uint8_t> encodeManifest(const NManifest& m) {
  std::vector<uint8_t> out;

  // 1 version, 2 schema_version, 3 min_app_version
  writeUint32Field(out, 1, m.version);
  writeUint32Field(out, 2, m.schemaVersion);
  writeStringField(out, 3, m.minAppVersion);

  // 4 capabilities { 1: repeated feature_idxs (packed) }
  {
    std::vector<uint8_t> caps;
    writePackedUint32(caps, 1, m.featureIdxs);
    writeLenField(out, 4, caps);  // capabilities always present in encodeProto.ts
  }

  // 5 strings: repeated StringEntry{ 1: value }  (every entry, incl. "")
  for (const auto& sval : m.strings.items()) {
    std::vector<uint8_t> entry;
    writeStringField(entry, 1, sval);  // pbjs writes value even when ""
    writeLenField(out, 5, entry);
  }

  // 6 resources: repeated ResourceDef
  for (const auto& r : m.resources) {
    std::vector<uint8_t> e;
    writeUint32Field(e, 1, r.id);
    writeUint32Field(e, 2, r.slugIdx);
    writeUint32Field(e, 3, r.labelIdx);
    writeUint32Field(e, 4, r.unitIdx);
    writeUint32Field(e, 5, r.valueType);
    writeUint32Field(e, 6, r.readMode);
    writeUint32Field(e, 7, r.staleAfterMs);
    writeUint32Field(e, 8, r.pollMs);
    writePackedUint32(e, 9, r.enumValueIdxs);
    writeLenField(out, 6, e);
  }

  // 7 actions: repeated ActionDef
  for (const auto& a : m.actions) {
    std::vector<uint8_t> e;
    writeUint32Field(e, 1, a.id);
    writeUint32Field(e, 2, a.slugIdx);
    writeUint32Field(e, 3, a.labelIdx);
    writeUint32Field(e, 4, a.dangerLevel);
    writeUint32Field(e, 5, a.confirmIdx);
    writeUint32Field(e, 6, a.cooldownMs);
    writeUint32Field(e, 7, a.inputSchemaIdx);
    writeUint32Field(e, 8, a.resultSchemaIdx);
    writeLenField(out, 7, e);
  }

  // 8 screens: repeated ScreenDef (entry_rules empty -> omitted)
  for (const auto& s : m.screens) {
    std::vector<uint8_t> e;
    writeUint32Field(e, 1, s.id);
    writeUint32Field(e, 2, s.slugIdx);
    writeUint32Field(e, 3, s.titleIdx);
    writeUint32Field(e, 4, s.routeKeyIdx);
    writeUint32Field(e, 5, s.rootNodeId);
    writeLenField(out, 8, e);
  }

  // 9 nodes: repeated NodeDef
  for (const auto& n : m.nodes) {
    std::vector<uint8_t> e;
    writeUint32Field(e, 1, n.id);
    writeUint32Field(e, 2, n.slugIdx);
    writeUint32Field(e, 3, n.kind);
    writeUint32Field(e, 4, n.widgetKind);
    writeUint32Field(e, 5, n.titleIdx);
    writeUint32Field(e, 6, n.toneIdx);
    writePackedUint32(e, 7, n.childrenIds);   // omitted when empty
    writeUint32Field(e, 8, n.columns);
    {
      // 9 bind: BindingDef{ 1 resource_id, 2 action_id } -- always present
      std::vector<uint8_t> bind;
      writeUint32Field(bind, 1, n.bindResourceId);
      writeUint32Field(bind, 2, n.bindActionId);
      writeLenField(e, 9, bind);
    }
    // 10 visible_if / 11 enabled_if: null -> omitted
    writeUint32Field(e, 12, n.textIdx);
    writeUint32Field(e, 13, n.formatHintIdx);
    writeLenField(out, 9, e);
  }

  // 10 app_shell: null in the tiny manifest -> omitted

  return out;
}

// ----------------------------------------------------------------------------
// The tiny manifest, hardcoded as the authoring model (same as tiny.yaml).
// ----------------------------------------------------------------------------
int main() {
  std::vector<std::string> requiredCaps = { "layout.sections" };
  std::vector<std::string> optionalCaps = {};

  std::vector<ResourceSrc> resources = {
    { /*id*/"light.brightness", /*label*/"Brightness", /*unit*/"%",
      VT_UINT, RM_SUBSCRIBE, /*stale*/5000, /*poll*/0, /*enum*/{} },
  };

  // EXACT JSON.stringify of the inputSchema object (no spaces, key order as authored).
  const std::string inputSchema =
    "{\"type\":\"object\",\"additionalProperties\":false,\"required\":[\"value\"],"
    "\"properties\":{\"value\":{\"type\":\"integer\",\"minimum\":0,\"maximum\":100}}}";

  std::vector<ActionSrc> actions = {
    { /*id*/"light.set_brightness", /*label*/"Set Brightness", /*confirm*/"",
      inputSchema, /*result*/"", DL_NORMAL, /*cooldown*/0 },
  };

  std::vector<ScreenSrc> screens = {
    { /*id*/"home", /*title*/"Home", /*routeKey*/"", /*rootNodeId*/"home.root" },
  };

  // The YAML authoring layer expands a view's `content` into a synthetic STACK
  // root node ("home.root") whose child is the slider widget ("home.slider").
  std::vector<NodeSrc> nodes = {
    { /*id*/"home.root", NK_STACK, (WidgetKind)0, /*title*/"", /*tone*/"", /*text*/"",
      /*formatHint*/"", /*children*/{ "home.slider" }, /*columns*/0, /*bindRes*/"", /*bindAct*/"" },
    { /*id*/"home.slider", NK_WIDGET, WK_SLIDER, /*title*/"Brightness", /*tone*/"", /*text*/"",
      /*formatHint*/"percent", /*children*/{}, /*columns*/0,
      /*bindRes*/"light.brightness", /*bindAct*/"light.set_brightness" },
  };

  NManifest m = normalizeManifest(requiredCaps, optionalCaps, resources, actions, screens, nodes);
  std::vector<uint8_t> bytes = encodeManifest(m);

  FILE* f = std::fopen("cpp.pb", "wb");
  if (!f) { std::fprintf(stderr, "cannot open cpp.pb for writing\n"); return 1; }
  std::fwrite(bytes.data(), 1, bytes.size(), f);
  std::fclose(f);

  std::fprintf(stderr, "wrote %zu bytes to cpp.pb (strings=%zu)\n", bytes.size(), m.strings.items().size());
  return 0;
}
