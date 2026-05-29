# Firmware dual-mode BLE + SPP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a Bluetooth-Classic-only device (e.g. an old tablet) control the ESP32 exactly like the BLE app, by migrating the Bluetooth layer from NimBLE to Bluedroid (BTDM) and adding an SPP transport that shares the existing protocol engine.

**Architecture:** A transport-agnostic `ProtocolEngine` (evolution of `DataBleTransport`) owns the protocol + an in-band auth handshake + single-session exclusivity. Concrete transports (`BleTransport` on Bluedroid, `SppTransport` on `BluetoothSerial`) implement a thin `ITransport` interface and feed bytes to the engine. A `FrameAccumulator` reconstructs frames from the SPP byte stream.

**Tech Stack:** ESP32 (original, dual-mode), Arduino framework, Bluedroid (`BLEDevice`/`BLEServer` + `BluetoothSerial`), nanopb, Unity (native tests), PlatformIO.

**Reference spec:** `docs/superpowers/specs/2026-05-29-firmware-dual-mode-ble-spp-design.md`

**Run native tests:** `& "$env:USERPROFILE\.platformio\penv\Scripts\platformio.exe" test -e native`
**Build firmware:** `& "$env:USERPROFILE\.platformio\penv\Scripts\platformio.exe" run -e esp32dev`

---

## File Structure

**New files:**
- `firmware/esp32/lib/esp-control-ble/src/transport/frame/FrameAccumulator.h` / `.cpp` — byte-stream → framed messages (SPP).
- `firmware/esp32/lib/esp-control-ble/src/transport/ITransport.h` — transport interface.
- `firmware/esp32/lib/esp-control-ble/src/transport/spp/SppTransport.h` / `.cpp` — Bluedroid SPP transport.
- `firmware/esp32/test/native/test_frame_accumulator/test_frame_accumulator.cpp` — accumulator tests.
- `firmware/esp32/test/native/test_protocol_auth/test_protocol_auth.cpp` — in-band auth + session tests.
- `firmware/esp32/spike/bluedroid_btdm/` — throwaway spike sketch (not built into firmware).

**Modified files:**
- `firmware/esp32/lib/esp-control-ble/src/protocol/core/Protocol.h` — nonce/hash sizes, new FrameKind auth values.
- `firmware/esp32/lib/esp-control-ble/src/protocol/auth/AuthHandler.{h,cpp}` — 16-byte nonce/hash, constant-time compare, raw hash API.
- `firmware/esp32/lib/esp-control-ble/src/transport/ble/DataBleTransport.{h,cpp}` — becomes `ProtocolEngine` (in-band auth + session state). Kept file name to limit churn; class renamed.
- `firmware/esp32/lib/esp-control-ble/src/transport/ble/BleTransport.{h,cpp}` — rewritten on Bluedroid, 2 characteristics, legacy v4 removed.
- `firmware/esp32/lib/esp-control-ble/src/EspControlBle.{h,cpp}` — wire up engine + both transports, drop CommandRegistry.
- `firmware/esp32/lib/esp-control-ble/library.json` — drop NimBLE dep.
- `firmware/esp32/platformio.ini` — remove NimBLE lib_dep + NimBLE build flags; add partition table.
- `firmware/esp32/app/main.cpp` — unchanged API, but verify still compiles.

**Removed files (Task 6):**
- `firmware/esp32/lib/esp-control-ble/src/protocol/commands/CommandRegistry.{h,cpp}` — legacy v4.

---

## Task 1: Spike — Bluedroid BTDM budget (Go/No-Go)

**Goal:** Prove BLE + SPP start together under Bluedroid and measure real RAM/Flash before investing in the migration. This is a throwaway; it is NOT wired into the firmware build.

**Files:**
- Create: `firmware/esp32/spike/bluedroid_btdm/main.cpp`
- Create: `firmware/esp32/spike/bluedroid_btdm/platformio.ini`

- [ ] **Step 1: Create the spike sketch**

`firmware/esp32/spike/bluedroid_btdm/main.cpp`:

```cpp
#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BluetoothSerial.h>

BluetoothSerial SerialBT;

void setup() {
  Serial.begin(115200);
  delay(200);

  // BLE side
  BLEDevice::init("ESP32-Spike");
  BLEServer* server = BLEDevice::createServer();
  BLEService* svc = server->createService("feccc3c2-7a95-4c26-91e6-f86158095207");
  svc->start();
  BLEAdvertising* adv = BLEDevice::getAdvertising();
  adv->addServiceUUID("feccc3c2-7a95-4c26-91e6-f86158095207");
  adv->start();

  // Classic SPP side
  SerialBT.begin("ESP32-Spike");

  Serial.printf("[spike] BLE + SPP started. Free heap: %u bytes\n", ESP.getFreeHeap());
  Serial.printf("[spike] Min free heap: %u bytes\n", ESP.getMinFreeHeap());
}

void loop() {
  static uint32_t last = 0;
  if (millis() - last > 2000) {
    last = millis();
    Serial.printf("[spike] free heap: %u\n", ESP.getFreeHeap());
  }
  delay(50);
}
```

`firmware/esp32/spike/bluedroid_btdm/platformio.ini`:

```ini
[env:esp32dev]
platform = espressif32
board = esp32dev
framework = arduino
board_build.partitions = huge_app.csv
monitor_speed = 115200
build_flags = -DCORE_DEBUG_LEVEL=3
```

- [ ] **Step 2: Build the spike and record Flash usage**

Run: `& "$env:USERPROFILE\.platformio\penv\Scripts\platformio.exe" run -d firmware/esp32/spike/bluedroid_btdm`
Expected: SUCCESS. Record the `RAM:` and `Flash:` percentages printed by the size check.

- [ ] **Step 3: Go/No-Go decision (manual)**

If Flash fits within `huge_app.csv` (app partition ~3 MB) and the printed free heap at runtime is comfortably above ~120 KB, proceed. Document the measured numbers in the task notes / commit message. If the budget is blown, STOP and revisit the spec (e.g. drop simultaneous availability, reduce buffers) before continuing.

> NOTE: runtime heap requires flashing to a device. If no device is available, rely on the Flash figure from the build and the published Bluedroid BTDM RAM cost (~60–100 KB over NimBLE) as the Go/No-Go proxy, and confirm heap on-device before Task 5.

- [ ] **Step 4: Commit the spike**

```bash
git add firmware/esp32/spike/bluedroid_btdm
git commit -m "spike(firmware): bluedroid BTDM BLE+SPP budget probe"
```

---

## Task 2: FrameAccumulator (SPP byte-stream framing)

**Goal:** A pure, Bluetooth-free component that turns a byte stream into complete frames using the existing `[kind:1][flags:1][length:2 BE]` header, with resync and a bounded buffer.

**Files:**
- Create: `firmware/esp32/lib/esp-control-ble/src/transport/frame/FrameAccumulator.h`
- Create: `firmware/esp32/lib/esp-control-ble/src/transport/frame/FrameAccumulator.cpp`
- Create: `firmware/esp32/test/native/test_frame_accumulator/test_frame_accumulator.cpp`

- [ ] **Step 1: Write the failing test**

`firmware/esp32/test/native/test_frame_accumulator/test_frame_accumulator.cpp`:

