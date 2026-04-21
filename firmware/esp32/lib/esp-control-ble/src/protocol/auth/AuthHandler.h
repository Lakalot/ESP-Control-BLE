#pragma once
#include "../core/Protocol.h"

class AuthHandler {
public:
  void setPin(const char* pin);
  void generateChallenge(uint8_t* nonceOut);
  bool verifyResponse(const uint8_t* response, uint8_t len);
  bool isAuthenticated() const { return _authenticated; }
  void reset() { _authenticated = false; }

private:
  uint8_t     _nonce[ECB_NONCE_SIZE];
  const char* _pin = nullptr;
  bool        _authenticated = false;
  void computeExpectedHash(uint8_t* hashOut);
};
