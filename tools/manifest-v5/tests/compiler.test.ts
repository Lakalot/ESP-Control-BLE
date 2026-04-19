import { describe, expect, it } from 'vitest';
import { StringTable } from '../src/compiler/stringTable.js';
import { assignIds } from '../src/compiler/assignIds.js';
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
});
