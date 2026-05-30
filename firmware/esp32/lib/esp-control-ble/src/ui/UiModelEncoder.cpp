#include "ui/UiModelEncoder.h"

#include <cstddef>

#include <pb_encode.h>

// Ported from firmware/esp32/spike/ui_emitter/main.cpp (the proven byte-identical
// emitter). Encodes a normalized UiModel into esp_control.ManifestBundle wire bytes
// using nanopb LOW-LEVEL stream primitives so the output matches protobuf.js'
// generated static encoder exactly:
//   * every SCALAR field set on a message is written, INCLUDING zero-valued ones
//     (writeUint32Field / writeStringField always emit);
//   * a sub-message is written only when present (always-present ones like
//     capabilities and bind are emitted unconditionally, matching encodeProto.ts);
//   * packed repeated varints are emitted only when non-empty.
// A plain pb_encode(esp_control_ManifestBundle_fields, ...) would OMIT zero singular
// scalars (proto3 default) and diverge -- hence the low-level path.

namespace ecb { namespace ui {

namespace {

const pb_wire_type_t WT_VARINT = PB_WT_VARINT;
const pb_wire_type_t WT_LEN = PB_WT_STRING;

bool bufCb(pb_ostream_t* s, const pb_byte_t* b, size_t c) {
  std::vector<uint8_t>* v = static_cast<std::vector<uint8_t>*>(s->state);
  v->insert(v->end(), b, b + c);
  return true;
}

pb_ostream_t bufStream(std::vector<uint8_t>* v) {
  pb_ostream_t s = { &bufCb, v, SIZE_MAX, 0, 0 };
  return s;
}

// Always-write scalar uint32 field (varint), matching pbjs writing set fields.
bool writeUint32Field(std::vector<uint8_t>& out, uint32_t field, uint32_t value) {
  pb_ostream_t s = bufStream(&out);
  return pb_encode_tag(&s, WT_VARINT, field) && pb_encode_varint(&s, (uint64_t)value);
}

// Always-write string field (LEN), even empty -- matches pbjs StringEntry{value:""}.
bool writeStringField(std::vector<uint8_t>& out, uint32_t field, const std::string& value) {
  pb_ostream_t s = bufStream(&out);
  if (!pb_encode_tag(&s, WT_LEN, field)) return false;
  return pb_encode_string(&s, reinterpret_cast<const pb_byte_t*>(value.data()), value.size());
}

// Write a length-delimited sub-message (tag + len + body bytes).
bool writeLenField(std::vector<uint8_t>& out, uint32_t field, const std::vector<uint8_t>& body) {
  pb_ostream_t s = bufStream(&out);
  if (!pb_encode_tag(&s, WT_LEN, field)) return false;
  if (!pb_encode_varint(&s, (uint64_t)body.size())) return false;
  return pb_write(&s, body.data(), body.size());
}

// Packed repeated uint32 (only emit when non-empty).
bool writePackedUint32(std::vector<uint8_t>& out, uint32_t field, const std::vector<uint32_t>& vals) {
  if (vals.empty()) return true;
  std::vector<uint8_t> packed;
  pb_ostream_t ps = bufStream(&packed);
  for (size_t i = 0; i < vals.size(); ++i) {
    if (!pb_encode_varint(&ps, (uint64_t)vals[i])) return false;
  }
  return writeLenField(out, field, packed);
}

}  // namespace

bool encodeUiModel(const UiModel& m, std::vector<uint8_t>& out) {
  out.clear();

  // 1 version, 2 schema_version, 3 min_app_version
  writeUint32Field(out, 1, m.version);
  writeUint32Field(out, 2, m.schemaVersion);
  writeStringField(out, 3, m.minAppVersion);

  // 4 capabilities { 1: repeated feature_idxs (packed) } -- always present
  {
    std::vector<uint8_t> caps;
    writePackedUint32(caps, 1, m.featureIdxs);
    writeLenField(out, 4, caps);
  }

  // 5 strings: repeated StringEntry{ 1: value } (every entry, incl. "")
  const std::vector<std::string>& strs = m.strings.items();
  for (size_t i = 0; i < strs.size(); ++i) {
    std::vector<uint8_t> entry;
    writeStringField(entry, 1, strs[i]);  // pbjs writes value even when ""
    writeLenField(out, 5, entry);
  }

  // 6 resources: repeated ResourceDef
  for (size_t i = 0; i < m.resources.size(); ++i) {
    const UiResource& r = m.resources[i];
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
  for (size_t i = 0; i < m.actions.size(); ++i) {
    const UiAction& a = m.actions[i];
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
  for (size_t i = 0; i < m.screens.size(); ++i) {
    const UiScreen& s = m.screens[i];
    std::vector<uint8_t> e;
    writeUint32Field(e, 1, s.id);
    writeUint32Field(e, 2, s.slugIdx);
    writeUint32Field(e, 3, s.titleIdx);
    writeUint32Field(e, 4, s.routeKeyIdx);
    writeUint32Field(e, 5, s.rootNodeId);
    writeLenField(out, 8, e);
  }

  // 9 nodes: repeated NodeDef
  for (size_t i = 0; i < m.nodes.size(); ++i) {
    const UiNode& n = m.nodes[i];
    std::vector<uint8_t> e;
    writeUint32Field(e, 1, n.id);
    writeUint32Field(e, 2, n.slugIdx);
    writeUint32Field(e, 3, n.kind);
    writeUint32Field(e, 4, n.widgetKind);
    writeUint32Field(e, 5, n.titleIdx);
    writeUint32Field(e, 6, n.toneIdx);
    writePackedUint32(e, 7, n.childrenIds);  // omitted when empty
    writeUint32Field(e, 8, n.columns);
    {
      // 9 bind: BindingDef{ 1 resource_id, 2 action_id } -- always present
      std::vector<uint8_t> bind;
      writeUint32Field(bind, 1, n.bindResourceId);
      writeUint32Field(bind, 2, n.bindActionId);
      writeLenField(e, 9, bind);
    }
    // 10 visible_if / 11 enabled_if: null -> omitted (MVP: no rules)
    writeUint32Field(e, 12, n.textIdx);
    writeUint32Field(e, 13, n.formatHintIdx);
    writeLenField(out, 9, e);
  }

  // 10 app_shell { 1 nav_bar { 1: repeated NavBarItemDef } } -- only when present
  if (m.hasAppShell) {
    std::vector<uint8_t> navBar;
    for (size_t i = 0; i < m.navItems.size(); ++i) {
      const UiNavItem& it = m.navItems[i];
      std::vector<uint8_t> item;
      writeUint32Field(item, 1, it.idIdx);
      writeUint32Field(item, 2, it.labelIdx);
      writeUint32Field(item, 3, it.iconIdx);
      writeUint32Field(item, 4, it.screenId);
      writeLenField(navBar, 1, item);  // nav_bar.items
    }
    std::vector<uint8_t> appShell;
    writeLenField(appShell, 1, navBar);  // app_shell.nav_bar (always present)
    writeLenField(out, 10, appShell);
  }

  return true;
}

}} // namespace ecb::ui
