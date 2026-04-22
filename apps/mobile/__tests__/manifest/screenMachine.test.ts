import { createActor } from 'xstate';
import { createScreenMachine } from '@/manifest/runtime/screenMachine';

describe('screenMachine', () => {
  it('blocks entry when entryRules evaluate to false', () => {
    const a = createActor(createScreenMachine({
      screenSlug: 'controls',
      entryRules: [{ '==': [{ var: 'runtime.online' }, true] }],
    }));
    a.start();
    a.send({ type: 'ENTER', context: { 'runtime.online': false } });
    expect(a.getSnapshot().value).toBe('blocked');
    a.stop();
  });

  it('enters loading_snapshot when entryRules pass', () => {
    const a = createActor(createScreenMachine({ screenSlug: 'controls', entryRules: [] }));
    a.start();
    a.send({ type: 'ENTER', context: {} });
    expect(a.getSnapshot().value).toBe('loading_snapshot');
    a.stop();
  });

  it('STALE moves from ready to staleData', () => {
    const a = createActor(createScreenMachine({ screenSlug: 'controls', entryRules: [] }));
    a.start();
    a.send({ type: 'ENTER', context: {} });
    a.send({ type: 'STALE' });
    expect(a.getSnapshot().value).toBe('staleData');
    a.stop();
  });
});