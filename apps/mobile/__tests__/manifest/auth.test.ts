import { describe, expect, it } from '@jest/globals';
import { computeAuthResponse } from '../../src/manifest/runtime/auth';

// Same vector asserted in the firmware test_auth_handler suite.
const EXPECTED_HEX = 'bcb08518d2967e375f573d7e3a644974';

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

describe('computeAuthResponse', () => {
  it('computes SHA-256(pin || nonce) truncated to 16 bytes', async () => {
    const nonce = new Uint8Array(16).map((_, i) => i + 1); // 0x01..0x10
    const out = await computeAuthResponse('1234', nonce);
    expect(out).toHaveLength(16);
    expect(toHex(out)).toBe(EXPECTED_HEX);
  });
});
