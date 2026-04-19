#include <unity.h>
#include "transport/BleTransportV5.h"
#include "transport/FrameCodecV5.h"
#include "protocol/ProtocolV5.h"
#include "protocol/ActionRegistryV5.h"
#include "protocol/SubscriptionState.h"
#include "protocol/ResourceTable.h"
#include "protocol/ManifestStore.h"

using namespace ecb::v5;

void setUp() {}
void tearDown() {}

static size_t g_sentFrames;
static uint8_t g_lastFrameKind;

static void fakeSender(const uint8_t* frame, size_t len) {
  (void)frame; (void)len;
  g_sentFrames += 1;
  if (len > 0) g_lastFrameKind = frame[0];
}

static void test_dispatch_subscribe_marks_subscription() {
  g_sentFrames = 0;
  uint8_t manifest[4] = {1, 2, 3, 4};
  ManifestStore store(manifest, sizeof(manifest));
  ResourceTable table;
  SubscriptionState subs;
  ActionRegistry reg;
  BleTransportV5 transport(store, table, subs, reg, fakeSender);
  uint8_t body[8] = {0x08, 0x0A};  // varint field 1 (resource_ids) value 10
  transport.handleFrame(FrameKind::Subscribe, body, sizeof(body));
  TEST_ASSERT_TRUE(subs.isWatching(10));
}

static void test_dispatch_ping_emits_pong() {
  g_sentFrames = 0;
  g_lastFrameKind = 0;
  uint8_t manifest[4] = {1, 2, 3, 4};
  ManifestStore store(manifest, sizeof(manifest));
  ResourceTable table;
  SubscriptionState subs;
  ActionRegistry reg;
  BleTransportV5 transport(store, table, subs, reg, fakeSender);
  transport.handleFrame(FrameKind::Ping, nullptr, 0);
  TEST_ASSERT_EQUAL(1u, g_sentFrames);
  TEST_ASSERT_EQUAL(static_cast<uint8_t>(FrameKind::Pong), g_lastFrameKind);
}

int main(int, char**) {
  UNITY_BEGIN();
  RUN_TEST(test_dispatch_subscribe_marks_subscription);
  RUN_TEST(test_dispatch_ping_emits_pong);
  return UNITY_END();
}
