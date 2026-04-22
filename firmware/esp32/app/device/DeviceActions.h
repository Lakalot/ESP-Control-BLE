#pragma once

#include <stdint.h>
#include <string.h>

#include "DeviceState.h"

class EspControl;

namespace app {

class AppRuntime;

class DeviceActions {
 public:
  explicit DeviceActions(uint8_t ledPin) : ledPin_(ledPin) {}

  void begin() const;
  void registerAll(EspControl& control, AppRuntime& runtime) const;
  void syncResources(EspControl& control, const DeviceState& state) const;

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

  void applyRelayOutput(const DeviceState& state) const;
  void applyBrightnessOutput(const DeviceState& state) const;

  uint8_t ledPin_;
};

}  // namespace app
