import { useCallback } from 'react';

import { computeHmacResponse } from '../protocol/auth/ChallengeResponse';
import { encodeCommand } from '../protocol/frame/CommandEncoder';
import { parseManifest } from '../protocol/manifest/ManifestParser';
import { useDeviceStore } from '../store/deviceStore';
import { bleConnection } from '../transport/BleConnection';
import { bleNotifyHandler } from '../transport/BleNotifyHandler';
import type { IBleTransport } from '../transport/IBleTransport';
import { ResponseStatus } from '../types/protocol.types';

const COMMAND_TIMEOUT_MS = 5000;
const MANIFEST_FLAG_CHUNKED = 0x01;
const MANIFEST_CHUNK_CMD_ID = 0xfe;
const MANIFEST_METADATA_LENGTH = 5;

function isChunkedEnvelope(buffer: Uint8Array): boolean {
  return buffer.length >= MANIFEST_METADATA_LENGTH && (buffer[1] & MANIFEST_FLAG_CHUNKED) !== 0;
}

function parseEnvelope(buffer: Uint8Array): { totalLength: number; chunkSize: number } {
  const totalLength = (buffer[2] << 8) | buffer[3];
  const chunkSize = buffer[4];
  if (totalLength <= 0) throw new Error('Manifest total length is invalid');
  if (chunkSize <= 0) throw new Error('Manifest chunk size is invalid');
  return { totalLength, chunkSize };
}

function fetchChunk(
  transport: IBleTransport,
  pin: string,
  offset: number,
  requestedLength: number,
): Promise<Uint8Array> {
  return new Promise<Uint8Array>((resolve, reject) => {
    let settled = false;

    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      unsubscribe();
      callback();
    };

    const timeout = setTimeout(() => {
      finish(() => reject(new Error(`Manifest chunk timeout at offset ${offset}`)));
    }, COMMAND_TIMEOUT_MS);

    const unsubscribe = bleNotifyHandler.onResponseFrame((cmdId, status, payload) => {
      if (settled || cmdId !== MANIFEST_CHUNK_CMD_ID) return;

      if (status !== ResponseStatus.OK) {
        finish(() =>
          reject(new Error(`Manifest chunk failed at offset ${offset}, status=${status}`)),
        );
        return;
      }

      finish(() => resolve(payload));
    });

    void (async () => {
      try {
        const hmac = await computeHmacResponse(pin, new Uint8Array([MANIFEST_CHUNK_CMD_ID]));
        const payload = new Uint8Array([
          (offset >> 8) & 0xff,
          offset & 0xff,
          requestedLength & 0xff,
        ]);
        const frame = encodeCommand({ cmdId: MANIFEST_CHUNK_CMD_ID, payload, hmacHash: hmac });
        await transport.writeCommand(frame);
      } catch (error) {
        finish(() => reject(error instanceof Error ? error : new Error(String(error))));
      }
    })();
  });
}

export function useBleManifest(transport: IBleTransport = bleConnection) {
  const setManifest = useDeviceStore((state) => state.setManifest);

  const fetchManifest = useCallback(
    async (pin: string) => {
      const rawEnvelope = await transport.readManifest();

      let manifestBytes: Uint8Array;
      if (isChunkedEnvelope(rawEnvelope)) {
        const { totalLength, chunkSize } = parseEnvelope(rawEnvelope);
        manifestBytes = new Uint8Array(totalLength);

        for (let offset = 0; offset < totalLength; offset += chunkSize) {
          const expectedLength = Math.min(chunkSize, totalLength - offset);
          const chunk = await fetchChunk(transport, pin, offset, expectedLength);
          if (chunk.length !== expectedLength) {
            throw new Error(
              `Manifest chunk size mismatch at offset ${offset}: expected ${expectedLength}, got ${chunk.length}`,
            );
          }
          manifestBytes.set(chunk, offset);
        }
      } else {
        manifestBytes = rawEnvelope;
      }

      const manifest = parseManifest(manifestBytes);
      setManifest(manifest);
    },
    [setManifest, transport],
  );

  return { fetchManifest };
}
