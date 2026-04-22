#include "manifest_symbols.h"

namespace manifest_resources {
const uint32_t relay_auto = 8u;
const uint32_t light_brightness = 6u;
const uint32_t env_temperature = 4u;
const uint32_t fan_profile = 5u;
const uint32_t system_load = 9u;
const uint32_t device_debug = 1u;
const uint32_t env_humidity = 3u;
const uint32_t wifi_rssi = 11u;
const uint32_t system_uptime = 10u;
const uint32_t device_name = 2u;
const uint32_t light_color = 7u;
}

const ManifestSymbolEntry kManifestResourceSymbols[] = {
  {manifest_resources::relay_auto, "relay_auto", "relay.auto"},
  {manifest_resources::light_brightness, "light_brightness", "light.brightness"},
  {manifest_resources::env_temperature, "env_temperature", "env.temperature"},
  {manifest_resources::fan_profile, "fan_profile", "fan.profile"},
  {manifest_resources::system_load, "system_load", "system.load"},
  {manifest_resources::device_debug, "device_debug", "device.debug"},
  {manifest_resources::env_humidity, "env_humidity", "env.humidity"},
  {manifest_resources::wifi_rssi, "wifi_rssi", "wifi.rssi"},
  {manifest_resources::system_uptime, "system_uptime", "system.uptime"},
  {manifest_resources::device_name, "device_name", "device.name"},
  {manifest_resources::light_color, "light_color", "light.color"},
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
const uint32_t relay_toggle = 6u;
const uint32_t light_set_brightness = 4u;
const uint32_t fan_set_profile = 3u;
const uint32_t device_set_debug = 2u;
const uint32_t system_factory_reset = 7u;
const uint32_t device_rename = 1u;
const uint32_t light_set_color = 5u;
const uint32_t system_restart = 8u;
}

const ManifestSymbolEntry kManifestActionSymbols[] = {
  {manifest_actions::relay_toggle, "relay_toggle", "relay.toggle"},
  {manifest_actions::light_set_brightness, "light_set_brightness", "light.set_brightness"},
  {manifest_actions::fan_set_profile, "fan_set_profile", "fan.set_profile"},
  {manifest_actions::device_set_debug, "device_set_debug", "device.set_debug"},
  {manifest_actions::system_factory_reset, "system_factory_reset", "system.factory_reset"},
  {manifest_actions::device_rename, "device_rename", "device.rename"},
  {manifest_actions::light_set_color, "light_set_color", "light.set_color"},
  {manifest_actions::system_restart, "system_restart", "system.restart"},
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
const uint32_t home = 1u;
}

const ManifestSymbolEntry kManifestScreenSymbols[] = {
  {manifest_screens::home, "home", "home"},
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
const uint32_t home_root = 8u;
const uint32_t home_banner = 7u;
const uint32_t lighting_section = 10u;
const uint32_t lighting_toggle = 12u;
const uint32_t lighting_slider = 11u;
const uint32_t lighting_color = 9u;
const uint32_t telemetry_section = 20u;
const uint32_t telemetry_temp = 21u;
const uint32_t telemetry_humidity = 17u;
const uint32_t telemetry_load = 18u;
const uint32_t telemetry_profile = 19u;
const uint32_t system_section = 15u;
const uint32_t system_row = 13u;
const uint32_t system_rssi = 14u;
const uint32_t system_uptime = 16u;
const uint32_t advanced_section = 6u;
const uint32_t advanced_debug = 1u;
const uint32_t advanced_note = 2u;
const uint32_t advanced_reset = 4u;
const uint32_t advanced_rename = 3u;
const uint32_t advanced_restart = 5u;
}

const ManifestSymbolEntry kManifestNodeSymbols[] = {
  {manifest_nodes::home_root, "home_root", "home.root"},
  {manifest_nodes::home_banner, "home_banner", "home.banner"},
  {manifest_nodes::lighting_section, "lighting_section", "lighting.section"},
  {manifest_nodes::lighting_toggle, "lighting_toggle", "lighting.toggle"},
  {manifest_nodes::lighting_slider, "lighting_slider", "lighting.slider"},
  {manifest_nodes::lighting_color, "lighting_color", "lighting.color"},
  {manifest_nodes::telemetry_section, "telemetry_section", "telemetry.section"},
  {manifest_nodes::telemetry_temp, "telemetry_temp", "telemetry.temp"},
  {manifest_nodes::telemetry_humidity, "telemetry_humidity", "telemetry.humidity"},
  {manifest_nodes::telemetry_load, "telemetry_load", "telemetry.load"},
  {manifest_nodes::telemetry_profile, "telemetry_profile", "telemetry.profile"},
  {manifest_nodes::system_section, "system_section", "system.section"},
  {manifest_nodes::system_row, "system_row", "system.row"},
  {manifest_nodes::system_rssi, "system_rssi", "system.rssi"},
  {manifest_nodes::system_uptime, "system_uptime", "system.uptime"},
  {manifest_nodes::advanced_section, "advanced_section", "advanced.section"},
  {manifest_nodes::advanced_debug, "advanced_debug", "advanced.debug"},
  {manifest_nodes::advanced_note, "advanced_note", "advanced.note"},
  {manifest_nodes::advanced_reset, "advanced_reset", "advanced.reset"},
  {manifest_nodes::advanced_rename, "advanced_rename", "advanced.rename"},
  {manifest_nodes::advanced_restart, "advanced_restart", "advanced.restart"},
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

