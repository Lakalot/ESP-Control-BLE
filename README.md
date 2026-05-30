# ESP-Control-BLE

BLE-connected IoT dashboard for ESP32. Describe your device UI and handlers in one C++ file, build with PlatformIO (no Node needed), and control everything from your phone -- no mobile app code required.

## How It Works

```
┌──────────────┐         BLE          ┌──────────────────┐
│              │  ◄─────────────────►  │                  │
│   ESP32      │   Manifest transfer   │   Mobile App     │
│   Firmware   │   Resource sync       │   (React Native) │
│              │   Action dispatch     │                  │
└──────────────┘                       └──────────────────┘
```

1. You describe your device's **resources** (data), **actions** (controls), **UI layout**, and the **action handlers** in one C++ file -- `firmware/esp32/app/device/device_ui.cpp` -- using a fluent `buildUi(...)` builder
2. At build time, a pure-C++ host tool walks `buildUi(...)` to emit the protobuf manifest and type-safe symbol constants, embedded into the firmware (no Node/pnpm)
3. The mobile app connects via BLE, downloads the manifest, and **renders the UI automatically**
4. On the device, the same `buildUi(...)` registers each resource and its typed `.onSet` handler; handlers forward values to your business logic and the library publishes resource updates over BLE

> **Migrating from YAML?** Earlier versions authored the device in `src/manifest.yaml`
> compiled by a Node toolchain. That path is now legacy: the device is described in
> `device_ui.cpp` and the manifest is emitted from C++ at build time. The
> YAML-centric sections below are retained for reference to the manifest data model
> (resource/action fields, value types), which is unchanged.

## Quick Start

### Prerequisites

