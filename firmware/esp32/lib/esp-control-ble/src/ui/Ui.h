#pragma once
#include <cstdint>
#include <functional>
#include <initializer_list>
#include <string>
#include <vector>

// Fluent C++ API for describing a device UI (resources + views + widgets +
// handlers) in ONE place. A single buildUi(Ui&) description is visited twice:
//   * EmitterUi (host)    -> builds the normalized UiModel -> nanopb -> manifest
//   * RuntimeUi (ESP)     -> registers resources + typed action handlers
// (RuntimeUi is a later task.) Handlers (.onSet) are typed per widget and
// type-checked at compile time, but are IGNORED by EmitterUi -- the emitter
// cares only about STRUCTURE. They run only in RuntimeUi.
//
// GCC 5.1 native-toolchain safe: no nested-namespace syntax, std::optional,
// std::variant, structured bindings, if constexpr, fold expressions, or inline
// variables. std::function is available and used for onSet storage. The fluent
// builders are lightweight value handles {Ui*, declIndex} that record into the
// concrete Ui impl via virtual hooks; chained setters mutate the recorded decl.

namespace ecb { namespace ui {

// ---- Authoring enums (values match the proto enums / normalize.ts maps) ------
enum class ValueType  : uint8_t { Bool = 1, Int = 2, Uint = 3, Float = 4, String = 5, Enum = 6, DurationMs = 7 };
enum class ReadMode   : uint8_t { Snapshot = 1, Subscribe = 2, Poll = 3 };
enum class Danger     : uint8_t { Normal = 1, Elevated = 2, Dangerous = 3 };
enum class WidgetKind : uint8_t { Text = 1, Stat = 2, Toggle = 3, Button = 4, Slider = 5,
                                  Select = 6, TextInput = 7, Badge = 8, Progress = 9, Timer = 10 };
enum class NodeKind   : uint8_t { Stack = 1, Row = 2, Grid = 3, Section = 4, Widget = 5 };

class Ui;  // forward
template <typename T> class Res;  // forward (defined in ui/Res.h, included at bottom)

// ---------------------------------------------------------------------------
// Ui -- abstract description sink. Builders call these virtual hooks to record
// declarations (EmitterUi accumulates them; RuntimeUi registers them). Handles
// returned to the user are by-value {Ui*, index} into the impl's decl vectors.
//
// The hooks below are intentionally low-level (handle-indexed mutators) so the
// fluent builder types in this header stay impl-agnostic. -1 means "none".
// ---------------------------------------------------------------------------
class Ui {
public:
  virtual ~Ui() {}

  // -- capabilities (interned first, in required-then-optional order) --
  virtual void  recordCapability(const std::string& feature, bool required) = 0;

  // -- resources --
  virtual int   recordResource(const std::string& slug, ValueType type) = 0;
  virtual void  resourceLabel(int rh, const std::string& label) = 0;
  virtual void  resourceUnit(int rh, const std::string& unit) = 0;
  virtual void  resourceReadMode(int rh, ReadMode mode) = 0;
  virtual void  resourceStaleAfterMs(int rh, uint32_t ms) = 0;
  virtual void  resourcePollMs(int rh, uint32_t ms) = 0;
  virtual void  resourceEnum(int rh, const std::vector<std::string>& values) = 0;

  // -- typed resource creators -- create-or-reuse a resource by slug and return a
  // typed Res<T> handle for reading/writing its value. Default: record the
  // resource and return an INERT handle (id 0) -- harmless on EmitterUi, which
  // never resolves or writes a handle. RuntimeUi overrides these to return a
  // slot-tagged handle resolved to its real id at commit(). Defined out-of-line
  // at the bottom of this header (after ui/Res.h is included).
  virtual Res<bool>        resourceB(const std::string& slug, ValueType type);
  virtual Res<uint32_t>    resourceU32(const std::string& slug, ValueType type);
  virtual Res<int32_t>     resourceI32(const std::string& slug, ValueType type);
  virtual Res<float>       resourceF(const std::string& slug, ValueType type);
  virtual Res<const char*> resourceS(const std::string& slug, ValueType type);

