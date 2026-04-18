#pragma once
#include <stdint.h>

#define AUTH_CHALLENGE  0xF0
#define AUTH_OK         0xF1
#define AUTH_FAIL       0xF2

// PIN hardcodé pour le dev
#define DEVICE_PIN "1234"

class AuthHandler {
public:
  void generateChallenge(uint8_t* nonceOut);
  bool verifyResponse(const uint8_t* response, uint8_t len);
  bool isAuthenticated() const { return _authenticated; }
  void reset() { _authenticated = false; }

private:
  uint8_t _nonce[4];
  bool _authenticated = false;
  void computeExpectedHash(uint8_t* hashOut);
};

extern AuthHandler authHandler;
