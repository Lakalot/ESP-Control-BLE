#include "AuthHandler.h"

#ifdef UNIT_TEST

#include <stdint.h>
#include <string.h>

namespace {

inline uint32_t rotr(uint32_t value, uint32_t shift) {
  return (value >> shift) | (value << (32u - shift));
}

struct Sha256State {
  uint32_t h[8];
  uint8_t block[64];
  uint64_t bitLen;
  size_t blockLen;
};

constexpr uint32_t kSha256Table[64] = {
  0x428a2f98u, 0x71374491u, 0xb5c0fbcfu, 0xe9b5dba5u, 0x3956c25bu, 0x59f111f1u, 0x923f82a4u, 0xab1c5ed5u,
  0xd807aa98u, 0x12835b01u, 0x243185beu, 0x550c7dc3u, 0x72be5d74u, 0x80deb1feu, 0x9bdc06a7u, 0xc19bf174u,
  0xe49b69c1u, 0xefbe4786u, 0x0fc19dc6u, 0x240ca1ccu, 0x2de92c6fu, 0x4a7484aau, 0x5cb0a9dcu, 0x76f988dau,
  0x983e5152u, 0xa831c66du, 0xb00327c8u, 0xbf597fc7u, 0xc6e00bf3u, 0xd5a79147u, 0x06ca6351u, 0x14292967u,
  0x27b70a85u, 0x2e1b2138u, 0x4d2c6dfcu, 0x53380d13u, 0x650a7354u, 0x766a0abbu, 0x81c2c92eu, 0x92722c85u,
  0xa2bfe8a1u, 0xa81a664bu, 0xc24b8b70u, 0xc76c51a3u, 0xd192e819u, 0xd6990624u, 0xf40e3585u, 0x106aa070u,
  0x19a4c116u, 0x1e376c08u, 0x2748774cu, 0x34b0bcb5u, 0x391c0cb3u, 0x4ed8aa4au, 0x5b9cca4fu, 0x682e6ff3u,
  0x748f82eeu, 0x78a5636fu, 0x84c87814u, 0x8cc70208u, 0x90befffau, 0xa4506cebu, 0xbef9a3f7u, 0xc67178f2u,
};

void sha256Transform(Sha256State& state, const uint8_t block[64]) {
  uint32_t schedule[64] = {};
  for (size_t i = 0; i < 16; ++i) {
    const size_t j = i * 4;
    schedule[i] = (static_cast<uint32_t>(block[j]) << 24) |
                  (static_cast<uint32_t>(block[j + 1]) << 16) |
                  (static_cast<uint32_t>(block[j + 2]) << 8) |
                  static_cast<uint32_t>(block[j + 3]);
  }
  for (size_t i = 16; i < 64; ++i) {
    const uint32_t s0 = rotr(schedule[i - 15], 7) ^ rotr(schedule[i - 15], 18) ^ (schedule[i - 15] >> 3);
    const uint32_t s1 = rotr(schedule[i - 2], 17) ^ rotr(schedule[i - 2], 19) ^ (schedule[i - 2] >> 10);
    schedule[i] = schedule[i - 16] + s0 + schedule[i - 7] + s1;
  }

  uint32_t a = state.h[0];
  uint32_t b = state.h[1];
  uint32_t c = state.h[2];
  uint32_t d = state.h[3];
  uint32_t e = state.h[4];
  uint32_t f = state.h[5];
  uint32_t g = state.h[6];
  uint32_t h = state.h[7];

  for (size_t i = 0; i < 64; ++i) {
    const uint32_t sum1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
    const uint32_t ch = (e & f) ^ ((~e) & g);
    const uint32_t temp1 = h + sum1 + ch + kSha256Table[i] + schedule[i];
    const uint32_t sum0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
    const uint32_t maj = (a & b) ^ (a & c) ^ (b & c);
    const uint32_t temp2 = sum0 + maj;

    h = g;
    g = f;
    f = e;
    e = d + temp1;
    d = c;
    c = b;
    b = a;
    a = temp1 + temp2;
  }

  state.h[0] += a;
  state.h[1] += b;
  state.h[2] += c;
  state.h[3] += d;
  state.h[4] += e;
  state.h[5] += f;
  state.h[6] += g;
  state.h[7] += h;
}

void sha256Init(Sha256State& state) {
  state.h[0] = 0x6a09e667u;
  state.h[1] = 0xbb67ae85u;
  state.h[2] = 0x3c6ef372u;
  state.h[3] = 0xa54ff53au;
  state.h[4] = 0x510e527fu;
  state.h[5] = 0x9b05688cu;
  state.h[6] = 0x1f83d9abu;
  state.h[7] = 0x5be0cd19u;
  state.bitLen = 0;
  state.blockLen = 0;
}

void sha256Update(Sha256State& state, const uint8_t* data, size_t len) {
  for (size_t i = 0; i < len; ++i) {
    state.block[state.blockLen++] = data[i];
    if (state.blockLen == sizeof(state.block)) {
      sha256Transform(state, state.block);
      state.bitLen += 512;
      state.blockLen = 0;
    }
  }
}

void sha256Final(Sha256State& state, uint8_t hash[32]) {
  state.bitLen += static_cast<uint64_t>(state.blockLen) * 8u;
  state.block[state.blockLen++] = 0x80;

  if (state.blockLen > 56) {
    while (state.blockLen < 64) {
      state.block[state.blockLen++] = 0;
    }
    sha256Transform(state, state.block);
    state.blockLen = 0;
  }

  while (state.blockLen < 56) {
    state.block[state.blockLen++] = 0;
  }

  for (int i = 7; i >= 0; --i) {
    state.block[state.blockLen++] = static_cast<uint8_t>((state.bitLen >> (i * 8)) & 0xFFu);
  }
  sha256Transform(state, state.block);

  for (size_t i = 0; i < 8; ++i) {
    hash[i * 4] = static_cast<uint8_t>((state.h[i] >> 24) & 0xFFu);
    hash[i * 4 + 1] = static_cast<uint8_t>((state.h[i] >> 16) & 0xFFu);
    hash[i * 4 + 2] = static_cast<uint8_t>((state.h[i] >> 8) & 0xFFu);
    hash[i * 4 + 3] = static_cast<uint8_t>(state.h[i] & 0xFFu);
  }
}

} // namespace

