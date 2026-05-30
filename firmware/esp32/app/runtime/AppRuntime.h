#pragma once

#include <stdint.h>

#include "../device/DeviceLogic.h"
#include "../device/DeviceState.h"
#include "../device/DeviceTelemetry.h"
#include "PublishScheduler.h"

class EspControl;

namespace app {

// Portable publishing seam.
//
// device_ui.cpp's .onSet handlers stay 100% declarative -- they call ONLY
// rt.<action>(...). Each rt.<action>() mutates DeviceState (via DeviceLogic) and
// then, for the changed resource(s), drives this seam to (write the value into the
// control's ResourceTable + publishDelta) and to reach hardware (the LED
// analogWrite). The concrete implementation (EspActionSink) wraps EspControl +
// Arduino and lives in AppRuntime.cpp; it is the ONLY place manifest_symbols ids,
// EspControl, and Serial appear on the action path.
//
// Keeping the seam abstract (no EspControl/Arduino in this header) lets the action
// methods stay inline+portable: native tests construct an AppRuntime with no sink
// attached, so the publish branch is skipped and no device-only symbol is
// referenced (the methods link without compiling AppRuntime.cpp).
struct ActionSink {
  virtual ~ActionSink() {}
  // relay.toggle may also adjust brightness (0 -> 100 on power-on); publishes both
  // resources and refreshes the LED.
  virtual void onRelayChanged(const DeviceState& state) = 0;
  virtual void onBrightnessChanged(const DeviceState& state) = 0;
  virtual void onColorChanged(const DeviceState& state) = 0;
  virtual void onFanChanged(const DeviceState& state) = 0;
  virtual void onDebugChanged(const DeviceState& state) = 0;
  virtual void onNameChanged(const DeviceState& state) = 0;
  virtual void onRestart() = 0;
  virtual void onFactoryReset() = 0;
};

class AppRuntime {
 public:
  DeviceState& state() { return state_; }
  const DeviceState& state() const { return state_; }

  PublishScheduler& temperaturePublisher() { return temperaturePublisher_; }
  PublishScheduler& loadPublisher() { return loadPublisher_; }

  // ---- action methods: mutate DeviceState (DeviceLogic) + publish via sink_ ----
  // device_ui.cpp's handlers forward decoded values straight to these. When no
  // sink is attached (native tests) they are pure state mutators.
  void toggleRelay() {
    DeviceLogic::toggleRelay(state_);
    // Turning the relay on from a dark state brings brightness up to a usable
    // level; one place owns this so the publish below reflects the final state.
    if (state_.relayEnabled && state_.brightness == 0) {
      DeviceLogic::setBrightness(state_, 100u);
    }
    if (sink_) sink_->onRelayChanged(state_);
  }
  void setBrightness(uint32_t brightness) {
    DeviceLogic::setBrightness(state_, brightness);
    if (sink_) sink_->onBrightnessChanged(state_);
  }
  void setBrightness(int32_t brightness) {
    DeviceLogic::setBrightness(state_, brightness);
    if (sink_) sink_->onBrightnessChanged(state_);
  }
  void setFanProfile(uint32_t fanProfile) {
    DeviceLogic::setFanProfile(state_, fanProfile);
    if (sink_) sink_->onFanChanged(state_);
  }
  void setFanProfile(int32_t fanProfile) {
    DeviceLogic::setFanProfile(state_, fanProfile);
    if (sink_) sink_->onFanChanged(state_);
  }
  void setFanProfile(const char* fanProfile) {
    DeviceLogic::setFanProfile(state_, fanProfile);
    if (sink_) sink_->onFanChanged(state_);
  }
  void setColorPreset(const char* colorPreset) {
    DeviceLogic::setColorPreset(state_, colorPreset);
    if (sink_) sink_->onColorChanged(state_);
  }
  void setDebugEnabled(bool enabled) {
    DeviceLogic::setDebugEnabled(state_, enabled);
    if (sink_) sink_->onDebugChanged(state_);
  }
  void setDeviceName(const char* deviceName) {
    DeviceLogic::setDeviceName(state_, deviceName);
    if (sink_) sink_->onNameChanged(state_);
  }
  // Valueless buttons: no state, just notify the sink (logs on device).
  void onRestart() {
    if (sink_) sink_->onRestart();
  }
  void onFactoryReset() {
    if (sink_) sink_->onFactoryReset();
  }

  // ---- telemetry state updates (published by DeviceTelemetry) ----
  void updateTemperature(float temperatureC) { DeviceTelemetry::updateTemperature(state_, temperatureC); }
  void updateHumidity(float humidityPercent) { DeviceTelemetry::updateHumidity(state_, humidityPercent); }
  void updateLoadPercent(uint32_t loadPercent) { DeviceTelemetry::updateLoadPercent(state_, loadPercent); }
  void updateWifiRssi(int32_t wifiRssiDbm) { DeviceTelemetry::updateWifiRssi(state_, wifiRssiDbm); }
  void updateUptimeMs(uint32_t uptimeMs) { DeviceTelemetry::updateUptimeMs(state_, uptimeMs); }

  // Device wiring (defined in AppRuntime.cpp; pulls in EspControl + Arduino).
  void setup(EspControl& control, DeviceTelemetry& telemetry, const uint8_t* manifestData, uint16_t manifestLen,
             float initialTemperature);
  void tick(EspControl& control, DeviceTelemetry& telemetry, float currentTemperature);

 private:
  DeviceState state_{};
  ActionSink* sink_ = nullptr;
  PublishScheduler temperaturePublisher_{2000u};
  PublishScheduler loadPublisher_{1000u};
};

}  // namespace app
