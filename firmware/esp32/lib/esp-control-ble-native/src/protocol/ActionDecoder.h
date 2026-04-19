#pragma once
#include <stddef.h>
#include <stdint.h>
#include "ActionRegistryV5.h"

namespace ecb { namespace v5 {

class ActionDecoder {
public:
  static bool dispatch(const ActionRegistry& reg,
                       const uint8_t* in, size_t inLen,
                       uint8_t* out, size_t outCap, size_t& outLen);
};

}} // namespace
