#pragma once
#include <stddef.h>
#include <stdint.h>
#include "ResourceTable.h"

namespace ecb { namespace v5 {

class SnapshotEncoder {
public:
  static bool encode(const ResourceTable& table, uint8_t* out, size_t cap, size_t& written);
  static bool encodeDelta(const ResourceValue& value, uint32_t generation,
                          uint8_t* out, size_t cap, size_t& written);
};

}} // namespace
