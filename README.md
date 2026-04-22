# ESP-Control-BLE

BLE-connected IoT dashboard for ESP32. Define your device UI with a JSON manifest, write your business logic in C++, and control everything from your phone -- no mobile app code required.

## How It Works

```
┌──────────────┐         BLE          ┌──────────────────┐
│              │  ◄─────────────────►  │                  │
│   ESP32      │   Manifest transfer   │   Mobile App     │
│   Firmware   │   Resource sync       │   (React Native) │
│              │   Action dispatch     │                  │
└──────────────┘                       └──────────────────┘
```

1. You write a `manifest.json` that describes your device's **resources** (data), **actions** (controls), and **UI layout** (`views`, nodes, and widgets)
2. At build time, the manifest is compiled to protobuf and embedded into the firmware
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
│   │   ├── manifest.json      # YOUR UI DEFINITION -- edit this
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
│   └── src/cli/main.ts        # validate, compile, inspect, symbols
│
├── proto/                     # Protobuf definitions
│   └── manifest.proto
│
└── package.json               # pnpm workspace root
```

---

## The Manifest (`manifest.json`)

This is the heart of the system. It defines what your device **is** -- its data model, controls, and UI. The mobile app reads it and renders everything automatically.

### Minimal Example (No Navigation Bar)

```json
{
  "version": 5,
  "schemaVersion": 1,
  "minAppVersion": "1.0.0",
  "capabilities": {
    "required": ["layout.sections"],
    "optional": []
  },
  "resources": [
    {
      "id": "led.power",
      "firmwareSymbol": "led_power",
      "label": "Power",
      "valueType": "bool",
      "readMode": "subscribe",
      "staleAfterMs": 5000
    }
  ],
  "actions": [
    {
      "id": "led.toggle",
      "firmwareSymbol": "led_toggle",
      "label": "Toggle",
      "dangerLevel": "normal",
      "inputSchema": { "type": "object", "additionalProperties": false, "properties": {} }
    }
  ],
  "views": [
    {
      "id": "home",
      "firmwareSymbol": "home",
      "title": "Home",
      "rootNodeId": "home.root"
    }
  ],
  "nodes": [
    {
      "id": "home.root",
      "firmwareSymbol": "home_root",
      "kind": "stack",
      "children": ["power.section"]
    },
    {
      "id": "power.section",
      "firmwareSymbol": "power_section",
      "kind": "section",
      "title": "Controls",
      "children": ["power.toggle"]
    },
    {
      "id": "power.toggle",
      "firmwareSymbol": "power_toggle",
      "kind": "widget",
      "widget": "toggle",
      "title": "Power",
      "bind": { "resource": "led.power", "action": "led.toggle" }
    }
  ]
}
```

### Top-Level Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `version` | `5` | Yes | Protocol version (always `5`) |
| `schemaVersion` | integer | Yes | Schema revision (always `1`) |
| `minAppVersion` | string | Yes | Minimum mobile app version (semver) |
| `capabilities` | object | Yes | Feature requirements for the app |
| `appShell` | object | No | Optional shell configuration such as `navBar` |
| `resources` | array | Yes | Data resources (max 128) |
| `actions` | array | Yes | Callable actions (max 128) |
| `views` | array | Yes | UI views (max 32) |
| `nodes` | array | Yes | UI tree nodes (max 512) |

### Views And Optional Bottom Navigation

Manifest authoring now uses `views`. Each view points to a root node, and the mobile app can optionally render a fixed bottom bar when `appShell.navBar` is present.

Minimal example without nav:

```json
{
  "views": [
    {
      "id": "home",
      "firmwareSymbol": "home",
      "title": "Home",
      "rootNodeId": "home.root"
    }
  ]
}
```

Example with nav:

```json
{
  "appShell": {
    "navBar": {
      "items": [
        { "id": "home", "label": "Home", "icon": "home", "viewId": "home" },
        { "id": "stats", "label": "Stats", "icon": "bar-chart-2", "viewId": "stats" },
        { "id": "settings", "label": "Settings", "icon": "settings", "viewId": "settings" }
      ]
    }
  },
  "views": [
    {
      "id": "home",
      "firmwareSymbol": "home",
      "title": "Home",
      "rootNodeId": "home.root"
    },
    {
      "id": "stats",
      "firmwareSymbol": "stats_screen",
      "title": "Stats",
      "rootNodeId": "stats.root"
    },
    {
      "id": "settings",
      "firmwareSymbol": "settings_screen",
      "title": "Settings",
      "rootNodeId": "settings.root"
    }
  ]
}
```

`appShell.navBar` is optional. When present, use 1 to 5 items, each `viewId` must reference one of the authored `views`, and the first nav item becomes the initial visible screen.

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

```json
{
  "id": "env.temperature",
  "firmwareSymbol": "env_temperature",
  "label": "Temperature",
  "valueType": "float",
  "unit": "C",
  "readMode": "subscribe",
  "staleAfterMs": 5000
},
{
  "id": "fan.profile",
  "firmwareSymbol": "fan_profile",
  "label": "Fan Profile",
  "valueType": "enum",
  "readMode": "subscribe",
  "staleAfterMs": 5000,
  "enumValues": ["slow", "normal", "fast"]
},
{
  "id": "wifi.rssi",
  "firmwareSymbol": "wifi_rssi",
  "label": "WiFi Signal",
  "valueType": "int",
  "unit": "dBm",
  "readMode": "poll",
  "pollMs": 10000,
  "staleAfterMs": 15000
},
{
  "id": "system.uptime",
  "firmwareSymbol": "system_uptime",
  "label": "Uptime",
  "valueType": "duration_ms",
  "readMode": "poll",
  "pollMs": 5000,
  "staleAfterMs": 10000
}
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
```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {}
}
```

