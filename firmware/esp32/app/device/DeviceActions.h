#pragma once

#include <stdint.h>

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

  static void setDebugEnabled(DeviceState& state, bool enabled) {
    state.debugEnabled = enabled;
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

  void applyRelayOutput(const DeviceState& state) const;
  void applyBrightnessOutput(const DeviceState& state) const;

  uint8_t ledPin_;
};

}  // namespace app
