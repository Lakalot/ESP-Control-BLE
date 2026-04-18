#include "CommandHandler.h"
#include <Arduino.h>

CommandHandler commandHandler;

void CommandHandler::registerCommand(uint8_t cmdId, CommandCallback callback) {
  if (_count >= 32) return;
  _entries[_count++] = { cmdId, callback };
}

void CommandHandler::dispatch(uint8_t cmdId, const uint8_t* payload, uint8_t len, NotifyCallback notify) {
  for (uint8_t i = 0; i < _count; i++) {
    if (_entries[i].id == cmdId) {
      _entries[i].callback(payload, len, notify);
      return;
    }
  }
  Serial.printf("[CommandHandler] CMD inconnu: 0x%02X\n", cmdId);
  sendErrorResponse(cmdId, 0x02, notify);
}

void sendOkResponse(uint8_t cmdId, const uint8_t* payload, uint8_t len, NotifyCallback notify) {
  uint8_t* buf = (uint8_t*)malloc(3 + len);
  if (!buf) return;
  buf[0] = cmdId;
  buf[1] = 0x00;
  buf[2] = len;
  if (len > 0) memcpy(buf + 3, payload, len);
  notify(buf, 3 + len);
  free(buf);
}

void sendErrorResponse(uint8_t cmdId, uint8_t status, NotifyCallback notify) {
  uint8_t buf[3] = { cmdId, status, 0x00 };
  notify(buf, 3);
}
