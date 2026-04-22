import { describe, expect, it } from '@jest/globals';
import { BleFrameStream } from '../../src/manifest/runtime/bleFrameStream';
import { encodeFrame, FrameKind } from '../../src/manifest/runtime/frameCodec';

describe('BleFrameStream', () => {
  it('reassembles a frame split across two BLE notifications', () => {
    const stream = new BleFrameStream();
    const frame = encodeFrame(FrameKind.Snapshot, 0, new Uint8Array([1, 2, 3, 4]));
    const out: { kind: FrameKind; body: Uint8Array }[] = [];
    stream.onFrame((f) => out.push({ kind: f.kind, body: f.body }));
    stream.feed(frame.slice(0, 3));
    stream.feed(frame.slice(3));
    expect(out).toHaveLength(1);
    expect(out[0].kind).toBe(FrameKind.Snapshot);
    expect(Array.from(out[0].body)).toEqual([1, 2, 3, 4]);
  });
});
