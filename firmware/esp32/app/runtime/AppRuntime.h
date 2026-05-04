#pragma once

#include <stdint.h>

#include "../device/DeviceActions.h"
#include "../device/DeviceState.h"
#include "../device/DeviceTelemetry.h"
#include "PublishScheduler.h"

namespace ecb { class EspControl; }

namespace app {

class AppRuntime {
 public:
  DeviceState& state() { return state_; }
  const DeviceState& state() const { return state_; }

  PublishScheduler& temperaturePublisher() { return temperaturePublisher_; }
  PublishScheduler& loadPublisher() { return loadPublisher_; }

  void toggleRelay() { DeviceActions::toggleRelay(state_); }
  void setBrightness(uint32_t brightness) { DeviceActions::setBrightness(state_, brightness); }
  void setBrightness(int32_t brightness) { DeviceActions::setBrightness(state_, brightness); }
  void setFanProfile(uint32_t fanProfile) { DeviceActions::setFanProfile(state_, fanProfile); }
  void setFanProfile(int32_t fanProfile) { DeviceActions::setFanProfile(state_, fanProfile); }
  void setFanProfile(const char* fanProfile) { DeviceActions::setFanProfile(state_, fanProfile); }
  void setColorPreset(const char* colorPreset) { DeviceActions::setColorPreset(state_, colorPreset); }
  void setDebugEnabled(bool enabled) { DeviceActions::setDebugEnabled(state_, enabled); }
  void setDeviceName(const char* deviceName) { DeviceActions::setDeviceName(state_, deviceName); }

  void updateTemperature(float temperatureC) { DeviceTelemetry::updateTemperature(state_, temperatureC); }
  void updateHumidity(float humidityPercent) { DeviceTelemetry::updateHumidity(state_, humidityPercent); }
  void updateLoadPercent(uint32_t loadPercent) { DeviceTelemetry::updateLoadPercent(state_, loadPercent); }
  void updateWifiRssi(int32_t wifiRssiDbm) { DeviceTelemetry::updateWifiRssi(state_, wifiRssiDbm); }
  void updateUptimeMs(uint32_t uptimeMs) { DeviceTelemetry::updateUptimeMs(state_, uptimeMs); }

  void setup(ecb::EspControl& control, DeviceActions& actions, DeviceTelemetry& telemetry, const uint8_t* manifestData,
             uint16_t manifestLen, float initialTemperature);
  void tick(ecb::EspControl& control, DeviceTelemetry& telemetry, float currentTemperature);

 private:
  DeviceState state_{};
  PublishScheduler temperaturePublisher_{2000u};
  PublishScheduler loadPublisher_{1000u};
};

}  // namespace app
