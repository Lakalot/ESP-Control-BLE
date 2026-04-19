#include "FrameCodec.h"
#include <string.h>

ParsedFrame ecbParseFrame(const uint8_t* data, uint16_t len) {
  ParsedFrame frame = {};
  frame.valid = false;

  // Minimum: cmdId(1) + length(1) + hmac(4) + checksum(1) = 7
  if (len < 7) return frame;

  frame.cmdId  = data[0];
  frame.length = data[1];

  if (frame.length > ECB_MAX_PAYLOAD) return frame;

  uint16_t expectedLen = 1 + 1 + frame.length + ECB_HASH_SIZE + 1;
  if (len < expectedLen) return frame;

  // Zero-copy: pointers into the original buffer
  frame.payload  = data + 2;
  frame.hmac     = data + 2 + frame.length;
  frame.checksum = data[2 + frame.length + ECB_HASH_SIZE];

  uint8_t xorCheck = 0;
  for (uint16_t i = 0; i < 2 + frame.length + ECB_HASH_SIZE; i++) {
    xorCheck ^= data[i];
  }

  if (xorCheck != frame.checksum) return frame;

  frame.valid = true;
  return frame;
}
