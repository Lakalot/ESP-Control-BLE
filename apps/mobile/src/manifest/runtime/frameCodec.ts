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

export interface DecodedFrame { kind: FrameKind; flags: number; body: Uint8Array; }

export function encodeFrame(kind: FrameKind, flags: number, body: Uint8Array): Uint8Array {
  if (body.length > 0xFFFF) throw new Error('frame body too large');
  const out = new Uint8Array(4 + body.length);
  out[0] = kind; out[1] = flags & 0xFF;
  out[2] = (body.length >> 8) & 0xFF;
  out[3] = body.length & 0xFF;
  out.set(body, 4);
  return out;
}

export function decodeFrames(buf: Uint8Array): { frames: DecodedFrame[]; leftover: Uint8Array } {
  const frames: DecodedFrame[] = [];
  let i = 0;
  while (i + 4 <= buf.length) {
    const len = (buf[i + 2] << 8) | buf[i + 3];
    if (i + 4 + len > buf.length) break;
    frames.push({
      kind: buf[i] as FrameKind,
      flags: buf[i + 1],
      body: buf.slice(i + 4, i + 4 + len),
    });
    i += 4 + len;
  }
  return { frames, leftover: buf.slice(i) };
}
