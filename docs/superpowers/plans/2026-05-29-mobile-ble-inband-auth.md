# Mobile in-band auth + BLE cutover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the mobile app onto the firmware's in-band 16-byte auth handshake over the BLE data characteristic, orchestrate connect→auth→manifest→subscribe (with auto-reconnect + re-auth) via an XState machine, and delete the dead legacy CMD-characteristic stack.

**Architecture:** Auth lives in `BleRuntime.authenticate(pin)` (frames AuthRequest/Challenge/Response/Result over the data characteristic). A new XState `connectionMachine` drives the session lifecycle and reconnection; the existing `deviceUiMachine` continues to own manifest+subscribe once authenticated. A one-line firmware fix makes the device push its manifest after `AuthResult OK`. All legacy BLE code (BleConnection, useBle*, ChallengeResponse, command codec) is removed.

**Tech Stack:** React Native, react-native-ble-plx, XState v5 (`@xstate/react`), expo-crypto (SHA-256), protobufjs, Jest. Firmware: C++ / PlatformIO / Unity.

**Reference spec:** `docs/superpowers/specs/2026-05-29-mobile-ble-inband-auth-design.md`

**Mobile test command:** `cd apps/mobile && npm test` (Jest). Single file: `npm test -- BleRuntime`.
**Mobile typecheck:** `cd apps/mobile && npx tsc --noEmit`.
**Firmware native tests:** `cd firmware/esp32 && & "$env:USERPROFILE\.platformio\penv\Scripts\platformio.exe" test -e native`.

---

## File Structure

**Firmware (1 fix):**
- Modify `firmware/esp32/lib/esp-control-ble/src/transport/ble/DataBleTransport.cpp` — `handleAuthResponse` queues the manifest on success.
- Modify `firmware/esp32/test/native/test_protocol_auth/test_protocol_auth.cpp` — assert a ManifestChunk follows a successful handshake.

**Mobile — new files:**
- `apps/mobile/src/manifest/runtime/auth.ts` — `computeAuthResponse(pin, nonce)` (16-byte SHA-256).
- `apps/mobile/src/manifest/runtime/connectionMachine.ts` — XState machine: connect→auth→ready, reconnection + re-auth.
- `apps/mobile/__tests__/manifest/auth.test.ts` — auth hash vector test.
- `apps/mobile/__tests__/manifest/connectionMachine.test.ts` — machine transition tests.

**Mobile — modified files:**
- `apps/mobile/src/manifest/runtime/frameCodec.ts` — add Auth FrameKind values.
- `apps/mobile/src/manifest/runtime/BleRuntime.ts` — add `authenticate(pin)`, handle Auth frames.
- `apps/mobile/__tests__/manifest/BleRuntime.test.ts` — add auth tests.
- `apps/mobile/src/manifest/runtime/RealBleDevice.ts` — expose a `disconnect`-aware connect for the machine (already has connect/disconnect; minor).
- `apps/mobile/src/settings/manifestRuntimeFlag.ts` — redefine `'device' | 'fixture'`, fix the setter.
- `apps/mobile/app/control/[deviceId].tsx` — use the connectionMachine + flag; drop the legacy renderer.

**Mobile — deleted files (legacy):**
- `apps/mobile/src/transport/BleConnection.ts`, `apps/mobile/src/transport/IBleTransport.ts`, `apps/mobile/src/transport/BleNotifyHandler.ts`
- `apps/mobile/src/protocol/auth/ChallengeResponse.ts`
- `apps/mobile/src/protocol/frame/CommandEncoder.ts`, `apps/mobile/src/protocol/frame/CommandDecoder.ts` (+ their `__tests__`)
- `apps/mobile/src/hooks/useBle.ts`, `useBleConnection.ts`, `useBleAuth.ts`, `useBleManifest.ts`, `useBleCommands.ts`
- `apps/mobile/src/types/protocol.types.ts`
- (`BleScanner.ts`, `BleManager.ts` are KEPT.)

**Design note (decided):** `connectionMachine` is a pure XState machine (testable under Jest without React rendering), consistent with the existing `deviceUiMachine`. The PIN is held in memory for the session to enable transparent re-auth on reconnect (the trade-off of the chosen auto-reconnect behavior).

---

## Task 1: Firmware — send manifest after AuthResult OK

**Files:**
- Modify: `firmware/esp32/lib/esp-control-ble/src/transport/ble/DataBleTransport.cpp` (`handleAuthResponse`)
- Test: `firmware/esp32/test/native/test_protocol_auth/test_protocol_auth.cpp`

- [ ] **Step 1: Add a failing test asserting a manifest chunk follows successful auth**

In `test_protocol_auth.cpp`, add this test and register it in `main()` (RUN_TEST). It reuses the file's existing helpers (`makeEngine`, `sender`, `lastKind`, the `g_last`/`g_count` capture). After a successful handshake, the engine must have queued the manifest; a `tick()` then emits a `ManifestChunk`.

```cpp
static void test_manifest_sent_after_successful_auth() {
  g_count = 0;
  uint8_t man[8] = {1,2,3,4,5,6,7,8}; ManifestStore store(man, 8);
  ResourceTable table; SubscriptionState subs; ActionRegistry reg; AuthHandler auth;
  ProtocolEngine* e = makeEngine(auth, table, subs, reg, store);

  e->handleFrame(FrameKind::AuthRequest, nullptr, 0);   // -> AuthChallenge
  uint8_t resp[ECB_HASH_SIZE];
  auth.computeHash(resp);
  e->handleFrame(FrameKind::AuthResponse, resp, ECB_HASH_SIZE);  // -> AuthResult OK, queues manifest

  // Drain one tick: the queued manifest should now emit a ManifestChunk frame.
  g_lastFrameKind = 0;
  e->tick();
  TEST_ASSERT_EQUAL_UINT8(static_cast<uint8_t>(FrameKind::ManifestChunk), g_lastFrameKind);
}
```

