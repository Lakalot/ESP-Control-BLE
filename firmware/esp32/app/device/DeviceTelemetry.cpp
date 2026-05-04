#include "DeviceTelemetry.h"

#include <Arduino.h>
#include <EspControlBle.h>
#include <esp_timer.h>

#include "../../src/manifest_symbols.h"
#include "../runtime/AppRuntime.h"

namespace app {

void DeviceTelemetry::begin(ecb::EspControl& control, AppRuntime& runtime, float initialTemperature, int64_t nowUs) {
  runtime.updateTemperature(initialTemperature);
  runtime.updateHumidity(45.0f);
  runtime.updateLoadPercent(0u);
  runtime.updateWifiRssi(-58);
  runtime.updateUptimeMs(0u);
  syncResources(control, runtime.state());
  windowStartUs_ = nowUs;
  windowWorkUs_ = 0;
  lastPublishedLoad_ = runtime.state().loadPercent;
}

void DeviceTelemetry::tick(ecb::EspControl& control, AppRuntime& runtime, float currentTemperature) {
  const int64_t loopStartUs = esp_timer_get_time();

  const uint32_t nowMs = millis();
  runtime.updateUptimeMs(nowMs);
  control.resources().setUint(manifest_resources::system_uptime, runtime.state().uptimeMs);

  if (runtime.temperaturePublisher().shouldPublish(nowMs)) {
    runtime.updateTemperature(currentTemperature);
    runtime.updateHumidity(45.0f + (static_cast<float>((nowMs / 1000u) % 10u) * 0.5f));
    control.resources().setFloat(manifest_resources::env_temperature, runtime.state().temperatureC);
    control.resources().setFloat(manifest_resources::env_humidity, runtime.state().humidityPercent);
    control.publishDelta(manifest_resources::env_temperature);
    control.publishDelta(manifest_resources::env_humidity);
    Serial.printf("[DATA] env.temperature -> %.2f C\n", runtime.state().temperatureC);
  }

  if (runtime.loadPublisher().shouldPublish(nowMs)) {
    const uint32_t loadPercent = sampleLoadPercent(loopStartUs, windowStartUs_, windowWorkUs_, lastPublishedLoad_);
    if (loadPercent != lastPublishedLoad_) {
      lastPublishedLoad_ = loadPercent;
      runtime.updateLoadPercent(loadPercent);
      control.resources().setUint(manifest_resources::system_load, runtime.state().loadPercent);
      control.publishDelta(manifest_resources::system_load);
      Serial.printf("[DATA] system.load -> %u%%\n", runtime.state().loadPercent);
    }

    runtime.updateWifiRssi(-58 - static_cast<int32_t>((nowMs / 5000u) % 4u));
    control.resources().setInt(manifest_resources::wifi_rssi, runtime.state().wifiRssiDbm);
    control.publishDelta(manifest_resources::wifi_rssi);
    control.publishDelta(manifest_resources::system_uptime);
  }

  windowWorkUs_ += static_cast<uint64_t>(esp_timer_get_time() - loopStartUs);
}

void DeviceTelemetry::syncResources(ecb::EspControl& control, const DeviceState& state) const {
  control.resources().setFloat(manifest_resources::env_humidity, state.humidityPercent);
  control.resources().setFloat(manifest_resources::env_temperature, state.temperatureC);
  control.resources().setUint(manifest_resources::system_load, state.loadPercent);
  control.resources().setUint(manifest_resources::system_uptime, state.uptimeMs);
  control.resources().setInt(manifest_resources::wifi_rssi, state.wifiRssiDbm);
}

}  // namespace app