```cpp
#include <unity.h>
#include <string.h>
#include "transport/frame/FrameAccumulator.h"
#include "transport/frame/DataFrameCodec.h"
#include "protocol/core/Protocol.h"

using namespace ecb;

void setUp() {}
void tearDown() {}

struct Captured { FrameKind kind; uint8_t flags; uint8_t body[64]; size_t len; };
static Captured g_frames[8];
static size_t g_count;

static void sink(FrameKind kind, uint8_t flags, const uint8_t* body, size_t len, void*) {
  Captured& c = g_frames[g_count++];
  c.kind = kind; c.flags = flags; c.len = len;
  if (len) memcpy(c.body, body, len > 64 ? 64 : len);
}

// Helper: build a wire frame [kind][flags][lenHi][lenLo][body...]
static size_t makeFrame(uint8_t* out, FrameKind kind, const uint8_t* body, uint16_t len) {
  out[0] = (uint8_t)kind; out[1] = 0;
  out[2] = (uint8_t)((len >> 8) & 0xFF); out[3] = (uint8_t)(len & 0xFF);
  if (len) memcpy(out + 4, body, len);
  return 4u + len;
}

static void test_single_frame_in_one_chunk() {
  g_count = 0;
  FrameAccumulator acc(sink, nullptr);
  uint8_t wire[16]; const uint8_t body[3] = {0xAA, 0xBB, 0xCC};
  size_t n = makeFrame(wire, FrameKind::Ping, body, 3);
  acc.feed(wire, n);
  TEST_ASSERT_EQUAL_UINT32(1u, g_count);
  TEST_ASSERT_EQUAL_UINT8((uint8_t)FrameKind::Ping, (uint8_t)g_frames[0].kind);
  TEST_ASSERT_EQUAL_UINT32(3u, g_frames[0].len);
  TEST_ASSERT_EQUAL_UINT8(0xBB, g_frames[0].body[1]);
}

static void test_frame_split_across_chunks() {
  g_count = 0;
  FrameAccumulator acc(sink, nullptr);
  uint8_t wire[16]; const uint8_t body[3] = {0x01, 0x02, 0x03};
  size_t n = makeFrame(wire, FrameKind::InvokeAction, body, 3);
  acc.feed(wire, 1);        // partial header
  acc.feed(wire + 1, 2);    // rest of header
  TEST_ASSERT_EQUAL_UINT32(0u, g_count);  // not complete yet
  acc.feed(wire + 3, n - 3); // body
  TEST_ASSERT_EQUAL_UINT32(1u, g_count);
  TEST_ASSERT_EQUAL_UINT8((uint8_t)FrameKind::InvokeAction, (uint8_t)g_frames[0].kind);
}

static void test_two_frames_concatenated() {
  g_count = 0;
  FrameAccumulator acc(sink, nullptr);
  uint8_t wire[32]; const uint8_t b1[1] = {0x10}; const uint8_t b2[2] = {0x20, 0x21};
  size_t n1 = makeFrame(wire, FrameKind::Subscribe, b1, 1);
  size_t n2 = makeFrame(wire + n1, FrameKind::Unsubscribe, b2, 2);
  acc.feed(wire, n1 + n2);
  TEST_ASSERT_EQUAL_UINT32(2u, g_count);
  TEST_ASSERT_EQUAL_UINT8((uint8_t)FrameKind::Subscribe, (uint8_t)g_frames[0].kind);
  TEST_ASSERT_EQUAL_UINT8((uint8_t)FrameKind::Unsubscribe, (uint8_t)g_frames[1].kind);
}

static void test_resync_after_garbage_byte() {
  g_count = 0;
  FrameAccumulator acc(sink, nullptr);
  uint8_t wire[16]; const uint8_t body[1] = {0x55};
  // Leading garbage byte 0x99 (unknown kind) then a valid Ping frame.
  uint8_t stream[17]; stream[0] = 0x99;
  size_t n = makeFrame(wire, FrameKind::Ping, body, 1);
  memcpy(stream + 1, wire, n);
  acc.feed(stream, 1 + n);
  TEST_ASSERT_EQUAL_UINT32(1u, g_count);  // recovered the valid frame
  TEST_ASSERT_EQUAL_UINT8((uint8_t)FrameKind::Ping, (uint8_t)g_frames[0].kind);
}

static void test_oversized_length_is_dropped() {
  g_count = 0;
  FrameAccumulator acc(sink, nullptr);
  // kind=Ping, length=0xFFFF (> kMaxFrameBody) -> must not deliver, must not hang.
  uint8_t hdr[4] = {(uint8_t)FrameKind::Ping, 0, 0xFF, 0xFF};
  acc.feed(hdr, 4);
  uint8_t filler[64] = {0};
  acc.feed(filler, 64);
  TEST_ASSERT_EQUAL_UINT32(0u, g_count);
}

int main(int, char**) {
  UNITY_BEGIN();
  RUN_TEST(test_single_frame_in_one_chunk);
  RUN_TEST(test_frame_split_across_chunks);
  RUN_TEST(test_two_frames_concatenated);
  RUN_TEST(test_resync_after_garbage_byte);
  RUN_TEST(test_oversized_length_is_dropped);
  return UNITY_END();
}
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `& "$env:USERPROFILE\.platformio\penv\Scripts\platformio.exe" test -e native`
Expected: FAIL — `FrameAccumulator.h: No such file or directory`.

- [ ] **Step 3: Write the header**

`firmware/esp32/lib/esp-control-ble/src/transport/frame/FrameAccumulator.h`:

```cpp
#pragma once
#include <stddef.h>
#include <stdint.h>
#include "../../protocol/core/Protocol.h"

namespace ecb {

// Reassembles framed messages from a byte stream (used by stream transports
// such as SPP, where writes are not message-delimited). Frame layout matches
// DataFrameCodec: [kind:1][flags:1][length:2 BE][body:length].
class FrameAccumulator {
public:
  using FrameFn = void (*)(FrameKind kind, uint8_t flags,
                           const uint8_t* body, size_t len, void* ctx);

  FrameAccumulator(FrameFn onFrame, void* ctx) : _onFrame(onFrame), _ctx(ctx), _len(0) {}

  // Feed received bytes; delivers every complete frame via onFrame().
  void feed(const uint8_t* data, size_t len);

  // Discard any partially-accumulated bytes (e.g. on disconnect).
  void reset() { _len = 0; }

private:
  static constexpr size_t kHeaderSize = 4;
  static constexpr size_t kCapacity = kHeaderSize + kMaxFrameBody;

  FrameFn _onFrame;
  void*   _ctx;
  uint8_t _buf[kCapacity];
  size_t  _len;

  static bool isKnownKind(uint8_t kind);
  void dropFront(size_t n);
};

} // namespace ecb
```

- [ ] **Step 4: Run the test to verify it still fails (link error)**

Run: `& "$env:USERPROFILE\.platformio\penv\Scripts\platformio.exe" test -e native`
Expected: FAIL — undefined reference to `FrameAccumulator::feed`.

- [ ] **Step 5: Write the implementation**

`firmware/esp32/lib/esp-control-ble/src/transport/frame/FrameAccumulator.cpp`:

```cpp
#include "FrameAccumulator.h"
#include <string.h>

namespace ecb {

bool FrameAccumulator::isKnownKind(uint8_t kind) {
  switch (static_cast<FrameKind>(kind)) {
    case FrameKind::ManifestChunk:
    case FrameKind::ManifestEof:
    case FrameKind::Snapshot:
    case FrameKind::Delta:
    case FrameKind::InvokeAction:
    case FrameKind::InvokeResult:
    case FrameKind::Subscribe:
    case FrameKind::Unsubscribe:
    case FrameKind::Ping:
    case FrameKind::Pong:
    case FrameKind::AuthRequest:
    case FrameKind::AuthChallenge:
    case FrameKind::AuthResponse:
    case FrameKind::AuthResult:
      return true;
    default:
      return false;
  }
}

void FrameAccumulator::dropFront(size_t n) {
  if (n >= _len) { _len = 0; return; }
  memmove(_buf, _buf + n, _len - n);
  _len -= n;
}

void FrameAccumulator::feed(const uint8_t* data, size_t len) {
  for (size_t i = 0; i < len; ++i) {
    if (_len < kCapacity) {
      _buf[_len++] = data[i];
    } else {
      // Buffer full without a valid frame: drop oldest byte to make room.
      dropFront(1);
      _buf[_len++] = data[i];
    }

    // Try to extract as many complete frames as possible.
    for (;;) {
      if (_len < kHeaderSize) break;

      if (!isKnownKind(_buf[0])) { dropFront(1); continue; }

      const uint16_t bodyLen = static_cast<uint16_t>((_buf[2] << 8) | _buf[3]);
      if (bodyLen > kMaxFrameBody) { dropFront(1); continue; }

      const size_t total = kHeaderSize + bodyLen;
      if (_len < total) break;  // wait for more bytes

      _onFrame(static_cast<FrameKind>(_buf[0]), _buf[1], _buf + kHeaderSize, bodyLen, _ctx);
      dropFront(total);
    }
  }
}

} // namespace ecb
```

- [ ] **Step 6: Add the new FrameKind values (needed for the test to compile)**

Modify `firmware/esp32/lib/esp-control-ble/src/protocol/core/Protocol.h` — extend the `FrameKind` enum:

```cpp
enum class FrameKind : uint8_t {
  ManifestChunk = 0x01,
  ManifestEof   = 0x02,
  Snapshot      = 0x10,
  Delta         = 0x11,
  InvokeAction  = 0x20,
  InvokeResult  = 0x21,
  Subscribe     = 0x30,
  Unsubscribe   = 0x31,
  Ping          = 0x32,
  Pong          = 0x33,
  AuthRequest   = 0x40,
  AuthChallenge = 0x41,
  AuthResponse  = 0x42,
  AuthResult    = 0x43,
};
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `& "$env:USERPROFILE\.platformio\penv\Scripts\platformio.exe" test -e native`
Expected: PASS — all 5 `test_frame_accumulator` tests pass; existing suites still pass.

