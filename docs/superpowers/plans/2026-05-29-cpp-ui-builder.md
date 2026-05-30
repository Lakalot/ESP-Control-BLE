# C++ UI builder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users describe the whole device UI + handlers in fluent C++ at one place, compiled to the exact same protobuf manifest as today's YAML — with no ESP runtime cost, no mobile-app change, and no Node/pnpm dependency in the firmware build.

**Architecture:** A single `buildUi(Ui&, ...)` description is visited twice via an abstract `Ui` interface: on the host (`EmitterUi` → builds the normalized manifest → nanopb encode → `manifest_data.h`, compiled by g++, no Node) and on the ESP (`RuntimeUi` → register resources + typed handlers). The MVP omits jsonlogic conditional rules (the current device uses none).

**Tech Stack:** C++17, nanopb (already vendored), PlatformIO host+device builds, Unity (native tests). The TS toolchain (`tools/manifest`) is retained as the byte-equality test oracle but no longer invoked at build.

**Reference spec:** `docs/superpowers/specs/2026-05-29-cpp-ui-builder-design.md`

## CRITICAL GIT INSTRUCTION (every task)
The repo root is `D:\DEV\Amazing\ESP-Control-BLE`. Run all `git` from there. Match the Co-Authored-By trailer from `git log -3`; never `--no-verify`. (Unlike `apps/mobile`, the firmware lives in the root repo directly.)

**Commands:** native tests `& "$env:USERPROFILE\.platformio\penv\Scripts\platformio.exe" test -e native` (from `firmware/esp32`); firmware build `... run -e esp32dev`. TS oracle: `cd tools/manifest && npx tsx src/cli/main.ts compile --source <yaml> --out <pb>`.

**⚠️ TOOLCHAIN CONSTRAINT (confirmed at UI-T2):** the native test toolchain is **GCC 5.1.0** (`toolchain-gccmingw32`), which only PARTIALLY implements C++17 despite `-std=gnu++17`. Notably **nested-namespace syntax `namespace ecb::ui {}` does NOT compile** — use `namespace ecb { namespace ui { ... } }`. Avoid C++17 library features that GCC 5 lacks: `std::optional`, `std::string_view`, `std::variant`, structured bindings, `if constexpr`, inline variables, `std::byte`. Stick to C++11/14-safe constructs (the SPIKE used `-std=gnu++14` for the same reason). The esp32dev (Xtensa) toolchain is GCC 8.4 and fine, but **the native tests are the gate**, so code to GCC 5. Prefer `std::vector`/`std::unordered_map`/plain structs/sentinel returns over the above.

---

## Byte-equality contract (the spike's whole point)

The emitted protobuf must equal the TS toolchain's output for an equivalent manifest. The two deterministic details the C++ port MUST replicate exactly (from `tools/manifest/src/compiler`):
1. **Id assignment** (`assignIds.ts`): within each kind (resources/actions/screens/nodes), sort entries by their string `id` ascending, assign **1-based** index in that sorted order. (NOT declaration order.)
2. **String table** (`stringTable.ts`): index 0 is always `""`; thereafter intern in **first-use order**, deduplicated. `internOptional("")`/null → 0. The intern order is driven by the exact traversal order in `normalize.ts` (capabilities → resources → actions → screens → appShell → nodes, and within each, the field order there). The C++ emitter must visit fields in the **same order** or indices diverge.

The spike proves these match on a small manifest; if not, fall back to TS-at-build (keep the C++ fluent API, pipe its structured output to the TS encoder).

---

## File Structure

