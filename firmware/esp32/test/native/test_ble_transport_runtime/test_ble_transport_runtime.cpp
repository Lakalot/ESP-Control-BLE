#define private public
#include "transport/ble/BleTransport.h"
#undef private

#include <unity.h>

#include "protocol/actions/ActionRegistry.h"
#include "protocol/manifest/ManifestStore.h"
#include "protocol/resources/ResourceTable.h"
#include "protocol/subscriptions/SubscriptionState.h"
#include "transport/frame/DataFrameCodec.h"

void setUp() {}
void tearDown() {}

static void handle_test_command(CmdContext& ctx) {
  const uint8_t reply[] = {0x99};
  ctx.replyOk(reply, sizeof(reply));
}

static uint8_t checksumFor(const uint8_t* data, size_t len) {
  uint8_t checksum = 0;
  for (size_t i = 0; i < len; ++i) {
    checksum ^= data[i];
  }
  return checksum;
}

static void test_subscribe_auth_and_command_dispatch_use_shared_transport_path() {
  uint8_t manifest[] = {0x01, 0x02, 0x03, 0x04};
  AuthHandler auth;
  auth.setPin("1234");
  CommandRegistry registry;
  registry.registerCommand(0x42, handle_test_command);

  BleTransport transport;
  transport.begin("native-test", &auth, &registry, manifest, sizeof(manifest));

  transport.handleSubscribe();
  TEST_ASSERT_EQUAL_UINT32(1u + ECB_NONCE_SIZE, transport._lastNotifyLen);
  TEST_ASSERT_EQUAL_UINT8(ECB_AUTH_CHALLENGE, transport._lastNotify[0]);
  TEST_ASSERT_EQUAL_UINT8_ARRAY(auth._nonce, transport._lastNotify + 1, ECB_NONCE_SIZE);

  uint8_t authResponse[1 + ECB_HASH_SIZE] = {ECB_AUTH_OK};
  auth.computeExpectedHash(authResponse + 1);
  transport.handleWrite(authResponse, sizeof(authResponse));
  TEST_ASSERT_EQUAL_UINT32(1u, transport._lastNotifyLen);
  TEST_ASSERT_EQUAL_UINT8(ECB_AUTH_OK, transport._lastNotify[0]);

  uint8_t commandFrame[] = {0x42, 0x01, 0x11, 0x00, 0x00, 0x00, 0x00, 0x00};
  commandFrame[7] = checksumFor(commandFrame, 7);
  transport.handleWrite(commandFrame, sizeof(commandFrame));

  TEST_ASSERT_EQUAL_UINT32(4u, transport._lastNotifyLen);
  TEST_ASSERT_EQUAL_UINT8(0x42, transport._lastNotify[0]);
  TEST_ASSERT_EQUAL_UINT8(ECB_STATUS_OK, transport._lastNotify[1]);
  TEST_ASSERT_EQUAL_UINT8(0x01, transport._lastNotify[2]);
  TEST_ASSERT_EQUAL_UINT8(0x99, transport._lastNotify[3]);
}

static void test_data_write_rejects_truncated_frame_payloads() {
  uint8_t manifest[] = {0x01, 0x02, 0x03, 0x04};
  AuthHandler auth;
  auth.setPin("1234");
  CommandRegistry registry;

  BleTransport transport;
  transport.begin("native-test", &auth, &registry, manifest, sizeof(manifest));

  ecb::ManifestStore store(manifest, sizeof(manifest));
  ecb::ResourceTable table;
  ecb::SubscriptionState subs;
  ecb::ActionRegistry actions;
  ecb::DataBleTransport dataTransport(store, table, subs, actions,
                                      ecb::FrameSender{&transport, [](void* context, const uint8_t* data, size_t len) {
                                        static_cast<BleTransport*>(context)->notifyRawData(data, len);
                                      }});
  transport.setDataTransport(&dataTransport);

  const uint8_t truncatedPing[] = {
    static_cast<uint8_t>(ecb::FrameKind::Ping),
    0x00,
    0x00,
    0x01,
  };

  transport.handleDataWrite(truncatedPing, sizeof(truncatedPing));

  TEST_ASSERT_EQUAL_UINT32(0u, transport._lastRawDataLen);
}

int main(int, char**) {
  UNITY_BEGIN();
  RUN_TEST(test_subscribe_auth_and_command_dispatch_use_shared_transport_path);
  RUN_TEST(test_data_write_rejects_truncated_frame_payloads);
  return UNITY_END();
}
