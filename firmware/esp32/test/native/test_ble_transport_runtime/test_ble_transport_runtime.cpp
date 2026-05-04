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

static void test_data_write_rejects_truncated_frame_payloads() {
  uint8_t manifest[] = {0x01, 0x02, 0x03, 0x04};
  AuthHandler auth;
  auth.setPin("1234");

  BleTransport transport;
  transport.begin("native-test", &auth, manifest, sizeof(manifest));

  ecb::ManifestStore store(manifest, sizeof(manifest));
  ecb::ResourceTable<> table;
  ecb::SubscriptionState subs;
  ecb::ActionRegistry actions;
  ecb::DataBleTransport dataTransport([](void* context, const uint8_t* data, size_t len) {
                                        static_cast<BleTransport*>(context)->notifyRawData(data, len);
                                      }, &transport,
                                      [](ecb::FrameKind, const uint8_t*, size_t, void*) {}, nullptr);
  transport.setDataTransport(&dataTransport);

  const uint8_t truncatedPing[] = {
    static_cast<uint8_t>(ecb::FrameKind::Ping),
    0x00,
    0x00,
    0x01,
  };

  transport.handleDataWrite(truncatedPing, sizeof(truncatedPing));

  TEST_ASSERT_EQUAL_UINT32(0u, BleTransport::_lastRawDataLen);
}

int main(int, char**) {
  UNITY_BEGIN();
  RUN_TEST(test_data_write_rejects_truncated_frame_payloads);
  return UNITY_END();
}
