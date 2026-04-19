#define MANIFEST_V5_DEFINE_DATA
#include "manifest_v5_data.h"
#include <unity.h>
#include <stdio.h>

void setUp() {}
void tearDown() {}

static void test_manifest_bytes_are_embedded() {
  TEST_ASSERT_NOT_NULL(MANIFEST_V5_DATA);
  TEST_ASSERT_GREATER_THAN(16u, MANIFEST_V5_LEN);
  TEST_ASSERT_LESS_OR_EQUAL(8u * 1024u, MANIFEST_V5_LEN);
}

int main(int, char**) {
  UNITY_BEGIN();
  RUN_TEST(test_manifest_bytes_are_embedded);
  return UNITY_END();
}
