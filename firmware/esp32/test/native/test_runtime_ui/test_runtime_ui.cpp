// UI-T6: RuntimeUi -- the ESP-side Ui implementation. It visits the SAME fluent
// buildUi(Ui&) description the host-side EmitterUi visits, but instead of building
// a manifest it registers resources + typed action handlers into an EspControl,
// computing the SAME numeric ids the EmitterUi computes. The critical invariant:
// the tablet's manifest ids (from EmitterUi) == the ESP's handler/resource ids
// (from RuntimeUi). This suite proves that, plus typed-payload decoding.
//
// RuntimeUi is two-phase: record (during description, incl. .onSet which fires
// before all actions are known) -> commit() (after the full description, builds
// the per-kind IdMaps over the now-complete slug sets, seeds resources, and
// registerAction()s each captured handler under its resolved action id).

#include <unity.h>
#include <cstdint>
#include <string>
#include <vector>

#include "ui/Ui.h"
#include "ui/EmitterUi.h"
#include "ui/RuntimeUi.h"
#include "ui/ManifestModel.h"
#include "EspControlBle.h"

using namespace ecb::ui;

void setUp() {}
void tearDown() {}

// ---- Shared full description (mirrors test_ui_emitter_full's describeFullDevice
// and firmware/esp32/src/manifest.yaml). Visited by BOTH EmitterUi and RuntimeUi
// so their ids are computed over identical slug sets. ----
static void describeFullDevice(Ui& ui) {
  ui.requireCapability("layout.sections");
  ui.requireCapability("rules.visibility");

  ResourceRef relayAuto = ui.resource("relay.auto", ValueType::Bool)
                              .label("Main Power").readMode(ReadMode::Subscribe).staleAfterMs(5000);
  ResourceRef lightBrightness = ui.resource("light.brightness", ValueType::Uint)
                                    .label("Brightness").unit("%").readMode(ReadMode::Subscribe).staleAfterMs(5000);
  ResourceRef envTemp = ui.resource("env.temperature", ValueType::Float)
                            .label("Temperature").unit("C").readMode(ReadMode::Subscribe).staleAfterMs(5000);
  std::vector<std::string> fanProfiles;
  fanProfiles.push_back("slow"); fanProfiles.push_back("normal"); fanProfiles.push_back("fast");
  ResourceRef fanProfile = ui.resource("fan.profile", ValueType::Enum)
                               .label("Fan Profile").readMode(ReadMode::Subscribe).staleAfterMs(5000)
                               .enumv(fanProfiles);
  ResourceRef systemLoad = ui.resource("system.load", ValueType::Uint)
                               .label("Load").unit("%").readMode(ReadMode::Subscribe).staleAfterMs(3000);
  ResourceRef deviceDebug = ui.resource("device.debug", ValueType::Bool)
                                .label("Debug Mode").readMode(ReadMode::Snapshot).staleAfterMs(10000);
  ResourceRef envHumidity = ui.resource("env.humidity", ValueType::Float)
                                .label("Humidity").unit("%").readMode(ReadMode::Subscribe).staleAfterMs(5000);
  ResourceRef wifiRssi = ui.resource("wifi.rssi", ValueType::Int)
                             .label("WiFi Signal").unit("dBm").readMode(ReadMode::Poll)
                             .pollMs(10000).staleAfterMs(15000);
  ResourceRef systemUptime = ui.resource("system.uptime", ValueType::DurationMs)
                                 .label("Uptime").readMode(ReadMode::Poll)
                                 .pollMs(5000).staleAfterMs(10000);
  ResourceRef deviceName = ui.resource("device.name", ValueType::String)
                               .label("Device Name").readMode(ReadMode::Snapshot).staleAfterMs(60000);
  std::vector<std::string> lightColors;
  lightColors.push_back("warm_white"); lightColors.push_back("cool_white"); lightColors.push_back("red");
  lightColors.push_back("green"); lightColors.push_back("blue"); lightColors.push_back("party");
  ResourceRef lightColor = ui.resource("light.color", ValueType::Enum)
                               .label("Color Preset").readMode(ReadMode::Subscribe).staleAfterMs(5000)
                               .enumv(lightColors);

  ui.action("relay.toggle", "Toggle").valueless();
  ui.action("light.set_brightness", "Set Brightness").integerRange(0, 100);
  ui.action("fan.set_profile", "Set Fan Profile").stringEnum(fanProfiles);
  ui.action("device.set_debug", "Set Debug Mode").danger(Danger::Elevated).boolean();
  ui.action("system.factory_reset", "Factory Reset")
      .danger(Danger::Dangerous).confirm("This will erase all settings. Continue?").valueless();
  ui.action("device.rename", "Rename Device").stringLen(1, 32);
  ui.action("light.set_color", "Set Color").stringEnum(lightColors);
  ui.action("system.restart", "Restart")
      .danger(Danger::Dangerous).confirm("Restart the device now?").valueless();

  ViewBuilder home = ui.view("home", "Home");
  ViewBuilder stats = ui.view("stats", "Stats");
  ViewBuilder settings = ui.view("settings", "Settings");

  home.content({
      ui.text("home.banner", "ESP Control").text("BLE-connected device dashboard."),
      ui.section("lighting.section", "Lighting").children({
          ui.toggle("lighting.toggle", "Main Power", relayAuto).bindAction("relay.toggle"),
          ui.slider("lighting.slider", "Brightness", lightBrightness, 0, 100)
              .bindAction("light.set_brightness").formatHint("percent"),
          ui.select("lighting.color", "Color Preset", lightColor).bindAction("light.set_color"),
      }),
  });

  stats.content({
      ui.section("telemetry.section", "Telemetry").children({
          ui.stat("telemetry.temp", "Temperature", envTemp).formatHint("float_2"),
          ui.stat("telemetry.humidity", "Humidity", envHumidity).formatHint("float_1"),
          ui.stat("telemetry.load", "Load", systemLoad).formatHint("percent"),
          ui.select("telemetry.profile", "Fan Profile", fanProfile).bindAction("fan.set_profile"),
      }),
      ui.section("system.section", "System").children({
          ui.row("system.row").children({
              ui.badge("system.rssi", "WiFi", wifiRssi),
              ui.timer("system.uptime", "Uptime", systemUptime),
          }),
      }),
  });

  settings.content({
      ui.section("settings.section", "Device").children({
          ui.textInput("settings.rename", "Rename Device", deviceName).bindAction("device.rename"),
          ui.button("settings.restart", "Restart").bindAction("system.restart"),
      }),
      ui.section("advanced.section", "Advanced").children({
          ui.toggle("advanced.debug", "Debug Mode", deviceDebug).bindAction("device.set_debug"),
          ui.text("advanced.note").text("Advanced settings"),
          ui.button("advanced.reset", "Factory Reset").bindAction("system.factory_reset"),
      }),
  });

  ui.navItem("home", "Home", "home", home);
  ui.navItem("stats", "Stats", "bar-chart-2", stats);
  ui.navItem("settings", "Settings", "settings", settings);
}

