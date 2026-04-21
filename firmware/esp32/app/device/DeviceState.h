#pragma once

#include <stdint.h>

namespace app {

struct DeviceState {
  bool relayEnabled = false;
  uint8_t brightness = 0;
  float temperatureC = 0.0f;
  uint8_t fanProfile = 0;
  uint32_t loadPercent = 0;
  bool debugEnabled = false;
};

}  // namespace app