void AuthHandler::setPin(const char* pin) {
  _pin = pin;
}

void AuthHandler::generateChallenge(uint8_t* nonceOut) {
  _authenticated = false;
  memset(_nonce, 0xA5, sizeof(_nonce));
  memcpy(nonceOut, _nonce, ECB_NONCE_SIZE);
}

void AuthHandler::computeExpectedHash(uint8_t* hashOut) {
  if (!_pin) { memset(hashOut, 0, ECB_HASH_SIZE); return; }
  const size_t pinLen = strlen(_pin);
  const size_t totalLen = pinLen + ECB_NONCE_SIZE;

  uint8_t combined[64];
  if (totalLen > sizeof(combined)) {
    memset(hashOut, 0, ECB_HASH_SIZE);
    return;
  }

  memcpy(combined, _pin, pinLen);
  memcpy(combined + pinLen, _nonce, ECB_NONCE_SIZE);

  Sha256State state{};
  uint8_t fullHash[32] = {0};
  sha256Init(state);
  sha256Update(state, combined, totalLen);
  sha256Final(state, fullHash);
  memcpy(hashOut, fullHash, ECB_HASH_SIZE);
}

bool AuthHandler::verifyResponse(const uint8_t* response, uint8_t len) {
  if (len < 1 + ECB_HASH_SIZE || response[0] != ECB_AUTH_OK) {
    _authenticated = false;
    return false;
  }

  uint8_t expected[ECB_HASH_SIZE];
  computeExpectedHash(expected);
  _authenticated = memcmp(response + 1, expected, ECB_HASH_SIZE) == 0;
  return _authenticated;
}

#else

#include <Arduino.h>
#include <mbedtls/sha256.h>
#include <string.h>
#include "../../support/EcbLogging.h"

void AuthHandler::setPin(const char* pin) {
  _pin = pin;
}

void AuthHandler::generateChallenge(uint8_t* nonceOut) {
  _authenticated = false;
  for (int i = 0; i < ECB_NONCE_SIZE; i++) {
    _nonce[i] = (uint8_t)(esp_random() & 0xFF);
  }
  memcpy(nonceOut, _nonce, ECB_NONCE_SIZE);
}

void AuthHandler::computeExpectedHash(uint8_t* hashOut) {
  if (!_pin) { memset(hashOut, 0, ECB_HASH_SIZE); return; }
  size_t pinLen = strlen(_pin);
  size_t totalLen = pinLen + ECB_NONCE_SIZE;

  uint8_t combined[64];
  if (totalLen > sizeof(combined)) {
    ECB_LOGF("[ECB] Auth error: PIN too long (%u bytes)\n", (unsigned)pinLen);
    memset(hashOut, 0, ECB_HASH_SIZE);
    return;
  }
  memcpy(combined, _pin, pinLen);
  memcpy(combined + pinLen, _nonce, ECB_NONCE_SIZE);

  uint8_t fullHash[32];
  mbedtls_sha256_context ctx;
  mbedtls_sha256_init(&ctx);
  mbedtls_sha256_starts(&ctx, 0);
  mbedtls_sha256_update(&ctx, combined, totalLen);
  mbedtls_sha256_finish(&ctx, fullHash);
  mbedtls_sha256_free(&ctx);

  memcpy(hashOut, fullHash, ECB_HASH_SIZE);
}

bool AuthHandler::verifyResponse(const uint8_t* response, uint8_t len) {
  if (len < 1 + ECB_HASH_SIZE || response[0] != ECB_AUTH_OK) {
    _authenticated = false;
    return false;
  }

  uint8_t expected[ECB_HASH_SIZE];
  computeExpectedHash(expected);

  if (memcmp(response + 1, expected, ECB_HASH_SIZE) == 0) {
    _authenticated = true;
    return true;
  }

  _authenticated = false;
  return false;
}

#endif
