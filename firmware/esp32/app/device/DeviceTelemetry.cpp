#include "DeviceTelemetry.h"

#include <Arduino.h>
#include <EspControlBle.h>
#include <esp_timer.h>

#include "../runtime/AppRuntime.h"

namespace app {

namespace {

constexpr uint32_t kTemperatureResourceId = 2u;
constexpr uint32_t kLoadResourceId = 6u;

}  // namespace

void DeviceTelemetry::begin(EspControl& control, AppRuntime& runtime, float initialTemperature, int64_t nowUs) {
  runtime.updateTemperature(initialTemperature);
  runtime.updateLoadPercent(0u);
  syncResources(control, runtime.state());
  windowStartUs_ = nowUs;
  windowWorkUs_ = 0;
  lastPublishedLoad_ = runtime.state().loadPercent;
}

void DeviceTelemetry::tick(EspControl& control, AppRuntime& runtime, float currentTemperature) {
  const int64_t loopStartUs = esp_timer_get_time();

  const uint32_t nowMs = millis();
  if (runtime.temperaturePublisher().shouldPublish(nowMs)) {
    runtime.updateTemperature(currentTemperature);
    control.resources().setFloat(kTemperatureResourceId, runtime.state().temperatureC);
    control.publishDelta(kTemperatureResourceId);
    Serial.printf("[DATA] env.temperature -> %.2f C\n", runtime.state().temperatureC);
  }

  if (runtime.loadPublisher().shouldPublish(nowMs)) {
    const uint32_t loadPercent = sampleLoadPercent(loopStartUs, windowStartUs_, windowWorkUs_, lastPublishedLoad_);
    if (loadPercent != lastPublishedLoad_) {
      lastPublishedLoad_ = loadPercent;
      runtime.updateLoadPercent(loadPercent);
      control.resources().setUint(kLoadResourceId, runtime.state().loadPercent);
      control.publishDelta(kLoadResourceId);
      Serial.printf("[DATA] system.load -> %u%%\n", runtime.state().loadPercent);
    }
  }

  windowWorkUs_ += static_cast<uint64_t>(esp_timer_get_time() - loopStartUs);
}

void DeviceTelemetry::syncResources(EspControl& control, const DeviceState& state) const {
  control.resources().setFloat(kTemperatureResourceId, state.temperatureC);
  control.resources().setUint(kLoadResourceId, state.loadPercent);
}

}  // namespace app
