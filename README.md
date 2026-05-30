# ESP-Control-BLE

Describe an ESP32 device's entire UI **and** behavior in **one C++ file**, and a mobile
app auto-renders the dashboard over Bluetooth — **no per-device mobile code**.

You write a single `void buildUi(ecb::ui::Ui& ui)` function with a fluent builder. At
build time a host-compiled emitter turns that same function into a protobuf *manifest*
embedded in the firmware; at runtime the device serves that manifest, and the phone
downloads it and renders sliders, toggles, selects, buttons, stats, and telemetry
dynamically. Add a control? Add a few lines to `device_ui.cpp` — that's it.

**What makes it cool**

- 🧩 **One file, whole device.** Resources, actions, layout, hardware bindings, and
  handlers all live in `device_ui.cpp`. The mobile app never changes.
- 🚫 **No Node in the firmware build.** PlatformIO host-compiles your `buildUi(...)` and
  runs it to emit the manifest. A clone + PlatformIO is enough — no `npm`, no `pnpm`.
- 🔌 **Declarative hardware.** `.pwmPin(2, 100)` on a slider makes the library PWM that
  pin on every value change. `device_ui.cpp` itself stays free of `<Arduino.h>`.
- 📡 **Two transports.** BLE (default) or Bluetooth Classic SPP for BLE-incapable
  Android tablets — same protocol, same app.
- 🔁 **Live state.** Controls are `subscribe`-mode resources, so the phone always shows
  the device's real current value, and `loop()` can push telemetry through typed handles.

---

## How it works

```
        ┌────────────────────────────┐                       ┌──────────────────────┐
        │           ESP32            │      BLE  /  SPP       │      Mobile App      │
        │                            │ ◄───────────────────► │   (React Native /    │
        │  buildUi(Ui&)  ── once ──► │   1. manifest (chunked)│        Expo)         │
        │   • resources              │   2. PIN auth (SHA-256)│                      │
        │   • actions                │   3. snapshot + deltas │  downloads manifest  │
        │   • layout + widgets       │   4. invoke action     │  → auto-renders UI   │
        │   • .onSet handlers + HW   │ ◄───────────────────► │  → syncs values      │
        └────────────────────────────┘                       └──────────────────────┘
```

1. You author the device in `firmware/esp32/src/device_ui.cpp` with the fluent `Ui`
   builder.
2. **At build time**, PlatformIO host-compiles `device_ui.cpp` with the library's
   `EmitterUi` and runs it; the program emits the protobuf manifest into
   `src/generated/manifest_data.h`, which is linked into the firmware.
3. **At boot**, `EspControl::beginUi(buildUi, ...)` walks the *same* `buildUi(...)` with
   `RuntimeUi`, registering every resource and typed handler, then serves the embedded
   manifest.
4. The phone connects, authenticates with a PIN, downloads the manifest, renders the
   dashboard, subscribes to resources (snapshot + live deltas), and dispatches actions
   when you tap/drag a control.

> **The dual visit:** one `buildUi(Ui&)`, two visitors. `EmitterUi` (host, build time)
> produces the manifest *bytes*; `RuntimeUi` (device, `setup()`) registers *behavior*.
> Resource and action ids are assigned by sorting slugs, so the phone and device agree
> without exchanging a symbol table. `EmitterUi` ignores `.onSet`/`.pwmPin` entirely, so
> handlers and hardware never affect the emitted bytes.

---

## Quick Start

### Prerequisites

