#pragma once
#include <stddef.h>
#include <stdint.h>
#include "../../protocol/core/Protocol.h"

namespace ecb {

// Reassembles framed messages from a byte stream (used by stream transports
// such as SPP, where writes are not message-delimited). Frame layout matches
// DataFrameCodec: [kind:1][flags:1][length:2 BE][body:length].
class FrameAccumulator {
public:
  using FrameFn = void (*)(FrameKind kind, uint8_t flags,
                           const uint8_t* body, size_t len, void* ctx);

  FrameAccumulator(FrameFn onFrame, void* ctx) : _onFrame(onFrame), _ctx(ctx), _len(0) {}

  // Feed received bytes; delivers every complete frame via onFrame().
  void feed(const uint8_t* data, size_t len);

  // Discard any partially-accumulated bytes (e.g. on disconnect).
  void reset() { _len = 0; }

private:
  static constexpr size_t kHeaderSize = 4;
  static constexpr size_t kCapacity = kHeaderSize + kMaxFrameBody;

  FrameFn _onFrame;
  void*   _ctx;
  uint8_t _buf[kCapacity];
  size_t  _len;

  static bool isKnownKind(uint8_t kind);
  void dropFront(size_t n);
};

} // namespace ecb
