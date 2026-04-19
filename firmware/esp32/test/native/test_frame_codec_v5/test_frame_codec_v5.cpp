#include <unity.h>
#include <string.h>
#include "transport/FrameCodecV5.h"

using ecb::v5::FrameCodec;
using ecb::v5::FrameHeader;
using ecb::v5::FrameKind;

void setUp() {}
void tearDown() {}

static void test_encode_header_puts_kind_flags_length_in_network_order() {
  uint8_t out[8] = {0};
  FrameHeader h{FrameKind::InvokeAction, 0x00, 0x0102};
  size_t written = FrameCodec::encodeHeader(h, out, sizeof(out));
  TEST_ASSERT_EQUAL(4u, written);
  TEST_ASSERT_EQUAL(0x20, out[0]);  // InvokeAction
  TEST_ASSERT_EQUAL(0x00, out[1]);
  TEST_ASSERT_EQUAL(0x01, out[2]);  // length high byte
  TEST_ASSERT_EQUAL(0x02, out[3]);  // length low byte
}

static void test_decode_header_round_trips() {
  uint8_t buf[4] = {0x10, 0x01, 0x00, 0x08};
  FrameHeader h{};
  TEST_ASSERT_TRUE(FrameCodec::decodeHeader(buf, sizeof(buf), h));
  TEST_ASSERT_EQUAL(static_cast<uint8_t>(FrameKind::Snapshot), static_cast<uint8_t>(h.kind));
  TEST_ASSERT_EQUAL(0x01, h.flags);
  TEST_ASSERT_EQUAL(0x0008, h.length);
}

static void test_decode_rejects_short_buffer() {
  uint8_t buf[3] = {0x10, 0x00, 0x00};
  FrameHeader h{};
  TEST_ASSERT_FALSE(FrameCodec::decodeHeader(buf, sizeof(buf), h));
}

int main(int, char**) {
  UNITY_BEGIN();
  RUN_TEST(test_encode_header_puts_kind_flags_length_in_network_order);
  RUN_TEST(test_decode_header_round_trips);
  RUN_TEST(test_decode_rejects_short_buffer);
  return UNITY_END();
}