**Integer with bounds** (brightness 0-100):
```json
{
  "type": "object",
  "additionalProperties": false,
  "required": ["value"],
  "properties": {
    "value": { "type": "integer", "minimum": 0, "maximum": 100 }
  }
}
```

**Boolean** (debug toggle):
```json
{
  "type": "object",
  "additionalProperties": false,
  "required": ["value"],
  "properties": {
    "value": { "type": "boolean" }
  }
}
```

**String enum** (fan profile):
```json
{
  "type": "object",
  "additionalProperties": false,
  "required": ["value"],
  "properties": {
    "value": { "type": "string", "enum": ["slow", "normal", "fast"] }
  }
}
```

**Bounded string** (device rename):
```json
{
  "type": "object",
  "additionalProperties": false,
  "required": ["value"],
  "properties": {
    "value": { "type": "string", "minLength": 1, "maxLength": 32 }
  }
}
```

### Full Action Examples

```json
{
  "id": "relay.toggle",
  "firmwareSymbol": "relay_toggle",
  "label": "Toggle",
  "dangerLevel": "normal",
  "inputSchema": { "type": "object", "additionalProperties": false, "properties": {} }
},
{
  "id": "light.set_brightness",
  "firmwareSymbol": "light_set_brightness",
  "label": "Set Brightness",
  "dangerLevel": "normal",
  "inputSchema": {
    "type": "object",
    "additionalProperties": false,
    "required": ["value"],
    "properties": { "value": { "type": "integer", "minimum": 0, "maximum": 100 } }
  }
},
{
  "id": "system.factory_reset",
  "firmwareSymbol": "system_factory_reset",
  "label": "Factory Reset",
  "dangerLevel": "dangerous",
  "confirm": "This will erase all settings. Continue?",
  "inputSchema": { "type": "object", "additionalProperties": false, "properties": {} }
}
```

---

## Views & Nodes

The UI is a tree of nodes. Each view has a root node, and nodes can contain children to create layouts.

### Views

```json
{
  "id": "home",
  "firmwareSymbol": "home",
  "title": "Home",
  "rootNodeId": "home.root"
}
```

### Container Nodes

Container nodes arrange their children.

| Kind | Description | Layout |
|---|---|---|
| `stack` | Vertical stack | Children top to bottom |
| `row` | Horizontal row | Children left to right |
| `section` | Titled section | Card with title, children stacked |
| `grid` | Grid layout | Children in N columns |

