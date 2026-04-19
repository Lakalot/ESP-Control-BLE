import { describe, expect, it } from 'vitest';
import { validateManifest } from '../src/validation/ajv.js';
import { MINIMAL_MANIFEST } from './fixtures/minimal.manifest.js';
import { DUPLICATE_RESOURCE_ID_MANIFEST } from './fixtures/invalid-duplicate-id.js';

describe('validateManifest', () => {
  it('returns ok=true for the minimal fixture', () => {
    expect(validateManifest(MINIMAL_MANIFEST)).toEqual({ ok: true });
  });

  it('returns a readable structural error', () => {
    const result = validateManifest({ ...MINIMAL_MANIFEST, version: 4 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]).toMatchObject({
        path: '/version',
      });
    }
  });

  it('reports duplicate resource ids', () => {
    const result = validateManifest(DUPLICATE_RESOURCE_ID_MANIFEST);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.message.includes("duplicate id 'relay.auto'"))).toBe(
        true,
      );
    }
  });
});