// Find the EmitterUi-emitted id for a resource slug by reversing the StringTable.
static uint32_t emitterResourceId(const UiModel& m, const std::string& slug) {
  for (size_t i = 0; i < m.resources.size(); ++i)
    if (slug == m.strings.at(m.resources[i].slugIdx)) return m.resources[i].id;
  return 0;
}
static uint32_t emitterActionId(const UiModel& m, const std::string& slug) {
  for (size_t i = 0; i < m.actions.size(); ++i)
    if (slug == m.strings.at(m.actions[i].slugIdx)) return m.actions[i].id;
  return 0;
}

// (a) RuntimeUi's ids equal the EmitterUi's emitted ids, over the SAME full
// description. This is the tablet==ESP invariant.
static void test_runtime_ui_ids_match_emitter() {
  EmitterUi emitter;
  describeFullDevice(emitter);
  UiModel m = emitter.build();

  EspControl control("TestDev", "123456");
  RuntimeUi runtime(control);
  describeFullDevice(runtime);
  runtime.commit();

  // Resources: sample a few spread across the sorted set.
  const char* resSlugs[] = {"light.brightness", "relay.auto", "env.temperature",
                            "wifi.rssi", "light.color", "system.uptime"};
  for (size_t i = 0; i < sizeof(resSlugs) / sizeof(resSlugs[0]); ++i) {
    uint32_t want = emitterResourceId(m, resSlugs[i]);
    TEST_ASSERT_NOT_EQUAL(0u, want);
    TEST_ASSERT_EQUAL_UINT32(want, runtime.resourceId(resSlugs[i]));
  }
  // Actions.
  const char* actSlugs[] = {"light.set_brightness", "relay.toggle", "fan.set_profile",
                            "device.set_debug", "system.restart", "light.set_color"};
  for (size_t i = 0; i < sizeof(actSlugs) / sizeof(actSlugs[0]); ++i) {
    uint32_t want = emitterActionId(m, actSlugs[i]);
    TEST_ASSERT_NOT_EQUAL(0u, want);
    TEST_ASSERT_EQUAL_UINT32(want, runtime.actionId(actSlugs[i]));
  }
}

// Helper: build an ActionContext with locals wired to the reply sinks.
struct Reply {
  bool replied;
  ecb::ActionStatus status;
  uint8_t buf[16];
  size_t len;
  Reply() : replied(false), status(ecb::ActionStatus::Unspecified), len(0) {}
};
static ecb::ActionContext makeCtx(Reply& r) {
  ecb::ActionContext ctx;
  ctx.correlationId = 1;
  ctx.valueKind = ecb::ActionValueKind::None;
  ctx.boolValue = false;
  ctx.intValue = 0;
  ctx.uintValue = 0;
  ctx.floatValue = 0.0f;
  ctx.stringValue[0] = '\0';
  ctx.payload = nullptr;
  ctx.payloadLen = 0;
  ctx.replied = &r.replied;
  ctx.status = &r.status;
  ctx.replyBuf = r.buf;
  ctx.replyCap = sizeof(r.buf);
  ctx.replyLen = &r.len;
  return ctx;
}

