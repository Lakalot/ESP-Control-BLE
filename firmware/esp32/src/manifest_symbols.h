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
extern const uint32_t light_brightness;
extern const uint32_t env_temperature;
extern const uint32_t fan_profile;
extern const uint32_t system_load;
extern const uint32_t device_debug;
extern const uint32_t env_humidity;
extern const uint32_t wifi_rssi;
extern const uint32_t system_uptime;
extern const uint32_t device_name;
extern const uint32_t light_color;
}

extern const ManifestSymbolEntry kManifestResourceSymbols[];
extern const size_t kManifestResourceSymbolsCount;
const ManifestSymbolEntry* find_manifest_resource_symbol(uint32_t id);

namespace manifest_actions {
extern const uint32_t relay_toggle;
extern const uint32_t light_set_brightness;
extern const uint32_t fan_set_profile;
extern const uint32_t device_set_debug;
extern const uint32_t system_factory_reset;
extern const uint32_t device_rename;
extern const uint32_t light_set_color;
extern const uint32_t system_restart;
}

extern const ManifestSymbolEntry kManifestActionSymbols[];
extern const size_t kManifestActionSymbolsCount;
const ManifestSymbolEntry* find_manifest_action_symbol(uint32_t id);

namespace manifest_screens {
extern const uint32_t home;
extern const uint32_t stats_screen;
extern const uint32_t settings_screen;
}

extern const ManifestSymbolEntry kManifestScreenSymbols[];
extern const size_t kManifestScreenSymbolsCount;
const ManifestSymbolEntry* find_manifest_screen_symbol(uint32_t id);

namespace manifest_nodes {
extern const uint32_t home_root;
extern const uint32_t stats_root;
extern const uint32_t settings_root;
extern const uint32_t home_banner;
extern const uint32_t lighting_section;
extern const uint32_t lighting_toggle;
extern const uint32_t lighting_slider;
extern const uint32_t lighting_color;
extern const uint32_t telemetry_section;
extern const uint32_t telemetry_temp;
extern const uint32_t telemetry_humidity;
extern const uint32_t telemetry_load;
extern const uint32_t telemetry_profile;
extern const uint32_t system_section;
extern const uint32_t system_row;
extern const uint32_t system_rssi;
extern const uint32_t system_uptime;
extern const uint32_t settings_section;
extern const uint32_t advanced_section;
extern const uint32_t advanced_debug;
extern const uint32_t advanced_note;
extern const uint32_t advanced_reset;
extern const uint32_t settings_rename;
extern const uint32_t settings_restart;
}

extern const ManifestSymbolEntry kManifestNodeSymbols[];
extern const size_t kManifestNodeSymbolsCount;
const ManifestSymbolEntry* find_manifest_node_symbol(uint32_t id);

