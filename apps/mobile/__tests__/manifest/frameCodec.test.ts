import { describe, expect, it } from '@jest/globals';
import { encodeFrame, decodeFrames, FrameKind } from '../../src/manifest/runtime/frameCodec';

describe('frameCodec', () => {
  it('encodes kind/flags/length header in big-endian', () => {
    const body = new Uint8Array([0xAA, 0xBB]);
    const out = encodeFrame(FrameKind.InvokeAction, 0, body);
    expect(out).toEqual(new Uint8Array([0x20, 0x00, 0x00, 0x02, 0xAA, 0xBB]));
  });

  it('decodeFrames yields complete frames and keeps the rest in the buffer', () => {
    const f1 = encodeFrame(FrameKind.Ping, 0, new Uint8Array());
    const f2 = encodeFrame(FrameKind.Pong, 0, new Uint8Array());
    const stream = new Uint8Array([...f1, ...f2.slice(0, 3)]);  // f2 truncated
    const { frames, leftover } = decodeFrames(stream);
    expect(frames).toHaveLength(1);
    expect(frames[0].kind).toBe(FrameKind.Ping);
    expect(leftover.length).toBe(3);
  });
});
