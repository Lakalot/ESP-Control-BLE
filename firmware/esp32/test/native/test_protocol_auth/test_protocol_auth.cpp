#include <unity.h>
#include <string.h>
#include "transport/ble/DataBleTransport.h"
#include "transport/frame/DataFrameCodec.h"
#include "protocol/core/Protocol.h"
#include "protocol/actions/ActionRegistry.h"
#include "protocol/subscriptions/SubscriptionState.h"
#include "protocol/resources/ResourceTable.h"
#include "protocol/manifest/ManifestStore.h"
#include "protocol/auth/AuthHandler.h"

using namespace ecb;

void setUp() {}
void tearDown() {}

static uint8_t g_last[256]; static size_t g_lastLen; static size_t g_count;
static void sender(void*, const uint8_t* f, size_t n) {
  g_count++; g_lastLen = n > sizeof(g_last) ? sizeof(g_last) : n;
  memcpy(g_last, f, g_lastLen);
}

static FrameKind lastKind() { return (FrameKind)g_last[0]; }

static ProtocolEngine* makeEngine(AuthHandler& auth, ResourceTable& table,
                                   SubscriptionState& subs, ActionRegistry& reg,
                                   ManifestStore& store) {
  auth.setPin("1234");
  static ProtocolEngine* e = nullptr;
  e = new ProtocolEngine(store, table, subs, reg, auth, FrameSender{nullptr, sender});
  return e;
}

static void test_frame_rejected_before_auth() {
  g_count = 0;
  uint8_t man[4] = {1,2,3,4}; ManifestStore store(man, 4);
  ResourceTable table; SubscriptionState subs; ActionRegistry reg; AuthHandler auth;
  ProtocolEngine* e = makeEngine(auth, table, subs, reg, store);
  // Subscribe before auth must NOT register a subscription.
  uint8_t body[2] = {0x08, 0x0A};
  e->handleFrame(FrameKind::Subscribe, body, sizeof(body));
  TEST_ASSERT_FALSE(subs.isWatching(10));
}

static void test_auth_handshake_succeeds() {
  g_count = 0;
  uint8_t man[4] = {1,2,3,4}; ManifestStore store(man, 4);
  ResourceTable table; SubscriptionState subs; ActionRegistry reg; AuthHandler auth;
  ProtocolEngine* e = makeEngine(auth, table, subs, reg, store);

  // 1) AuthRequest -> expect AuthChallenge with nonce body.
  e->handleFrame(FrameKind::AuthRequest, nullptr, 0);
  TEST_ASSERT_EQUAL_UINT8((uint8_t)FrameKind::AuthChallenge, (uint8_t)lastKind());
  uint8_t nonce[ECB_NONCE_SIZE];
  memcpy(nonce, g_last + DataFrameCodec::kHeaderSize, ECB_NONCE_SIZE);

  // 2) Compute the expected response the same way the client would.
  // Under UNIT_TEST generateChallenge fills nonce with 0xA5; recompute hash.
  uint8_t resp[ECB_HASH_SIZE];
  auth.computeHash(resp);  // uses the nonce just generated

  // 3) AuthResponse -> expect AuthResult OK.
  e->handleFrame(FrameKind::AuthResponse, resp, ECB_HASH_SIZE);
  TEST_ASSERT_EQUAL_UINT8((uint8_t)FrameKind::AuthResult, (uint8_t)lastKind());
  TEST_ASSERT_EQUAL_UINT8(0x01, g_last[DataFrameCodec::kHeaderSize]);

  // 4) Now a Subscribe is honored.
  uint8_t body[2] = {0x08, 0x0A};
  e->handleFrame(FrameKind::Subscribe, body, sizeof(body));
  TEST_ASSERT_TRUE(subs.isWatching(10));
}

static void test_manifest_sent_after_successful_auth() {
  g_count = 0;
  uint8_t man[8] = {1,2,3,4,5,6,7,8}; ManifestStore store(man, 8);
  ResourceTable table; SubscriptionState subs; ActionRegistry reg; AuthHandler auth;
  ProtocolEngine* e = makeEngine(auth, table, subs, reg, store);

  e->handleFrame(FrameKind::AuthRequest, nullptr, 0);   // -> AuthChallenge
  uint8_t resp[ECB_HASH_SIZE];
  auth.computeHash(resp);
  e->handleFrame(FrameKind::AuthResponse, resp, ECB_HASH_SIZE);  // -> AuthResult OK, queues manifest

  // Drain one tick: the queued manifest should now emit a ManifestChunk frame.
  g_count = 0;
  memset(g_last, 0, sizeof(g_last));
  e->tick();
  TEST_ASSERT_EQUAL_UINT8(static_cast<uint8_t>(FrameKind::ManifestChunk), static_cast<uint8_t>(lastKind()));
}

static void test_wrong_response_fails_and_stays_locked() {
  g_count = 0;
  uint8_t man[4] = {1,2,3,4}; ManifestStore store(man, 4);
  ResourceTable table; SubscriptionState subs; ActionRegistry reg; AuthHandler auth;
  ProtocolEngine* e = makeEngine(auth, table, subs, reg, store);
  e->handleFrame(FrameKind::AuthRequest, nullptr, 0);
  uint8_t bad[ECB_HASH_SIZE] = {0};
  e->handleFrame(FrameKind::AuthResponse, bad, ECB_HASH_SIZE);
  TEST_ASSERT_EQUAL_UINT8((uint8_t)FrameKind::AuthResult, (uint8_t)lastKind());
  TEST_ASSERT_EQUAL_UINT8(0x00, g_last[DataFrameCodec::kHeaderSize]);  // FAIL
  uint8_t body[2] = {0x08, 0x0A};
  e->handleFrame(FrameKind::Subscribe, body, sizeof(body));
  TEST_ASSERT_FALSE(subs.isWatching(10));
}

int main(int, char**) {
  UNITY_BEGIN();
  RUN_TEST(test_frame_rejected_before_auth);
  RUN_TEST(test_auth_handshake_succeeds);
  RUN_TEST(test_wrong_response_fails_and_stays_locked);
  RUN_TEST(test_manifest_sent_after_successful_auth);
  return UNITY_END();
}
