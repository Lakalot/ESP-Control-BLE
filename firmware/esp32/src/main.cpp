#include <Arduino.h>
#include <EspControlBle.h>
#include <esp_timer.h>
#include "manifest_v5_data.h"

#define LED_PIN 2

#define V5_RES_RELAY     5u
#define V5_RES_BRIGHTNESS 4u
#define V5_RES_TEMPERATURE 2u
#define V5_RES_FAN_PROFILE 3u
#define V5_RES_LOAD       6u
#define V5_RES_DEBUG      1u

#define V5_ACT_TOGGLE     4u
#define V5_ACT_SET_BRIGHTNESS 3u
#define V5_ACT_SET_PROFILE 2u
#define V5_ACT_SET_DEBUG   1u
#define V5_ACT_FACTORY_RESET 5u

static bool ledState = false;
static uint8_t ledR = 255;
static uint8_t ledG = 255;
static uint8_t ledB = 255;
static uint8_t fanMode = 0;
static int16_t temperatureCenti = 2350;
static EspControl control("ESP32-Test", "1234");
static esp_timer_handle_t tempTimer = nullptr;

static void IRAM_ATTR onTemperatureTick(void*) {
  temperatureCenti += 5;
  if (temperatureCenti > 2450) temperatureCenti = 2350;
}

void setup() {
  Serial.begin(115200);
  Serial.println("[App] Starting...");
  pinMode(LED_PIN, OUTPUT);


  control.registerActionV5(V5_ACT_TOGGLE, [](ecb::v5::ActionContext& ctx) {
    ledState = !ledState;
    digitalWrite(LED_PIN, ledState ? HIGH : LOW);
    Serial.printf("[V5] relay.toggle -> %s\n", ledState ? "ON" : "OFF");
    control.resources().setBool(V5_RES_RELAY, ledState);
    control.publishDelta(V5_RES_RELAY);
    ctx.replyOk(nullptr, 0);
  });

  control.registerActionV5(V5_ACT_SET_BRIGHTNESS, [](ecb::v5::ActionContext& ctx) {
    if (ctx.payloadLen < 4) { ctx.replyError(ecb::v5::ActionStatus::BadPayload, "need uint"); return; }
    uint32_t val = (uint32_t)ctx.payload[0]
                 | ((uint32_t)ctx.payload[1] << 8)
                 | ((uint32_t)ctx.payload[2] << 16)
                 | ((uint32_t)ctx.payload[3] << 24);
    uint8_t brightness = (uint8_t)constrain((int)val, 0, 100);
    analogWrite(LED_PIN, map(brightness, 0, 100, 0, 255));
    control.resources().setUint(V5_RES_BRIGHTNESS, brightness);
    control.publishDelta(V5_RES_BRIGHTNESS);
    Serial.printf("[V5] light.set_brightness -> %u%%\n", brightness);
    ctx.replyOk(nullptr, 0);
  });

  control.registerActionV5(V5_ACT_SET_PROFILE, [](ecb::v5::ActionContext& ctx) {
    if (ctx.payloadLen < 1) { ctx.replyError(ecb::v5::ActionStatus::BadPayload, "need value"); return; }
    fanMode = ctx.payload[0];
    control.resources().setUint(V5_RES_FAN_PROFILE, fanMode);
    control.publishDelta(V5_RES_FAN_PROFILE);
    Serial.printf("[V5] fan.set_profile -> %u\n", fanMode);
    ctx.replyOk(nullptr, 0);
  });

  control.registerActionV5(V5_ACT_SET_DEBUG, [](ecb::v5::ActionContext& ctx) {
    if (ctx.payloadLen < 1) { ctx.replyError(ecb::v5::ActionStatus::BadPayload, "need bool"); return; }
    bool dbg = ctx.payload[0] != 0;
    control.resources().setBool(V5_RES_DEBUG, dbg);
    control.publishDelta(V5_RES_DEBUG);
    Serial.printf("[V5] device.set_debug -> %s\n", dbg ? "true" : "false");
    ctx.replyOk(nullptr, 0);
  });

  control.registerActionV5(V5_ACT_FACTORY_RESET, [](ecb::v5::ActionContext& ctx) {
    Serial.println("[V5] system.factory_reset triggered");
    ctx.replyOk(nullptr, 0);
  });

  control.resources().setBool(V5_RES_RELAY, false);
  control.resources().setUint(V5_RES_BRIGHTNESS, 0);
  control.resources().setBool(V5_RES_DEBUG, false);

  control.begin(MANIFEST_V5_DATA, MANIFEST_V5_LEN);

  const esp_timer_create_args_t timerArgs = {
    .callback = onTemperatureTick,
    .arg      = nullptr,
    .name     = "temp_tick"
  };
  esp_timer_create(&timerArgs, &tempTimer);
  esp_timer_start_periodic(tempTimer, 1000000);

  Serial.println("[App] Ready (V5 manifest, 2036 bytes)");
}

void loop() {
  vTaskDelay(portMAX_DELAY);
}
