import { describe, expect, it } from 'vitest';
import { Value } from '@sinclair/typebox/value';
import { ManifestSpec } from '../src/schema/manifest.js';
import { normalize } from '../src/compiler/normalize.js';
import { validateManifest } from '../src/validation/ajv.js';
import { MINIMAL_MANIFEST } from './fixtures/minimal.manifest.js';
import { NAV_MANIFEST } from './fixtures/nav.manifest.js';

describe('ManifestSpec', () => {
  it('accepts the minimal fixture', () => {
    expect(Value.Check(ManifestSpec, MINIMAL_MANIFEST)).toBe(true);
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
