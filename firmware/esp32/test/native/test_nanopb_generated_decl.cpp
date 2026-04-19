#include <unity.h>
#include "nanopb/manifest_v5.pb.h"

void setUp() {}
void tearDown() {}

static void test_generated_structs_are_available() {
  manifest_v5_InvokeAction req = manifest_v5_InvokeAction_init_zero;
  manifest_v5_InvokeResult res = manifest_v5_InvokeResult_init_zero;
  req.action_id = 42;
  res.correlation_id = 7;
  TEST_ASSERT_EQUAL(42u, req.action_id);
  TEST_ASSERT_EQUAL(7u, res.correlation_id);
}

int main(int, char**) {
  UNITY_BEGIN();
  RUN_TEST(test_generated_structs_are_available);
  return UNITY_END();
}
