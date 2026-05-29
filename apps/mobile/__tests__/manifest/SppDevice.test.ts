import { describe, expect, it, beforeEach } from '@jest/globals';
import { SppDevice, createSppDevice } from '../../src/manifest/runtime/SppDevice';
// The native facade is mapped to __mocks__/ecb-spp.ts via jest moduleNameMapper.
// SppDevice imports the production facade path; the test drives the SAME mock
// through its test-control exports (_state/_emit*/_reset), imported from the mock
// directly so tsc resolves them (the production facade has no such exports).
import { _state, _emitData, _emitDisconnected, _reset } from '../../__mocks__/ecb-spp';
// _emitData drives a native onData chunk through the shared mock singleton.

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

  it('a new SppDevice detaches the previous one from native events (no leak on reconnect)', async () => {
    const first = await createSppDevice('AA:BB:CC:DD:EE:FF');
    const firstChunks: number[][] = [];
    first.onNotify((c) => firstChunks.push(Array.from(c)));

    // Simulate reconnect: a second device is created without disconnecting the first.
    const second = await createSppDevice('AA:BB:CC:DD:EE:FF');
    const secondChunks: number[][] = [];
    second.onNotify((c) => secondChunks.push(Array.from(c)));

    // A native chunk must reach ONLY the second (current) device.
    _emitData(Buffer.from([0x10, 0x20]).toString('base64'));

    expect(secondChunks).toHaveLength(1);
    expect(firstChunks).toHaveLength(0); // the old device was detached — no double-delivery
  });
});
