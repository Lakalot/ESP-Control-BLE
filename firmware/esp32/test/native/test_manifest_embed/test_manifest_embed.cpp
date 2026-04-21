#define MANIFEST_DEFINE_DATA
#include "manifest_data.h"
#include <unity.h>
#include <stdio.h>

void setUp() {}
void tearDown() {}

static void test_manifest_bytes_are_embedded() {
  TEST_ASSERT_NOT_NULL(MANIFEST_DATA);
  TEST_ASSERT_GREATER_THAN(16u, MANIFEST_LEN);
  TEST_ASSERT_LESS_OR_EQUAL(8u * 1024u, MANIFEST_LEN);
}

int main(int, char**) {
  UNITY_BEGIN();
  RUN_TEST(test_manifest_bytes_are_embedded);
  return UNITY_END();
}
