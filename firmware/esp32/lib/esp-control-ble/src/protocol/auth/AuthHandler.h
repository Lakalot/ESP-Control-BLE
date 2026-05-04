#pragma once
#include "../core/Protocol.h"

namespace ecb { enum class AuthResult : uint8_t { Ok, BadFrame, BadHash }; }

class AuthHandler {
public:
  void setPin(const char* pin);
  void generateChallenge(uint8_t* nonceOut);
  ecb::AuthResult tryVerifyResponse(const uint8_t* response, uint8_t len);
  bool verifyResponse(const uint8_t* response, uint8_t len) {
    return tryVerifyResponse(response, len) == ecb::AuthResult::Ok;
  }
  bool isAuthenticated() const { return _authenticated; }
  void reset() { _authenticated = false; }

private:
  uint8_t     _nonce[ECB_NONCE_SIZE];
  const char* _pin = nullptr;
  bool        _authenticated = false;
  void computeExpectedHash(uint8_t* hashOut);
};
