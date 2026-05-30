#include "ui/EmitterUi.h"

#include <algorithm>
#include <cstdio>

#include "ui/IdAssignment.h"

// Host-side normalization. Ported field-for-field from tools/manifest/src/compiler
// (normalize.ts + assignIds.ts) and the YAML authoring expander
// (authoring/expand.ts). The string-table intern order and the sort-by-id id
// assignment MUST match the TS exactly, or the emitted protobuf diverges.

namespace ecb { namespace ui {

namespace {

// itoa for schema numbers (std::to_string is available in GCC 5, but keep the
// schema builder self-contained/obvious).
std::string intStr(int v) {
  char buf[16];
  std::snprintf(buf, sizeof(buf), "%d", v);
  return std::string(buf);
}

// JSON-encode a string value for an enum entry. Slugs/enum values here are simple
// (no quotes/backslashes/control chars in practice), but escape defensively to
// match JSON.stringify for the characters that can occur.
std::string jsonString(const std::string& s) {
  std::string out;
  out.reserve(s.size() + 2);
  out.push_back('"');
  for (size_t i = 0; i < s.size(); ++i) {
    char c = s[i];
    if (c == '"' || c == '\\') { out.push_back('\\'); out.push_back(c); }
    else if (c == '\n') { out += "\\n"; }
    else if (c == '\t') { out += "\\t"; }
    else if (c == '\r') { out += "\\r"; }
    else { out.push_back(c); }
  }
  out.push_back('"');
  return out;
}

// Byte-exact inputSchema fragments (no spaces, JSON.stringify key order) so the
// emitted strings match the oracle.
const char* const kSchemaHead = "{\"type\":\"object\",\"additionalProperties\":false";

std::string schemaValueless() {
  return std::string(kSchemaHead) + ",\"properties\":{}}";
}
std::string schemaBoolean() {
  return std::string(kSchemaHead) + ",\"required\":[\"value\"],\"properties\":{\"value\":{\"type\":\"boolean\"}}}";
}
std::string schemaInteger(int minimum, int maximum) {
  std::string s = std::string(kSchemaHead) +
      ",\"required\":[\"value\"],\"properties\":{\"value\":{\"type\":\"integer\"";
  s += ",\"minimum\":" + intStr(minimum);
  s += ",\"maximum\":" + intStr(maximum);
  s += "}}}";
  return s;
}
std::string schemaStringLen(int minLength, int maxLength) {
  std::string s = std::string(kSchemaHead) +
      ",\"required\":[\"value\"],\"properties\":{\"value\":{\"type\":\"string\"";
  s += ",\"minLength\":" + intStr(minLength);
  s += ",\"maxLength\":" + intStr(maxLength);
  s += "}}}";
  return s;
}
std::string schemaStringEnum(const std::vector<std::string>& values) {
  std::string s = std::string(kSchemaHead) +
      ",\"required\":[\"value\"],\"properties\":{\"value\":{\"type\":\"string\"";
  if (!values.empty()) {
    s += ",\"enum\":[";
    for (size_t i = 0; i < values.size(); ++i) {
      if (i) s.push_back(',');
      s += jsonString(values[i]);
    }
    s.push_back(']');
  }
  s += "}}}";
  return s;
}
std::string schemaPlainString() {  // string with no length/enum constraints
  return std::string(kSchemaHead) + ",\"required\":[\"value\"],\"properties\":{\"value\":{\"type\":\"string\"}}}";
}

// Derive an action's inputSchema JSON from the bound widget (legacy convenience
// path used when an action is declared inline on a widget via .action(id,label)):
//   slider     -> { value: integer, minimum, maximum }
//   toggle     -> { value: boolean }
//   select     -> { value: string, enum: [...] }
//   text_input -> { value: string }
//   other      -> {} (no value)
std::string deriveInputSchema(WidgetKind kind, bool hasRange, int rangeMin, int rangeMax,
                              const std::vector<std::string>& enumValues) {
  if (kind == WidgetKind::Slider) {
    if (hasRange) return schemaInteger(rangeMin, rangeMax);
    std::string s = std::string(kSchemaHead) +
        ",\"required\":[\"value\"],\"properties\":{\"value\":{\"type\":\"integer\"}}}";
    return s;
  }
  if (kind == WidgetKind::Toggle)    return schemaBoolean();
  if (kind == WidgetKind::Select)    return schemaStringEnum(enumValues);
  if (kind == WidgetKind::TextInput) return schemaPlainString();
  return schemaValueless();  // buttons and display widgets: no value
}

}  // namespace

// ============================== recording hooks ==============================

void EmitterUi::recordCapability(const std::string& feature, bool required) {
  if (required) requiredCaps_.push_back(feature);
  else          optionalCaps_.push_back(feature);
}

int EmitterUi::recordResource(const std::string& slug, ValueType type) {
  ResourceDecl r;
  r.slug = slug;
  r.type = type;
  resources_.push_back(r);
  return static_cast<int>(resources_.size()) - 1;
}
void EmitterUi::resourceLabel(int rh, const std::string& v)       { resources_[rh].label = v; }
void EmitterUi::resourceUnit(int rh, const std::string& v)         { resources_[rh].unit = v; }
void EmitterUi::resourceReadMode(int rh, ReadMode v)               { resources_[rh].readMode = v; }
void EmitterUi::resourceStaleAfterMs(int rh, uint32_t v)           { resources_[rh].staleAfterMs = v; }
void EmitterUi::resourcePollMs(int rh, uint32_t v)                 { resources_[rh].pollMs = v; }
void EmitterUi::resourceEnum(int rh, const std::vector<std::string>& v) { resources_[rh].enumValues = v; }

int EmitterUi::recordWidget(const std::string& slug, WidgetKind kind,
                            int resourceHandle, bool hasRange, int rangeMin, int rangeMax) {
  NodeDecl n;
  n.slug = slug;
  n.kind = NodeKind::Widget;
  n.widgetKind = kind;
  n.bindResourceHandle = resourceHandle;
  n.hasRange = hasRange;
  n.rangeMin = rangeMin;
  n.rangeMax = rangeMax;
  if (resourceHandle >= 0) n.enumValuesForSchema = resources_[resourceHandle].enumValues;
  nodes_.push_back(n);
  return static_cast<int>(nodes_.size()) - 1;
}

int EmitterUi::recordContainer(const std::string& slug, NodeKind kind) {
  NodeDecl n;
  n.slug = slug;
  n.kind = kind;
  nodes_.push_back(n);
  return static_cast<int>(nodes_.size()) - 1;
}
void EmitterUi::containerChildren(int nh, const std::vector<int>& kids) { nodes_[nh].childHandles = kids; }
void EmitterUi::nodeColumns(int nh, uint32_t columns)                   { nodes_[nh].columns = columns; }

void EmitterUi::nodeTitle(int nh, const std::string& v)      { nodes_[nh].title = v; }
void EmitterUi::nodeTone(int nh, const std::string& v)        { nodes_[nh].tone = v; }
void EmitterUi::nodeText(int nh, const std::string& v)        { nodes_[nh].text = v; }
void EmitterUi::nodeFormatHint(int nh, const std::string& v)  { nodes_[nh].formatHint = v; }

int EmitterUi::findAction(const std::string& slug) const {
  for (size_t i = 0; i < actions_.size(); ++i)
    if (actions_[i].slug == slug) return static_cast<int>(i);
  return -1;
}

void EmitterUi::recordWidgetAction(int nh, const std::string& slug, const std::string& label,
                                   Danger danger, const std::string& confirm, uint32_t cooldownMs) {
  int idx = findAction(slug);
  if (idx < 0) {
    const NodeDecl& n = nodes_[nh];
    ActionDecl a;
    a.slug = slug;
    a.label = label;
    a.danger = danger;
    a.confirm = confirm;
    a.cooldownMs = cooldownMs;
    a.schemaKind = SchemaKind::DerivedFromWidget;
    a.deriveWidgetKind = n.widgetKind;
    a.deriveHasRange = n.hasRange;
    a.deriveRangeMin = n.rangeMin;
    a.deriveRangeMax = n.rangeMax;
    a.deriveEnum = n.enumValuesForSchema;
    actions_.push_back(a);
    idx = static_cast<int>(actions_.size()) - 1;
  }
  nodes_[nh].bindActionIndex = idx;
}

int EmitterUi::recordAction(const std::string& slug, const std::string& label) {
  // If an action with this slug already exists (e.g. inferred from an earlier
  // widget binding), upgrade it in place so the explicit declaration wins; else
  // append in declaration order (this is what pins the intern order to YAML order).
  int idx = findAction(slug);
  if (idx < 0) {
    ActionDecl a;
    a.slug = slug;
    a.label = label;
    a.schemaKind = SchemaKind::Valueless;  // default until a selector is chosen
    actions_.push_back(a);
    idx = static_cast<int>(actions_.size()) - 1;
  } else {
    actions_[idx].label = label;
  }
  return idx;
}
void EmitterUi::actionDanger(int ah, Danger v)              { actions_[ah].danger = v; }
void EmitterUi::actionConfirm(int ah, const std::string& v) { actions_[ah].confirm = v; }
void EmitterUi::actionCooldownMs(int ah, uint32_t v)        { actions_[ah].cooldownMs = v; }
void EmitterUi::actionSchemaValueless(int ah)               { actions_[ah].schemaKind = SchemaKind::Valueless; }
void EmitterUi::actionSchemaBoolean(int ah)                 { actions_[ah].schemaKind = SchemaKind::Boolean; }
void EmitterUi::actionSchemaInteger(int ah, int minimum, int maximum) {
  actions_[ah].schemaKind = SchemaKind::Integer;
  actions_[ah].schemaMin = minimum;
  actions_[ah].schemaMax = maximum;
}
void EmitterUi::actionSchemaStringLen(int ah, int minLength, int maxLength) {
  actions_[ah].schemaKind = SchemaKind::StringLen;
  actions_[ah].schemaMin = minLength;
  actions_[ah].schemaMax = maxLength;
}
void EmitterUi::actionSchemaStringEnum(int ah, const std::vector<std::string>& values) {
  actions_[ah].schemaKind = SchemaKind::StringEnum;
  actions_[ah].schemaEnum = values;
}
void EmitterUi::bindWidgetAction(int nh, const std::string& slug) {
  // The action must already be declared (ui.action) or inferred. If somehow not,
  // create a valueless placeholder so the binding still resolves deterministically.
  int idx = findAction(slug);
  if (idx < 0) {
    ActionDecl a;
    a.slug = slug;
    a.schemaKind = SchemaKind::Valueless;
    actions_.push_back(a);
    idx = static_cast<int>(actions_.size()) - 1;
  }
  nodes_[nh].bindActionIndex = idx;
}

int EmitterUi::recordView(const std::string& slug, const std::string& title) {
  ViewDecl v;
  v.slug = slug;
  v.title = title;
  views_.push_back(v);
  return static_cast<int>(views_.size()) - 1;
}
void EmitterUi::viewRouteKey(int vh, const std::string& v)              { views_[vh].routeKey = v; }
void EmitterUi::viewContent(int vh, const std::vector<int>& handles)    { views_[vh].topLevelHandles = handles; }

void EmitterUi::recordNavItem(const std::string& id, const std::string& label,
                              const std::string& icon, int viewHandle) {
  NavDecl n;
  n.id = id;
  n.label = label;
  n.icon = icon;
  n.viewHandle = viewHandle;
  navItems_.push_back(n);
}

std::string EmitterUi::buildSchemaJson(const ActionDecl& a) {
  switch (a.schemaKind) {
    case SchemaKind::Valueless:  return schemaValueless();
    case SchemaKind::Boolean:    return schemaBoolean();
    case SchemaKind::Integer:    return schemaInteger(a.schemaMin, a.schemaMax);
    case SchemaKind::StringLen:  return schemaStringLen(a.schemaMin, a.schemaMax);
    case SchemaKind::StringEnum: return schemaStringEnum(a.schemaEnum);
    case SchemaKind::DerivedFromWidget:
    default:
      return deriveInputSchema(a.deriveWidgetKind, a.deriveHasRange,
                               a.deriveRangeMin, a.deriveRangeMax, a.deriveEnum);
  }
}

// ================================== build ===================================

namespace {
// A node in the EXPANDED canonical list (expand.ts order): either a synthetic
// per-view STACK root (authoredIndex == -1, childHandles = the view's top-level
// authored handles) or an authored node (authoredIndex >= 0).
struct CanonNode {
  std::string slug;
  int authoredIndex;          // -1 for synthetic root
  std::vector<int> childHandles;  // authored-node handles (containers/roots)
};
}  // namespace

UiModel EmitterUi::build() const {
  UiModel m;
  m.version = 5;
  m.schemaVersion = 1;
  m.minAppVersion = "1.0.0";
  m.hasAppShell = !navItems_.empty();

  // ---- expand: synthetic <view>.root STACK nodes + depth-first authored nodes.
  // Order matches expand.ts: per view -> root, then each content subtree.
  std::vector<CanonNode> canon;
  // depth-first append of an authored node and (for containers) its children.
  // (small recursion via an explicit stack to stay simple/iterative-friendly)
  struct Appender {
    const std::vector<NodeDecl>& nodes;
    std::vector<CanonNode>& out;
    void appendSubtree(int handle) {
      const NodeDecl& nd = nodes[handle];
      CanonNode c;
      c.slug = nd.slug;
      c.authoredIndex = handle;
      if (nd.kind != NodeKind::Widget) c.childHandles = nd.childHandles;
      out.push_back(c);
      if (nd.kind != NodeKind::Widget) {
        for (size_t i = 0; i < nd.childHandles.size(); ++i) appendSubtree(nd.childHandles[i]);
      }
    }
  };
  Appender appender = { nodes_, canon };
  for (size_t v = 0; v < views_.size(); ++v) {
    const ViewDecl& view = views_[v];
    CanonNode root;
    root.slug = view.slug + ".root";
    root.authoredIndex = -1;
    root.childHandles = view.topLevelHandles;
    canon.push_back(root);
    for (size_t i = 0; i < view.topLevelHandles.size(); ++i)
      appender.appendSubtree(view.topLevelHandles[i]);
  }

  // ---- assignIds (sort-by-id ascending, 1-based) per kind, via the shared
  // IdMap (ui/IdAssignment.h) so RuntimeUi computes the identical ids.
  std::vector<std::string> resSlugs, actSlugs, scrSlugs, nodeSlugs;
  for (size_t i = 0; i < resources_.size(); ++i) resSlugs.push_back(resources_[i].slug);
  for (size_t i = 0; i < actions_.size(); ++i)   actSlugs.push_back(actions_[i].slug);
  for (size_t i = 0; i < views_.size(); ++i)     scrSlugs.push_back(views_[i].slug);
  for (size_t i = 0; i < canon.size(); ++i)      nodeSlugs.push_back(canon[i].slug);
  IdMap resIds, actIds, scrIds, nodeIds;
  resIds.build(resSlugs);
  actIds.build(actSlugs);
  scrIds.build(scrSlugs);
  nodeIds.build(nodeSlugs);

  // map: authored-node handle -> canonical slug (for child id resolution).
  // canon entries with authoredIndex>=0 give the slug of that handle.
  std::vector<std::string> handleSlug(nodes_.size());
  for (size_t i = 0; i < nodes_.size(); ++i) handleSlug[i] = nodes_[i].slug;

  // ---- intern strings + build model sections, in normalize.ts order ----

  // 1) capabilities: required then optional.
  for (size_t i = 0; i < requiredCaps_.size(); ++i)
    m.featureIdxs.push_back(m.strings.intern(requiredCaps_[i]));
  for (size_t i = 0; i < optionalCaps_.size(); ++i)
    m.featureIdxs.push_back(m.strings.intern(optionalCaps_[i]));

  // 2) resources (declaration order): slug, label, unit, enumValues.
  for (size_t i = 0; i < resources_.size(); ++i) {
    const ResourceDecl& r = resources_[i];
    UiResource nr;
    nr.id = resIds.idOf(r.slug);
    nr.slugIdx = m.strings.intern(r.slug);
    nr.labelIdx = m.strings.internOptional(r.label.c_str());
    nr.unitIdx = m.strings.internOptional(r.unit.c_str());
    nr.valueType = static_cast<uint32_t>(r.type);
    nr.readMode = static_cast<uint32_t>(r.readMode);
    nr.staleAfterMs = r.staleAfterMs;
    nr.pollMs = r.pollMs;
    for (size_t e = 0; e < r.enumValues.size(); ++e)
      nr.enumValueIdxs.push_back(m.strings.intern(r.enumValues[e]));
    m.resources.push_back(nr);
  }

  // 3) actions (declaration order): slug, label, confirm, inputSchema.
  for (size_t i = 0; i < actions_.size(); ++i) {
    const ActionDecl& a = actions_[i];
    UiAction na;
    na.id = actIds.idOf(a.slug);
    na.slugIdx = m.strings.intern(a.slug);
    na.labelIdx = m.strings.internOptional(a.label.c_str());
    na.dangerLevel = static_cast<uint32_t>(a.danger);
    na.confirmIdx = m.strings.internOptional(a.confirm.c_str());
    na.cooldownMs = a.cooldownMs;
    na.inputSchemaIdx = m.strings.intern(buildSchemaJson(a));
    na.resultSchemaIdx = 0;
    m.actions.push_back(na);
  }

  // 4) screens (views in declaration order): slug, title, routeKey.
  for (size_t i = 0; i < views_.size(); ++i) {
    const ViewDecl& v = views_[i];
    UiScreen ns;
    ns.id = scrIds.idOf(v.slug);
    ns.slugIdx = m.strings.intern(v.slug);
    ns.titleIdx = m.strings.intern(v.title);
    ns.routeKeyIdx = m.strings.internOptional(v.routeKey.c_str());
    ns.rootNodeId = nodeIds.idOf(v.slug + ".root");
    m.screens.push_back(ns);
  }

  // 5) appShell navBar items (declaration order): id, label, icon.
  if (m.hasAppShell) {
    for (size_t i = 0; i < navItems_.size(); ++i) {
      const NavDecl& it = navItems_[i];
      UiNavItem nn;
      nn.idIdx = m.strings.intern(it.id);
      nn.labelIdx = m.strings.intern(it.label);
      nn.iconIdx = m.strings.intern(it.icon);
      nn.screenId = (it.viewHandle >= 0) ? scrIds.idOf(views_[it.viewHandle].slug) : 0;
      m.navItems.push_back(nn);
    }
  }

  // 6) nodes (canonical order): slug, title, tone, [children], [text, formatHint].
  for (size_t i = 0; i < canon.size(); ++i) {
    const CanonNode& c = canon[i];
    const bool synthetic = (c.authoredIndex < 0);
    const NodeDecl* nd = synthetic ? 0 : &nodes_[c.authoredIndex];
    const bool isWidget = (!synthetic) && nd->kind == NodeKind::Widget;

    UiNode nn;
    nn.id = nodeIds.idOf(c.slug);
    nn.slugIdx = m.strings.intern(c.slug);
    nn.kind = synthetic ? static_cast<uint32_t>(NodeKind::Stack) : static_cast<uint32_t>(nd->kind);
    nn.widgetKind = isWidget ? static_cast<uint32_t>(nd->widgetKind) : 0u;
    nn.titleIdx = synthetic ? 0u : m.strings.internOptional(nd->title.c_str());
    nn.toneIdx = synthetic ? 0u : m.strings.internOptional(nd->tone.c_str());

    if (!isWidget) {
      for (size_t k = 0; k < c.childHandles.size(); ++k)
        nn.childrenIds.push_back(nodeIds.idOf(handleSlug[c.childHandles[k]]));
    }
    nn.columns = (synthetic || isWidget) ? 0u : nd->columns;
    nn.bindResourceId = (isWidget && nd->bindResourceHandle >= 0)
                            ? resIds.idOf(resources_[nd->bindResourceHandle].slug) : 0u;
    nn.bindActionId = (isWidget && nd->bindActionIndex >= 0)
                          ? actIds.idOf(actions_[nd->bindActionIndex].slug) : 0u;
    nn.textIdx = isWidget ? m.strings.internOptional(nd->text.c_str()) : 0u;
    nn.formatHintIdx = isWidget ? m.strings.internOptional(nd->formatHint.c_str()) : 0u;
    m.nodes.push_back(nn);
  }

  return m;
}

}} // namespace ecb::ui
