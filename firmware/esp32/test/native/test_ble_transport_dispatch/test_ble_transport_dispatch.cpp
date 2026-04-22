#include <unity.h>
#include <pb_decode.h>
#include <string.h>
#include "transport/ble/DataBleTransport.h"
#include "transport/frame/DataFrameCodec.h"
#include "protocol/core/Protocol.h"
#include "protocol/actions/ActionRegistry.h"
#include "protocol/subscriptions/SubscriptionState.h"
#include "protocol/resources/ResourceTable.h"
#include "protocol/manifest/ManifestStore.h"
#include "nanopb/manifest.pb.h"

using namespace ecb;

void setUp() {}
void tearDown() {}

static size_t g_sentFrames;
static uint8_t g_lastFrameKind;
static uint8_t g_lastFrame[DataFrameCodec::kHeaderSize + kMaxFrameBody];
static size_t g_lastFrameLen;

static void fakeSender(void*, const uint8_t* frame, size_t len) {
  g_sentFrames += 1;
  g_lastFrameLen = len > sizeof(g_lastFrame) ? sizeof(g_lastFrame) : len;
  if (g_lastFrameLen > 0) memcpy(g_lastFrame, frame, g_lastFrameLen);
  if (len > 0) g_lastFrameKind = frame[0];
}

static uint32_t decodeDeltaResourceId(const uint8_t* frame, size_t len) {
  FrameHeader header{};
  TEST_ASSERT_TRUE(DataFrameCodec::decodeHeader(frame, len, header));
  TEST_ASSERT_EQUAL_UINT8(static_cast<uint8_t>(FrameKind::Delta), static_cast<uint8_t>(header.kind));

  esp_control_ResourceDelta delta = esp_control_ResourceDelta_init_zero;
  pb_istream_t stream = pb_istream_from_buffer(frame + DataFrameCodec::kHeaderSize, header.length);
  TEST_ASSERT_TRUE(pb_decode(&stream, esp_control_ResourceDelta_fields, &delta));
  return delta.resource_id;
}

static void test_dispatch_subscribe_marks_subscription() {
  g_sentFrames = 0;
  g_lastFrameLen = 0;
  uint8_t manifest[4] = {1, 2, 3, 4};
  ManifestStore store(manifest, sizeof(manifest));
  ResourceTable table;
  SubscriptionState subs;
  ActionRegistry reg;
  DataBleTransport transport(store, table, subs, reg, FrameSender{nullptr, fakeSender});
  uint8_t body[8] = {0x08, 0x0A};  // varint field 1 (resource_ids) value 10
  transport.handleFrame(FrameKind::Subscribe, body, sizeof(body));
  TEST_ASSERT_TRUE(subs.isWatching(10));
}

static void test_dispatch_ping_emits_pong() {
  g_sentFrames = 0;
  g_lastFrameKind = 0;
  g_lastFrameLen = 0;
  uint8_t manifest[4] = {1, 2, 3, 4};
  ManifestStore store(manifest, sizeof(manifest));
  ResourceTable table;
  SubscriptionState subs;
  ActionRegistry reg;
  DataBleTransport transport(store, table, subs, reg, FrameSender{nullptr, fakeSender});
  transport.handleFrame(FrameKind::Ping, nullptr, 0);
  TEST_ASSERT_EQUAL(1u, g_sentFrames);
  TEST_ASSERT_EQUAL(static_cast<uint8_t>(FrameKind::Pong), g_lastFrameKind);
}

static void test_send_delta_preserves_full_resource_id() {
  g_sentFrames = 0;
  g_lastFrameKind = 0;
  g_lastFrameLen = 0;

  uint8_t manifest[4] = {1, 2, 3, 4};
  ManifestStore store(manifest, sizeof(manifest));
  ResourceTable table;
  table.setUint(1, 11);
  table.setUint(65, 65);
  SubscriptionState subs;
  subs.add(65);
  ActionRegistry reg;
  DataBleTransport transport(store, table, subs, reg, FrameSender{nullptr, fakeSender});

  transport.sendDelta(65);
  transport.tick();

  TEST_ASSERT_EQUAL_UINT32(1u, g_sentFrames);
  TEST_ASSERT_EQUAL_UINT8(static_cast<uint8_t>(FrameKind::Delta), g_lastFrameKind);
  TEST_ASSERT_EQUAL_UINT32(65u, decodeDeltaResourceId(g_lastFrame, g_lastFrameLen));
}

static void test_send_manifest_is_chunked_across_ticks_and_finishes_with_eof() {
  g_sentFrames = 0;
  g_lastFrameKind = 0;
  g_lastFrameLen = 0;

  uint8_t manifest[400] = {};
  for (size_t i = 0; i < sizeof(manifest); ++i) manifest[i] = static_cast<uint8_t>(i & 0xFF);

  ManifestStore store(manifest, sizeof(manifest));
  ResourceTable table;
  SubscriptionState subs;
  ActionRegistry reg;
  DataBleTransport transport(store, table, subs, reg, FrameSender{nullptr, fakeSender});

  transport.sendManifest();
  TEST_ASSERT_EQUAL_UINT32(0u, g_sentFrames);

  transport.tick();
  TEST_ASSERT_EQUAL_UINT32(1u, g_sentFrames);
  TEST_ASSERT_EQUAL_UINT8(static_cast<uint8_t>(FrameKind::ManifestChunk), g_lastFrameKind);

  transport.tick();
  TEST_ASSERT_EQUAL_UINT32(2u, g_sentFrames);
  TEST_ASSERT_EQUAL_UINT8(static_cast<uint8_t>(FrameKind::ManifestChunk), g_lastFrameKind);

  transport.tick();
  TEST_ASSERT_EQUAL_UINT32(3u, g_sentFrames);
  TEST_ASSERT_EQUAL_UINT8(static_cast<uint8_t>(FrameKind::ManifestChunk), g_lastFrameKind);

  transport.tick();
  TEST_ASSERT_EQUAL_UINT32(4u, g_sentFrames);
  TEST_ASSERT_EQUAL_UINT8(static_cast<uint8_t>(FrameKind::ManifestEof), g_lastFrameKind);
}

int main(int, char**) {
  UNITY_BEGIN();
  RUN_TEST(test_dispatch_subscribe_marks_subscription);
  RUN_TEST(test_dispatch_ping_emits_pong);
  RUN_TEST(test_send_delta_preserves_full_resource_id);
  RUN_TEST(test_send_manifest_is_chunked_across_ticks_and_finishes_with_eof);
  return UNITY_END();
}
