import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as pb from '../../src/manifest/generated/manifest.pbjs';
import { decodeManifest } from '../../src/manifest/decode/decodeManifest';

const FIXTURE = resolve(__dirname, '..', '..', 'assets', 'manifest_demo.pb');
const V = pb.esp_control;

function buildManifestBytes(options?: { includeNavBar?: boolean; invalidNavScreenId?: number }): Uint8Array {
  const strings = [
    '',
    'widget.text',
    'home',
    'Home',
    'settings',
    'Settings',
    'home.root',
    'settings.root',
    'home.panel',
    'settings.panel',
    'Home Panel',
    'Settings Panel',
  ];

  return V.ManifestBundle.encode({
    version: 5,
    schemaVersion: 1,
    minAppVersion: '1.0.0',
    capabilities: { featureIdxs: [1] },
    strings: strings.map((value) => ({ value })),
    resources: [],
    actions: [],
    screens: [
      { id: 1, slugIdx: 2, titleIdx: 3, rootNodeId: 101 },
      { id: 2, slugIdx: 4, titleIdx: 5, rootNodeId: 102 },
    ],
    nodes: [
      { id: 101, slugIdx: 6, kind: V.NodeKind.NODE_KIND_STACK, childrenIds: [201] },
      { id: 102, slugIdx: 7, kind: V.NodeKind.NODE_KIND_STACK, childrenIds: [202] },
      {
        id: 201,
        slugIdx: 8,
        kind: V.NodeKind.NODE_KIND_WIDGET,
        widgetKind: V.WidgetKind.WIDGET_KIND_TEXT,
        titleIdx: 10,
      },
      {
        id: 202,
        slugIdx: 9,
        kind: V.NodeKind.NODE_KIND_WIDGET,
        widgetKind: V.WidgetKind.WIDGET_KIND_TEXT,
        titleIdx: 11,
      },
    ],
    appShell: options?.includeNavBar === false
      ? undefined
      : {
          navBar: {
            items: [
              { idIdx: 2, labelIdx: 3, iconIdx: 2, screenId: 1 },
              { idIdx: 4, labelIdx: 5, iconIdx: 4, screenId: options?.invalidNavScreenId ?? 2 },
            ],
          },
        },
  }).finish();
}

describe('decodeManifest', () => {
  const bytes = new Uint8Array(readFileSync(FIXTURE));
  const navBytes = buildManifestBytes();

  it('produces a RuntimeManifest with version 5', () => {
    const m = decodeManifest(bytes);
    expect(m.version).toBe(5);
  });

  it('populates resources/actions/screens/nodes with slug-keyed lookups', () => {
    const m = decodeManifest(bytes);
    expect(m.resources.size).toBeGreaterThan(0);
    expect(m.actions.size).toBeGreaterThan(0);
    expect(m.screens.size).toBeGreaterThan(0);
    expect(m.nodes.size).toBeGreaterThan(0);
    const firstScreen = m.screens.values().next().value!;
    expect(m.nodes.has(firstScreen.rootNodeSlug)).toBe(true);
  });

  it('projects binding ids back to slugs on widget nodes', () => {
    const m = decodeManifest(bytes);
    const widget = Array.from(m.nodes.values()).find((n) => n.kind === 'widget' && n.bind?.resource);
    expect(widget).toBeDefined();
    if (widget && widget.kind === 'widget' && widget.bind?.resource) {
      expect(m.resources.has(widget.bind.resource)).toBe(true);
    }
  });

  it('decodes the demo fixture using the expected v5 widget kinds and screen slug', () => {
    const m = decodeManifest(bytes);

    expect(m.screens.has('home')).toBe(true);

    const banner = m.nodes.get('home.banner');
    expect(banner?.kind).toBe('widget');
    if (banner?.kind === 'widget') {
      expect(banner.widget).toBe('text');
    }

    const toggle = m.nodes.get('lighting.toggle');
    expect(toggle?.kind).toBe('widget');
    if (toggle?.kind === 'widget') {
      expect(toggle.widget).toBe('toggle');
    }

    const slider = m.nodes.get('lighting.slider');
    expect(slider?.kind).toBe('widget');
    if (slider?.kind === 'widget') {
      expect(slider.widget).toBe('slider');
    }

    const select = m.nodes.get('telemetry.profile');
    expect(select?.kind).toBe('widget');
    if (select?.kind === 'widget') {
      expect(select.widget).toBe('select');
    }
  });

  it('throws on truncated bytes', () => {
    const truncated = bytes.slice(0, Math.min(4, bytes.length));
    expect(() => decodeManifest(truncated)).toThrow();
  });

  it('decodes navBar items into runtime appShell state', () => {
    const m = decodeManifest(navBytes);

    expect(m.appShell?.navBar?.items[0]).toMatchObject({
      id: 'home',
      label: 'Home',
      icon: 'home',
      screenSlug: 'home',
    });
    expect(m.appShell?.navBar?.items[1]).toMatchObject({
      id: 'settings',
      label: 'Settings',
      icon: 'settings',
      screenSlug: 'settings',
    });
  });

  it('leaves appShell undefined when the manifest has no navBar', () => {
    const m = decodeManifest(buildManifestBytes({ includeNavBar: false }));

    expect(m.appShell).toBeUndefined();
  });

  it('rejects nav items that reference unknown screens', () => {
    expect(() => decodeManifest(buildManifestBytes({ invalidNavScreenId: 999 }))).toThrow(
      /nav item 'settings' has unknown screenId/i,
    );
  });

  it('rejects manifests with unsupported schemaVersion', () => {
    const invalid = V.ManifestBundle.encode({
      version: 5,
      schemaVersion: 2,
      minAppVersion: '1.0.0',
      strings: [{ value: '' }],
      resources: [],
      actions: [],
      screens: [],
      nodes: [],
    }).finish();

    expect(() => decodeManifest(invalid)).toThrow(/schema/i);
  });
});