- [ ] **Step 8: Commit**

```bash
git add firmware/esp32/lib/esp-control-ble/src/transport/frame/FrameAccumulator.h firmware/esp32/lib/esp-control-ble/src/transport/frame/FrameAccumulator.cpp firmware/esp32/test/native/test_frame_accumulator/test_frame_accumulator.cpp firmware/esp32/lib/esp-control-ble/src/protocol/core/Protocol.h
git commit -m "feat(firmware): add FrameAccumulator for SPP byte-stream framing"
```

---

## Task 3: Strengthen auth (16-byte nonce/hash, constant-time, raw API)

**Goal:** Widen nonce/hash from 4 to 16 bytes, compare in constant time, and expose a raw `computeHash(nonce, out)` + `verifyHash(hash)` API the engine can drive for the in-band handshake (no framing byte assumptions).

**Files:**
- Modify: `firmware/esp32/lib/esp-control-ble/src/protocol/core/Protocol.h:94-95`
- Modify: `firmware/esp32/lib/esp-control-ble/src/protocol/auth/AuthHandler.h`
- Modify: `firmware/esp32/lib/esp-control-ble/src/protocol/auth/AuthHandler.cpp`
- Modify: `firmware/esp32/test/native/test_auth_handler/test_auth_handler.cpp`

- [ ] **Step 1: Update the auth test for 16-byte nonce/hash + new API**

Replace `firmware/esp32/test/native/test_auth_handler/test_auth_handler.cpp` with:

```cpp
#define private public
#include "protocol/auth/AuthHandler.h"
#undef private

#include <unity.h>
#include <string.h>

void setUp() {}
void tearDown() {}

// SHA-256("1234" || nonce[0x01..0x10]) truncated to 16 bytes, precomputed.
static const uint8_t kExpectedHash[16] = {
  0xBC, 0xB0, 0x85, 0x18, 0xD2, 0x96, 0x7E, 0x37,
  0x5F, 0x57, 0x3D, 0x7E, 0x3A, 0x64, 0x49, 0x74,
};

static void setNonce1to16(AuthHandler& auth) {
  for (int i = 0; i < ECB_NONCE_SIZE; ++i) auth._nonce[i] = (uint8_t)(i + 1);
}

static void test_compute_hash_matches_sha256_prefix() {
  AuthHandler auth;
  auth.setPin("1234");
  setNonce1to16(auth);
  uint8_t out[ECB_HASH_SIZE] = {0};
  auth.computeHash(out);
  TEST_ASSERT_EQUAL_UINT8_ARRAY(kExpectedHash, out, ECB_HASH_SIZE);
}

static void test_verify_hash_accepts_correct_response() {
  AuthHandler auth;
  auth.setPin("1234");
  setNonce1to16(auth);
  TEST_ASSERT_TRUE(auth.verifyHash(kExpectedHash));
  TEST_ASSERT_TRUE(auth.isAuthenticated());
}

static void test_verify_hash_rejects_wrong_response() {
  AuthHandler auth;
  auth.setPin("1234");
  setNonce1to16(auth);
  uint8_t wrong[ECB_HASH_SIZE];
  memcpy(wrong, kExpectedHash, ECB_HASH_SIZE);
  wrong[0] ^= 0xFF;
  TEST_ASSERT_FALSE(auth.verifyHash(wrong));
  TEST_ASSERT_FALSE(auth.isAuthenticated());
}

static void test_nonce_and_hash_are_16_bytes() {
  TEST_ASSERT_EQUAL_INT(16, ECB_NONCE_SIZE);
  TEST_ASSERT_EQUAL_INT(16, ECB_HASH_SIZE);
}

int main(int, char**) {
  UNITY_BEGIN();
  RUN_TEST(test_nonce_and_hash_are_16_bytes);
  RUN_TEST(test_compute_hash_matches_sha256_prefix);
  RUN_TEST(test_verify_hash_accepts_correct_response);
  RUN_TEST(test_verify_hash_rejects_wrong_response);
  return UNITY_END();
}
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `& "$env:USERPROFILE\.platformio\penv\Scripts\platformio.exe" test -e native`
Expected: FAIL — `ECB_NONCE_SIZE` still 4 (`test_nonce_and_hash_are_16_bytes` fails) and `computeHash`/`verifyHash` undefined.

- [ ] **Step 3: Widen the sizes in Protocol.h**

Modify `firmware/esp32/lib/esp-control-ble/src/protocol/core/Protocol.h:94-95`:

```cpp
#define ECB_NONCE_SIZE      16
#define ECB_HASH_SIZE       16
```

- [ ] **Step 4: Update the AuthHandler header with the raw API**

Replace `firmware/esp32/lib/esp-control-ble/src/protocol/auth/AuthHandler.h`:

```cpp
#pragma once
#include "../core/Protocol.h"

class AuthHandler {
public:
  void setPin(const char* pin);

  // Fill nonceOut (ECB_NONCE_SIZE bytes) with a fresh random challenge and
  // clear the authenticated flag.
  void generateChallenge(uint8_t* nonceOut);

  // Compute SHA-256(pin || nonce) truncated to ECB_HASH_SIZE into hashOut.
  void computeHash(uint8_t* hashOut);

  // Constant-time compare of response (ECB_HASH_SIZE bytes) against the
  // expected hash; sets and returns the authenticated flag.
  bool verifyHash(const uint8_t* response);

  bool isAuthenticated() const { return _authenticated; }
  void reset() { _authenticated = false; }

private:
  uint8_t     _nonce[ECB_NONCE_SIZE];
  const char* _pin = nullptr;
  bool        _authenticated = false;
};
```

- [ ] **Step 5: Rewrite AuthHandler.cpp (both builds), constant-time compare**

Replace `firmware/esp32/lib/esp-control-ble/src/protocol/auth/AuthHandler.cpp`. Keep the existing pure-C SHA-256 used under `UNIT_TEST` (lines for `sha256*`), only changing the public methods. Under the hardware `#else` keep `mbedtls`. The shared structure:

For the `UNIT_TEST` branch, keep the existing `sha256Init/Update/Final/Transform` helpers and the `kSha256Table` exactly as they are, then replace the three public methods at the bottom with:

```cpp
void AuthHandler::setPin(const char* pin) { _pin = pin; }

void AuthHandler::generateChallenge(uint8_t* nonceOut) {
  _authenticated = false;
  // Deterministic-but-nonzero pattern under UNIT_TEST (no esp_random()).
  for (int i = 0; i < ECB_NONCE_SIZE; ++i) _nonce[i] = 0xA5;
  memcpy(nonceOut, _nonce, ECB_NONCE_SIZE);
}

void AuthHandler::computeHash(uint8_t* hashOut) {
  if (!_pin) { memset(hashOut, 0, ECB_HASH_SIZE); return; }
  const size_t pinLen = strlen(_pin);
  const size_t totalLen = pinLen + ECB_NONCE_SIZE;
  uint8_t combined[64];
  if (totalLen > sizeof(combined)) { memset(hashOut, 0, ECB_HASH_SIZE); return; }
  memcpy(combined, _pin, pinLen);
  memcpy(combined + pinLen, _nonce, ECB_NONCE_SIZE);

  Sha256State state{};
  uint8_t fullHash[32] = {0};
  sha256Init(state);
  sha256Update(state, combined, totalLen);
  sha256Final(state, fullHash);
  memcpy(hashOut, fullHash, ECB_HASH_SIZE);
}

bool AuthHandler::verifyHash(const uint8_t* response) {
  uint8_t expected[ECB_HASH_SIZE];
  computeHash(expected);
  uint8_t diff = 0;
  for (int i = 0; i < ECB_HASH_SIZE; ++i) diff |= (uint8_t)(expected[i] ^ response[i]);
  _authenticated = (diff == 0);
  return _authenticated;
}
```

For the hardware `#else` branch, replace its public methods with the same `setPin`, a `generateChallenge` that uses `esp_random()`:

