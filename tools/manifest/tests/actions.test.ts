import { describe, expect, it } from 'vitest';
import { Value } from '@sinclair/typebox/value';
import { ActionSpec } from '../src/schema/actions.js';

describe('ActionSpec', () => {
  const ok = {
    id: 'relay.toggle',
    firmwareSymbol: 'relay_toggle',
    label: 'Toggle',
    dangerLevel: 'normal',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {},
    },
  };

  it('accepts a minimal valid action', () => {
    expect(Value.Check(ActionSpec, ok)).toBe(true);
  });

  it('rejects unknown dangerLevel', () => {
    expect(Value.Check(ActionSpec, { ...ok, dangerLevel: 'nuclear' })).toBe(false);
  });

  it('rejects negative cooldownMs', () => {
    expect(Value.Check(ActionSpec, { ...ok, cooldownMs: -1 })).toBe(false);
  });
});
