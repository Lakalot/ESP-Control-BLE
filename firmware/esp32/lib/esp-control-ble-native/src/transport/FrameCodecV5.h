#pragma once
#include <stddef.h>
#include <stdint.h>

namespace ecb { namespace v5 {

enum class FrameKind : uint8_t {
  ManifestChunk = 0x01,
  ManifestEof   = 0x02,
  Snapshot      = 0x10,
  Delta         = 0x11,
  InvokeAction  = 0x20,
  InvokeResult  = 0x21,
  Subscribe     = 0x30,
  Unsubscribe   = 0x31,
  Ping          = 0x32,
  Pong          = 0x33,
};

struct FrameHeader {
  FrameKind kind;
  uint8_t   flags;
  uint16_t  length;
};

class FrameCodec {
public:
  static constexpr size_t kHeaderSize = 4;
  static size_t encodeHeader(const FrameHeader& h, uint8_t* out, size_t cap);
  static bool   decodeHeader(const uint8_t* in, size_t len, FrameHeader& out);
};

}} // namespace
