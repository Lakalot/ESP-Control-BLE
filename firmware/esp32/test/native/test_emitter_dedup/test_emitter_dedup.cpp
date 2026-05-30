// Regression test for the manifest-vs-runtime resource-id divergence.
//
// device_ui.cpp declares some resources MORE THAN ONCE (an idempotent-by-slug
// pattern: a typed creator AND the long-form ui.resource(...), plus a short-form
// widget on the same slug). RuntimeUi dedupes those by slug (findOrRecordResource);
// EmitterUi USED TO append one decl per call. The two then built their 1-based
// sort-by-id IdMaps over DIFFERENT slug sets (more entries on the emitter side),
// so they assigned DIFFERENT ids to the same slug. The tablet (reads the manifest)
// then looked up resource state/deltas under ids the device (publishes under the
// runtime ids) never used -> "unknown" state + no telemetry.
//
// This drives BOTH EmitterUi and RuntimeUi through the SAME description that
// declares a resource more than once, then asserts: (1) the emitter recorded NO
// duplicate resources, (2) every emitted resource id equals the runtime id for the
// same slug, and (3) fields chained across the repeated declarations accumulate
// onto the single merged decl (light.brightness keeps its unit "%").

#include <unity.h>
#include <string>
#include <vector>
#include "ui/EmitterUi.h"
#include "ui/RuntimeUi.h"
#include "ui/UiModelEncoder.h"
#include "EspControlBle.h"
using namespace ecb::ui;
void setUp() {} void tearDown() {}

// Mirrors device_ui.cpp's pattern: a resource declared via a typed creator AND
// via the long-form ui.resource(...), plus a short-form widget on the same slug.
static void describeDup(Ui& ui) {
  ui.requireCapability("layout.sections");
  Res<bool>     relayH = ui.resourceB("relay.auto", ValueType::Bool);          // record #1
  Res<uint32_t> bright = ui.resourceU32("light.brightness", ValueType::Uint);  // record #1
  ui.resource("light.brightness", ValueType::Uint).unit("%");                  // record #2 (same slug)
  ToggleBuilder relay = ui.toggleShort("relay.auto", "Main Power")             // record #2 (same slug)
      .onSet([relayH, bright](bool on){ relayH.set(on); });
  SliderBuilder sl = ui.sliderShort("light.brightness", "Brightness", 0, 100)  // record #3 (same slug)
      .formatHint("percent").pwmPin(2, 100);
  ResourceRef tRef = ui.resource("env.temperature", ValueType::Float).label("Temperature").unit("C");
  Res<float> tHandle = ui.resourceF("env.temperature", ValueType::Float);       // record #2 (same slug)
  ui.view("home","Home").content({ relay, sl, ui.stat("telemetry.temp","Temp", tRef) });
}

static void test_emitter_dedupes_resources_and_ids_match_runtime() {
  EmitterUi e; describeDup(e); UiModel m = e.build();
  EspControl control("TestDev", "123456");
  RuntimeUi rt(control); describeDup(rt); rt.commit();

  // 1) No duplicate resources in the manifest: exactly 3 unique slugs here.
  TEST_ASSERT_EQUAL_UINT32(3u, (uint32_t)m.resources.size());

  // 2) Every manifest resource id == the runtime id for the same slug.
  for (size_t i = 0; i < m.resources.size(); ++i) {
    const char* slug = m.strings.at(m.resources[i].slugIdx);
    TEST_ASSERT_EQUAL_UINT32(rt.resourceId(slug), m.resources[i].id);
  }

  // 3) The merged resource keeps accumulated fields: light.brightness has unit "%".
  bool foundBright = false;
  for (size_t i = 0; i < m.resources.size(); ++i) {
    if (std::string(m.strings.at(m.resources[i].slugIdx)) == "light.brightness") {
      foundBright = true;
      TEST_ASSERT_EQUAL_STRING("%", m.strings.at(m.resources[i].unitIdx));
    }
  }
  TEST_ASSERT_TRUE(foundBright);
}
int main(int,char**){ UNITY_BEGIN(); RUN_TEST(test_emitter_dedupes_resources_and_ids_match_runtime); return UNITY_END(); }
