#include "DeviceActions.h"

#include <Arduino.h>
#include <EspControlBle.h>

#include "../runtime/AppRuntime.h"

namespace app {

namespace {

constexpr uint32_t kRelayResourceId = 5u;
constexpr uint32_t kBrightnessResourceId = 4u;
constexpr uint32_t kFanProfileResourceId = 3u;
constexpr uint32_t kDebugResourceId = 1u;

constexpr uint32_t kToggleActionId = 4u;
constexpr uint32_t kSetBrightnessActionId = 3u;
constexpr uint32_t kSetProfileActionId = 2u;
constexpr uint32_t kSetDebugActionId = 1u;
constexpr uint32_t kFactoryResetActionId = 5u;

}  // namespace

void DeviceActions::begin() const {
  pinMode(ledPin_, OUTPUT);
  applyRelayOutput(DeviceState{});
  applyBrightnessOutput(DeviceState{});
}

void DeviceActions::registerAll(EspControl& control, AppRuntime& runtime) const {
  control.registerAction(kToggleActionId, [this, &control, &runtime](ecb::ActionContext& ctx) {
    runtime.toggleRelay();
    applyRelayOutput(runtime.state());
    control.resources().setBool(kRelayResourceId, runtime.state().relayEnabled);
    control.publishDelta(kRelayResourceId);
    Serial.printf("[DATA] relay.toggle -> %s\n", runtime.state().relayEnabled ? "ON" : "OFF");
    ctx.replyOk(nullptr, 0);
  });

  control.registerAction(kSetBrightnessActionId, [this, &control, &runtime](ecb::ActionContext& ctx) {
    if (ctx.valueKind == ecb::ActionValueKind::Uint) {
      runtime.setBrightness(ctx.uintValue);
    } else if (ctx.valueKind == ecb::ActionValueKind::Int) {
      runtime.setBrightness(ctx.intValue);
    } else {
      ctx.replyError(ecb::ActionStatus::BadPayload, "need uint");
      return;
    }

    applyBrightnessOutput(runtime.state());
    control.resources().setUint(kBrightnessResourceId, runtime.state().brightness);
    control.publishDelta(kBrightnessResourceId);
    Serial.printf("[DATA] light.set_brightness -> %u%%\n", runtime.state().brightness);
    ctx.replyOk(nullptr, 0);
  });

  control.registerAction(kSetProfileActionId, [&control, &runtime](ecb::ActionContext& ctx) {
    if (ctx.valueKind == ecb::ActionValueKind::Uint) {
      runtime.setFanProfile(ctx.uintValue);
    } else if (ctx.valueKind == ecb::ActionValueKind::Int) {
      runtime.setFanProfile(ctx.intValue);
    } else {
      ctx.replyError(ecb::ActionStatus::BadPayload, "need uint");
      return;
    }

    control.resources().setUint(kFanProfileResourceId, runtime.state().fanProfile);
    control.publishDelta(kFanProfileResourceId);
    Serial.printf("[DATA] fan.set_profile -> %u\n", runtime.state().fanProfile);
    ctx.replyOk(nullptr, 0);
  });

  control.registerAction(kSetDebugActionId, [&control, &runtime](ecb::ActionContext& ctx) {
    if (ctx.valueKind != ecb::ActionValueKind::Bool) {
      ctx.replyError(ecb::ActionStatus::BadPayload, "need bool");
      return;
    }

    runtime.setDebugEnabled(ctx.boolValue);
    control.resources().setBool(kDebugResourceId, runtime.state().debugEnabled);
    control.publishDelta(kDebugResourceId);
    Serial.printf("[DATA] device.set_debug -> %s\n", runtime.state().debugEnabled ? "true" : "false");
    ctx.replyOk(nullptr, 0);
  });

  control.registerAction(kFactoryResetActionId, [](ecb::ActionContext& ctx) {
    Serial.println("[DATA] system.factory_reset triggered");
    ctx.replyOk(nullptr, 0);
  });
}

void DeviceActions::syncResources(EspControl& control, const DeviceState& state) const {
  applyRelayOutput(state);
  applyBrightnessOutput(state);
  control.resources().setBool(kRelayResourceId, state.relayEnabled);
  control.resources().setUint(kBrightnessResourceId, state.brightness);
  control.resources().setUint(kFanProfileResourceId, state.fanProfile);
  control.resources().setBool(kDebugResourceId, state.debugEnabled);
}

void DeviceActions::applyRelayOutput(const DeviceState& state) const {
  digitalWrite(ledPin_, state.relayEnabled ? HIGH : LOW);
}

void DeviceActions::applyBrightnessOutput(const DeviceState& state) const {
  analogWrite(ledPin_, map(state.brightness, 0, 100, 0, 255));
}

}  // namespace app
