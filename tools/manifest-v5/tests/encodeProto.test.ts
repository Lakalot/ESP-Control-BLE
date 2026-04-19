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

  it('round-trips frozen widget kinds on the wire', () => {
    const decoded = decodeManifest(encodeManifest(normalize(DEMO_MANIFEST)));
    const widgetKinds = (decoded.nodes ?? [])
      .filter((node) => String(node.kind) === 'NODE_KIND_WIDGET')
      .map((node) => String(node.widgetKind));

    expect(widgetKinds).toContain('WIDGET_KIND_BUTTON');
    expect(widgetKinds).toContain('WIDGET_KIND_SLIDER');
    expect(widgetKinds).toContain('WIDGET_KIND_STAT');
    expect(widgetKinds).not.toContain('WIDGET_KIND_ACTION');
    expect(widgetKinds).not.toContain('WIDGET_KIND_RANGE');
    expect(widgetKinds).not.toContain('WIDGET_KIND_READ_ONLY');
  });

  it('round-trips the remaining frozen widget kinds on the wire', () => {
    const manifest = {
      version: 5,
      schemaVersion: 1,
      minAppVersion: '1.0.0',
      capabilities: { required: [], optional: [] },
      resources: [],
      actions: [],
      screens: [],
      nodes: [
        { id: 'w.text_input', kind: 'widget', widget: 'text_input' },
        { id: 'w.badge', kind: 'widget', widget: 'badge' },
        { id: 'w.progress', kind: 'widget', widget: 'progress' },
        { id: 'w.timer', kind: 'widget', widget: 'timer' },
      ],
    } as Parameters<typeof normalize>[0];
    const decoded = decodeManifest(encodeManifest(normalize(manifest)));
    const widgetKinds = (decoded.nodes ?? [])
      .filter((node) => String(node.kind) === 'NODE_KIND_WIDGET')
      .map((node) => String(node.widgetKind));

    expect(widgetKinds).toEqual(
      expect.arrayContaining([
        'WIDGET_KIND_TEXT_INPUT',
        'WIDGET_KIND_BADGE',
        'WIDGET_KIND_PROGRESS',
        'WIDGET_KIND_TIMER',
      ]),
    );
  });

  it('preserves schema metadata on the wire', () => {
    const decoded = decodeManifest(encodeManifest(normalize(DEMO_MANIFEST)));
    expect(decoded.schemaVersion).toBe(1);
    expect(decoded.minAppVersion).toBe('1.0.0');
  });

  it('throws when linting or references fail', () => {
    expect(() => normalize(UNKNOWN_VAR_MANIFEST)).toThrow(/unknown resource/);
  });
});
