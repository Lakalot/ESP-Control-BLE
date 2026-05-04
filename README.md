# ESP-Control-BLE

BLE-connected IoT dashboard for ESP32. Define your device UI with a YAML manifest, write your business logic in C++, and control everything from your phone -- no mobile app code required.

## How It Works

```
┌──────────────┐         BLE          ┌──────────────────┐
│              │  ◄─────────────────►  │                  │
│   ESP32      │   Manifest transfer   │   Mobile App     │
│   Firmware   │   Resource sync       │   (React Native) │
│              │   Action dispatch     │                  │
└──────────────┘                       └──────────────────┘
```

1. You write a `manifest.yaml` that describes your device's **resources** (data), **actions** (controls), and **UI layout** (`views` with nested authoring content)
2. At build time, the YAML authoring is expanded into the canonical manifest shape, then compiled to protobuf and embedded into the firmware
3. The mobile app connects via BLE, downloads the manifest, and **renders the UI automatically**
4. Your C++ code publishes resource values and handles actions using generated **type-safe symbol constants**

## Quick Start

### Prerequisites

- [PlatformIO](https://platformio.org/) (installed via VSCode extension or CLI)
- [Node.js](https://nodejs.org/) 18+ and [pnpm](https://pnpm.io/)
- [Expo](https://docs.expo.dev/) (for mobile app development)
- An ESP32 board

### 1. Install dependencies

```bash
# Root workspace (manifest compiler tools)
pnpm install

# Mobile app
cd apps/mobile
npm install
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
│   │   │   ├── DeviceActions  # Action handlers (toggle, set, etc.)
│   │   │   └── DeviceTelemetry# Periodic sensor/resource publishing
│   │   └── runtime/           # Orchestrator + publish scheduler
│   ├── src/
│   │   ├── manifest.yaml      # Firmware demo authored YAML manifest
│   │   ├── manifest_data.h    # Auto-generated protobuf binary
│   │   └── manifest_symbols.* # Auto-generated C++ symbol constants
│   ├── lib/esp-control-ble/   # Core BLE protocol library
│   └── tools/
│       └── embed_manifest.py  # Pre-build: manifest → protobuf + symbols
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

## The Manifest (`manifest.yaml`)

This is the heart of the system. It defines what your device **is** -- its data model, controls, and UI. The mobile app reads it and renders everything automatically.

The authoring path documented here is YAML (`manifest.yaml`). The firmware demo uses `firmware/esp32/src/manifest.yaml` as its primary manifest source.

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

## Firmware Business Logic

After editing your manifest authoring file, you write C++ code that:
1. **Registers action handlers** -- what happens when the user taps a button
2. **Publishes resource values** -- push sensor data to the phone

### Generated Symbols

When you build, `embed_manifest.py` generates `manifest_symbols.h` with typed constants:

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

```cpp
#include <Arduino.h>
#include <EspControlBle.h>

#define MANIFEST_DEFINE_DATA
#include "../src/manifest_data.h"

#include "device/DeviceActions.h"
#include "device/DeviceTelemetry.h"
#include "runtime/AppRuntime.h"

namespace {
constexpr uint8_t kLedPin = 2u;
app::AppRuntime runtime;
app::DeviceActions actions(kLedPin);
app::DeviceTelemetry telemetry;
EspControl control("ESP32-Test", "1234");  // device name, PIN
}

void setup() {
  Serial.begin(115200);
  runtime.setup(control, actions, telemetry, MANIFEST_DATA, MANIFEST_LEN, temperatureRead());
}

void loop() {
  runtime.tick(control, telemetry, temperatureRead());
}
```

### Device State

Define your device's mutable state:

```cpp
// device/DeviceState.h
struct DeviceState {
  bool relayEnabled = false;
  uint8_t brightness = 0;
  float temperatureC = 0.0f;
  uint8_t fanProfile = 0;
  float humidityPercent = 45.0f;
  int32_t wifiRssiDbm = -58;
  uint32_t uptimeMs = 0;
  bool debugEnabled = false;
  char deviceName[33] = "ESP32-Test";
};
```

### Registering Actions

Use `control.registerAction(symbol, handler)` in your `DeviceActions::registerAll()`:

```cpp
#include "../../src/manifest_symbols.h"

void DeviceActions::registerAll(EspControl& control, AppRuntime& runtime) const {

  // Toggle relay -- no input
  control.registerAction(manifest_actions::relay_toggle,
    [this, &control, &runtime](ecb::ActionContext& ctx) {
      runtime.toggleRelay();
      applyRelayOutput(runtime.state());
      control.resources().setBool(manifest_resources::relay_auto, runtime.state().relayEnabled);
      control.publishDelta(manifest_resources::relay_auto);
      ctx.replyOk(nullptr, 0);
    });

  // Set brightness -- integer input
  control.registerAction(manifest_actions::light_set_brightness,
    [this, &control, &runtime](ecb::ActionContext& ctx) {
      if (ctx.valueKind == ecb::ActionValueKind::Uint) {
        runtime.setBrightness(ctx.uintValue);
      } else if (ctx.valueKind == ecb::ActionValueKind::Int) {
        runtime.setBrightness(ctx.intValue);
      } else {
        ctx.replyError(ecb::ActionStatus::BadPayload, "need uint");
        return;
      }
      applyBrightnessOutput(runtime.state());
      control.resources().setUint(manifest_resources::light_brightness, runtime.state().brightness);
      control.publishDelta(manifest_resources::light_brightness);
      ctx.replyOk(nullptr, 0);
    });

  // Set fan profile -- enum (string) input
  control.registerAction(manifest_actions::fan_set_profile,
    [&control, &runtime](ecb::ActionContext& ctx) {
      if (ctx.valueKind != ecb::ActionValueKind::String) {
        ctx.replyError(ecb::ActionStatus::BadPayload, "need string");
        return;
      }
      runtime.setFanProfile(ctx.stringValue);
      control.resources().setString(manifest_resources::fan_profile, fanProfileName(runtime.state().fanProfile));
      control.publishDelta(manifest_resources::fan_profile);
      ctx.replyOk(nullptr, 0);
    });

  // Debug toggle -- boolean input
  control.registerAction(manifest_actions::device_set_debug,
    [&control, &runtime](ecb::ActionContext& ctx) {
      if (ctx.valueKind != ecb::ActionValueKind::Bool) {
        ctx.replyError(ecb::ActionStatus::BadPayload, "need bool");
        return;
      }
      runtime.setDebugEnabled(ctx.boolValue);
      control.resources().setBool(manifest_resources::device_debug, runtime.state().debugEnabled);
      control.publishDelta(manifest_resources::device_debug);
      ctx.replyOk(nullptr, 0);
    });

  // Dangerous action with no input
  control.registerAction(manifest_actions::system_factory_reset,
    [](ecb::ActionContext& ctx) {
      // ... perform factory reset ...
      ctx.replyOk(nullptr, 0);
    });
}
```

#### ActionContext API

```cpp
struct ActionContext {
  uint32_t correlationId;       // Internal correlation (don't modify)
  ActionValueKind valueKind;    // None, Bool, Int, Uint, Float, String
  bool     boolValue;           // Valid when valueKind == Bool
  int32_t  intValue;            // Valid when valueKind == Int
  uint32_t uintValue;           // Valid when valueKind == Uint
  float    floatValue;          // Valid when valueKind == Float
  char     stringValue[65];     // Valid when valueKind == String

  bool hasValue() const;        // true if valueKind != None
  void replyOk(const uint8_t* data, size_t len);
  void replyError(ActionStatus s, const char* msg);
};
```

#### ActionValueKind enum

| Value | Received when inputSchema has |
|---|---|
| `None` | No `value` property in schema |
| `Bool` | `"type": "boolean"` |
| `Int` | `"type": "integer"` with negative range |
| `Uint` | `"type": "integer"` with non-negative range |
| `Float` | `"type": "number"` (non-integer) |
| `String` | `"type": "string"` or `"enum"` values |

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

### Resource blob slots

`EspControl` uses `ecb::ResourceTable<>`, whose default stores up to four simultaneous string/bytes resources. Applications that need more blob resources can instantiate `ecb::ResourceTable<16>` in lower-level tests or future custom facades; scalar resources still support up to 64 entries.

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

On startup, sync all resource values so the mobile app gets a complete snapshot:

```cpp
void DeviceActions::syncResources(EspControl& control, const DeviceState& state) const {
  control.resources().setBool(manifest_resources::relay_auto, state.relayEnabled);
  control.resources().setUint(manifest_resources::light_brightness, state.brightness);
  control.resources().setFloat(manifest_resources::env_temperature, state.temperatureC);
  control.resources().setString(manifest_resources::fan_profile, fanProfileName(state.fanProfile));
  control.resources().setBool(manifest_resources::device_debug, state.debugEnabled);
  control.resources().setString(manifest_resources::device_name, state.deviceName);
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

Here's the complete workflow to add, say, a "motor speed" resource and action:

### 1. Add to `manifest.yaml`

```yaml
resources:
  - id: motor.speed
    firmwareSymbol: motor_speed
    label: Motor Speed
    valueType: uint
    unit: RPM
    readMode: subscribe
    staleAfterMs: 3000
actions:
  - id: motor.set_speed
    firmwareSymbol: motor_set_speed
    label: Set Speed
    dangerLevel: normal
    inputSchema:
      type: object
      additionalProperties: false
      required:
        - value
      properties:
        value:
          type: integer
          minimum: 0
          maximum: 5000
```

CLI `.yaml` inputs must use the authoring schema shown above. The current authored YAML subset does not yet provide a shorthand slider entry, so keep `manifest.yaml` focused on the supported authoring shape and treat richer canonical `nodes` examples as internal expanded output rather than valid CLI YAML input.

Also note that adding a `resource` and `action` alone does not make a control appear automatically. In the current authored YAML model, UI only appears when you add supported entries under `views[].content`.

### 2. Build the firmware

```bash
pio run -t upload
```

The build automatically:
- Compiles `firmware/esp32/src/manifest.yaml` to protobuf
- Generates `manifest_symbols.h` with `manifest_resources::motor_speed` and `manifest_actions::motor_set_speed`

### 3. Add C++ business logic

```cpp
// In DeviceState.h -- add your state field
uint16_t motorSpeedRpm = 0;

// In DeviceActions.cpp -- register the handler
control.registerAction(manifest_actions::motor_set_speed,
  [&control, &runtime](ecb::ActionContext& ctx) {
    if (ctx.valueKind != ecb::ActionValueKind::Uint) {
      ctx.replyError(ecb::ActionStatus::BadPayload, "need uint");
      return;
    }
    runtime.setMotorSpeed(ctx.uintValue);
    // ... apply to hardware ...
    control.resources().setUint(manifest_resources::motor_speed, runtime.state().motorSpeedRpm);
    control.publishDelta(manifest_resources::motor_speed);
    ctx.replyOk(nullptr, 0);
  });

// In syncResources -- set initial value
control.resources().setUint(manifest_resources::motor_speed, state.motorSpeedRpm);
```

### 4. Rebuild & flash

```bash
pio run -t upload
```

Once you also add a supported control entry under `views[].content`, the mobile app will render it automatically when it reconnects.

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
│   ├── main.cpp                      # Entry point
│   ├── device/
│   │   ├── DeviceState.h             # Device state struct
│   │   ├── DeviceActions.h/.cpp      # Action handlers + output control
│   │   └── DeviceTelemetry.h/.cpp    # Periodic telemetry publishing
│   └── runtime/
│       ├── AppRuntime.h/.cpp         # Setup/tick orchestrator
│       └── PublishScheduler.h        # Rate-limit helper
│
├── src/
│   ├── manifest.yaml                 # Firmware demo authored YAML manifest
│   ├── manifest_data.h               # (auto-generated)
│   └── manifest_symbols.h/.cpp       # (auto-generated)
│
├── lib/esp-control-ble/              # Core library (don't edit)
│   └── src/
│       ├── EspControlBle.h/.cpp      # Top-level facade
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
    ├── embed_manifest.py             # Pre-build: compile + generate symbols
    └── gen_nanopb.py                 # Pre-build: protobuf C codegen
```

---

## License

Private project. All rights reserved.
