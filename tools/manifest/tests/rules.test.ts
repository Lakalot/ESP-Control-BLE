import { describe, expect, it } from 'vitest';
import { Value } from '@sinclair/typebox/value';
import { ALLOWED_RULE_OPERATORS, RuleSpec } from '../src/schema/rules.js';

describe('RuleSpec', () => {
  it('freezes the operator allowlist', () => {
    expect(ALLOWED_RULE_OPERATORS).toEqual([
      '==',
      '!=',
      '>',
      '>=',
      '<',
      '<=',
      'and',
      'or',
      '!',
      'if',
      'in',
      'var',
    ]);
  });

  it('accepts a simple var lookup', () => {
    expect(Value.Check(RuleSpec, { var: 'resource.mode' })).toBe(true);
  });

  it('accepts a comparison tree', () => {
    expect(
      Value.Check(RuleSpec, {
        '==': [{ var: 'resource.mode' }, 'auto'],
      }),
    ).toBe(true);
  });

  it('rejects non-object literals', () => {
    expect(Value.Check(RuleSpec, 42)).toBe(false);
  });
});
