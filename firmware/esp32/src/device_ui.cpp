// Single-source device UI description. This ONE buildUi(Ui&) is visited twice:
//   * EmitterUi (host, via tools/ui_emit_main.cpp) -> normalized UiModel -> nanopb
//     -> src/generated/manifest_data.h (the embedded manifest the tablet reads).
//   * RuntimeUi (ESP, via EspControl::beginUi) -> registers resources + the typed
//     .onSet handlers + the default value-setters below.
//
// This file is HOST-PORTABLE: it is compiled by tools/emit_ui.py with the same host
// g++ the native tests use (-DECB_HOST_EMIT, NO Arduino, NO EspControl). It needs no
// "hardware" calls at all: the brightness slider declares its on-board LED pin via
// .pwmPin(...), and the library drives that pin on every set() (host build is a no-op).
// EmitterUi ignores both .onSet and .pwmPin (HW is not in the manifest), so they never
// run at emit time and do not affect the emitted bytes.
//
// The device is a demo "smart light": a relay (Main Power), a brightness slider
// (declares the on-board LED via .pwmPin, so the library PWMs it), color + fan presets,
// a debug toggle, a device rename field, restart/factory-reset buttons, and display-only
// telemetry (temperature/humidity/load/wifi rssi/uptime) pushed from loop().
//
// Each widget is declared ONCE (short forms bundle resource + "<slug>.set" action +
// widget + a default value-setter) and the resulting builder is placed into a view's
// content()/children(). A custom .onSet SUPPRESSES the default setter, so a handler
// that needs custom logic also writes its own resource.

#include "device_ui.h"

using namespace ecb::ui;

namespace {
// On-board LED used as the dimmable "light" output. Declared on the brightness
// slider via .pwmPin(kLedPin, 100): the library maps 0..100% -> 0..255 duty and
// writes the pin whenever the brightness resource is set.
const uint8_t kLedPin = 2u;
}  // namespace

// -- telemetry handles (defined here, declared in device_ui.h; written from loop) --
namespace dev {
Res<float>    temperature;
Res<float>    humidity;
Res<uint32_t> load;
Res<int32_t>  rssi;
Res<uint32_t> uptime;
}  // namespace dev