Add to `main()`:
```cpp
  RUN_TEST(test_manifest_sent_after_successful_auth);
```

- [ ] **Step 2: Run native tests to verify it fails**

Run: `cd firmware/esp32` then `& "$env:USERPROFILE\.platformio\penv\Scripts\platformio.exe" test -e native`
Expected: FAIL on `test_manifest_sent_after_successful_auth` — `g_lastFrameKind` is 0 (no manifest queued), because nothing calls `sendManifest()` after auth yet.

- [ ] **Step 3: Queue the manifest on successful auth**

In `DataBleTransport.cpp`, change `handleAuthResponse` to call `sendManifest()` when auth succeeds. Current code:

```cpp
void ProtocolEngine::handleAuthResponse(const uint8_t* body, size_t len) {
  bool ok = (len >= ECB_HASH_SIZE) && _auth.verifyHash(body);
  uint8_t result = ok ? 0x01 : 0x00;
  sendFrame(FrameKind::AuthResult, 0, &result, 1);
}
```

Replace with:

```cpp
void ProtocolEngine::handleAuthResponse(const uint8_t* body, size_t len) {
  bool ok = (len >= ECB_HASH_SIZE) && _auth.verifyHash(body);
  uint8_t result = ok ? 0x01 : 0x00;
  sendFrame(FrameKind::AuthResult, 0, &result, 1);
  if (ok) {
    // The client receives its UI as soon as it is authenticated. (Replaces the
    // old NimBLE send-on-subscribe trigger, lost in the Bluedroid rewrite.)
    sendManifest();
  }
}
```

NOTE: `handleAuthResponse` is called by `handleFrame` with the mutex already held. `sendManifest()` (lines ~175-179) itself takes the mutex (`xSemaphoreTake`). Since FreeRTOS mutexes are NOT recursive, calling `sendManifest()` here would self-deadlock on hardware. To avoid that, set the pending flags directly instead of calling `sendManifest()`. Use this body for the `if (ok)` block instead:

```cpp
  if (ok) {
    // Queue the manifest transfer directly (we already hold the mutex here;
    // sendManifest() would re-take it and FreeRTOS mutexes are non-recursive).
    _manifestOffset = 0;
    _manifestPending = true;
  }
```

(Confirm by reading `sendManifest()` and the mutex usage in `handleFrame` before editing. `_manifestOffset` and `_manifestPending` are private members of `ProtocolEngine`, set exactly as `sendManifest()` sets them.)

- [ ] **Step 4: Run native tests to verify it passes**

Run: `cd firmware/esp32` then `& "$env:USERPROFILE\.platformio\penv\Scripts\platformio.exe" test -e native`
Expected: PASS — `test_manifest_sent_after_successful_auth` passes; all other suites still green (expect 71 cases total: prior 70 + 1).

- [ ] **Step 5: Build firmware to confirm hardware path still compiles**

Run: `cd firmware/esp32` then `& "$env:USERPROFILE\.platformio\penv\Scripts\platformio.exe" run -e esp32dev`
Expected: SUCCESS.

- [ ] **Step 6: Commit**

```bash
git add firmware/esp32/lib/esp-control-ble/src/transport/ble/DataBleTransport.cpp firmware/esp32/test/native/test_protocol_auth/test_protocol_auth.cpp
git commit -m "fix(firmware): send manifest after successful in-band auth"
```

---

## Task 2: Mobile — add Auth FrameKind values

**Files:**
- Modify: `apps/mobile/src/manifest/runtime/frameCodec.ts`
- Test: `apps/mobile/__tests__/manifest/frameCodec.test.ts` (create)

- [ ] **Step 1: Write the failing test**

Create `apps/mobile/__tests__/manifest/frameCodec.test.ts`:

```ts
import { describe, expect, it } from '@jest/globals';
import { encodeFrame, decodeFrames, FrameKind } from '../../src/manifest/runtime/frameCodec';

describe('frameCodec auth frames', () => {
  it('exposes the four auth frame kinds', () => {
    expect(FrameKind.AuthRequest).toBe(0x40);
    expect(FrameKind.AuthChallenge).toBe(0x41);
    expect(FrameKind.AuthResponse).toBe(0x42);
    expect(FrameKind.AuthResult).toBe(0x43);
  });

  it('round-trips an AuthResponse frame with a 16-byte body', () => {
    const body = new Uint8Array(16).map((_, i) => i + 1);
    const wire = encodeFrame(FrameKind.AuthResponse, 0, body);
    // header [0x42][0x00][0x00][0x10] then 16 bytes
    expect(wire[0]).toBe(0x42);
    expect(wire[3]).toBe(16);
    const { frames, leftover } = decodeFrames(wire);
    expect(leftover.length).toBe(0);
    expect(frames).toHaveLength(1);
    expect(frames[0].kind).toBe(FrameKind.AuthResponse);
    expect(Array.from(frames[0].body)).toEqual(Array.from(body));
  });

  it('decodes an AuthResult OK frame', () => {
    const wire = encodeFrame(FrameKind.AuthResult, 0, new Uint8Array([0x01]));
    const { frames } = decodeFrames(wire);
    expect(frames[0].kind).toBe(FrameKind.AuthResult);
    expect(frames[0].body[0]).toBe(0x01);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd apps/mobile` then `npm test -- frameCodec`
