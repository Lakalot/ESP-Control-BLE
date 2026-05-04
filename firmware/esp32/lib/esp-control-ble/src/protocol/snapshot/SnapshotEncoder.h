#pragma once
#include <stddef.h>
#include <stdint.h>
#include "../resources/ResourceTable.h"

namespace ecb {

enum class EncodeResult : uint8_t { Ok, BufferTooSmall, EncoderError };

class SnapshotEncoder {
public:
  static EncodeResult tryEncode(const ResourceTable<>& table, uint8_t* out, size_t cap, size_t& written);
  static EncodeResult tryEncodeDelta(const ResourceValue& value, uint32_t generation,
                                     uint8_t* out, size_t cap, size_t& written);
};

} // namespace