void buildUi(Ui& ui) {
  // -- capabilities --
  ui.requireCapability("layout.sections");

  // ---- interactive controls (declared once; placed in the layout below) ----

  // Typed handles for the relay <-> brightness cross-reference. resourceB/resourceU32
  // record-or-reuse a resource by slug; the short forms below reuse these same slugs.
  Res<bool>     relayH = ui.resourceB("relay.auto", ValueType::Bool);
  Res<uint32_t> bright = ui.resourceU32("light.brightness", ValueType::Uint);
  // The "%" unit lives on the resource (idempotent by slug; the slider's short form
  // records the same resource). Widget builders carry no .unit().
  ui.resource("light.brightness", ValueType::Uint).unit("%");

  // Main Power relay: writes its own resource and steers the LED through the
  // brightness resource (whose .pwmPin drives the pin). Custom onSet, so it writes
  // `relayH` itself; setting `bright` re-drives the LED via the declarative PWM:
  //   off       -> brightness 0 (LED off)
  //   on (dark) -> brightness 100 (full)
  //   on        -> re-set current brightness to refresh the LED
  ToggleBuilder relay = ui.toggleShort("relay.auto", "Main Power")
      .onSet([relayH, bright](bool on) {
        relayH.set(on);
        if (!on) bright.set(0u);
        else bright.set(bright.get() == 0u ? 100u : bright.get());
      });

  // Brightness slider: DECLARATIVE PWM. .pwmPin(kLedPin, 100) makes the library map
  // 0..100% -> 0..255 duty and write the LED on every set(). No custom .onSet -> the
  // short form's default setter writes the resource AND drives the declared pin.
  SliderBuilder brightness = ui.sliderShort("light.brightness", "Brightness", 0, 100)
      .formatHint("percent")
      .pwmPin(kLedPin, 100);

  // Presets / flags / rename: no custom logic -> the short form's default setter
  // writes the resource automatically.
  SelectBuilder color = ui.selectShort("light.color", "Color Preset",
      {"warm_white", "cool_white", "red", "green", "blue", "party"});
  SelectBuilder fan = ui.selectShort("fan.profile", "Fan Profile", {"slow", "normal", "fast"});
  ToggleBuilder debug = ui.toggleShort("device.debug", "Debug Mode");
  TextInputBuilder rename = ui.textInputShort("device.name", "Rename Device");

  // Destructive buttons: declared LONG-FORM so each carries a danger level + a
  // confirm string. The mobile app reads these from the manifest and shows a
  // confirmation dialog before sending the action (the short form can't express
  // danger/confirm). The valueless action is declared up front, then a button node
  // binds it by slug. Device restart/reset is an app concern; the empty .onSet
  // keeps a valueless handler that just replies Ok.
  ui.action("system.restart", "Restart")
      .danger(Danger::Dangerous).confirm("Restart the device now?").valueless();
  ButtonBuilder restart = ui.button("settings.restart", "Restart")
      .bindAction("system.restart").onSet([]() {});

  ui.action("system.factory_reset", "Factory Reset")
      .danger(Danger::Dangerous).confirm("This will erase all settings. Continue?").valueless();
  ButtonBuilder factoryReset = ui.button("advanced.reset", "Factory Reset")
      .bindAction("system.factory_reset").onSet([]() {});

  // ---- telemetry (display-only) -- recorded via the long-form ui.resource(...) so
  //      the display widgets can bind to the ResourceRef, AND grabbed again as typed
  //      Res<T> handles (idempotent by slug) for pushing values from loop(). --------
  ResourceRef tempRef = ui.resource("env.temperature", ValueType::Float)
      .label("Temperature").unit("C").readMode(ReadMode::Subscribe).staleAfterMs(5000);
  ResourceRef humidityRef = ui.resource("env.humidity", ValueType::Float)
      .label("Humidity").unit("%").readMode(ReadMode::Subscribe).staleAfterMs(5000);
  ResourceRef loadRef = ui.resource("system.load", ValueType::Uint)
      .label("Load").unit("%").readMode(ReadMode::Subscribe).staleAfterMs(3000);
  // Subscribe (not Poll): the mobile app only subscribes to subscribe-mode resources
  // (it never actively polls), so Poll telemetry never reached the tablet (rssi stale,
  // uptime stuck at --:--). loop() pushes these on a timer; the device sends the deltas.
  ResourceRef rssiRef = ui.resource("wifi.rssi", ValueType::Int)
      .label("WiFi Signal").unit("dBm").readMode(ReadMode::Subscribe).staleAfterMs(15000);
  ResourceRef uptimeRef = ui.resource("system.uptime", ValueType::DurationMs)
      .label("Uptime").readMode(ReadMode::Subscribe).staleAfterMs(10000);

  dev::temperature = ui.resourceF("env.temperature", ValueType::Float);
  dev::humidity    = ui.resourceF("env.humidity", ValueType::Float);
  dev::load        = ui.resourceU32("system.load", ValueType::Uint);
  dev::rssi        = ui.resourceI32("wifi.rssi", ValueType::Int);
  dev::uptime      = ui.resourceU32("system.uptime", ValueType::DurationMs);

  // ---- layout: 3 views (home / stats / settings) + an app-shell nav bar ----

  // home: banner + a Lighting section (power / brightness / color).
  ViewBuilder home = ui.view("home", "Home");
  home.content({
      ui.text("home.banner", "ESP Control").text("BLE-connected device dashboard."),
      ui.section("lighting.section", "Lighting").children({relay, brightness, color}),
  });

  // stats: a Telemetry section (stats + fan select) + a System section (rssi/uptime).
  ViewBuilder stats = ui.view("stats", "Stats");
  stats.content({
      ui.section("telemetry.section", "Telemetry").children({
          ui.stat("telemetry.temp", "Temperature", tempRef).formatHint("float_2"),
          ui.stat("telemetry.humidity", "Humidity", humidityRef).formatHint("float_1"),
          ui.stat("telemetry.load", "Load", loadRef).formatHint("percent"),
          fan,
      }),
      ui.section("system.section", "System").children({
          ui.row("system.row").children({
              ui.badge("system.rssi", "WiFi", rssiRef),
              ui.timer("system.uptime", "Uptime", uptimeRef),
          }),
      }),
  });

  // settings: a Device section (rename / restart) + an Advanced section (debug / reset).
  ViewBuilder settings = ui.view("settings", "Settings");
  settings.content({
      ui.section("settings.section", "Device").children({rename, restart}),
      ui.section("advanced.section", "Advanced").children({
          debug,
          ui.text("advanced.note").text("Advanced settings"),
          factoryReset,
      }),
  });

  // app-shell nav bar (declaration order: home / stats / settings).
  ui.navItem("home", "Home", "home", home);
  ui.navItem("stats", "Stats", "bar-chart-2", stats);
  ui.navItem("settings", "Settings", "settings", settings);
}
