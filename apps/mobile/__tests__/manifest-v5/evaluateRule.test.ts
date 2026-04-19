import { evaluateRule } from '@/manifest-v5/rules/evaluateRule';

describe('evaluateRule', () => {
  const ctx = {
    'resource.mode': 'auto',
    'resource.relay.auto': true,
    'form.count': 3,
  };

  it('evaluates var', () => {
    expect(evaluateRule({ var: 'resource.mode' }, ctx)).toBe('auto');
  });

  it('evaluates comparison', () => {
    expect(evaluateRule({ '==': [{ var: 'resource.mode' }, 'auto'] }, ctx)).toBe(true);
    expect(evaluateRule({ '!=': [{ var: 'resource.mode' }, 'auto'] }, ctx)).toBe(false);
  });

  it('evaluates and/or/!', () => {
    const rule = { and: [{ var: 'resource.relay.auto' }, { '>': [{ var: 'form.count' }, 1] }] };
    expect(evaluateRule(rule, ctx)).toBe(true);
  });

  it('treats undefined var as falsy', () => {
    expect(evaluateRule({ var: 'resource.absent' }, ctx)).toBe(null);
  });

  it('rejects operators outside the allowlist', () => {
    expect(() => evaluateRule({ '+': [1, 2] } as never, ctx)).toThrow(/operator/);
  });

  it('returns true for an undefined rule (used by visibleIf when absent)', () => {
    expect(evaluateRule(undefined, ctx)).toBe(true);
  });
});