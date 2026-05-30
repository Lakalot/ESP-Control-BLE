#include <unity.h>
#include <string.h>
#include "protocol/resources/ResourceTable.h"

using ecb::ResourceTable;
using ecb::ResourceValue;
using ecb::ResourceValueKind;

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

static void test_entry_layout_stays_compact() {
  TEST_ASSERT_LESS_OR_EQUAL(24u, sizeof(ecb::ResourceEntry));
}

static void test_string_values_use_external_storage_without_affecting_scalar_reads() {
  ResourceTable t;
  t.setBool(1, true);
  t.setString(2, "hello");
  t.setInt(3, -7);

  ResourceValue stringValue{};
  ResourceValue boolValue{};
  ResourceValue intValue{};

  TEST_ASSERT_TRUE(t.get(2, stringValue));
  TEST_ASSERT_TRUE(t.get(1, boolValue));
  TEST_ASSERT_TRUE(t.get(3, intValue));

  TEST_ASSERT_EQUAL(static_cast<int>(ResourceValueKind::String), static_cast<int>(stringValue.kind));
  TEST_ASSERT_EQUAL_STRING("hello", stringValue.stringValue);
  TEST_ASSERT_EQUAL(static_cast<int>(ResourceValueKind::Bool), static_cast<int>(boolValue.kind));
  TEST_ASSERT_TRUE(boolValue.boolValue);
  TEST_ASSERT_EQUAL(static_cast<int>(ResourceValueKind::Int), static_cast<int>(intValue.kind));
  TEST_ASSERT_EQUAL_INT32(-7, intValue.intValue);
}

static void test_blob_slots_are_released_and_reused_after_scalar_transition() {
  ResourceTable t;
  for (uint32_t i = 1; i <= ResourceTable::kMaxBlobSlots; ++i) {
    t.setString(i, "slot");
  }

  t.setBool(1, true);

  const uint8_t bytes[] = {0x00, 0x7F, 0xFF};
  t.setBytes(1, bytes, sizeof(bytes));

  ResourceValue v{};
  TEST_ASSERT_TRUE(t.get(1, v));
  TEST_ASSERT_EQUAL(static_cast<int>(ResourceValueKind::Bytes), static_cast<int>(v.kind));
  TEST_ASSERT_EQUAL_UINT32(sizeof(bytes), v.bytesLength);
  TEST_ASSERT_EQUAL_UINT8_ARRAY(bytes, v.bytesValue, sizeof(bytes));
}

static void test_blob_backed_value_can_change_kind_without_stale_payload() {
  ResourceTable t;
  t.setString(9, "hello");

  const uint8_t bytes[] = {0x61, 0x00, 0x62, 0x7F};
  t.setBytes(9, bytes, sizeof(bytes));

  ResourceValue v{};
  TEST_ASSERT_TRUE(t.get(9, v));
  TEST_ASSERT_EQUAL(static_cast<int>(ResourceValueKind::Bytes), static_cast<int>(v.kind));
  TEST_ASSERT_EQUAL_UINT32(sizeof(bytes), v.bytesLength);
  TEST_ASSERT_EQUAL_UINT8_ARRAY(bytes, v.bytesValue, sizeof(bytes));
}

static void test_missing_key_returns_false() {
  ResourceTable t;
  ResourceValue v{};
  TEST_ASSERT_FALSE(t.get(999, v));
}

// Characterizes the upsert "initialize-before-publish" contract: after inserting
// a fresh id, size() must reflect exactly one new finalized entry AND that entry
// must be readable with the value just written. (Single-threaded native tests
// cannot observe the torn-read window directly, so this locks in that the
// reordered upsert still publishes a fully-initialized entry on the happy path.)
static void test_new_uint_publishes_finalized_entry() {
  ResourceTable t;
  const size_t before = t.size();
  t.setUint(100, 0xABCDEF01u);
  TEST_ASSERT_EQUAL_UINT32(before + 1u, t.size());
  ResourceValue v{};
  TEST_ASSERT_TRUE(t.get(100, v));
  TEST_ASSERT_EQUAL(static_cast<int>(ResourceValueKind::Uint), static_cast<int>(v.kind));
  TEST_ASSERT_EQUAL_UINT32(0xABCDEF01u, v.uintValue);
}

// Exercises the upsert-existing path: re-interning the same id (even across a
// kind change) must update in place, never grow the table.
static void test_reintern_same_id_updates_in_place() {
  ResourceTable t;
  t.setUint(200, 1);
  const size_t afterFirst = t.size();
  t.setString(200, "x");
  TEST_ASSERT_EQUAL_UINT32(afterFirst, t.size());
  ResourceValue v{};
  TEST_ASSERT_TRUE(t.get(200, v));
  TEST_ASSERT_EQUAL(static_cast<int>(ResourceValueKind::String), static_cast<int>(v.kind));
  TEST_ASSERT_EQUAL_STRING("x", v.stringValue);
}

int main(int, char**) {
  UNITY_BEGIN();
  RUN_TEST(test_set_and_get_bool);
  RUN_TEST(test_set_and_get_int_and_bump_generation);
  RUN_TEST(test_set_string_truncates_at_max);
  RUN_TEST(test_entry_layout_stays_compact);
  RUN_TEST(test_string_values_use_external_storage_without_affecting_scalar_reads);
  RUN_TEST(test_blob_slots_are_released_and_reused_after_scalar_transition);
  RUN_TEST(test_blob_backed_value_can_change_kind_without_stale_payload);
  RUN_TEST(test_missing_key_returns_false);
  RUN_TEST(test_new_uint_publishes_finalized_entry);
  RUN_TEST(test_reintern_same_id_updates_in_place);
  return UNITY_END();
}
