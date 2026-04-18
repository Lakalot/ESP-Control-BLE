#include <unity.h>
#include <string.h>

#include "protocol/CommandRegistry.h"

static uint8_t capturedBuf[128];
static uint16_t capturedLen = 0;

static void mockNotify(const uint8_t* data, uint16_t len) {
  memcpy(capturedBuf, data, len);
  capturedLen = len;
}

static void cmdEcho(CmdContext& ctx) {
  uint8_t val = 0x42;
  ctx.replyOk(&val, 1);
}

static int16_t lastReadValue = 0;
static void cmdReadInt16(CmdContext& ctx) {
  lastReadValue = ctx.readInt16();
  ctx.replyOk();
}

static uint8_t notifyBuf[128];
static uint16_t notifyLen = 0;

static void captureNotify(const uint8_t* data, uint16_t len) {
  notifyLen = len < sizeof(notifyBuf) ? len : sizeof(notifyBuf);
  memcpy(notifyBuf, data, notifyLen);
}

static CmdContext makeCtx(uint8_t cmdId, const uint8_t* payload, uint8_t length) {
  CmdContext ctx;
  ctx.cmdId = cmdId;
  ctx.payload = payload;
  ctx.length = length;
  ctx._notify = captureNotify;
  return ctx;
}

void setUp(void) {
  capturedLen = 0;
  memset(capturedBuf, 0, sizeof(capturedBuf));
  lastReadValue = 0;
  notifyLen = 0;
  memset(notifyBuf, 0, sizeof(notifyBuf));
}

void tearDown(void) {}

void test_dispatch_known_command(void) {
  CommandRegistry reg;
  reg.registerCommand(0x01, cmdEcho);

  bool found = reg.dispatch(0x01, nullptr, 0, mockNotify);
  TEST_ASSERT_TRUE(found);
  TEST_ASSERT_EQUAL_UINT16(4, capturedLen);
  TEST_ASSERT_EQUAL_UINT8(0x01, capturedBuf[0]);
  TEST_ASSERT_EQUAL_UINT8(ECB_STATUS_OK, capturedBuf[1]);
  TEST_ASSERT_EQUAL_UINT8(1, capturedBuf[2]);
  TEST_ASSERT_EQUAL_UINT8(0x42, capturedBuf[3]);
}

void test_dispatch_unknown_command(void) {
  CommandRegistry reg;
  reg.registerCommand(0x01, cmdEcho);

  bool found = reg.dispatch(0x99, nullptr, 0, mockNotify);
  TEST_ASSERT_FALSE(found);
}

void test_cmd_context_read_int16(void) {
  CommandRegistry reg;
  reg.registerCommand(0x02, cmdReadInt16);

  uint8_t payload[2] = { 0x00, 0x64 };
  reg.dispatch(0x02, payload, 2, mockNotify);
  TEST_ASSERT_EQUAL_INT16(100, lastReadValue);
}

void test_cmd_context_read_int16_out_of_bounds(void) {
  CommandRegistry reg;
  reg.registerCommand(0x03, cmdReadInt16);

  uint8_t payload[1] = { 0xFF };
  reg.dispatch(0x03, payload, 1, mockNotify);
  TEST_ASSERT_EQUAL_INT16(0, lastReadValue);
}

void test_reply_ok_no_payload(void) {
  CommandRegistry reg;
  reg.registerCommand(0x04, [](CmdContext& ctx) {
    ctx.replyOk();
  });

  reg.dispatch(0x04, nullptr, 0, mockNotify);
  TEST_ASSERT_EQUAL_UINT16(3, capturedLen);
  TEST_ASSERT_EQUAL_UINT8(0x04, capturedBuf[0]);
  TEST_ASSERT_EQUAL_UINT8(0x00, capturedBuf[1]);
  TEST_ASSERT_EQUAL_UINT8(0x00, capturedBuf[2]);
}

void test_reply_error(void) {
  CommandRegistry reg;
  reg.registerCommand(0x05, [](CmdContext& ctx) {
    ctx.replyError(ECB_STATUS_BAD_FRAME);
  });

  reg.dispatch(0x05, nullptr, 0, mockNotify);
  TEST_ASSERT_EQUAL_UINT16(3, capturedLen);
  TEST_ASSERT_EQUAL_UINT8(0x05, capturedBuf[0]);
  TEST_ASSERT_EQUAL_UINT8(ECB_STATUS_BAD_FRAME, capturedBuf[1]);
}

void test_readRgb_reads_three_bytes(void) {
  const uint8_t payload[3] = { 0xFF, 0x80, 0x10 };
  CmdContext ctx = makeCtx(0x10, payload, 3);
  uint8_t r = 0;
  uint8_t g = 0;
  uint8_t b = 0;

  bool ok = ctx.readRgb(r, g, b);
  TEST_ASSERT_TRUE(ok);
  TEST_ASSERT_EQUAL_UINT8(0xFF, r);
  TEST_ASSERT_EQUAL_UINT8(0x80, g);
  TEST_ASSERT_EQUAL_UINT8(0x10, b);
}

