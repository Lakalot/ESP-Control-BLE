#pragma once
#include <cstdint>
#include <string>
#include <vector>

#include "ui/ManifestModel.h"
#include "ui/Ui.h"

namespace ecb { namespace ui {

// Host-side Ui implementation. Records every fluent declaration verbatim, then
// build() turns them into a NORMALIZED UiModel that is byte-identical (after
// encodeUiModel) to the TS toolchain's output for the equivalent YAML:
//   * synthesizes the per-view STACK root node "<viewId>.root" (expand.ts);
//   * assigns 1-based ids per kind by sorting string ids ascending (assignIds.ts);
//   * interns strings in the exact normalize.ts traversal order;
//   * derives each action's inputSchema JSON from its widget kind + range/enum.
// Handlers (.onSet) are type-checked by the fluent API but NEVER stored here --
// EmitterUi cares only about structure.
class EmitterUi : public Ui {
public:
  EmitterUi() {}
  virtual ~EmitterUi() {}

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

  virtual int  recordView(const std::string& slug, const std::string& title);
  virtual void viewRouteKey(int vh, const std::string& routeKey);
  virtual void viewContent(int vh, const std::vector<int>& topLevelNodeHandles);

  virtual void recordNavItem(const std::string& id, const std::string& label,
                             const std::string& icon, int viewHandle);

  // Run normalization and return the encodable model.
  UiModel build() const;

private:
  // ---- accumulated authoring declarations (verbatim, in call order) ----
  struct ResourceDecl {
    std::string slug;
    ValueType   type;
    std::string label;
    std::string unit;
    ReadMode    readMode;
    uint32_t    staleAfterMs;
    uint32_t    pollMs;
    std::vector<std::string> enumValues;
    ResourceDecl() : type(ValueType::Bool), readMode(ReadMode::Snapshot), staleAfterMs(0), pollMs(0) {}
  };

  struct ActionDecl {
    std::string slug;
    std::string label;
    Danger      danger;
    std::string confirm;
    uint32_t    cooldownMs;
    std::string inputSchemaJson;  // derived
    ActionDecl() : danger(Danger::Normal), cooldownMs(0) {}
  };

  struct NodeDecl {
    std::string slug;
    NodeKind    kind;
    WidgetKind  widgetKind;       // valid only when kind == Widget
    std::string title;
    std::string tone;
    std::string text;
    std::string formatHint;
    uint32_t    columns;
    std::vector<int> childHandles;  // authored-node handles (containers only)
    int         bindResourceHandle; // index into resources_, -1 = none
    int         bindActionIndex;    // index into actions_, -1 = none
    bool        hasRange;
    int         rangeMin;
    int         rangeMax;
    std::vector<std::string> enumValuesForSchema;  // for select/text_input schemas
    NodeDecl() : kind(NodeKind::Widget), widgetKind(WidgetKind::Text), columns(0),
                 bindResourceHandle(-1), bindActionIndex(-1), hasRange(false), rangeMin(0), rangeMax(0) {}
  };

  struct ViewDecl {
    std::string slug;
    std::string title;
    std::string routeKey;
    std::vector<int> topLevelHandles;  // authored-node handles
  };

  struct NavDecl {
    std::string id;
    std::string label;
    std::string icon;
    int viewHandle;
    NavDecl() : viewHandle(-1) {}
  };

  std::vector<std::string> requiredCaps_;
  std::vector<std::string> optionalCaps_;
  std::vector<ResourceDecl> resources_;
  std::vector<ActionDecl>   actions_;
  std::vector<NodeDecl>     nodes_;     // authored nodes only (no synthetic roots)
  std::vector<ViewDecl>     views_;
  std::vector<NavDecl>      navItems_;

  // index of an existing action by slug, or -1.
  int findAction(const std::string& slug) const;
};

}} // namespace ecb::ui
