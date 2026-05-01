#include <unity.h>
#include <pb_encode.h>
#include <string.h>

#include "nanopb/manifest.pb.h"
#include "transport/frame/DataFrameCodec.h"

using ecb::DataFrameCodec;
using ecb::FrameHeader;
using ecb::FrameKind;

void setUp() {}
void tearDown() {}

static size_t encode_frame(FrameKind kind, const uint8_t* body, size_t bodyLen, uint8_t* out, size_t cap) {
  FrameHeader header{kind, 0x00, static_cast<uint16_t>(bodyLen)};
  const size_t headerLen = DataFrameCodec::encodeHeader(header, out, cap);
  TEST_ASSERT_EQUAL(DataFrameCodec::kHeaderSize, headerLen);
  TEST_ASSERT_TRUE(cap >= headerLen + bodyLen);
  memcpy(out + headerLen, body, bodyLen);
  return headerLen + bodyLen;
}

static size_t encode_invoke_action(const esp_control_InvokeAction& msg, uint8_t* out, size_t cap) {
  pb_ostream_t stream = pb_ostream_from_buffer(out, cap);
  TEST_ASSERT_TRUE(pb_encode(&stream, esp_control_InvokeAction_fields, &msg));
  return stream.bytes_written;
}

static size_t encode_invoke_result(const esp_control_InvokeResult& msg, uint8_t* out, size_t cap) {
  pb_ostream_t stream = pb_ostream_from_buffer(out, cap);
  TEST_ASSERT_TRUE(pb_encode(&stream, esp_control_InvokeResult_fields, &msg));
  return stream.bytes_written;
}

static void test_manifest_chunk_180_byte_body_frame_matches_v5_wire_format() {
  uint8_t body[180] = {0};
  for (size_t i = 0; i < sizeof(body); ++i) {
    body[i] = static_cast<uint8_t>(i);
  }

  uint8_t frame[184] = {0};
  const size_t written = encode_frame(FrameKind::ManifestChunk, body, sizeof(body), frame, sizeof(frame));

  const uint8_t expected[] = {
    0x01, 0x00, 0x00, 0xB4,
    0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
    0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F,
    0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17,
    0x18, 0x19, 0x1A, 0x1B, 0x1C, 0x1D, 0x1E, 0x1F,
    0x20, 0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27,
    0x28, 0x29, 0x2A, 0x2B, 0x2C, 0x2D, 0x2E, 0x2F,
    0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37,
    0x38, 0x39, 0x3A, 0x3B, 0x3C, 0x3D, 0x3E, 0x3F,
    0x40, 0x41, 0x42, 0x43, 0x44, 0x45, 0x46, 0x47,
    0x48, 0x49, 0x4A, 0x4B, 0x4C, 0x4D, 0x4E, 0x4F,
    0x50, 0x51, 0x52, 0x53, 0x54, 0x55, 0x56, 0x57,
    0x58, 0x59, 0x5A, 0x5B, 0x5C, 0x5D, 0x5E, 0x5F,
    0x60, 0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67,
    0x68, 0x69, 0x6A, 0x6B, 0x6C, 0x6D, 0x6E, 0x6F,
    0x70, 0x71, 0x72, 0x73, 0x74, 0x75, 0x76, 0x77,
    0x78, 0x79, 0x7A, 0x7B, 0x7C, 0x7D, 0x7E, 0x7F,
    0x80, 0x81, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87,
    0x88, 0x89, 0x8A, 0x8B, 0x8C, 0x8D, 0x8E, 0x8F,
    0x90, 0x91, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97,
    0x98, 0x99, 0x9A, 0x9B, 0x9C, 0x9D, 0x9E, 0x9F,
    0xA0, 0xA1, 0xA2, 0xA3, 0xA4, 0xA5, 0xA6, 0xA7,
    0xA8, 0xA9, 0xAA, 0xAB, 0xAC, 0xAD, 0xAE, 0xAF,
    0xB0, 0xB1, 0xB2, 0xB3,
  };
  TEST_ASSERT_EQUAL(sizeof(expected), written);
  TEST_ASSERT_EQUAL_MEMORY(expected, frame, sizeof(expected));
}

static void test_invoke_action_without_payload_frame_matches_v5_wire_format() {
  esp_control_InvokeAction msg = esp_control_InvokeAction_init_zero;
  msg.action_id = 42;
  msg.correlation_id = 7;

  uint8_t body[32] = {0};
  const size_t bodyLen = encode_invoke_action(msg, body, sizeof(body));
  uint8_t frame[36] = {0};
  const size_t written = encode_frame(FrameKind::InvokeAction, body, bodyLen, frame, sizeof(frame));

  const uint8_t expected[] = {0x20, 0x00, 0x00, 0x04, 0x08, 0x2A, 0x18, 0x07};
  TEST_ASSERT_EQUAL(sizeof(expected), written);
  TEST_ASSERT_EQUAL_MEMORY(expected, frame, sizeof(expected));
}

static void test_invoke_action_with_uint_payload_frame_matches_v5_wire_format() {
  esp_control_InvokeAction msg = esp_control_InvokeAction_init_zero;
  msg.action_id = 42;
  msg.has_payload = true;
  msg.payload.which_kind = esp_control_CommonValue_uint_value_tag;
  msg.payload.kind.uint_value = 50;
  msg.correlation_id = 7;

  uint8_t body[32] = {0};
  const size_t bodyLen = encode_invoke_action(msg, body, sizeof(body));
  uint8_t frame[36] = {0};
  const size_t written = encode_frame(FrameKind::InvokeAction, body, bodyLen, frame, sizeof(frame));

  const uint8_t expected[] = {
    0x20, 0x00, 0x00, 0x08, 0x08, 0x2A, 0x12, 0x02,
    0x18, 0x32, 0x18, 0x07,
  };
  TEST_ASSERT_EQUAL(sizeof(expected), written);
  TEST_ASSERT_EQUAL_MEMORY(expected, frame, sizeof(expected));
}

static void test_invoke_result_ok_frame_matches_v5_wire_format() {
  esp_control_InvokeResult msg = esp_control_InvokeResult_init_zero;
  msg.correlation_id = 7;
  msg.status = esp_control_Status_STATUS_OK;

  uint8_t body[32] = {0};
  const size_t bodyLen = encode_invoke_result(msg, body, sizeof(body));
  uint8_t frame[36] = {0};
  const size_t written = encode_frame(FrameKind::InvokeResult, body, bodyLen, frame, sizeof(frame));

  const uint8_t expected[] = {0x21, 0x00, 0x00, 0x04, 0x08, 0x07, 0x10, 0x01};
  TEST_ASSERT_EQUAL(sizeof(expected), written);
  TEST_ASSERT_EQUAL_MEMORY(expected, frame, sizeof(expected));
}

int main(int, char**) {
  UNITY_BEGIN();
  RUN_TEST(test_manifest_chunk_180_byte_body_frame_matches_v5_wire_format);
  RUN_TEST(test_invoke_action_without_payload_frame_matches_v5_wire_format);
  RUN_TEST(test_invoke_action_with_uint_payload_frame_matches_v5_wire_format);
  RUN_TEST(test_invoke_result_ok_frame_matches_v5_wire_format);
  return UNITY_END();
}
