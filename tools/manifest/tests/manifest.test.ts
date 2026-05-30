import { describe, expect, it } from 'vitest';
import { Value } from '@sinclair/typebox/value';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { loadYamlManifest } from '../src/authoring/loadYamlManifest.js';
import { expandAuthoringManifest } from '../src/authoring/expand.js';
import { ManifestSpec } from '../src/schema/manifest.js';
import { normalize } from '../src/compiler/normalize.js';
import { validateManifest } from '../src/validation/ajv.js';

const HERE = fileURLToPath(new URL('.', import.meta.url));

function loadExpandedAuthoringFixture(name: string) {
  const loaded = loadYamlManifest(join(HERE, 'fixtures', name));

  expect(loaded.ok).toBe(true);

  if (!loaded.ok) {
    throw new Error(`expected YAML fixture '${name}' to load`);
  }

  return expandAuthoringManifest(loaded.value);
}

function loadCanonicalYamlFixture(name: string) {
  return YAML.parse(readFileSync(join(HERE, 'fixtures', name), 'utf8'));
}

const MINIMAL_MANIFEST = loadExpandedAuthoringFixture('minimal.manifest.yaml');
const NAV_MANIFEST = loadCanonicalYamlFixture('nav.manifest.yaml');
const FULL_SURFACE_MANIFEST = loadExpandedAuthoringFixture('full-surface.manifest.yaml');

