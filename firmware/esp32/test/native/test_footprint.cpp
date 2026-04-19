#include <unity.h>
#include "protocol/ManifestStore.h"
#include "protocol/ResourceTable.h"
#include "protocol/SubscriptionState.h"
#include "protocol/ActionRegistryV5.h"

using namespace ecb::v5;

void setUp() {}
void tearDown() {}

static void test_runtime_state_fits_in_two_kibibytes() {
  size_t total = sizeof(ResourceTable) + sizeof(SubscriptionState) + sizeof(ActionRegistry);
  TEST_ASSERT_LESS_OR_EQUAL(2u * 1024u, total);
}

int main(int, char**) {
  UNITY_BEGIN();
  RUN_TEST(test_runtime_state_fits_in_two_kibibytes);
  return UNITY_END();
}
