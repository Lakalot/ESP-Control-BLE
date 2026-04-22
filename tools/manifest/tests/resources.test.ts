import { describe, expect, it } from 'vitest';
import { Value } from '@sinclair/typebox/value';
import { ResourceSpec } from '../src/schema/resources.js';

describe('ResourceSpec', () => {
  const ok = {
    id: 'relay.auto',
    firmwareSymbol: 'relay_auto',
    label: 'Main Power',
    valueType: 'bool',
    readMode: 'subscribe',
    staleAfterMs: 5000,
  };

  it('accepts a minimal valid resource', () => {
    expect(Value.Check(ResourceSpec, ok)).toBe(true);
  });

  it('rejects unknown valueType', () => {
    expect(Value.Check(ResourceSpec, { ...ok, valueType: 'bignum' })).toBe(false);
  });

  it('rejects staleAfterMs <= 0', () => {
    expect(Value.Check(ResourceSpec, { ...ok, staleAfterMs: 0 })).toBe(false);
  });

  it('rejects extra properties', () => {
    expect(Value.Check(ResourceSpec, { ...ok, rogue: true })).toBe(false);
  });
});
