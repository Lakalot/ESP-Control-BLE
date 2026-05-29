import * as Crypto from 'expo-crypto';

/**
 * Compute the in-band auth response: SHA-256(pin || nonce) truncated to the
 * first 16 bytes. Mirrors the firmware AuthHandler (ECB_HASH_SIZE = 16).
 */
export async function computeAuthResponse(pin: string, nonce: Uint8Array): Promise<Uint8Array> {
  const pinBytes = new TextEncoder().encode(pin);
  const combined = new Uint8Array(pinBytes.length + nonce.length);
  combined.set(pinBytes, 0);
  combined.set(nonce, pinBytes.length);

  const hashBuffer = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, combined);
  return new Uint8Array(hashBuffer).slice(0, 16);
}
