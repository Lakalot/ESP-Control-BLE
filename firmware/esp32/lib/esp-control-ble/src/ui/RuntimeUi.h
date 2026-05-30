#pragma once
#include <cstdint>
#include <functional>
#include <string>
#include <vector>

#include "ui/IdAssignment.h"
#include "ui/HwHal.h"
#include "ui/Res.h"
#include "ui/Ui.h"

// Forward-declared so this header does NOT pull in EspControlBle.h (and the
// transport stack it includes). EspControlBle.h is included only in RuntimeUi.cpp.
class EspControl;

namespace ecb { namespace ui {

// ESP-side Ui implementation. Visits the SAME fluent buildUi(Ui&) description the
// host-side EmitterUi visits, but instead of emitting a manifest it:
//   * seeds every resource into EspControl's ResourceTable (zeroed per type), and
//   * registers a typed action handler (from .onSet) under each action's id,
// computing the SAME 1-based, sort-by-id ids the EmitterUi computes (shared
// IdMap, ui/IdAssignment.h). So the tablet's manifest ids == the ESP's ids.
//
// TWO-PHASE: record -> commit().
//   record  -- the description hooks (incl. .onSet, which fires DURING the fluent
//              chain, before all actions are known) accumulate decls + a pending
//              handler list keyed by node handle. No ids are computed yet, since
//              an id depends on the FULL per-kind slug set.
//   commit() -- call ONCE after the whole description. Builds the resource/action
//              IdMaps over the now-complete slug sets, seeds resources, then for
//              each pending handler resolves node -> bound-action-slug -> action
//              id and registerAction()s the wrapped callback. resourceId()/
//              actionId() are valid after commit().
class RuntimeUi : public Ui {
public:
  explicit RuntimeUi(EspControl& control);
  virtual ~RuntimeUi() {}

  // Finalize: build id maps, seed resources, register handlers. Call once, after
  // the full description. Idempotent (a second call rebuilds from the same decls).
  void commit();

  // Valid AFTER commit(): the 1-based id for a slug, or 0 if unknown.
  uint32_t resourceId(const std::string& slug) const;
  uint32_t actionId(const std::string& slug) const;

  // Slug lookup (valid AFTER commit): a real-id handle for an already-recorded
  // resource, or an inert id-0 handle if the slug is unknown.
  Res<bool>        lookupB(const std::string& slug);
  Res<uint32_t>    lookupU32(const std::string& slug);
  Res<int32_t>     lookupI32(const std::string& slug);
  Res<float>       lookupF(const std::string& slug);
  Res<const char*> lookupS(const std::string& slug);

  // ---- Ui hooks ----
  virtual void recordCapability(const std::string& feature, bool required);

  virtual int  recordResource(const std::string& slug, ValueType type);
  virtual void resourceLabel(int rh, const std::string& label);
  virtual void resourceUnit(int rh, const std::string& unit);
  virtual void resourceReadMode(int rh, ReadMode mode);
  virtual void resourceStaleAfterMs(int rh, uint32_t ms);
  virtual void resourcePollMs(int rh, uint32_t ms);
  virtual void resourceEnum(int rh, const std::vector<std::string>& values);

  // typed resource creators -- create-or-reuse a resource (idempotent by slug) and
  // return a SLOT-TAGGED handle. The slot is resolved to the real id at commit().
  virtual Res<bool>        resourceB(const std::string& slug, ValueType type);
  virtual Res<uint32_t>    resourceU32(const std::string& slug, ValueType type);
  virtual Res<int32_t>     resourceI32(const std::string& slug, ValueType type);
  virtual Res<float>       resourceF(const std::string& slug, ValueType type);
  virtual Res<const char*> resourceS(const std::string& slug, ValueType type);

  virtual int  recordWidget(const std::string& slug, WidgetKind kind,
                            int resourceHandle, bool hasRange, int rangeMin, int rangeMax);

  virtual int  recordContainer(const std::string& slug, NodeKind kind);
  virtual void containerChildren(int nh, const std::vector<int>& childNodeHandles);
  virtual void nodeColumns(int nh, uint32_t columns);

  virtual void nodeTitle(int nh, const std::string& title);
  virtual void nodeTone(int nh, const std::string& tone);
  virtual void nodeText(int nh, const std::string& text);
  virtual void nodeFormatHint(int nh, const std::string& formatHint);

  virtual void recordWidgetAction(int nh, const std::string& slug, const std::string& label,
                                  Danger danger, const std::string& confirm, uint32_t cooldownMs);

  virtual int  recordAction(const std::string& slug, const std::string& label);
  virtual void actionDanger(int ah, Danger danger);
  virtual void actionConfirm(int ah, const std::string& confirm);
  virtual void actionCooldownMs(int ah, uint32_t cooldownMs);
  virtual void actionSchemaValueless(int ah);
  virtual void actionSchemaBoolean(int ah);
  virtual void actionSchemaInteger(int ah, int minimum, int maximum);
  virtual void actionSchemaStringLen(int ah, int minLength, int maxLength);
  virtual void actionSchemaStringEnum(int ah, const std::vector<std::string>& values);
  virtual void bindWidgetAction(int nh, const std::string& slug);

  virtual int  recordView(const std::string& slug, const std::string& title);
  virtual void viewRouteKey(int vh, const std::string& routeKey);
  virtual void viewContent(int vh, const std::vector<int>& topLevelNodeHandles);

  virtual void recordNavItem(const std::string& id, const std::string& label,
                             const std::string& icon, int viewHandle);

