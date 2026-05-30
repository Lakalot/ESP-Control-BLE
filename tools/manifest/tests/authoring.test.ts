import { describe, expect, it } from 'vitest';
import { Value } from '@sinclair/typebox/value';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { AuthoringManifestSpec } from '../src/authoring/schema.js';
import { ManifestSpec } from '../src/schema/manifest.js';
import { loadYamlManifest } from '../src/authoring/loadYamlManifest.js';
import { expandAuthoringManifest } from '../src/authoring/expand.js';
import { loadManifestSource } from '../src/cli/loadSource.js';
import { runCli } from '../src/cli/main.js';

const HERE = fileURLToPath(new URL('.', import.meta.url));

describe('loadYamlManifest', () => {
  it('parses a minimal YAML manifest fixture', () => {
    const result = loadYamlManifest(join(HERE, 'fixtures', 'minimal.manifest.yaml'));

    expect(result).toMatchObject({
      ok: true,
      value: {
        views: [{ id: 'home' }],
      },
    });
  });

  it('parses a minimal YML authoring fixture', () => {
    const result = loadYamlManifest(join(HERE, 'fixtures', 'minimal.manifest.yml'));

    expect(result).toMatchObject({
      ok: true,
      value: {
        views: [
          {
            id: 'home',
            content: [{ id: 'home.toggle' }],
          },
        ],
      },
    });
  });

  it('returns source-path diagnostics for invalid YAML', () => {
    const result = loadYamlManifest(join(HERE, 'fixtures', 'invalid-yaml.manifest.yaml'));

    expect(result).toMatchObject({ ok: false });
    expect(result.ok).toBe(false);

    if (result.ok) {
      throw new Error('expected YAML parse failure');
    }

    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: expect.stringContaining('invalid-yaml.manifest.yaml'),
          message: expect.any(String),
        }),
      ]),
    );
  });

  it('returns all YAML parser diagnostics', () => {
    const result = loadYamlManifest(join(HERE, 'fixtures', 'multi-error.manifest.yaml'));

    expect(result).toMatchObject({ ok: false });
    expect(result.ok).toBe(false);

    if (result.ok) {
      throw new Error('expected YAML parse failure');
    }

    expect(result.errors.length).toBeGreaterThan(1);
    expect(result.errors.every((error) => error.path.includes('multi-error.manifest.yaml'))).toBe(true);
  });

  it('rejects a non-object YAML root', () => {
    const result = loadYamlManifest(join(HERE, 'fixtures', 'array-root.manifest.yaml'));

    expect(result).toMatchObject({
      ok: false,
      errors: [
        expect.objectContaining({
          path: expect.stringContaining('array-root.manifest.yaml'),
          message: 'root must be a YAML object',
        }),
      ],
    });
  });
});

describe('loadManifestSource', () => {
  it('loads a JSON manifest source', async () => {
    const result = await loadManifestSource(join(HERE, 'fixtures', 'minimal.manifest.json'));

    expect(result).toMatchObject({
      views: [{ id: 'home' }],
    });
  });

  it('loads a module manifest source', async () => {
    const result = await loadManifestSource(join(HERE, 'fixtures', 'minimal.manifest.ts'));

    expect(result).toMatchObject({
      views: [{ id: 'home' }],
    });
  });

  it('loads a YAML manifest source', async () => {
    const result = await loadManifestSource(join(HERE, 'fixtures', 'minimal.manifest.yaml'));

    expect(result).toMatchObject({
      views: [{ id: 'home' }],
    });
  });

  it('loads a YML manifest source', async () => {
    const result = await loadManifestSource(join(HERE, 'fixtures', 'minimal.manifest.yml'));

    expect(result).toMatchObject({
      views: [{ id: 'home' }],
    });
  });

  it('throws formatted YAML loader errors', async () => {
    await expect(
      loadManifestSource(join(HERE, 'fixtures', 'invalid-yaml.manifest.yaml')),
    ).rejects.toThrow(/invalid-yaml\.manifest\.yaml: .+/);
  });

  // (Removed: a test that loaded firmware/esp32/src/manifest.yaml "for remaining
  //  YAML parity work". The firmware no longer authors a YAML manifest -- the
  //  device is described in firmware/esp32/src/device_ui.cpp and the manifest is
  //  emitted from C++ at build. This TS toolchain is retained only as the
  //  byte-equality oracle for the emitter; there is no firmware YAML to parse.)
});

