// Guards FIX A + FIX B: every resource the REAL device declares (buildUi in
// device_ui.cpp) must be readMode == Subscribe (2). The mobile app subscribes ONLY
// to subscribe-mode resources (useDeviceUi.ts filters readMode === 'subscribe'),
// and the device's ProtocolEngine::sendDelta only queues a delta for subscribed
// resources. So any resource left in Snapshot/Poll never reaches the tablet:
//   * short-form widgets (toggleShort/sliderShort/selectShort/textInputShort) used
//     to default their resource to Snapshot -> the control's state showed "unknown";
//   * wifi.rssi / system.uptime were Poll (the app never polls) -> stuck/stale.
// Both are now Subscribe; this test fails permanently if either regresses.
//
// device_ui.cpp is pulled in via a direct #include of the .cpp (test_build_src=false,
// so PlatformIO won't auto-compile src/ for native tests). The native env has -Isrc
// so its #include "device_ui.h" resolves; HwHal.cpp is compiled into the lib. Under
// UNIT_TEST the .onSet lambdas are recorded by EmitterUi but never executed.
#include <unity.h>
#include <cstddef>

#include "ui/EmitterUi.h"
#include "device_ui.h"

// Pull device_ui.cpp (and its dev:: global definitions) into this TU. Only this
// test and test_emitter_determinism include device_ui.cpp -- they are separate
// test binaries (one TU each), so there is no multiple-definition risk.
#include "../../../src/device_ui.cpp"

using namespace ecb::ui;

void setUp() {}
void tearDown() {}

// ReadMode::Subscribe == 2 (see ui/Ui.h: enum class ReadMode { Snapshot=1,
// Subscribe=2, Poll=3 }). UiResource.readMode holds the numeric esp_control_ReadMode.
static void test_device_resources_are_subscribe() {
  EmitterUi e;
  buildUi(e);
  UiModel m = e.build();
  TEST_ASSERT_TRUE(m.resources.size() > 0);
  for (size_t i = 0; i < m.resources.size(); ++i) {
    // Message = the resource slug, so a failure names the offending resource.
    TEST_ASSERT_EQUAL_UINT32_MESSAGE(2u, m.resources[i].readMode,
                                     m.strings.at(m.resources[i].slugIdx));
  }
}

int main(int, char**) {
  UNITY_BEGIN();
  RUN_TEST(test_device_resources_are_subscribe);
  return UNITY_END();
}
