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

struct DeviceActionContext {
  const DeviceActions* actions;
  ecb::EspControl* control;
  AppRuntime* runtime;
};

static void onRelayToggle(ecb::ActionContext& ctx, void* context) {
  auto* c = static_cast<DeviceActionContext*>(context);
  c->runtime->toggleRelay();
  if (c->runtime->state().relayEnabled && c->runtime->state().brightness == 0) {
    c->runtime->setBrightness(100u);
  }
  c->actions->applyLightOutput(c->runtime->state());
  c->control->resources().setBool(manifest_resources::relay_auto, c->runtime->state().relayEnabled);
  c->control->resources().setUint(manifest_resources::light_brightness, c->runtime->state().brightness);
  c->control->publishDelta(manifest_resources::relay_auto);
  c->control->publishDelta(manifest_resources::light_brightness);
  Serial.printf("[DATA] relay.toggle -> %s\n", c->runtime->state().relayEnabled ? "ON" : "OFF");
  ctx.replyOk(nullptr, 0);
}

static void onSetBrightness(ecb::ActionContext& ctx, void* context) {
  auto* c = static_cast<DeviceActionContext*>(context);
  if (ctx.valueKind == ecb::ActionValueKind::Uint) {
    c->runtime->setBrightness(ctx.uintValue);
  } else if (ctx.valueKind == ecb::ActionValueKind::Int) {
    c->runtime->setBrightness(ctx.intValue);
  } else {
    ctx.replyError(ecb::ActionStatus::BadPayload, "need uint");
    return;
  }

  c->actions->applyLightOutput(c->runtime->state());
  c->control->resources().setUint(manifest_resources::light_brightness, c->runtime->state().brightness);
  c->control->publishDelta(manifest_resources::light_brightness);
  Serial.printf("[DATA] light.set_brightness -> %u%%\n", c->runtime->state().brightness);
  ctx.replyOk(nullptr, 0);
}

static void onSetFanProfile(ecb::ActionContext& ctx, void* context) {
  auto* c = static_cast<DeviceActionContext*>(context);
  if (ctx.valueKind == ecb::ActionValueKind::String) {
    c->runtime->setFanProfile(ctx.stringValue);
  } else {
    ctx.replyError(ecb::ActionStatus::BadPayload, "need string");
    return;
  }

  c->control->resources().setString(manifest_resources::fan_profile, fanProfileName(c->runtime->state().fanProfile));
  c->control->publishDelta(manifest_resources::fan_profile);
  Serial.printf("[DATA] fan.set_profile -> %s\n", fanProfileName(c->runtime->state().fanProfile));
  ctx.replyOk(nullptr, 0);
}

static void onSetDebug(ecb::ActionContext& ctx, void* context) {
  auto* c = static_cast<DeviceActionContext*>(context);
  if (ctx.valueKind != ecb::ActionValueKind::Bool) {
    ctx.replyError(ecb::ActionStatus::BadPayload, "need bool");
    return;
  }

  c->runtime->setDebugEnabled(ctx.boolValue);
  c->control->resources().setBool(manifest_resources::device_debug, c->runtime->state().debugEnabled);
  c->control->publishDelta(manifest_resources::device_debug);
  Serial.printf("[DATA] device.set_debug -> %s\n", c->runtime->state().debugEnabled ? "true" : "false");
  ctx.replyOk(nullptr, 0);
}

static void onDeviceRename(ecb::ActionContext& ctx, void* context) {
  auto* c = static_cast<DeviceActionContext*>(context);
  if (ctx.valueKind != ecb::ActionValueKind::String) {
    ctx.replyError(ecb::ActionStatus::BadPayload, "need string");
    return;
  }

  c->runtime->setDeviceName(ctx.stringValue);
  c->control->resources().setString(manifest_resources::device_name, c->runtime->state().deviceName);
  c->control->publishDelta(manifest_resources::device_name);
  Serial.printf("[DATA] device.rename -> %s\n", c->runtime->state().deviceName);
  ctx.replyOk(nullptr, 0);
}

static void onSetColor(ecb::ActionContext& ctx, void* context) {
  auto* c = static_cast<DeviceActionContext*>(context);
  if (ctx.valueKind != ecb::ActionValueKind::String) {
    ctx.replyError(ecb::ActionStatus::BadPayload, "need string");
    return;
  }

  c->runtime->setColorPreset(ctx.stringValue);
  c->control->resources().setString(manifest_resources::light_color, colorPresetName(c->runtime->state().colorPreset));
  c->control->publishDelta(manifest_resources::light_color);
  Serial.printf("[DATA] light.set_color -> %s\n", colorPresetName(c->runtime->state().colorPreset));
  ctx.replyOk(nullptr, 0);
}

static void onFactoryReset(ecb::ActionContext& ctx, void* /*context*/) {
  Serial.println("[DATA] system.factory_reset triggered");
  ctx.replyOk(nullptr, 0);
}

static void onRestart(ecb::ActionContext& ctx, void* /*context*/) {
  Serial.println("[DATA] system.restart triggered");
  ctx.replyOk(nullptr, 0);
}

}  // namespace

void DeviceActions::begin() const {
  pinMode(ledPin_, OUTPUT);
  applyLightOutput(DeviceState{});
}

void DeviceActions::registerAll(ecb::EspControl& control, AppRuntime& runtime) const {
  static DeviceActionContext ctx{this, &control, &runtime};
  control.registerAction(manifest_actions::relay_toggle, &onRelayToggle, &ctx);
  control.registerAction(manifest_actions::light_set_brightness, &onSetBrightness, &ctx);
  control.registerAction(manifest_actions::fan_set_profile, &onSetFanProfile, &ctx);
  control.registerAction(manifest_actions::device_set_debug, &onSetDebug, &ctx);
  control.registerAction(manifest_actions::device_rename, &onDeviceRename, &ctx);
  control.registerAction(manifest_actions::light_set_color, &onSetColor, &ctx);
  control.registerAction(manifest_actions::system_factory_reset, &onFactoryReset, nullptr);
  control.registerAction(manifest_actions::system_restart, &onRestart, nullptr);
}

void DeviceActions::syncResources(ecb::EspControl& control, const DeviceState& state) const {
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