  // typed handler sinks (overridden -- this is the whole point of RuntimeUi)
  virtual void widgetOnSetUint(int nh, std::function<void(uint8_t)> fn);
  virtual void widgetOnSetBool(int nh, std::function<void(bool)> fn);
  virtual void widgetOnSetString(int nh, std::function<void(const char*)> fn);
  virtual void widgetOnSetVoid(int nh, std::function<void()> fn);

  // default-setter sinks (short-form widgets): tag the node so commit() registers a
  // value-writing handler on its bound action (unless a user .onSet overrides it).
  virtual void installDefaultUintSetter(int nh, const std::string& resourceSlug);
  virtual void installDefaultBoolSetter(int nh, const std::string& resourceSlug);
  virtual void installDefaultStringSetter(int nh, const std::string& resourceSlug);

  // declarative HW from a widget builder: map the widget's node handle to its
  // resource slug (node slug == resource slug for short-form widgets) and forward
  // to the existing slug-keyed setPwmPin/setGpioPin/setInvert recorders.
  virtual void widgetPwmPin(int nh, uint8_t pin, int rangeMax);
  virtual void widgetGpioPin(int nh, uint8_t pin);
  virtual void widgetInvertHw(int nh);

  // value hooks (override the no-op base; route to control_->resources() + publish).
  virtual void uiWrite(uint32_t id, bool v);
  virtual void uiWrite(uint32_t id, int32_t v);
  virtual void uiWrite(uint32_t id, uint32_t v);
  virtual void uiWrite(uint32_t id, float v);
  virtual void uiWrite(uint32_t id, const char* v);
  virtual bool        uiReadBool(uint32_t id);
  virtual int32_t     uiReadInt(uint32_t id);
  virtual uint32_t    uiReadUint(uint32_t id);
  virtual float       uiReadFloat(uint32_t id);
  virtual const char* uiReadString(uint32_t id);

  // Resolve a slot-tagged handle (high bit set) -> its resource's real id (valid
  // post-commit; 0 before). A plain id (high bit clear) passes through unchanged,
  // so raw-id callers (and Res handles already holding a real id) are untouched.
  virtual uint32_t uiResolveId(uint32_t idOrSlot) const;

  // HW configuration recorders: set hardware attributes on a resource (by slug).
  // Must be called AFTER resourceU32/resourceB/etc. has recorded the resource, and
  // BEFORE commit(). The builder (DX-T5) will call these; tests can call them directly.
  void setPwmPin(const std::string& slug, uint8_t pin, int rangeMax);
  void setGpioPin(const std::string& slug, uint8_t pin);
  void setInvert(const std::string& slug);
  void setOnApply(const std::string& slug, std::function<void(int32_t)> fn);

private:
  // Minimal recorded state -- only what's needed for ids, seeding, and handler
  // registration. Presentation-only inputs (titles/tones/text/confirm/danger/
  // schema/screens/nav) are intentionally ignored (their hooks are no-ops).
  struct ResourceDecl {
    std::string slug;
    ValueType   type;
    int     pwmPin;       // -1 = none
    int     gpioPin;      // -1 = none
    int     pwmRangeMax;  // map(value, 0, rangeMax, 0, 255); default 255
    bool    invert;
    std::function<void(int32_t)> onApply;  // optional escape hatch (value as int32)
    ResourceDecl() : type(ValueType::Bool), pwmPin(-1), gpioPin(-1), pwmRangeMax(255), invert(false) {}
  };
  struct ActionDecl {
    std::string slug;
  };
  struct NodeDecl {
    std::string slug;
    int bindActionIndex;  // index into actions_, -1 = none
    // Short-form default setter: write the decoded value into resource
    // `defaultSetterSlug`. kind 0=none, 1=uint, 2=bool, 3=string. Suppressed when
    // the node also got a user .onSet (hasUserOnSet) -- user handler wins.
    std::string defaultSetterSlug;
    int  defaultSetterKind;
    bool hasUserOnSet;
    NodeDecl() : bindActionIndex(-1), defaultSetterKind(0), hasUserOnSet(false) {}
  };

  // A handler captured at .onSet time, pending id resolution at commit().
  enum class HandlerKind { Uint, Bool, String, Void };
  struct PendingHandler {
    int          nodeHandle;
    HandlerKind  kind;
    std::function<void(uint8_t)>     fnUint;
    std::function<void(bool)>        fnBool;
    std::function<void(const char*)> fnString;
    std::function<void()>            fnVoid;
    PendingHandler() : nodeHandle(-1), kind(HandlerKind::Void) {}
  };

  int findAction(const std::string& slug) const;
  int findResource(const std::string& slug) const;             // -1 if absent
  int resIndexForId(uint32_t id) const;                        // -1 if absent (valid after commit)
  void applyHw(int resIndex, int32_t value);
  // Idempotent resource recording: returns the existing index if slug is already
  // recorded, else records it and returns the new index.
  int findOrRecordResource(const std::string& slug, ValueType type);

  EspControl* control_;
  std::vector<ResourceDecl>   resources_;
  // Maps a slot (index) -> index into resources_. A slot-tagged Res handle carries
  // (kSlotTag | slot); uiResolveId() follows slot -> resource -> sorted-slug id.
  std::vector<int>            slotResourceIndex_;
  std::vector<ActionDecl>     actions_;
  std::vector<NodeDecl>       nodes_;
  std::vector<PendingHandler> pending_;

  // Built by commit(); back the resourceId()/actionId() accessors.
  IdMap resIds_;
  IdMap actIds_;

  // Scratch buffer for uiReadString() -- keeps the returned pointer valid after
  // the local ResourceValue goes out of scope.
  char readScratch_[65];
};

}} // namespace ecb::ui
