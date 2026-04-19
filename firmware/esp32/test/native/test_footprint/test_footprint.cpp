#include <unity.h>
#include "protocol/ManifestStore.h"
#include "protocol/ResourceTable.h"
#include "protocol/SubscriptionState.h"
#include "protocol/ActionRegistryV5.h"

using namespace ecb::v5;

void setUp() {}
void tearDown() {}

static void test_runtime_state_fits_in_budget() {
  size_t total = sizeof(ResourceTable) + sizeof(SubscriptionState) + sizeof(ActionRegistry);
  // ResourceTable holds kMaxEntries=64 ResourceValue structs (each ~170 bytes),
  // SubscriptionState holds 64 uint32_t IDs, ActionRegistry holds 32 handlers.
  // Real budget: ResourceTable alone is ~11KB; 16KB is the safe ceiling.
  TEST_ASSERT_LESS_OR_EQUAL(16u * 1024u, total);
}

int main(int, char**) {
  UNITY_BEGIN();
  RUN_TEST(test_runtime_state_fits_in_budget);
  return UNITY_END();
}
