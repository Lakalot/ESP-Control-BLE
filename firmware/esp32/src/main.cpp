#include <Arduino.h>
#include <EspControlBle.h>
#include <esp_timer.h>
#include "manifest_data.h"

#define LED_PIN 2

static bool ledState = false;
static uint8_t ledR = 255;
static uint8_t ledG = 255;
static uint8_t ledB = 255;
static uint8_t fanMode = 0;
static int16_t temperatureCenti = 2350;
static EspControl control("ESP32-Test", "1234");

static void onTemperatureTick(void*) {
  temperatureCenti += 5;
  if (temperatureCenti > 2450) temperatureCenti = 2350;
}

void setup() {
  Serial.begin(115200);
  Serial.println("[App] Starting...");
  pinMode(LED_PIN, OUTPUT);

  control.registerCallback(0x01, [](CmdContext& ctx) {
    ledState = !ledState;
    digitalWrite(LED_PIN, ledState ? HIGH : LOW);
    Serial.printf("[LED] Toggle -> %s\n", ledState ? "ON" : "OFF");
    uint8_t val = ledState ? 0x01 : 0x00;
    ctx.replyOk(&val, 1);
  });

  control.registerCallback(0x02, [](CmdContext& ctx) {
    if (ctx.length < 2) {
      ctx.replyError(ECB_STATUS_BAD_FRAME);
      return;
    }
    int16_t value = ctx.readInt16();
    uint8_t brightness = (uint8_t)constrain(value, 0, 100);
    analogWrite(LED_PIN, map(brightness, 0, 100, 0, 255));
    Serial.printf("[LED] Brightness -> %d%%\n", brightness);
    ctx.replyOk(ctx.payload, 2);
  });

  control.registerCallback(0x03, [](CmdContext& ctx) {
    uint8_t r = 0, g = 0, b = 0;
    if (!ctx.readRgb(r, g, b)) {
      ctx.replyError(ECB_STATUS_BAD_FRAME);
      return;
    }
    ledR = r; ledG = g; ledB = b;
    Serial.printf("[LED] Colour -> #%02X%02X%02X\n", r, g, b);
    ctx.replyOk(ctx.payload, 3);
  });

  control.registerCallback(0x10, [](CmdContext& ctx) {
    uint8_t buf[2];
    buf[0] = (uint8_t)((temperatureCenti >> 8) & 0xFF);
    buf[1] = (uint8_t)(temperatureCenti & 0xFF);
    ctx.replyOk(buf, 2);
  });

  control.registerCallback(0x21, [](CmdContext& ctx) {
    (void)ctx;
    ctx.replyProgress(42);
  });

  control.registerCallback(0x20, [](CmdContext& ctx) {
    fanMode = ctx.readMultiSelect();
    Serial.printf("[Fan] Mode -> %u\n", fanMode);
    ctx.replyOk(&fanMode, 1);
  });

  control.registerCallback(0x40, [](CmdContext& ctx) {
    int16_t x = 0, y = 0;
    if (!ctx.readXY(x, y)) {
      ctx.replyError(ECB_STATUS_BAD_FRAME);
      return;
    }
    Serial.printf("[Motion] XY -> x=%d y=%d\n", x, y);
    ctx.replyOk(ctx.payload, 4);
  });

  control.registerCallback(0x50, [](CmdContext& ctx) {
    char name[33] = { 0 };
    ctx.readTextInput(name, sizeof(name));
    Serial.printf("[Config] New name: %s\n", name);
    ctx.replyOk((const uint8_t*)name, (uint8_t)strlen(name));
  });

  control.registerCallback(0x30, [](CmdContext& ctx) {
    Serial.println("[ADV] Factory reset triggered");
    ctx.replyOk();
  });

  control.registerCallback(0x31, [](CmdContext& ctx) {
    uint8_t value = ctx.length > 0 ? ctx.payload[0] : 0x00;
    ctx.replyOk(&value, 1);
  });

  control.begin(ECB_MANIFEST_DATA, ECB_MANIFEST_LEN);

  esp_timer_handle_t tempTimer;
  const esp_timer_create_args_t timerArgs = {
    .callback = onTemperatureTick,
    .arg      = nullptr,
    .name     = "temp_tick"
  };
  esp_timer_create(&timerArgs, &tempTimer);
  esp_timer_start_periodic(tempTimer, 1000000);

  Serial.println("[App] Ready");
}

void loop() {
  vTaskDelay(portMAX_DELAY);
}
