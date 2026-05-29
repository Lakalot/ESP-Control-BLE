#include <unity.h>
#include "protocol/manifest/ManifestStore.h"
#include "protocol/resources/ResourceTable.h"
#include "protocol/subscriptions/SubscriptionState.h"
#include "protocol/actions/ActionRegistry.h"
#include "transport/ble/DataBleTransport.h"

using namespace ecb;

void setUp() {}
void tearDown() {}

static void test_runtime_state_fits_in_budget() {
  TEST_ASSERT_LESS_OR_EQUAL(6u * 1024u, sizeof(ResourceTable));

  size_t total = sizeof(ResourceTable) + sizeof(SubscriptionState) + sizeof(ActionRegistry);
  // ResourceTable now keeps compact entries and shared blob storage; the full
  // runtime state should stay comfortably below the original 16 KB ceiling.
  TEST_ASSERT_LESS_OR_EQUAL(12u * 1024u, total);
}

static void test_transport_sender_and_instance_stay_bounded() {
  TEST_ASSERT_LESS_OR_EQUAL(sizeof(void*) * 2u, sizeof(FrameSender));
  TEST_ASSERT_LESS_OR_EQUAL(96u, sizeof(ProtocolEngine));
  TEST_ASSERT_EQUAL_UINT32(DataFrameCodec::kHeaderSize + kMaxFrameBody, ProtocolEngine::kFrameBufferSize);
  TEST_ASSERT_LESS_OR_EQUAL(4u + 256u, ProtocolEngine::kInvokeResultBufferSize);
  TEST_ASSERT_LESS_OR_EQUAL(4u + 128u, ProtocolEngine::kDeltaFrameBufferSize);
}

int main(int, char**) {
  UNITY_BEGIN();
  RUN_TEST(test_runtime_state_fits_in_budget);
  RUN_TEST(test_transport_sender_and_instance_stay_bounded);
  return UNITY_END();
}
