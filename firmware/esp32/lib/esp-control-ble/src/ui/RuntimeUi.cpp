#include "ui/RuntimeUi.h"

#include <vector>

#include "EspControlBle.h"  // full EspControl + ecb::ActionContext / ResourceTable

namespace ecb { namespace ui {

// High bit marks a Res handle's id as a SLOT (index into slotResourceIndex_)
// rather than a real resource id. Real ids are small 1-based ints, so the high
// bit is always clear for them -- a plain id is distinguishable from a slot tag.
static const uint32_t kSlotTag = 0x80000000u;

RuntimeUi::RuntimeUi(EspControl& control) : control_(&control) {}

// ----------------------------- recording hooks ------------------------------
// Only resources, actions, and node->action bindings are recorded. Presentation
// hooks are no-ops (RuntimeUi needs structure for ids/handlers only).

void RuntimeUi::recordCapability(const std::string& /*feature*/, bool /*required*/) {}

// Idempotent by slug: reuse an existing decl if the slug was already recorded
// (so res<T>(slug) + a short-form widget on the same slug share one resource).
// NOTE: on a slug hit the FIRST registration's type wins; the incoming `type` is
// ignored. Callers must use a consistent type per slug (mixing e.g. resourceU32
// and resourceB on one slug would write mismatched value kinds to the same entry).
int RuntimeUi::findOrRecordResource(const std::string& slug, ValueType type) {
  for (size_t i = 0; i < resources_.size(); ++i)
    if (resources_[i].slug == slug) return static_cast<int>(i);
  ResourceDecl r;
  r.slug = slug;
  r.type = type;
  resources_.push_back(r);
  return static_cast<int>(resources_.size()) - 1;
}

int RuntimeUi::recordResource(const std::string& slug, ValueType type) {
  return findOrRecordResource(slug, type);
}

// Typed creators: record-or-reuse the resource, allocate a slot pointing at its
// resource index, and return a slot-tagged handle resolved to the real id at
// commit(). Recording is idempotent, so requesting the same slug twice yields two
// slots that both resolve to the same id.
Res<bool> RuntimeUi::resourceB(const std::string& slug, ValueType type) {
  int ri = findOrRecordResource(slug, type);
  uint32_t slot = static_cast<uint32_t>(slotResourceIndex_.size());
  slotResourceIndex_.push_back(ri);
  return Res<bool>(this, kSlotTag | slot);
}
Res<uint32_t> RuntimeUi::resourceU32(const std::string& slug, ValueType type) {
  int ri = findOrRecordResource(slug, type);
  uint32_t slot = static_cast<uint32_t>(slotResourceIndex_.size());
  slotResourceIndex_.push_back(ri);
  return Res<uint32_t>(this, kSlotTag | slot);
}
Res<int32_t> RuntimeUi::resourceI32(const std::string& slug, ValueType type) {
  int ri = findOrRecordResource(slug, type);
  uint32_t slot = static_cast<uint32_t>(slotResourceIndex_.size());
  slotResourceIndex_.push_back(ri);
  return Res<int32_t>(this, kSlotTag | slot);
}
Res<float> RuntimeUi::resourceF(const std::string& slug, ValueType type) {
  int ri = findOrRecordResource(slug, type);
  uint32_t slot = static_cast<uint32_t>(slotResourceIndex_.size());
  slotResourceIndex_.push_back(ri);
  return Res<float>(this, kSlotTag | slot);
}
Res<const char*> RuntimeUi::resourceS(const std::string& slug, ValueType type) {
  int ri = findOrRecordResource(slug, type);
  uint32_t slot = static_cast<uint32_t>(slotResourceIndex_.size());
  slotResourceIndex_.push_back(ri);
  return Res<const char*>(this, kSlotTag | slot);
}

void RuntimeUi::resourceLabel(int, const std::string&) {}
void RuntimeUi::resourceUnit(int, const std::string&) {}
void RuntimeUi::resourceReadMode(int, ReadMode) {}
void RuntimeUi::resourceStaleAfterMs(int, uint32_t) {}
void RuntimeUi::resourcePollMs(int, uint32_t) {}
void RuntimeUi::resourceEnum(int, const std::vector<std::string>&) {}

int RuntimeUi::recordWidget(const std::string& slug, WidgetKind /*kind*/,
                            int /*resourceHandle*/, bool /*hasRange*/, int /*rangeMin*/, int /*rangeMax*/) {
  NodeDecl n;
  n.slug = slug;
  nodes_.push_back(n);
  return static_cast<int>(nodes_.size()) - 1;
}

int RuntimeUi::recordContainer(const std::string& slug, NodeKind /*kind*/) {
  NodeDecl n;
  n.slug = slug;
  nodes_.push_back(n);
  return static_cast<int>(nodes_.size()) - 1;
}
void RuntimeUi::containerChildren(int, const std::vector<int>&) {}
void RuntimeUi::nodeColumns(int, uint32_t) {}

void RuntimeUi::nodeTitle(int, const std::string&) {}
void RuntimeUi::nodeTone(int, const std::string&) {}
void RuntimeUi::nodeText(int, const std::string&) {}
void RuntimeUi::nodeFormatHint(int, const std::string&) {}

int RuntimeUi::findAction(const std::string& slug) const {
  for (size_t i = 0; i < actions_.size(); ++i)
    if (actions_[i].slug == slug) return static_cast<int>(i);
  return -1;
}

void RuntimeUi::recordWidgetAction(int nh, const std::string& slug, const std::string& /*label*/,
                                   Danger /*danger*/, const std::string& /*confirm*/, uint32_t /*cooldownMs*/) {
  int idx = findAction(slug);
  if (idx < 0) {
    ActionDecl a;
    a.slug = slug;
    actions_.push_back(a);
    idx = static_cast<int>(actions_.size()) - 1;
  }
  nodes_[nh].bindActionIndex = idx;
}

int RuntimeUi::recordAction(const std::string& slug, const std::string& /*label*/) {
  int idx = findAction(slug);
  if (idx < 0) {
    ActionDecl a;
    a.slug = slug;
    actions_.push_back(a);
    idx = static_cast<int>(actions_.size()) - 1;
  }
  return idx;
}
void RuntimeUi::actionDanger(int, Danger) {}
void RuntimeUi::actionConfirm(int, const std::string&) {}
void RuntimeUi::actionCooldownMs(int, uint32_t) {}
void RuntimeUi::actionSchemaValueless(int) {}
void RuntimeUi::actionSchemaBoolean(int) {}
void RuntimeUi::actionSchemaInteger(int, int, int) {}
void RuntimeUi::actionSchemaStringLen(int, int, int) {}
void RuntimeUi::actionSchemaStringEnum(int, const std::vector<std::string>&) {}
void RuntimeUi::bindWidgetAction(int nh, const std::string& slug) {
  int idx = findAction(slug);
  if (idx < 0) {
    ActionDecl a;
    a.slug = slug;
    actions_.push_back(a);
    idx = static_cast<int>(actions_.size()) - 1;
  }
  nodes_[nh].bindActionIndex = idx;
}

int RuntimeUi::recordView(const std::string& /*slug*/, const std::string& /*title*/) { return -1; }
void RuntimeUi::viewRouteKey(int, const std::string&) {}
void RuntimeUi::viewContent(int, const std::vector<int>&) {}

void RuntimeUi::recordNavItem(const std::string&, const std::string&, const std::string&, int) {}

// ------------------------------ onSet capture -------------------------------

void RuntimeUi::widgetOnSetUint(int nh, std::function<void(uint8_t)> fn) {
  PendingHandler p;
  p.nodeHandle = nh;
  p.kind = HandlerKind::Uint;
  p.fnUint = fn;
  pending_.push_back(p);
}
void RuntimeUi::widgetOnSetBool(int nh, std::function<void(bool)> fn) {
  PendingHandler p;
  p.nodeHandle = nh;
  p.kind = HandlerKind::Bool;
  p.fnBool = fn;
  pending_.push_back(p);
}
void RuntimeUi::widgetOnSetString(int nh, std::function<void(const char*)> fn) {
  PendingHandler p;
  p.nodeHandle = nh;
  p.kind = HandlerKind::String;
  p.fnString = fn;
  pending_.push_back(p);
}
void RuntimeUi::widgetOnSetVoid(int nh, std::function<void()> fn) {
  PendingHandler p;
  p.nodeHandle = nh;
  p.kind = HandlerKind::Void;
  p.fnVoid = fn;
  pending_.push_back(p);
}

// --------------------------------- commit -----------------------------------

namespace {

// Seed a resource into the table with a zero value matching its authoring type,
// so the host can answer a snapshot before the device ever writes a real value.
// Enum is string-valued on the wire (the manifest encodes presets as strings),
// DurationMs is an unsigned millisecond count -- map both accordingly.
void seedResource(ResourceTable& table, uint32_t id, ValueType type) {
  switch (type) {
    case ValueType::Bool:       table.setBool(id, false); break;
    case ValueType::Int:        table.setInt(id, 0); break;
    case ValueType::Uint:       table.setUint(id, 0u); break;
    case ValueType::Float:      table.setFloat(id, 0.0f); break;
    case ValueType::String:     table.setString(id, ""); break;
    case ValueType::Enum:       table.setString(id, ""); break;
    case ValueType::DurationMs: table.setUint(id, 0u); break;
    default:                    table.setUint(id, 0u); break;
  }
}

// Handler wrappers: validate the decoded value kind against the widget type,
// reply BadPayload on mismatch (without calling the user callback), else invoke
// the callback and reply Ok. A valueless (button) action accepts None.
ActionHandler makeUintHandler(std::function<void(uint8_t)> fn) {
  return [fn](ActionContext& ctx) {
    if (ctx.valueKind != ActionValueKind::Uint) {
      ctx.replyError(ActionStatus::BadPayload, "expected uint");
      return;
    }
    fn(static_cast<uint8_t>(ctx.uintValue));
    ctx.replyOk(nullptr, 0);
  };
}
ActionHandler makeBoolHandler(std::function<void(bool)> fn) {
  return [fn](ActionContext& ctx) {
    if (ctx.valueKind != ActionValueKind::Bool) {
      ctx.replyError(ActionStatus::BadPayload, "expected bool");
      return;
    }
    fn(ctx.boolValue);
    ctx.replyOk(nullptr, 0);
  };
}
ActionHandler makeStringHandler(std::function<void(const char*)> fn) {
  return [fn](ActionContext& ctx) {
    if (ctx.valueKind != ActionValueKind::String) {
      ctx.replyError(ActionStatus::BadPayload, "expected string");
      return;
    }
    fn(ctx.stringValue);
    ctx.replyOk(nullptr, 0);
  };
}
ActionHandler makeVoidHandler(std::function<void()> fn) {
  return [fn](ActionContext& ctx) {
    // Buttons are valueless: accept None (the wire shape for a no-value action).
    fn();
    ctx.replyOk(nullptr, 0);
  };
}

}  // namespace

void RuntimeUi::commit() {
  // Build the per-kind id maps over the now-complete slug sets (same scheme as
  // EmitterUi -> identical ids).
  std::vector<std::string> resSlugs, actSlugs;
  for (size_t i = 0; i < resources_.size(); ++i) resSlugs.push_back(resources_[i].slug);
  for (size_t i = 0; i < actions_.size(); ++i)   actSlugs.push_back(actions_[i].slug);
  resIds_.build(resSlugs);
  actIds_.build(actSlugs);

  // Seed resources into the control's table under their computed ids.
  ResourceTable& table = control_->resources();
  for (size_t i = 0; i < resources_.size(); ++i)
    seedResource(table, resIds_.idOf(resources_[i].slug), resources_[i].type);

  // Register each captured handler under its bound action's id.
  for (size_t i = 0; i < pending_.size(); ++i) {
    const PendingHandler& p = pending_[i];
    if (p.nodeHandle < 0 || p.nodeHandle >= static_cast<int>(nodes_.size())) continue;
    int ai = nodes_[p.nodeHandle].bindActionIndex;
    if (ai < 0 || ai >= static_cast<int>(actions_.size())) continue;
    uint32_t aid = actIds_.idOf(actions_[ai].slug);
    if (aid == 0u) continue;
    switch (p.kind) {
      case HandlerKind::Uint:   control_->registerAction(aid, makeUintHandler(p.fnUint)); break;
      case HandlerKind::Bool:   control_->registerAction(aid, makeBoolHandler(p.fnBool)); break;
      case HandlerKind::String: control_->registerAction(aid, makeStringHandler(p.fnString)); break;
      case HandlerKind::Void:   control_->registerAction(aid, makeVoidHandler(p.fnVoid)); break;
    }
  }
}

uint32_t RuntimeUi::resourceId(const std::string& slug) const { return resIds_.idOf(slug); }
uint32_t RuntimeUi::actionId(const std::string& slug) const { return actIds_.idOf(slug); }

// ----------------------------- value hooks ----------------------------------

void RuntimeUi::uiWrite(uint32_t id, bool v)        { control_->resources().setBool(id, v);   control_->publishDelta(id); }
void RuntimeUi::uiWrite(uint32_t id, int32_t v)     { control_->resources().setInt(id, v);    control_->publishDelta(id); }
void RuntimeUi::uiWrite(uint32_t id, uint32_t v)    { control_->resources().setUint(id, v);   control_->publishDelta(id); }
void RuntimeUi::uiWrite(uint32_t id, float v)       { control_->resources().setFloat(id, v);  control_->publishDelta(id); }
void RuntimeUi::uiWrite(uint32_t id, const char* v) { control_->resources().setString(id, v); control_->publishDelta(id); }

bool RuntimeUi::uiReadBool(uint32_t id) {
  ecb::ResourceValue v; return control_->resources().get(id, v) ? v.boolValue : false;
}
int32_t RuntimeUi::uiReadInt(uint32_t id) {
  ecb::ResourceValue v; return control_->resources().get(id, v) ? v.intValue : 0;
}
uint32_t RuntimeUi::uiReadUint(uint32_t id) {
  ecb::ResourceValue v; return control_->resources().get(id, v) ? v.uintValue : 0u;
}
float RuntimeUi::uiReadFloat(uint32_t id) {
  ecb::ResourceValue v; return control_->resources().get(id, v) ? v.floatValue : 0.0f;
}
const char* RuntimeUi::uiReadString(uint32_t id) {
  ecb::ResourceValue v;
  if (!control_->resources().get(id, v)) { readScratch_[0] = '\0'; return readScratch_; }
  size_t n = 0; while (n < 64 && v.stringValue[n] != '\0') { readScratch_[n] = v.stringValue[n]; ++n; }
  readScratch_[n] = '\0';
  return readScratch_;
}

// --------------------------- slot-tag id resolution -------------------------
// A plain id (high bit clear) is already final -- pass it through. This keeps the
// raw-id value-hook callers and any Res holding a real id working unchanged. A
// slot-tagged value is followed slot -> resource index -> sorted-slug id (0 if
// commit() hasn't built resIds_ yet, or the slot/resource is out of range).
uint32_t RuntimeUi::uiResolveId(uint32_t idOrSlot) const {
  if ((idOrSlot & kSlotTag) == 0) return idOrSlot;
  uint32_t slot = idOrSlot & ~kSlotTag;
  if (slot >= slotResourceIndex_.size()) return 0u;
  int ri = slotResourceIndex_[slot];
  if (ri < 0 || ri >= static_cast<int>(resources_.size())) return 0u;
  return resIds_.idOf(resources_[ri].slug);
}

}} // namespace ecb::ui