  // -- widgets (a node of kind=widget) --
  // resourceHandle < 0 => unbound. hasRange/min/max drive a slider's derived schema.
  virtual int   recordWidget(const std::string& slug, WidgetKind kind,
                             int resourceHandle, bool hasRange, int rangeMin, int rangeMax) = 0;

  // -- containers (stack/row/grid/section nodes) --
  virtual int   recordContainer(const std::string& slug, NodeKind kind) = 0;
  virtual void  containerChildren(int nh, const std::vector<int>& childNodeHandles) = 0;
  virtual void  nodeColumns(int nh, uint32_t columns) = 0;

  // -- shared node mutators (apply to widgets and containers) --
  virtual void  nodeTitle(int nh, const std::string& title) = 0;
  virtual void  nodeTone(int nh, const std::string& tone) = 0;
  virtual void  nodeText(int nh, const std::string& text) = 0;
  virtual void  nodeFormatHint(int nh, const std::string& formatHint) = 0;

  // -- actions -- declared+bound from a widget; inputSchema is DERIVED from the
  //    widget's kind + range/enum (the impl owns that derivation).
  virtual void  recordWidgetAction(int nh, const std::string& slug, const std::string& label,
                                   Danger danger, const std::string& confirm, uint32_t cooldownMs) = 0;

  // -- actions -- declared EXPLICITLY (in manifest/YAML order) with an explicit
  //    inputSchema. This pins the string-table intern order (actions interned in
  //    declaration order, matching normalize.ts) and carries the exact schema a
  //    widget kind cannot infer (e.g. valueless toggle vs boolean toggle). Returns
  //    an action handle; widgets bind it later by slug via bindWidgetAction.
  virtual int   recordAction(const std::string& slug, const std::string& label) = 0;
  virtual void  actionDanger(int ah, Danger danger) = 0;
  virtual void  actionConfirm(int ah, const std::string& confirm) = 0;
  virtual void  actionCooldownMs(int ah, uint32_t cooldownMs) = 0;
  // inputSchema selectors -- exactly one applies per action (last one wins):
  virtual void  actionSchemaValueless(int ah) = 0;                       // {} (no value)
  virtual void  actionSchemaBoolean(int ah) = 0;                         // value: boolean
  virtual void  actionSchemaInteger(int ah, int minimum, int maximum) = 0;  // value: integer min..max
  virtual void  actionSchemaStringLen(int ah, int minLength, int maxLength) = 0;  // value: string len
  virtual void  actionSchemaStringEnum(int ah, const std::vector<std::string>& values) = 0;  // value: string enum
  // Bind a widget to an already-declared action (by slug). No schema derivation.
  virtual void  bindWidgetAction(int nh, const std::string& slug) = 0;

  // -- views --
  virtual int   recordView(const std::string& slug, const std::string& title) = 0;
  virtual void  viewRouteKey(int vh, const std::string& routeKey) = 0;
  virtual void  viewContent(int vh, const std::vector<int>& topLevelNodeHandles) = 0;

  // -- app shell nav bar --
  virtual void  recordNavItem(const std::string& id, const std::string& label,
                              const std::string& icon, int viewHandle) = 0;

  // -- typed handler sinks -- a widget's .onSet(fn) routes here with the widget's
  // node handle (nh). Default no-op: EmitterUi ignores handlers (it cares only
  // about STRUCTURE), so it need not override these. RuntimeUi overrides them to
  // capture the decoded callback and registerAction it (resolving nh -> bound
  // action id) at commit() time. The signature per hook matches the widget kind:
  //   slider           -> uint8 ; toggle -> bool ; select/text_input -> const char* ;
  //   button           -> void .
  virtual void  widgetOnSetUint(int /*nh*/, std::function<void(uint8_t)> /*fn*/) {}
  virtual void  widgetOnSetBool(int /*nh*/, std::function<void(bool)> /*fn*/) {}
  virtual void  widgetOnSetString(int /*nh*/, std::function<void(const char*)> /*fn*/) {}
  virtual void  widgetOnSetVoid(int /*nh*/, std::function<void()> /*fn*/) {}

