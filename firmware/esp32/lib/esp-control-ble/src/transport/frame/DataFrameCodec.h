#pragma once
#include "../../protocol/core/Protocol.h"

namespace ecb {

class DataFrameCodec {
public:
  static constexpr size_t kHeaderSize = kFrameHeaderSize;
  static size_t encodeHeader(const FrameHeader& h, uint8_t* out, size_t cap);
  static bool   decodeHeader(const uint8_t* in, size_t len, FrameHeader& out);
};

} // namespace
