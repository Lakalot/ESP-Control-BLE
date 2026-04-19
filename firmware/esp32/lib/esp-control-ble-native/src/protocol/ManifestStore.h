#pragma once
#include <stddef.h>
#include <stdint.h>

namespace ecb { namespace v5 {

class ManifestStore {
public:
  ManifestStore(const uint8_t* data, size_t length);
  const uint8_t* bytes() const { return _data; }
  size_t length() const { return _length; }
  uint32_t crc32() const;
private:
  const uint8_t* _data;
  size_t _length;
  mutable uint32_t _cachedCrc;
  mutable bool _crcValid;
};

}} // namespace
