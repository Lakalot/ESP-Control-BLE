#include "ManifestStore.h"

namespace ecb {

ManifestStore::ManifestStore(const uint8_t* data, size_t length)
  : _data(data), _length(length), _cachedCrc(0), _crcValid(false) {}

static uint32_t crc32_update(uint32_t crc, uint8_t byte) {
  crc ^= byte;
  for (int i = 0; i < 8; ++i) {
    uint32_t mask = -(int32_t)(crc & 1);
    crc = (crc >> 1) ^ (0xEDB88320u & mask);
  }
  return crc;
}

uint32_t ManifestStore::crc32() const {
  if (_crcValid) return _cachedCrc;
  uint32_t crc = 0xFFFFFFFFu;
  for (size_t i = 0; i < _length; ++i) crc = crc32_update(crc, _data[i]);
  _cachedCrc = ~crc;
  _crcValid = true;
  return _cachedCrc;
}

} // namespace