  // -- default-setter sinks (short-form widgets only) -- the *Short entry points
  // below install a DEFAULT .onSet that writes the decoded value straight into the
  // widget's resource `resourceSlug`. No-op on EmitterUi (structure is unchanged --
  // a default setter records nothing the long form wouldn't). RuntimeUi captures it
  // and, at commit(), registers it on the widget's bound action UNLESS the node also
  // got a user .onSet (a user handler suppresses the default -- user wins).
  virtual void  installDefaultUintSetter(int /*nh*/, const std::string& /*resourceSlug*/) {}
  virtual void  installDefaultBoolSetter(int /*nh*/, const std::string& /*resourceSlug*/) {}
  virtual void  installDefaultStringSetter(int /*nh*/, const std::string& /*resourceSlug*/) {}

  // Declarative hardware for a widget's bound resource (no-op on EmitterUi;
  // RuntimeUi maps it onto the resource's HW config). nh = the widget node handle.
  virtual void widgetPwmPin(int /*nh*/, uint8_t /*pin*/, int /*rangeMax*/) {}
  virtual void widgetGpioPin(int /*nh*/, uint8_t /*pin*/) {}
  virtual void widgetInvertHw(int /*nh*/) {}

  // ---- value hooks (Res<T> routes through these). Default no-op: EmitterUi
  //      ignores them; RuntimeUi overrides them to write the table + publish. ----
  virtual void uiWrite(uint32_t /*id*/, bool /*v*/) {}
  virtual void uiWrite(uint32_t /*id*/, int32_t /*v*/) {}
  virtual void uiWrite(uint32_t /*id*/, uint32_t /*v*/) {}
  virtual void uiWrite(uint32_t /*id*/, float /*v*/) {}
  virtual void uiWrite(uint32_t /*id*/, const char* /*v*/) {}
  virtual bool        uiReadBool(uint32_t /*id*/)   { return false; }
  virtual int32_t     uiReadInt(uint32_t /*id*/)    { return 0; }
  virtual uint32_t    uiReadUint(uint32_t /*id*/)   { return 0u; }
  virtual float       uiReadFloat(uint32_t /*id*/)  { return 0.0f; }
  virtual const char* uiReadString(uint32_t /*id*/) { return ""; }
  // resolve a (possibly slot-tagged) handle to its final resource id. Default
  // pass-through; RuntimeUi overrides this in a later task.
  virtual uint32_t uiResolveId(uint32_t idOrSlot) const { return idOrSlot; }

  // ===== Fluent entry points (defined out-of-line below; return builders) =====
  void  requireCapability(const std::string& feature)  { recordCapability(feature, true); }
  void  optionalCapability(const std::string& feature) { recordCapability(feature, false); }

  class ResourceRef    resource(const std::string& slug, ValueType type);
  class ActionBuilder  action(const std::string& slug, const std::string& label);

  class SliderBuilder    slider(const std::string& slug, const std::string& title,
                                const class ResourceRef& res, int min, int max);
  class ToggleBuilder    toggle(const std::string& slug, const std::string& title,
                                const class ResourceRef& res);
  class SelectBuilder    select(const std::string& slug, const std::string& title,
                                const class ResourceRef& res);
  class TextInputBuilder textInput(const std::string& slug, const std::string& title,
                                   const class ResourceRef& res);
  class ButtonBuilder    button(const std::string& slug, const std::string& title);

  // -- SHORT-FORM widget builders -- one call bundles resource + action "<slug>.set"
  // + widget bound to it + a DEFAULT .onSet (writes the decoded value into the
  // resource). Returns the same builder type as the long form, so .formatHint /
  // .pwmPin / .gpioPin / a user .onSet (overriding the default) still chain. (button
  // is valueless: action slug == slug, NO resource, NO default setter.)
  class SliderBuilder    sliderShort(const std::string& slug, const std::string& title, int min, int max);
  class ToggleBuilder    toggleShort(const std::string& slug, const std::string& title);
  class SelectBuilder    selectShort(const std::string& slug, const std::string& title,
                                     const std::vector<std::string>& options);
  class TextInputBuilder textInputShort(const std::string& slug, const std::string& title);
  class ButtonBuilder    buttonShort(const std::string& slug, const std::string& title);

