export {};
import { DecodeError, decodeResponse } from '../CommandDecoder';
import { ResponseStatus } from '../../../types/protocol.types';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(`FAIL: ${message}`);
  console.log(`  PASS: ${message}`);
}

{
  const frame = decodeResponse(
    Uint8Array.from([0x42, ResponseStatus.OK, 0x03, 0x10, 0x20, 0x30]),
  );

  assert(frame.cmdId === 0x42, 'cmdId decoded');
  assert(frame.status === ResponseStatus.OK, 'status decoded');
  assert(frame.payload.length === 3, 'payload length decoded');
  assert(frame.payload[0] === 0x10 && frame.payload[2] === 0x30, 'payload bytes decoded');
}

{
  let truncatedError: unknown;
  try {
    decodeResponse(Uint8Array.from([0x42, ResponseStatus.OK, 0x04, 0x10, 0x20]));
  } catch (error) {
    truncatedError = error;
  }

  assert(truncatedError instanceof DecodeError, 'truncated payload throws DecodeError');
}

{
  let shortError: unknown;
  try {
    decodeResponse(Uint8Array.from([0x42, ResponseStatus.OK]));
  } catch (error) {
    shortError = error;
  }

  assert(shortError instanceof DecodeError, 'short frame throws DecodeError');
}

console.log('\nAll CommandDecoder tests passed.');
