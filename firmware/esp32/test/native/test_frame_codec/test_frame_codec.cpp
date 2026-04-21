#include <unity.h>
#include <string.h>
#include "protocol/core/Protocol.h"
#include "transport/frame/DataFrameCodec.h"

using ecb::DataFrameCodec;
using ecb::FrameHeader;
using ecb::FrameKind;

void setUp() {}
void tearDown() {}

static void test_protocol_header_exposes_data_frame_surface() {
  FrameHeader h{FrameKind::Ping, 0xAA, 0x1234};
  TEST_ASSERT_EQUAL(4u, ecb::kFrameHeaderSize);
  TEST_ASSERT_EQUAL_UINT8(static_cast<uint8_t>(FrameKind::Ping), static_cast<uint8_t>(h.kind));
  TEST_ASSERT_EQUAL_UINT8(0xAA, h.flags);
  TEST_ASSERT_EQUAL_UINT16(0x1234, h.length);
}

static void test_encode_header_puts_kind_flags_length_in_network_order() {
  uint8_t out[8] = {0};
  FrameHeader h{FrameKind::InvokeAction, 0x00, 0x0102};
  size_t written = DataFrameCodec::encodeHeader(h, out, sizeof(out));
  TEST_ASSERT_EQUAL(4u, written);
  TEST_ASSERT_EQUAL(0x20, out[0]);  // InvokeAction
  TEST_ASSERT_EQUAL(0x00, out[1]);
  TEST_ASSERT_EQUAL(0x01, out[2]);  // length high byte
  TEST_ASSERT_EQUAL(0x02, out[3]);  // length low byte
}

static void test_decode_header_round_trips() {
  uint8_t buf[4] = {0x10, 0x01, 0x00, 0x08};
  FrameHeader h{};
  TEST_ASSERT_TRUE(DataFrameCodec::decodeHeader(buf, sizeof(buf), h));
  TEST_ASSERT_EQUAL(static_cast<uint8_t>(FrameKind::Snapshot), static_cast<uint8_t>(h.kind));
  TEST_ASSERT_EQUAL(0x01, h.flags);
  TEST_ASSERT_EQUAL(0x0008, h.length);
}

static void test_decode_rejects_short_buffer() {
  uint8_t buf[3] = {0x10, 0x00, 0x00};
  FrameHeader h{};
  TEST_ASSERT_FALSE(DataFrameCodec::decodeHeader(buf, sizeof(buf), h));
}

int main(int, char**) {
  UNITY_BEGIN();
  RUN_TEST(test_protocol_header_exposes_data_frame_surface);
  RUN_TEST(test_encode_header_puts_kind_flags_length_in_network_order);
  RUN_TEST(test_decode_header_round_trips);
  RUN_TEST(test_decode_rejects_short_buffer);
  return UNITY_END();
}