```json
{
  "id": "home.root",
  "firmwareSymbol": "home_root",
  "kind": "stack",
  "children": ["header.banner", "controls.section", "sensors.section"]
}
```

**Section with visibility rule:**
```json
{
  "id": "advanced.section",
  "firmwareSymbol": "advanced_section",
  "kind": "section",
  "title": "Advanced",
  "visibleIf": { "==": [{ "var": "runtime.role" }, "admin"] },
  "children": ["advanced.debug", "advanced.reset"]
}
```

**Row layout:**
```json
{
  "id": "system.row",
  "firmwareSymbol": "system_row",
  "kind": "row",
  "children": ["system.rssi", "system.uptime"]
}
```

**Grid layout:**
```json
{
  "id": "sensor.grid",
  "firmwareSymbol": "sensor_grid",
  "kind": "grid",
  "columns": 2,
  "children": ["sensor.temp", "sensor.humidity", "sensor.pressure", "sensor.gas"]
}
```

### Widget Nodes

Widgets are the leaf nodes that display data or provide interaction.

| Widget | `widget` value | Displays | Binding |
|---|---|---|---|
| **Text** | `"text"` | Static text | `text` field |
| **Stat** | `"stat"` | Numeric readout | `resource` + `formatHint` |
| **Toggle** | `"toggle"` | On/off switch | `resource` + `action` |
| **Button** | `"button"` | Action trigger | `action` |
| **Slider** | `"slider"` | Range control (0-100) | `resource` + `action` + `formatHint` |
| **Select** | `"select"` | Enum chip picker | `resource` + `action` |
| **Text Input** | `"text_input"` | Text entry field | `resource` + `action` |
| **Badge** | `"badge"` | Small status badge | `resource` |
| **Timer** | `"timer"` | Duration (MM:SS) | `resource` |
| **Progress** | `"progress"` | Progress bar | `resource` |

### Widget Binding

Widgets bind to resources and/or actions:

```json
{
  "bind": {
    "resource": "relay.auto",     // shows this resource's value
    "action": "relay.toggle"      // calls this action on interaction
  }
}
```

- Read-only widgets (stat, badge, timer): `resource` only
- Action-only widgets (button): `action` only
- Interactive widgets (toggle, slider, select, text_input): both `resource` + `action`

### formatHint Values

| Value | Effect | Use with |
|---|---|---|
| `"float_2"` | 2 decimal places | stat, slider |
| `"float_1"` | 1 decimal place | stat, slider |
| `"percent"` | Integer + `%` suffix | stat, slider |

### Widget Examples

**Toggle switch (bound to resource + action):**
```json
{
  "id": "power.toggle",
  "firmwareSymbol": "power_toggle",
  "kind": "widget",
  "widget": "toggle",
  "title": "Main Power",
  "bind": { "resource": "relay.auto", "action": "relay.toggle" }
}
```

**Stat display (read-only, formatted):**
```json
{
  "id": "telemetry.temp",
  "firmwareSymbol": "telemetry_temp",
  "kind": "widget",
  "widget": "stat",
  "title": "Temperature",
  "bind": { "resource": "env.temperature" },
  "formatHint": "float_2"
}
```

**Slider control (interactive range):**
```json
{
  "id": "lighting.slider",
  "firmwareSymbol": "lighting_slider",
  "kind": "widget",
  "widget": "slider",
  "title": "Brightness",
  "bind": { "resource": "light.brightness", "action": "light.set_brightness" },
  "formatHint": "percent"
}
```

**Enum selector:**
```json
{
  "id": "telemetry.profile",
  "firmwareSymbol": "telemetry_profile",
  "kind": "widget",
  "widget": "select",
  "title": "Fan Profile",
  "bind": { "resource": "fan.profile", "action": "fan.set_profile" }
}
```

**Dangerous button with confirmation:**
```json
{
  "id": "advanced.reset",
  "firmwareSymbol": "advanced_reset",
  "kind": "widget",
  "widget": "button",
  "title": "Factory Reset",
  "bind": { "action": "system.factory_reset" }
}
```