**New (lib, portable C++ — compiles host + ESP):**
- `firmware/esp32/lib/esp-control-ble/src/ui/Ui.h` — abstract `Ui` interface + builder types (`ResourceRef`, `SectionBuilder`, `WidgetBuilder`, `ViewBuilder`, `NavBuilder`).
- `firmware/esp32/lib/esp-control-ble/src/ui/ManifestModel.h` — the normalized in-memory model (mirrors `NormalizedManifest`): `UiModel` with vectors of resource/action/screen/node/navItem + a `StringTable`.
- `firmware/esp32/lib/esp-control-ble/src/ui/StringTable.h/.cpp` — port of `stringTable.ts`.
- `firmware/esp32/lib/esp-control-ble/src/ui/UiModelEncoder.h/.cpp` — `UiModel` → protobuf via nanopb (host-side; mirrors `encodeProto.ts` field mapping).
- `firmware/esp32/lib/esp-control-ble/src/ui/EmitterUi.h/.cpp` — `Ui` impl that builds a `UiModel` (host).
- `firmware/esp32/lib/esp-control-ble/src/ui/RuntimeUi.h/.cpp` — `Ui` impl that registers resources/handlers into `EspControl` (ESP).

**New (build tooling):**
- `firmware/esp32/tools/emit_ui.py` — compiles `device_ui.cpp` + emitter + nanopb + a host `main()` with g++, runs it → `manifest_data.h` + `manifest_symbols.h`.
- `firmware/esp32/tools/ui_emit_main.cpp` — the host entry point (`int main()` → calls user `buildUi` with an `EmitterUi`, writes the .h files).

**New (tests):**
- `firmware/esp32/test/native/test_string_table/…`, `test_ui_emitter/…` (golden byte-equality vs TS), `test_runtime_ui/…`.

**Modified (example app):**
- `firmware/esp32/app/device/device_ui.cpp` (new) replaces `manifest.yaml` as the source; `DeviceActions.cpp` handlers fold into `buildUi`.
- `firmware/esp32/app/device/AppRuntime.h` made Arduino-free in the header.
- `firmware/esp32/platformio.ini` — `extra_scripts` uses `emit_ui.py` instead of `embed_manifest.py`.

**Retained, not invoked at build:** `tools/manifest` (TS) — test oracle.

---

## Task 1: SPIKE — host emitter byte-equality (Go/No-Go)

**Goal:** Prove a minimal C++ emitter (StringTable + id assignment + a 1-resource/1-action/1-view model + nanopb encode), compiled by g++ on the host with NO Node, produces a protobuf **byte-identical** to the TS toolchain's output for the same tiny manifest.

**Files:**
- Create: `firmware/esp32/spike/ui_emitter/main.cpp`, `firmware/esp32/spike/ui_emitter/build.sh` (or `.ps1`)

- [ ] **Step 1: Generate the TS oracle bytes for a tiny manifest**

Create `firmware/esp32/spike/ui_emitter/tiny.yaml` — the smallest valid manifest (1 resource, 1 action, 1 view with 1 widget, no rules):

```yaml
version: 5
schemaVersion: 1
minAppVersion: 1.0.0
capabilities: { required: [layout.sections], optional: [] }
resources:
  - id: light.brightness
    firmwareSymbol: light_brightness
    label: Brightness
    valueType: uint
    unit: '%'
    readMode: subscribe
    staleAfterMs: 5000
actions:
  - id: light.set_brightness
    firmwareSymbol: light_set_brightness
    label: Set Brightness
    dangerLevel: normal
    inputSchema: { type: object, additionalProperties: false, required: [value], properties: { value: { type: integer, minimum: 0, maximum: 100 }}}
views:
  - id: home
    firmwareSymbol: home
    title: Home
    content:
      - kind: slider
        id: home.slider
        title: Brightness
        resource: light.brightness
        action: light.set_brightness
        formatHint: percent
```

Run the TS oracle to produce the reference bytes:
`cd tools/manifest && npx tsx src/cli/main.ts compile --source ../../firmware/esp32/spike/ui_emitter/tiny.yaml --out ../../firmware/esp32/spike/ui_emitter/oracle.pb`
Expected: writes `oracle.pb`. Record its byte length.

- [ ] **Step 2: Write the minimal C++ emitter spike**

