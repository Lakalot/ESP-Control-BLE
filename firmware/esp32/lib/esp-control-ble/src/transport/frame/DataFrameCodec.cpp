#include "DataFrameCodec.h"
#include "../../support/ByteOrder.h"

namespace ecb {

size_t DataFrameCodec::encodeHeader(const FrameHeader& h, uint8_t* out, size_t cap) {
  if (cap < kHeaderSize) return 0;
  out[0] = static_cast<uint8_t>(h.kind);
  out[1] = h.flags;
  writeU16BE(h.length, out + 2);
  return kHeaderSize;
}

bool DataFrameCodec::decodeHeader(const uint8_t* in, size_t len, FrameHeader& out) {
  if (len < kHeaderSize) return false;
  out.kind   = static_cast<FrameKind>(in[0]);
  out.flags  = in[1];
  out.length = static_cast<uint16_t>((in[2] << 8) | in[3]);
  return true;
}

} // namespace
