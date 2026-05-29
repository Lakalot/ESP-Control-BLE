#define private public
#include "protocol/auth/AuthHandler.h"
#undef private

#include <unity.h>
#include <string.h>

void setUp() {}
void tearDown() {}

// SHA-256("1234" || nonce[0x01..0x10]) truncated to 16 bytes, precomputed.
static const uint8_t kExpectedHash[16] = {
  0xBC, 0xB0, 0x85, 0x18, 0xD2, 0x96, 0x7E, 0x37,
  0x5F, 0x57, 0x3D, 0x7E, 0x3A, 0x64, 0x49, 0x74,
};

static void setNonce1to16(AuthHandler& auth) {
  for (int i = 0; i < ECB_NONCE_SIZE; ++i) auth._nonce[i] = (uint8_t)(i + 1);
}

static void test_compute_hash_matches_sha256_prefix() {
  AuthHandler auth;
  auth.setPin("1234");
  setNonce1to16(auth);
  uint8_t out[ECB_HASH_SIZE] = {0};
  auth.computeHash(out);
  TEST_ASSERT_EQUAL_UINT8_ARRAY(kExpectedHash, out, ECB_HASH_SIZE);
}

static void test_verify_hash_accepts_correct_response() {
  AuthHandler auth;
  auth.setPin("1234");
  setNonce1to16(auth);
  TEST_ASSERT_TRUE(auth.verifyHash(kExpectedHash));
  TEST_ASSERT_TRUE(auth.isAuthenticated());
}

static void test_verify_hash_rejects_wrong_response() {
  AuthHandler auth;
  auth.setPin("1234");
  setNonce1to16(auth);
  uint8_t wrong[ECB_HASH_SIZE];
  memcpy(wrong, kExpectedHash, ECB_HASH_SIZE);
  wrong[0] ^= 0xFF;
  TEST_ASSERT_FALSE(auth.verifyHash(wrong));
  TEST_ASSERT_FALSE(auth.isAuthenticated());
}

static void test_nonce_and_hash_are_16_bytes() {
  TEST_ASSERT_EQUAL_INT(16, ECB_NONCE_SIZE);
  TEST_ASSERT_EQUAL_INT(16, ECB_HASH_SIZE);
}

int main(int, char**) {
  UNITY_BEGIN();
  RUN_TEST(test_nonce_and_hash_are_16_bytes);
  RUN_TEST(test_compute_hash_matches_sha256_prefix);
  RUN_TEST(test_verify_hash_accepts_correct_response);
  RUN_TEST(test_verify_hash_rejects_wrong_response);
  return UNITY_END();
}
