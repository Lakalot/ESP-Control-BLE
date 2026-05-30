#include "AppRuntime.h"

#include <Arduino.h>
#include <EspControlBle.h>
#include <esp_timer.h>

#include "../../src/manifest_symbols.h"
#include "../device/device_ui.h"
#include "ui/RuntimeUi.h"

namespace app {

namespace {

// On-board LED used as the dimmable "light" output. This is the device's only
// action-path Arduino dependency, isolated here in AppRuntime.cpp.
constexpr uint8_t kLedPin = 2u;

// Concrete ActionSink: the publish + hardware side of every action. Holds the
// EspControl wire and owns the only references to manifest_resources:: ids,
// ResourceTable, publishDelta, analogWrite, and Serial on the action path.
class EspActionSink : public ActionSink {
 public:
  EspActionSink(EspControl& control, uint8_t ledPin) : control_(control), ledPin_(ledPin) {}

  void begin(const DeviceState& state) {
    pinMode(ledPin_, OUTPUT);
    applyLightOutput(state);
  }

  // Seed the action-owned resources with the device's real initial values (the
  // former DeviceActions::syncResources) and refresh the LED.
  void syncResources(const DeviceState& state) {
    applyLightOutput(state);
    control_.resources().setBool(manifest_resources::relay_auto, state.relayEnabled);
    control_.resources().setUint(manifest_resources::light_brightness, state.brightness);
    control_.resources().setString(manifest_resources::fan_profile, DeviceLogic::fanProfileName(state.fanProfile));
    control_.resources().setString(manifest_resources::light_color, DeviceLogic::colorPresetName(state.colorPreset));
    control_.resources().setBool(manifest_resources::device_debug, state.debugEnabled);
    control_.resources().setString(manifest_resources::device_name, state.deviceName);
  }

  void onRelayChanged(const DeviceState& state) override {
    applyLightOutput(state);
    control_.resources().setBool(manifest_resources::relay_auto, state.relayEnabled);
    control_.resources().setUint(manifest_resources::light_brightness, state.brightness);
    control_.publishDelta(manifest_resources::relay_auto);
    control_.publishDelta(manifest_resources::light_brightness);
    Serial.printf("[DATA] relay.toggle -> %s\n", state.relayEnabled ? "ON" : "OFF");
  }

  void onBrightnessChanged(const DeviceState& state) override {
    applyLightOutput(state);
    control_.resources().setUint(manifest_resources::light_brightness, state.brightness);
    control_.publishDelta(manifest_resources::light_brightness);
    Serial.printf("[DATA] light.set_brightness -> %u%%\n", state.brightness);
  }

  void onColorChanged(const DeviceState& state) override {
    control_.resources().setString(manifest_resources::light_color, DeviceLogic::colorPresetName(state.colorPreset));
    control_.publishDelta(manifest_resources::light_color);
    Serial.printf("[DATA] light.set_color -> %s\n", DeviceLogic::colorPresetName(state.colorPreset));
  }

  void onFanChanged(const DeviceState& state) override {
    control_.resources().setString(manifest_resources::fan_profile, DeviceLogic::fanProfileName(state.fanProfile));
    control_.publishDelta(manifest_resources::fan_profile);
    Serial.printf("[DATA] fan.set_profile -> %s\n", DeviceLogic::fanProfileName(state.fanProfile));
  }

  void onDebugChanged(const DeviceState& state) override {
    control_.resources().setBool(manifest_resources::device_debug, state.debugEnabled);
    control_.publishDelta(manifest_resources::device_debug);
    Serial.printf("[DATA] device.set_debug -> %s\n", state.debugEnabled ? "true" : "false");
  }

  void onNameChanged(const DeviceState& state) override {
    control_.resources().setString(manifest_resources::device_name, state.deviceName);
    control_.publishDelta(manifest_resources::device_name);
    Serial.printf("[DATA] device.rename -> %s\n", state.deviceName);
  }

  void onRestart() override {
    Serial.println("[DATA] system.restart triggered");
  }

  void onFactoryReset() override {
    Serial.println("[DATA] system.factory_reset triggered");
  }

 private:
  void applyLightOutput(const DeviceState& state) {
    if (!state.relayEnabled) {
      analogWrite(ledPin_, 0);
      return;
    }
    analogWrite(ledPin_, map(state.brightness, 0, 100, 0, 255));
  }

  EspControl& control_;
  uint8_t ledPin_;
};

}  // namespace

void AppRuntime::setup(EspControl& control, DeviceTelemetry& telemetry, const uint8_t* manifestData,
                       uint16_t manifestLen, float initialTemperature) {
  // Single device -> a function-local static sink that outlives setup(); the
  // handlers registered below call rt.<action>() which dispatches into it.
  static EspActionSink sink(control, kLedPin);
  sink_ = &sink;
  sink.begin(state_);

  // Visit the single declarative UI with RuntimeUi to register every resource
  // (seeded zero) and every .onSet handler under its action id. runtimeUi is a
  // local: after commit() the handlers live in control's ActionRegistry (copied
  // std::functions capturing *this), so it can be destroyed here.
  ecb::ui::RuntimeUi runtimeUi(control);
  buildUi(runtimeUi, *this);
  runtimeUi.commit();

  // Overwrite the zero-seeded action resources with real initial values, then let
  // telemetry seed its own resources. (commit() seeds zeros first; these run after
  // so the snapshot the tablet reads is correct.)
  sink.syncResources(state_);
  telemetry.begin(control, *this, initialTemperature, esp_timer_get_time());

  control.begin(manifestData, manifestLen);
}

void AppRuntime::tick(EspControl& control, DeviceTelemetry& telemetry, float currentTemperature) {
  control.tick();
  telemetry.tick(control, *this, currentTemperature);
  vTaskDelay(pdMS_TO_TICKS(50));
}

}  // namespace app
