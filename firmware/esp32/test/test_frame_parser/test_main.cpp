#include <unity.h>
#include <string.h>
#include "transport/frame/FrameCodec.h"

// Helper: build a valid frame with XOR checksum
// Frame layout: [cmdId][payloadLen][payload...][hmac x4][xorChecksum]
static void buildFrame(uint8_t* buf, uint16_t* outLen,
                       uint8_t cmdId, const uint8_t* payload, uint8_t payloadLen,
                       const uint8_t hmac[4]) {
  uint16_t i = 0;
  buf[i++] = cmdId;
  buf[i++] = payloadLen;
  for (uint8_t j = 0; j < payloadLen; j++) buf[i++] = payload[j];
  for (uint8_t j = 0; j < 4; j++) buf[i++] = hmac[j];
  // XOR checksum over everything before this byte
  uint8_t xorVal = 0;
  for (uint16_t j = 0; j < i; j++) xorVal ^= buf[j];
  buf[i++] = xorVal;
  *outLen = i;
}

void setUp(void) {}
void tearDown(void) {}

void test_valid_frame_no_payload(void) {
  uint8_t buf[32];
  uint16_t len;
  uint8_t hmac[4] = {0xAA, 0xBB, 0xCC, 0xDD};
  buildFrame(buf, &len, 0x01, NULL, 0, hmac);

  ParsedFrame f = ecbParseFrame(buf, len);
  TEST_ASSERT_TRUE(f.valid);
  TEST_ASSERT_EQUAL_UINT8(0x01, f.cmdId);
  TEST_ASSERT_EQUAL_UINT8(0, f.length);
  TEST_ASSERT_EQUAL_UINT8_ARRAY(hmac, f.hmac, 4);
}

void test_valid_frame_with_payload(void) {
  uint8_t buf[32];
  uint16_t len;
  uint8_t payload[2] = {0x00, 0x64};
  uint8_t hmac[4] = {0x11, 0x22, 0x33, 0x44};
  buildFrame(buf, &len, 0x02, payload, 2, hmac);

  ParsedFrame f = ecbParseFrame(buf, len);
  TEST_ASSERT_TRUE(f.valid);
  TEST_ASSERT_EQUAL_UINT8(0x02, f.cmdId);
  TEST_ASSERT_EQUAL_UINT8(2, f.length);
  TEST_ASSERT_EQUAL_UINT8(0x00, f.payload[0]);
  TEST_ASSERT_EQUAL_UINT8(0x64, f.payload[1]);
}

void test_too_short(void) {
  uint8_t buf[3] = {0x01, 0x00, 0x00};
  ParsedFrame f = ecbParseFrame(buf, 3);
  TEST_ASSERT_FALSE(f.valid);
}

void test_bad_checksum(void) {
  uint8_t buf[32];
  uint16_t len;
  uint8_t hmac[4] = {0xAA, 0xBB, 0xCC, 0xDD};
  buildFrame(buf, &len, 0x01, NULL, 0, hmac);
  buf[len - 1] ^= 0xFF; // corrupt checksum

  ParsedFrame f = ecbParseFrame(buf, len);
  TEST_ASSERT_FALSE(f.valid);
}

void test_truncated_frame(void) {
  uint8_t buf[32];
  uint16_t len;
  uint8_t payload[4] = {0x01, 0x02, 0x03, 0x04};
  uint8_t hmac[4] = {0x11, 0x22, 0x33, 0x44};
  buildFrame(buf, &len, 0x05, payload, 4, hmac);

  ParsedFrame f = ecbParseFrame(buf, len - 3);
  TEST_ASSERT_FALSE(f.valid);
}

void test_payload_exceeds_max(void) {
  uint8_t buf[128];
  buf[0] = 0x01;  // cmdId
  buf[1] = 65;    // payload length > ECB_MAX_PAYLOAD (64)
  ParsedFrame f = ecbParseFrame(buf, 128);
  TEST_ASSERT_FALSE(f.valid);
}

int main(int argc, char** argv) {
  UNITY_BEGIN();
  RUN_TEST(test_valid_frame_no_payload);
  RUN_TEST(test_valid_frame_with_payload);
  RUN_TEST(test_too_short);
  RUN_TEST(test_bad_checksum);
  RUN_TEST(test_truncated_frame);
  RUN_TEST(test_payload_exceeds_max);
  return UNITY_END();
}