void test_readRgb_returns_false_when_too_short(void) {
  const uint8_t payload[2] = { 0xFF, 0x80 };
  CmdContext ctx = makeCtx(0x10, payload, 2);
  uint8_t r = 0;
  uint8_t g = 0;
  uint8_t b = 0;

  bool ok = ctx.readRgb(r, g, b);
  TEST_ASSERT_FALSE(ok);
}

void test_readXY_decodes_big_endian_int16(void) {
  const uint8_t payload[4] = { 0xFF, 0x9C, 0x00, 0x32 };
  CmdContext ctx = makeCtx(0x11, payload, 4);
  int16_t x = 0;
  int16_t y = 0;

  bool ok = ctx.readXY(x, y);
  TEST_ASSERT_TRUE(ok);
  TEST_ASSERT_EQUAL_INT16(-100, x);
  TEST_ASSERT_EQUAL_INT16(50, y);
}

void test_readXY_returns_false_when_too_short(void) {
  const uint8_t payload[3] = { 0xFF, 0x9C, 0x00 };
  CmdContext ctx = makeCtx(0x11, payload, 3);
  int16_t x = 0;
  int16_t y = 0;

  bool ok = ctx.readXY(x, y);
  TEST_ASSERT_FALSE(ok);
}

void test_readTextInput_copies_string(void) {
  const uint8_t payload[5] = { 'H', 'e', 'l', 'l', 'o' };
  CmdContext ctx = makeCtx(0x12, payload, 5);
  char buf[32] = { 0 };

  uint8_t written = ctx.readTextInput(buf, sizeof(buf));
  TEST_ASSERT_EQUAL_UINT8(5, written);
  TEST_ASSERT_EQUAL_STRING("Hello", buf);
}

void test_readTextInput_truncates_to_maxLen(void) {
  const uint8_t payload[6] = { 'A', 'B', 'C', 'D', 'E', 'F' };
  CmdContext ctx = makeCtx(0x12, payload, 6);
  char buf[4] = { 0 };

  uint8_t written = ctx.readTextInput(buf, 4);
  TEST_ASSERT_EQUAL_UINT8(3, written);
  TEST_ASSERT_EQUAL_STRING("ABC", buf);
}

void test_readMultiSelect_returns_index(void) {
  const uint8_t payload[1] = { 0x02 };
  CmdContext ctx = makeCtx(0x13, payload, 1);

  uint8_t idx = ctx.readMultiSelect();
  TEST_ASSERT_EQUAL_UINT8(2, idx);
}

void test_readMultiSelect_returns_0_when_empty(void) {
  CmdContext ctx = makeCtx(0x13, nullptr, 0);

  uint8_t idx = ctx.readMultiSelect();
  TEST_ASSERT_EQUAL_UINT8(0, idx);
}

void test_replyProgress_sends_correct_frame(void) {
  CmdContext ctx = makeCtx(0x14, nullptr, 0);
  ctx.replyProgress(75);

  TEST_ASSERT_EQUAL_UINT16(5, notifyLen);
  TEST_ASSERT_EQUAL_UINT8(0x14, notifyBuf[0]);
  TEST_ASSERT_EQUAL_UINT8(ECB_STATUS_OK, notifyBuf[1]);
  TEST_ASSERT_EQUAL_UINT8(2, notifyBuf[2]);
  TEST_ASSERT_EQUAL_UINT8(0x00, notifyBuf[3]);
  TEST_ASSERT_EQUAL_UINT8(0x4B, notifyBuf[4]);
}

void test_replyProgress_clamps_to_100(void) {
  CmdContext ctx = makeCtx(0x14, nullptr, 0);
  ctx.replyProgress(200);

  TEST_ASSERT_EQUAL_UINT8(0x00, notifyBuf[3]);
  TEST_ASSERT_EQUAL_UINT8(0x64, notifyBuf[4]);
}

int main(int argc, char** argv) {
  UNITY_BEGIN();
  RUN_TEST(test_dispatch_known_command);
  RUN_TEST(test_dispatch_unknown_command);
  RUN_TEST(test_cmd_context_read_int16);
  RUN_TEST(test_cmd_context_read_int16_out_of_bounds);
  RUN_TEST(test_reply_ok_no_payload);
  RUN_TEST(test_reply_error);
  RUN_TEST(test_readRgb_reads_three_bytes);
  RUN_TEST(test_readRgb_returns_false_when_too_short);
  RUN_TEST(test_readXY_decodes_big_endian_int16);
  RUN_TEST(test_readXY_returns_false_when_too_short);
  RUN_TEST(test_readTextInput_copies_string);
  RUN_TEST(test_readTextInput_truncates_to_maxLen);
  RUN_TEST(test_readMultiSelect_returns_index);
  RUN_TEST(test_readMultiSelect_returns_0_when_empty);
  RUN_TEST(test_replyProgress_sends_correct_frame);
  RUN_TEST(test_replyProgress_clamps_to_100);
  return UNITY_END();
}
