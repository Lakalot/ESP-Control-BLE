#pragma once
#include "../core/Protocol.h"

class AuthHandler {
public:
  void setPin(const char* pin);

  // Fill nonceOut (ECB_NONCE_SIZE bytes) with a fresh random challenge and
  // clear the authenticated flag.
  void generateChallenge(uint8_t* nonceOut);

  // Compute SHA-256(pin || nonce) truncated to ECB_HASH_SIZE into hashOut.
  void computeHash(uint8_t* hashOut);

  // Constant-time compare of response (ECB_HASH_SIZE bytes) against the
  // expected hash; sets and returns the authenticated flag.
  bool verifyHash(const uint8_t* response);

  bool isAuthenticated() const { return _authenticated; }
  void reset() { _authenticated = false; }

private:
  uint8_t     _nonce[ECB_NONCE_SIZE];
  const char* _pin = nullptr;
  bool        _authenticated = false;
};