  class TextBuilder      text(const std::string& slug, const std::string& title);
  class TextBuilder      text(const std::string& slug);  // title-less (text set via .text())
  class StatBuilder      stat(const std::string& slug, const std::string& title,
                              const class ResourceRef& res);
  class BadgeBuilder     badge(const std::string& slug, const std::string& title,
                               const class ResourceRef& res);
  class ProgressBuilder  progress(const std::string& slug, const std::string& title,
                                  const class ResourceRef& res);
  class TimerBuilder     timer(const std::string& slug, const std::string& title,
                               const class ResourceRef& res);

  class ContainerBuilder section(const std::string& slug, const std::string& title);
  class ContainerBuilder row(const std::string& slug);
  class ContainerBuilder grid(const std::string& slug, uint32_t columns);
  class ContainerBuilder stack(const std::string& slug);

  class ViewBuilder      view(const std::string& slug, const std::string& title);
  void                   navItem(const std::string& id, const std::string& label,
                                 const std::string& icon, const class ViewBuilder& view);
};

// ---------------------------------------------------------------------------
// ResourceRef -- handle to a recorded resource; chainable optional setters.
// ---------------------------------------------------------------------------
class ResourceRef {
public:
  ResourceRef() : ui_(0), handle_(-1) {}
  ResourceRef(Ui* ui, int handle, const std::string& slug) : ui_(ui), handle_(handle), slug_(slug) {}

  const std::string& slug() const { return slug_; }
  int handle() const { return handle_; }

  ResourceRef& label(const std::string& v)      { ui_->resourceLabel(handle_, v); return *this; }
  ResourceRef& unit(const std::string& v)        { ui_->resourceUnit(handle_, v); return *this; }
  ResourceRef& readMode(ReadMode v)              { ui_->resourceReadMode(handle_, v); return *this; }
  ResourceRef& staleAfterMs(uint32_t v)          { ui_->resourceStaleAfterMs(handle_, v); return *this; }
  ResourceRef& pollMs(uint32_t v)                { ui_->resourcePollMs(handle_, v); return *this; }
  ResourceRef& enumv(const std::vector<std::string>& v) { ui_->resourceEnum(handle_, v); return *this; }

private:
  Ui* ui_;
  int handle_;
  std::string slug_;
};

// ---------------------------------------------------------------------------
// ActionBuilder -- handle to an explicitly-declared action; chainable setters
// for danger/confirm/cooldown and a single inputSchema selector. Declaring an
// action up front (ui.action(...)) fixes its string-table position in
// declaration order (matching normalize.ts) and lets the author specify the
// exact JSON schema a widget kind cannot infer.
// ---------------------------------------------------------------------------
class ActionBuilder {
public:
  ActionBuilder() : ui_(0), handle_(-1) {}
  ActionBuilder(Ui* ui, int handle, const std::string& slug) : ui_(ui), handle_(handle), slug_(slug) {}

  const std::string& slug() const { return slug_; }
  int handle() const { return handle_; }

  ActionBuilder& danger(Danger v)              { ui_->actionDanger(handle_, v); return *this; }
  ActionBuilder& confirm(const std::string& v) { ui_->actionConfirm(handle_, v); return *this; }
  ActionBuilder& cooldownMs(uint32_t v)        { ui_->actionCooldownMs(handle_, v); return *this; }

