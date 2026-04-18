#include "LedCommand.h"
#include "../protocol/CommandHandler.h"
#include <Arduino.h>

#define LED_PIN 2

static bool ledState = false;

void registerLedCommands() {
  pinMode(LED_PIN, OUTPUT);

  commandHandler.registerCommand(CMD_LED_TOGGLE, [](const uint8_t* payload, uint8_t len, NotifyCallback notify) {
    ledState = !ledState;
    digitalWrite(LED_PIN, ledState ? HIGH : LOW);
    Serial.printf("[LED] Toggle -> %s\n", ledState ? "ON" : "OFF");
    uint8_t response[1] = { ledState ? 0x01u : 0x00u };
    sendOkResponse(CMD_LED_TOGGLE, response, 1, notify);
  });

  commandHandler.registerCommand(CMD_LED_BRIGHT, [](const uint8_t* payload, uint8_t len, NotifyCallback notify) {
    if (len < 2) {
      sendErrorResponse(CMD_LED_BRIGHT, 0x03, notify);
      return;
    }
    int16_t value = (int16_t)((payload[0] << 8) | payload[1]);
    uint8_t brightness = (uint8_t)constrain(value, 0, 100);
    analogWrite(LED_PIN, map(brightness, 0, 100, 0, 255));
    Serial.printf("[LED] Brightness -> %d%%\n", brightness);
    sendOkResponse(CMD_LED_BRIGHT, payload, 2, notify);
  });
}
