import { CommandFrame } from '../../types/protocol.types';

function xorChecksum(bytes: Uint8Array): number {
  return bytes.reduce((acc, b) => acc ^ b, 0);
}

export function encodeCommand(frame: CommandFrame): Uint8Array {
  const { cmdId, payload, hmacHash } = frame;

  if (hmacHash.length !== 4) {
    throw new Error('hmacHash doit faire exactement 4 bytes');
  }

  const totalLen = 1 + 1 + payload.length + 4 + 1;
  const buf = new Uint8Array(totalLen);
  let offset = 0;

  buf[offset++] = cmdId;
  buf[offset++] = payload.length;
  buf.set(payload, offset);
  offset += payload.length;
  buf.set(hmacHash, offset);
  offset += 4;

  buf[offset] = xorChecksum(buf.slice(0, offset));

  return buf;
}
