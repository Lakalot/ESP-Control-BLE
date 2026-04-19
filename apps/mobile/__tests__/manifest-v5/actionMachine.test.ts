import { createActor } from 'xstate';
import { createActionMachine } from '@/manifest-v5/runtime/actionMachine';

const oneShot = (ok: boolean, result?: Record<string, unknown>) =>
  jest.fn().mockResolvedValue({ ok, result });

describe('actionMachine', () => {
  it('starts in idle', () => {
    const a = createActor(createActionMachine({ invoke: oneShot(true) }));
    a.start();
    expect(a.getSnapshot().value).toBe('idle');
    a.stop();
  });

  it('idle -> pending -> success on ok result', async () => {
    const invoke = oneShot(true, { echo: 1 });
    // Use cooldown > 0 so it pauses in cooldown and we can observe success/result
    const a = createActor(createActionMachine({ invoke, cooldownMs: 100 }));
    a.start();
    a.send({ type: 'INVOKE', actionSlug: 'toggle_mode', input: { x: 1 } });
    expect(a.getSnapshot().value).toBe('pending');
    await new Promise((r) => setImmediate(r));
    // Since cooldownMs > 0, the always transition went from success -> cooldown
    expect(a.getSnapshot().value).toBe('cooldown');
    expect(a.getSnapshot().context.result).toEqual({ echo: 1 });
    a.stop();
  });

  it('idle -> pending -> error on failed result', async () => {
    const invoke = jest.fn().mockRejectedValue(new Error('boom'));
    const a = createActor(createActionMachine({ invoke, cooldownMs: 0 }));
    a.start();
    a.send({ type: 'INVOKE', actionSlug: 'toggle_mode', input: {} });
    await new Promise((r) => setImmediate(r));
    expect(a.getSnapshot().value).toBe('error');
    expect(a.getSnapshot().context.error).toBe('boom');
    a.stop();
  });

  it('respects cooldownMs between invocations', async () => {
    jest.useFakeTimers();
    const a = createActor(createActionMachine({ invoke: oneShot(true), cooldownMs: 500 }));
    a.start();
    a.send({ type: 'INVOKE', actionSlug: 'x', input: {} });
    
    // flush microtasks so the promise resolves
    await process.nextTick(() => {});
    await process.nextTick(() => {});
    await process.nextTick(() => {});
    
    expect(a.getSnapshot().value).toBe('cooldown');
    jest.advanceTimersByTime(500);
    expect(a.getSnapshot().value).toBe('idle');
    a.stop();
    jest.useRealTimers();
  });
});