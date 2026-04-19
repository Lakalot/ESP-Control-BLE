import { describe, expect, it } from 'vitest';
import { StringTable } from '../src/compiler/stringTable.js';
import { assignIds } from '../src/compiler/assignIds.js';
import { normalize } from '../src/compiler/normalize.js';
import { DEMO_MANIFEST } from './fixtures/demo.manifest.js';
import { MINIMAL_MANIFEST } from './fixtures/minimal.manifest.js';

describe('StringTable', () => {
  it('interns strings and returns stable indices', () => {
    const table = new StringTable();
    const idx1 = table.intern('relay.auto');
    const idx2 = table.intern('relay.auto');
    const idx3 = table.intern('other');
    expect(idx1).toBe(1);
    expect(idx2).toBe(1);
    expect(idx3).toBe(2);
  });

  it('interns the empty string at index 0', () => {
    const table = new StringTable();
    expect(table.intern('')).toBe(0);
  });

  it('exports the internal list as an array', () => {
    const table = new StringTable();
    table.intern('a');
    table.intern('b');
    expect(table.toArray()).toEqual(['', 'a', 'b']);
  });
});

describe('assignIds', () => {
  it('assigns 1-based indices to manifest items', () => {
    const ids = assignIds(MINIMAL_MANIFEST);
    expect(ids.resources.get('relay.auto')).toBe(1);
    expect(ids.actions.get('relay.toggle')).toBe(1);
    expect(ids.screens.get('home')).toBe(1);
    expect(ids.nodes.get('home.root')).toBe(1);
    expect(ids.nodes.get('home.toggle')).toBe(2);
  });

  it('assigns stable numeric ids from sorted slugs', () => {
    const permuted = structuredClone(DEMO_MANIFEST);
    permuted.resources.reverse();
    permuted.actions.reverse();

    const originalIds = assignIds(DEMO_MANIFEST);
    const permutedIds = assignIds(permuted);
    const originalNormalized = normalize(DEMO_MANIFEST);
    const permutedNormalized = normalize(structuredClone(DEMO_MANIFEST));

    expect(Array.from(originalIds.resources.entries())).toEqual([
      ['device.debug', 1],
      ['env.temperature', 2],
      ['fan.profile', 3],
      ['light.brightness', 4],
      ['relay.auto', 5],
      ['system.load', 6],
    ]);
    expect(Array.from(originalIds.actions.entries())).toEqual([
      ['device.set_debug', 1],
      ['fan.set_profile', 2],
      ['light.set_brightness', 3],
      ['relay.toggle', 4],
      ['system.factory_reset', 5],
    ]);
    expect(Array.from(permutedIds.resources.entries())).toEqual(
      Array.from(originalIds.resources.entries()),
    );
    expect(Array.from(permutedIds.actions.entries())).toEqual(
      Array.from(originalIds.actions.entries()),
    );
    expect(normalizedIdSlugPairs(originalNormalized.resources, originalNormalized.strings)).toEqual(
      normalizedIdSlugPairs(permutedNormalized.resources, permutedNormalized.strings),
    );
    expect(normalizedIdSlugPairs(originalNormalized.actions, originalNormalized.strings)).toEqual(
      normalizedIdSlugPairs(permutedNormalized.actions, permutedNormalized.strings),
    );
  });
});

function normalizedIdSlugPairs(
  items: { id: number; slugIdx: number }[],
  strings: string[],
): [number, string][] {
  return items.map((item) => [item.id, strings[item.slugIdx]] as [number, string]);
}
