#include "FrameParser.h"
#include <string.h>
#include <Arduino.h>

ParsedFrame parseFrame(const uint8_t* data, uint16_t len) {
  ParsedFrame frame = {};
  frame.valid = false;

  if (len < 7) {
    Serial.printf("[FrameParser] Trop court: %d bytes\n", len);
    return frame;
  }

  frame.cmdId  = data[0];
  frame.length = data[1];

  uint16_t expectedLen = 1 + 1 + frame.length + 4 + 1;
  if (len < expectedLen) {
    Serial.printf("[FrameParser] Tronqué: attendu %d, reçu %d\n", expectedLen, len);
    return frame;
  }

  if (frame.length > 64) {
    Serial.println("[FrameParser] Payload > 64 bytes");
    return frame;
  }

  memcpy(frame.payload, data + 2, frame.length);
  memcpy(frame.hmac, data + 2 + frame.length, 4);
  frame.checksum = data[2 + frame.length + 4];

  uint8_t xorCheck = 0;
  for (uint16_t i = 0; i < 2 + frame.length + 4; i++) {
    xorCheck ^= data[i];
  }

  if (xorCheck != frame.checksum) {
    Serial.printf("[FrameParser] Checksum invalide: calc=0x%02X reçu=0x%02X\n",
      xorCheck, frame.checksum);
    return frame;
  }

  frame.valid = true;
  return frame;
}
