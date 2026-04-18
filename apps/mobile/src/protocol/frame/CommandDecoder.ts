import { ResponseFrame, ResponseStatus } from '../../types/protocol.types';

export class DecodeError extends Error {
  constructor(message: string) {
    super(`CommandDecoder: ${message}`);
  }
}

export function decodeResponse(buffer: Uint8Array): ResponseFrame {
  if (buffer.length < 3) {
    throw new DecodeError('Buffer trop court (< 3 bytes)');
  }

  const cmdId = buffer[0];
  const status = buffer[1] as ResponseStatus;
  const length = buffer[2];

  if (buffer.length < 3 + length) {
    throw new DecodeError(`Payload tronqué: attendu ${length} bytes, reçu ${buffer.length - 3}`);
  }

  const payload = buffer.slice(3, 3 + length);

  return { cmdId, status, payload };
}
