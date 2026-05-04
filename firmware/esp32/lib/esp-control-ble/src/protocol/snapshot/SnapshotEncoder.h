#pragma once
#include <stddef.h>
#include <stdint.h>
#include "../resources/ResourceTable.h"

namespace ecb {

class SnapshotEncoder {
public:
  static bool encode(const ResourceTable<>& table, uint8_t* out, size_t cap, size_t& written);
  static bool encodeDelta(const ResourceValue& value, uint32_t generation,
                          uint8_t* out, size_t cap, size_t& written);
};

} // namespace
