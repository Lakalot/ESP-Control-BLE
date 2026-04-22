import { describe, expect, it } from 'vitest';
import { validateManifest } from '../src/validation/ajv.js';
import { MINIMAL_MANIFEST } from './fixtures/minimal.manifest.js';
import { DUPLICATE_RESOURCE_ID_MANIFEST } from './fixtures/invalid-duplicate-id.js';
import { readFileSync } from 'node:fs';

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

  it('accepts firmwareSymbol on resources actions views and nodes', () => {
    const result = validateManifest({
      ...MINIMAL_MANIFEST,
      resources: [
        {
          ...MINIMAL_MANIFEST.resources[0],
          firmwareSymbol: 'relay_auto',
        },
      ],
      actions: [
        {
          ...MINIMAL_MANIFEST.actions[0],
          firmwareSymbol: 'relay_toggle',
        },
      ],
      views: [
        {
          ...MINIMAL_MANIFEST.views[0],
          firmwareSymbol: 'home_screen',
        },
      ],
      nodes: MINIMAL_MANIFEST.nodes.map((node, index) => ({
        ...node,
        firmwareSymbol: index === 0 ? 'home_root' : 'home_toggle',
      })),
    });

    expect(result).toEqual({ ok: true });
  });

  it('rejects firmwareSymbol with an invalid identifier shape', () => {
    const result = validateManifest({
      ...MINIMAL_MANIFEST,
      resources: [
        {
          ...MINIMAL_MANIFEST.resources[0],
          firmwareSymbol: '9Bad',
        },
      ],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(
        result.errors.some(
          (error) =>
            error.path === '/resources/0/firmwareSymbol' && error.keyword === 'pattern',
        ),
      ).toBe(true);
    }
  });

  it('rejects reserved firmwareSymbol names', () => {
    const reservedKeyword = validateManifest({
      ...MINIMAL_MANIFEST,
      resources: [
        {
          ...MINIMAL_MANIFEST.resources[0],
          firmwareSymbol: 'and',
        },
      ],
    });

    expect(reservedKeyword.ok).toBe(false);
    if (!reservedKeyword.ok) {
      expect(
        reservedKeyword.errors.some(
          (error) =>
            error.path === '/resources/0/firmwareSymbol' && error.keyword === 'pattern',
        ),
      ).toBe(true);
    }

    const reservedPrefix = validateManifest({
      ...MINIMAL_MANIFEST,
      resources: [
        {
          ...MINIMAL_MANIFEST.resources[0],
          firmwareSymbol: '_system_load',
        },
      ],
    });

    expect(reservedPrefix.ok).toBe(false);
    if (!reservedPrefix.ok) {
      expect(
        reservedPrefix.errors.some(
          (error) =>
            error.path === '/resources/0/firmwareSymbol' && error.keyword === 'pattern',
        ),
      ).toBe(true);
    }
  });

  it('requires firmwareSymbol on exported manifest items', () => {
    const manifest = JSON.parse(
      readFileSync(new URL('./fixtures/invalid-missing-firmware-symbol.json', import.meta.url), 'utf8'),
    );

    const result = validateManifest(manifest);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContainEqual({
        path: '/resources/0',
        keyword: 'required',
        message: "required: must have required property 'firmwareSymbol'",
      });
    }
  });

  it('rejects duplicate firmwareSymbol values within a category', () => {
    const manifest = JSON.parse(
      readFileSync(new URL('./fixtures/invalid-duplicate-firmware-symbol.json', import.meta.url), 'utf8'),
    );

    const result = validateManifest(manifest);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContainEqual({
        path: '/resources',
        keyword: 'uniqueFirmwareSymbol',
        message: "duplicate firmwareSymbol 'shared_symbol' in resources",
        objectId: 'shared_symbol',
      });
    }
  });

  it('rejects firmwareSymbol values that collide with emitted names', () => {
    const result = validateManifest({
      ...MINIMAL_MANIFEST,
      resources: [
        {
          ...MINIMAL_MANIFEST.resources[0],
          firmwareSymbol: 'manifest_resources',
        },
      ],
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContainEqual({
        path: '/resources/0/firmwareSymbol',
        keyword: 'emittedNameCollision',
        message: "firmwareSymbol 'manifest_resources' collides with an emitted name",
        objectId: 'manifest_resources',
      });
    }
  });
});
