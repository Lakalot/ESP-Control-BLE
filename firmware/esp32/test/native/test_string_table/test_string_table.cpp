#include <unity.h>
#include "ui/StringTable.h"
using ecb::ui::StringTable;
void setUp() {} void tearDown() {}

static void test_index_zero_is_empty_string() {
  StringTable t;
  TEST_ASSERT_EQUAL_UINT32(0u, t.intern(""));
  TEST_ASSERT_EQUAL_UINT32(1u, t.size());  // only "" so far
}
static void test_dedup_returns_same_index() {
  StringTable t;
  uint32_t a = t.intern("foo");
  uint32_t b = t.intern("bar");
  uint32_t c = t.intern("foo");
  TEST_ASSERT_EQUAL_UINT32(a, c);
  TEST_ASSERT_TRUE(a != b);
}
static void test_intern_optional_empty_is_zero() {
  StringTable t;
  TEST_ASSERT_EQUAL_UINT32(0u, t.internOptional(""));
  TEST_ASSERT_EQUAL_UINT32(0u, t.internOptional(nullptr));
}
static void test_first_use_order_preserved() {
  StringTable t;            // index 0 = ""
  TEST_ASSERT_EQUAL_UINT32(1u, t.intern("a"));
  TEST_ASSERT_EQUAL_UINT32(2u, t.intern("b"));
  TEST_ASSERT_EQUAL_UINT32(1u, t.intern("a"));
  TEST_ASSERT_EQUAL_STRING("a", t.at(1));
  TEST_ASSERT_EQUAL_STRING("b", t.at(2));
}
int main(int,char**){ UNITY_BEGIN();
  RUN_TEST(test_index_zero_is_empty_string);
  RUN_TEST(test_dedup_returns_same_index);
  RUN_TEST(test_intern_optional_empty_is_zero);
  RUN_TEST(test_first_use_order_preserved);
  return UNITY_END(); }