  // inputSchema selectors (mutually exclusive; pick exactly one):
  ActionBuilder& valueless()                       { ui_->actionSchemaValueless(handle_); return *this; }
  ActionBuilder& boolean()                         { ui_->actionSchemaBoolean(handle_); return *this; }
  ActionBuilder& integerRange(int lo, int hi)      { ui_->actionSchemaInteger(handle_, lo, hi); return *this; }
  ActionBuilder& stringLen(int lo, int hi)         { ui_->actionSchemaStringLen(handle_, lo, hi); return *this; }
  ActionBuilder& stringEnum(const std::vector<std::string>& v) { ui_->actionSchemaStringEnum(handle_, v); return *this; }

private:
  Ui* ui_;
  int handle_;
  std::string slug_;
};

// ---------------------------------------------------------------------------
// NodeHandle -- value base for every widget/container builder. Carries {ui,node}
// so any builder can be passed (sliced) into content()/children().
// ---------------------------------------------------------------------------
class NodeHandle {
public:
  NodeHandle() : ui_(0), node_(-1) {}
  NodeHandle(Ui* ui, int node) : ui_(ui), node_(node) {}
  int node() const { return node_; }
  Ui* ui() const { return ui_; }
protected:
  Ui* ui_;
  int node_;
};

// CRTP base giving every widget builder the common chainable node setters +
// .action(), each returning the concrete builder so .onSet() stays reachable.
template <typename Self>
class WidgetBuilder : public NodeHandle {
public:
  WidgetBuilder() {}
  WidgetBuilder(Ui* ui, int node) : NodeHandle(ui, node) {}

  Self& title(const std::string& v)      { ui_->nodeTitle(node_, v); return self(); }
  Self& tone(const std::string& v)        { ui_->nodeTone(node_, v); return self(); }
  Self& text(const std::string& v)        { ui_->nodeText(node_, v); return self(); }
  Self& formatHint(const std::string& v)  { ui_->nodeFormatHint(node_, v); return self(); }

  // Declarative hardware: drive a pin from this widget's resource value. The
  // library applies it on every set() (PWM maps the resource's range -> 0..255).
  // No-op on EmitterUi (HW is not in the manifest); RuntimeUi maps it onto the
  // resource's HW config (node slug == resource slug for short-form widgets).
  Self& pwmPin(uint8_t pin, int rangeMax = 255) { ui_->widgetPwmPin(node_, pin, rangeMax); return self(); }
  Self& gpioPin(uint8_t pin)                    { ui_->widgetGpioPin(node_, pin); return self(); }
  Self& invertHw()                              { ui_->widgetInvertHw(node_); return self(); }

  // Declare + bind an action; the impl derives its inputSchema from this widget.
  // (Backward-compatible convenience for simple widgets like a lone slider.)
  Self& action(const std::string& id, const std::string& label) {
    ui_->recordWidgetAction(node_, id, label, Danger::Normal, std::string(), 0);
    return self();
  }
  Self& action(const std::string& id, const std::string& label, Danger danger,
               const std::string& confirm, uint32_t cooldownMs) {
    ui_->recordWidgetAction(node_, id, label, danger, confirm, cooldownMs);
    return self();
  }