**Static text banner:**
```json
{
  "id": "home.banner",
  "firmwareSymbol": "home_banner",
  "kind": "widget",
  "widget": "text",
  "title": "ESP Control",
  "text": "BLE-connected device dashboard."
}
```

**Badge (small status):**
```json
{
  "id": "system.rssi",
  "firmwareSymbol": "system_rssi",
  "kind": "widget",
  "widget": "badge",
  "title": "WiFi",
  "bind": { "resource": "wifi.rssi" }
}
```

**Timer (duration display):**
```json
{
  "id": "system.uptime",
  "firmwareSymbol": "system_uptime",
  "kind": "widget",
  "widget": "timer",
  "title": "Uptime",
  "bind": { "resource": "system.uptime" }
}
```

**Text input:**
```json
{
  "id": "advanced.rename",
  "firmwareSymbol": "advanced_rename",
  "kind": "widget",
  "widget": "text_input",
  "title": "Rename Device",
  "bind": { "resource": "device.name", "action": "device.rename" }
}
```

### Visibility Rules (visibleIf / enabledIf)

Use JsonLogic expressions to conditionally show or enable nodes:

```json
{
  "visibleIf": { "==": [{ "var": "runtime.role" }, "admin"] }
}
```

Available operators: `==`, `!=`, `>`, `>=`, `<`, `<=`, `and`, `or`, `!`, `if`, `in`

---

## Firmware Business Logic

After editing `manifest.json`, you write C++ code that:
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

Here's the complete workflow to add, say, a "motor speed" control:

### 1. Add to `manifest.json`

```json
{
  "resources": [
    ...existing...,
    {
      "id": "motor.speed",
      "firmwareSymbol": "motor_speed",
      "label": "Motor Speed",
      "valueType": "uint",
      "unit": "RPM",
      "readMode": "subscribe",
      "staleAfterMs": 3000
    }
  ],
  "actions": [
    ...existing...,
    {
      "id": "motor.set_speed",
      "firmwareSymbol": "motor_set_speed",
      "label": "Set Speed",
      "dangerLevel": "normal",
      "inputSchema": {
        "type": "object",
        "additionalProperties": false,
        "required": ["value"],
        "properties": { "value": { "type": "integer", "minimum": 0, "maximum": 5000 } }
      }
    }
  ]
}
```

Add a widget in your nodes:

```json
{
  "id": "motor.slider",
  "firmwareSymbol": "motor_slider",
  "kind": "widget",
  "widget": "slider",
  "title": "Motor Speed",
  "bind": { "resource": "motor.speed", "action": "motor.set_speed" },
  "formatHint": "percent"
}
```

### 2. Build the firmware

```bash
pio run -t upload
```

The build automatically:
- Compiles `manifest.json` to protobuf
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

The mobile app will automatically render the new slider widget when it reconnects.

---

## Complete Manifest Reference

### Full `manifest.json` from the demo project

The project ships with a complete demo manifest that includes all widget types. See `firmware/esp32/src/manifest.json` for the full example.

The demo includes:
- 11 resources (bool, uint, float, int, string, enum, duration_ms)
- 8 actions (toggle, set brightness, set profile, set debug, factory reset, rename, set color, restart)
- 21 nodes organized into sections (Lighting, Telemetry, System, Advanced)
- Visibility rules (Advanced section visible only to admin role)
- Multiple widget types (toggle, slider, stat, select, badge, timer, button, text)

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

# Validate a manifest
npx tsx src/cli/main.ts validate --source ../firmware/esp32/src/manifest.json

# Compile to protobuf
npx tsx src/cli/main.ts compile --source ../firmware/esp32/src/manifest.json --out /tmp/manifest.pb

# Inspect runtime IDs
npx tsx src/cli/main.ts inspect --source ../firmware/esp32/src/manifest.json --ids

# Generate symbol files manually
npx tsx src/cli/main.ts symbols \
  --source ../firmware/esp32/src/manifest.json \
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
│   ├── manifest.json                 # YOUR UI DEFINITION
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
