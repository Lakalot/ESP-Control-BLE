import * as Crypto from 'expo-crypto';

export async function computeHmacResponse(
  pin: string,
  challenge: Uint8Array,
): Promise<Uint8Array> {
  const pinBytes = new TextEncoder().encode(pin);
  const combined = new Uint8Array(pinBytes.length + challenge.length);
  combined.set(pinBytes);
  combined.set(challenge, pinBytes.length);

  const hashBuffer = await Crypto.digest(
    Crypto.CryptoDigestAlgorithm.SHA256,
    combined,
  );

  return new Uint8Array(hashBuffer.slice(0, 4));
}

export function parseChallengeFrame(buffer: Uint8Array): Uint8Array {
  if (buffer.length < 5 || buffer[0] !== 0xf0) {
    throw new Error('Frame invalide: pas un challenge (attendu 0xF0 + 4 bytes nonce)');
  }
  return buffer.slice(1, 5);
}