  // Bind to an action declared up-front via ui.action(...). Preferred when the
  // schema/danger/confirm are non-trivial: the action (and its string-table
  // position) is fixed at declaration time, not at widget-binding time.
  Self& bindAction(const std::string& id) {
    ui_->bindWidgetAction(node_, id);
    return self();
  }

protected:
  Self& self() { return static_cast<Self&>(*this); }
};

// Typed widget builders -- onSet() pins the handler signature at compile time.
class SliderBuilder : public WidgetBuilder<SliderBuilder> {
public:
  SliderBuilder() {}
  SliderBuilder(Ui* ui, int node) : WidgetBuilder<SliderBuilder>(ui, node) {}
  SliderBuilder& onSet(std::function<void(uint8_t)> fn) { ui_->widgetOnSetUint(node_, fn); return *this; }
};
class ToggleBuilder : public WidgetBuilder<ToggleBuilder> {
public:
  ToggleBuilder() {}
  ToggleBuilder(Ui* ui, int node) : WidgetBuilder<ToggleBuilder>(ui, node) {}
  ToggleBuilder& onSet(std::function<void(bool)> fn) { ui_->widgetOnSetBool(node_, fn); return *this; }
};
class SelectBuilder : public WidgetBuilder<SelectBuilder> {
public:
  SelectBuilder() {}
  SelectBuilder(Ui* ui, int node) : WidgetBuilder<SelectBuilder>(ui, node) {}
  SelectBuilder& onSet(std::function<void(const char*)> fn) { ui_->widgetOnSetString(node_, fn); return *this; }
};
class TextInputBuilder : public WidgetBuilder<TextInputBuilder> {
public:
  TextInputBuilder() {}
  TextInputBuilder(Ui* ui, int node) : WidgetBuilder<TextInputBuilder>(ui, node) {}
  TextInputBuilder& onSet(std::function<void(const char*)> fn) { ui_->widgetOnSetString(node_, fn); return *this; }
};
class ButtonBuilder : public WidgetBuilder<ButtonBuilder> {
public:
  ButtonBuilder() {}
  ButtonBuilder(Ui* ui, int node) : WidgetBuilder<ButtonBuilder>(ui, node) {}
  ButtonBuilder& onSet(std::function<void()> fn) { ui_->widgetOnSetVoid(node_, fn); return *this; }
};
// Display-only widgets (no handler).
class TextBuilder : public WidgetBuilder<TextBuilder> {
public: TextBuilder() {} TextBuilder(Ui* ui, int node) : WidgetBuilder<TextBuilder>(ui, node) {}
};
class StatBuilder : public WidgetBuilder<StatBuilder> {
public: StatBuilder() {} StatBuilder(Ui* ui, int node) : WidgetBuilder<StatBuilder>(ui, node) {}
};
class BadgeBuilder : public WidgetBuilder<BadgeBuilder> {
public: BadgeBuilder() {} BadgeBuilder(Ui* ui, int node) : WidgetBuilder<BadgeBuilder>(ui, node) {}
};
class ProgressBuilder : public WidgetBuilder<ProgressBuilder> {
public: ProgressBuilder() {} ProgressBuilder(Ui* ui, int node) : WidgetBuilder<ProgressBuilder>(ui, node) {}
};
class TimerBuilder : public WidgetBuilder<TimerBuilder> {
public: TimerBuilder() {} TimerBuilder(Ui* ui, int node) : WidgetBuilder<TimerBuilder>(ui, node) {}
};

// Container builder (stack/row/grid/section). children() takes any builders.
class ContainerBuilder : public NodeHandle {
public:
  ContainerBuilder() {}
  ContainerBuilder(Ui* ui, int node) : NodeHandle(ui, node) {}

  ContainerBuilder& title(const std::string& v) { ui_->nodeTitle(node_, v); return *this; }
  ContainerBuilder& tone(const std::string& v)   { ui_->nodeTone(node_, v); return *this; }
  ContainerBuilder& columns(uint32_t n)          { ui_->nodeColumns(node_, n); return *this; }

  ContainerBuilder& children(std::initializer_list<NodeHandle> kids) {
    std::vector<int> handles;
    for (std::initializer_list<NodeHandle>::const_iterator it = kids.begin(); it != kids.end(); ++it)
      handles.push_back(it->node());
    ui_->containerChildren(node_, handles);
    return *this;
  }
  ContainerBuilder& children(const NodeHandle& a) {
    std::vector<int> handles; handles.push_back(a.node());
    ui_->containerChildren(node_, handles);
    return *this;
  }
};

// View builder. content() lists the top-level nodes (children of the synthetic
// <view>.root STACK node the emitter synthesizes).
class ViewBuilder {
public:
  ViewBuilder() : ui_(0), handle_(-1) {}
  ViewBuilder(Ui* ui, int handle) : ui_(ui), handle_(handle) {}
  int handle() const { return handle_; }

  ViewBuilder& routeKey(const std::string& v) { ui_->viewRouteKey(handle_, v); return *this; }

