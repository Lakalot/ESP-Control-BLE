// DX-T5: SHORT-FORM widget builders. A single call (ui.sliderShort/toggleShort/
// selectShort/textInputShort/buttonShort) bundles the long-form low-level calls
// (recordResource + resourceLabel + recordAction + actionSchema* + recordWidget +
// nodeTitle + bindWidgetAction) AND installs a DEFAULT .onSet that writes the
// decoded value into the widget's resource. A user .onSet on the same widget
// OVERRIDES the default (user wins).
//
// Two invariants under test:
//   (a) STRUCTURE: the short form emits bytes byte-identical to the equivalent
//       long form (it must record exactly the same fields, nothing more/less).
//   (b) BEHAVIOR: on RuntimeUi, the default .onSet writes the resource so a mobile
//       command updates the table even with no user-supplied handler.

#include <unity.h>
#include <vector>
#include <cstdint>
#include "ui/Ui.h"
#include "ui/EmitterUi.h"
#include "ui/RuntimeUi.h"
#include "ui/UiModelEncoder.h"
#include "ui/HwHal.h"
#include "EspControlBle.h"
using namespace ecb::ui;
void setUp() {} void tearDown() {}

// SHORT form: one call makes resource + action + widget + default onSet.
static void describeShort(Ui& ui) {
  ui.view("home", "Home").content(
    ui.sliderShort("light.brightness", "Brightness", 0, 100)
  );
}
// LONG form: same structure spelled out with the existing API.
static void describeLong(Ui& ui) {
  ResourceRef b = ui.resource("light.brightness", ValueType::Uint);
  b.label("Brightness");
  ui.action("light.brightness.set", "Brightness").integerRange(0, 100);
  ui.view("home", "Home").content(
    ui.slider("light.brightness", "Brightness", b, 0, 100).bindAction("light.brightness.set")
  );
}
static std::vector<uint8_t> emit(void (*fn)(Ui&)) {
  EmitterUi e; fn(e); UiModel m = e.build(); std::vector<uint8_t> out; encodeUiModel(m, out); return out;
}
static void test_short_equals_long_bytes() {
  std::vector<uint8_t> s = emit(describeShort);
  std::vector<uint8_t> l = emit(describeLong);
  TEST_ASSERT_EQUAL_UINT32((uint32_t)l.size(), (uint32_t)s.size());
  TEST_ASSERT_EQUAL_UINT8_ARRAY(l.data(), s.data(), l.size());
}
static void test_short_form_default_onset_writes() {
  EspControl control("TestDev", "123456");
  RuntimeUi rt(control);
  describeShort(rt);
  rt.commit();
  uint32_t aid = rt.actionId("light.brightness.set");
  const ecb::ActionHandler* h = control.actions().find(aid);
  TEST_ASSERT_NOT_NULL(h);
  ecb::ActionContext ctx; bool replied=false; ecb::ActionStatus st=ecb::ActionStatus::Unspecified;
  uint8_t rb[8]; size_t rl=0;
  ctx.valueKind=ecb::ActionValueKind::Uint; ctx.uintValue=60u;
  ctx.replied=&replied; ctx.status=&st; ctx.replyBuf=rb; ctx.replyCap=sizeof(rb); ctx.replyLen=&rl;
  (*h)(ctx);
  ecb::ResourceValue v;
  TEST_ASSERT_TRUE(control.resources().get(rt.resourceId("light.brightness"), v));
  TEST_ASSERT_EQUAL_UINT32(60u, v.uintValue);
}
static void test_short_form_user_onset_suppresses_default() {
  EspControl control("TestDev", "123456");
  RuntimeUi rt(control);
  static uint8_t captured; captured = 0;
  rt.view("home", "Home").content(
    rt.sliderShort("light.brightness", "Brightness", 0, 100)
      .onSet([](uint8_t v){ captured = v; })
  );
  rt.commit();
  // Pre-seed the resource to a sentinel so we can detect whether the default wrote it.
  uint32_t rid = rt.resourceId("light.brightness");
  control.resources().setUint(rid, 7u);
  uint32_t aid = rt.actionId("light.brightness.set");
  const ecb::ActionHandler* h = control.actions().find(aid);
  TEST_ASSERT_NOT_NULL(h);
  ecb::ActionContext ctx; bool replied=false; ecb::ActionStatus st=ecb::ActionStatus::Unspecified;
  uint8_t rb[8]; size_t rl=0;
  ctx.valueKind=ecb::ActionValueKind::Uint; ctx.uintValue=88u;
  ctx.replied=&replied; ctx.status=&st; ctx.replyBuf=rb; ctx.replyCap=sizeof(rb); ctx.replyLen=&rl;
  (*h)(ctx);
  // User handler ran:
  TEST_ASSERT_EQUAL_UINT8(88u, captured);
  // Default did NOT run -> resource still holds sentinel 7 (NOT 88):
  ecb::ResourceValue v;
  TEST_ASSERT_TRUE(control.resources().get(rid, v));
  TEST_ASSERT_EQUAL_UINT32(7u, v.uintValue);
}
// A short-form slider's .pwmPin(pin,rangeMax) (a WidgetBuilder method) must route
// through to the resource's HW config so the DEFAULT setter (no user .onSet) drives
// the HAL on set(): write resource -> applyDefaultHw -> halAnalogWrite(pin, duty).
static int g_dpin=-1, g_dval=-1;
static void dFakeAnalog(uint8_t pin, int val){ g_dpin=pin; g_dval=val; }
static void test_builder_pwmpin_drives_hal() {
  EspControl control("TestDev", "123456");
  ecb::ui::RuntimeUi rt(control);
  ecb::ui::setAnalogWriteForTest(&dFakeAnalog);
  // short-form slider WITH .pwmPin(2,100). No custom .onSet -> default setter writes
  // the resource, and the captured HW config drives the declared PWM.
  rt.view("home","Home").content(
    rt.sliderShort("light.brightness","Brightness",0,100).pwmPin(2, 100)
  );
  rt.commit();
  g_dpin=-1; g_dval=-1;
  // invoke the default action handler with uint 50 -> resource set -> applyHw -> HAL
  uint32_t aid = rt.actionId("light.brightness.set");
  const ecb::ActionHandler* h = control.actions().find(aid);
  TEST_ASSERT_NOT_NULL(h);
  ecb::ActionContext ctx; bool replied=false; ecb::ActionStatus st=ecb::ActionStatus::Unspecified;
  uint8_t rb[8]; size_t rl=0;
  ctx.valueKind=ecb::ActionValueKind::Uint; ctx.uintValue=50u;
  ctx.replied=&replied; ctx.status=&st; ctx.replyBuf=rb; ctx.replyCap=sizeof(rb); ctx.replyLen=&rl;
  (*h)(ctx);
  TEST_ASSERT_EQUAL_INT(2, g_dpin);
  TEST_ASSERT_EQUAL_INT(127, g_dval);   // map(50,0,100,0,255)=127
  ecb::ui::setAnalogWriteForTest(nullptr);
}
int main(int,char**){ UNITY_BEGIN();
  RUN_TEST(test_short_equals_long_bytes);
  RUN_TEST(test_short_form_default_onset_writes);
  RUN_TEST(test_short_form_user_onset_suppresses_default);
  RUN_TEST(test_builder_pwmpin_drives_hal);
  return UNITY_END(); }
