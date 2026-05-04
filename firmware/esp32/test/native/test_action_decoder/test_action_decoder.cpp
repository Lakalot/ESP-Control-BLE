#include <unity.h>
#include <pb_encode.h>
#include <string.h>
#include "protocol/actions/ActionDecoder.h"
#include "protocol/actions/ActionRegistry.h"
#include "nanopb/manifest.pb.h"

using ecb::ActionDecoder;
using ecb::ActionRegistry;
using ecb::ActionContext;
using ecb::ActionStatus;

void setUp() {}
void tearDown() {}

static uint32_t g_calls;
static uint32_t g_lastCorrelation;
static ecb::ActionValueKind g_lastValueKind;
static char g_lastString[65];

static bool encode_string_value(pb_ostream_t* stream, const pb_field_t* field, void* const* arg) {
  const char* value = static_cast<const char*>(*arg);
  if (!pb_encode_tag_for_field(stream, field)) return false;
  return pb_encode_string(stream, reinterpret_cast<const pb_byte_t*>(value), strlen(value));
}

static void resetCounters() {
  g_calls = 0;
  g_lastCorrelation = 0;
  g_lastValueKind = ecb::ActionValueKind::None;
  g_lastString[0] = '\0';
}

static void on_counting_action(ecb::ActionContext& ctx, void*) {
  g_calls += 1;
  g_lastCorrelation = ctx.correlationId;
  ctx.replyOk(nullptr, 0);
}

static void on_string_action(ecb::ActionContext& ctx, void*) {
  g_calls += 1;
  g_lastCorrelation = ctx.correlationId;
  g_lastValueKind = ctx.valueKind;
  strncpy(g_lastString, ctx.stringValue, sizeof(g_lastString) - 1);
  ctx.replyOk(nullptr, 0);
}

static void register_and_dispatch_flows() {
  ActionRegistry reg;
  reg.registerAction(7, &on_counting_action, nullptr);
  uint8_t wire[128] = {0};
  size_t wireLen = 0;
  {
    esp_control_InvokeAction req = esp_control_InvokeAction_init_zero;
    req.action_id = 7;
    req.correlation_id = 99;
    pb_ostream_t os = pb_ostream_from_buffer(wire, sizeof(wire));
    TEST_ASSERT_TRUE(pb_encode(&os, esp_control_InvokeAction_fields, &req));
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
  esp_control_InvokeAction req = esp_control_InvokeAction_init_zero;
  req.action_id = 999;
  req.correlation_id = 5;
  pb_ostream_t os = pb_ostream_from_buffer(wire, sizeof(wire));
  TEST_ASSERT_TRUE(pb_encode(&os, esp_control_InvokeAction_fields, &req));
  wireLen = os.bytes_written;
  uint8_t reply[64] = {0};
  size_t replyLen = 0;
  TEST_ASSERT_TRUE(ActionDecoder::dispatch(reg, wire, wireLen, reply, sizeof(reply), replyLen));
  TEST_ASSERT_EQUAL(0u, g_calls);
  TEST_ASSERT_GREATER_THAN(0u, replyLen);
}

static void test_string_payload_reaches_handler() {
  resetCounters();
  ActionRegistry reg;
  reg.registerAction(7, &on_string_action, nullptr);

  uint8_t wire[128] = {0};
  size_t wireLen = 0;
  esp_control_InvokeAction req = esp_control_InvokeAction_init_zero;
  req.action_id = 7;
  req.correlation_id = 42;
  req.has_payload = true;
  req.payload.which_kind = esp_control_CommonValue_string_value_tag;
  const char* name = "party";
  req.payload.kind.string_value.funcs.encode = encode_string_value;
  req.payload.kind.string_value.arg = const_cast<char*>(name);
  pb_ostream_t os = pb_ostream_from_buffer(wire, sizeof(wire));
  TEST_ASSERT_TRUE(pb_encode(&os, esp_control_InvokeAction_fields, &req));
  wireLen = os.bytes_written;

  uint8_t reply[64] = {0};
  size_t replyLen = 0;
  TEST_ASSERT_TRUE(ActionDecoder::dispatch(reg, wire, wireLen, reply, sizeof(reply), replyLen));
  TEST_ASSERT_EQUAL_UINT32(1u, g_calls);
  TEST_ASSERT_EQUAL_UINT32(42u, g_lastCorrelation);
  TEST_ASSERT_EQUAL_UINT8(static_cast<uint8_t>(ecb::ActionValueKind::String), static_cast<uint8_t>(g_lastValueKind));
  TEST_ASSERT_EQUAL_STRING("party", g_lastString);
}

int main(int, char**) {
  UNITY_BEGIN();
  resetCounters();
  RUN_TEST(register_and_dispatch_flows);
  RUN_TEST(test_unknown_action_produces_error_reply);
  RUN_TEST(test_string_payload_reaches_handler);
  return UNITY_END();
}