```cpp
void AuthHandler::setPin(const char* pin) { _pin = pin; }

void AuthHandler::generateChallenge(uint8_t* nonceOut) {
  _authenticated = false;
  for (int i = 0; i < ECB_NONCE_SIZE; i++) _nonce[i] = (uint8_t)(esp_random() & 0xFF);
  memcpy(nonceOut, _nonce, ECB_NONCE_SIZE);
}

void AuthHandler::computeHash(uint8_t* hashOut) {
  if (!_pin) { memset(hashOut, 0, ECB_HASH_SIZE); return; }
  size_t pinLen = strlen(_pin);
  size_t totalLen = pinLen + ECB_NONCE_SIZE;
  uint8_t combined[64];
  if (totalLen > sizeof(combined)) { memset(hashOut, 0, ECB_HASH_SIZE); return; }
  memcpy(combined, _pin, pinLen);
  memcpy(combined + pinLen, _nonce, ECB_NONCE_SIZE);

  uint8_t fullHash[32];
  mbedtls_sha256_context ctx;
  mbedtls_sha256_init(&ctx);
  mbedtls_sha256_starts(&ctx, 0);
  mbedtls_sha256_update(&ctx, combined, totalLen);
  mbedtls_sha256_finish(&ctx, fullHash);
  mbedtls_sha256_free(&ctx);
  memcpy(hashOut, fullHash, ECB_HASH_SIZE);
}

bool AuthHandler::verifyHash(const uint8_t* response) {
  uint8_t expected[ECB_HASH_SIZE];
  computeHash(expected);
  uint8_t diff = 0;
  for (int i = 0; i < ECB_HASH_SIZE; i++) diff |= (uint8_t)(expected[i] ^ response[i]);
  _authenticated = (diff == 0);
  return _authenticated;
}
```

> NOTE: the old `verifyResponse(response, len)` (which assumed a leading `ECB_AUTH_OK` byte) is removed. Callers move to the in-band handshake in Task 4. The legacy `BleTransport` that called it is rewritten in Task 5.

- [ ] **Step 6: Run the test to verify it passes**

Run: `& "$env:USERPROFILE\.platformio\penv\Scripts\platformio.exe" test -e native`
Expected: PASS — `test_auth_handler` passes. (Other suites that reference the old API may now fail to build; they are fixed in Task 4. If a suite fails to compile here, note it and proceed to Task 4, which removes the old call sites — but do NOT leave the tree broken across a commit boundary: include the Task 4 engine change in the same logical run if the build is red.)

- [ ] **Step 7: Commit**

```bash
git add firmware/esp32/lib/esp-control-ble/src/protocol/core/Protocol.h firmware/esp32/lib/esp-control-ble/src/protocol/auth/AuthHandler.h firmware/esp32/lib/esp-control-ble/src/protocol/auth/AuthHandler.cpp firmware/esp32/test/native/test_auth_handler/test_auth_handler.cpp
git commit -m "feat(firmware): 16-byte nonce/hash auth with constant-time compare and raw API"
```

---

## Task 4: ProtocolEngine — in-band auth + session exclusivity

**Goal:** Evolve `DataBleTransport` into `ProtocolEngine`: handle the auth handshake frames, gate all other frames behind authentication, and enforce single-session exclusivity. Keep the file name `DataBleTransport.{h,cpp}` to limit churn; rename the class to `ProtocolEngine` with a `using DataBleTransport = ProtocolEngine;` alias removed once callers are updated.

**Files:**
- Modify: `firmware/esp32/lib/esp-control-ble/src/transport/ble/DataBleTransport.h`
- Modify: `firmware/esp32/lib/esp-control-ble/src/transport/ble/DataBleTransport.cpp`
- Create: `firmware/esp32/test/native/test_protocol_auth/test_protocol_auth.cpp`

- [ ] **Step 1: Write the failing test**

`firmware/esp32/test/native/test_protocol_auth/test_protocol_auth.cpp`:

```cpp
#include <unity.h>
#include <string.h>
#include "transport/ble/DataBleTransport.h"
#include "transport/frame/DataFrameCodec.h"
#include "protocol/core/Protocol.h"
#include "protocol/actions/ActionRegistry.h"
#include "protocol/subscriptions/SubscriptionState.h"
#include "protocol/resources/ResourceTable.h"
#include "protocol/manifest/ManifestStore.h"
#include "protocol/auth/AuthHandler.h"

using namespace ecb;

void setUp() {}
void tearDown() {}

static uint8_t g_last[256]; static size_t g_lastLen; static size_t g_count;
static void sender(void*, const uint8_t* f, size_t n) {
  g_count++; g_lastLen = n > sizeof(g_last) ? sizeof(g_last) : n;
  memcpy(g_last, f, g_lastLen);
}

static FrameKind lastKind() { return (FrameKind)g_last[0]; }

static ProtocolEngine* makeEngine(AuthHandler& auth, ResourceTable& table,
                                   SubscriptionState& subs, ActionRegistry& reg,
                                   ManifestStore& store) {
  auth.setPin("1234");
  static ProtocolEngine* e = nullptr;
  e = new ProtocolEngine(store, table, subs, reg, auth, FrameSender{nullptr, sender});
  return e;
}

static void test_frame_rejected_before_auth() {
  g_count = 0;
  uint8_t man[4] = {1,2,3,4}; ManifestStore store(man, 4);
  ResourceTable table; SubscriptionState subs; ActionRegistry reg; AuthHandler auth;
  ProtocolEngine* e = makeEngine(auth, table, subs, reg, store);
  // Subscribe before auth must NOT register a subscription.
  uint8_t body[2] = {0x08, 0x0A};
  e->handleFrame(FrameKind::Subscribe, body, sizeof(body));
  TEST_ASSERT_FALSE(subs.isWatching(10));
}

static void test_auth_handshake_succeeds() {
  g_count = 0;
  uint8_t man[4] = {1,2,3,4}; ManifestStore store(man, 4);
  ResourceTable table; SubscriptionState subs; ActionRegistry reg; AuthHandler auth;
  ProtocolEngine* e = makeEngine(auth, table, subs, reg, store);

  // 1) AuthRequest -> expect AuthChallenge with nonce body.
  e->handleFrame(FrameKind::AuthRequest, nullptr, 0);
  TEST_ASSERT_EQUAL_UINT8((uint8_t)FrameKind::AuthChallenge, (uint8_t)lastKind());
  uint8_t nonce[ECB_NONCE_SIZE];
  memcpy(nonce, g_last + DataFrameCodec::kHeaderSize, ECB_NONCE_SIZE);

  // 2) Compute the expected response the same way the client would.
  // Under UNIT_TEST generateChallenge fills nonce with 0xA5; recompute hash.
  uint8_t resp[ECB_HASH_SIZE];
  auth.computeHash(resp);  // uses the nonce just generated

  // 3) AuthResponse -> expect AuthResult OK.
  e->handleFrame(FrameKind::AuthResponse, resp, ECB_HASH_SIZE);
  TEST_ASSERT_EQUAL_UINT8((uint8_t)FrameKind::AuthResult, (uint8_t)lastKind());
  TEST_ASSERT_EQUAL_UINT8(0x01, g_last[DataFrameCodec::kHeaderSize]);

  // 4) Now a Subscribe is honored.
  uint8_t body[2] = {0x08, 0x0A};
  e->handleFrame(FrameKind::Subscribe, body, sizeof(body));
  TEST_ASSERT_TRUE(subs.isWatching(10));
}

static void test_wrong_response_fails_and_stays_locked() {
  g_count = 0;
  uint8_t man[4] = {1,2,3,4}; ManifestStore store(man, 4);
  ResourceTable table; SubscriptionState subs; ActionRegistry reg; AuthHandler auth;
  ProtocolEngine* e = makeEngine(auth, table, subs, reg, store);
  e->handleFrame(FrameKind::AuthRequest, nullptr, 0);
  uint8_t bad[ECB_HASH_SIZE] = {0};
  e->handleFrame(FrameKind::AuthResponse, bad, ECB_HASH_SIZE);
  TEST_ASSERT_EQUAL_UINT8((uint8_t)FrameKind::AuthResult, (uint8_t)lastKind());
  TEST_ASSERT_EQUAL_UINT8(0x00, g_last[DataFrameCodec::kHeaderSize]);  // FAIL
  uint8_t body[2] = {0x08, 0x0A};
  e->handleFrame(FrameKind::Subscribe, body, sizeof(body));
  TEST_ASSERT_FALSE(subs.isWatching(10));
}

int main(int, char**) {
  UNITY_BEGIN();
  RUN_TEST(test_frame_rejected_before_auth);
  RUN_TEST(test_auth_handshake_succeeds);
  RUN_TEST(test_wrong_response_fails_and_stays_locked);
  return UNITY_END();
}
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `& "$env:USERPROFILE\.platformio\penv\Scripts\platformio.exe" test -e native`
Expected: FAIL — `ProtocolEngine` undefined; constructor signature has no `AuthHandler&`.

- [ ] **Step 3: Update the header — rename class, add auth, take AuthHandler&**

In `firmware/esp32/lib/esp-control-ble/src/transport/ble/DataBleTransport.h`:

Add the include at the top (after the existing includes):

```cpp
#include "../../protocol/auth/AuthHandler.h"
```

Rename `class DataBleTransport` to `class ProtocolEngine`, change the constructor to accept an `AuthHandler&`, and add the auth/session members. The class becomes:

```cpp
class ProtocolEngine {
public:
  static constexpr size_t kFrameBufferSize = DataFrameCodec::kHeaderSize + kMaxFrameBody;
  static constexpr size_t kInvokeResultBufferSize = DataFrameCodec::kHeaderSize + 256u;
  static constexpr size_t kDeltaFrameBufferSize = DataFrameCodec::kHeaderSize + 128u;