Expected: FAIL — `FrameKind.AuthRequest` is `undefined` (not `0x40`).

- [ ] **Step 3: Add the Auth kinds to the enum**

In `apps/mobile/src/manifest/runtime/frameCodec.ts`, extend the `FrameKind` enum (keep existing values):

```ts
export enum FrameKind {
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
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd apps/mobile` then `npm test -- frameCodec`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/src/manifest/runtime/frameCodec.ts apps/mobile/__tests__/manifest/frameCodec.test.ts
git commit -m "feat(mobile): add auth frame kinds to frameCodec"
```

---

## Task 3: Mobile — auth response computation (16-byte SHA-256)

**Files:**
- Create: `apps/mobile/src/manifest/runtime/auth.ts`
- Test: `apps/mobile/__tests__/manifest/auth.test.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/mobile/__tests__/manifest/auth.test.ts`. The vector matches the firmware exactly (`SHA-256("1234" || nonce[0x01..0x10])[:16]`):

```ts
import { describe, expect, it } from '@jest/globals';
import { computeAuthResponse } from '../../src/manifest/runtime/auth';

// Same vector asserted in the firmware test_auth_handler suite.
const EXPECTED_HEX = 'bcb08518d2967e375f573d7e3a644974';

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

describe('computeAuthResponse', () => {
  it('computes SHA-256(pin || nonce) truncated to 16 bytes', async () => {
    const nonce = new Uint8Array(16).map((_, i) => i + 1); // 0x01..0x10
    const out = await computeAuthResponse('1234', nonce);
    expect(out).toHaveLength(16);
    expect(toHex(out)).toBe(EXPECTED_HEX);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd apps/mobile` then `npm test -- auth`
Expected: FAIL — `auth.ts` does not exist (cannot find module).

- [ ] **Step 3: Write the implementation**

Create `apps/mobile/src/manifest/runtime/auth.ts`:

```ts
import * as Crypto from 'expo-crypto';

/**
 * Compute the in-band auth response: SHA-256(pin || nonce) truncated to the
 * first 16 bytes. Mirrors the firmware AuthHandler (ECB_HASH_SIZE = 16).
 */
export async function computeAuthResponse(pin: string, nonce: Uint8Array): Promise<Uint8Array> {
  const pinBytes = new TextEncoder().encode(pin);
  const combined = new Uint8Array(pinBytes.length + nonce.length);
  combined.set(pinBytes, 0);
  combined.set(nonce, pinBytes.length);

  const hashBuffer = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, combined);
  return new Uint8Array(hashBuffer).slice(0, 16);
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd apps/mobile` then `npm test -- auth`
Expected: PASS.

NOTE: if `Crypto.digest` is not available in the Jest environment (expo-crypto may need a node shim), the test will error rather than fail. If so, check whether the repo already mocks expo-crypto (search `__mocks__` and `jest.config`/`jest` setup). The existing legacy `ChallengeResponse` used the same `Crypto.digest`, and it had no dedicated test — so a mock may be required. If needed, add `apps/mobile/__mocks__/expo-crypto.ts` that implements `digest` with node's `crypto.createHash('sha256')` and exposes `CryptoDigestAlgorithm.SHA256`. Report this if you hit it; it's a legitimate test-infra addition.

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/src/manifest/runtime/auth.ts apps/mobile/__tests__/manifest/auth.test.ts
git commit -m "feat(mobile): 16-byte SHA-256 auth response computation"
```

---

## Task 4: Mobile — BleRuntime.authenticate() + auth frame handling

**Files:**
- Modify: `apps/mobile/src/manifest/runtime/BleRuntime.ts`
- Test: `apps/mobile/__tests__/manifest/BleRuntime.test.ts`

- [ ] **Step 1: Write the failing tests**

Append to `apps/mobile/__tests__/manifest/BleRuntime.test.ts` (inside the existing `describe('BleRuntime', ...)`). These use the existing `createFixtureBleDevice` (which records `sentFrames` and lets you `queueIncoming`). Add imports at the top of the file if missing: `import { computeAuthResponse } from '../../src/manifest/runtime/auth';` and `import { decodeFrames } from '../../src/manifest/runtime/frameCodec';`.

```ts
  // Drains the promise/microtask chain (device.write and the async
  // onAuthChallenge handler both await). A real macrotask tick is reliable
  // where a single `await Promise.resolve()` is not.
  const flush = () => new Promise<void>((r) => setTimeout(r, 0));

  it('authenticate: sends AuthRequest, answers the challenge, resolves on AuthResult OK', async () => {
    const device = createFixtureBleDevice();
    const rt = new BleRuntime(device);

    const nonce = new Uint8Array(16).map((_, i) => i + 1);
    const authPromise = rt.authenticate('1234');

    await flush(); // AuthRequest written
    const firstSent = decodeFrames(device.sentFrames[0]).frames[0];
    expect(firstSent.kind).toBe(FrameKind.AuthRequest);

    device.queueIncoming(encodeFrame(FrameKind.AuthChallenge, 0, nonce));
    await flush(); // onAuthChallenge computes the hash and writes AuthResponse

    const responseFrame = decodeFrames(device.sentFrames[1]).frames[0];
    expect(responseFrame.kind).toBe(FrameKind.AuthResponse);
    const expectedHash = await computeAuthResponse('1234', nonce);
    expect(Array.from(responseFrame.body)).toEqual(Array.from(expectedHash));

    device.queueIncoming(encodeFrame(FrameKind.AuthResult, 0, new Uint8Array([0x01])));
    await expect(authPromise).resolves.toBeUndefined();
  }, 10000);

  it('authenticate: rejects on AuthResult FAIL', async () => {
    const device = createFixtureBleDevice();
    const rt = new BleRuntime(device);
    const nonce = new Uint8Array(16).fill(0xAB);

    const authPromise = rt.authenticate('0000');
    await flush();
    device.queueIncoming(encodeFrame(FrameKind.AuthChallenge, 0, nonce));
    await flush();
    device.queueIncoming(encodeFrame(FrameKind.AuthResult, 0, new Uint8Array([0x00])));

    await expect(authPromise).rejects.toThrow(/auth/i);
  }, 10000);
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd apps/mobile` then `npm test -- BleRuntime`
Expected: FAIL — `rt.authenticate` is not a function.

- [ ] **Step 3: Add auth state + the authenticate method + frame handling**

In `apps/mobile/src/manifest/runtime/BleRuntime.ts`:

Add an import near the top (after the existing imports):

```ts
import { computeAuthResponse } from './auth';
```

Add a typed error class near the top of the file (after imports, before the `decodeCommonValue` function):

```ts
export class AuthError extends Error {
  constructor(message: string) { super(message); this.name = 'AuthError'; }
}
```

Add private fields to the class (next to the other `private` fields around lines 26-40):

```ts
  private pin: string | null = null;
  private authResolve: (() => void) | null = null;
  private authReject: ((err: Error) => void) | null = null;
  private authTimer: ReturnType<typeof setTimeout> | null = null;
```

Add the `authenticate` method and an internal nonce handler (place after the constructor, before `dispatchFrame`):

```ts
  /**
   * Run the in-band auth handshake: send AuthRequest, answer the AuthChallenge
   * with SHA-256(pin||nonce)[:16], resolve on AuthResult OK / reject on FAIL.
   */
  authenticate(pin: string, timeoutMs = 5000): Promise<void> {
    this.pin = pin;
    return new Promise<void>((resolve, reject) => {
      this.authResolve = resolve;
      this.authReject = reject;
      this.authTimer = setTimeout(() => {
        this.clearAuthWaiters();
        reject(new AuthError('auth timed out'));
      }, timeoutMs);
      // Empty-body AuthRequest kicks off the handshake.
      this.device.write(encodeFrame(FrameKind.AuthRequest, 0, new Uint8Array(0)))
        .catch((err) => { this.clearAuthWaiters(); reject(new AuthError(`auth send failed: ${err?.message ?? err}`)); });
    });
  }

  private clearAuthWaiters() {
    if (this.authTimer) { clearTimeout(this.authTimer); this.authTimer = null; }
    this.authResolve = null;
    this.authReject = null;
  }

  private async onAuthChallenge(nonce: Uint8Array) {
    if (!this.pin || !this.authReject) return; // no handshake in progress
    try {
      const hash = await computeAuthResponse(this.pin, nonce);
      await this.device.write(encodeFrame(FrameKind.AuthResponse, 0, hash));
    } catch (err) {
      const reject = this.authReject;
      this.clearAuthWaiters();
      reject?.(new AuthError(`auth response failed: ${(err as Error)?.message ?? err}`));
    }
  }

  private onAuthResult(body: Uint8Array) {
    const ok = body.length >= 1 && body[0] === 0x01;
    const resolve = this.authResolve;
    const reject = this.authReject;
    this.clearAuthWaiters();
    if (ok) resolve?.();
    else reject?.(new AuthError('auth rejected (wrong PIN)'));
  }
```

In `dispatchFrame`, add handling for the two inbound auth kinds at the TOP of the method (before the InvokeResult check):

```ts
    if (kind === FrameKind.AuthChallenge) { void this.onAuthChallenge(body); return; }
    if (kind === FrameKind.AuthResult) { this.onAuthResult(body); return; }
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd apps/mobile` then `npm test -- BleRuntime`
Expected: PASS — both new auth tests plus the existing manifest/invoke tests.

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/src/manifest/runtime/BleRuntime.ts apps/mobile/__tests__/manifest/BleRuntime.test.ts
git commit -m "feat(mobile): in-band auth handshake in BleRuntime"
```

---

## Task 5: Mobile — connectionMachine (connect → auth → ready, reconnection)

**Files:**
- Create: `apps/mobile/src/manifest/runtime/connectionMachine.ts`
- Test: `apps/mobile/__tests__/manifest/connectionMachine.test.ts`

This machine owns the session lifecycle. It is given async callbacks (so it's transport-agnostic and testable without BLE): `connect()` returns a `BleRuntime`, `authenticate(rt)` runs the handshake. The manifest+subscribe stay in `deviceUiMachine` (unchanged), which runs once `connectionMachine` reaches `ready` and exposes the runtime.

- [ ] **Step 1: Write the failing tests**

Create `apps/mobile/__tests__/manifest/connectionMachine.test.ts`:

```ts
import { describe, expect, it, jest } from '@jest/globals';
import { createActor } from 'xstate';
import { createConnectionMachine } from '../../src/manifest/runtime/connectionMachine';

function waitFor(actor: any, predicate: (s: any) => boolean, timeoutMs = 2000): Promise<any> {
  return new Promise((resolve, reject) => {
    const sub = actor.subscribe((s: any) => { if (predicate(s)) { sub.unsubscribe(); resolve(s); } });
    setTimeout(() => { sub.unsubscribe(); reject(new Error('timeout')); }, timeoutMs);
  });
}

describe('connectionMachine', () => {
  it('reaches ready after connect + authenticate succeed', async () => {
    const fakeRuntime = { id: 'rt' };
    const connect = jest.fn(async () => fakeRuntime as any);
    const authenticate = jest.fn(async () => {});
    const machine = createConnectionMachine({ connect, authenticate, pin: '1234', maxRetries: 3 });
    const actor = createActor(machine).start();

    const s = await waitFor(actor, (st) => st.matches('ready'));
    expect(connect).toHaveBeenCalledTimes(1);
    expect(authenticate).toHaveBeenCalledWith(fakeRuntime);
    expect(s.context.runtime).toBe(fakeRuntime);
  });

  it('goes to failed when authenticate rejects with an auth error (no retry on bad PIN)', async () => {
    const connect = jest.fn(async () => ({} as any));
    const authenticate = jest.fn(async () => { const e: any = new Error('auth rejected (wrong PIN)'); e.name = 'AuthError'; throw e; });
    const machine = createConnectionMachine({ connect, authenticate, pin: 'bad', maxRetries: 3 });
    const actor = createActor(machine).start();

    const s = await waitFor(actor, (st) => st.matches('failed'));
    expect(s.context.error).toMatch(/PIN/i);
    expect(authenticate).toHaveBeenCalledTimes(1); // not retried
  });

  it('retries connect on a transport failure then succeeds', async () => {
    let attempts = 0;
    const connect = jest.fn(async () => { attempts++; if (attempts < 2) throw new Error('gatt error'); return { id: 'rt' } as any; });
    const authenticate = jest.fn(async () => {});
    const machine = createConnectionMachine({ connect, authenticate, pin: '1234', maxRetries: 3, retryDelayMs: 1 });
    const actor = createActor(machine).start();

    const s = await waitFor(actor, (st) => st.matches('ready'));
    expect(attempts).toBe(2);
    expect(s.context.runtime).toEqual({ id: 'rt' });
  });

  it('gives up to failed after maxRetries transport failures', async () => {
    const connect = jest.fn(async () => { throw new Error('gatt error'); });
    const authenticate = jest.fn(async () => {});
    const machine = createConnectionMachine({ connect, authenticate, pin: '1234', maxRetries: 2, retryDelayMs: 1 });
    const actor = createActor(machine).start();

    const s = await waitFor(actor, (st) => st.matches('failed'));
    expect(connect.mock.calls.length).toBe(3); // initial + 2 retries
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd apps/mobile` then `npm test -- connectionMachine`
Expected: FAIL — module `connectionMachine` not found.

- [ ] **Step 3: Write the machine**

Create `apps/mobile/src/manifest/runtime/connectionMachine.ts`:

```ts
import { assign, fromPromise, setup } from 'xstate';
import type { BleRuntime } from './BleRuntime';

export interface ConnectionInput {
  connect: () => Promise<BleRuntime>;
  authenticate: (runtime: BleRuntime) => Promise<void>;
  pin: string;
  maxRetries?: number;
  retryDelayMs?: number;
}

interface Context {
  runtime: BleRuntime | null;
  error: string | null;
  attempts: number;
  maxRetries: number;
  retryDelayMs: number;
}

type Event = { type: 'RETRY' } | { type: 'CANCEL' };

function isAuthError(err: unknown): boolean {
  return (err as Error)?.name === 'AuthError' || /PIN|auth/i.test((err as Error)?.message ?? '');
}

/**
 * Session lifecycle: connect -> authenticate -> ready. Transport failures during
 * connect are retried with a linear backoff up to maxRetries; an auth failure
 * (wrong PIN) is terminal (no retry). The manifest load + subscriptions are
 * owned by deviceUiMachine, which runs once this machine exposes `runtime`.
 */
export function createConnectionMachine(cfg: ConnectionInput) {
  return setup({
    types: {} as { context: Context; events: Event },
    actors: {
      connector: fromPromise(async () => cfg.connect()),
      authenticator: fromPromise(async ({ input }: { input: { runtime: BleRuntime } }) => {
        await cfg.authenticate(input.runtime);
      }),
    },
    actions: {
      recordRuntime: assign({ runtime: (_, p: { runtime: BleRuntime }) => p.runtime }),
      recordError: assign({ error: (_, p: { message: string }) => p.message }),
      incAttempts: assign({ attempts: ({ context }) => context.attempts + 1 }),
      resetAttempts: assign({ attempts: () => 0 }),
    },
    delays: {
      backoff: ({ context }) => context.retryDelayMs * Math.max(1, context.attempts),
    },
    guards: {
      canRetry: ({ context }) => context.attempts < context.maxRetries,
    },
  }).createMachine({
    id: 'connection',
    initial: 'connecting',
    context: {
      runtime: null,
      error: null,
      attempts: 0,
      maxRetries: cfg.maxRetries ?? 3,
      retryDelayMs: cfg.retryDelayMs ?? 1000,
    },
    states: {
      connecting: {
        invoke: {
          src: 'connector',
          onDone: {
            target: 'authenticating',
            actions: [{ type: 'recordRuntime', params: ({ event }) => ({ runtime: event.output }) }],
          },
          onError: 'connect_retry_decision',
        },
      },
      connect_retry_decision: {
        always: [
          { guard: 'canRetry', target: 'reconnecting', actions: [{ type: 'incAttempts' }] },
          { target: 'failed', actions: [{ type: 'recordError', params: () => ({ message: 'connection failed' }) }] },
        ],
      },
      reconnecting: {
        after: { backoff: 'connecting' },
      },
      authenticating: {
        invoke: {
          src: 'authenticator',
          input: ({ context }) => ({ runtime: context.runtime as BleRuntime }),
          onDone: { target: 'ready', actions: [{ type: 'resetAttempts' }] },
          onError: {
            // Auth failures are terminal (wrong PIN); we do not retry them.
            target: 'failed',
            actions: [{
              type: 'recordError',
              params: ({ event }) => ({ message: isAuthError(event.error) ? ((event.error as Error).message ?? 'auth failed') : 'auth failed' }),
            }],
          },
        },
      },
      ready: {
        on: { CANCEL: 'cancelled' },
      },
      failed: {
        on: { RETRY: { target: 'connecting', actions: [{ type: 'resetAttempts' }, assign({ error: () => null })] } },
      },
      cancelled: { type: 'final' },
    },
  });
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd apps/mobile` then `npm test -- connectionMachine`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/src/manifest/runtime/connectionMachine.ts apps/mobile/__tests__/manifest/connectionMachine.test.ts
git commit -m "feat(mobile): connection state machine with retry and terminal auth failure"
```

---

## Task 6: Mobile — redefine the runtime flag (device | fixture)

**Files:**
- Modify: `apps/mobile/src/settings/manifestRuntimeFlag.ts`
- Test: `apps/mobile/__tests__/settings/manifestRuntimeFlag.test.ts` (create)

- [ ] **Step 1: Write the failing test**

Create `apps/mobile/__tests__/settings/manifestRuntimeFlag.test.ts`:

```ts
import { describe, expect, it, beforeEach } from '@jest/globals';
import { getManifestRuntime, setManifestRuntime } from '../../src/settings/manifestRuntimeFlag';

describe('manifestRuntimeFlag', () => {
  beforeEach(() => setManifestRuntime('device'));

  it('defaults to device', () => {
    expect(getManifestRuntime()).toBe('device');
  });

  it('can switch to fixture (debug) and back', () => {
    setManifestRuntime('fixture');
    expect(getManifestRuntime()).toBe('fixture');
    setManifestRuntime('device');
    expect(getManifestRuntime()).toBe('device');
  });

  it('falls back to device for an invalid value', () => {
    setManifestRuntime(null);
    expect(getManifestRuntime()).toBe('device');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd apps/mobile` then `npm test -- manifestRuntimeFlag`
Expected: FAIL — current default is `'manifest'` and `setManifestRuntime('fixture')` can never set fixture (the existing setter bug).

- [ ] **Step 3: Rewrite the flag module**

Replace `apps/mobile/src/settings/manifestRuntimeFlag.ts`:

```ts
/**
 * Which runtime backs the control screen:
 *  - 'device'  : BleRuntime over real BLE (production default).
 *  - 'fixture' : bundled FixtureRuntime (no hardware) — a debug mode for
 *                exercising the full UI without an ESP32.
 * In-memory only; production builds start on 'device'.
 */
export type ManifestRuntimeFlag = 'device' | 'fixture';

let inMemory: ManifestRuntimeFlag = 'device';

export function getManifestRuntime(): ManifestRuntimeFlag { return inMemory; }

export function setManifestRuntime(value: ManifestRuntimeFlag | null): void {
  inMemory = value === 'fixture' ? 'fixture' : 'device';
}
```

NOTE: the exported type was `ManifestRuntime` before, which collided conceptually with the `ManifestRuntime` interface in `manifest/runtime/ManifestRuntime.ts`. Renaming the flag type to `ManifestRuntimeFlag` removes that confusion. Update any importer of the old type name (grep `ManifestRuntime` in `apps/mobile/app` and `apps/mobile/src/settings`); the only consumer is `[deviceId].tsx`, rewired in Task 7.

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd apps/mobile` then `npm test -- manifestRuntimeFlag`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/src/settings/manifestRuntimeFlag.ts apps/mobile/__tests__/settings/manifestRuntimeFlag.test.ts
git commit -m "refactor(mobile): redefine runtime flag as device|fixture, fix setter"
```

---

## Task 7: Mobile — rewire the control screen onto the connection machine

**Files:**
- Modify: `apps/mobile/app/control/[deviceId].tsx`

This task wires the real connect+auth path through the machine and removes the legacy renderer branch. The screen: builds a `connectionMachine` (device mode) or uses the bundled fixture (debug mode); when `ready`, renders `ManifestScreenRenderer` with the runtime (which internally uses `deviceUiMachine` for manifest+subscribe).

- [ ] **Step 1: Read the current file fully**

Run: read `apps/mobile/app/control/[deviceId].tsx` end to end. Identify the legacy renderer (the `useBle()`/`useManifest()` block after the `runtimeMode === 'manifest'` check) — it will be removed.

- [ ] **Step 2: Replace the screen implementation**

Replace the whole file body with the device/fixture split driven by the machine. Use this structure (adapt imports to the file's existing ones — keep `ManifestScreenRenderer`, `BleDevice`, `useAuthStore`, route hooks):

```tsx
import { useRoute } from '@react-navigation/native';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useMachine } from '@xstate/react';

import { ManifestScreenRenderer } from '../../src/manifest/render/ManifestScreenRenderer';
import { createConnectionMachine } from '../../src/manifest/runtime/connectionMachine';
import { BleRuntime } from '../../src/manifest/runtime/BleRuntime';
import { createRealBleDevice } from '../../src/manifest/runtime/RealBleDevice';
import { loadBundledFixtureRuntime } from '../../src/manifest/runtime/bundledFixtureRuntime';
import type { ManifestRuntime } from '../../src/manifest/runtime/ManifestRuntime';
import { getManifestRuntime } from '../../src/settings/manifestRuntimeFlag';
import { useAuthStore } from '../../src/store/authStore'; // adjust to actual path
import type { BleDevice } from '../../src/types/ble.types';

interface RouteParams { device: BleDevice; pin: string; }

function DeviceRenderer({ device, pin }: RouteParams) {
  const savePin = useAuthStore((s) => s.savePin);
  const machine = useMemo(() => createConnectionMachine({
    connect: async () => {
      const bleDevice = await createRealBleDevice(device.id);
      return new BleRuntime(bleDevice);
    },
    authenticate: async (rt) => { await rt.authenticate(pin); },
    pin,
  }), [device.id, pin]);

  const [state] = useMachine(machine);

  useEffect(() => {
    if (state.matches('ready')) {
      savePin(device.id, pin, device.name ?? device.id).catch(() => {});
    }
  }, [state, device, pin, savePin]);

  if (state.matches('failed')) {
    return <View><Text>Connexion échouée: {state.context.error ?? 'inconnue'}</Text></View>;
  }
  if (!state.matches('ready') || !state.context.runtime) {
    return <ActivityIndicator />;
  }
  return <ManifestScreenRenderer runtime={state.context.runtime} screenSlug="home" />;
}

function FixtureRenderer() {
  const [runtime, setRuntime] = useState<ManifestRuntime | null>(null);
  useEffect(() => {
    let cancelled = false;
    loadBundledFixtureRuntime().then((rt) => { if (!cancelled) setRuntime(rt); });
    return () => { cancelled = true; };
  }, []);
  if (!runtime) return <ActivityIndicator />;
  return <ManifestScreenRenderer runtime={runtime} screenSlug="home" />;
}

export default function ControlScreen() {
  const route = useRoute();
  const { device, pin } = route.params as RouteParams;
  return getManifestRuntime() === 'fixture'
    ? <FixtureRenderer />
    : <DeviceRenderer device={device} pin={pin} />;
}
```

IMPORTANT: adjust import paths to the ACTUAL paths in the repo (e.g. the auth store hook — find it with grep `savePin` and `useAuthStore`/`useAuth`). Confirm `loadBundledFixtureRuntime` exists at `apps/mobile/src/manifest/runtime/bundledFixtureRuntime.ts` (it does). Do NOT import anything from the legacy hooks (`useBle`, `useManifest`, etc.) — those are deleted in Task 8.

- [ ] **Step 3: Typecheck**

Run: `cd apps/mobile` then `npx tsc --noEmit`
Expected: errors ONLY about the not-yet-deleted legacy files (which may still import each other) — the `[deviceId].tsx` file itself must typecheck. If `[deviceId].tsx` has type errors, fix them (e.g. correct import paths). Legacy-file errors are resolved in Task 8.

NOTE: if `tsc` is clean except for legacy, good. If the auth store hook name/path differs, fix the import here.

- [ ] **Step 4: Run the test suite (no regressions in runtime tests)**

Run: `cd apps/mobile` then `npm test`
Expected: all runtime/auth/machine tests pass. (The screen itself isn't unit-tested; it's covered by the manual device checklist.)

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/app/control/[deviceId].tsx
git commit -m "feat(mobile): drive control screen via connection machine; device|fixture split"
```

---

## Task 8: Mobile — delete the legacy BLE stack

**Files (delete):**
- `apps/mobile/src/transport/BleConnection.ts`
- `apps/mobile/src/transport/IBleTransport.ts`
- `apps/mobile/src/transport/BleNotifyHandler.ts`
- `apps/mobile/src/protocol/auth/ChallengeResponse.ts`
- `apps/mobile/src/protocol/frame/CommandEncoder.ts`
- `apps/mobile/src/protocol/frame/CommandDecoder.ts`
- `apps/mobile/src/protocol/frame/__tests__/CommandEncoder.test.ts`
- `apps/mobile/src/protocol/frame/__tests__/CommandDecoder.test.ts`
- `apps/mobile/src/hooks/useBle.ts`
- `apps/mobile/src/hooks/useBleConnection.ts`
- `apps/mobile/src/hooks/useBleAuth.ts`
- `apps/mobile/src/hooks/useBleManifest.ts`
- `apps/mobile/src/hooks/useBleCommands.ts`
- `apps/mobile/src/types/protocol.types.ts`

- [ ] **Step 1: Find every importer of the legacy modules**

Run (Grep tool, across `apps/mobile`): search for imports of each module above — `useBle`, `useBleConnection`, `useBleAuth`, `useBleManifest`, `useBleCommands`, `BleConnection`, `IBleTransport`, `BleNotifyHandler`, `ChallengeResponse`, `CommandEncoder`, `CommandDecoder`, `protocol.types`, and the symbols `AuthStatus`, `useManifest` (if it's a legacy hook). List every file that references them.

Expected: after Task 7, the only references should be among the legacy files themselves (they import each other) and possibly a `useManifest`/store hook used solely by the now-removed legacy renderer. If a NON-legacy file (kept code) still imports one of these, STOP and report — it means something still depends on the legacy path and the cutover is incomplete.

- [ ] **Step 2: Delete the legacy files**

Run (PowerShell):
```powershell
Remove-Item apps/mobile/src/transport/BleConnection.ts, apps/mobile/src/transport/IBleTransport.ts, apps/mobile/src/transport/BleNotifyHandler.ts, apps/mobile/src/protocol/auth/ChallengeResponse.ts, apps/mobile/src/protocol/frame/CommandEncoder.ts, apps/mobile/src/protocol/frame/CommandDecoder.ts, apps/mobile/src/hooks/useBle.ts, apps/mobile/src/hooks/useBleConnection.ts, apps/mobile/src/hooks/useBleAuth.ts, apps/mobile/src/hooks/useBleManifest.ts, apps/mobile/src/hooks/useBleCommands.ts, apps/mobile/src/types/protocol.types.ts
Remove-Item -Recurse apps/mobile/src/protocol/frame/__tests__
```
(If `protocol/frame/__tests__` contains tests OTHER than CommandEncoder/Decoder, delete only those two files instead of the whole dir — check first.)

- [ ] **Step 3: Remove any now-orphaned legacy hooks/stores referenced only by the deleted renderer**

If Step 1 found a `useManifest` hook or a legacy command store used ONLY by the old renderer (now gone), delete those too. Re-grep to confirm they have no remaining importers. Do NOT delete `useDeviceUi`, `deviceUiMachine`, `connectionMachine`, `BleRuntime`, `FixtureRuntime`, `bundledFixtureRuntime`, `BleScanner`, `BleManager`, the auth store — these are live.

- [ ] **Step 4: Typecheck — must be fully clean now**

Run: `cd apps/mobile` then `npx tsc --noEmit`
Expected: ZERO errors. If there are unresolved imports, they point to a missed reference — fix by removing the dead import or, if it's a real dependency, reconsider the deletion.

- [ ] **Step 5: Run the full test suite**

Run: `cd apps/mobile` then `npm test`
Expected: all green. The CommandEncoder/Decoder tests are gone; the runtime/auth/machine/flag tests pass. Note the new total.

- [ ] **Step 6: Commit**

```bash
git add -A apps/mobile
git commit -m "refactor(mobile): remove dead legacy CMD-characteristic BLE stack"
```

---

## Task 9: Mobile — final verification sweep

**Files:** none (verification only)

- [ ] **Step 1: Grep for dead references to the old protocol**

Run (Grep across `apps/mobile/src` and `apps/mobile/app`): `0xf0`, `0xf1`, `0xf2`, `AuthStatus`, `CMD_CHAR_UUID`, `8bf0baf5`, `computeHmacResponse`, `parseChallengeFrame`, `writeCommand`.
Expected: no hits in live code. The data path uses `fac1a3ac` (data char) and `f99e14e3` (manifest char, read for discovery) only. If `8bf0baf5` still appears, it's a dead constant — remove it.

- [ ] **Step 2: Full typecheck + tests + lint**

Run, in `apps/mobile`:
```
npx tsc --noEmit
npm test
```
Expected: typecheck clean, all tests pass. If the repo has a lint script (`npm run lint`), run it and fix issues this change introduced.

- [ ] **Step 3: Confirm the firmware fix is still green**

Run: `cd firmware/esp32` then `& "$env:USERPROFILE\.platformio\penv\Scripts\platformio.exe" test -e native`
Expected: all green (71 cases), confirming the cross-component contract holds (mobile auth vector == firmware vector; manifest-after-auth in place).

- [ ] **Step 4: Commit (if any cleanup was made)**

```bash
git add -A apps/mobile
git commit -m "chore(mobile): remove residual legacy protocol references"
```

(If nothing changed in Step 1-2, skip the commit.)

---

## Manual device checklist (pending real hardware — not automatable)

Once the firmware (sub-project 1) is flashed and this mobile change is built:
- Scan finds the ESP32; connect with the correct PIN → AuthRequest/Challenge/Response/Result completes; manifest arrives automatically; UI renders.
- Wrong PIN → "PIN incorrect" surfaced; PIN cleared from secure store.
- Toggle the debug flag to `'fixture'` → full UI renders with bundled fixture, no device.
- Kill BLE (walk out of range) → auto-reconnect + re-auth + UI resumes; exhaust retries → failure state.
- While the tablet (SPP) holds a session, a phone (BLE) connect is refused/disconnected (cross-checks sub-project 1's exclusivity).

## Contract consumed (frozen by sub-project 1)

- Frame: `[kind:1][flags:1][length:2 BE][body:length]`.
- Auth: `AuthRequest 0x40` (empty) → `AuthChallenge 0x41` (16-byte nonce) → `AuthResponse 0x42` (16-byte hash) → `AuthResult 0x43` (body[0] 0x01/0x00).
- `hash = SHA-256(pin‖nonce)[:16]`; shared vector `bcb08518d2967e375f573d7e3a644974` for pin `"1234"`, nonce `0x01..0x10`.
- Manifest pushed automatically after `AuthResult OK` as `ManifestChunk`/`ManifestEof` frames.
- One session at a time; a second connection is refused by the firmware.
