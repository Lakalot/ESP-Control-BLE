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
