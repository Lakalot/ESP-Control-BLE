#include <unity.h>
#include <pb_decode.h>
#include "protocol/SnapshotEncoder.h"
#include "protocol/ResourceTable.h"
#include "nanopb/manifest_v5.pb.h"

using ecb::v5::ResourceTable;
using ecb::v5::SnapshotEncoder;

void setUp() {}
void tearDown() {}

static void test_encode_two_resources_round_trips_via_nanopb() {
  ResourceTable t;
  t.setBool(10, true);
  t.setInt(20, -5);
  uint8_t buf[256] = {0};
  size_t written = 0;
  TEST_ASSERT_TRUE(SnapshotEncoder::encode(t, buf, sizeof(buf), written));
  TEST_ASSERT_GREATER_THAN(0u, written);

  manifest_v5_ResourceSnapshot decoded = manifest_v5_ResourceSnapshot_init_zero;
  pb_istream_t is = pb_istream_from_buffer(buf, written);
  TEST_ASSERT_TRUE(pb_decode(&is, manifest_v5_ResourceSnapshot_fields, &decoded));
  TEST_ASSERT_EQUAL(2u, decoded.values_count);
  TEST_ASSERT_EQUAL(t.generation(), decoded.generation);
}

static void test_encode_overflow_returns_false() {
  ResourceTable t;
  for (uint32_t i = 0; i < 64; ++i) t.setInt(i, 0);
  uint8_t tiny[8] = {0};
  size_t written = 0;
  TEST_ASSERT_FALSE(SnapshotEncoder::encode(t, tiny, sizeof(tiny), written));
}

int main(int, char**) {
  UNITY_BEGIN();
  RUN_TEST(test_encode_two_resources_round_trips_via_nanopb);
  RUN_TEST(test_encode_overflow_returns_false);
  return UNITY_END();
}
