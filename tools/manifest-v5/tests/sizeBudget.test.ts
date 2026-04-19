import { describe, expect, it } from 'vitest';
import { normalize } from '../src/compiler/normalize.js';
import { encodeManifest } from '../src/compiler/encodeProto.js';
import { DEMO_MANIFEST } from './fixtures/demo.manifest.js';
import { validateManifest } from '../src/validation/ajv.js';

const MAX_BYTES = 8 * 1024;

describe('manifest size budget', () => {
  it('encodes the demo fixture to <= 8 KiB', () => {
    const bytes = encodeManifest(normalize(DEMO_MANIFEST));
    if (bytes.byteLength > MAX_BYTES) {
      throw new Error(
        `demo manifest is ${bytes.byteLength} bytes, budget is ${MAX_BYTES}`,
      );
    }
    expect(bytes.byteLength).toBeLessThanOrEqual(MAX_BYTES);
  });

  it('fails when required capabilities or app version metadata are missing', () => {
    const broken = { ...DEMO_MANIFEST, minAppVersion: undefined };
    const result = validateManifest(broken as any);
    expect(result.ok).toBe(false);
  });
});
