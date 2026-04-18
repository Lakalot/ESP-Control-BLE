#include "AuthHandler.h"
#include <Arduino.h>
#include <mbedtls/sha256.h>

AuthHandler authHandler;

void AuthHandler::generateChallenge(uint8_t* nonceOut) {
  _authenticated = false;
  for (int i = 0; i < 4; i++) {
    _nonce[i] = (uint8_t)(esp_random() & 0xFF);
  }
  memcpy(nonceOut, _nonce, 4);
  Serial.printf("[Auth] Challenge: %02X %02X %02X %02X\n",
    _nonce[0], _nonce[1], _nonce[2], _nonce[3]);
}

void AuthHandler::computeExpectedHash(uint8_t* hashOut) {
  const char* pin = DEVICE_PIN;
  size_t pinLen = strlen(pin);
  size_t totalLen = pinLen + 4;

  uint8_t* combined = (uint8_t*)malloc(totalLen);
  if (!combined) return;
  memcpy(combined, pin, pinLen);
  memcpy(combined + pinLen, _nonce, 4);

  uint8_t fullHash[32];
  mbedtls_sha256_context ctx;
  mbedtls_sha256_init(&ctx);
  mbedtls_sha256_starts(&ctx, 0);
  mbedtls_sha256_update(&ctx, combined, totalLen);
  mbedtls_sha256_finish(&ctx, fullHash);
  mbedtls_sha256_free(&ctx);

  free(combined);
  memcpy(hashOut, fullHash, 4);
}

bool AuthHandler::verifyResponse(const uint8_t* response, uint8_t len) {
  if (len < 5 || response[0] != AUTH_OK) {
    Serial.println("[Auth] Format invalide");
    _authenticated = false;
    return false;
  }

  uint8_t expected[4];
  computeExpectedHash(expected);

  if (memcmp(response + 1, expected, 4) == 0) {
    _authenticated = true;
    Serial.println("[Auth] OK");
    return true;
  }

  Serial.println("[Auth] Hash incorrect");
  _authenticated = false;
  return false;
}
