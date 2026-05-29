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

// Sink for the frames the engine emits (AuthChallenge/AuthResult/etc.). These
// tests assert on SubscriptionState / session-acceptance, not frame counts, so
// the sink only has to keep the FrameSender non-null.
static void sink(void*, const uint8_t*, size_t) {}

using Session = ProtocolEngine::Session;

// Drives the in-band auth handshake to completion so subsequent protocol frames
// are honored. Mirrors test_protocol_auth / test_ble_transport_dispatch.
static void authenticate(ProtocolEngine& engine, AuthHandler& auth) {
  engine.handleFrame(FrameKind::AuthRequest, nullptr, 0);
  uint8_t resp[ECB_HASH_SIZE];
  auth.computeHash(resp);  // uses the nonce just generated
  engine.handleFrame(FrameKind::AuthResponse, resp, ECB_HASH_SIZE);
}

// beginSession is exclusive across transports but re-entrant for the same one.
static void test_begin_session_is_exclusive() {
  uint8_t man[4] = {1, 2, 3, 4};
  ManifestStore store(man, sizeof(man));
  ResourceTable table; SubscriptionState subs; ActionRegistry reg; AuthHandler auth;
  auth.setPin("1234");
  ProtocolEngine engine(store, table, subs, reg, auth, FrameSender{nullptr, sink});

  TEST_ASSERT_TRUE(engine.beginSession(Session::Ble));   // first claim wins
  TEST_ASSERT_FALSE(engine.beginSession(Session::Spp));  // other transport refused
  TEST_ASSERT_TRUE(engine.beginSession(Session::Ble));   // same transport may re-enter
}

// endSession on the owning transport releases the engine for the other one.
static void test_end_session_frees_for_other_transport() {
  uint8_t man[4] = {1, 2, 3, 4};
  ManifestStore store(man, sizeof(man));
  ResourceTable table; SubscriptionState subs; ActionRegistry reg; AuthHandler auth;
  auth.setPin("1234");
  ProtocolEngine engine(store, table, subs, reg, auth, FrameSender{nullptr, sink});

  TEST_ASSERT_TRUE(engine.beginSession(Session::Ble));
  TEST_ASSERT_FALSE(engine.beginSession(Session::Spp));  // still owned by Ble
  engine.endSession(Session::Ble);
  TEST_ASSERT_TRUE(engine.beginSession(Session::Spp));   // freed, Spp can take over
}

// endSession must reset auth: a Subscribe after teardown (without re-auth) is
// rejected, proving the next session starts unauthenticated.
static void test_end_session_resets_auth() {
  uint8_t man[4] = {1, 2, 3, 4};
  ManifestStore store(man, sizeof(man));
  ResourceTable table; SubscriptionState subs; ActionRegistry reg; AuthHandler auth;
  auth.setPin("1234");
  ProtocolEngine engine(store, table, subs, reg, auth, FrameSender{nullptr, sink});

  TEST_ASSERT_TRUE(engine.beginSession(Session::Ble));
  authenticate(engine, auth);

  // Authenticated: a Subscribe for id 10 is honored.
  uint8_t sub10[2] = {0x08, 0x0A};  // varint field 1 (resource_ids) = 10
  engine.handleFrame(FrameKind::Subscribe, sub10, sizeof(sub10));
  TEST_ASSERT_TRUE(subs.isWatching(10));

  // Tear the session down: this resets auth (and clears subs via reset()).
  engine.endSession(Session::Ble);
  TEST_ASSERT_FALSE(subs.isWatching(10));  // reset() cleared the prior subscription

  // A Subscribe for a different id WITHOUT re-auth must be rejected because
  // handleFrame gates non-auth frames on _auth.isAuthenticated(), which
  // endSession cleared.
  uint8_t sub11[2] = {0x08, 0x0B};  // varint field 1 (resource_ids) = 11
  engine.handleFrame(FrameKind::Subscribe, sub11, sizeof(sub11));
  TEST_ASSERT_FALSE(subs.isWatching(11));
}

// endSession with the wrong transport id must not release the active session.
static void test_end_session_ignores_mismatched_transport() {
  uint8_t man[4] = {1, 2, 3, 4};
  ManifestStore store(man, sizeof(man));
  ResourceTable table; SubscriptionState subs; ActionRegistry reg; AuthHandler auth;
  auth.setPin("1234");
  ProtocolEngine engine(store, table, subs, reg, auth, FrameSender{nullptr, sink});

  TEST_ASSERT_TRUE(engine.beginSession(Session::Ble));
  engine.endSession(Session::Spp);                       // wrong transport: no-op on ownership
  TEST_ASSERT_FALSE(engine.beginSession(Session::Spp));  // Ble session still active
}

int main(int, char**) {
  UNITY_BEGIN();
  RUN_TEST(test_begin_session_is_exclusive);
  RUN_TEST(test_end_session_frees_for_other_transport);
  RUN_TEST(test_end_session_resets_auth);
  RUN_TEST(test_end_session_ignores_mismatched_transport);
  return UNITY_END();
}
