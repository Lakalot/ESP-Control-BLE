#include "AuthHandler.h"
#include <Arduino.h>
#include <mbedtls/sha256.h>
#include <string.h>

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
    Serial.printf("[ECB] Auth error: PIN too long (%u bytes)\n", (unsigned)pinLen);
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
