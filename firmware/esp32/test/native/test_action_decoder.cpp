#include <unity.h>
#include <pb_encode.h>
#include "protocol/ActionDecoder.h"
#include "protocol/ActionRegistryV5.h"
#include "nanopb/manifest_v5.pb.h"

using ecb::v5::ActionDecoder;
using ecb::v5::ActionRegistry;
using ecb::v5::ActionContext;
using ecb::v5::ActionStatus;

void setUp() {}
void tearDown() {}

static uint32_t g_calls;
static uint32_t g_lastCorrelation;

static void resetCounters() { g_calls = 0; g_lastCorrelation = 0; }

static void register_and_dispatch_flows() {
  ActionRegistry reg;
  reg.registerAction(7, [](ActionContext& ctx) {
    g_calls += 1;
    g_lastCorrelation = ctx.correlationId;
    ctx.replyOk(nullptr, 0);
  });
  uint8_t wire[128] = {0};
  size_t wireLen = 0;
  {
    manifest_v5_InvokeAction req = manifest_v5_InvokeAction_init_zero;
    req.action_id = 7;
    req.correlation_id = 99;
    pb_ostream_t os = pb_ostream_from_buffer(wire, sizeof(wire));
    TEST_ASSERT_TRUE(pb_encode(&os, manifest_v5_InvokeAction_fields, &req));
    wireLen = os.bytes_written;
  }
  uint8_t reply[128] = {0};
  size_t replyLen = 0;
  TEST_ASSERT_TRUE(ActionDecoder::dispatch(reg, wire, wireLen, reply, sizeof(reply), replyLen));
  TEST_ASSERT_EQUAL(1u, g_calls);
  TEST_ASSERT_EQUAL(99u, g_lastCorrelation);
  TEST_ASSERT_GREATER_THAN(0u, replyLen);
}

static void test_unknown_action_produces_error_reply() {
  resetCounters();
  ActionRegistry reg;
  uint8_t wire[64] = {0};
  size_t wireLen;
  manifest_v5_InvokeAction req = manifest_v5_InvokeAction_init_zero;
  req.action_id = 999;
  req.correlation_id = 5;
  pb_ostream_t os = pb_ostream_from_buffer(wire, sizeof(wire));
  TEST_ASSERT_TRUE(pb_encode(&os, manifest_v5_InvokeAction_fields, &req));
  wireLen = os.bytes_written;
  uint8_t reply[64] = {0};
  size_t replyLen = 0;
  TEST_ASSERT_TRUE(ActionDecoder::dispatch(reg, wire, wireLen, reply, sizeof(reply), replyLen));
  TEST_ASSERT_EQUAL(0u, g_calls);
  TEST_ASSERT_GREATER_THAN(0u, replyLen);
}

int main(int, char**) {
  UNITY_BEGIN();
  resetCounters();
  RUN_TEST(register_and_dispatch_flows);
  RUN_TEST(test_unknown_action_produces_error_reply);
  return UNITY_END();
}
