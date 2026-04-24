import { describe, expect, it } from 'vitest';
import { Value } from '@sinclair/typebox/value';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { loadYamlManifest } from '../src/authoring/loadYamlManifest.js';
import { expandAuthoringManifest } from '../src/authoring/expand.js';
import { loadManifestSource } from '../src/cli/loadSource.js';
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

function loadLegacyJsonFixture(name: string) {
  return JSON.parse(readFileSync(join(HERE, 'fixtures', name), 'utf8'));
}

function comparableNormalized(manifest: ReturnType<typeof normalize>) {
  const strings = manifest.strings;
  const stringAt = (index: number) => (index === 0 ? null : strings[index] ?? null);
  const resourcesById = new Map(manifest.resources.map((resource) => [resource.id, resource]));
  const actionsById = new Map(manifest.actions.map((action) => [action.id, action]));
  const nodesById = new Map(manifest.nodes.map((node) => [node.id, node]));
  const screensById = new Map(manifest.screens.map((screen) => [screen.id, screen]));
  const screenSlugById = new Map(manifest.screens.map((screen) => [screen.id, stringAt(screen.slugIdx)]));
  const nodeSlugById = new Map(manifest.nodes.map((node) => [node.id, stringAt(node.slugIdx)]));

  return {
    version: manifest.version,
    schemaVersion: manifest.schemaVersion,
    minAppVersion: manifest.minAppVersion,
    capabilities: [...manifest.capabilities.featureIdxs.map((idx) => stringAt(idx))].sort(),
    appShell: manifest.appShell
      ? {
          navBarItems: [...manifest.appShell.navBarItems]
            .map((item) => ({
              id: stringAt(item.idIdx),
              label: stringAt(item.labelIdx),
              icon: stringAt(item.iconIdx),
              screen: screenSlugById.get(item.screenId) ?? null,
            }))
            .sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right))),
        }
      : null,
    resources: [...manifest.resources]
      .map((resource) => ({
        slug: stringAt(resource.slugIdx),
        label: stringAt(resource.labelIdx),
        unit: stringAt(resource.unitIdx),
        valueType: resource.valueType,
        readMode: resource.readMode,
        staleAfterMs: resource.staleAfterMs,
        pollMs: resource.pollMs,
        enumValues: resource.enumValueIdxs.map((idx) => stringAt(idx)),
      }))
      .sort((left, right) => String(left.slug).localeCompare(String(right.slug))),
    actions: [...manifest.actions]
      .map((action) => ({
        slug: stringAt(action.slugIdx),
        label: stringAt(action.labelIdx),
        dangerLevel: action.dangerLevel,
        confirm: stringAt(action.confirmIdx),
        cooldownMs: action.cooldownMs,
        inputSchema: stringAt(action.inputSchemaIdx),
        resultSchema: stringAt(action.resultSchemaIdx),
      }))
      .sort((left, right) => String(left.slug).localeCompare(String(right.slug))),
    screens: [...manifest.screens]
      .map((screen) => ({
        slug: stringAt(screen.slugIdx),
        title: stringAt(screen.titleIdx),
        routeKey: stringAt(screen.routeKeyIdx),
        rootNode: nodeSlugById.get(screen.rootNodeId) ?? null,
        entryRules: screen.entryRules.map((rule) => rule.jsonlogic),
      }))
      .sort((left, right) => String(left.slug).localeCompare(String(right.slug))),
    nodes: [...manifest.nodes]
      .map((node) => ({
        slug: stringAt(node.slugIdx),
        kind: node.kind,
        widgetKind: node.widgetKind,
        title: stringAt(node.titleIdx),
        tone: stringAt(node.toneIdx),
        children: node.childrenIds.map((childId) => nodeSlugById.get(childId) ?? null),
        columns: node.columns,
        bind: {
          resource: node.bind.resourceId === 0 ? null : stringAt(resourcesById.get(node.bind.resourceId)?.slugIdx ?? 0),
          action: node.bind.actionId === 0 ? null : stringAt(actionsById.get(node.bind.actionId)?.slugIdx ?? 0),
        },
        visibleIf: node.visibleIf?.jsonlogic ?? null,
        enabledIf: node.enabledIf?.jsonlogic ?? null,
        text: stringAt(node.textIdx),
        formatHint: stringAt(node.formatHintIdx),
      }))
      .sort((left, right) => String(left.slug).localeCompare(String(right.slug))),
  };
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

  it('keeps the real migrated firmware YAML views aligned to the deleted JSON shape', () => {
    const loaded = loadYamlManifest(join(HERE, '..', '..', '..', 'firmware', 'esp32', 'src', 'manifest.yaml'));

    expect(loaded.ok).toBe(true);

    if (!loaded.ok) {
      throw new Error('expected real firmware YAML manifest to load');
    }

    expect((loaded.value as any).views).toEqual([
      expect.not.objectContaining({ routeKey: expect.anything() }),
      expect.not.objectContaining({ routeKey: expect.anything() }),
      expect.not.objectContaining({ routeKey: expect.anything() }),
    ]);
    expect((loaded.value as any).views).toEqual([
      expect.not.objectContaining({ entryRules: expect.anything() }),
      expect.not.objectContaining({ entryRules: expect.anything() }),
      expect.not.objectContaining({ entryRules: expect.anything() }),
    ]);
  });

  it('normalizes the real migrated firmware YAML manifest to the same legacy JSON baseline shape', async () => {
    const authoredYaml = await loadManifestSource(
      join(HERE, '..', '..', '..', 'firmware', 'esp32', 'src', 'manifest.yaml'),
    );
    const legacyJson = loadLegacyJsonFixture('full-surface.manifest.json');
    const legacyRealBaseline = {
      ...legacyJson,
      views: legacyJson.views.map(({ routeKey: _routeKey, entryRules: _entryRules, ...view }: any) => view),
    };

    expect(comparableNormalized(normalize(authoredYaml as never))).toEqual(
      comparableNormalized(normalize(legacyRealBaseline as never)),
    );
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
