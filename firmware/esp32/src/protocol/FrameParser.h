#pragma once
#include <stdint.h>

struct ParsedFrame {
  uint8_t  cmdId;
  uint8_t  length;
  uint8_t  payload[64];
  uint8_t  hmac[4];
  uint8_t  checksum;
  bool     valid;
};

ParsedFrame parseFrame(const uint8_t* data, uint16_t len);
