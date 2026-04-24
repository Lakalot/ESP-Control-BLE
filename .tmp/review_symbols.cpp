#include "manifest_symbols.h"

namespace manifest_resources {
const uint32_t relay_auto = 1u;
}

const ManifestSymbolEntry kManifestResourceSymbols[] = {
  {manifest_resources::relay_auto, "relay_auto", "relay.auto"},
};
const size_t kManifestResourceSymbolsCount = sizeof(kManifestResourceSymbols) / sizeof(kManifestResourceSymbols[0]);

const ManifestSymbolEntry* find_manifest_resource_symbol(uint32_t id) {
  for (size_t index = 0; index < kManifestResourceSymbolsCount; ++index) {
    if (kManifestResourceSymbols[index].id == id) {
      return &kManifestResourceSymbols[index];
    }
  }
  return nullptr;
}

namespace manifest_actions {
const uint32_t relay_toggle = 1u;
}

const ManifestSymbolEntry kManifestActionSymbols[] = {
  {manifest_actions::relay_toggle, "relay_toggle", "relay.toggle"},
};
const size_t kManifestActionSymbolsCount = sizeof(kManifestActionSymbols) / sizeof(kManifestActionSymbols[0]);

const ManifestSymbolEntry* find_manifest_action_symbol(uint32_t id) {
  for (size_t index = 0; index < kManifestActionSymbolsCount; ++index) {
    if (kManifestActionSymbols[index].id == id) {
      return &kManifestActionSymbols[index];
    }
  }
  return nullptr;
}

namespace manifest_screens {
const uint32_t home_screen = 1u;
}

const ManifestSymbolEntry kManifestScreenSymbols[] = {
  {manifest_screens::home_screen, "home_screen", "home"},
};
const size_t kManifestScreenSymbolsCount = sizeof(kManifestScreenSymbols) / sizeof(kManifestScreenSymbols[0]);

const ManifestSymbolEntry* find_manifest_screen_symbol(uint32_t id) {
  for (size_t index = 0; index < kManifestScreenSymbolsCount; ++index) {
    if (kManifestScreenSymbols[index].id == id) {
      return &kManifestScreenSymbols[index];
    }
  }
  return nullptr;
}

namespace manifest_nodes {
const uint32_t home_root = 1u;
const uint32_t home_toggle = 2u;
}

const ManifestSymbolEntry kManifestNodeSymbols[] = {
  {manifest_nodes::home_root, "home_root", "home.root"},
  {manifest_nodes::home_toggle, "home_toggle", "home.toggle"},
};
const size_t kManifestNodeSymbolsCount = sizeof(kManifestNodeSymbols) / sizeof(kManifestNodeSymbols[0]);

const ManifestSymbolEntry* find_manifest_node_symbol(uint32_t id) {
  for (size_t index = 0; index < kManifestNodeSymbolsCount; ++index) {
    if (kManifestNodeSymbols[index].id == id) {
      return &kManifestNodeSymbols[index];
    }
  }
  return nullptr;
}

