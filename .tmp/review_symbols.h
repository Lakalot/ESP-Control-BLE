#pragma once

#include <cstddef>
#include <cstdint>

struct ManifestSymbolEntry {
  uint32_t id;
  const char* symbol;
  const char* slug;
};

namespace manifest_resources {
extern const uint32_t relay_auto;
}

extern const ManifestSymbolEntry kManifestResourceSymbols[];
extern const size_t kManifestResourceSymbolsCount;
const ManifestSymbolEntry* find_manifest_resource_symbol(uint32_t id);

namespace manifest_actions {
extern const uint32_t relay_toggle;
}

extern const ManifestSymbolEntry kManifestActionSymbols[];
extern const size_t kManifestActionSymbolsCount;
const ManifestSymbolEntry* find_manifest_action_symbol(uint32_t id);

namespace manifest_screens {
extern const uint32_t home_screen;
}

extern const ManifestSymbolEntry kManifestScreenSymbols[];
extern const size_t kManifestScreenSymbolsCount;
const ManifestSymbolEntry* find_manifest_screen_symbol(uint32_t id);

namespace manifest_nodes {
extern const uint32_t home_root;
extern const uint32_t home_toggle;
}

extern const ManifestSymbolEntry kManifestNodeSymbols[];
extern const size_t kManifestNodeSymbolsCount;
const ManifestSymbolEntry* find_manifest_node_symbol(uint32_t id);

