#pragma once
#include <cstdint>
#include <string>
#include <vector>

#include "ui/StringTable.h"

namespace ecb { namespace ui {

// In-memory NORMALIZED manifest model. Mirrors tools/manifest/src/compiler
// normalize.ts (NormalizedManifest): all string fields are already resolved to
// StringTable indices, and all ids are 1-based per-kind (sort-by-id ascending,
// assignIds.ts). This is the input to UiModelEncoder, which serializes it to a
// protobuf byte-identical to the TS toolchain's output.
//
// Index 0 in the StringTable is "" (the empty/absent sentinel); an optional
// string that is absent is encoded as index 0.

struct UiResource {
  uint32_t id = 0;
  uint32_t slugIdx = 0;
  uint32_t labelIdx = 0;
  uint32_t unitIdx = 0;
  uint32_t valueType = 0;  // esp_control_ValueType
  uint32_t readMode = 0;   // esp_control_ReadMode
  uint32_t staleAfterMs = 0;
  uint32_t pollMs = 0;
  std::vector<uint32_t> enumValueIdxs;
};

struct UiAction {
  uint32_t id = 0;
  uint32_t slugIdx = 0;
  uint32_t labelIdx = 0;
  uint32_t dangerLevel = 0;  // esp_control_DangerLevel
  uint32_t confirmIdx = 0;
  uint32_t cooldownMs = 0;
  uint32_t inputSchemaIdx = 0;
  uint32_t resultSchemaIdx = 0;
};

struct UiScreen {
  uint32_t id = 0;
  uint32_t slugIdx = 0;
  uint32_t titleIdx = 0;
  uint32_t routeKeyIdx = 0;
  uint32_t rootNodeId = 0;
  // entryRules: jsonlogic rules are out of MVP scope -> always empty (omitted).
};

struct UiNode {
  uint32_t id = 0;
  uint32_t slugIdx = 0;
  uint32_t kind = 0;        // esp_control_NodeKind
  uint32_t widgetKind = 0;  // esp_control_WidgetKind (0 unless kind == WIDGET)
  uint32_t titleIdx = 0;
  uint32_t toneIdx = 0;
  std::vector<uint32_t> childrenIds;
  uint32_t columns = 0;
  uint32_t bindResourceId = 0;
  uint32_t bindActionId = 0;
  // visibleIf / enabledIf: jsonlogic rules are out of MVP scope -> omitted.
  uint32_t textIdx = 0;
  uint32_t formatHintIdx = 0;
};

struct UiNavItem {
  uint32_t idIdx = 0;
  uint32_t labelIdx = 0;
  uint32_t iconIdx = 0;
  uint32_t screenId = 0;
};

struct UiModel {
  uint32_t version = 5;
  uint32_t schemaVersion = 0;
  std::string minAppVersion;
  std::vector<uint32_t> featureIdxs;
  bool hasAppShell = false;
  std::vector<UiNavItem> navItems;  // app_shell.nav_bar items (when hasAppShell)
  StringTable strings;
  std::vector<UiResource> resources;
  std::vector<UiAction> actions;
  std::vector<UiScreen> screens;
  std::vector<UiNode> nodes;
};

}} // namespace ecb::ui
