export {};
import { encodeCommand } from '../CommandEncoder';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(`FAIL: ${message}`);
  console.log(`  PASS: ${message}`);
}

{
  const frame = encodeCommand({
    cmdId: 0x42,
    payload: Uint8Array.from([0x10, 0x20, 0x30]),
    hmacHash: Uint8Array.from([0xaa, 0xbb, 0xcc, 0xdd]),
  });

  assert(frame.length === 10, 'encoded frame length');
  assert(frame[0] === 0x42, 'cmdId encoded');
  assert(frame[1] === 0x03, 'payload length encoded');
  assert(frame[2] === 0x10 && frame[3] === 0x20 && frame[4] === 0x30, 'payload bytes encoded');
  assert(frame[5] === 0xaa && frame[8] === 0xdd, 'hmac bytes encoded');
  assert(frame[9] === 0x41, 'xor checksum encoded');
}

{
  let errorCaught = false;
  try {
    encodeCommand({
      cmdId: 0x01,
      payload: Uint8Array.from([]),
      hmacHash: Uint8Array.from([0x00, 0x01]),
    });
  } catch {
    errorCaught = true;
  }

  assert(errorCaught, 'rejects invalid HMAC length');
}

console.log('\nAll CommandEncoder tests passed.');