- [PlatformIO](https://platformio.org/) (installed via VSCode extension or CLI) -- builds the firmware **and** emits the manifest from C++; no Node needed for the firmware
- An ESP32 board
- For the mobile app only: [Node.js](https://nodejs.org/) 18+, [pnpm](https://pnpm.io/), and [Expo](https://docs.expo.dev/)

### 1. Install dependencies

The firmware needs no JS dependencies -- a clone + PlatformIO is enough. The
Node/pnpm steps below are only for the mobile app and the legacy manifest tooling
(kept as the test oracle, not invoked by the firmware build):

```bash
# Mobile app
cd apps/mobile
npm install

# (optional) Legacy/oracle manifest tools at the repo root
pnpm install
```

### 2. Build the firmware

```bash
cd firmware/esp32

# Build debug
pio run

# Build & flash
pio run -t upload

# Serial monitor
pio device monitor
```

### 3. Run the mobile app

```bash
cd apps/mobile

# Start dev server
npx expo start

# Android
npx expo run:android

# iOS
npx expo run:ios
```

### 4. Connect

1. Open the app on your phone
2. Scan for BLE devices -- your ESP32 advertises as `ESP32-Test`
3. Enter the default PIN: `1234`
4. The dashboard renders automatically from your manifest

---

## Project Structure

```
ESP-Control-BLE/
├── firmware/esp32/            # ESP32 firmware (PlatformIO / Arduino)
│   ├── app/                   # Your application code
│   │   ├── main.cpp           # Entry point
│   │   ├── device/            # Business logic
│   │   │   ├── DeviceState.h  # Your device's mutable state
│   │   │   ├── DeviceLogic.h  # Portable state mutators + enum<->slug mappers
│   │   │   ├── device_ui.cpp  # Declarative UI + typed .onSet handlers (buildUi)
│   │   │   └── DeviceTelemetry# Periodic sensor/resource publishing
│   │   └── runtime/           # AppRuntime (ActionSink seam) + publish scheduler
│   ├── src/
│   │   ├── manifest.yaml      # Legacy YAML manifest (no longer built; see device_ui.cpp)
│   │   ├── manifest_data.h    # Auto-generated protobuf binary
│   │   └── manifest_symbols.* # Auto-generated C++ symbol constants
│   ├── lib/esp-control-ble/   # Core BLE protocol library (incl. ui/ builder)
│   └── tools/
│       ├── emit_ui.py         # Pre-build: device_ui.cpp → protobuf + symbols (pure C++, no Node)
│       └── ui_emit_main.cpp   # Host emitter main() compiled & run by emit_ui.py
│
├── apps/mobile/               # React Native mobile app (don't edit)
│   └── src/manifest/          # Auto-renders from your manifest
│
├── tools/manifest/            # Manifest compiler CLI
│   ├── tests/fixtures/
│   │   └── demo.manifest.yaml # Example YAML authoring fixture
│   └── src/cli/main.ts        # validate, compile, inspect, symbols
│
├── proto/                     # Protobuf definitions
│   └── manifest.proto
│
└── package.json               # pnpm workspace root
```

---

## The Manifest (data model)

The manifest defines what your device **is** -- its data model, controls, and UI.
The mobile app reads it and renders everything automatically.

> **Authoring note:** the firmware demo no longer authors this in YAML. It is
> described in C++ via `buildUi(...)` in `firmware/esp32/app/device/device_ui.cpp`
> (see [Building the Manifest](#building-the-manifest) and
> [Firmware Business Logic](#firmware-business-logic)). The YAML below documents the
> **manifest data model** -- the resource/action fields, value types, read modes,
> and danger levels -- which is identical regardless of how you author it. The
> builder method names map directly onto these fields (e.g. `.readMode(...)`,
> `.unit(...)`, `.integerRange(...)`). The legacy YAML toolchain
> (`tools/manifest`, `src/manifest.yaml`) is kept only as the test oracle.

### Minimal Example (No Navigation Bar)

```yaml
version: 5
schemaVersion: 1
minAppVersion: 1.0.0
capabilities:
  required:
    - layout.sections
  optional: []
resources:
  - id: led.power
    firmwareSymbol: led_power
    label: Power
    valueType: bool
    readMode: subscribe
    staleAfterMs: 5000
actions:
  - id: led.toggle
    firmwareSymbol: led_toggle
    label: Toggle
    dangerLevel: normal
    inputSchema:
      type: object
      additionalProperties: false
      properties: {}
views:
  - id: home
    title: Home
    content:
      - kind: section
        id: power.section
        title: Controls
        content:
          - kind: toggle
            id: power.toggle
            title: Power
            resource: led.power
            action: led.toggle
```

The authoring form is intentionally shorter than the canonical manifest schema. Each `views[].content` entry is expanded into canonical `views` and `nodes`, and omitted firmware symbols are derived from authored ids.

### Top-Level Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `version` | `5` | Yes | Protocol version (always `5`) |
| `schemaVersion` | integer | Yes | Schema revision (always `1`) |
| `minAppVersion` | string | Yes | Minimum mobile app version (semver) |
| `capabilities` | object | Yes | Feature requirements for the app |
| `appShell` | object | Canonical only today | Not accepted in authored CLI YAML input today; used by the canonical manifest shape |
| `resources` | array | Yes | Data resources (max 128) |
| `actions` | array | Yes | Callable actions (max 128) |
| `views` | array | Yes | Authored UI views (max 32) |
| `nodes` | array | Generated | Canonical UI tree emitted from authored `views[].content` |

### Views And Optional Bottom Navigation

Manifest authoring now uses `views`. Each view contains nested `content`, and the compiler expands that content into canonical nodes.

Minimal example without nav:

```yaml
views:
  - id: home
    title: Home
    content:
      - kind: toggle
        id: home.power
        title: Power
        resource: led.power
        action: led.toggle
```

Bottom navigation exists in the canonical manifest model, but the current authored YAML schema does not accept `appShell.navBar` yet. Treat nav configuration as unsupported in CLI `.yaml` input for now, even though the runtime canonical manifest can carry it.

Common Feather icon names: `home`, `bar-chart-2`, `settings`, `sliders`, `activity`, `thermometer`, `wifi`, `clock`, `toggle-left`, `power`.

Unknown icon names currently fall back to `circle` in the mobile app.

Icon reference: Expo ships Feather icons through `@expo/vector-icons`. Browse names at https://icons.expo.fyi/ and the Feather set docs at https://docs.expo.dev/guides/icons/.

### ID Rules

All `id` fields use the **SlugId** format: lowercase alphanumeric with dots for grouping.

Pattern: `^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$`

Examples: `relay.auto`, `env.temperature`, `light.brightness`, `system.load`

All `firmwareSymbol` fields use **snake_case** C identifiers:

Pattern: `^[a-z][a-z0-9_]*$` (not a C++ reserved keyword)

Examples: `relay_auto`, `env_temperature`, `light_brightness`

---

## Resources

Resources represent the data your device exposes. The mobile app subscribes to them and displays live values.

### Schema

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | SlugId | Yes | Unique resource identifier (e.g. `"env.temperature"`) |
| `firmwareSymbol` | string | Yes | C++ constant name (e.g. `"env_temperature"`) |
| `label` | string | Yes | Human-readable label (1-64 chars) |
| `valueType` | enum | Yes | Data type (see below) |
| `unit` | string | No | Unit suffix displayed in UI (max 16 chars, e.g. `"C"`, `"%"`, `"dBm"`) |
| `readMode` | enum | Yes | How the app reads data |
| `staleAfterMs` | integer | Yes | Mark as stale after N ms without update (1 - 3,600,000) |
| `pollMs` | integer | No | Poll interval in ms (required if readMode is `poll`, 100 - 60,000) |
| `enumValues` | string[] | No | Enum option names (required if valueType is `enum`, 1-32 items) |

### Value Types

| Type | Description | C++ setter | Example |
|---|---|---|---|
| `bool` | Boolean | `setBool(id, true)` | Relay on/off |
| `int` | Signed 32-bit integer | `setInt(id, -58)` | WiFi RSSI |
| `uint` | Unsigned 32-bit integer | `setUint(id, 75)` | Brightness % |
| `float` | 32-bit float | `setFloat(id, 23.5)` | Temperature |
| `string` | String (max 64 chars) | `setString(id, "hello")` | Device name |
| `enum` | Enum string value | `setString(id, "slow")` | Fan profile |
| `duration_ms` | Duration in milliseconds | `setUint(id, 3600000)` | Uptime |

### Read Modes

| Mode | Description |
|---|---|
| `subscribe` | Push-based: firmware publishes deltas, app listens |
| `poll` | Periodic: app expects regular updates at `pollMs` intervals |
| `snapshot` | One-shot: sent once on connection/subscription |

### Examples

```yaml
- id: env.temperature
  firmwareSymbol: env_temperature
  label: Temperature
  valueType: float
  unit: C
  readMode: subscribe
  staleAfterMs: 5000
- id: fan.profile
  firmwareSymbol: fan_profile
  label: Fan Profile
  valueType: enum
  readMode: subscribe
  staleAfterMs: 5000
  enumValues: [slow, normal, fast]
- id: wifi.rssi
  firmwareSymbol: wifi_rssi
  label: WiFi Signal
  valueType: int
  unit: dBm
  readMode: poll
  pollMs: 10000
  staleAfterMs: 15000
- id: system.uptime
  firmwareSymbol: system_uptime
  label: Uptime
  valueType: duration_ms
  readMode: poll
  pollMs: 5000
  staleAfterMs: 10000
```

---

## Actions

Actions are operations the user can trigger from the mobile UI.

### Schema

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | SlugId | Yes | Unique action identifier |
| `firmwareSymbol` | string | Yes | C++ constant name |
| `label` | string | Yes | Button/trigger label |
| `dangerLevel` | enum | Yes | `normal`, `elevated`, or `dangerous` |
| `confirm` | string | No | Confirmation dialog text (shown before execution) |
| `cooldownMs` | integer | No | Min time between invocations (0-60,000 ms) |
| `inputSchema` | JSON Schema | Yes | Describes the input payload |

### Danger Levels

| Level | UI Behavior |
|---|---|
| `normal` | Immediate execution |
| `elevated` | Visual warning |
| `dangerous` | Confirmation dialog required |

### inputSchema Patterns

The `inputSchema` follows JSON Schema conventions. The app extracts a `value` field and sends it as the action payload.

**No parameters** (toggle, reset, restart):
```yaml
type: object
additionalProperties: false
properties: {}
```

**Integer with bounds** (brightness 0-100):
```yaml
type: object
additionalProperties: false
required: [value]
properties:
  value:
    type: integer
    minimum: 0
    maximum: 100
```

**Boolean** (debug toggle):
```yaml
type: object
additionalProperties: false
required: [value]
properties:
  value:
    type: boolean
```

**String enum** (fan profile):
```yaml
type: object
additionalProperties: false
required: [value]
properties:
  value:
    type: string
    enum: [slow, normal, fast]
```

**Bounded string** (device rename):
```yaml
type: object
additionalProperties: false
required: [value]
properties:
  value:
    type: string
    minLength: 1
    maxLength: 32
```

### Full Action Examples

```yaml
- id: relay.toggle
  firmwareSymbol: relay_toggle
  label: Toggle
  dangerLevel: normal
  inputSchema:
    type: object
    additionalProperties: false
    properties: {}
- id: light.set_brightness
  firmwareSymbol: light_set_brightness
  label: Set Brightness
  dangerLevel: normal
  inputSchema:
    type: object
    additionalProperties: false
    required: [value]
    properties:
      value:
        type: integer
        minimum: 0
        maximum: 100
- id: system.factory_reset
  firmwareSymbol: system_factory_reset
  label: Factory Reset
  dangerLevel: dangerous
  confirm: "This will erase all settings. Continue?"
  inputSchema:
    type: object
    additionalProperties: false
    properties: {}
```

---

## Views & Nodes

Current authored YAML support is intentionally small:
- `views[].content` accepts `section`
- `views[].content` accepts `toggle`

That is the supported CLI `.yaml` authoring flow today.

The compiler expands those authored entries into the larger canonical manifest model used by the runtime. That internal canonical shape includes generated `views`/`nodes` plus additional node kinds, widget kinds, and rule fields that are not accepted by the current authored YAML schema.

Examples of canonical-only or future-facing concepts include:
- layout/container kinds such as `stack`, `row`, and `grid`
- widget kinds such as `slider`, `select`, `button`, `text`, `badge`, `timer`, `progress`, and `text_input`
- rule fields such as `visibleIf` and `enabledIf`

If you are writing CLI `.yaml` input today, stay within authored `views[].content` using `section` and `toggle` only.

---

## Building the Manifest

The firmware demo's device is described in `firmware/esp32/app/device/device_ui.cpp`,
not in YAML. The manifest the mobile app downloads is emitted from that C++ at build
time -- **with no Node/pnpm step** (a clone + PlatformIO is enough).

PlatformIO runs `tools/emit_ui.py` as a pre-build step (see `extra_scripts` in
`platformio.ini`). It compiles a small host program -- `tools/ui_emit_main.cpp` plus
`device_ui.cpp`, the library's host-side `EmitterUi`, and the vendored nanopb
encoder -- with the same host g++ the native tests use, then runs it. The program
walks `buildUi(...)` with `EmitterUi`, normalizes the model (string table, ids,
refs), encodes the protobuf, and writes:

- `src/manifest_data.h` -- the embedded protobuf the device sends to the tablet
- `src/manifest_symbols.h` / `.cpp` -- the `manifest_resources::` / `manifest_actions::`
  (and node/view) id tables your C++ references

The emitted protobuf is **byte-for-byte identical** to what the old YAML→Node
toolchain produced, so the mobile app and wire protocol are unaffected. Any
compile/run failure fails the build loudly rather than falling back to stale
headers.

> **Legacy path:** `tools/embed_manifest.py` + `src/manifest.yaml` (compiled by the
> `tools/manifest` TypeScript toolchain) are no longer invoked by the firmware build.
> The TS toolchain is retained as the **golden oracle** for tests (it proves the C++
> emitter's bytes match), but you don't need it -- or Node -- to build the firmware.

---

## Firmware Business Logic

You describe the whole device -- resources, actions, UI layout, **and** the handlers --
in one place: `firmware/esp32/app/device/device_ui.cpp`. A single fluent
`buildUi(ecb::ui::Ui&, app::AppRuntime&)` function:
1. **Declares resources, actions, and the UI tree** -- what the mobile app renders
2. **Attaches typed `.onSet` handlers to widgets** -- what happens when the user
   taps/drags a control; each handler just calls a method on `AppRuntime`

The same `buildUi(...)` is visited twice with different `Ui` implementations:
- on the **host**, at build time, `EmitterUi` walks it to emit the protobuf manifest
  and the symbol headers (see [Building the Manifest](#building-the-manifest));
- on the **device**, at `setup()`, `RuntimeUi` walks it to register every resource
  and every `.onSet` handler. The emitter ignores `.onSet` entirely, so handlers
  never run at build time.

### Generated Symbols

When you build, `emit_ui.py` generates `manifest_symbols.h` with typed constants:

```cpp
namespace manifest_resources {
  extern const uint32_t relay_auto;        // = 8
  extern const uint32_t light_brightness;  // = 6
  extern const uint32_t env_temperature;   // = 4
}

namespace manifest_actions {
  extern const uint32_t relay_toggle;           // = 6
  extern const uint32_t light_set_brightness;   // = 4
}
```

Use these constants instead of magic numbers -- they're auto-generated from your manifest.

### Entry Point (`main.cpp`)

`main.cpp` just wires the pieces together. It doesn't register actions itself --
`runtime.setup(...)` walks `buildUi(...)` and registers everything. (The LED pin
and all hardware/publishing live inside `AppRuntime`, not here.)

```cpp
#include <Arduino.h>
#include <EspControlBle.h>

#define MANIFEST_DEFINE_DATA
#include "../src/manifest_data.h"

#include "device/DeviceTelemetry.h"
#include "runtime/AppRuntime.h"

namespace {
app::AppRuntime runtime;
app::DeviceTelemetry telemetry;
EspControl control("ESP32-Test", "1234");  // device name, PIN
}

void setup() {
  Serial.begin(115200);
  Serial.println("[App] Starting...");
  runtime.setup(control, telemetry, MANIFEST_DATA, MANIFEST_LEN, temperatureRead());
  Serial.printf("[App] Ready (manifest, %u bytes)\n", (unsigned)MANIFEST_LEN);
}

void loop() {
  runtime.tick(control, telemetry, temperatureRead());
}
```

### Device State

Define your device's mutable state:

```cpp
// device/DeviceState.h -- a plain struct, no Arduino/EspControl includes
struct DeviceState {
  bool relayEnabled = false;
  uint8_t brightness = 0;
  float temperatureC = 0.0f;
  uint8_t fanProfile = 0;
  uint8_t colorPreset = 0;
  uint32_t loadPercent = 0;
  float humidityPercent = 45.0f;
  int32_t wifiRssiDbm = -58;
  uint32_t uptimeMs = 0;
  bool debugEnabled = false;
  char deviceName[33] = "ESP32-Test";
};
```

Keep `DeviceState.h` (and the logic that mutates it, `DeviceLogic.h`) free of
`<Arduino.h>` and `EspControl`. That portability is what lets the **same**
`device_ui.cpp` compile on the host for the manifest emitter (where no Arduino
exists) and run on the device -- and it lets the handlers be unit-tested natively.

### Declaring the UI and Handlers (`device_ui.cpp`)

You declare each resource/action/widget with the fluent `Ui` builder and attach a
typed `.onSet` handler to the interactive widgets. The handler signature is fixed by
the widget kind, so a mismatch is a **compile error** (it replaces the old runtime
`valueKind` checks): `toggle` -> `void(bool)`, `slider` -> `void(uint8_t)`,
`select`/`textInput` -> `void(const char*)`, `button` -> `void()`.

```cpp
// app/device/device_ui.cpp  (excerpt -- the "Lighting" section of the demo)
#include "device/device_ui.h"
#include "runtime/AppRuntime.h"
#include "ui/Ui.h"

using namespace ecb::ui;

void buildUi(Ui& ui, app::AppRuntime& rt) {
  // Resources: id, value type, then label/unit/readMode/... fluently.
  ResourceRef relayAuto = ui.resource("relay.auto", ValueType::Bool)
      .label("Main Power").readMode(ReadMode::Subscribe).staleAfterMs(5000);
  ResourceRef lightBrightness = ui.resource("light.brightness", ValueType::Uint)
      .label("Brightness").unit("%").readMode(ReadMode::Subscribe).staleAfterMs(5000);

  // Actions: id + label, then the input shape (valueless/integerRange/boolean/...).
  ui.action("relay.toggle", "Toggle").valueless();
  ui.action("light.set_brightness", "Set Brightness").integerRange(0, 100);

  // Widgets live inside a view; .bindAction wires the widget to its action, and
  // .onSet is the handler -- it forwards the decoded value to AppRuntime.
  ViewBuilder home = ui.view("home", "Home");
  home.content({
      ui.section("lighting.section", "Lighting").children({
          ui.toggle("lighting.toggle", "Main Power", relayAuto).bindAction("relay.toggle")
              .onSet([&rt](bool /*on*/) { rt.toggleRelay(); }),
          ui.slider("lighting.slider", "Brightness", lightBrightness, 0, 100)
              .bindAction("light.set_brightness").formatHint("percent")
              .onSet([&rt](uint8_t value) { rt.setBrightness(static_cast<uint32_t>(value)); }),
      }),
  });
  ui.navItem("home", "Home", "home", home);
}
```

Notice what the handlers **don't** do: no `valueKind` switch, no
`control.resources().setX(...)` / `publishDelta(...)`, no `ctx.replyOk(...)`. The
library decodes the inbound payload into the typed argument, calls your `.onSet`,
and replies for you. Each handler only forwards the value to an `AppRuntime` method
-- and `device_ui.cpp` stays free of `<Arduino.h>`/`EspControl`, so the host
emitter can compile it too.

### Where the hardware & publishing live (`AppRuntime`)

The `.onSet` handlers call `AppRuntime` action methods (`rt.toggleRelay()`,
`rt.setBrightness(v)`, `rt.setColorPreset(c)`, ...). Each method mutates
`DeviceState` (via the portable `DeviceLogic`) and then drives a small **`ActionSink`
seam** for the side effects -- writing the changed resource into the control's
`ResourceTable`, calling `publishDelta`, and driving the LED.

`ActionSink` is an abstract interface in the portable `AppRuntime.h`. Its concrete
implementation, `EspActionSink`, lives in `AppRuntime.cpp` and is the **only** place
`manifest_resources::` ids, `control.resources().setX`, `publishDelta`,
`analogWrite`, and `Serial` appear on the action path:

```cpp
// app/runtime/AppRuntime.h -- portable: no <Arduino.h>, no EspControl
void toggleRelay() {
  DeviceLogic::toggleRelay(state_);
  if (state_.relayEnabled && state_.brightness == 0) {   // power-on -> usable level
    DeviceLogic::setBrightness(state_, 100u);
  }
  if (sink_) sink_->onRelayChanged(state_);
}

// app/runtime/AppRuntime.cpp -- ESP-only: the publish + hardware side (inside EspActionSink)
void onRelayChanged(const DeviceState& state) override {
  applyLightOutput(state);                                                       // LED
  control_.resources().setBool(manifest_resources::relay_auto, state.relayEnabled);
  control_.resources().setUint(manifest_resources::light_brightness, state.brightness);
  control_.publishDelta(manifest_resources::relay_auto);
  control_.publishDelta(manifest_resources::light_brightness);
}
```

When no sink is attached (e.g. native unit tests construct an `AppRuntime` without
one), the action methods are pure state mutators -- the publish branch is skipped
and no device-only symbol is referenced. `runtime.setup(...)` attaches the real
`EspActionSink`, walks `buildUi(...)` with `RuntimeUi` to register the resources and
handlers, then seeds the resources with the device's real initial values.

### Publishing Resources

In your telemetry or main loop, set resource values and publish deltas:

```cpp
void DeviceTelemetry::tick(EspControl& control, AppRuntime& runtime, float currentTemperature) {
  const uint32_t nowMs = millis();

  // Update temperature (rate-limited by PublishScheduler)
  if (runtime.temperaturePublisher().shouldPublish(nowMs)) {
    runtime.updateTemperature(currentTemperature);
    control.resources().setFloat(manifest_resources::env_temperature, runtime.state().temperatureC);
    control.publishDelta(manifest_resources::env_temperature);
  }

  // Update uptime
  runtime.updateUptimeMs(nowMs);
  control.resources().setUint(manifest_resources::system_uptime, runtime.state().uptimeMs);
}
```

### ResourceTable API

```cpp
ecb::ResourceTable& table = control.resources();

// Setters (upsert -- creates entry if it doesn't exist)
table.setBool(resourceId, true);
table.setInt(resourceId, -58);
table.setUint(resourceId, 75);
table.setFloat(resourceId, 23.5f);
table.setString(resourceId, "hello");
table.setBytes(resourceId, data, len);

// Getter
ecb::ResourceValue val;
if (table.get(resourceId, val)) {
  // val.kind, val.boolValue, val.intValue, etc.
}
```

### Syncing Initial State

`RuntimeUi::commit()` seeds every resource to zero when it registers it, so on
startup you overwrite the action-owned resources with the device's real values to
give the mobile app a correct first snapshot. In the demo this is
`EspActionSink::syncResources` (called by `runtime.setup(...)` right after
`buildUi(...)` is walked); telemetry seeds its own resources separately:

```cpp
// app/runtime/AppRuntime.cpp -- inside EspActionSink
void syncResources(const DeviceState& state) {
  applyLightOutput(state);  // refresh the LED to match initial brightness/relay
  control_.resources().setBool(manifest_resources::relay_auto, state.relayEnabled);
  control_.resources().setUint(manifest_resources::light_brightness, state.brightness);
  control_.resources().setString(manifest_resources::fan_profile, DeviceLogic::fanProfileName(state.fanProfile));
  control_.resources().setString(manifest_resources::light_color, DeviceLogic::colorPresetName(state.colorPreset));
  control_.resources().setBool(manifest_resources::device_debug, state.debugEnabled);
  control_.resources().setString(manifest_resources::device_name, state.deviceName);
}
```

### PublishScheduler

Rate-limit publishing to avoid flooding BLE:

```cpp
PublishScheduler temperaturePublisher{2000u};  // 2 second interval

if (temperaturePublisher.shouldPublish(nowMs)) {
  // publish temperature
}
```

---

## Adding a New Resource & Action

Here's the complete workflow to add, say, a "motor speed" resource and action.
Everything except the hardware/publish wiring happens in `device_ui.cpp`.

### 1. Declare it in `device_ui.cpp`

Inside `buildUi(...)`, declare the resource and action, then add a widget bound to
the action with a typed `.onSet` handler:

```cpp
// Resource + action (alongside the others, in manifest order)
ResourceRef motorSpeed = ui.resource("motor.speed", ValueType::Uint)
    .label("Motor Speed").unit("RPM").readMode(ReadMode::Subscribe).staleAfterMs(3000);
ui.action("motor.set_speed", "Set Speed").integerRange(0, 5000);

// Widget inside a section of some view -- this is what makes the control appear.
// (Declaring the resource/action alone does NOT render anything.)
ui.slider("motor.slider", "Motor Speed", motorSpeed, 0, 5000)
    .bindAction("motor.set_speed")
    .onSet([&rt](uint8_t value) { rt.setMotorSpeed(static_cast<uint32_t>(value)); }),
```

> Note: `slider` decodes to `uint8_t` (0..100 UI range). For a wider raw range,
> scale inside the handler, or pick the widget/handler type that fits your data.

### 2. Add the state + business logic (portable)

```cpp
// In DeviceState.h -- add your state field
uint32_t motorSpeedRpm = 0;

// In DeviceLogic.h -- a pure mutator (clamp/assign, no Arduino/EspControl)
static void setMotorSpeed(DeviceState& state, uint32_t rpm) {
  state.motorSpeedRpm = rpm > 5000u ? 5000u : rpm;
}
```

### 3. Wire the publish + hardware side (`AppRuntime`)

```cpp
// In AppRuntime.h -- the action method the .onSet handler calls
void setMotorSpeed(uint32_t rpm) {
  DeviceLogic::setMotorSpeed(state_, rpm);
  if (sink_) sink_->onMotorChanged(state_);
}

// In AppRuntime.h ActionSink -- add the seam method:  virtual void onMotorChanged(const DeviceState&) = 0;
// In AppRuntime.cpp EspActionSink -- implement it (the ONLY place ids/publish/HW appear):
void onMotorChanged(const DeviceState& state) override {
  // ... drive the motor hardware ...
  control_.resources().setUint(manifest_resources::motor_speed, state.motorSpeedRpm);
  control_.publishDelta(manifest_resources::motor_speed);
}
// In EspActionSink::syncResources -- seed the initial value:
control_.resources().setUint(manifest_resources::motor_speed, state.motorSpeedRpm);
```

### 4. Build & flash

```bash
pio run -t upload
```

The build re-emits the manifest from `device_ui.cpp` and regenerates
`manifest_symbols.h` with `manifest_resources::motor_speed` and
`manifest_actions::motor_set_speed` -- no Node/pnpm step. The mobile app renders the
new slider automatically when it reconnects.

---

## Complete Manifest Reference

### Full `manifest.yaml` authoring fixture

The project ships with a representative YAML authoring fixture at `tools/manifest/tests/fixtures/demo.manifest.yaml`.

The demo includes:
- 6 resources reused across relay, lighting, telemetry, and debug flows
- 5 actions covering toggles, setters, and a dangerous reset path
- 13 emitted nodes from nested YAML authoring content
- A single `home` view with section-based authoring expansion
- A YAML-first CLI fixture for validate, compile, and inspect coverage
- Separate YAML `symbols` coverage using `tools/manifest/tests/fixtures/minimal.manifest.yaml`

---

## BLE Protocol

### Service & Characteristics

| UUID | Type | Purpose |
|---|---|---|
| `...abc` | Service | Main BLE service |
| `...abd` | Read | Manifest metadata / inline manifest |
| `...abe` | Write + Notify | Authentication + legacy commands |
| `...abf` | Write + Notify | Data protocol (manifest, snapshot, delta, actions) |

### Authentication

PIN-based challenge-response using SHA-256:

1. Phone subscribes to CMD characteristic
2. ESP32 sends a 4-byte random nonce
3. Phone computes `SHA256(pin + nonce)[:4]` and sends it back
4. ESP32 verifies and responds OK/FAIL

### Data Frame Protocol

Frame format: `[kind:1][flags:1][length:2 BE][body:N]`

| Frame | Code | Direction | Description |
|---|---|---|---|
| `ManifestChunk` | `0x01` | ESP32 → Phone | 180-byte manifest protobuf chunk |
| `ManifestEof` | `0x02` | ESP32 → Phone | `[4B total_size][4B CRC32]` |
| `Snapshot` | `0x10` | ESP32 → Phone | Full resource state dump |
| `Delta` | `0x11` | ESP32 → Phone | Single resource value change |
| `InvokeAction` | `0x20` | Phone → ESP32 | Action invocation with payload |
| `InvokeResult` | `0x21` | ESP32 → Phone | Action result (status + optional data) |
| `Subscribe` | `0x30` | Phone → ESP32 | Subscribe to resource IDs |
| `Unsubscribe` | `0x31` | Phone → ESP32 | Unsubscribe from resource IDs |
| `Ping` / `Pong` | `0x32` / `0x33` | Bidirectional | Keep-alive |

### Connection Lifecycle

```
Phone                              ESP32
  │                                   │
  │── Scan & Connect ────────────────►│
  │                                   │
  │── Subscribe to CMD char ─────────►│
  │◄── Auth Challenge (nonce) ────────│
  │── Auth Response (hash) ──────────►│
  │◄── Auth OK ───────────────────────│
  │                                   │
  │── Subscribe to Data char ────────►│
  │◄── ManifestChunk (x N) ──────────│
  │◄── ManifestEof (size + CRC) ─────│
  │                                   │
  │── Subscribe {resourceIds} ───────►│
  │◄── Snapshot (all values) ─────────│
  │◄── Delta (value changes) ─────────│  (ongoing)
  │                                   │
  │── InvokeAction {id, payload} ────►│
  │◄── InvokeResult {status} ─────────│
```

---

## Running Tests

### Firmware native tests

```bash
cd firmware/esp32
pio test -e native
```

16 test suites covering: frame codec, resource table, action dispatch, manifest store, snapshot encoding, subscription state, BLE transport, and more.

### Mobile app tests

```bash
cd apps/mobile
npm test
```

Jest tests covering: manifest decoding, frame codec, BleRuntime, widget rendering, rule evaluation, form handling, and state machines.

### Manifest validation

```bash
cd tools/manifest

# Validate a checked-in YAML authoring fixture
npx tsx src/cli/main.ts validate --source ./tests/fixtures/demo.manifest.yaml

# Compile to protobuf
npx tsx src/cli/main.ts compile --source ./tests/fixtures/demo.manifest.yaml --out /tmp/manifest.pb

# Inspect runtime IDs
npx tsx src/cli/main.ts inspect --source ./tests/fixtures/demo.manifest.yaml --ids

# Generate symbol files manually from a checked-in YAML fixture
npx tsx src/cli/main.ts symbols \
  --source ./tests/fixtures/minimal.manifest.yaml \
  --header-out ../firmware/esp32/src/manifest_symbols.h \
  --source-out ../firmware/esp32/src/manifest_symbols.cpp
```

---

## Configuration

| Setting | Location | Default |
|---|---|---|
| Device name | `main.cpp` constructor | `"ESP32-Test"` |
| PIN | `main.cpp` constructor | `"1234"` |
| BLE service UUID | `Protocol.h` | `12345678-1234-...` |
| Manifest chunk size | `Protocol.h` | 180 bytes |
| Loop tick interval | `AppRuntime::tick` | ~50 ms |
| Publish interval (temperature) | `AppRuntime.h` | 2000 ms |
| Publish interval (load) | `AppRuntime.h` | 1000 ms |
| Max resources | `ResourceTable` | 64 |
| Max action handlers | `ActionRegistry` | 32 |
| Max string value length | `ResourceTable` | 64 chars |
| Max manifest resources | Schema | 128 |
| Max manifest actions | Schema | 128 |
| Max manifest nodes | Schema | 512 |
| Max manifest views | Schema | 32 |

---

## Architecture

```
firmware/esp32/
├── app/                              # YOUR CODE
│   ├── main.cpp                      # Entry point (just wires runtime + control)
│   ├── device/
│   │   ├── DeviceState.h             # Device state struct (portable)
│   │   ├── DeviceLogic.h             # State mutators + enum<->slug mappers (portable)
│   │   ├── device_ui.cpp             # buildUi(): declarative UI + typed .onSet handlers
│   │   └── DeviceTelemetry.h/.cpp    # Periodic telemetry publishing
│   └── runtime/
│       ├── AppRuntime.h/.cpp         # Setup/tick + ActionSink seam (EspActionSink in .cpp)
│       └── PublishScheduler.h        # Rate-limit helper
│
├── src/
│   ├── manifest.yaml                 # Legacy YAML manifest (no longer built)
│   ├── manifest_data.h               # (auto-generated from device_ui.cpp)
│   └── manifest_symbols.h/.cpp       # (auto-generated from device_ui.cpp)
│
├── lib/esp-control-ble/              # Core library (don't edit)
│   └── src/
│       ├── EspControlBle.h/.cpp      # Top-level facade
│       ├── ui/                       # Ui builder: RuntimeUi (device) + EmitterUi (host)
│       ├── protocol/
│       │   ├── core/Protocol.h       # Constants, UUIDs, frame types
│       │   ├── auth/                 # PIN challenge-response
│       │   ├── manifest/             # Manifest storage + CRC32
│       │   ├── resources/            # ResourceTable (key-value store)
│       │   ├── actions/              # ActionRegistry + dispatch
│       │   ├── snapshot/             # Protobuf snapshot/delta encoder
│       │   └── subscriptions/        # Subscription tracking
│       └── transport/
│           └── ble/                  # NimBLE server + data protocol
│
└── tools/
    ├── emit_ui.py                    # Pre-build: device_ui.cpp → manifest + symbols (pure C++)
    ├── ui_emit_main.cpp              # Host emitter entry point (compiled by emit_ui.py)
    ├── embed_manifest.py             # Legacy YAML→protobuf path (no longer invoked)
    └── gen_nanopb.py                 # Pre-build: protobuf C codegen
```

---

## License

Private project. All rights reserved.
