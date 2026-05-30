// Single-source device UI description. This ONE buildUi(...) is visited twice:
//   * EmitterUi (host, via tools/ui_emit_main.cpp) -> normalized UiModel -> nanopb
//     -> src/manifest_data.h (the embedded manifest the tablet reads).
//   * RuntimeUi (ESP, a later wiring task) -> registers resources + the typed
//     .onSet handlers below.
//
// Mirrors firmware/esp32/src/manifest.yaml EXACTLY (11 resources, 8 actions, an
// appShell navBar of 3 items, 3 views of widgets/containers) so the emitted
// protobuf stays byte-for-byte identical to the legacy YAML->TS output. The body
// is the former test_ui_emitter_full.cpp describeFullDevice(), now the real
// authoring source, plus .onSet(...) handler lambdas.
//
// Handlers capture `rt` and mutate DeviceState through AppRuntime's inline
// helpers (host-portable: no Arduino). EmitterUi IGNORES .onSet entirely, so they
// never run at emit time and do not affect the emitted bytes. RuntimeUi will run
// them on the device; the resource publish/sync side that needs Arduino still
// lives in DeviceActions and is wired separately.

#include "ui/Ui.h"

#include "runtime/AppRuntime.h"

using namespace ecb::ui;

// Forward-declared in tools/ui_emit_main.cpp (host) and the ESP runtime wiring.
void buildUi(Ui& ui, app::AppRuntime& rt);

void buildUi(Ui& ui, app::AppRuntime& rt) {
  // -- capabilities (required, in order) --
  ui.requireCapability("layout.sections");
  ui.requireCapability("rules.visibility");

  // -- resources (manifest order: slug, label, unit, enumValues interned here) --
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

  // -- actions (declared in manifest order -> pins string-table intern order) --
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

  // -- views --
  ViewBuilder home = ui.view("home", "Home");
  ViewBuilder stats = ui.view("stats", "Stats");
  ViewBuilder settings = ui.view("settings", "Settings");

  // home: banner text + Lighting section (toggle/slider/select).
  home.content({
      ui.text("home.banner", "ESP Control").text("BLE-connected device dashboard."),
      ui.section("lighting.section", "Lighting").children({
          ui.toggle("lighting.toggle", "Main Power", relayAuto).bindAction("relay.toggle")
              .onSet([&rt](bool /*on*/) {
                rt.toggleRelay();
                if (rt.state().relayEnabled && rt.state().brightness == 0) rt.setBrightness(100u);
              }),
          ui.slider("lighting.slider", "Brightness", lightBrightness, 0, 100)
              .bindAction("light.set_brightness").formatHint("percent")
              .onSet([&rt](uint8_t value) { rt.setBrightness(static_cast<uint32_t>(value)); }),
          ui.select("lighting.color", "Color Preset", lightColor).bindAction("light.set_color")
              .onSet([&rt](const char* preset) { rt.setColorPreset(preset); }),
      }),
  });

  // stats: Telemetry section (stats + select) + System section (row of badge/timer).
  stats.content({
      ui.section("telemetry.section", "Telemetry").children({
          ui.stat("telemetry.temp", "Temperature", envTemp).formatHint("float_2"),
          ui.stat("telemetry.humidity", "Humidity", envHumidity).formatHint("float_1"),
          ui.stat("telemetry.load", "Load", systemLoad).formatHint("percent"),
          ui.select("telemetry.profile", "Fan Profile", fanProfile).bindAction("fan.set_profile")
              .onSet([&rt](const char* profile) { rt.setFanProfile(profile); }),
      }),
      ui.section("system.section", "System").children({
          ui.row("system.row").children({
              ui.badge("system.rssi", "WiFi", wifiRssi),
              ui.timer("system.uptime", "Uptime", systemUptime),
          }),
      }),
  });

  // settings: Device section (text_input + button) + Advanced section (toggle/text/button).
  settings.content({
      ui.section("settings.section", "Device").children({
          ui.textInput("settings.rename", "Rename Device", deviceName).bindAction("device.rename")
              .onSet([&rt](const char* name) { rt.setDeviceName(name); }),
          ui.button("settings.restart", "Restart").bindAction("system.restart")
              .onSet([]() { /* device restart handled by DeviceActions wiring */ }),
      }),
      ui.section("advanced.section", "Advanced").children({
          ui.toggle("advanced.debug", "Debug Mode", deviceDebug).bindAction("device.set_debug")
              .onSet([&rt](bool enabled) { rt.setDebugEnabled(enabled); }),
          ui.text("advanced.note").text("Advanced settings"),
          ui.button("advanced.reset", "Factory Reset").bindAction("system.factory_reset")
              .onSet([]() { /* factory reset handled by DeviceActions wiring */ }),
      }),
  });

  // appShell navBar (declaration order: home/stats/settings).
  ui.navItem("home", "Home", "home", home);
  ui.navItem("stats", "Stats", "bar-chart-2", stats);
  ui.navItem("settings", "Settings", "settings", settings);
}
