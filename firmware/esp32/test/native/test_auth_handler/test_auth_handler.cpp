#define private public
#include "protocol/auth/AuthHandler.h"
#undef private

#include <unity.h>

void setUp() {}
void tearDown() {}

static void test_verify_response_accepts_sha256_pin_plus_nonce_prefix() {
  AuthHandler auth;
  auth.setPin("1234");
  auth._nonce[0] = 0x01;
  auth._nonce[1] = 0x02;
  auth._nonce[2] = 0x03;
  auth._nonce[3] = 0x04;

  const uint8_t response[] = {ECB_AUTH_OK, 0x65, 0xC6, 0x65, 0xFD};

  TEST_ASSERT_EQUAL(ecb::AuthResult::Ok, auth.tryVerifyResponse(response, sizeof(response)));
  TEST_ASSERT_TRUE(auth.isAuthenticated());
}

int main(int, char**) {
  UNITY_BEGIN();
  RUN_TEST(test_verify_response_accepts_sha256_pin_plus_nonce_prefix);
  return UNITY_END();
}