// (b) A slider's typed .onSet(uint8) handler is registered under the bound action
// id, decodes a Uint payload, and rejects a mismatched payload with BadPayload.
static uint32_t g_captured;
static int      g_callCount;
static void test_runtime_ui_typed_handler_decodes() {
  g_captured = 0;
  g_callCount = 0;

  EspControl control("TestDev", "123456");
  RuntimeUi runtime(control);
  // Minimal description: one resource + one slider bound to an action, with onSet.
  ResourceRef br = runtime.resource("light.brightness", ValueType::Uint).label("Brightness");
  runtime.slider("ui.slider", "Brightness", br, 0, 100)
      .bindAction("light.set_brightness")
      .onSet([](uint8_t v) { g_captured = v; g_callCount += 1; });
  runtime.commit();

  uint32_t aid = runtime.actionId("light.set_brightness");
  TEST_ASSERT_NOT_EQUAL(0u, aid);
  const ecb::ActionHandler* h = control.actions().find(aid);
  TEST_ASSERT_NOT_NULL(h);

  // Correct payload: Uint 42 -> handler called, replyOk.
  {
    Reply r;
    ecb::ActionContext ctx = makeCtx(r);
    ctx.valueKind = ecb::ActionValueKind::Uint;
    ctx.uintValue = 42;
    (*h)(ctx);
    TEST_ASSERT_EQUAL_UINT32(42u, g_captured);
    TEST_ASSERT_EQUAL_INT(1, g_callCount);
    TEST_ASSERT_TRUE(r.replied);
    TEST_ASSERT_EQUAL_UINT8(static_cast<uint8_t>(ecb::ActionStatus::Ok), static_cast<uint8_t>(r.status));
  }

  // Mismatched payload: Bool -> BadPayload, user lambda NOT called again.
  {
    Reply r;
    ecb::ActionContext ctx = makeCtx(r);
    ctx.valueKind = ecb::ActionValueKind::Bool;
    ctx.boolValue = true;
    (*h)(ctx);
    TEST_ASSERT_EQUAL_INT(1, g_callCount);  // unchanged
    TEST_ASSERT_TRUE(r.replied);
    TEST_ASSERT_EQUAL_UINT8(static_cast<uint8_t>(ecb::ActionStatus::BadPayload), static_cast<uint8_t>(r.status));
  }
}

// (c) After commit, RuntimeUi has seeded the resource into the control's table
// under the SAME id the emitter assigns, so the host can answer a snapshot.
static void test_runtime_ui_registers_resource() {
  EspControl control("TestDev", "123456");
  RuntimeUi runtime(control);
  runtime.resource("light.brightness", ValueType::Uint).label("Brightness");
  runtime.commit();

  uint32_t id = runtime.resourceId("light.brightness");
  TEST_ASSERT_NOT_EQUAL(0u, id);
  ecb::ResourceValue rv;
  TEST_ASSERT_TRUE(control.resources().get(id, rv));
  TEST_ASSERT_EQUAL_UINT8(static_cast<uint8_t>(ecb::ResourceValueKind::Uint), static_cast<uint8_t>(rv.kind));
}

static void test_runtimeui_value_hooks_write_table() {
  EspControl control("TestDev", "123456");
  ecb::ui::RuntimeUi rt(control);
  // Drive the hooks directly with a known id.
  rt.uiWrite(28u, (uint32_t)77u);
  ecb::ResourceValue v;
  TEST_ASSERT_TRUE(control.resources().get(28u, v));
  TEST_ASSERT_EQUAL_UINT32(77u, v.uintValue);
  TEST_ASSERT_EQUAL_UINT32(77u, rt.uiReadUint(28u));

  rt.uiWrite(29u, true);
  TEST_ASSERT_TRUE(control.resources().get(29u, v));
  TEST_ASSERT_TRUE(v.boolValue);

  rt.uiWrite(30u, "warm");
  TEST_ASSERT_TRUE(control.resources().get(30u, v));
  TEST_ASSERT_EQUAL_STRING("warm", v.stringValue);
}

int main(int, char**) {
  UNITY_BEGIN();
  RUN_TEST(test_runtime_ui_ids_match_emitter);
  RUN_TEST(test_runtime_ui_typed_handler_decodes);
  RUN_TEST(test_runtime_ui_registers_resource);
  RUN_TEST(test_runtimeui_value_hooks_write_table);
  return UNITY_END();
}