  ViewBuilder& content(std::initializer_list<NodeHandle> nodes) {
    std::vector<int> handles;
    for (std::initializer_list<NodeHandle>::const_iterator it = nodes.begin(); it != nodes.end(); ++it)
      handles.push_back(it->node());
    ui_->viewContent(handle_, handles);
    return *this;
  }
  ViewBuilder& content(const NodeHandle& a) {
    std::vector<int> handles; handles.push_back(a.node());
    ui_->viewContent(handle_, handles);
    return *this;
  }

private:
  Ui* ui_;
  int handle_;
};

// ===== Ui fluent entry-point definitions (now that builders are complete) =====
inline ResourceRef Ui::resource(const std::string& slug, ValueType type) {
  return ResourceRef(this, recordResource(slug, type), slug);
}
inline ActionBuilder Ui::action(const std::string& slug, const std::string& label) {
  return ActionBuilder(this, recordAction(slug, label), slug);
}
inline SliderBuilder Ui::slider(const std::string& slug, const std::string& title,
                                const ResourceRef& res, int min, int max) {
  int nh = recordWidget(slug, WidgetKind::Slider, res.handle(), /*hasRange*/ true, min, max);
  nodeTitle(nh, title);
  return SliderBuilder(this, nh);
}
inline ToggleBuilder Ui::toggle(const std::string& slug, const std::string& title, const ResourceRef& res) {
  int nh = recordWidget(slug, WidgetKind::Toggle, res.handle(), false, 0, 0);
  nodeTitle(nh, title);
  return ToggleBuilder(this, nh);
}
inline SelectBuilder Ui::select(const std::string& slug, const std::string& title, const ResourceRef& res) {
  int nh = recordWidget(slug, WidgetKind::Select, res.handle(), false, 0, 0);
  nodeTitle(nh, title);
  return SelectBuilder(this, nh);
}
inline TextInputBuilder Ui::textInput(const std::string& slug, const std::string& title, const ResourceRef& res) {
  int nh = recordWidget(slug, WidgetKind::TextInput, res.handle(), false, 0, 0);
  nodeTitle(nh, title);
  return TextInputBuilder(this, nh);
}
inline ButtonBuilder Ui::button(const std::string& slug, const std::string& title) {
  int nh = recordWidget(slug, WidgetKind::Button, -1, false, 0, 0);
  nodeTitle(nh, title);
  return ButtonBuilder(this, nh);
}

// ----- SHORT-FORM entry points (resource + action + widget + default setter) -----
// Each is exactly the long-form sequence (so EmitterUi records byte-identical
// structure) plus an installDefault*Setter call (no-op on EmitterUi).
inline SliderBuilder Ui::sliderShort(const std::string& slug, const std::string& title, int min, int max) {
  int rh = recordResource(slug, ValueType::Uint);
  resourceLabel(rh, title);
  int ah = recordAction(slug + ".set", title);
  actionSchemaInteger(ah, min, max);
  int nh = recordWidget(slug, WidgetKind::Slider, rh, /*hasRange*/ true, min, max);
  nodeTitle(nh, title);
  bindWidgetAction(nh, slug + ".set");
  installDefaultUintSetter(nh, slug);
  return SliderBuilder(this, nh);
}
inline ToggleBuilder Ui::toggleShort(const std::string& slug, const std::string& title) {
  int rh = recordResource(slug, ValueType::Bool);
  resourceLabel(rh, title);
  int ah = recordAction(slug + ".set", title);
  actionSchemaBoolean(ah);
  int nh = recordWidget(slug, WidgetKind::Toggle, rh, false, 0, 0);
  nodeTitle(nh, title);
  bindWidgetAction(nh, slug + ".set");
  installDefaultBoolSetter(nh, slug);
  return ToggleBuilder(this, nh);
}
inline SelectBuilder Ui::selectShort(const std::string& slug, const std::string& title,
                                     const std::vector<std::string>& options) {
  int rh = recordResource(slug, ValueType::Enum);
  resourceLabel(rh, title);
  resourceEnum(rh, options);
  int ah = recordAction(slug + ".set", title);
  actionSchemaStringEnum(ah, options);
  int nh = recordWidget(slug, WidgetKind::Select, rh, false, 0, 0);
  nodeTitle(nh, title);
  bindWidgetAction(nh, slug + ".set");
  installDefaultStringSetter(nh, slug);
  return SelectBuilder(this, nh);
}
inline TextInputBuilder Ui::textInputShort(const std::string& slug, const std::string& title) {
  int rh = recordResource(slug, ValueType::String);
  resourceLabel(rh, title);
  int ah = recordAction(slug + ".set", title);
  actionSchemaStringLen(ah, 0, 64);
  int nh = recordWidget(slug, WidgetKind::TextInput, rh, false, 0, 0);
  nodeTitle(nh, title);
  bindWidgetAction(nh, slug + ".set");
  installDefaultStringSetter(nh, slug);
  return TextInputBuilder(this, nh);
}
inline ButtonBuilder Ui::buttonShort(const std::string& slug, const std::string& title) {
  // No resource; action slug == the slug itself, valueless. NO default setter.
  int ah = recordAction(slug, title);
  actionSchemaValueless(ah);
  int nh = recordWidget(slug, WidgetKind::Button, -1, false, 0, 0);
  nodeTitle(nh, title);
  bindWidgetAction(nh, slug);
  return ButtonBuilder(this, nh);
}
inline TextBuilder Ui::text(const std::string& slug, const std::string& title) {
  int nh = recordWidget(slug, WidgetKind::Text, -1, false, 0, 0);
  nodeTitle(nh, title);
  return TextBuilder(this, nh);
}
inline TextBuilder Ui::text(const std::string& slug) {
  return TextBuilder(this, recordWidget(slug, WidgetKind::Text, -1, false, 0, 0));
}
inline StatBuilder Ui::stat(const std::string& slug, const std::string& title, const ResourceRef& res) {
  int nh = recordWidget(slug, WidgetKind::Stat, res.handle(), false, 0, 0);
  nodeTitle(nh, title);
  return StatBuilder(this, nh);
}
inline BadgeBuilder Ui::badge(const std::string& slug, const std::string& title, const ResourceRef& res) {
  int nh = recordWidget(slug, WidgetKind::Badge, res.handle(), false, 0, 0);
  nodeTitle(nh, title);
  return BadgeBuilder(this, nh);
}
inline ProgressBuilder Ui::progress(const std::string& slug, const std::string& title, const ResourceRef& res) {
  int nh = recordWidget(slug, WidgetKind::Progress, res.handle(), false, 0, 0);
  nodeTitle(nh, title);
  return ProgressBuilder(this, nh);
}
inline TimerBuilder Ui::timer(const std::string& slug, const std::string& title, const ResourceRef& res) {
  int nh = recordWidget(slug, WidgetKind::Timer, res.handle(), false, 0, 0);
  nodeTitle(nh, title);
  return TimerBuilder(this, nh);
}
inline ContainerBuilder Ui::section(const std::string& slug, const std::string& title) {
  int nh = recordContainer(slug, NodeKind::Section);
  nodeTitle(nh, title);
  return ContainerBuilder(this, nh);
}
inline ContainerBuilder Ui::row(const std::string& slug) {
  return ContainerBuilder(this, recordContainer(slug, NodeKind::Row));
}
inline ContainerBuilder Ui::grid(const std::string& slug, uint32_t columns) {
  int nh = recordContainer(slug, NodeKind::Grid);
  nodeColumns(nh, columns);
  return ContainerBuilder(this, nh);
}
inline ContainerBuilder Ui::stack(const std::string& slug) {
  return ContainerBuilder(this, recordContainer(slug, NodeKind::Stack));
}
inline ViewBuilder Ui::view(const std::string& slug, const std::string& title) {
  return ViewBuilder(this, recordView(slug, title));
}
inline void Ui::navItem(const std::string& id, const std::string& label,
                        const std::string& icon, const ViewBuilder& view) {
  recordNavItem(id, label, icon, view.handle());
}

}} // namespace ecb::ui

// Pull in Res<T> so a TU including ONLY Ui.h still gets the complete handle type
// AND the out-of-line Ui::resourceX definitions (which live at the bottom of
// Res.h, where BOTH Ui and Res<T> are complete). This sits below class Ui so that
// when Res.h re-includes Ui.h (#pragma once -> no-op), Ui is already complete.
// Breaking the Ui<->Res cycle this way: whichever header is entered first, the
// creator bodies are emitted exactly once from Res.h with complete types.
#include "ui/Res.h"