  enum class Session : uint8_t { None = 0, Ble = 1, Spp = 2 };

  ProtocolEngine(const ManifestStore& store,
                 ResourceTable& table,
                 SubscriptionState& subs,
                 const ActionRegistry& registry,
                 AuthHandler& auth,
                 FrameSender sender);

  void handleFrame(FrameKind kind, const uint8_t* body, size_t len);
  void sendManifest();
  void sendSnapshot();
  void sendDelta(uint32_t resourceId);
  void reset();
  void tick();

  // Session exclusivity. Returns false if another session is already active.
  bool beginSession(Session who);
  void endSession(Session who);

private:
  const ManifestStore&    _store;
  ResourceTable&          _table;
  SubscriptionState&      _subs;
  const ActionRegistry&   _registry;
  AuthHandler&            _auth;
  FrameSender             _sender;
  Session                 _activeSession = Session::None;
  volatile bool           _snapshotPending = false;
  uint64_t                _deltaPendingMask = 0;
  bool                    _manifestPending = false;
  size_t                  _manifestOffset = 0;
  SemaphoreHandle_t       _mutex;
  bool sendEncodedFrame(FrameKind kind, uint8_t flags, uint8_t* frame, size_t cap, size_t bodyLen);
  void sendFrame(FrameKind kind, uint8_t flags, const uint8_t* body, size_t len);
  void sendDeltaInternal(uint32_t resourceId);
  void handleAuthRequest();
  void handleAuthResponse(const uint8_t* body, size_t len);
};
```

At the very bottom of the namespace (before `} // namespace`), add a transitional alias so existing callers keep compiling until Task 5:

```cpp
using DataBleTransport = ProtocolEngine;
```

- [ ] **Step 4: Update the implementation — rename + auth gate**

In `firmware/esp32/lib/esp-control-ble/src/transport/ble/DataBleTransport.cpp`:

Change the constructor signature and store `_auth`:

```cpp
ProtocolEngine::ProtocolEngine(const ManifestStore& s, ResourceTable& t,
                               SubscriptionState& su, const ActionRegistry& r,
                               AuthHandler& auth, FrameSender sender)
  : _store(s), _table(t), _subs(su), _registry(r), _auth(auth), _sender(sender) {
    _mutex = xSemaphoreCreateMutex();
    if (_mutex == nullptr) {
      ECB_LOGF("[ECB DATA] FATAL: mutex allocation failed\n");
    }
}
```

Rename every other `DataBleTransport::` method definition to `ProtocolEngine::`.

Add the session methods:

```cpp
bool ProtocolEngine::beginSession(Session who) {
  xSemaphoreTake(_mutex, portMAX_DELAY);
  bool ok = (_activeSession == Session::None || _activeSession == who);
  if (ok) _activeSession = who;
  xSemaphoreGive(_mutex);
  return ok;
}

void ProtocolEngine::endSession(Session who) {
  xSemaphoreTake(_mutex, portMAX_DELAY);
  if (_activeSession == who) {
    _activeSession = Session::None;
    _auth.reset();
  }
  xSemaphoreGive(_mutex);
  reset();  // clears subscriptions/pending state
}
```

Add the auth handlers (note: `sendFrame` already exists and prepends the header):

```cpp
void ProtocolEngine::handleAuthRequest() {
  uint8_t nonce[ECB_NONCE_SIZE];
  _auth.generateChallenge(nonce);
  sendFrame(FrameKind::AuthChallenge, 0, nonce, ECB_NONCE_SIZE);
}

void ProtocolEngine::handleAuthResponse(const uint8_t* body, size_t len) {
  bool ok = (len >= ECB_HASH_SIZE) && _auth.verifyHash(body);
  uint8_t result = ok ? 0x01 : 0x00;
  sendFrame(FrameKind::AuthResult, 0, &result, 1);
}
```

Rewrite `handleFrame` to gate on auth:

```cpp
void ProtocolEngine::handleFrame(FrameKind kind, const uint8_t* body, size_t len) {
  // Auth handshake frames are always processed.
  if (kind == FrameKind::AuthRequest) {
    xSemaphoreTake(_mutex, portMAX_DELAY);
    handleAuthRequest();
    xSemaphoreGive(_mutex);
    return;
  }
  if (kind == FrameKind::AuthResponse) {
    xSemaphoreTake(_mutex, portMAX_DELAY);
    handleAuthResponse(body, len);
    xSemaphoreGive(_mutex);
    return;
  }

  // Everything else requires authentication.
  if (!_auth.isAuthenticated()) {
    return;
  }

  xSemaphoreTake(_mutex, portMAX_DELAY);
  switch (kind) {
    case FrameKind::Ping:
      sendFrame(FrameKind::Pong, 0, nullptr, 0);
      break;
    case FrameKind::Subscribe: {
      esp_control_Subscribe sub = esp_control_Subscribe_init_zero;
      SubDecodeCtx ctx{&_subs, true};
      sub.resource_ids.funcs.decode = decodeResourceIds;
      sub.resource_ids.arg = &ctx;
      pb_istream_t is = pb_istream_from_buffer(body, len);
      pb_decode(&is, esp_control_Subscribe_fields, &sub);
      _snapshotPending = true;
      break;
    }
    case FrameKind::Unsubscribe: {
      esp_control_Unsubscribe uns = esp_control_Unsubscribe_init_zero;
      SubDecodeCtx ctx{&_subs, false};
      uns.resource_ids.funcs.decode = decodeResourceIds;
      uns.resource_ids.arg = &ctx;
      pb_istream_t is = pb_istream_from_buffer(body, len);
      pb_decode(&is, esp_control_Unsubscribe_fields, &uns);
      _deltaPendingMask = 0;
      break;
    }
    case FrameKind::InvokeAction: {
      xSemaphoreGive(_mutex);
      uint8_t reply[kInvokeResultBufferSize] = {0};
      size_t replyLen = 0;
      if (ActionDecoder::dispatch(_registry, body, len,
                                  reply + DataFrameCodec::kHeaderSize,
                                  sizeof(reply) - DataFrameCodec::kHeaderSize,
                                  replyLen)) {
        sendEncodedFrame(FrameKind::InvokeResult, 0, reply, sizeof(reply), replyLen);
      }
      xSemaphoreTake(_mutex, portMAX_DELAY);
      break;
    }
    default: break;
  }
  xSemaphoreGive(_mutex);
}
```

- [ ] **Step 5: Migrate the existing engine tests to the new signature + auth**

Two existing suites construct the engine with the old 5-arg signature and call
`handleFrame` without authenticating: `test_ble_transport_dispatch` (4 construction
sites at lines 49, 64, 83, 105) and `test_ble_transport_runtime` (line ~74). Both will
now fail to compile (missing `AuthHandler&`) and, once compiling, their frames will be
rejected pre-auth.

For **each** construction site in those two files, apply this pattern: declare an
authenticated `AuthHandler` and pass it in. Add near the top of each test function:

```cpp
AuthHandler auth;
auth.setPin("1234");
ProtocolEngine transport(store, table, subs, reg, auth, FrameSender{nullptr, fakeSender});
// Drive the handshake so subsequent frames are honored:
transport.handleFrame(FrameKind::AuthRequest, nullptr, 0);
uint8_t resp[ECB_HASH_SIZE];
auth.computeHash(resp);                 // recompute against the freshly generated nonce
transport.handleFrame(FrameKind::AuthResponse, resp, ECB_HASH_SIZE);
```

