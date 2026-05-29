#include "FrameAccumulator.h"
#include <string.h>

namespace ecb {

bool FrameAccumulator::isKnownKind(uint8_t kind) {
  switch (static_cast<FrameKind>(kind)) {
    case FrameKind::ManifestChunk:
    case FrameKind::ManifestEof:
    case FrameKind::Snapshot:
    case FrameKind::Delta:
    case FrameKind::InvokeAction:
    case FrameKind::InvokeResult:
    case FrameKind::Subscribe:
    case FrameKind::Unsubscribe:
    case FrameKind::Ping:
    case FrameKind::Pong:
    case FrameKind::AuthRequest:
    case FrameKind::AuthChallenge:
    case FrameKind::AuthResponse:
    case FrameKind::AuthResult:
      return true;
    default:
      return false;
  }
}

void FrameAccumulator::dropFront(size_t n) {
  if (n >= _len) { _len = 0; return; }
  memmove(_buf, _buf + n, _len - n);
  _len -= n;
}

void FrameAccumulator::feed(const uint8_t* data, size_t len) {
  for (size_t i = 0; i < len; ++i) {
    if (_len < kCapacity) {
      _buf[_len++] = data[i];
    } else {
      // Buffer full without a valid frame: drop oldest byte to make room.
      dropFront(1);
      _buf[_len++] = data[i];
    }

    // Try to extract as many complete frames as possible.
    for (;;) {
      if (_len < kHeaderSize) break;

      if (!isKnownKind(_buf[0])) { dropFront(1); continue; }

      const uint16_t bodyLen = static_cast<uint16_t>((_buf[2] << 8) | _buf[3]);
      if (bodyLen > kMaxFrameBody) { dropFront(1); continue; }

      const size_t total = kHeaderSize + bodyLen;
      if (_len < total) break;  // wait for more bytes

      _onFrame(static_cast<FrameKind>(_buf[0]), _buf[1], _buf + kHeaderSize, bodyLen, _ctx);
      dropFront(total);
    }
  }
}

} // namespace ecb
