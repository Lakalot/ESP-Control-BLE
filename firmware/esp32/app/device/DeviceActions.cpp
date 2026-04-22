#include "DeviceActions.h"

#include <Arduino.h>
#include <EspControlBle.h>

#include "../../src/manifest_symbols.h"
#include "../runtime/AppRuntime.h"

namespace app {

namespace {

const char* fanProfileName(uint8_t profile) {
  switch (profile) {
    case 2u: return "fast";
    case 1u: return "normal";
    default: return "slow";
  }
}

const char* colorPresetName(uint8_t preset) {
  switch (preset) {
    case 5u: return "party";
    case 4u: return "blue";
    case 3u: return "green";
    case 2u: return "red";
    case 1u: return "cool_white";
    default: return "warm_white";
  }
}

}  // namespace

void DeviceActions::begin() const {
  pinMode(ledPin_, OUTPUT);
  applyLightOutput(DeviceState{});
}

void DeviceActions::registerAll(EspControl& control, AppRuntime& runtime) const {
  control.registerAction(manifest_actions::relay_toggle, [this, &control, &runtime](ecb::ActionContext& ctx) {
    runtime.toggleRelay();
    applyLightOutput(runtime.state());
    control.resources().setBool(manifest_resources::relay_auto, runtime.state().relayEnabled);
    control.publishDelta(manifest_resources::relay_auto);
    Serial.printf("[DATA] relay.toggle -> %s\n", runtime.state().relayEnabled ? "ON" : "OFF");
    ctx.replyOk(nullptr, 0);
  });

  control.registerAction(manifest_actions::light_set_brightness, [this, &control, &runtime](ecb::ActionContext& ctx) {
    if (ctx.valueKind == ecb::ActionValueKind::Uint) {
      runtime.setBrightness(ctx.uintValue);
    } else if (ctx.valueKind == ecb::ActionValueKind::Int) {
      runtime.setBrightness(ctx.intValue);
    } else {
      ctx.replyError(ecb::ActionStatus::BadPayload, "need uint");
      return;
    }

    applyLightOutput(runtime.state());
    control.resources().setUint(manifest_resources::light_brightness, runtime.state().brightness);
    control.publishDelta(manifest_resources::light_brightness);
    Serial.printf("[DATA] light.set_brightness -> %u%%\n", runtime.state().brightness);
    ctx.replyOk(nullptr, 0);
  });

  control.registerAction(manifest_actions::fan_set_profile, [&control, &runtime](ecb::ActionContext& ctx) {
    if (ctx.valueKind == ecb::ActionValueKind::String) {
      runtime.setFanProfile(ctx.stringValue);
    } else {
      ctx.replyError(ecb::ActionStatus::BadPayload, "need string");
      return;
    }

    control.resources().setString(manifest_resources::fan_profile, fanProfileName(runtime.state().fanProfile));
    control.publishDelta(manifest_resources::fan_profile);
    Serial.printf("[DATA] fan.set_profile -> %s\n", fanProfileName(runtime.state().fanProfile));
    ctx.replyOk(nullptr, 0);
  });

  control.registerAction(manifest_actions::device_set_debug, [&control, &runtime](ecb::ActionContext& ctx) {
    if (ctx.valueKind != ecb::ActionValueKind::Bool) {
      ctx.replyError(ecb::ActionStatus::BadPayload, "need bool");
      return;
    }

    runtime.setDebugEnabled(ctx.boolValue);
    control.resources().setBool(manifest_resources::device_debug, runtime.state().debugEnabled);
    control.publishDelta(manifest_resources::device_debug);
    Serial.printf("[DATA] device.set_debug -> %s\n", runtime.state().debugEnabled ? "true" : "false");
    ctx.replyOk(nullptr, 0);
  });

  control.registerAction(manifest_actions::device_rename, [&control, &runtime](ecb::ActionContext& ctx) {
    if (ctx.valueKind != ecb::ActionValueKind::String) {
      ctx.replyError(ecb::ActionStatus::BadPayload, "need string");
      return;
    }

    runtime.setDeviceName(ctx.stringValue);
    control.resources().setString(manifest_resources::device_name, runtime.state().deviceName);
    control.publishDelta(manifest_resources::device_name);
    Serial.printf("[DATA] device.rename -> %s\n", runtime.state().deviceName);
    ctx.replyOk(nullptr, 0);
  });

  control.registerAction(manifest_actions::light_set_color, [&control, &runtime](ecb::ActionContext& ctx) {
    if (ctx.valueKind != ecb::ActionValueKind::String) {
      ctx.replyError(ecb::ActionStatus::BadPayload, "need string");
      return;
    }

    runtime.setColorPreset(ctx.stringValue);
    control.resources().setString(manifest_resources::light_color, colorPresetName(runtime.state().colorPreset));
    control.publishDelta(manifest_resources::light_color);
    Serial.printf("[DATA] light.set_color -> %s\n", colorPresetName(runtime.state().colorPreset));
    ctx.replyOk(nullptr, 0);
  });

  control.registerAction(manifest_actions::system_factory_reset, [](ecb::ActionContext& ctx) {
    Serial.println("[DATA] system.factory_reset triggered");
    ctx.replyOk(nullptr, 0);
  });

  control.registerAction(manifest_actions::system_restart, [](ecb::ActionContext& ctx) {
    Serial.println("[DATA] system.restart triggered");
    ctx.replyOk(nullptr, 0);
  });
}

void DeviceActions::syncResources(EspControl& control, const DeviceState& state) const {
  applyLightOutput(state);
  control.resources().setBool(manifest_resources::relay_auto, state.relayEnabled);
  control.resources().setUint(manifest_resources::light_brightness, state.brightness);
  control.resources().setString(manifest_resources::fan_profile, fanProfileName(state.fanProfile));
  control.resources().setString(manifest_resources::light_color, colorPresetName(state.colorPreset));
  control.resources().setBool(manifest_resources::device_debug, state.debugEnabled);
  control.resources().setString(manifest_resources::device_name, state.deviceName);
}

void DeviceActions::applyLightOutput(const DeviceState& state) const {
  if (!state.relayEnabled) {
    analogWrite(ledPin_, 0);
    return;
  }
  analogWrite(ledPin_, map(state.brightness, 0, 100, 0, 255));
}

}  // namespace app