Add `#include "protocol/auth/AuthHandler.h"` to both test files. Replace the type name
`DataBleTransport` with `ProtocolEngine` at each site (the alias still exists, so this is
optional now but required by Task 8 — do it here to avoid rework).

Run: `& "$env:USERPROFILE\.platformio\penv\Scripts\platformio.exe" test -e native`
Expected: PASS — `test_protocol_auth`, `test_ble_transport_dispatch`, and
`test_ble_transport_runtime` all green, plus existing suites. All green before commit.

- [ ] **Step 6: Commit**

```bash
git add firmware/esp32/lib/esp-control-ble/src/transport/ble/DataBleTransport.h firmware/esp32/lib/esp-control-ble/src/transport/ble/DataBleTransport.cpp firmware/esp32/test/native/test_protocol_auth/test_protocol_auth.cpp firmware/esp32/test/native/test_ble_transport_dispatch/test_ble_transport_dispatch.cpp firmware/esp32/test/native/test_ble_transport_runtime/test_ble_transport_runtime.cpp
git commit -m "feat(firmware): ProtocolEngine with in-band auth handshake and session exclusivity"
```

---

## Task 5: ITransport interface + Bluedroid BleTransport (iso-functional)

**Goal:** Define `ITransport`, and rewrite `BleTransport` on Bluedroid (`BLEDevice`/`BLEServer`) with 2 characteristics (manifest read + data write/notify). The data characteristic carries auth + protocol. BLE behaves the same from the client's perspective except auth is now in-band.

**Files:**
- Create: `firmware/esp32/lib/esp-control-ble/src/transport/ITransport.h`
- Modify: `firmware/esp32/lib/esp-control-ble/src/transport/ble/BleTransport.h`
- Modify: `firmware/esp32/lib/esp-control-ble/src/transport/ble/BleTransport.cpp`
- Modify: `firmware/esp32/platformio.ini`
- Modify: `firmware/esp32/lib/esp-control-ble/library.json`

> NOTE: `BleTransport` runs only on hardware (`#else`). The `UNIT_TEST` stub for it is updated to satisfy any compile references but is not exercised. This task is verified by an `esp32dev` build + manual device test, not native unit tests.

- [ ] **Step 1: Define ITransport**

`firmware/esp32/lib/esp-control-ble/src/transport/ITransport.h`:

```cpp
#pragma once
#include <stddef.h>
#include <stdint.h>

namespace ecb {

// Minimal contract a transport implements. The transport owns the link to the
// remote client and forwards received bytes to the ProtocolEngine; the engine
// sends bytes back via the FrameSender the transport provides.
class ITransport {
public:
  virtual ~ITransport() = default;
  virtual void begin(const char* deviceName) = 0;
  // Push outbound, already-framed bytes to the connected client.
  virtual void send(const uint8_t* data, size_t len) = 0;
};

} // namespace ecb
```

- [ ] **Step 2: Remove NimBLE from build config**

Modify `firmware/esp32/platformio.ini`:

In `[env:base]`, remove the NimBLE line from `lib_deps` (keep ETL and Nanopb):

```ini
lib_deps =
    etlcpp/Embedded Template Library @ ^20.40.0
    nanopb/Nanopb@^0.4.9
```

Remove the four NimBLE build flags (`-DCONFIG_BT_NIMBLE_*`). Add a partition table line in `[env:base]`:

```ini
board_build.partitions = huge_app.csv
```

Modify `firmware/esp32/lib/esp-control-ble/library.json` — remove the NimBLE dependency entry, leaving Nanopb and ETL.

- [ ] **Step 3: Rewrite the BleTransport header**

Replace `firmware/esp32/lib/esp-control-ble/src/transport/ble/BleTransport.h`:

```cpp
#pragma once
#include "../../protocol/core/Protocol.h"
#include "../ITransport.h"
#include "DataBleTransport.h"   // ProtocolEngine

#ifndef UNIT_TEST
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#endif

namespace ecb { class ProtocolEngine; }

class BleTransport : public ecb::ITransport {
public:
  void attach(ecb::ProtocolEngine* engine, const uint8_t* manifest, uint16_t manifestLen);
  void begin(const char* deviceName) override;
  void send(const uint8_t* data, size_t len) override;

  // Called by BLE callbacks.
  void onData(const uint8_t* data, size_t len);
  void onConnect();
  void onDisconnect();

private:
  ecb::ProtocolEngine* _engine = nullptr;
  const uint8_t* _manifest = nullptr;
  uint16_t _manifestLen = 0;

#ifndef UNIT_TEST
  BLECharacteristic* _dataChar = nullptr;
#endif
};
```

- [ ] **Step 4: Rewrite the BleTransport implementation (Bluedroid)**

Replace `firmware/esp32/lib/esp-control-ble/src/transport/ble/BleTransport.cpp`:

```cpp
#include "BleTransport.h"
#include "DataBleTransport.h"

#ifdef UNIT_TEST

// Not exercised in native tests; minimal no-op stubs.
void BleTransport::attach(ecb::ProtocolEngine* engine, const uint8_t* manifest, uint16_t manifestLen) {
  _engine = engine; _manifest = manifest; _manifestLen = manifestLen;
}
void BleTransport::begin(const char*) {}
void BleTransport::send(const uint8_t*, size_t) {}
void BleTransport::onData(const uint8_t* data, size_t len) { if (_engine) _engine->handleFrame((ecb::FrameKind)data[0], data + 4, len > 4 ? len - 4 : 0); }
void BleTransport::onConnect() {}
void BleTransport::onDisconnect() {}

#else

#include <Arduino.h>
#include "../../support/EcbLogging.h"

static BleTransport* s_self = nullptr;  // single-session: one transport instance

class EcbDataCb : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic* c) override {
    std::string v = c->getValue();
    if (s_self) s_self->onData((const uint8_t*)v.data(), v.size());
  }
};

class EcbServerCb : public BLEServerCallbacks {
  void onConnect(BLEServer*) override { if (s_self) s_self->onConnect(); }
  void onDisconnect(BLEServer*) override {
    if (s_self) s_self->onDisconnect();
    BLEDevice::startAdvertising();
  }
};

void BleTransport::attach(ecb::ProtocolEngine* engine, const uint8_t* manifest, uint16_t manifestLen) {
  _engine = engine; _manifest = manifest; _manifestLen = manifestLen;
}

void BleTransport::begin(const char* deviceName) {
  s_self = this;
  BLEDevice::init(deviceName);

  BLEServer* server = BLEDevice::createServer();
  server->setCallbacks(new EcbServerCb());

  BLEService* svc = server->createService(BLEUUID(ECB_DATA_SERVICE_UUID), 16, 0);

  // Manifest characteristic (read): inline manifest, used for discovery.
  BLECharacteristic* manifestChar = svc->createCharacteristic(
      BLEUUID(ECB_MANIFEST_CHAR_UUID), BLECharacteristic::PROPERTY_READ);
  if (_manifest && _manifestLen > 0 && _manifestLen <= 512) {
    manifestChar->setValue((uint8_t*)_manifest, _manifestLen);
  }

  // Data characteristic (write + notify): carries auth + protocol frames.
  _dataChar = svc->createCharacteristic(
      BLEUUID(ECB_DATA_DATA_CHAR_UUID),
      BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_NOTIFY);
  _dataChar->setCallbacks(new EcbDataCb());

  svc->start();

  BLEAdvertising* adv = BLEDevice::getAdvertising();
  adv->addServiceUUID(ECB_DATA_SERVICE_UUID);
  adv->setScanResponse(true);
  adv->start();

  ECB_LOGF("[ECB] BLE(Bluedroid) started: %s\n", deviceName);
}

void BleTransport::send(const uint8_t* data, size_t len) {
  if (_dataChar) {
    _dataChar->setValue((uint8_t*)data, len);
    _dataChar->notify();
  }
}

void BleTransport::onData(const uint8_t* data, size_t len) {
  if (!_engine || len < 4) return;
  if (!_engine->beginSession(ecb::ProtocolEngine::Session::Ble)) return;  // another session active
  const ecb::FrameKind kind = (ecb::FrameKind)data[0];
  const uint16_t bodyLen = (uint16_t)((data[2] << 8) | data[3]);
  if ((size_t)(4 + bodyLen) > len) return;
  _engine->handleFrame(kind, data + 4, bodyLen);
}

void BleTransport::onConnect() {
  if (_engine) _engine->beginSession(ecb::ProtocolEngine::Session::Ble);
}

void BleTransport::onDisconnect() {
  if (_engine) _engine->endSession(ecb::ProtocolEngine::Session::Ble);
}

#endif
```

