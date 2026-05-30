#pragma once

#include <stdint.h>
#include <string.h>

#include "DeviceState.h"

// Pure, host-portable DeviceState logic: the mutators that decode an inbound
// action value into the device's state, plus the enum<->slug mappers the publish
// side uses to write string resources. NO Arduino, NO EspControl -- only
// <stdint.h>/<string.h>. (Was the static helpers on the old DeviceActions plus its
// fanProfileName/colorPresetName anonymous-namespace mappers; moved here so the
// declarative device_ui.cpp + the publishing AppRuntime can share them and
// DeviceActions can be deleted.)
namespace app {

struct DeviceLogic {
  // ---- state mutators (clamp/parse + assign) ----
  static void toggleRelay(DeviceState& state) {
    state.relayEnabled = !state.relayEnabled;
  }

  static void setBrightness(DeviceState& state, uint32_t brightness) {
    state.brightness = clampBrightness(brightness);
  }

  static void setBrightness(DeviceState& state, int32_t brightness) {
    state.brightness = clampBrightness(brightness);
  }

  static void setFanProfile(DeviceState& state, uint32_t fanProfile) {
    state.fanProfile = clampFanProfile(fanProfile);
  }

  static void setFanProfile(DeviceState& state, int32_t fanProfile) {
    state.fanProfile = clampFanProfile(fanProfile);
  }

  static void setFanProfile(DeviceState& state, const char* fanProfile) {
    state.fanProfile = parseFanProfile(fanProfile);
  }

  static void setColorPreset(DeviceState& state, const char* colorPreset) {
    state.colorPreset = parseColorPreset(colorPreset);
  }

  static void setDebugEnabled(DeviceState& state, bool enabled) {
    state.debugEnabled = enabled;
  }

  static void setDeviceName(DeviceState& state, const char* deviceName) {
    if (!deviceName) return;
    strncpy(state.deviceName, deviceName, sizeof(state.deviceName) - 1);
    state.deviceName[sizeof(state.deviceName) - 1] = '\0';
  }

  // ---- enum -> wire slug mappers (publish side) ----
  static const char* fanProfileName(uint8_t profile) {
    switch (profile) {
      case 2u: return "fast";
      case 1u: return "normal";
      default: return "slow";
    }
  }

  static const char* colorPresetName(uint8_t preset) {
    switch (preset) {
      case 5u: return "party";
      case 4u: return "blue";
      case 3u: return "green";
      case 2u: return "red";
      case 1u: return "cool_white";
      default: return "warm_white";
    }
  }

 private:
  static uint8_t clampBrightness(uint32_t brightness) {
    return static_cast<uint8_t>(brightness > 100u ? 100u : brightness);
  }

  static uint8_t clampBrightness(int32_t brightness) {
    if (brightness <= 0) {
      return 0u;
    }
    return clampBrightness(static_cast<uint32_t>(brightness));
  }

  static uint8_t clampFanProfile(uint32_t fanProfile) {
    return static_cast<uint8_t>(fanProfile > 255u ? 255u : fanProfile);
  }

  static uint8_t clampFanProfile(int32_t fanProfile) {
    if (fanProfile <= 0) {
      return 0u;
    }
    return clampFanProfile(static_cast<uint32_t>(fanProfile));
  }

  static uint8_t parseFanProfile(const char* fanProfile) {
    if (!fanProfile || strcmp(fanProfile, "slow") == 0) return 0u;
    if (strcmp(fanProfile, "normal") == 0) return 1u;
    if (strcmp(fanProfile, "fast") == 0) return 2u;
    return 0u;
  }

  static uint8_t parseColorPreset(const char* colorPreset) {
    if (!colorPreset || strcmp(colorPreset, "warm_white") == 0) return 0u;
    if (strcmp(colorPreset, "cool_white") == 0) return 1u;
    if (strcmp(colorPreset, "red") == 0) return 2u;
    if (strcmp(colorPreset, "green") == 0) return 3u;
    if (strcmp(colorPreset, "blue") == 0) return 4u;
    if (strcmp(colorPreset, "party") == 0) return 5u;
    return 0u;
  }
};

}  // namespace app
