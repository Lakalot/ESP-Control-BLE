#pragma once
#include <cstdint>
#include <functional>
#include <string>
#include <vector>

#include "ui/IdAssignment.h"
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

  // ---- Ui hooks ----
  virtual void recordCapability(const std::string& feature, bool required);

  virtual int  recordResource(const std::string& slug, ValueType type);
  virtual void resourceLabel(int rh, const std::string& label);
  virtual void resourceUnit(int rh, const std::string& unit);
  virtual void resourceReadMode(int rh, ReadMode mode);
  virtual void resourceStaleAfterMs(int rh, uint32_t ms);
  virtual void resourcePollMs(int rh, uint32_t ms);
  virtual void resourceEnum(int rh, const std::vector<std::string>& values);

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

private:
  // Minimal recorded state -- only what's needed for ids, seeding, and handler
  // registration. Presentation-only inputs (titles/tones/text/confirm/danger/
  // schema/screens/nav) are intentionally ignored (their hooks are no-ops).
  struct ResourceDecl {
    std::string slug;
    ValueType   type;
    ResourceDecl() : type(ValueType::Bool) {}
  };
  struct ActionDecl {
    std::string slug;
  };
  struct NodeDecl {
    std::string slug;
    int bindActionIndex;  // index into actions_, -1 = none
    NodeDecl() : bindActionIndex(-1) {}
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

  EspControl* control_;
  std::vector<ResourceDecl>   resources_;
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
