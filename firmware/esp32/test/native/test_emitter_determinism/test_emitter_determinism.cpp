// DX-T9: emitter-determinism test for the new model (device_ui.cpp / buildUi).
//
// The C++ emitter (EmitterUi -> UiModel -> nanopb) must be DETERMINISTIC: two
// independent calls to buildUi() on fresh EmitterUi instances must produce
// byte-identical output. This is the correctness gate for the DX redesign:
// if any string is interned in a non-deterministic order, or any ID assignment
// is order-dependent on unordered state, the bytes will diverge.
//
// device_ui.cpp is pulled in via a direct #include of the .cpp (approach a):
// test_build_src=false means PlatformIO won't auto-compile src/ for native tests,
// so we include the translation unit directly.  The native env has -Isrc so
// device_ui.cpp's #include "device_ui.h" resolves, and HwHal.cpp is compiled
// into the lib (via lib_extra_dirs=lib), so halAnalogWrite links. Under
// UNIT_TEST the .onSet lambdas are recorded by EmitterUi but never executed,
// so no HAL calls fire at emit time.
#include <unity.h>
#include <vector>
#include "ui/EmitterUi.h"
#include "ui/UiModelEncoder.h"
#include "device_ui.h"

// Pull device_ui.cpp (and its dev:: global definitions) into this TU.
// Only this test does this -- no other native test includes device_ui.cpp,
// so there is no multiple-definition risk.
#include "../../../src/device_ui.cpp"

using namespace ecb::ui;

void setUp() {}
void tearDown() {}

static void test_buildui_is_deterministic() {
  EmitterUi a; buildUi(a); UiModel ma = a.build(); std::vector<uint8_t> oa; encodeUiModel(ma, oa);
  EmitterUi b; buildUi(b); UiModel mb = b.build(); std::vector<uint8_t> ob; encodeUiModel(mb, ob);
  TEST_ASSERT_TRUE(oa.size() > 0);
  TEST_ASSERT_EQUAL_UINT32((uint32_t)oa.size(), (uint32_t)ob.size());
  TEST_ASSERT_EQUAL_UINT8_ARRAY(oa.data(), ob.data(), oa.size());
}

int main(int, char**) {
  UNITY_BEGIN();
  RUN_TEST(test_buildui_is_deterministic);
  return UNITY_END();
}