- [ ] **Step 5: Build for hardware**

Run: `& "$env:USERPROFILE\.platformio\penv\Scripts\platformio.exe" run -e esp32dev`
Expected: SUCCESS (after `EspControlBle` wiring in Task 6 if there are link errors referencing CommandRegistry; if the build fails only because `EspControlBle.cpp` still references NimBLE-era APIs, proceed to Task 6 which rewires it, then rebuild). Record RAM/Flash.

- [ ] **Step 6: Commit**

```bash
git add firmware/esp32/lib/esp-control-ble/src/transport/ITransport.h firmware/esp32/lib/esp-control-ble/src/transport/ble/BleTransport.h firmware/esp32/lib/esp-control-ble/src/transport/ble/BleTransport.cpp firmware/esp32/platformio.ini firmware/esp32/lib/esp-control-ble/library.json
git commit -m "feat(firmware): rewrite BleTransport on Bluedroid with 2 characteristics"
```

---

## Task 6: Remove legacy v4 + rewire EspControlBle

**Goal:** Delete the unused legacy v4 command path (`CommandRegistry`) and wire `EspControlBle` to construct the `ProtocolEngine` with the `AuthHandler` and attach `BleTransport`.

**Files:**
- Delete: `firmware/esp32/lib/esp-control-ble/src/protocol/commands/CommandRegistry.h`
- Delete: `firmware/esp32/lib/esp-control-ble/src/protocol/commands/CommandRegistry.cpp`
- Modify: `firmware/esp32/lib/esp-control-ble/src/EspControlBle.h`
- Modify: `firmware/esp32/lib/esp-control-ble/src/EspControlBle.cpp`
- Delete: `firmware/esp32/test/native/test_command_registry/` (if present)

- [ ] **Step 1: Remove the legacy command registry test (if present)**

Run: `Remove-Item -Recurse -Force firmware/esp32/test/native/test_command_registry -ErrorAction SilentlyContinue`

- [ ] **Step 2: Delete CommandRegistry source**

Run:
```powershell
Remove-Item firmware/esp32/lib/esp-control-ble/src/protocol/commands/CommandRegistry.h
Remove-Item firmware/esp32/lib/esp-control-ble/src/protocol/commands/CommandRegistry.cpp
```

- [ ] **Step 3: Rewrite EspControlBle.h**

Replace `firmware/esp32/lib/esp-control-ble/src/EspControlBle.h`:

```cpp
#pragma once

#include "protocol/actions/ActionRegistry.h"
#include "protocol/resources/ResourceTable.h"
#include "protocol/subscriptions/SubscriptionState.h"
#include "protocol/auth/AuthHandler.h"
#include "protocol/manifest/ManifestStore.h"
#include "transport/ble/DataBleTransport.h"   // ProtocolEngine
#include "transport/ble/BleTransport.h"
#include "transport/spp/SppTransport.h"

class EspControl {
public:
  EspControl(const char* deviceName, const char* pin);

  void registerAction(uint32_t actionId, ecb::ActionHandler handler);
  ecb::ResourceTable& resources() { return _resources; }
  void publishDelta(uint32_t resourceId);
  void tick();

  void begin(const uint8_t* manifestData, uint16_t manifestLen);

private:
  static void sendBle(void* context, const uint8_t* data, size_t len);
  static void sendSpp(void* context, const uint8_t* data, size_t len);

  const char*             _deviceName;
  const char*             _pin;
  AuthHandler             _auth;

  ecb::ActionRegistry     _actionRegistry;
  ecb::ResourceTable      _resources;
  ecb::SubscriptionState  _subs;
  ecb::ProtocolEngine*    _engine = nullptr;
  BleTransport            _bleTransport;
  ecb::SppTransport       _sppTransport;
};
```

- [ ] **Step 4: Rewrite EspControlBle.cpp**

Replace `firmware/esp32/lib/esp-control-ble/src/EspControlBle.cpp`:

```cpp
#include "EspControlBle.h"
#include "protocol/manifest/ManifestStore.h"
#include "support/EcbLogging.h"

EspControl::EspControl(const char* deviceName, const char* pin)
  : _deviceName(deviceName), _pin(pin) {}

void EspControl::sendBle(void* context, const uint8_t* data, size_t len) {
  static_cast<EspControl*>(context)->_bleTransport.send(data, len);
}

void EspControl::sendSpp(void* context, const uint8_t* data, size_t len) {
  static_cast<EspControl*>(context)->_sppTransport.send(data, len);
}

void EspControl::registerAction(uint32_t actionId, ecb::ActionHandler h) {
  _actionRegistry.registerAction(actionId, h);
}

void EspControl::publishDelta(uint32_t resourceId) {
  if (_engine) _engine->sendDelta(resourceId);
}

void EspControl::tick() {
  if (_engine) _engine->tick();
}

void EspControl::begin(const uint8_t* manifestData, uint16_t manifestLen) {
  _auth.setPin(_pin);

  static ecb::ManifestStore store(manifestData, manifestLen);

  // The engine sends via whichever transport is active. Both transports route
  // received frames into the same engine; session exclusivity guarantees only
  // one is active at a time, so a single FrameSender that targets the active
  // transport is provided per transport callback.
  _engine = new ecb::ProtocolEngine(
      store, _resources, _subs, _actionRegistry, _auth,
      ecb::FrameSender{this, &EspControl::sendBle});

  _bleTransport.attach(_engine, manifestData, manifestLen);
  _bleTransport.begin(_deviceName);

  _sppTransport.attach(_engine);
  _sppTransport.begin(_deviceName);

  ECB_LOGF("[ECB] started (BLE+SPP) %s\n", _deviceName);
}
```

> NOTE: the engine's `FrameSender` is set to `sendBle` here. Because only one session is active at a time, replies during an SPP session must go out SPP. Task 7 resolves this by having the engine call back through the active transport; for now, SppTransport's `attach` installs itself as the active sender when an SPP session begins (see Task 7 Step 4). This NOTE is resolved within Task 7 — do not ship Task 6 alone to a device expecting SPP replies.

- [ ] **Step 5: Run native tests**

Run: `& "$env:USERPROFILE\.platformio\penv\Scripts\platformio.exe" test -e native`
Expected: PASS — no suite references `CommandRegistry`. If `test_footprint`/`test_audit_sizeof` reference removed symbols, update them to drop those references.

- [ ] **Step 6: Commit**

```bash
git add -A firmware/esp32/lib/esp-control-ble/src/EspControlBle.h firmware/esp32/lib/esp-control-ble/src/EspControlBle.cpp firmware/esp32/lib/esp-control-ble/src/protocol/commands firmware/esp32/test/native
git commit -m "refactor(firmware): remove legacy v4 CommandRegistry, wire ProtocolEngine + transports"
```

---

## Task 7: SppTransport + active-sender routing

**Goal:** Implement `SppTransport` on `BluetoothSerial`, feeding bytes through a `FrameAccumulator` into the engine, and make the engine send replies through whichever transport owns the active session.

**Files:**
- Create: `firmware/esp32/lib/esp-control-ble/src/transport/spp/SppTransport.h`
- Create: `firmware/esp32/lib/esp-control-ble/src/transport/spp/SppTransport.cpp`
- Modify: `firmware/esp32/lib/esp-control-ble/src/transport/ble/DataBleTransport.h` (add `setSender`)
- Modify: `firmware/esp32/lib/esp-control-ble/src/transport/ble/DataBleTransport.cpp` (implement `setSender`)
- Modify: `firmware/esp32/lib/esp-control-ble/src/transport/ble/BleTransport.cpp` (`onConnect`/`onData` install BLE sender)

- [ ] **Step 1: Add `setSender` to the engine**

In `DataBleTransport.h` (`ProtocolEngine`), add a public method:

```cpp
  // Route subsequent outbound frames to this sender (the active transport).
  void setSender(FrameSender sender);
```

In `DataBleTransport.cpp`, implement it:

```cpp
void ProtocolEngine::setSender(FrameSender sender) {
  xSemaphoreTake(_mutex, portMAX_DELAY);
  _sender = sender;
  xSemaphoreGive(_mutex);
}
```

