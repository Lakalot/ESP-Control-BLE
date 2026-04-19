#include <unity.h>
#include <pb_decode.h>
#include "protocol/SnapshotEncoder.h"
#include "protocol/ResourceTable.h"
#include "nanopb/manifest_v5.pb.h"

using ecb::v5::ResourceTable;
using ecb::v5::SnapshotEncoder;

void setUp() {}
void tearDown() {}

struct DecodeCtx { size_t count; };

static bool countValues(pb_istream_t* stream, const pb_field_t* /*field*/, void** arg) {
  DecodeCtx* ctx = static_cast<DecodeCtx*>(*arg);
  esp_control_v5_ResourceValue rv = esp_control_v5_ResourceValue_init_zero;
  if (!pb_decode(stream, esp_control_v5_ResourceValue_fields, &rv)) return false;
  ctx->count += 1;
  return true;
}

static void test_encode_two_resources_round_trips_via_nanopb() {
  ResourceTable t;
  t.setBool(10, true);
  t.setInt(20, -5);
  uint8_t buf[256] = {0};
  size_t written = 0;
  TEST_ASSERT_TRUE(SnapshotEncoder::encode(t, buf, sizeof(buf), written));
  TEST_ASSERT_GREATER_THAN(0u, written);

  DecodeCtx ctx{0};
  esp_control_v5_ResourceSnapshot decoded = esp_control_v5_ResourceSnapshot_init_zero;
  decoded.values.funcs.decode = countValues;
  decoded.values.arg = &ctx;
  pb_istream_t is = pb_istream_from_buffer(buf, written);
  TEST_ASSERT_TRUE(pb_decode(&is, esp_control_v5_ResourceSnapshot_fields, &decoded));
  TEST_ASSERT_EQUAL(2u, ctx.count);
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
