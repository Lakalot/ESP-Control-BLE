import { describe, expect, it } from 'vitest';
import { lintRules } from '../src/validation/ruleLinter.js';
import { MINIMAL_MANIFEST } from './fixtures/minimal.manifest.js';
import { UNKNOWN_VAR_MANIFEST } from './fixtures/invalid-rule-var.js';

describe('lintRules', () => {
  it('returns no diagnostics for the minimal fixture', () => {
    expect(lintRules(MINIMAL_MANIFEST)).toEqual([]);
  });

  it('reports unknown resources used in var references', () => {
    const diags = lintRules(UNKNOWN_VAR_MANIFEST);
    expect(diags).toHaveLength(1);
    expect(diags[0]!.message).toContain('resource.nonexistent');
  });

  it('reports unsupported operators', () => {
    const diags = lintRules({
      ...MINIMAL_MANIFEST,
      screens: [
        {
          id: 'home',
          title: 'Home',
          rootNodeId: 'home.root',
          ...MINIMAL_MANIFEST.screens[0],
          entryRules: [{ '+': [1, 2] } as unknown as never],
        },
      ],
    });
    expect(diags).toHaveLength(1);
    expect(diags[0]!.message).toContain("operator '+'");
  });
});