- [ ] **Step 2: Write the SppTransport header**

`firmware/esp32/lib/esp-control-ble/src/transport/spp/SppTransport.h`:

```cpp
#pragma once
#include <stddef.h>
#include <stdint.h>
#include "../ITransport.h"
#include "../frame/FrameAccumulator.h"

#ifndef UNIT_TEST
#include <BluetoothSerial.h>
#endif

namespace ecb {

class ProtocolEngine;

class SppTransport : public ITransport {
public:
  SppTransport();
  void attach(ProtocolEngine* engine);
  void begin(const char* deviceName) override;
  void send(const uint8_t* data, size_t len) override;

  // Pump the SPP RX stream into the accumulator; call from tick().
  void poll();

private:
  static void onFrame(FrameKind kind, uint8_t flags, const uint8_t* body, size_t len, void* ctx);
  ProtocolEngine*  _engine = nullptr;
  FrameAccumulator _acc;
  bool             _connected = false;

#ifndef UNIT_TEST
  BluetoothSerial  _bt;
#endif
};

} // namespace ecb
```

- [ ] **Step 3: Write the SppTransport implementation**

`firmware/esp32/lib/esp-control-ble/src/transport/spp/SppTransport.cpp`:

```cpp
#include "SppTransport.h"
#include "../ble/DataBleTransport.h"   // ProtocolEngine
#include "../frame/DataFrameCodec.h"

namespace ecb {

SppTransport::SppTransport() : _acc(&SppTransport::onFrame, this) {}

void SppTransport::attach(ProtocolEngine* engine) { _engine = engine; }

void SppTransport::onFrame(FrameKind kind, uint8_t flags, const uint8_t* body, size_t len, void* ctx) {
  SppTransport* self = static_cast<SppTransport*>(ctx);
  if (!self->_engine) return;
  if (!self->_engine->beginSession(ProtocolEngine::Session::Spp)) return;  // BLE active
  self->_engine->setSender(FrameSender{self, [](void* c, const uint8_t* d, size_t n) {
    static_cast<SppTransport*>(c)->send(d, n);
  }});
  self->_engine->handleFrame(kind, body, len);
}

#ifdef UNIT_TEST

void SppTransport::begin(const char*) {}
void SppTransport::send(const uint8_t*, size_t) {}
void SppTransport::poll() {}

#else

#include <Arduino.h>
#include "../../support/EcbLogging.h"

void SppTransport::begin(const char* deviceName) {
  _bt.begin(deviceName);
  ECB_LOGF("[ECB] SPP started: %s\n", deviceName);
}

void SppTransport::send(const uint8_t* data, size_t len) {
  if (_connected) _bt.write(data, len);
}

void SppTransport::poll() {
  if (!_bt.hasClient()) {
    if (_connected) {
      _connected = false;
      _acc.reset();
      if (_engine) _engine->endSession(ProtocolEngine::Session::Spp);
    }
    return;
  }
  _connected = true;
  uint8_t buf[64];
  while (_bt.available() > 0) {
    int n = _bt.readBytes(buf, sizeof(buf));
    if (n > 0) _acc.feed(buf, (size_t)n);
  }
}

#endif

} // namespace ecb
```

- [ ] **Step 4: Install the BLE sender when a BLE session begins**

In `BleTransport.cpp` (`#else` branch), update `onConnect` and `onData` to set the engine's sender to BLE on session start:

```cpp
void BleTransport::onConnect() {
  if (_engine && _engine->beginSession(ecb::ProtocolEngine::Session::Ble)) {
    _engine->setSender(ecb::FrameSender{this, [](void* c, const uint8_t* d, size_t n) {
      static_cast<BleTransport*>(c)->send(d, n);
    }});
  }
}
```

And in `onData`, after a successful `beginSession`, also `setSender` the same way (so a client that writes before the connect callback still routes correctly):

```cpp
void BleTransport::onData(const uint8_t* data, size_t len) {
  if (!_engine || len < 4) return;
  if (!_engine->beginSession(ecb::ProtocolEngine::Session::Ble)) return;
  _engine->setSender(ecb::FrameSender{this, [](void* c, const uint8_t* d, size_t n) {
    static_cast<BleTransport*>(c)->send(d, n);
  }});
  const ecb::FrameKind kind = (ecb::FrameKind)data[0];
  const uint16_t bodyLen = (uint16_t)((data[2] << 8) | data[3]);
  if ((size_t)(4 + bodyLen) > len) return;
  _engine->handleFrame(kind, data + 4, bodyLen);
}
```

- [ ] **Step 5: Poll SPP from the engine tick path**

In `EspControlBle.cpp`, update `tick()` to also poll SPP:

```cpp
void EspControl::tick() {
  _sppTransport.poll();
  if (_engine) _engine->tick();
}
```

- [ ] **Step 6: Run native tests**

Run: `& "$env:USERPROFILE\.platformio\penv\Scripts\platformio.exe" test -e native`
Expected: PASS — all suites green (SppTransport compiles under UNIT_TEST as no-ops; FrameAccumulator + engine tests unaffected).

- [ ] **Step 7: Build for hardware**

Run: `& "$env:USERPROFILE\.platformio\penv\Scripts\platformio.exe" run -e esp32dev`
Expected: SUCCESS. Record RAM/Flash.

- [ ] **Step 8: Commit**

```bash
git add firmware/esp32/lib/esp-control-ble/src/transport/spp firmware/esp32/lib/esp-control-ble/src/transport/ble/DataBleTransport.h firmware/esp32/lib/esp-control-ble/src/transport/ble/DataBleTransport.cpp firmware/esp32/lib/esp-control-ble/src/transport/ble/BleTransport.cpp firmware/esp32/lib/esp-control-ble/src/EspControlBle.cpp
git commit -m "feat(firmware): add SppTransport and route engine replies to the active session"
```

---

## Task 8: Final hardware build + budget verification

**Goal:** Confirm the full firmware builds, fits, and that the transitional `DataBleTransport` alias is removed.

**Files:**
- Modify: `firmware/esp32/lib/esp-control-ble/src/transport/ble/DataBleTransport.h` (remove alias)
- Grep: all callers of `DataBleTransport`

- [ ] **Step 1: Remove the transitional alias**

In `DataBleTransport.h`, delete the line `using DataBleTransport = ProtocolEngine;`.

- [ ] **Step 2: Find any remaining references to the old name**

Run: `Select-String -Path firmware/esp32 -Pattern "DataBleTransport" -Recurse` (via Grep tool)
Expected: only the file name itself and includes; no type usages. Rename any remaining type usages to `ProtocolEngine`.

- [ ] **Step 3: Run native tests**

Run: `& "$env:USERPROFILE\.platformio\penv\Scripts\platformio.exe" test -e native`
Expected: PASS — all suites green.

- [ ] **Step 4: Build firmware and check size**

Run: `& "$env:USERPROFILE\.platformio\penv\Scripts\platformio.exe" run -e esp32dev`
Expected: SUCCESS. RAM and Flash within the partition; compare against the Task 1 spike numbers and the NimBLE baseline (~42 KB RAM). Record final numbers.

- [ ] **Step 5: Manual device test (checklist)**

Flash to a device. Verify:
- App mobile (after sub-project 2) OR a BLE explorer: connect, the data characteristic exists, AuthRequest→Challenge→Response→Result works, an InvokeAction round-trips.
- SPP: from an Android "Serial Bluetooth Terminal", pair + connect, send a framed AuthRequest, receive AuthChallenge; confirm the session is exclusive (a second BLE connect while SPP is active is refused).

- [ ] **Step 6: Commit**

```bash
git add firmware/esp32/lib/esp-control-ble/src/transport/ble/DataBleTransport.h
git commit -m "refactor(firmware): drop transitional DataBleTransport alias; final dual-mode build"
```

---

## Wire protocol frozen for sub-projects 2 & 3

- Frame: `[kind:1][flags:1][length:2 BE][body:length]`.
- Auth frames: `AuthRequest 0x40` (no body), `AuthChallenge 0x41` (body = 16-byte nonce), `AuthResponse 0x42` (body = 16-byte hash), `AuthResult 0x43` (body[0] = 0x01 OK / 0x00 FAIL).
- `hash = SHA-256(pin || nonce)[:16]`.
- Auth handshake must complete before any other frame is honored.
- One session at a time (BLE or SPP); the firmware refuses a second.
- SPP clients must frame using the header-length scheme; the firmware resynchronizes on bad bytes.