`firmware/esp32/spike/ui_emitter/main.cpp` — hardcode the SAME tiny manifest as a `UiModel`, replicating `assignIds` (sort-by-id) + `StringTable` (intern in normalize's traversal order) + nanopb encode of `esp_control_ManifestBundle`. Read `tools/manifest/src/compiler/normalize.ts` for the exact field/intern order and `encodeProto.ts` for the message shape. Read `firmware/esp32/lib/esp-control-ble/src/nanopb/manifest.pb.h` for the struct/callback layout (repeated fields use nanopb callbacks — `pb_callback_t`).

Key implementation points the spike must get right:
- StringTable: `intern("")`→0 first; then intern in this order to match `normalize`: capability features, then per resource `slug(=id)`, `label`, `unit`, then `enumValues`; then per action `slug`, `label`, `confirm`, `inputSchema(JSON.stringify)`; then per screen `slug`, `title`, `routeKey`; then navBar items; then per node `slug`, `title`, `tone`, `text`, `formatHint`. (Match `normalize.ts` exactly.)
- The `inputSchema` string must be the **exact** `JSON.stringify` output of the schema object — same key order, no spaces. For the spike, hardcode that exact string (copy from the oracle/normalize) rather than building a JSON serializer.
- ids: resources/actions/screens/nodes each sorted by id, 1-based.
- Encode via nanopb with the repeated-field callbacks (strings table, resources, actions, screens, nodes). Write the output to `cpp.pb`.

`build.ps1` (compile with the mingw host g++ already used for native tests, linking nanopb):
```powershell
$tc = "$env:USERPROFILE\.platformio\packages\toolchain-gccmingw32\bin"
$np = "..\..\.pio\libdeps\native\Nanopb"
& "$tc\g++.exe" -std=gnu++17 -static -static-libgcc -static-libstdc++ -DPB_FIELD_32BIT `
  -I ..\..\lib\esp-control-ble\src -I $np `
  main.cpp ..\..\lib\esp-control-ble\src\nanopb\manifest.pb.c "$np\pb_encode.c" "$np\pb_common.c" `
  -o ui_emitter_spike.exe
.\ui_emitter_spike.exe   # writes cpp.pb
```

- [ ] **Step 3: Compare byte-for-byte**

Run (PowerShell): `Compare-Object ([IO.File]::ReadAllBytes("oracle.pb")) ([IO.File]::ReadAllBytes("cpp.pb"))`
Expected: **no differences** (identical bytes).
If they differ: diff the two protobufs (decode both with the TS `inspect` command or a hex dump) to find the divergence — almost always string-table order or an id. Fix the C++ traversal order. Iterate until identical.

- [ ] **Step 4: Go/No-Go decision**

If byte-identical with NO Node in the C++ path → **GO**: the mechanism is proven; proceed to build the real API. If you cannot reach byte-equality after reasonable effort (e.g. JSON.stringify key-order is intractable to match for complex schemas) → **STOP and report**: recommend the fallback (C++ fluent API but pipe structured output to the TS encoder at build, keeping Node). Document the measured outcome.

- [ ] **Step 5: Commit the spike**

```bash
git add firmware/esp32/spike/ui_emitter
git commit -m "spike(firmware): prove C++ manifest emitter is byte-identical to the TS toolchain"
```

---

## Task 2: StringTable (native, TDD)

**Files:**
- Create: `firmware/esp32/lib/esp-control-ble/src/ui/StringTable.h`, `.cpp`
- Test: `firmware/esp32/test/native/test_string_table/test_string_table.cpp`

- [ ] **Step 1: Write the failing test**

```cpp
#include <unity.h>
#include "ui/StringTable.h"
using ecb::ui::StringTable;
void setUp() {} void tearDown() {}

static void test_index_zero_is_empty_string() {
  StringTable t;
  TEST_ASSERT_EQUAL_UINT32(0u, t.intern(""));
  TEST_ASSERT_EQUAL_UINT32(1u, t.size());  // only "" so far
}
static void test_dedup_returns_same_index() {
  StringTable t;
  uint32_t a = t.intern("foo");
  uint32_t b = t.intern("bar");
  uint32_t c = t.intern("foo");
  TEST_ASSERT_EQUAL_UINT32(a, c);
  TEST_ASSERT_TRUE(a != b);
}
static void test_intern_optional_empty_is_zero() {
  StringTable t;
  TEST_ASSERT_EQUAL_UINT32(0u, t.internOptional(""));
  TEST_ASSERT_EQUAL_UINT32(0u, t.internOptional(nullptr));
}
static void test_first_use_order_preserved() {
  StringTable t;            // index 0 = ""
  TEST_ASSERT_EQUAL_UINT32(1u, t.intern("a"));
  TEST_ASSERT_EQUAL_UINT32(2u, t.intern("b"));
  TEST_ASSERT_EQUAL_UINT32(1u, t.intern("a"));
  TEST_ASSERT_EQUAL_STRING("a", t.at(1));
  TEST_ASSERT_EQUAL_STRING("b", t.at(2));
}
int main(int,char**){ UNITY_BEGIN();
  RUN_TEST(test_index_zero_is_empty_string);
  RUN_TEST(test_dedup_returns_same_index);
  RUN_TEST(test_intern_optional_empty_is_zero);
  RUN_TEST(test_first_use_order_preserved);
  return UNITY_END(); }
```

- [ ] **Step 2: Run — verify it fails** (`test -e native`): `StringTable.h` not found.

- [ ] **Step 3: Implement**

`StringTable.h`:
```cpp
#pragma once
#include <cstdint>
#include <string>
#include <unordered_map>
#include <vector>

namespace ecb::ui {

/** Mirrors tools/manifest stringTable.ts: index 0 is "", intern in first-use
 *  order, dedup. internOptional("")/nullptr -> 0. The intern order MUST match
 *  the TS normalize traversal for byte-identical protobuf output. */
class StringTable {
public:
  StringTable() { intern(""); }
  uint32_t intern(const std::string& value) {
    auto it = index_.find(value);
    if (it != index_.end()) return it->second;
    const uint32_t next = static_cast<uint32_t>(list_.size());
    list_.push_back(value);
    index_.emplace(value, next);
    return next;
  }
  uint32_t internOptional(const char* value) {
    if (value == nullptr || value[0] == '\0') return 0;
    return intern(value);
  }
  uint32_t size() const { return static_cast<uint32_t>(list_.size()); }
  const char* at(uint32_t i) const { return list_[i].c_str(); }
  const std::vector<std::string>& items() const { return list_; }
private:
  std::unordered_map<std::string, uint32_t> index_;
  std::vector<std::string> list_;
};

} // namespace ecb::ui
```
(Header-only is fine; if the plan's File Structure `.cpp` is unnecessary, drop it and note it.)

- [ ] **Step 4: Run — verify pass** (4 tests). All existing suites still green.

- [ ] **Step 5: Commit**
```bash
git add firmware/esp32/lib/esp-control-ble/src/ui/StringTable.h firmware/esp32/test/native/test_string_table
git commit -m "feat(firmware): StringTable for the C++ manifest emitter"
```

---

## Task 3: UiModel + id assignment + nanopb encoder (native, TDD against the oracle)

**Goal:** A `UiModel` (normalized shape) + `assignIds` (sort-by-id, 1-based) + `UiModelEncoder` (nanopb) that, fed the tiny manifest from the spike, produces bytes equal to `oracle.pb`. This is the spike's logic, productized + tested.

**Files:**
- Create: `firmware/esp32/lib/esp-control-ble/src/ui/ManifestModel.h`, `ui/UiModelEncoder.h/.cpp`
- Test: `firmware/esp32/test/native/test_ui_encoder/test_ui_encoder.cpp` (+ checked-in `oracle.pb` fixture from the spike)

- [ ] **Step 1: Write the failing test**

Copy `oracle.pb` (from Task 1) to `firmware/esp32/test/native/test_ui_encoder/oracle_tiny.pb`. Test:
```cpp
#include <unity.h>
#include <cstdio>
#include "ui/ManifestModel.h"
#include "ui/UiModelEncoder.h"
using namespace ecb::ui;
void setUp() {} void tearDown() {}

static std::vector<uint8_t> readFile(const char* p){ FILE* f=fopen(p,"rb"); fseek(f,0,SEEK_END); long n=ftell(f); fseek(f,0,SEEK_SET); std::vector<uint8_t> v(n); fread(v.data(),1,n,f); fclose(f); return v; }

static void test_tiny_manifest_encodes_byte_identical_to_oracle() {
  UiModel m = buildTinyFixtureModel();   // builds the same tiny manifest as the spike
  std::vector<uint8_t> out;
  TEST_ASSERT_TRUE(encodeUiModel(m, out));
  auto oracle = readFile("test/native/test_ui_encoder/oracle_tiny.pb");
  TEST_ASSERT_EQUAL_UINT32((uint32_t)oracle.size(), (uint32_t)out.size());
  TEST_ASSERT_EQUAL_UINT8_ARRAY(oracle.data(), out.data(), oracle.size());
}
int main(int,char**){ UNITY_BEGIN(); RUN_TEST(test_tiny_manifest_encodes_byte_identical_to_oracle); return UNITY_END(); }
```
(`buildTinyFixtureModel()` is a test helper that constructs the `UiModel` directly — provide it in the test file. Confirm the native test runner's CWD so the relative `oracle_tiny.pb` path resolves; if not, embed the oracle bytes as a C array instead.)

- [ ] **Step 2: Run — verify fail** (module not found).

- [ ] **Step 3: Implement `ManifestModel.h`** (mirror `NormalizedManifest`): plain structs `UiResource{ id, slugIdx, labelIdx, unitIdx, valueType, readMode, staleAfterMs, pollMs; std::vector<uint32_t> enumValueIdxs; }`, `UiAction{...}`, `UiScreen{...}`, `UiNode{...}`, `UiNavItem{...}`, and `UiModel{ uint32 version=5, schemaVersion, std::string minAppVersion; std::vector<uint32_t> featureIdxs; std::vector<UiNavItem> navItems; bool hasAppShell; StringTable strings; std::vector<UiResource> resources; … }`. Add free function `void assignIdsSorted(std::vector<T>& items)` semantics — but since ids are assigned during model construction, provide a helper `uint32_t assignId(...)` OR assign in the emitter (Task 4). For THIS task, the test helper sets ids/idxs directly to the known-correct values.

- [ ] **Step 4: Implement `UiModelEncoder`** — `bool encodeUiModel(const UiModel&, std::vector<uint8_t>& out)` using nanopb `pb_encode` of `esp_control_ManifestBundle`, with `pb_callback_t` encoders for the repeated fields (strings, resources, actions, screens, nodes, capabilities.featureIdxs, navBar.items, each node's childrenIds/enumValueIdxs). Mirror `encodeProto.ts` field-by-field. Read `manifest.pb.h` for exact field names. (This is the bulk; reuse the spike's working encoder.)

- [ ] **Step 5: Run — verify pass** (byte-identical to oracle).

- [ ] **Step 6: Commit**
```bash
git add firmware/esp32/lib/esp-control-ble/src/ui/ManifestModel.h firmware/esp32/lib/esp-control-ble/src/ui/UiModelEncoder.h firmware/esp32/lib/esp-control-ble/src/ui/UiModelEncoder.cpp firmware/esp32/test/native/test_ui_encoder
git commit -m "feat(firmware): UiModel + nanopb encoder, byte-identical to the TS oracle"
```

---

## Task 4: Ui interface + EmitterUi (native, TDD)

**Goal:** The fluent `Ui` API and the `EmitterUi` that turns `buildUi()` calls into a `UiModel` (doing id assignment + string interning in the correct order). Validated by emitting the tiny manifest via the fluent API and matching the oracle.

**Files:**
- Create: `ui/Ui.h`, `ui/EmitterUi.h/.cpp`
- Test: `firmware/esp32/test/native/test_ui_emitter/test_ui_emitter.cpp`

- [ ] **Step 1: Failing test** — describe the tiny manifest via the fluent API, emit, compare to `oracle_tiny.pb`:
```cpp
#include <unity.h>
#include "ui/Ui.h"
#include "ui/EmitterUi.h"
#include "ui/UiModelEncoder.h"
using namespace ecb::ui;
void setUp() {} void tearDown() {}

static void describeTiny(Ui& ui) {
  auto brightness = ui.resource("light.brightness", ValueType::Uint)
                      .label("Brightness").unit("%").readMode(ReadMode::Subscribe).staleAfterMs(5000);
  ui.view("home", "Home").content(
    ui.slider("home.slider", "Brightness", brightness, /*min*/0, /*max*/100)
      .action("light.set_brightness", "Set Brightness")   // schema derived from slider+range
      .formatHint("percent")
  );
}
static void test_fluent_api_emits_oracle_bytes() {
  EmitterUi emitter;
  describeTiny(emitter);
  UiModel m = emitter.build();
  std::vector<uint8_t> out; encodeUiModel(m, out);
  auto oracle = /* read oracle_tiny.pb (or embedded array) */;
  TEST_ASSERT_EQUAL_UINT8_ARRAY(oracle.data(), out.data(), oracle.size());
}
```
NOTE: the exact fluent shape is a design choice — keep it close to the spec's example (`ui.section().slider(...).onSet(...)`), but for the emitter test, `onSet` is irrelevant (handlers aren't emitted). The schema string for the action must be derived to match the oracle's `inputSchema` JSON exactly (a slider 0..100 → `{"type":"object","additionalProperties":false,"required":["value"],"properties":{"value":{"type":"integer","minimum":0,"maximum":100}}}`). Implement a small schema-string builder for the widget types (slider→integer min/max, toggle→boolean, select→string enum, text_input→string). Confirm byte-match against the oracle pins this.

- [ ] **Step 2: Run — fail.**
- [ ] **Step 3: Implement `Ui.h`** — abstract interface + builder objects. `Ui` declares virtual hooks the two impls override (resource, view, section, the widgets). Builders are lightweight handles that record into the impl. Handler setters (`onSet`) are templated and type-checked per widget but **no-op in EmitterUi**.
- [ ] **Step 4: Implement `EmitterUi`** — accumulates declarations, then `build()` runs `assignIds` (sort-by-id, 1-based) + interns strings in normalize order + derives schemas → `UiModel`.
- [ ] **Step 5: Run — pass (oracle match via fluent API).**
- [ ] **Step 6: Commit** `feat(firmware): fluent Ui API + EmitterUi (host manifest emission)`.

---

## Task 5: Full emitter coverage — match the real manifest (native, TDD)

**Goal:** Extend the fluent API + emitter to every widget/resource/view/navBar used by the current `manifest.yaml`, and prove the emitter reproduces the **full current manifest** byte-for-byte.

**⚠️ Two known risks surfaced by UI-T4's self-review (handle these explicitly):**
1. **Action intern order.** In the current `EmitterUi`, an action is created/interned the moment a widget binds it (`.action(id,...)`), so the action string-table positions follow the ORDER widgets bind actions in `buildUi` — which may differ from the YAML `actions:` block order, shifting every downstream string index and breaking byte-equality. Fix options: (a) order the `describeFullDevice` widget/action declarations to reproduce the oracle's action order, OR (b) make `EmitterUi.build()` intern action strings in a deterministic order (e.g. matching normalize: actions are interned in `input.actions` order — replicate that by sorting/ordering actions as the YAML did). Diff the string table against the oracle early to pin this.
2. **Schema-string derivation is incomplete for non-sliders.** The real manifest needs schema variants the widget type alone can't infer: `relay.toggle` has EMPTY `properties:{}` (no value) while `device.set_debug` (also a toggle) has `value:boolean`; buttons (`system.restart`, `system.factory_reset`) have EMPTY schemas; `device.rename` adds `minLength/maxLength`; `light.set_color`/`fan.set_profile` are string+enum (enum sourced from the bound resource). Extend `.action(...)` with the needed schema options (e.g. a `valueless()` form for no-payload actions, `minLength/maxLength` for text, enum pulled from the bound resource) so each action's `inputSchema` JSON byte-matches the oracle. Get each schema string EXACT (key order, no spaces).

**Files:**
- Test: `firmware/esp32/test/native/test_ui_emitter_full/test_ui_emitter_full.cpp` + the full-manifest oracle (embed as a C byte array like UI-T3 did, to avoid native-runner CWD path issues, OR check in `oracle_full.pb` only if the relative path resolves)

- [ ] **Step 1:** Generate `oracle_full.pb` from the current `firmware/esp32/src/manifest.yaml` via the TS oracle. Check it into the test dir.
- [ ] **Step 2: Failing test** — a `describeFullDevice(Ui&)` that mirrors the entire current manifest (3 views, all widgets, navBar, all resources/actions), emit, assert byte-equal to `oracle_full.pb`.
- [ ] **Step 3:** Run — fail (missing widget kinds / fields).
- [ ] **Step 4:** Implement the remaining widgets (text, stat, toggle, button, select, text_input, badge, progress, timer), container kinds (section, row, grid, stack), navBar, enum resources, danger levels, confirm strings, formatHint, unit. Iterate against the byte-diff until identical.
- [ ] **Step 5:** Run — pass (full manifest byte-identical). This is the proof the tablet sees no change.
- [ ] **Step 6: Commit** `test(firmware): emitter reproduces the full device manifest byte-for-byte`.

---

## Task 6: RuntimeUi — register resources + typed handlers (native, TDD)

**Goal:** The ESP-side `Ui` impl that registers resources (live/auto-publish) and typed action handlers into `EspControl`, reusing the existing engine.

**Files:**
- Create: `ui/RuntimeUi.h/.cpp`
- Test: `firmware/esp32/test/native/test_runtime_ui/test_runtime_ui.cpp`

- [ ] **Step 1: Failing test** — build a small UI via `RuntimeUi` bound to a fake/real `EspControl`; assert: (a) invoking the registered action with a uint payload calls the user lambda with the decoded value; (b) a resource bound to a variable publishes a delta when set. Reuse the `ActionRegistry`/`ProtocolEngine` test patterns.
- [ ] **Step 2:** Run — fail.
- [ ] **Step 3:** Implement `RuntimeUi`. FIRST, per UI-T5's recommendation, **hoist the shared id-assignment** (`sort-by-id ascending, 1-based`, and the `idOf(slug)` lookup) out of `EmitterUi.cpp`'s anonymous namespace into a shared header `ui/IdAssignment.h` (or similar), and have `EmitterUi` use it — so there is ONE implementation. `assignIds` is order-independent (a pure function of the SET of slugs), so both impls computing it over the same slug set yields identical ids. Re-run native tests to confirm EmitterUi still emits byte-identical after the refactor (the 3382-byte full oracle must still match).
  THEN implement `RuntimeUi`: `resource(id, ...)` → derive its id via the shared scheme + register it; `slider(...).onSet(fn)` → `registerAction(id, [fn](ctx){ /* type-check valueKind + decode + call fn */ })`. CRITICAL INVARIANT: the runtime ids MUST equal the emitter's ids for the same slugs (same shared `idOf` over the same slug set) so the manifest the tablet holds and the handlers the ESP registers refer to the same numeric ids. Add a test asserting `RuntimeUi`'s id for a slug equals `EmitterUi`'s id for that slug (build the SAME `describeFullDevice` through both and compare a few ids). The typed `onSet` decode must mirror the widget→ActionValueKind mapping (slider→Uint, toggle→Bool, select/text_input→String) and call the user's `std::function` with the decoded value; on a payload-kind mismatch, `replyError(BadPayload)`.
- [ ] **Step 4:** Run — pass.
- [ ] **Step 5: Commit** `feat(firmware): RuntimeUi registers resources and typed handlers`.

---

## Task 7: Make AppRuntime.h portable + host build tooling

**Files:**
- Modify: `firmware/esp32/app/device/AppRuntime.h` (remove Arduino from the header)
- Create: `firmware/esp32/tools/ui_emit_main.cpp`, `firmware/esp32/tools/emit_ui.py`
- Modify: `firmware/esp32/platformio.ini`

- [ ] **Step 1:** Read `AppRuntime.h`. Move any `<Arduino.h>`/`esp_*`/`analogWrite` usage out of the header into the `.cpp` (forward-declare, PIMPL, or plain method decls). The header must compile with host g++. Run the native build to confirm nothing broke.
- [ ] **Step 2:** Write `tools/ui_emit_main.cpp`: `int main(){ EmitterUi e; buildUi(e, /*stub runtime+state*/); auto model = e.build(); std::vector<uint8_t> pb; encodeUiModel(model, pb); /* write manifest_data.h + manifest_symbols.h */ }`. It links `device_ui.cpp` + stub `AppRuntime` (lambdas never run). Emit BOTH headers (data + symbols — the symbols are the slug→id table; derive from the model).
- [ ] **Step 3:** Write `tools/emit_ui.py` (PlatformIO pre-build): invoke host g++ to compile `ui_emit_main.cpp` + `device_ui.cpp` + emitter + nanopb (NO Node), run the exe → `src/manifest_data.h` + `src/manifest_symbols.h`. Model it on `embed_manifest.py` structure but with the g++ host-compile step (reuse the toolchain-gccmingw32 path; on non-Windows use system g++).
- [ ] **Step 4:** `platformio.ini`: replace `pre:tools/embed_manifest.py` with `pre:tools/emit_ui.py`. Keep `gen_nanopb.py`.
- [ ] **Step 5:** Verify a clean firmware build works with NO `pnpm install` (rename/hide `tools/manifest/node_modules` temporarily to prove independence, then restore). `run -e esp32dev` → SUCCESS, and `manifest_data.h` regenerated by the C++ path. Confirm the emitted bytes equal the old YAML output (diff manifest_data.h byte array vs a known-good).
- [ ] **Step 6: Commit** `build(firmware): emit manifest via C++ host build, drop Node from the firmware build`.

---

## Task 8: Migrate the example app to device_ui.cpp

**Files:**
- Create: `firmware/esp32/app/device/device_ui.cpp` (the `buildUi`)
- Modify: `firmware/esp32/app/main.cpp`, remove `DeviceActions` registration duplication
- Delete: `firmware/esp32/src/manifest.yaml` (after byte-equality proven) — or keep as reference under a `legacy/` path

- [ ] **Step 1:** Write `device_ui.cpp` = `describeFullDevice` from Task 5 + the handler bodies from `DeviceActions.cpp` as `.onSet(...)` lambdas calling `AppRuntime`. 
- [ ] **Step 2:** Wire `main.cpp`: at setup, `RuntimeUi runtimeUi(control, runtime, state); buildUi(runtimeUi, runtime, state);` replaces `actions.registerAll(...)`. The emitted manifest (from the same `buildUi`) is already embedded via Task 7.
- [ ] **Step 3:** Native tests green; `run -e esp32dev` SUCCESS; assert `manifest_data.h` from `device_ui.cpp` is byte-identical to the one previously generated from `manifest.yaml` (the ultimate "tablet unaffected" proof).
- [ ] **Step 4:** Remove `manifest.yaml` + `DeviceActions.{h,cpp}` (now fully replaced) — confirm nothing references them.
- [ ] **Step 5: Commit** `refactor(firmware): describe the device UI + handlers in C++ (device_ui.cpp)`.

---

## Task 9: Final verification

- [ ] **Step 1:** Native suite fully green (note total).
- [ ] **Step 2:** `run -e esp32dev` SUCCESS; record RAM/Flash (should be ~unchanged — manifest is the same blob).
- [ ] **Step 3:** Prove the build needs no Node: with `tools/manifest/node_modules` absent, a clean `run -e esp32dev` still succeeds.
- [ ] **Step 4:** Confirm the final `manifest_data.h` bytes == the TS oracle for the full manifest (tablet sees no change).
- [ ] **Step 5:** Grep for dangling references to `manifest.yaml`, `embed_manifest.py`, `DeviceActions`, `manifest_actions::`/`manifest_resources::` (if the symbol scheme changed) — clean up.
- [ ] **Step 6: Commit** any cleanup.

---

## Manual / follow-up
- jsonlogic conditional rules (`visibleIf`/`enabledIf`/`entryRules`) — out of MVP; add a `when(...)` rule API later if needed.
- The TS toolchain stays in-repo as the byte-equality oracle for the emitter tests; consider a CI check that emitter == TS on the fixtures to catch drift.

## Contract preserved
Emitted protobuf is byte-identical to today's YAML output (same ids via sort-by-id, same string table via normalize-order). The app mobile and the frozen wire protocol (sub-projects 1-3) are unaffected.
