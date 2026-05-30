#pragma once
#include <cstddef>
#include <cstdint>
namespace ecb {
inline void writeU16BE(uint16_t v, uint8_t* out) {
  out[0] = static_cast<uint8_t>((v >> 8) & 0xFF);
  out[1] = static_cast<uint8_t>(v & 0xFF);
}
inline void writeU32BE(uint32_t v, uint8_t* out) {
  out[0] = static_cast<uint8_t>((v >> 24) & 0xFF);
  out[1] = static_cast<uint8_t>((v >> 16) & 0xFF);
  out[2] = static_cast<uint8_t>((v >> 8) & 0xFF);
  out[3] = static_cast<uint8_t>(v & 0xFF);
}
} // namespace ecb
