/**
 * Jest mock for expo-crypto — backed by Node's built-in `crypto` module so
 * tests run real SHA-256 (not a stub) without requiring native Expo modules.
 *
 * Mapped via `moduleNameMapper` in jest.config.js:
 *   "^expo-crypto$" -> "<rootDir>/__mocks__/expo-crypto.ts"
 */
import { createHash } from 'crypto';

export enum CryptoDigestAlgorithm {
  SHA1 = 'SHA-1',
  SHA256 = 'SHA-256',
  SHA384 = 'SHA-384',
  SHA512 = 'SHA-512',
  MD5 = 'MD5',
}

const ALGO_MAP: Record<CryptoDigestAlgorithm, string> = {
  [CryptoDigestAlgorithm.SHA1]: 'sha1',
  [CryptoDigestAlgorithm.SHA256]: 'sha256',
  [CryptoDigestAlgorithm.SHA384]: 'sha384',
  [CryptoDigestAlgorithm.SHA512]: 'sha512',
  [CryptoDigestAlgorithm.MD5]: 'md5',
};

export async function digest(
  algorithm: CryptoDigestAlgorithm,
  data: Uint8Array,
): Promise<ArrayBuffer> {
  const nodeAlgo = ALGO_MAP[algorithm] ?? 'sha256';
  const h = createHash(nodeAlgo).update(Buffer.from(data)).digest();
  return h.buffer.slice(h.byteOffset, h.byteOffset + h.byteLength) as ArrayBuffer;
}

export function getRandomBytes(byteCount: number): Uint8Array {
  const buf = Buffer.alloc(byteCount);
  require('crypto').randomFillSync(buf);
  return new Uint8Array(buf);
}

export async function getRandomBytesAsync(byteCount: number): Promise<Uint8Array> {
  return getRandomBytes(byteCount);
}
