#pragma once
#include "../../protocol/core/Protocol.h"

struct ParsedFrame {
  uint8_t        cmdId;
  uint8_t        length;
  const uint8_t* payload;   // pointeur dans le buffer BLE — valide pendant onWrite
  const uint8_t* hmac;      // idem
  uint8_t        checksum;
  bool           valid;
};

ParsedFrame ecbParseFrame(const uint8_t* data, uint16_t len);