describe('ManifestSpec', () => {
  it('accepts the minimal fixture', () => {
    expect(Value.Check(ManifestSpec, MINIMAL_MANIFEST)).toBe(true);
  });

  it('accepts expanded YAML authoring manifests and normalizes them', () => {
    const loaded = loadYamlManifest(join(HERE, 'fixtures', 'minimal.manifest.yaml'));

    expect(loaded.ok).toBe(true);

    if (!loaded.ok) {
      throw new Error('expected YAML fixture to load');
    }

    const expanded = expandAuthoringManifest(loaded.value);

    expect(Value.Check(ManifestSpec, expanded)).toBe(true);
    expect(normalize(expanded)).toMatchObject({
      screens: [
        {
          rootNodeId: 1,
        },
      ],
      nodes: [
        {
          kind: 1,
          childrenIds: [2],
        },
        {
          kind: 5,
          widgetKind: 3,
        },
      ],
    });
  });

  it('accepts the full-surface authored YAML fixture as canonical output', () => {
    expect(Value.Check(ManifestSpec, FULL_SURFACE_MANIFEST)).toBe(true);
  });

  it('normalizes the full-surface authored YAML fixture', () => {
    expect(normalize(FULL_SURFACE_MANIFEST)).toMatchObject({
      appShell: {
        navBarItems: [
          { screenId: expect.any(Number) },
          { screenId: expect.any(Number) },
          { screenId: expect.any(Number) },
        ],
      },
      screens: [
        { rootNodeId: expect.any(Number), entryRules: [{ jsonlogic: '{"var":"resource.relay.auto"}' }] },
        {
          rootNodeId: expect.any(Number),
          entryRules: [{ jsonlogic: '{"==":[{"var":"resource.fan.profile"},"normal"]}' }],
        },
        { rootNodeId: expect.any(Number), entryRules: [] },
      ],
      nodes: expect.arrayContaining([
        expect.objectContaining({ kind: 1, childrenIds: expect.any(Array) }),
        expect.objectContaining({ kind: 2, childrenIds: expect.any(Array) }),
        expect.objectContaining({ kind: 4, childrenIds: expect.any(Array) }),
        expect.objectContaining({ kind: 5, widgetKind: 1, textIdx: expect.any(Number) }),
        expect.objectContaining({ kind: 5, widgetKind: 2, formatHintIdx: expect.any(Number) }),
        expect.objectContaining({ kind: 5, widgetKind: 3, bind: expect.objectContaining({ resourceId: expect.any(Number), actionId: expect.any(Number) }) }),
        expect.objectContaining({ kind: 5, widgetKind: 4, bind: expect.objectContaining({ actionId: expect.any(Number) }) }),
        expect.objectContaining({ kind: 5, widgetKind: 5, formatHintIdx: expect.any(Number) }),
        expect.objectContaining({ kind: 5, widgetKind: 6, bind: expect.objectContaining({ resourceId: expect.any(Number), actionId: expect.any(Number) }) }),
        expect.objectContaining({ kind: 5, widgetKind: 7, bind: expect.objectContaining({ resourceId: expect.any(Number), actionId: expect.any(Number) }) }),
        expect.objectContaining({ kind: 5, widgetKind: 8, bind: expect.objectContaining({ resourceId: expect.any(Number) }) }),
        expect.objectContaining({ kind: 5, widgetKind: 10, bind: expect.objectContaining({ resourceId: expect.any(Number) }) }),
      ]),
    });
  });

  it('accepts appShell.navBar with up to 5 items', () => {
    expect(Value.Check(ManifestSpec, NAV_MANIFEST)).toBe(true);
  });

  it('rejects navBar with more than 5 items', () => {
    const invalid = {
      ...NAV_MANIFEST,
      appShell: {
        navBar: {
          items: [
            ...NAV_MANIFEST.appShell!.navBar!.items,
            { id: 'stats', label: 'Stats', icon: 'bar-chart', viewId: 'home' },
            { id: 'history', label: 'History', icon: 'clock', viewId: 'home' },
            { id: 'settings', label: 'Settings', icon: 'settings', viewId: 'home' },
            { id: 'alerts', label: 'Alerts', icon: 'bell', viewId: 'home' },
            { id: 'extra', label: 'Extra', icon: 'circle', viewId: 'home' },
          ],
        },
      },
    };

    expect(Value.Check(ManifestSpec, invalid)).toBe(false);
  });

  it('normalizes views onto wire screens and preserves nav metadata', () => {
    expect(normalize(NAV_MANIFEST)).toMatchObject({
      appShell: {
        navBarItems: [{ screenId: 1 }],
      },
      screens: [
        {
          id: 1,
          rootNodeId: 1,
        },
      ],
    });
  });

  it('rejects navBar items that reference an unknown view', () => {
    const invalid = {
      ...NAV_MANIFEST,
      appShell: {
        navBar: {
          items: [{ id: 'ghost', label: 'Ghost', icon: 'ghost', viewId: 'missing' }],
        },
      },
    };

    expect(() => normalize(invalid)).toThrow(
      "navBar item 'ghost' references unknown viewId 'missing'",
    );
  });

  it('rejects duplicate view ids', () => {
    const result = validateManifest({
      ...MINIMAL_MANIFEST,
      views: [...MINIMAL_MANIFEST.views, { ...MINIMAL_MANIFEST.views[0] }],
    });

    expect(result).toMatchObject({
      ok: false,
      errors: expect.arrayContaining([
        expect.objectContaining({ message: "duplicate id 'home' in views" }),
      ]),
    });
  });

  it('rejects duplicate view firmware symbols', () => {
    const result = validateManifest({
      ...MINIMAL_MANIFEST,
      views: [
        ...MINIMAL_MANIFEST.views,
        {
          ...MINIMAL_MANIFEST.views[0],
          id: 'status',
          title: 'Status',
        },
      ],
    });

    expect(result).toMatchObject({
      ok: false,
      errors: expect.arrayContaining([
        expect.objectContaining({
          message: "duplicate firmwareSymbol 'home_screen' in views",
        }),
      ]),
    });
  });

  it('rejects the wrong version', () => {
    expect(Value.Check(ManifestSpec, { ...MINIMAL_MANIFEST, version: 4 })).toBe(false);       
  });

  it('rejects extra root properties', () => {
    expect(
      Value.Check(ManifestSpec, { ...MINIMAL_MANIFEST, rogue: true } as unknown),
    ).toBe(false);
  });

  it('requires strict compatibility metadata and the closed widget catalog', () => {
    expect(
      Value.Check(ManifestSpec, {
        version: 5,
        schemaVersion: 1,
        minAppVersion: '1.0.0',
        capabilities: { required: ['widget.timer'], optional: [] },
        resources: [],
        actions: [],
        views: [],
        nodes: [
          {
            id: 'home.timer',
            firmwareSymbol: 'home_timer',
            kind: 'widget',
            widget: 'timer',
            bind: { resource: 'timer.remaining' },
          },
          {
            id: 'home.input',
            firmwareSymbol: 'home_input',
            kind: 'widget',
            widget: 'text_input',
            bind: { action: 'timer.start' },
          },
        ],
      }),
    ).toBe(true);
  });
});