describe('expandAuthoringManifest', () => {
  it('accepts a full-surface authored YAML fixture at the authoring schema level', () => {
    const result = loadYamlManifest(join(HERE, 'fixtures', 'full-surface.manifest.yaml'));

    expect(result).toMatchObject({ ok: true });
    expect(result.ok).toBe(true);

    if (!result.ok) {
      throw new Error('expected authored YAML fixture to parse');
    }

    expect(Value.Check(AuthoringManifestSpec, result.value)).toBe(true);
  });

  it('preserves the widened authored surface when expanding authored YAML', async () => {
    const result = await loadManifestSource(join(HERE, 'fixtures', 'full-surface.manifest.yaml'));

    expect(result).toMatchObject({
      appShell: {
        navBar: {
          items: [
            { id: 'home', label: 'Home', icon: 'home', viewId: 'home' },
            { id: 'stats', label: 'Stats', icon: 'bar-chart-2', viewId: 'stats' },
            { id: 'settings', label: 'Settings', icon: 'settings', viewId: 'settings' },
          ],
        },
      },
      views: [
        {
          id: 'home',
          routeKey: 'home',
          entryRules: [{ var: 'resource.relay.auto' }],
        },
        {
          id: 'stats',
          routeKey: 'stats',
          entryRules: [{ '==': [{ var: 'resource.fan.profile' }, 'normal'] }],
        },
        {
          id: 'settings',
          routeKey: 'settings',
        },
      ],
      nodes: expect.arrayContaining([
        expect.objectContaining({
          id: 'telemetry.section',
          kind: 'section',
          title: 'Telemetry',
        }),
        expect.objectContaining({
          id: 'lighting.section',
          kind: 'section',
          title: 'Lighting',
        }),
        expect.objectContaining({
          id: 'system.row',
          kind: 'row',
        }),
        expect.objectContaining({
          id: 'system.section',
          kind: 'section',
          title: 'System',
        }),
        expect.objectContaining({
          id: 'home.banner',
          kind: 'widget',
          widget: 'text',
          text: 'BLE-connected device dashboard.',
        }),
        expect.objectContaining({
          id: 'lighting.slider',
          kind: 'widget',
          widget: 'slider',
          formatHint: 'percent',
        }),
        expect.objectContaining({
          id: 'telemetry.temp',
          kind: 'widget',
          widget: 'stat',
          formatHint: 'float_2',
        }),
        expect.objectContaining({
          id: 'telemetry.profile',
          kind: 'widget',
          widget: 'select',
        }),
        expect.objectContaining({
          id: 'system.rssi',
          kind: 'widget',
          widget: 'badge',
        }),
        expect.objectContaining({
          id: 'system.uptime',
          kind: 'widget',
          widget: 'timer',
        }),
        expect.objectContaining({
          id: 'settings.rename',
          kind: 'widget',
          widget: 'text_input',
        }),
      ]),
    });
  });

  it('expands the full authored YAML fixture into canonical views, appShell, and node families', async () => {
    const result = await loadManifestSource(join(HERE, 'fixtures', 'full-surface.manifest.yaml'));

    expect(Value.Check(ManifestSpec, result)).toBe(true);

    if (!Value.Check(ManifestSpec, result)) {
      throw new Error('expected expanded full-surface YAML fixture to match ManifestSpec');
    }

    expect(result.appShell).toEqual({
      navBar: {
        items: [
          { id: 'home', label: 'Home', icon: 'home', viewId: 'home' },
          { id: 'stats', label: 'Stats', icon: 'bar-chart-2', viewId: 'stats' },
          { id: 'settings', label: 'Settings', icon: 'settings', viewId: 'settings' },
        ],
      },
    });
    expect(result.views).toEqual([
      {
        id: 'home',
        firmwareSymbol: 'home',
        title: 'Home',
        routeKey: 'home',
        rootNodeId: 'home.root',
        entryRules: [{ var: 'resource.relay.auto' }],
      },
      {
        id: 'stats',
        firmwareSymbol: 'stats_screen',
        title: 'Stats',
        routeKey: 'stats',
        rootNodeId: 'stats.root',
        entryRules: [{ '==': [{ var: 'resource.fan.profile' }, 'normal'] }],
      },
      {
        id: 'settings',
        firmwareSymbol: 'settings_screen',
        title: 'Settings',
        routeKey: 'settings',
        rootNodeId: 'settings.root',
      },
    ]);
    expect(result.nodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'home.root', kind: 'stack', children: ['home.banner', 'lighting.section'] }),
        expect.objectContaining({ id: 'stats.root', kind: 'stack', children: ['telemetry.section', 'system.section'] }),
        expect.objectContaining({ id: 'settings.root', kind: 'stack', children: ['settings.section', 'advanced.section'] }),
        expect.objectContaining({ id: 'lighting.section', kind: 'section' }),
        expect.objectContaining({ id: 'telemetry.section', kind: 'section' }),
        expect.objectContaining({ id: 'system.section', kind: 'section' }),
        expect.objectContaining({ id: 'system.row', kind: 'row' }),
        expect.objectContaining({ id: 'home.banner', kind: 'widget', widget: 'text' }),
        expect.objectContaining({ id: 'lighting.toggle', kind: 'widget', widget: 'toggle' }),
        expect.objectContaining({ id: 'lighting.slider', kind: 'widget', widget: 'slider' }),
        expect.objectContaining({ id: 'lighting.color', kind: 'widget', widget: 'select' }),
        expect.objectContaining({ id: 'telemetry.temp', kind: 'widget', widget: 'stat' }),
        expect.objectContaining({ id: 'system.rssi', kind: 'widget', widget: 'badge' }),
        expect.objectContaining({ id: 'system.uptime', kind: 'widget', widget: 'timer' }),
        expect.objectContaining({ id: 'settings.rename', kind: 'widget', widget: 'text_input' }),
      ]),
    );
  });

  it('rejects out-of-scope authoring fields', () => {
    expect(
      Value.Check(AuthoringManifestSpec, {
        version: 5,
        schemaVersion: 1,
        minAppVersion: '1.0.0',
        capabilities: { required: [], optional: [] },
        resources: [],
        actions: [],
        views: [
          {
            id: 'home',
            title: 'Home',
            rootNodeId: 'home.root',
            content: [
              {
                kind: 'section',
                id: 'home.controls',
                content: [
                  {
                    kind: 'toggle',
                    id: 'home.controls.main_power',
                  },
                ],
              },
            ],
          },
        ],
      }),
    ).toBe(false);
  });

  it('rejects empty view content at the authoring schema level', () => {
    expect(
      Value.Check(AuthoringManifestSpec, {
        version: 5,
        schemaVersion: 1,
        minAppVersion: '1.0.0',
        capabilities: { required: [], optional: [] },
        resources: [],
        actions: [],
        views: [
          {
            id: 'home',
            title: 'Home',
            content: [],
          },
        ],
      }),
    ).toBe(false);
  });

  it('reports duplicate authored view ids with authored YAML-like paths without cascaded node noise', () => {
    try {
      expandAuthoringManifest({
        version: 5,
        schemaVersion: 1,
        minAppVersion: '1.0.0',
        capabilities: { required: [], optional: [] },
        resources: [],
        actions: [],
        views: [
          {
            id: 'home',
            title: 'Home',
            content: [
              {
                kind: 'toggle',
                id: 'home.one',
              },
            ],
          },
          {
            id: 'home',
            title: 'Home Again',
            content: [
              {
                kind: 'toggle',
                id: 'home.two',
              },
            ],
          },
        ],
      });
      throw new Error('expected duplicate view id failure');
    } catch (error) {
      expect(String(error)).toMatch(/views\[0\]\.id, views\[1\]\.id duplicate id 'home' in views/);
      expect(String(error)).not.toContain("duplicate id 'home.root' in nodes");
      expect(String(error)).not.toContain("duplicate firmwareSymbol 'home_root' in nodes");
    }
  });

  it('reports duplicate authored resource ids with authored YAML-like paths', () => {
    expect(() =>
      expandAuthoringManifest({
        version: 5,
        schemaVersion: 1,
        minAppVersion: '1.0.0',
        capabilities: { required: [], optional: [] },
        resources: [
          {
            id: 'relay.auto',
            firmwareSymbol: 'relay_auto',
            label: 'Main Power',
            valueType: 'bool',
            readMode: 'subscribe',
            staleAfterMs: 5000,
          },
          {
            id: 'relay.auto',
            firmwareSymbol: 'relay_auto_2',
            label: 'Backup Power',
            valueType: 'bool',
            readMode: 'subscribe',
            staleAfterMs: 5000,
          },
        ],
        actions: [],
        views: [
          {
            id: 'home',
            title: 'Home',
            content: [
              {
                kind: 'toggle',
                id: 'home.toggle',
              },
            ],
          },
        ],
      }),
    ).toThrow(/resources\[0\]\.id, resources\[1\]\.id duplicate id 'relay\.auto' in resources/);
  });

  it('reports generated root node id collisions with authored YAML-like id paths', () => {
    expect(() =>
      expandAuthoringManifest({
        version: 5,
        schemaVersion: 1,
        minAppVersion: '1.0.0',
        capabilities: { required: [], optional: [] },
        resources: [],
        actions: [],
        views: [
          {
            id: 'home',
            title: 'Home',
            content: [
              {
                kind: 'toggle',
                id: 'home.root',
                firmwareSymbol: 'home_root',
              },
            ],
          },
        ],
      }),
    ).toThrow(/views\[0\]\.content\[0\]\.id.*generated root node 'home\.root' collides with authored content/);
  });

  it('reports explicit generated root firmware symbol collisions with authored YAML-like firmwareSymbol paths', () => {
    expect(() =>
      expandAuthoringManifest({
        version: 5,
        schemaVersion: 1,
        minAppVersion: '1.0.0',
        capabilities: { required: [], optional: [] },
        resources: [],
        actions: [],
        views: [
          {
            id: 'home',
            title: 'Home',
            content: [
              {
                kind: 'toggle',
                id: 'home.toggle',
                firmwareSymbol: 'home_root',
              },
            ],
          },
        ],
      }),
    ).toThrow(/views\[0\]\.content\[0\]\.firmwareSymbol.*generated root firmwareSymbol 'home_root' collides with authored content/);
  });

  it('reports derived generated root firmware symbol collisions with authored YAML-like node paths', () => {
    expect(() =>
      expandAuthoringManifest({
        version: 5,
        schemaVersion: 1,
        minAppVersion: '1.0.0',
        capabilities: { required: [], optional: [] },
        resources: [],
        actions: [],
        views: [
          {
            id: 'home.root',
            title: 'Home Root',
            content: [
              {
                kind: 'toggle',
                id: 'home.root_root',
              },
            ],
          },
        ],
      }),
    ).toThrow(/views\[0\]\.content\[0\].*generated root firmwareSymbol 'home_root_root' collides with authored content/);
  });

  it('rejects expansion results that exceed canonical manifest limits', () => {
    expect(() =>
      expandAuthoringManifest({
        version: 5,
        schemaVersion: 1,
        minAppVersion: '1.0.0',
        capabilities: { required: [], optional: [] },
        resources: [],
        actions: [],
        views: [
          {
            id: 'home',
            title: 'Home',
            content: Array.from({ length: 16 }, (_, sectionIndex) => ({
              kind: 'section' as const,
              id: `home.section_${sectionIndex + 1}`,
              content: Array.from({ length: 31 }, (_, toggleIndex) => ({
                kind: 'toggle' as const,
                id: `home.section_${sectionIndex + 1}.toggle_${toggleIndex + 1}`,
              })),
            })),
          },
        ],
      }),
    ).toThrow(/expanded manifest failed canonical validation: .*nodes .*must NOT have more than 512 items/);
  });

  it('rejects unknown toggle bind references after expansion', () => {
    expect(() =>
      expandAuthoringManifest({
        version: 5,
        schemaVersion: 1,
        minAppVersion: '1.0.0',
        capabilities: { required: [], optional: [] },
        resources: [],
        actions: [],
        views: [
          {
            id: 'home',
            title: 'Home',
            content: [
              {
                kind: 'toggle',
                id: 'home.toggle',
                resource: 'relay.auto',
                action: 'relay.toggle',
              },
            ],
          },
        ],
      }),
    ).toThrow("views[0].content[0].resource: unknown resource 'relay.auto'");
  });

  it('reports authoring schema failures with YAML-like paths', () => {
    expect(() =>
      expandAuthoringManifest({
        version: 5,
        schemaVersion: 1,
        minAppVersion: '1.0.0',
        capabilities: { required: [], optional: [] },
        resources: [],
        actions: [],
        views: [
          {
            id: 'home',
            title: 'Home',
            content: [
              {
                kind: 'toggle',
              },
            ],
          },
        ],
      }),
    ).toThrow('views[0].content[0].id');
  });

  it('reports unknown toggle bind references with authored YAML-like paths', () => {
    expect(() =>
      expandAuthoringManifest({
        version: 5,
        schemaVersion: 1,
        minAppVersion: '1.0.0',
        capabilities: { required: [], optional: [] },
        resources: [],
        actions: [],
        views: [
          {
            id: 'home',
            title: 'Home',
            content: [
              {
                kind: 'toggle',
                id: 'home.toggle',
                resource: 'relay.auto',
              },
            ],
          },
        ],
      }),
    ).toThrow("views[0].content[0].resource: unknown resource 'relay.auto'");
  });

  it('reports duplicate authored node ids with authored YAML-like paths', () => {
    expect(() =>
      expandAuthoringManifest({
        version: 5,
        schemaVersion: 1,
        minAppVersion: '1.0.0',
        capabilities: { required: [], optional: [] },
        resources: [],
        actions: [],
        views: [
          {
            id: 'home',
            title: 'Home',
            content: [
              {
                kind: 'toggle',
                id: 'home.dup',
              },
              {
                kind: 'toggle',
                id: 'home.dup',
              },
            ],
          },
        ],
      }),
    ).toThrow(/views\[0\]\.content\[0\], views\[0\]\.content\[1\] duplicate id 'home\.dup' in nodes/);
  });

  it('reports duplicate authored node firmware symbols with authored YAML-like paths', () => {
    expect(() =>
      expandAuthoringManifest({
        version: 5,
        schemaVersion: 1,
        minAppVersion: '1.0.0',
        capabilities: { required: [], optional: [] },
        resources: [],
        actions: [],
        views: [
          {
            id: 'home',
            title: 'Home',
            content: [
              {
                kind: 'toggle',
                id: 'home.one',
                firmwareSymbol: 'shared_symbol',
              },
              {
                kind: 'toggle',
                id: 'home.two',
                firmwareSymbol: 'shared_symbol',
              },
            ],
          },
        ],
      }),
    ).toThrow(/views\[0\]\.content\[0\], views\[0\]\.content\[1\] duplicate firmwareSymbol 'shared_symbol' in nodes/);
  });

  it('reports derived node firmwareSymbol validation diagnostics on the authored id path', () => {
    expect(() =>
      expandAuthoringManifest({
        version: 5,
        schemaVersion: 1,
        minAppVersion: '1.0.0',
        capabilities: { required: [], optional: [] },
        resources: [],
        actions: [],
        views: [
          {
            id: 'home',
            title: 'Home',
            content: [
              {
                kind: 'toggle',
                id: 'manifest.resources',
              },
            ],
          },
        ],
      }),
    ).toThrow(/views\[0\]\.content\[0\]\.id firmwareSymbol 'manifest_resources' collides with an emitted name/);
  });

  it('expands nested view content into canonical nodes with generated root ids', () => {
    const loaded = loadYamlManifest(join(HERE, 'fixtures', 'multi-view.manifest.yaml'));

    expect(loaded.ok).toBe(true);

    if (!loaded.ok) {
      throw new Error('expected YAML fixture to load');
    }

    const expanded = expandAuthoringManifest(loaded.value);

    expect(expanded.views).toEqual([
      {
        id: 'home',
        firmwareSymbol: 'home_screen',
        title: 'Home',
        rootNodeId: 'home.root',
      },
      {
        id: 'status',
        firmwareSymbol: 'status_screen',
        title: 'Status',
        rootNodeId: 'status.root',
      },
    ]);

    expect(expanded.nodes).toEqual([
      {
        id: 'home.root',
        firmwareSymbol: 'home_root',
        kind: 'stack',
        children: ['home.controls'],
      },
      {
        id: 'home.controls',
        firmwareSymbol: 'home_controls',
        kind: 'section',
        title: 'Controls',
        children: ['home.controls.main_power'],
      },
      {
        id: 'home.controls.main_power',
        firmwareSymbol: 'home_controls_main_power',
        kind: 'widget',
        widget: 'toggle',
        title: 'Main Power',
        bind: {
          resource: 'relay.auto',
          action: 'relay.toggle',
        },
      },
      {
        id: 'status.root',
        firmwareSymbol: 'status_root',
        kind: 'stack',
        children: ['status.online'],
      },
      {
        id: 'status.online',
        firmwareSymbol: 'status_online',
        kind: 'widget',
        widget: 'toggle',
        title: 'Online',
        bind: {
          resource: 'status.online',
        },
      },
    ]);
  });

  it('derives firmware symbols for authored views and nodes when omitted', () => {
    const loaded = loadYamlManifest(join(HERE, 'fixtures', 'minimal.manifest.yaml'));

    expect(loaded.ok).toBe(true);

    if (!loaded.ok) {
      throw new Error('expected YAML fixture to load');
    }

    const expanded = expandAuthoringManifest(loaded.value);

    expect(expanded.views[0]).toMatchObject({
      id: 'home',
      firmwareSymbol: 'home_screen',
      rootNodeId: 'home.root',
    });
    expect(expanded.nodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'home.root',
          firmwareSymbol: 'home_root',
        }),
        expect.objectContaining({
          id: 'home.toggle',
          firmwareSymbol: 'home_toggle',
        }),
      ]),
    );
  });

  it('derives stable firmware symbols for repeated expansion of the same authoring ids', () => {
    const authoring = {
      version: 5,
      schemaVersion: 1,
      minAppVersion: '1.0.0',
      capabilities: { required: [], optional: [] },
      resources: [],
      actions: [],
      views: [
        {
          id: 'status_panel',
          title: 'Status Panel',
          content: [
            {
              kind: 'section' as const,
              id: 'status_panel.controls',
              content: [
                {
                  kind: 'toggle' as const,
                  id: 'status_panel.controls.main_power',
                },
              ],
            },
          ],
        },
      ],
    };

    expect(expandAuthoringManifest(authoring)).toMatchObject({
      views: [
        {
          id: 'status_panel',
          firmwareSymbol: 'status_panel_screen',
          rootNodeId: 'status_panel.root',
        },
      ],
      nodes: expect.arrayContaining([
        expect.objectContaining({
          id: 'status_panel.root',
          firmwareSymbol: 'status_panel_root',
        }),
        expect.objectContaining({
          id: 'status_panel.controls',
          firmwareSymbol: 'status_panel_controls',
        }),
        expect.objectContaining({
          id: 'status_panel.controls.main_power',
          firmwareSymbol: 'status_panel_controls_main_power',
        }),
      ]),
    });
  });
});

describe('runCli help', () => {
  it('mentions YAML manifest sources in help text', async () => {
    const result = await runCli(['validate', '--help']);

    expect(result.stdout).toContain('YAML');
  });
});

describe('Documentation', () => {
  it('documents device_ui.cpp as the firmware authoring source and keeps the YAML toolchain as the oracle, without legacy JSON paths', () => {
    const readmePath = join(HERE, '../../../README.md');
    const readme = readFileSync(readmePath, 'utf8');

    // The firmware demo is now authored in C++ (device_ui.cpp / buildUi); the
    // manifest is emitted from C++ at build with no Node step.
    expect(readme).toContain('device_ui.cpp');
    // The YAML toolchain (tools/manifest) is retained only as the byte-equality
    // oracle, so the README still references its fixtures/data model.
    expect(readme).toContain('tools/manifest');
    // No legacy JSON authoring path.
    expect(readme).not.toContain('manifest.json');
  });
});
