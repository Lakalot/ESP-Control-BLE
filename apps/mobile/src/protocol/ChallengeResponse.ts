import * as Crypto from 'expo-crypto';

export async function computeHmacResponse(
  pin: string,
  challenge: Uint8Array,
): Promise<Uint8Array> {
  const pinBytes = new TextEncoder().encode(pin);
  const combined = new Uint8Array(pinBytes.length + challenge.length);
  combined.set(pinBytes);
  combined.set(challenge, pinBytes.length);

  const hashHex = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    Array.from(combined)
      .map((b) => String.fromCharCode(b))
      .join(''),
    { encoding: Crypto.CryptoEncoding.HEX },
  );

  const result = new Uint8Array(4);
  for (let i = 0; i < 4; i++) {
    result[i] = parseInt(hashHex.slice(i * 2, i * 2 + 2), 16);
  }
  return result;
}

export function parseChallengeFrame(buffer: Uint8Array): Uint8Array {
  if (buffer.length < 5 || buffer[0] !== 0xf0) {
    throw new Error('Frame invalide: pas un challenge (attendu 0xF0 + 4 bytes nonce)');
  }
  return buffer.slice(1, 5);
}