| For | You need |
|---|---|
| **Firmware** | [PlatformIO](https://platformio.org/) (VSCode extension or `pio` CLI) and an ESP32 board. **No Node.** |
| **Mobile app** | [Node.js](https://nodejs.org/) 18+, npm, and [Expo](https://docs.expo.dev/) (a custom dev client — not Expo Go — because of native BLE/SPP modules). |
| **TS oracle (optional)** | Node + the `tools/manifest` package, only to run the byte-equality tests. Not needed to build anything. |

### 1. Build & flash the firmware

```bash
cd firmware/esp32

pio run                # build (re-emits the manifest from device_ui.cpp first)
pio run -t upload      # build + flash
pio device monitor     # serial @ 115200
```

The pre-build steps (`tools/gen_nanopb.py`, then `tools/emit_ui.py`) regenerate the
manifest automatically. No manual codegen, no Node.

### 2. Run the mobile app

```bash
cd apps/mobile
npm install

npm run android        # build & run the Android dev client (expo run:android)
npm run ios            # build & run the iOS dev client (expo run:ios)
npm start              # start the Metro dev server (expo start)
```

> The app uses native modules (`react-native-ble-plx`, and a local SPP module), so it
> runs in a **prebuilt dev client**, not Expo Go.

### 3. Connect

1. Open the app and scan.
2. Pick the device advertising as **`ESP32-Test`**.
3. Enter the PIN **`1234`**.
4. The dashboard renders automatically from the downloaded manifest.

Device name and PIN are set in `firmware/esp32/src/main.cpp`:
`EspControl control("ESP32-Test", "1234");`.

---

## Describe your device in C++

This is the whole point of the project. The demo in
[`firmware/esp32/src/device_ui.cpp`](firmware/esp32/src/device_ui.cpp) is a "smart light":
a power relay, a brightness slider that PWMs the on-board LED, color/fan presets, a debug
toggle, a rename field, restart/factory-reset buttons, and display-only telemetry. Every
excerpt below is from that file.

### Short-form widgets — one call does everything

A `*Short` call bundles **resource + `<slug>.set` action + widget + a default handler**
that writes the decoded value into the resource. The resource is created in
`Subscribe` read mode, so the phone sees the control's live state.

```cpp
// A slider with DECLARATIVE PWM. .pwmPin(kLedPin, 100) makes the library map
// 0..100% -> 0..255 duty and write the LED on every set(). No custom .onSet ->
// the short form's default setter writes the resource AND drives the declared pin.
SliderBuilder brightness = ui.sliderShort("light.brightness", "Brightness", 0, 100)
    .formatHint("percent")
    .pwmPin(kLedPin, 100);

// Presets / flags / rename: no custom logic -> the default setter writes the resource.
SelectBuilder color = ui.selectShort("light.color", "Color Preset",
    {"warm_white", "cool_white", "red", "green", "blue", "party"});
SelectBuilder fan = ui.selectShort("fan.profile", "Fan Profile", {"slow", "normal", "fast"});
ToggleBuilder debug = ui.toggleShort("device.debug", "Debug Mode");
TextInputBuilder rename = ui.textInputShort("device.name", "Rename Device");
```

The short forms are `sliderShort`, `toggleShort`, `selectShort`, `textInputShort`, and
`buttonShort`. Each returns a builder you can chain: `.formatHint(...)`,
`.pwmPin(pin, rangeMax)`, `.gpioPin(pin)`, `.invertHw()`, `.onSet(lambda)`,
`.bindAction(slug)`.

### Custom `.onSet` — replace the default writer

A custom `.onSet` **suppresses** the default value-writer, so your handler must write its
own resource(s) via a captured `Res<T>` handle. Signatures are fixed by the widget kind
and checked at compile time: slider → `void(uint8_t)`, toggle → `void(bool)`,
select/textInput → `void(const char*)`, button → `void()`.

```cpp
// Typed handles for the relay <-> brightness cross-reference.
Res<bool>     relayH = ui.resourceB("relay.auto", ValueType::Bool);
Res<uint32_t> bright = ui.resourceU32("light.brightness", ValueType::Uint);

// Main Power relay: custom onSet, so it writes `relayH` itself; setting `bright`
// re-drives the LED via the declarative PWM declared on the slider above.
ToggleBuilder relay = ui.toggleShort("relay.auto", "Main Power")
    .onSet([relayH, bright](bool on) {
      relayH.set(on);
      if (!on) bright.set(0u);
      else bright.set(bright.get() == 0u ? 100u : bright.get());
    });
```

### Destructive buttons — long-form danger/confirm

The short form can't express a danger level or a confirmation string, so destructive
actions are declared **long-form**: an explicit `ui.action(...)` carrying `.danger()` +
`.confirm()`, then a `ui.button(...)` bound to it by slug. The phone reads these from the
manifest and shows a confirm dialog before sending the action.

```cpp
ui.action("system.restart", "Restart")
    .danger(Danger::Dangerous).confirm("Restart the device now?").valueless();
ButtonBuilder restart = ui.button("settings.restart", "Restart")
    .bindAction("system.restart").onSet([]() {});

ui.action("system.factory_reset", "Factory Reset")
    .danger(Danger::Dangerous).confirm("This will erase all settings. Continue?").valueless();
ButtonBuilder factoryReset = ui.button("advanced.reset", "Factory Reset")
    .bindAction("system.factory_reset").onSet([]() {});
```

### Telemetry — push values from `loop()` with `Res<T>` handles

A `Res<T>` is a lightweight, copyable handle into the library's resource table — it holds
the resource id, not the value. `.set(v)` writes the value, publishes a delta, and drives
any declared hardware; `.get()` reads it. Telemetry resources are declared long-form (so a
`stat`/`badge`/`timer` widget can bind to them) and then grabbed again as typed handles —
which are stored in a `dev::` namespace and written from `loop()`.

```cpp
// in device_ui.cpp -- declared as globals, assigned inside buildUi():
namespace dev {
Res<float>    temperature;
Res<float>    humidity;
Res<uint32_t> load;
Res<int32_t>  rssi;
Res<uint32_t> uptime;
}  // namespace dev

// ...inside buildUi(), telemetry resources are Subscribe mode (NOT Poll): the mobile
// app only subscribes to subscribe-mode resources, so loop() pushes deltas on a timer.
ResourceRef tempRef = ui.resource("env.temperature", ValueType::Float)
    .label("Temperature").unit("C").readMode(ReadMode::Subscribe).staleAfterMs(5000);
// ...
dev::temperature = ui.resourceF("env.temperature", ValueType::Float);
dev::uptime      = ui.resourceU32("system.uptime", ValueType::DurationMs);
```

```cpp
// in main.cpp loop() -- push values; the device sends the deltas to the phone.
if (tempSched.shouldPublish(now)) {
  dev::temperature.set(temperatureRead());
  dev::humidity.set(45.0f);  // demo placeholder -- replace with a real sensor read
}
if (loadSched.shouldPublish(now)) {
  dev::rssi.set(-58);        // demo placeholder -- replace with a real WiFi.RSSI()
  dev::uptime.set(now);
  dev::load.set(computeLoadPercent(esp_timer_get_time()));
}
```

### Laying it out — views, sections, and a nav bar

Widgets only render when placed into a view's `content()` / a section's `children()`.
The demo builds three views and an app-shell nav bar:

```cpp
ViewBuilder home = ui.view("home", "Home");
home.content({
    ui.text("home.banner", "ESP Control").text("BLE-connected device dashboard."),
    ui.section("lighting.section", "Lighting").children({relay, brightness, color}),
});

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

// app-shell nav bar (declaration order: home / stats / settings).
ui.navItem("home", "Home", "home", home);
ui.navItem("stats", "Stats", "bar-chart-2", stats);
ui.navItem("settings", "Settings", "settings", settings);
```

### The device entry point (`main.cpp`)

`main.cpp` is tiny — it wires the manifest, builds the UI, ticks, and pushes telemetry.

```cpp
#define MANIFEST_DEFINE_DATA
#include "generated/manifest_data.h"
#include "device_ui.h"
#include "PublishScheduler.h"

EspControl control("ESP32-Test", "1234");      // device name, PIN
app::PublishScheduler tempSched(2000u);        // rate-limit telemetry
app::PublishScheduler loadSched(1000u);

void setup() {
  Serial.begin(115200);
  control.beginUi(buildUi, MANIFEST_DATA, MANIFEST_LEN);  // RuntimeUi + serve manifest
}

void loop() {
  control.tick();
  // ... push dev::* telemetry on the schedulers ...
  vTaskDelay(pdMS_TO_TICKS(50));
}
```

### Long-form API (advanced layouts)

The short forms cover most controls; the long-form builder is always available for
finer control:

- **Resources:** `ui.resource(slug, type).label().unit().readMode().staleAfterMs().pollMs().enumv({...})`
- **Typed handles:** `ui.resourceB / resourceU32 / resourceI32 / resourceF / resourceS(slug, type)` →
  a `Res<T>` (record-or-reuse by slug); free helper `toggle(Res<bool>&)`.
- **Actions:** `ui.action(slug, label).danger(...).confirm("...").cooldownMs(...)` plus exactly one
  input schema: `.valueless()`, `.boolean()`, `.integerRange(lo, hi)`, `.stringLen(lo, hi)`,
  `.stringEnum({...})`.
- **Widgets:** `slider`, `toggle`, `select`, `textInput`, `button`, `text`, `stat`, `badge`,
  `progress`, `timer`; bind with `.bindAction(slug)`.
- **Containers/views:** `ui.section()`, `ui.row()`, `ui.grid(cols)`, `ui.stack()`,
  `.children({...})`; `ui.view().content({...})`; `ui.navItem(...)`.
- **Capabilities:** `ui.requireCapability("layout.sections")` / `ui.optionalCapability(...)`.

---

## Adding a new control

To add, say, a motor-speed slider, you mostly just add lines to `device_ui.cpp`.

**1. Declare it inside `buildUi(...)` and place it in a view:**

```cpp
// Short-form slider: resource + action + widget + default writer, all in one.
SliderBuilder motor = ui.sliderShort("motor.speed", "Motor Speed", 0, 100)
    .formatHint("percent")
    .pwmPin(/*pin=*/4, /*rangeMax=*/100);   // optional: drive a pin declaratively

// ...then drop `motor` into a section so it renders:
ui.section("lighting.section", "Lighting").children({relay, brightness, color, motor});
```

That alone gives you a working, hardware-driving control. The slider value decodes to
`uint8_t` (0..100). For a wider raw range, give it a custom `.onSet` and scale into a
`Res<uint32_t>` you write yourself.

**2. (Telemetry only) add a `dev::` handle** if you also want to *report* a value from
`loop()`:

```cpp
// device_ui.cpp, namespace dev:  Res<uint32_t> motorSpeed;
// inside buildUi():              dev::motorSpeed = ui.resourceU32("motor.speed", ValueType::Uint);
// main.cpp loop():               dev::motorSpeed.set(currentRpm);
```

**3. Build & flash:**

```bash
pio run -t upload
```

The build re-emits the manifest from `device_ui.cpp` — no Node, no symbol files. The
phone renders the new slider automatically on its next connect.

---

## How the build works (no Node)

PlatformIO runs two pre-build scripts (see `extra_scripts` in
[`firmware/esp32/platformio.ini`](firmware/esp32/platformio.ini)):

1. **`tools/gen_nanopb.py`** — generates the nanopb C headers from `proto/manifest.proto`.
2. **`tools/emit_ui.py`** — host-compiles a tiny program (`tools/ui_emit_main.cpp` +
   `src/device_ui.cpp` + the library's `EmitterUi` + the vendored nanopb encoder) with the
   **same mingw `g++` the native tests use**, runs it, and writes
   `src/generated/manifest_data.h` — the embedded protobuf the phone downloads.

```
device_ui.cpp ──(host g++, -DECB_HOST_EMIT)──► ui_emit.exe ──run──► src/generated/manifest_data.h
        │                                                                     │
        └────────────(same file, device build)────────────────────────────► firmware .bin
```

The emitter and the device runtime are the two visitors of the dual-visit architecture
(`EmitterUi` on the host, `RuntimeUi` on the device). Any compile/run failure **fails the
build loudly** — it never falls back to a stale header, so the manifest can't silently
drift from the code.

> **TS toolchain = oracle only.** The TypeScript package under `tools/manifest/` is *not*
> used to build firmware. It is retained purely as the **golden oracle**: a test proves the
> C++ emitter's bytes are byte-for-byte identical to what the TS toolchain produces, so the
> wire format and mobile app are provably unaffected by the migration.

---

## Project structure

```
ESP-Control-BLE/
├── firmware/esp32/                 # ESP32 firmware (PlatformIO / Arduino)
│   ├── platformio.ini              # envs: esp32dev / release / native; pre-build emit
│   ├── src/
│   │   ├── main.cpp                # entry point: EspControl + beginUi + loop telemetry
│   │   ├── device_ui.cpp           # ★ buildUi(): the whole device in one file
│   │   ├── device_ui.h             # buildUi() decl + dev:: telemetry handles
│   │   ├── PublishScheduler.h      # telemetry rate-limit helper
│   │   └── generated/
│   │       └── manifest_data.h     # emitted protobuf (built from device_ui.cpp)
│   ├── lib/esp-control-ble/        # core library (see Architecture)
│   │   └── src/
│   │       ├── EspControlBle.{h,cpp}   # EspControl facade (beginUi, tick, publishDelta)
│   │       ├── ui/                      # Ui builder, Res<T>, EmitterUi, RuntimeUi, HwHal
│   │       ├── protocol/               # auth / manifest / resources / actions / snapshot / subscriptions
│   │       ├── transport/              # ble/ (Bluedroid) + spp/ + frame/ codecs
│   │       ├── support/                # logging helpers
│   │       └── nanopb/                 # checked-in nanopb-generated proto headers
│   ├── tools/
│   │   ├── emit_ui.py               # pre-build: device_ui.cpp → manifest (host g++, no Node)
│   │   ├── ui_emit_main.cpp         # host emitter entry point
│   │   ├── gen_nanopb.py            # pre-build: nanopb C codegen
│   │   └── configure_native_toolchain.py
│   └── test/native/                # ~98 native unit tests (Unity)
│
├── apps/mobile/                    # React Native / Expo app (auto-renders any manifest)
│   ├── src/
│   │   ├── manifest/               # decode / model / render / rules / forms / runtime
│   │   ├── transport/              # BLE scan/manager + transport selection
│   │   ├── protocol/               # frame codec + manifest transfer
│   │   ├── settings/               # transport flag (ble | spp | fixture)
│   │   └── store / hooks / ui / utils
│   ├── modules/ecb-spp/            # local Expo module: Bluetooth Classic SPP (Android)
│   └── __tests__/                  # Jest tests
│
├── tools/manifest/                 # TypeScript manifest toolchain — test ORACLE only
│   ├── src/cli/                    # validate / compile / inspect / symbols
│   └── tests/fixtures/             # YAML fixtures used by the oracle tests
│
├── proto/
│   └── manifest.proto              # protobuf schema for the manifest
│
└── package.json                    # pnpm workspace root
```

---

## Manifest data model (what the builder produces)

The manifest is a **protobuf** (schema: [`proto/manifest.proto`](proto/manifest.proto))
emitted from your C++ `buildUi(...)`. You don't hand-write it — but knowing its shape
explains what the builder methods set and what the phone renders. The demo manifest is
~3.1 KB. Top-level fields: `version = 5`, `schemaVersion = 1`, `minAppVersion = "1.0.0"`,
plus capabilities, resources, actions, views, and nodes.

### Resources

A resource is a typed value the device exposes; the phone subscribes and shows it live.

| Field | Builder method | Description |
|---|---|---|
| slug / id | `ui.resource("env.temperature", …)` | Unique `SlugId` (`^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$`). Ids are assigned by sorting slugs. |
| `valueType` | 2nd arg to `resource(...)` | See value types below |
| `label` | `.label("Temperature")` | Human-readable name |
| `unit` | `.unit("C")` | Display suffix (e.g. `%`, `dBm`) |
| `readMode` | `.readMode(ReadMode::Subscribe)` | How the phone reads it |
| `staleAfterMs` | `.staleAfterMs(5000)` | Mark stale after N ms with no update |
| `pollMs` | `.pollMs(...)` | Poll interval (only for `Poll` mode) |
| `enumValues` | `.enumv({...})` / `selectShort` options | Allowed names for an `Enum` value |

### Value types

| `ValueType` | Meaning | `Res<T>` handle |
|---|---|---|
| `Bool` | boolean | `Res<bool>` (`resourceB`) |
| `Int` | signed 32-bit | `Res<int32_t>` (`resourceI32`) |
| `Uint` | unsigned 32-bit | `Res<uint32_t>` (`resourceU32`) |
| `Float` | 32-bit float | `Res<float>` (`resourceF`) |
| `String` | string (≤ 64 chars) | `Res<const char*>` (`resourceS`) |
| `Enum` | one of `enumValues` | `Res<const char*>` |
| `DurationMs` | duration in ms | `Res<uint32_t>` |

### Read modes

| `ReadMode` | Behavior |
|---|---|
| `Subscribe` | Push: the device publishes deltas, the phone listens. **Short-form widgets use this**, so a control always shows its real current value. |
| `Poll` | The phone expects periodic updates at `pollMs`. (The phone only subscribes to `Subscribe` resources, so telemetry uses `Subscribe`, not `Poll`.) |
| `Snapshot` | One-shot value, sent on connect/subscription. |

### Actions & danger levels

An action is something the user triggers. Its input schema is derived from the widget
(short form) or set explicitly long-form. Danger level drives the phone's confirm UX.

| `Danger` | UI behavior |
|---|---|
| `Normal` | Immediate |
| `Elevated` | Visual warning |
| `Dangerous` | Confirmation dialog (uses the action's `confirm` text) |

Input schema selectors (long-form `ui.action(...)`): `.valueless()`, `.boolean()`,
`.integerRange(lo, hi)`, `.stringLen(lo, hi)`, `.stringEnum({...})`.

---

## The mobile app

[`apps/mobile/`](apps/mobile) is a React Native / Expo app (prebuild + custom dev client)
that renders **any** device's manifest — there is no device-specific code in it.

- **What it does:** scans, authenticates (PIN, SHA-256 challenge/response), downloads the
  manifest, builds the view/node tree, and renders widgets dynamically. It subscribes to
  `subscribe`-mode resources and displays their snapshot + deltas, and dispatches
  `InvokeAction` when you operate a control.
- **Transports** (`apps/mobile/src/settings/manifestRuntimeFlag.ts`,
  type `Transport = 'ble' | 'spp' | 'fixture'`):
  - **`ble`** — `react-native-ble-plx` (default, cross-platform).
  - **`spp`** — Bluetooth Classic over a local Expo module
    (`apps/mobile/modules/ecb-spp`, **Android only**), for tablets whose BLE hardware is
    unavailable. Startup auto-detect (`src/transport/selectTransport.ts`) flips to SPP when
    BLE reports `unsupported` and Classic is available.
  - **`fixture`** — a bundled in-app manifest with no hardware, for UI development.

**Run / test:**

```bash
cd apps/mobile
npm install
npm run android      # or: npm run ios  /  npm start
npm test             # Jest
```

---

## Testing

| Suite | Command | What it covers |
|---|---|---|
| **Firmware native** | `cd firmware/esp32 && pio test -e native` | ~98 Unity tests: frame codec, resource table, action dispatch, manifest store/embed, snapshot encoder, subscription + protocol session, auth, BLE dispatch, the UI string table / encoder / `EmitterUi` (incl. **determinism** + full byte-equality), `RuntimeUi`, `Res<T>` handles, short-form widgets, and a sizeof/footprint audit. |
| **Mobile** | `cd apps/mobile && npm test` | Jest: manifest decode, frame codec, runtime/state machines, widget rendering, rules, forms, transport. |
| **TS oracle** | `cd tools/manifest && npm test` | Vitest (`vitest run`): the golden manifest the C++ emitter is checked against. |

---

## Configuration

| Setting | Where | Default |
|---|---|---|
| Device name | `src/main.cpp` — `EspControl(...)` | `"ESP32-Test"` |
| PIN | `src/main.cpp` — `EspControl(...)` | `"1234"` |
| LED pin (demo PWM output) | `src/device_ui.cpp` — `kLedPin` | `2` |
| Telemetry cadence | `src/main.cpp` — `PublishScheduler(...)` | 2000 ms (temp/humidity), 1000 ms (rssi/load/uptime) |
| Loop tick delay | `src/main.cpp` — `loop()` | 50 ms |
| BLE service UUID | `lib/.../protocol/core/Protocol.h` | `feccc3c2-…-095207` |
| Manifest chunk size | `Protocol.h` — `ECB_MANIFEST_CHUNK_SIZE` | 180 bytes |
| Max resources | `protocol/resources/ResourceTable.h` — `kMaxEntries` | 64 |
| Max action handlers | `protocol/actions/ActionRegistry.h` — `kMaxHandlers` | 32 |
| Max string value length | `ResourceTable` / `ActionRegistry` | 64 chars |

---

## Architecture

**The library** ([`firmware/esp32/lib/esp-control-ble/`](firmware/esp32/lib/esp-control-ble))
owns everything except your `device_ui.cpp`:

- **`ui/`** — the fluent `Ui` builder (`Ui.h`), the `Res<T>` value handle (`Res.h`), the two
  visitors `EmitterUi` (host → manifest bytes) and `RuntimeUi` (device → resources +
  handlers), the id assignment (sort-by-slug), and `HwHal` (the pin-driving HAL behind
  `.pwmPin`/`.gpioPin`). The library **owns resource state** in `ResourceTable`; a `Res<T>`
  is just a handle into it.
- **`protocol/`** — `auth/` (PIN SHA-256 challenge/response), `manifest/` (chunked transfer
  + CRC32), `resources/` (`ResourceTable`), `actions/` (`ActionRegistry` + dispatch),
  `snapshot/` (protobuf snapshot/delta encoder), `subscriptions/` (per-resource tracking).
- **`transport/`** — `ble/` (Arduino-ESP32 **Bluedroid** GATT server: a read-only manifest
  characteristic + a write/notify data characteristic), `spp/` (Bluetooth Classic
  `BluetoothSerial`), and `frame/` (the framed data-protocol codec shared by both).

**The protocol.** One service exposes a manifest characteristic (discovery) and a
write/notify **data** characteristic carrying everything else. Frames are
`[kind:1][flags:1][length:2 BE][body:N]`:

| Frame | Code | Direction | Purpose |
|---|---|---|---|
| `ManifestChunk` | `0x01` | device → phone | 180-byte manifest protobuf chunk |
| `ManifestEof` | `0x02` | device → phone | total size + CRC32 |
| `Snapshot` | `0x10` | device → phone | full resource state |
| `Delta` | `0x11` | device → phone | one resource changed |
| `InvokeAction` | `0x20` | phone → device | action id + payload |
| `InvokeResult` | `0x21` | device → phone | action status |
| `Subscribe` / `Unsubscribe` | `0x30` / `0x31` | phone → device | resource subscriptions |
| `Ping` / `Pong` | `0x32` / `0x33` | both | keep-alive |
| `AuthRequest` / `AuthChallenge` / `AuthResponse` / `AuthResult` | `0x40`–`0x43` | both | PIN handshake |

The same framed protocol runs unchanged over BLE notifications or the SPP byte stream.

---

## License

Private project. All rights reserved.
