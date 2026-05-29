#include <unity.h>
#include <string.h>
#include "transport/frame/FrameAccumulator.h"
#include "transport/frame/DataFrameCodec.h"
#include "protocol/core/Protocol.h"

using namespace ecb;

void setUp() {}
void tearDown() {}

struct Captured { FrameKind kind; uint8_t flags; uint8_t body[64]; size_t len; };
static Captured g_frames[8];
static size_t g_count;

static void sink(FrameKind kind, uint8_t flags, const uint8_t* body, size_t len, void*) {
  Captured& c = g_frames[g_count++];
  c.kind = kind; c.flags = flags; c.len = len;
  if (len) memcpy(c.body, body, len > 64 ? 64 : len);
}

// Helper: build a wire frame [kind][flags][lenHi][lenLo][body...]
static size_t makeFrame(uint8_t* out, FrameKind kind, const uint8_t* body, uint16_t len) {
  out[0] = (uint8_t)kind; out[1] = 0;
  out[2] = (uint8_t)((len >> 8) & 0xFF); out[3] = (uint8_t)(len & 0xFF);
  if (len) memcpy(out + 4, body, len);
  return 4u + len;
}

static void test_single_frame_in_one_chunk() {
  g_count = 0;
  FrameAccumulator acc(sink, nullptr);
  uint8_t wire[16]; const uint8_t body[3] = {0xAA, 0xBB, 0xCC};
  size_t n = makeFrame(wire, FrameKind::Ping, body, 3);
  acc.feed(wire, n);
  TEST_ASSERT_EQUAL_UINT32(1u, g_count);
  TEST_ASSERT_EQUAL_UINT8((uint8_t)FrameKind::Ping, (uint8_t)g_frames[0].kind);
  TEST_ASSERT_EQUAL_UINT32(3u, g_frames[0].len);
  TEST_ASSERT_EQUAL_UINT8(0xBB, g_frames[0].body[1]);
}

static void test_frame_split_across_chunks() {
  g_count = 0;
  FrameAccumulator acc(sink, nullptr);
  uint8_t wire[16]; const uint8_t body[3] = {0x01, 0x02, 0x03};
  size_t n = makeFrame(wire, FrameKind::InvokeAction, body, 3);
  acc.feed(wire, 1);        // partial header
  acc.feed(wire + 1, 2);    // rest of header
  TEST_ASSERT_EQUAL_UINT32(0u, g_count);  // not complete yet
  acc.feed(wire + 3, n - 3); // body
  TEST_ASSERT_EQUAL_UINT32(1u, g_count);
  TEST_ASSERT_EQUAL_UINT8((uint8_t)FrameKind::InvokeAction, (uint8_t)g_frames[0].kind);
}

static void test_two_frames_concatenated() {
  g_count = 0;
  FrameAccumulator acc(sink, nullptr);
  uint8_t wire[32]; const uint8_t b1[1] = {0x10}; const uint8_t b2[2] = {0x20, 0x21};
  size_t n1 = makeFrame(wire, FrameKind::Subscribe, b1, 1);
  size_t n2 = makeFrame(wire + n1, FrameKind::Unsubscribe, b2, 2);
  acc.feed(wire, n1 + n2);
  TEST_ASSERT_EQUAL_UINT32(2u, g_count);
  TEST_ASSERT_EQUAL_UINT8((uint8_t)FrameKind::Subscribe, (uint8_t)g_frames[0].kind);
  TEST_ASSERT_EQUAL_UINT8((uint8_t)FrameKind::Unsubscribe, (uint8_t)g_frames[1].kind);
}

static void test_resync_after_garbage_byte() {
  g_count = 0;
  FrameAccumulator acc(sink, nullptr);
  uint8_t wire[16]; const uint8_t body[1] = {0x55};
  // Leading garbage byte 0x99 (unknown kind) then a valid Ping frame.
  uint8_t stream[17]; stream[0] = 0x99;
  size_t n = makeFrame(wire, FrameKind::Ping, body, 1);
  memcpy(stream + 1, wire, n);
  acc.feed(stream, 1 + n);
  TEST_ASSERT_EQUAL_UINT32(1u, g_count);  // recovered the valid frame
  TEST_ASSERT_EQUAL_UINT8((uint8_t)FrameKind::Ping, (uint8_t)g_frames[0].kind);
}

static void test_oversized_length_is_dropped() {
  g_count = 0;
  FrameAccumulator acc(sink, nullptr);
  // kind=Ping, length=0xFFFF (> kMaxFrameBody) -> must not deliver, must not hang.
  uint8_t hdr[4] = {(uint8_t)FrameKind::Ping, 0, 0xFF, 0xFF};
  acc.feed(hdr, 4);
  uint8_t filler[64] = {0};
  acc.feed(filler, 64);
  TEST_ASSERT_EQUAL_UINT32(0u, g_count);
}

int main(int, char**) {
  UNITY_BEGIN();
  RUN_TEST(test_single_frame_in_one_chunk);
  RUN_TEST(test_frame_split_across_chunks);
  RUN_TEST(test_two_frames_concatenated);
  RUN_TEST(test_resync_after_garbage_byte);
  RUN_TEST(test_oversized_length_is_dropped);
  return UNITY_END();
}
