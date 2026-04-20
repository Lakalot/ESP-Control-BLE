#include <Arduino.h>
#include <EspControlBle.h>
#include <esp_timer.h>
#define MANIFEST_V5_DEFINE_DATA
#include "manifest_v5_data.h"

#define LED_PIN 2

#define V5_RES_RELAY       5u
#define V5_RES_BRIGHTNESS  4u
#define V5_RES_TEMPERATURE 2u
#define V5_RES_FAN_PROFILE 3u
#define V5_RES_LOAD        6u
#define V5_RES_DEBUG       1u

#define V5_ACT_TOGGLE        4u
#define V5_ACT_SET_BRIGHTNESS 3u
#define V5_ACT_SET_PROFILE   2u
#define V5_ACT_SET_DEBUG     1u
#define V5_ACT_FACTORY_RESET 5u

static bool    ledState  = false;
static uint8_t fanMode   = 0;
static EspControl control("ESP32-Test", "1234");

// ── Telemetry state ────────────────────────────────────────────────────────
static float    lastPublishedTemp = -999.0f;
static uint32_t lastPublishedLoad = 255u;   // impossible value → force first publish

// CPU load via esp_timer: measure time spent outside vTaskDelay over a 1s window.
// workUs accumulates µs of active work each loop iteration.
static int64_t  windowStartUs  = 0;
static uint64_t windowWorkUs   = 0;

static uint32_t sampleLoadPercent() {
  int64_t  now     = esp_timer_get_time();
  int64_t  elapsed = now - windowStartUs;
  if (elapsed <= 0) return lastPublishedLoad;

  uint32_t load = (uint32_t)((windowWorkUs * 100ULL) / (uint64_t)elapsed);
  if (load > 100) load = 100;

  windowStartUs = now;
  windowWorkUs  = 0;
  return load;
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
    if (ctx.valueKind != ecb::v5::ActionValueKind::Uint && ctx.valueKind != ecb::v5::ActionValueKind::Int) {
      ctx.replyError(ecb::v5::ActionStatus::BadPayload, "need uint"); return;
    }
    uint32_t val = (ctx.valueKind == ecb::v5::ActionValueKind::Uint) ? ctx.uintValue : (uint32_t)ctx.intValue;
    uint8_t brightness = (uint8_t)constrain((int)val, 0, 100);
    analogWrite(LED_PIN, map(brightness, 0, 100, 0, 255));
    control.resources().setUint(V5_RES_BRIGHTNESS, brightness);
    control.publishDelta(V5_RES_BRIGHTNESS);
    Serial.printf("[V5] light.set_brightness -> %u%%\n", brightness);
    ctx.replyOk(nullptr, 0);
  });

  control.registerActionV5(V5_ACT_SET_PROFILE, [](ecb::v5::ActionContext& ctx) {
    if (ctx.valueKind != ecb::v5::ActionValueKind::Uint && ctx.valueKind != ecb::v5::ActionValueKind::Int) {
      ctx.replyError(ecb::v5::ActionStatus::BadPayload, "need uint"); return;
    }
    fanMode = (uint8_t)((ctx.valueKind == ecb::v5::ActionValueKind::Uint) ? ctx.uintValue : (uint32_t)ctx.intValue);
    control.resources().setUint(V5_RES_FAN_PROFILE, fanMode);
    control.publishDelta(V5_RES_FAN_PROFILE);
    Serial.printf("[V5] fan.set_profile -> %u\n", fanMode);
    ctx.replyOk(nullptr, 0);
  });

  control.registerActionV5(V5_ACT_SET_DEBUG, [](ecb::v5::ActionContext& ctx) {
    if (ctx.valueKind != ecb::v5::ActionValueKind::Bool) {
      ctx.replyError(ecb::v5::ActionStatus::BadPayload, "need bool"); return;
    }
    bool dbg = ctx.boolValue;
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
  control.resources().setFloat(V5_RES_TEMPERATURE, temperatureRead());
  control.resources().setUint(V5_RES_LOAD, 0);
  control.resources().setBool(V5_RES_DEBUG, false);

  control.begin(MANIFEST_V5_DATA, MANIFEST_V5_LEN);

  windowStartUs = esp_timer_get_time();

  Serial.println("[App] Ready (V5 manifest, 2034 bytes)");
}

// Publish temperature every 2 s if changed by >= 0.1°C
static uint32_t lastTempMs = 0;
// Publish CPU load every 1 s
static uint32_t lastLoadMs = 0;

void loop() {
  int64_t loopStart = esp_timer_get_time();

  control.tick();

  uint32_t now = millis();

  if (now - lastTempMs >= 2000) {
    lastTempMs = now;
    float temp = temperatureRead();
    lastPublishedTemp = temp;
    control.resources().setFloat(V5_RES_TEMPERATURE, temp);
    control.publishDelta(V5_RES_TEMPERATURE);
    Serial.printf("[V5] env.temperature -> %.2f C\n", temp);
  }

  if (now - lastLoadMs >= 1000) {
    lastLoadMs = now;
    uint32_t load = sampleLoadPercent();
    if (load != lastPublishedLoad) {
      lastPublishedLoad = load;
      control.resources().setUint(V5_RES_LOAD, load);
      control.publishDelta(V5_RES_LOAD);
      Serial.printf("[V5] system.load -> %u%%\n", load);
    }
  }

  // Accumulate active work time (before sleeping)
  windowWorkUs += (uint64_t)(esp_timer_get_time() - loopStart);

  vTaskDelay(pdMS_TO_TICKS(50));
}
