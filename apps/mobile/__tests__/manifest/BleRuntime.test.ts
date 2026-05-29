import { describe, expect, it, jest } from '@jest/globals';
import { BleRuntime } from '../../src/manifest/runtime/BleRuntime';
import { createFixtureBleDevice } from '../../src/manifest/runtime/BleRuntime.fixture';
import { encodeFrame, decodeFrames, FrameKind } from '../../src/manifest/runtime/frameCodec';
import { computeAuthResponse } from '../../src/manifest/runtime/auth';
import { Writer, Reader } from 'protobufjs/minimal';
import { default as root } from '../../src/manifest/generated/manifest.pbjs';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const manifest = (root as any).esp_control;
const FIXTURE = resolve(__dirname, '..', '..', 'assets', 'manifest_demo.pb');
const testManifestBytes = new Uint8Array(readFileSync(FIXTURE));

describe('BleRuntime', () => {
  it('resolves invokeAction when the device replies with InvokeResult', async () => {
    const device = createFixtureBleDevice();
    const rt = new BleRuntime(device);
    
    const resultFrame = (() => {
      const msg = manifest.InvokeResult.create({
        correlationId: 1, status: manifest.Status.STATUS_OK, payload: new Uint8Array([1]),
      });
      const body = manifest.InvokeResult.encode(msg, new Writer()).finish();
      return encodeFrame(FrameKind.InvokeResult, 0, body);
    })();
    
    // We need to preload manifest for invokeAction to find actionId
    (device as any).manifestBytes = testManifestBytes;
    await rt.loadManifest();

    const invokePromise = rt.invokeAction('relay.toggle', {});
    
    setTimeout(() => {
        device.queueIncoming(resultFrame);
    }, 100);
    
    const reply = await invokePromise;
    expect(reply.status).toBe('ok');
  }, 10000);

  it('loads the manifest from chunk + eof frames and resolves ids from the manifest', async () => {
    const device = createFixtureBleDevice();
    const runtime = new BleRuntime(device);
    (device as any).manifestBytes = testManifestBytes;
    const loadedManifest = await runtime.loadManifest();
    expect(loadedManifest.actions.has('relay.toggle')).toBe(true);
    
    const originalWrite = device.write;
    device.write = async (frame: Uint8Array) => {
        await originalWrite.call(device, frame);
        
        const frameBody = frame.slice(4); 
        const invokeAction = manifest.InvokeAction.decode(new Reader(frameBody));
        
        const msg = manifest.InvokeResult.create({
            correlationId: invokeAction.correlationId,
            status: manifest.Status.STATUS_OK, 
            payload: new Uint8Array([1]),
        });
        const body = manifest.InvokeResult.encode(msg, new Writer()).finish();
        device.queueIncoming(encodeFrame(FrameKind.InvokeResult, 0, body));
    };

    const result = await runtime.invokeAction('relay.toggle', { value: true });
    expect(result.status).toBe('ok');
  }, 10000);

  it('loads manifest via frames', async () => {
    const device = createFixtureBleDevice();
    const runtime = new BleRuntime(device);
    
    // Ensure manifestBytes is NOT set so it hits the real implementation
    // (device as any).manifestBytes = undefined; 
    
    const manifest = testManifestBytes;
    
    // CRC32 of manifest
    function crc32(buf: Uint8Array): number {
        let crc = 0xFFFFFFFF;
        for (let i = 0; i < buf.length; i++) {
            crc ^= buf[i];
            for (let j = 0; j < 8; j++) {
                crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
            }
        }
        return (crc ^ 0xFFFFFFFF) >>> 0;
    }
    
    const crc = crc32(manifest);
    const eofBody = new Uint8Array(8);
    const view = new DataView(eofBody.buffer);
    view.setUint32(0, manifest.length, false);
    view.setUint32(4, crc, false);
    
    // Send chunks
    setTimeout(() => {
        const chunkSize = 100;
        for (let i = 0; i < manifest.length; i += chunkSize) {
            const chunk = manifest.slice(i, i + chunkSize);
            device.queueIncoming(encodeFrame(FrameKind.ManifestChunk, 0, chunk));
        }
        
        // Send EOF
        device.queueIncoming(encodeFrame(FrameKind.ManifestEof, 0, eofBody));
    }, 100);
    
    const loadedManifest = await runtime.loadManifest();
    expect(loadedManifest).toBeDefined();
    expect(loadedManifest.actions.size).toBeGreaterThan(0);
  }, 10000);

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

  it('authenticate: a second call supersedes a pending first without hanging', async () => {
    const device = createFixtureBleDevice();
    const rt = new BleRuntime(device);

    const first = rt.authenticate('1111', 10000);
    await flush(); // first AuthRequest written
    // Start a second handshake before the first settles.
    const second = rt.authenticate('2222', 10000);

    // The first promise must settle (reject), not hang.
    await expect(first).rejects.toThrow(/supersede|auth/i);

    // The second completes normally.
    await flush();
    const nonce = new Uint8Array(16).fill(0x07);
    device.queueIncoming(encodeFrame(FrameKind.AuthChallenge, 0, nonce));
    await flush();
    device.queueIncoming(encodeFrame(FrameKind.AuthResult, 0, new Uint8Array([0x01])));
    await expect(second).resolves.toBeUndefined();
  }, 10000);

  // CRC32 helper mirroring BleRuntime's private implementation, for building
  // valid ManifestEof frames in the disconnect/timeout tests below.
  function crc32(buf: Uint8Array): number {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) {
      crc ^= buf[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
      }
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  function makeEofFrame(bytes: Uint8Array): Uint8Array {
    const eofBody = new Uint8Array(8);
    const view = new DataView(eofBody.buffer);
    view.setUint32(0, bytes.length, false);
    view.setUint32(4, crc32(bytes), false);
    return encodeFrame(FrameKind.ManifestEof, 0, eofBody);
  }

  it('onDisconnected fires registered listeners', () => {
    const device = createFixtureBleDevice();
    let fired = 0;
    const unsubscribe = device.onDisconnected(() => { fired += 1; });

    device.simulateDisconnect();
    expect(fired).toBe(1);

    // Unsubscribe stops further notifications.
    unsubscribe();
    device.simulateDisconnect();
    expect(fired).toBe(1);
  });

  it('onDisconnected passthrough forwards a device drop to the runtime subscriber', () => {
    const device = createFixtureBleDevice();
    const rt = new BleRuntime(device);

    let fired = 0;
    const unsub = rt.onDisconnected(() => { fired += 1; });

    device.simulateDisconnect();
    expect(fired).toBe(1);

    // The returned unsubscribe detaches the runtime's listener (used by the
    // screen when the runtime changes across a reconnect).
    unsub();
    device.simulateDisconnect();
    expect(fired).toBe(1);
  });

  it('disconnect passthrough forwards to the device when present', async () => {
    const device = createFixtureBleDevice();
    const disconnect = jest.fn(async () => {});
    // The in-memory fixture has no transport to close; attach a disconnect so we
    // can assert BleRuntime forwards to it (RealBleDevice implements this).
    (device as any).disconnect = disconnect;
    const rt = new BleRuntime(device);

    await rt.disconnect();
    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it('disconnect passthrough resolves to a no-op when the device has none', async () => {
    const device = createFixtureBleDevice();
    const rt = new BleRuntime(device);
    // The fixture omits disconnect; the `?.()` guard must resolve, not throw.
    await expect(rt.disconnect()).resolves.toBeUndefined();
  });

  it('disconnect mid-transfer resets partial manifest state', async () => {
    const device = createFixtureBleDevice();
    const runtime = new BleRuntime(device);

    // Feed a partial ManifestChunk with NO EOF: a stale, never-completed transfer.
    device.queueIncoming(
      encodeFrame(FrameKind.ManifestChunk, 0, new Uint8Array([0xDE, 0xAD, 0xBE, 0xEF])),
    );

    // A disconnect must clear the in-flight chunk via BleRuntime.reset (wired in
    // the constructor to device.onDisconnected).
    device.simulateDisconnect();

    // Now a fresh, complete transfer arrives. If the leftover chunk had not been
    // cleared, the assembled bytes would be corrupted (4 stale bytes prepended)
    // and decode would fail / produce the wrong manifest.
    const chunkSize = 100;
    for (let i = 0; i < testManifestBytes.length; i += chunkSize) {
      device.queueIncoming(
        encodeFrame(FrameKind.ManifestChunk, 0, testManifestBytes.slice(i, i + chunkSize)),
      );
    }
    device.queueIncoming(makeEofFrame(testManifestBytes));

    const loadedManifest = await runtime.loadManifest();
    expect(loadedManifest.actions.has('relay.toggle')).toBe(true);
    expect(loadedManifest.actions.size).toBeGreaterThan(0);
  }, 10000);

  it('loadManifest rejects on timeout when no manifest arrives', async () => {
    const device = createFixtureBleDevice();
    const runtime = new BleRuntime(device);

    // No manifest queued; the short timeout must fire and reject cleanly with no
    // leaked timer.
    await expect(runtime.loadManifest(50)).rejects.toThrow(/timed out/i);
  }, 10000);
});
