#include "FrameCodecV5.h"

namespace ecb { namespace v5 {

size_t FrameCodec::encodeHeader(const FrameHeader& h, uint8_t* out, size_t cap) {
  if (cap < kHeaderSize) return 0;
  out[0] = static_cast<uint8_t>(h.kind);
  out[1] = h.flags;
  out[2] = static_cast<uint8_t>((h.length >> 8) & 0xFF);
  out[3] = static_cast<uint8_t>(h.length & 0xFF);
  return kHeaderSize;
}

bool FrameCodec::decodeHeader(const uint8_t* in, size_t len, FrameHeader& out) {
  if (len < kHeaderSize) return false;
  out.kind   = static_cast<FrameKind>(in[0]);
  out.flags  = in[1];
  out.length = static_cast<uint16_t>((in[2] << 8) | in[3]);
  return true;
}

}} // namespace
