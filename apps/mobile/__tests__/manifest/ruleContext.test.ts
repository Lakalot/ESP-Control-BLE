import { buildRuleContext } from '../../src/manifest/rules/ruleContext';
import type { SnapshotMap } from '../../src/manifest/model/snapshot.types';

describe('buildRuleContext', () => {
  it('flattens resource.<slug> to scalar values', () => {
    const snap: SnapshotMap = new Map([
      ['relay.auto', { slug: 'relay.auto', value: { kind: 'bool', value: true }, updatedAt: 1, stale: false }],
      ['mode', { slug: 'mode', value: { kind: 'enum', value: 'auto' }, updatedAt: 1, stale: false }],
    ]);
    const ctx = buildRuleContext({ snapshot: snap, form: { count: 3 }, screen: { id: 'home' }, runtime: { online: true } });
    expect(ctx['resource.relay.auto']).toBe(true);
    expect(ctx['resource.mode']).toBe('auto');
    expect(ctx['form.count']).toBe(3);
    expect(ctx['screen.id']).toBe('home');
    expect(ctx['runtime.online']).toBe(true);
  });

  it('returns undefined (not throw) for missing refs', () => {
    const ctx = buildRuleContext({ snapshot: new Map(), form: {}, screen: {}, runtime: {} });
    expect(ctx['resource.missing']).toBeUndefined();
  });
});