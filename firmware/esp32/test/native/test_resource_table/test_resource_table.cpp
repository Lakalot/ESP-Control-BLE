#include <unity.h>
#include <string.h>
#include "protocol/ResourceTable.h"

using ecb::v5::ResourceTable;
using ecb::v5::ResourceValue;
using ecb::v5::ResourceValueKind;

void setUp() {}
void tearDown() {}

static void test_set_and_get_bool() {
  ResourceTable t;
  t.setBool(1, true);
  ResourceValue v{};
  TEST_ASSERT_TRUE(t.get(1, v));
  TEST_ASSERT_EQUAL(static_cast<int>(ResourceValueKind::Bool), static_cast<int>(v.kind));
  TEST_ASSERT_TRUE(v.boolValue);
}

static void test_set_and_get_int_and_bump_generation() {
  ResourceTable t;
  uint32_t before = t.generation();
  t.setInt(2, -42);
  uint32_t after = t.generation();
  TEST_ASSERT_EQUAL(before + 1u, after);
  ResourceValue v{};
  TEST_ASSERT_TRUE(t.get(2, v));
  TEST_ASSERT_EQUAL_INT32(-42, v.intValue);
}

static void test_set_string_truncates_at_max() {
  ResourceTable t;
  char big[96] = {};
  memset(big, 'x', 95);
  t.setString(3, big);
  ResourceValue v{};
  TEST_ASSERT_TRUE(t.get(3, v));
  TEST_ASSERT_EQUAL(static_cast<int>(ResourceValueKind::String), static_cast<int>(v.kind));
  TEST_ASSERT_LESS_OR_EQUAL(64u, strlen(v.stringValue));
}

static void test_missing_key_returns_false() {
  ResourceTable t;
  ResourceValue v{};
  TEST_ASSERT_FALSE(t.get(999, v));
}

int main(int, char**) {
  UNITY_BEGIN();
  RUN_TEST(test_set_and_get_bool);
  RUN_TEST(test_set_and_get_int_and_bump_generation);
  RUN_TEST(test_set_string_truncates_at_max);
  RUN_TEST(test_missing_key_returns_false);
  return UNITY_END();
}
