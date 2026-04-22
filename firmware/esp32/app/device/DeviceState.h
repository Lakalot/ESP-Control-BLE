#pragma once

#include <stdint.h>

namespace app {

struct DeviceState {
  bool relayEnabled = false;
  uint8_t brightness = 0;
  float temperatureC = 0.0f;
  uint8_t fanProfile = 0;
  uint8_t colorPreset = 0;
  uint32_t loadPercent = 0;
  float humidityPercent = 45.0f;
  int32_t wifiRssiDbm = -58;
  uint32_t uptimeMs = 0;
  bool debugEnabled = false;
  char deviceName[33] = "ESP32-Test";
};

}  // namespace app
