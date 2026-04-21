#pragma once

#include <stdint.h>

#include "../device/DeviceActions.h"
#include "../device/DeviceState.h"
#include "../device/DeviceTelemetry.h"
#include "PublishScheduler.h"

class EspControl;

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
  void setDebugEnabled(bool enabled) { DeviceActions::setDebugEnabled(state_, enabled); }

  void updateTemperature(float temperatureC) { DeviceTelemetry::updateTemperature(state_, temperatureC); }
  void updateLoadPercent(uint32_t loadPercent) { DeviceTelemetry::updateLoadPercent(state_, loadPercent); }

  void setup(EspControl& control, DeviceActions& actions, DeviceTelemetry& telemetry, const uint8_t* manifestData,
             uint16_t manifestLen, float initialTemperature);
  void tick(EspControl& control, DeviceTelemetry& telemetry, float currentTemperature);

 private:
  DeviceState state_{};
  PublishScheduler temperaturePublisher_{2000u};
  PublishScheduler loadPublisher_{1000u};
};

}  // namespace app
