import { describe, expect, it } from 'vitest';
import { normalize } from '../src/compiler/normalize.js';
import { decodeManifest, encodeManifest } from '../src/compiler/encodeProto.js';
import { MINIMAL_MANIFEST } from './fixtures/minimal.manifest.js';
import { DEMO_MANIFEST } from './fixtures/demo.manifest.js';
import { UNKNOWN_VAR_MANIFEST } from './fixtures/invalid-rule-var.js';

describe('encodeManifest', () => {
  it('encodes the minimal manifest to non-empty bytes', () => {
    const normalized = normalize(MINIMAL_MANIFEST);
    expect(normalized.capabilities.featureIdxs).toHaveLength(0);
    const bytes = encodeManifest(normalized);
    expect(bytes.byteLength).toBeGreaterThan(0);
    expect(bytes.byteLength).toBeLessThan(1024);
  });

  it('round-trips through protobufjs decode', () => {
    const decoded = decodeManifest(encodeManifest(normalize(MINIMAL_MANIFEST)));
    expect(decoded.version).toBe(5);
    expect(decoded.resources).toHaveLength(1);
    expect(decoded.nodes).toHaveLength(2);
    const strings = (decoded.strings ?? []).map((entry) => entry.value);
    expect(strings).toContain('relay.auto');
  });

  it('normalizes capability metadata from the demo fixture', () => {
    expect(normalize(DEMO_MANIFEST).capabilities.featureIdxs).toHaveLength(2);
  });

  it('throws when linting or references fail', () => {
    expect(() => normalize(UNKNOWN_VAR_MANIFEST)).toThrow(/unknown resource/);
  });
});
