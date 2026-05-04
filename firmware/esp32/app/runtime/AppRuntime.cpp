#include "AppRuntime.h"

#include <Arduino.h>
#include <EspControlBle.h>
#include <esp_timer.h>

namespace app {

void AppRuntime::setup(ecb::EspControl& control, DeviceActions& actions, DeviceTelemetry& telemetry,
                       const uint8_t* manifestData, uint16_t manifestLen, float initialTemperature) {
  actions.begin();
  actions.registerAll(control, *this);
  actions.syncResources(control, state_);
  telemetry.begin(control, *this, initialTemperature, esp_timer_get_time());
  control.begin(manifestData, manifestLen);
}

void AppRuntime::tick(ecb::EspControl& control, DeviceTelemetry& telemetry, float currentTemperature) {
  control.tick();
  telemetry.tick(control, *this, currentTemperature);
  vTaskDelay(pdMS_TO_TICKS(50));
}

}  // namespace app
