import { describe, expect, it } from 'vitest';
import { Value } from '@sinclair/typebox/value';
import { ManifestSpec } from '../src/schema/manifest.js';
import { MINIMAL_MANIFEST } from './fixtures/minimal.manifest.js';

describe('ManifestSpec', () => {
  it('accepts the minimal fixture', () => {
    expect(Value.Check(ManifestSpec, MINIMAL_MANIFEST)).toBe(true);
  });

  it('rejects the wrong version', () => {
    expect(Value.Check(ManifestSpec, { ...MINIMAL_MANIFEST, version: 4 })).toBe(false);       
  });

  it('rejects extra root properties', () => {
    expect(
      Value.Check(ManifestSpec, { ...MINIMAL_MANIFEST, rogue: true } as unknown),
    ).toBe(false);
  });
});
