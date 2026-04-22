#pragma once

#include <stddef.h>
#include <stdint.h>

#include "DeviceState.h"

class EspControl;

namespace app {

class AppRuntime;

class DeviceTelemetry {
 public:
  void begin(EspControl& control, AppRuntime& runtime, float initialTemperature, int64_t nowUs);
  void tick(EspControl& control, AppRuntime& runtime, float currentTemperature);

  static void updateTemperature(DeviceState& state, float temperatureC) {
    state.temperatureC = temperatureC;
  }

  static void updateHumidity(DeviceState& state, float humidityPercent) {
    state.humidityPercent = humidityPercent;
  }

  static void updateLoadPercent(DeviceState& state, uint32_t loadPercent) {
    state.loadPercent = loadPercent;
  }

  static void updateWifiRssi(DeviceState& state, int32_t wifiRssiDbm) {
    state.wifiRssiDbm = wifiRssiDbm;
  }

  static void updateUptimeMs(DeviceState& state, uint32_t uptimeMs) {
    state.uptimeMs = uptimeMs;
  }

  static uint32_t sampleLoadPercent(int64_t nowUs, int64_t& windowStartUs, uint64_t& windowWorkUs,
                                    uint32_t previousLoadPercent) {
    const int64_t elapsed = nowUs - windowStartUs;
    if (elapsed <= 0) {
      return previousLoadPercent;
    }

    uint32_t loadPercent = static_cast<uint32_t>((windowWorkUs * 100ULL) / static_cast<uint64_t>(elapsed));
    if (loadPercent > 100u) {
      loadPercent = 100u;
    }

    windowStartUs = nowUs;
    windowWorkUs = 0;
    return loadPercent;
  }

 private:
  void syncResources(EspControl& control, const DeviceState& state) const;

  uint32_t lastPublishedLoad_ = 255u;
  int64_t windowStartUs_ = 0;
  uint64_t windowWorkUs_ = 0;
};

}  // namespace app
