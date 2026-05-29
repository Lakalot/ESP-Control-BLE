# SPP transport for the Android app Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Bluetooth Classic (SPP/RFCOMM) transport to the Expo app so an Android 8.1 tablet whose BLE hardware is broken can discover, connect to, and control an ESP32 — reusing the entire existing connection/auth/UI engine.

**Architecture:** A local Expo native module (`EcbSpp`, Kotlin, `BluetoothSocket`) does in-app discovery + direct RFCOMM connect (pairs on the fly). A JS `SppDevice` implements the same `FixtureBleDevice` interface as `RealBleDevice`, so `connectionMachine`/`BleRuntime`/auth/framing/reconnect/UI are reused unchanged. The app auto-detects BLE vs SPP and falls back to SPP when BLE is unsupported.

**Tech Stack:** Expo SDK 54 / RN 0.81 (prebuild workflow, expo-dev-client), Expo Modules API (Kotlin), react-native-ble-plx, XState v5, Jest. Android API 27 target tablet.

**Reference spec:** `docs/superpowers/specs/2026-05-29-spp-client-android-design.md`

**Mobile commands (from `apps/mobile`):** test `npm test`; typecheck `npx tsc --noEmit`; dev-client build `npx expo run:android` (device/emulator — used only to verify the native module compiles; real RFCOMM is the user's tablet test).

## CRITICAL GIT INSTRUCTION (applies to every task)
`apps/mobile/` is its own nested git repo AND its files are also tracked by the ROOT repo at D:\DEV\Amazing\ESP-Control-BLE. ALL commits go to the ROOT repo. Run EVERY `git` command from `D:/DEV/Amazing/ESP-Control-BLE` (`cd D:/DEV/Amazing/ESP-Control-BLE && git ...`). NEVER `cd apps/mobile` before git. Use `npm`/`tsc`/`expo` from `apps/mobile` only. Stage explicit `apps/mobile/...` paths. Match the Co-Authored-By trailer from `git log -3` at root; never `--no-verify`.

---

## File Structure

**New (native module):**
- `apps/mobile/modules/ecb-spp/` — local Expo module (created via `npx create-expo-module@latest --local ecb-spp`):
  - `android/src/main/java/expo/modules/ecbspp/EcbSppModule.kt` — the Kotlin module.
  - `src/EcbSppModule.ts` — JS bindings (typed `requireNativeModule`).
  - `index.ts` — public exports + a typed facade.
  - (the generator also creates iOS stubs / podspec — leave them; iOS is out of scope but the stubs must not break the JS facade. The facade throws a clear error on non-Android.)

**New (JS):**
- `apps/mobile/src/manifest/runtime/SppDevice.ts` — `SppDevice` (implements `FixtureBleDevice`) + `createSppDevice(address)`.
- `apps/mobile/src/transport/selectTransport.ts` — auto-detection (BLE vs SPP).
- `apps/mobile/__mocks__/ecb-spp.ts` — Jest mock of the native module.
- Tests: `apps/mobile/__tests__/manifest/SppDevice.test.ts`, `apps/mobile/__tests__/transport/selectTransport.test.ts`.

**Modified:**
- `apps/mobile/src/types/ble.types.ts` — add `'unsupported'` to `BleStateType`.
- `apps/mobile/src/transport/BleManager.ts` — map `State.Unsupported` → `'unsupported'` (not `'off'`).
- `apps/mobile/src/settings/manifestRuntimeFlag.ts` — `'ble' | 'spp' | 'fixture'` (rename `'device'`→`'ble'`, add `'spp'`).
- `apps/mobile/app/index.tsx` — in SPP mode, list bonded + discovered devices via `EcbSpp`.
- `apps/mobile/app/control/[deviceId].tsx` — pick `createSppDevice` vs `createRealBleDevice` per transport.
- `apps/mobile/__tests__/settings/manifestRuntimeFlag.test.ts` — update for the new values.

---

## Task 1: Scaffold the EcbSpp native module (compiles, no logic yet)

**Files:**
- Create: `apps/mobile/modules/ecb-spp/**` (generator output)

- [ ] **Step 1: Generate the local module**

Run from `apps/mobile`:
```
npx create-expo-module@latest --local ecb-spp
```
Answer the prompts: package name `expo.modules.ecbspp`, JS name `EcbSpp`. This creates `apps/mobile/modules/ecb-spp/` with Android (Kotlin), iOS (Swift), and JS scaffolding. If the CLI is unavailable offline, create the structure manually following the Expo Modules API layout (a `Module` subclass in `android/src/main/java/expo/modules/ecbspp/EcbSppModule.kt`, an `expo-module.config.json` declaring the android module class, and `index.ts`/`src/EcbSppModule.ts` JS bindings). Report which path you took.

- [ ] **Step 2: Reduce the generated module to a minimal compiling stub**

Replace `apps/mobile/modules/ecb-spp/android/src/main/java/expo/modules/ecbspp/EcbSppModule.kt` with:

```kotlin
package expo.modules.ecbspp

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class EcbSppModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("EcbSpp")

    AsyncFunction("isAvailable") {
      false
    }
  }
}
```

Replace `apps/mobile/modules/ecb-spp/index.ts` with a typed facade:

```ts
import { requireNativeModule } from 'expo-modules-core';
import { Platform } from 'react-native';

export interface SppDeviceInfo { name: string | null; address: string; bonded: boolean; }

interface EcbSppNative {
  isAvailable(): Promise<boolean>;
  listBondedDevices(): Promise<SppDeviceInfo[]>;
  startDiscovery(): Promise<void>;
  stopDiscovery(): Promise<void>;
  connect(address: string): Promise<void>;
  write(base64: string): Promise<void>;
  disconnect(): Promise<void>;
  addListener(event: string, listener: (payload: any) => void): { remove(): void };
}

const native: EcbSppNative | null =
  Platform.OS === 'android' ? requireNativeModule('EcbSpp') : null;

function require_(): EcbSppNative {
  if (!native) throw new Error('EcbSpp is only available on Android');
  return native;
}

export const EcbSpp = {
  isAvailable: () => (native ? native.isAvailable() : Promise.resolve(false)),
  listBondedDevices: () => require_().listBondedDevices(),
  startDiscovery: () => require_().startDiscovery(),
  stopDiscovery: () => require_().stopDiscovery(),
  connect: (address: string) => require_().connect(address),
  write: (base64: string) => require_().write(base64),
  disconnect: () => require_().disconnect(),
  onData: (cb: (chunkBase64: string) => void) =>
    require_().addListener('onData', (p) => cb(p.data)),
  onDisconnected: (cb: () => void) =>
    require_().addListener('onDisconnected', () => cb()),
  onDeviceFound: (cb: (d: SppDeviceInfo) => void) =>
    require_().addListener('onDeviceFound', (p) => cb(p)),
};
```

NOTE: the `index.ts` declares the FULL API surface now (used by later tasks) even though the Kotlin side only implements `isAvailable` in this task. The methods that aren't implemented natively yet would reject at runtime, but nothing calls them until Task 4+. This lets the JS facade typecheck immediately.

- [ ] **Step 3: Build the dev client to confirm the module compiles**

Run from `apps/mobile`: `npx expo run:android` (needs an emulator or device; if none is available in this environment, instead run `cd android && ./gradlew :app:compileDebugKotlin` — or report that native compilation can't be verified here and rely on the user's tablet build). Expected: build succeeds; `EcbSpp` native module is registered.

NOTE: if no Android build environment is available to the agent, this step is the one thing that can't be verified locally. Report that clearly; the JS/TS in later tasks is still fully Jest-testable, and the user builds on the tablet.

- [ ] **Step 4: Typecheck**

Run from `apps/mobile`: `npx tsc --noEmit`. Expected: only the 2 known pre-existing errors (`__tests__/manifest/NodeRenderer.test.tsx` appShell; `src/manifest/render/primitives/BottomNavBar.tsx` Feather). The new `modules/ecb-spp/index.ts` must be clean.

- [ ] **Step 5: Commit**

```
cd D:/DEV/Amazing/ESP-Control-BLE && git add apps/mobile/modules/ecb-spp && git commit -m "feat(mobile): scaffold EcbSpp local native module"
```

---

## Task 2: Implement the EcbSpp Kotlin module (discovery, connect, IO)

**Files:**
- Modify: `apps/mobile/modules/ecb-spp/android/src/main/java/expo/modules/ecbspp/EcbSppModule.kt`

This task is native-only (no Jest). Verified by dev-client/gradle compile + the user's tablet test.

- [ ] **Step 1: Write the full Kotlin module**

Replace `EcbSppModule.kt` with:

```kotlin
package expo.modules.ecbspp

import android.Manifest
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothSocket
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.util.Base64
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.IOException
import java.io.InputStream
import java.io.OutputStream
import java.util.UUID

private val SPP_UUID: UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB")

class EcbSppModule : Module() {
  private val adapter: BluetoothAdapter? get() = BluetoothAdapter.getDefaultAdapter()
  private val context: Context get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  private var socket: BluetoothSocket? = null
  private var output: OutputStream? = null
  private var readThread: Thread? = null
  @Volatile private var intentional = false

  private var discoveryReceiver: BroadcastReceiver? = null

  override fun definition() = ModuleDefinition {
    Name("EcbSpp")

    Events("onData", "onDisconnected", "onDeviceFound")

    AsyncFunction("isAvailable") {
      val a = adapter
      a != null && a.isEnabled
    }

    AsyncFunction("listBondedDevices") {
      val a = adapter ?: return@AsyncFunction emptyList<Map<String, Any?>>()
      a.bondedDevices.map { d ->
        mapOf("name" to d.name, "address" to d.address, "bonded" to true)
      }
    }

    AsyncFunction("startDiscovery") {
      val a = adapter ?: throw Exceptions.IllegalArgument("No Bluetooth adapter")
      stopDiscoveryInternal()
      val receiver = object : BroadcastReceiver() {
        override fun onReceive(ctx: Context, intent: Intent) {
          if (intent.action == BluetoothDevice.ACTION_FOUND) {
            val device: BluetoothDevice? =
              intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE)
            if (device != null) {
              sendEvent(
                "onDeviceFound",
                mapOf(
                  "name" to device.name,
                  "address" to device.address,
                  "bonded" to (device.bondState == BluetoothDevice.BOND_BONDED),
                ),
              )
            }
          }
        }
      }
      discoveryReceiver = receiver
      context.registerReceiver(receiver, IntentFilter(BluetoothDevice.ACTION_FOUND))
      a.startDiscovery()
    }

    AsyncFunction("stopDiscovery") {
      stopDiscoveryInternal()
    }

    AsyncFunction("connect") { address: String ->
      val a = adapter ?: throw Exceptions.IllegalArgument("No Bluetooth adapter")
      a.cancelDiscovery() // discovery slows/breaks RFCOMM
      stopDiscoveryInternal()
      val device = a.getRemoteDevice(address)
      // createRfcommSocketToServiceRecord pairs on the fly if needed (Android may
      // surface its native pairing dialog; we accept it as-is).
      val sock = device.createRfcommSocketToServiceRecord(SPP_UUID)
      try {
        intentional = false
        sock.connect()
      } catch (e: IOException) {
        try { sock.close() } catch (_: IOException) {}
        throw Exceptions.IllegalArgument("SPP connect failed: ${e.message}")
      }
      socket = sock
      output = sock.outputStream
      startReadLoop(sock.inputStream)
    }

    AsyncFunction("write") { base64: String ->
      val out = output ?: throw Exceptions.IllegalArgument("SPP not connected")
      val bytes = Base64.decode(base64, Base64.NO_WRAP)
      out.write(bytes)
      out.flush()
    }

    AsyncFunction("disconnect") {
      intentional = true
      closeSocket()
    }

    OnDestroy {
      intentional = true
      stopDiscoveryInternal()
      closeSocket()
    }
  }

  private fun startReadLoop(input: InputStream) {
    val thread = Thread {
      val buf = ByteArray(1024)
      try {
        while (!Thread.currentThread().isInterrupted) {
          val n = input.read(buf)
          if (n < 0) break // end of stream
          if (n > 0) {
            val chunk = Base64.encodeToString(buf, 0, n, Base64.NO_WRAP)
            sendEvent("onData", mapOf("data" to chunk))
          }
        }
      } catch (_: IOException) {
        // socket closed / link lost
      } finally {
        if (!intentional) {
          sendEvent("onDisconnected", mapOf<String, Any?>())
        }
      }
    }
    thread.isDaemon = true
    readThread = thread
    thread.start()
  }

  private fun closeSocket() {
    readThread?.interrupt()
    readThread = null
    try { output?.close() } catch (_: IOException) {}
    try { socket?.close() } catch (_: IOException) {}
    output = null
    socket = null
  }

  private fun stopDiscoveryInternal() {
    adapter?.cancelDiscovery()
    discoveryReceiver?.let {
      try { context.unregisterReceiver(it) } catch (_: IllegalArgumentException) {}
    }
    discoveryReceiver = null
  }
}
```

NOTE on permissions: discovery requires `ACCESS_FINE_LOCATION` at runtime on API 27 (requested JS-side in Task 5 before `startDiscovery`). The manifest already declares `BLUETOOTH`/`BLUETOOTH_ADMIN`. Add `<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>` to `apps/mobile/android/app/src/main/AndroidManifest.xml` if not present (check first; the BLE scan path may already have added it). If it's missing, add it in this task and mention it.

- [ ] **Step 2: Build to confirm compilation**

Run from `apps/mobile`: `cd android && ./gradlew :app:compileDebugKotlin` (or `npx expo run:android` if an emulator is available). Expected: Kotlin compiles. If no Android toolchain is available to the agent, report it; the user will build on the tablet.

- [ ] **Step 3: Commit**

```
cd D:/DEV/Amazing/ESP-Control-BLE && git add apps/mobile/modules/ecb-spp apps/mobile/android/app/src/main/AndroidManifest.xml && git commit -m "feat(mobile): implement EcbSpp RFCOMM module (discovery, connect, IO)"
```

---

## Task 3: Jest mock of the native module

**Files:**
- Create: `apps/mobile/__mocks__/ecb-spp.ts`
- Modify: `apps/mobile/jest.config.js` (moduleNameMapper for the local module path)

- [ ] **Step 1: Inspect how the module is imported**

The JS facade lives at `apps/mobile/modules/ecb-spp/index.ts` and is imported as `import { EcbSpp } from '../../../modules/ecb-spp'` (or via a path alias if the project has one — check `tsconfig.json` `paths` and `jest.config.js` `moduleNameMapper`). Determine the exact import specifier `SppDevice.ts` will use, then map THAT specifier to the mock.

- [ ] **Step 2: Write a controllable mock**

Create `apps/mobile/__mocks__/ecb-spp.ts`:

```ts
import type { SppDeviceInfo } from '../modules/ecb-spp';

type Listener = (payload: any) => void;
const listeners: Record<string, Listener[]> = { onData: [], onDisconnected: [], onDeviceFound: [] };

function sub(event: string, cb: Listener) {
  listeners[event].push(cb);
  return { remove() { listeners[event] = listeners[event].filter((l) => l !== cb); } };
}

export const _state = {
  available: true,
  bonded: [] as SppDeviceInfo[],
  writes: [] as string[],
  connected: false,
};

export function _emitData(base64: string) { listeners.onData.forEach((l) => l({ data: base64 })); }
export function _emitDisconnected() { listeners.onDisconnected.forEach((l) => l({})); }
export function _emitDeviceFound(d: SppDeviceInfo) { listeners.onDeviceFound.forEach((l) => l(d)); }
export function _reset() {
  _state.available = true; _state.bonded = []; _state.writes = []; _state.connected = false;
  listeners.onData = []; listeners.onDisconnected = []; listeners.onDeviceFound = [];
}

export const EcbSpp = {
  isAvailable: async () => _state.available,
  listBondedDevices: async () => _state.bonded,
  startDiscovery: async () => {},
  stopDiscovery: async () => {},
  connect: async (_address: string) => { _state.connected = true; },
  write: async (base64: string) => { _state.writes.push(base64); },
  disconnect: async () => { _state.connected = false; },
  onData: (cb: (b: string) => void) => sub('onData', (p) => cb(p.data)),
  onDisconnected: (cb: () => void) => sub('onDisconnected', () => cb()),
  onDeviceFound: (cb: (d: SppDeviceInfo) => void) => sub('onDeviceFound', (p) => cb(p)),
};
```

- [ ] **Step 3: Map the import to the mock in jest config**

In `apps/mobile/jest.config.js`, add to `moduleNameMapper` (use the actual import specifier from Step 1 — example assumes a relative path resolved to the module root):

```js
moduleNameMapper: {
  // ...existing entries (e.g. expo-crypto)...
  '^.*/modules/ecb-spp$': '<rootDir>/__mocks__/ecb-spp.ts',
},
```

Confirm the regex matches the specifier `SppDevice.ts` uses. If the project imports it via an absolute alias, map that alias instead.

- [ ] **Step 4: Sanity-check the mock loads**

There's nothing to assert yet; Task 4's tests exercise it. Just run `npm test` to confirm the config change didn't break the suite. Expected: still green (66/66 or current total).

- [ ] **Step 5: Commit**

```
cd D:/DEV/Amazing/ESP-Control-BLE && git add apps/mobile/__mocks__/ecb-spp.ts apps/mobile/jest.config.js && git commit -m "test(mobile): add Jest mock for the EcbSpp native module"
```

---

## Task 4: SppDevice (implements FixtureBleDevice) + createSppDevice

**Files:**
- Create: `apps/mobile/src/manifest/runtime/SppDevice.ts`
- Test: `apps/mobile/__tests__/manifest/SppDevice.test.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/mobile/__tests__/manifest/SppDevice.test.ts`:

```ts
import { describe, expect, it, beforeEach } from '@jest/globals';
import { SppDevice, createSppDevice } from '../../src/manifest/runtime/SppDevice';
import { EcbSpp, _state, _emitData, _emitDisconnected, _reset } from '../../modules/ecb-spp';

// base64 helpers (Node)
const toB64 = (bytes: number[]) => Buffer.from(bytes).toString('base64');

describe('SppDevice', () => {
  beforeEach(() => _reset());

  it('write() base64-encodes the frame and forwards to the native module', async () => {
    const dev = new SppDevice();
    await dev.write(new Uint8Array([0x40, 0x00, 0x00, 0x00]));
    expect(_state.writes).toHaveLength(1);
    expect(_state.writes[0]).toBe(toB64([0x40, 0x00, 0x00, 0x00]));
  });

  it('forwards native onData chunks (base64-decoded) to onNotify listeners', () => {
    const dev = new SppDevice();
    const received: number[][] = [];
    dev.onNotify((chunk) => received.push(Array.from(chunk)));
    _emitData(toB64([0x41, 0x00, 0x00, 0x02, 0xAA, 0xBB]));
    expect(received).toHaveLength(1);
    expect(received[0]).toEqual([0x41, 0x00, 0x00, 0x02, 0xAA, 0xBB]);
  });

  it('forwards native onDisconnected to onDisconnected listeners', () => {
    const dev = new SppDevice();
    let dropped = false;
    dev.onDisconnected(() => { dropped = true; });
    _emitDisconnected();
    expect(dropped).toBe(true);
  });

  it('createSppDevice connects via the native module and returns a SppDevice', async () => {
    const dev = await createSppDevice('AA:BB:CC:DD:EE:FF');
    expect(_state.connected).toBe(true);
    expect(dev).toBeInstanceOf(SppDevice);
  });

  it('disconnect() forwards to the native module', async () => {
    const dev = await createSppDevice('AA:BB:CC:DD:EE:FF');
    await dev.disconnect();
    expect(_state.connected).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run from `apps/mobile`: `npm test -- SppDevice`
Expected: FAIL — module `SppDevice` not found.

- [ ] **Step 3: Write SppDevice**

Create `apps/mobile/src/manifest/runtime/SppDevice.ts`:

```ts
import type { FixtureBleDevice } from './BleRuntime.fixture';
import { EcbSpp } from '../../../modules/ecb-spp';

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToUint8Array(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/**
 * SPP transport device. Implements the same interface as RealBleDevice so the
 * whole BleRuntime/connectionMachine engine is reused. The native EcbSpp module
 * delivers arbitrary byte chunks; BleRuntime's BleFrameStream reassembles frames
 * by header length (same as the firmware FrameAccumulator).
 */
export class SppDevice implements FixtureBleDevice {
  readonly sentFrames: Uint8Array[] = []; // not used in production
  private notifyListeners: Array<(chunk: Uint8Array) => void> = [];
  private disconnectListeners: Array<() => void> = [];
  private dataSub: { remove(): void };
  private dropSub: { remove(): void };

  constructor() {
    this.dataSub = EcbSpp.onData((b64) => {
      const chunk = base64ToUint8Array(b64);
      for (const l of this.notifyListeners) l(chunk);
    });
    this.dropSub = EcbSpp.onDisconnected(() => {
      for (const l of [...this.disconnectListeners]) l();
    });
  }

  async write(frame: Uint8Array): Promise<void> {
    await EcbSpp.write(uint8ArrayToBase64(frame));
  }

  onNotify(cb: (chunk: Uint8Array) => void): () => void {
    this.notifyListeners.push(cb);
    return () => { this.notifyListeners = this.notifyListeners.filter((l) => l !== cb); };
  }

  onDisconnected(cb: () => void): () => void {
    this.disconnectListeners.push(cb);
    return () => { this.disconnectListeners = this.disconnectListeners.filter((l) => l !== cb); };
  }

  queueIncoming(_chunk: Uint8Array): void {} // not used in production

  async disconnect(): Promise<void> {
    this.dataSub.remove();
    this.dropSub.remove();
    this.notifyListeners = [];
    this.disconnectListeners = [];
    await EcbSpp.disconnect();
  }
}

/** Connect over SPP to the given MAC address and return a ready SppDevice. */
export async function createSppDevice(address: string): Promise<SppDevice> {
  await EcbSpp.connect(address);
  return new SppDevice();
}
```

NOTE on ordering: `createSppDevice` connects, THEN constructs the `SppDevice` (which subscribes to `onData`). On a real device, any bytes the firmware sends between `connect()` resolving and the constructor subscribing would be missed — but the firmware only sends after it receives an `AuthRequest`, which `BleRuntime.authenticate()` sends later, so nothing is in flight at construction. (Same guarantee as the BLE path.) If you want extra safety, subscribe before connect — but then chunks could arrive for a not-yet-wired runtime; the chosen order matches RealBleDevice and is correct given the protocol.

- [ ] **Step 4: Run the test to verify it passes**

Run from `apps/mobile`: `npm test -- SppDevice`
Expected: PASS (5 tests). NOTE: `btoa`/`atob` must exist in the Jest env — if not (Node without them), the test will error; add a tiny polyfill in the test setup OR use Buffer in SppDevice. Check whether the existing `RealBleDevice`/`BleConnection` used `btoa`/`atob` in code that ran under Jest — they did NOT (RealBleDevice isn't unit-tested). So `btoa`/`atob` MAY be undefined in Jest. If the test errors on `btoa`, add to `apps/mobile` jest setup (jest.config.js `setupFiles`) a polyfill: `global.btoa = (s) => Buffer.from(s, 'binary').toString('base64'); global.atob = (b) => Buffer.from(b, 'base64').toString('binary');` (create `apps/mobile/jest.setup.ts` if no setup file exists and reference it). Report if you added this.

- [ ] **Step 5: Run the full suite (no regressions)**

Run from `apps/mobile`: `npm test`. Expected: all green, no leaked-handle warning.

- [ ] **Step 6: Commit**

```
cd D:/DEV/Amazing/ESP-Control-BLE && git add apps/mobile/src/manifest/runtime/SppDevice.ts apps/mobile/__tests__/manifest/SppDevice.test.ts apps/mobile/jest.config.js apps/mobile/jest.setup.ts && git commit -m "feat(mobile): SppDevice transport over the EcbSpp native module"
```
(Only stage jest.setup.ts if you created it.)

---

## Task 5: Transport auto-detection + flag redefine (ble|spp|fixture)

**Files:**
- Modify: `apps/mobile/src/types/ble.types.ts`
- Modify: `apps/mobile/src/transport/BleManager.ts`
- Modify: `apps/mobile/src/settings/manifestRuntimeFlag.ts`
- Create: `apps/mobile/src/transport/selectTransport.ts`
- Modify: `apps/mobile/__tests__/settings/manifestRuntimeFlag.test.ts`
- Test: `apps/mobile/__tests__/transport/selectTransport.test.ts`

- [ ] **Step 1: Surface `'unsupported'` as a distinct BLE state**

In `apps/mobile/src/types/ble.types.ts`, change:
```ts
export type BleStateType = 'unknown' | 'on' | 'off' | 'unauthorized';
```
to:
```ts
export type BleStateType = 'unknown' | 'on' | 'off' | 'unauthorized' | 'unsupported';
```

In `apps/mobile/src/transport/BleManager.ts`, change the map entry `[State.Unsupported]: 'off'` to `[State.Unsupported]: 'unsupported'`. (Leave the rest of the map.)

Check the existing `app/index.tsx` `BLE_STATE_META` record (it maps state→label/color); add an `unsupported` entry there too so the UI doesn't fall through to `unknown`: `unsupported: { label: 'Bluetooth indisponible', color: palette.danger }` (it already has an `unsupported` key in that record per the earlier file — verify; if present, no change).

- [ ] **Step 2: Redefine the runtime flag — write the failing test first**

Replace `apps/mobile/__tests__/settings/manifestRuntimeFlag.test.ts` with:

```ts
import { describe, expect, it, beforeEach } from '@jest/globals';
import { getTransport, setTransport } from '../../src/settings/manifestRuntimeFlag';

describe('transport flag', () => {
  beforeEach(() => setTransport(null));

  it('defaults to ble', () => {
    expect(getTransport()).toBe('ble');
  });

  it('can switch to spp and fixture and back', () => {
    setTransport('spp');
    expect(getTransport()).toBe('spp');
    setTransport('fixture');
    expect(getTransport()).toBe('fixture');
    setTransport('ble');
    expect(getTransport()).toBe('ble');
  });

  it('falls back to ble for an invalid value', () => {
    setTransport('spp');
    setTransport(null);
    expect(getTransport()).toBe('ble');
  });
});
```

Run `npm test -- manifestRuntimeFlag` → FAIL (old API `getManifestRuntime`).

- [ ] **Step 3: Rewrite the flag module**

Replace `apps/mobile/src/settings/manifestRuntimeFlag.ts`:

```ts
/**
 * Active transport for the control screen:
 *  - 'ble'     : BleRuntime over BLE (RealBleDevice).
 *  - 'spp'     : BleRuntime over Bluetooth Classic SPP (SppDevice) — for devices
 *                whose BLE hardware is unavailable.
 *  - 'fixture' : bundled FixtureRuntime (no hardware) — debug mode.
 * In-memory only; default 'ble'. The startup auto-detection (selectTransport)
 * may set this to 'spp' when BLE is unsupported.
 */
export type Transport = 'ble' | 'spp' | 'fixture';

let inMemory: Transport = 'ble';

export function getTransport(): Transport { return inMemory; }

export function setTransport(value: Transport | null): void {
  inMemory = value === 'spp' || value === 'fixture' ? value : 'ble';
}
```

NOTE: this renames the exports (`getManifestRuntime`→`getTransport`, `setManifestRuntime`→`setTransport`, `ManifestRuntimeFlag`→`Transport`, values `device`→`ble`). Every importer must be updated — the only consumer is `app/control/[deviceId].tsx` (updated in Task 6) and the test (updated above). Grep `getManifestRuntime`/`setManifestRuntime`/`ManifestRuntimeFlag` across `apps/mobile` and fix all references (Task 6 handles the screen; if any other file references them, update here).

Run `npm test -- manifestRuntimeFlag` → PASS.

- [ ] **Step 4: Write the auto-detection — failing test first**

Create `apps/mobile/__tests__/transport/selectTransport.test.ts`:

```ts
import { describe, expect, it, beforeEach } from '@jest/globals';
import { selectInitialTransport } from '../../src/transport/selectTransport';
import { _state, _reset } from '../../modules/ecb-spp';

describe('selectInitialTransport', () => {
  beforeEach(() => _reset());

  it('returns ble when BLE is usable', async () => {
    expect(await selectInitialTransport('on')).toBe('ble');
    expect(await selectInitialTransport('off')).toBe('ble'); // off != unsupported; BLE exists
  });

  it('returns spp when BLE is unsupported and SPP is available', async () => {
    _state.available = true;
    expect(await selectInitialTransport('unsupported')).toBe('spp');
  });

  it('stays ble when BLE is unsupported but SPP is also unavailable', async () => {
    _state.available = false;
    expect(await selectInitialTransport('unsupported')).toBe('ble');
  });
});
```

Run `npm test -- selectTransport` → FAIL (module not found).

- [ ] **Step 5: Implement selectTransport**

Create `apps/mobile/src/transport/selectTransport.ts`:

```ts
import { EcbSpp } from '../../modules/ecb-spp';
import type { BleStateType } from '../types/ble.types';
import type { Transport } from '../settings/manifestRuntimeFlag';

/**
 * Choose the initial transport. BLE is preferred; when the device reports BLE
 * as unsupported (hardware can't do BLE) we fall back to SPP if Bluetooth
 * Classic is available. 'off'/'unknown' do NOT trigger SPP — BLE exists, it's
 * just disabled, so the user can enable it.
 */
export async function selectInitialTransport(bleState: BleStateType): Promise<Transport> {
  if (bleState === 'unsupported') {
    const sppAvailable = await EcbSpp.isAvailable().catch(() => false);
    return sppAvailable ? 'spp' : 'ble';
  }
  return 'ble';
}
```

Run `npm test -- selectTransport` → PASS.

- [ ] **Step 6: Full suite + typecheck**

`npm test` → green. `npx tsc --noEmit` → only the 2 known errors (plus any `[deviceId].tsx` reference to the old flag API, which Task 6 fixes — note it, it's expected here).

- [ ] **Step 7: Commit**

```
cd D:/DEV/Amazing/ESP-Control-BLE && git add apps/mobile/src/types/ble.types.ts apps/mobile/src/transport/BleManager.ts apps/mobile/src/settings/manifestRuntimeFlag.ts apps/mobile/src/transport/selectTransport.ts apps/mobile/__tests__/settings/manifestRuntimeFlag.test.ts apps/mobile/__tests__/transport/selectTransport.test.ts && git commit -m "feat(mobile): transport flag ble|spp|fixture + BLE-unsupported auto-detect"
```

---

## Task 6: Wire SPP into the scan + control screens

**Files:**
- Modify: `apps/mobile/app/_layout.tsx` (run auto-detection at startup)
- Modify: `apps/mobile/app/index.tsx` (SPP device list)
- Modify: `apps/mobile/app/control/[deviceId].tsx` (pick transport for connect)

This task is UI wiring; verified by typecheck + full suite (screens aren't unit-tested) and the user's tablet test.

- [ ] **Step 1: Run auto-detection at startup**

In `apps/mobile/app/_layout.tsx`, where it already subscribes to BLE state (`bleManagerService.onStateChange(setBleState)`), also run the transport auto-detection once the BLE state is known and store it. Read the current `_layout.tsx` first. Add, after the existing state wiring:

```tsx
import { selectInitialTransport } from '../src/transport/selectTransport';
import { setTransport } from '../src/settings/manifestRuntimeFlag';
// ...inside the effect that gets bleState (or a new effect reacting to it):
useEffect(() => {
  let cancelled = false;
  bleManagerService.getBleState().then((state) => {
    if (cancelled) return;
    selectInitialTransport(state).then((t) => { if (!cancelled) setTransport(t); });
  });
  return () => { cancelled = true; };
}, []);
```
(Adapt to the file's actual structure — reuse the existing `bleManagerService`. The goal: by the time the user reaches the scan screen, the flag reflects ble vs spp.)

- [ ] **Step 2: Scan screen lists SPP devices in SPP mode**

In `apps/mobile/app/index.tsx`, read it fully. Currently it uses `useBleScan()` for BLE. Add an SPP branch keyed on `getTransport()`:
- If `getTransport() === 'spp'`: instead of `useBleScan`, drive an SPP device list. Add a small inline hook or `useEffect` that: requests location permission (reuse the permission helper pattern), calls `EcbSpp.listBondedDevices()` to seed the list, subscribes to `EcbSpp.onDeviceFound` to append, and calls `EcbSpp.startDiscovery()` (stop on unmount). Map the SPP devices `{ name, address, bonded }` to the same `BleDevice`-shaped objects the list renders (`{ id: address, name, rssi: null, serviceUUIDs: null }`) so `DeviceCard`/the FlashList are reused. On device press, navigate to `control` with `{ device: { id: address, name }, pin }` exactly as the BLE path does.
- If `getTransport() === 'ble'`: the existing `useBleScan` path, unchanged.

Keep this minimal and DRY: factor the device-list rendering so both modes feed the same list UI. If that's too invasive for one task, a clean `if (transport === 'spp') return <SppScanList .../>;` early branch that reuses `DeviceCard` is acceptable — just don't duplicate the whole styled screen; extract the shared list/card pieces.

NOTE: the SPP scan list is hardware-only (no Jest). Verify it typechecks and the BLE path still works in the suite.

- [ ] **Step 3: Control screen picks the transport for connect**

In `apps/mobile/app/control/[deviceId].tsx`, read it. The `DeviceRenderer` currently builds the machine with `connect: async () => new BleRuntime(await createRealBleDevice(device.id))`. Change the `connect` to branch on transport:

```tsx
import { createSppDevice } from '../../src/manifest/runtime/SppDevice';
import { createRealBleDevice } from '../../src/manifest/runtime/RealBleDevice';
import { getTransport } from '../../src/settings/manifestRuntimeFlag';
// ...
const transport = getTransport();
const machine = useMemo(
  () => createConnectionMachine({
    connect: async () => {
      const device = transport === 'spp'
        ? await createSppDevice(deviceParam.id)   // id === MAC address in SPP mode
        : await createRealBleDevice(deviceParam.id);
      return new BleRuntime(device);
    },
    authenticate: async (rt) => { await rt.authenticate(pin); },
    pin,
  }),
  [deviceParam.id, pin, transport],
);
```
Also update the `getManifestRuntime() === 'fixture'` check at the top of `ControlScreen` to `getTransport() === 'fixture'` (the function was renamed in Task 5). Everything else (machine driving, reconnect wiring, GATT cleanup, ManifestScreenRenderer) is unchanged — `SppDevice` has `onDisconnected`/`disconnect`, so the reconnect+cleanup effects work as-is.

- [ ] **Step 4: Typecheck — must be clean**

Run from `apps/mobile`: `npx tsc --noEmit`. Expected: ONLY the 2 known pre-existing errors. The screens and all renamed-flag references must be clean. Grep tsc output for `[deviceId]`, `index.tsx`, `_layout` to confirm.

- [ ] **Step 5: Full suite**

Run from `apps/mobile`: `npm test`. Expected: all green, no leaked-handle warning. (Screens aren't unit-tested; the runtime/device/machine/flag/transport suites pass.)

- [ ] **Step 6: Commit**

```
cd D:/DEV/Amazing/ESP-Control-BLE && git add "apps/mobile/app/control/[deviceId].tsx" apps/mobile/app/index.tsx apps/mobile/app/_layout.tsx && git commit -m "feat(mobile): SPP scan list + transport-aware connect; startup auto-detect"
```

---

## Task 7: Final verification sweep

**Files:** none (verification only; commit only if cleanup needed)

- [ ] **Step 1: No stale flag references**

Grep `apps/mobile/src` and `apps/mobile/app` for `getManifestRuntime`, `setManifestRuntime`, `ManifestRuntimeFlag`, and the old flag value `'device'`. Expected: zero in live code (all renamed to `getTransport`/`setTransport`/`Transport`/`'ble'`). Fix any stragglers.

- [ ] **Step 2: Typecheck + full test + leak check**

Run from `apps/mobile`:
```
npx tsc --noEmit
npm test
```
Expected: tsc only the 2 known pre-existing errors; tests all green; NO "worker failed to exit"/open-handle warning. Note the final test total.

- [ ] **Step 3: Confirm the engine is genuinely transport-agnostic**

Grep to confirm `SppDevice` implements the same surface `BleRuntime` consumes (`write`, `onNotify`, `onDisconnected`, `disconnect`) and that `connectionMachine`/`BleRuntime` were NOT modified for SPP (the diff for this sub-project should not touch `connectionMachine.ts`, `BleRuntime.ts`, `auth.ts`, `frameCodec.ts`, `bleFrameStream.ts`). If any of those changed, justify or revert.

- [ ] **Step 4: Commit (if any cleanup)**

```
cd D:/DEV/Amazing/ESP-Control-BLE && git add -A apps/mobile && git commit -m "chore(mobile): SPP transport final cleanup"
```
(Skip if nothing changed.)

---

## Manual device checklist (the user's tablet — not automatable)

On the Android 8.1 tablet (BLE broken), with a dev-client build:
- App starts → auto-detects SPP (BLE unsupported) → scan screen lists discovered/bonded Classic devices in-app (no Settings detour).
- Tap the ESP → first connect triggers Android's native pairing popup if required → accept → connects.
- Auth completes (AuthRequest/Challenge/Response/Result) → manifest arrives → UI renders.
- Walk out of range → auto-reconnect + re-auth → UI resumes; exhaust retries → failure state.
- Verify a frame round-trip (invoke an action; see a snapshot/delta).
- Wrong PIN → "PIN incorrect"; while the ESP has a BLE session, SPP connect → "appareil occupé".

## Contract consumed (frozen by sub-project 1; identical to BLE)
- Frame `[kind:1][flags:1][length:2 BE][body]` (reassembled by BleFrameStream).
- Auth: AuthRequest 0x40 → AuthChallenge 0x41 (16-byte nonce) → AuthResponse 0x42 (16-byte hash) → AuthResult 0x43; hash = SHA-256(pin‖nonce)[:16].
- Manifest pushed after AuthResult OK. One session at a time.
- SPP provides the same bidirectional byte stream as the BLE data characteristic.
