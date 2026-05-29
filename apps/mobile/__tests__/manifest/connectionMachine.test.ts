import { describe, expect, it, jest } from '@jest/globals';
import { createActor } from 'xstate';
import { createConnectionMachine } from '../../src/manifest/runtime/connectionMachine';

function waitFor(actor: any, predicate: (s: any) => boolean, timeoutMs = 2000): Promise<any> {
  return new Promise((resolve, reject) => {
    const sub = actor.subscribe((s: any) => { if (predicate(s)) { sub.unsubscribe(); resolve(s); } });
    setTimeout(() => { sub.unsubscribe(); reject(new Error('timeout')); }, timeoutMs);
  });
}

describe('connectionMachine', () => {
  it('reaches ready after connect + authenticate succeed', async () => {
    const fakeRuntime = { id: 'rt' };
    const connect = jest.fn(async () => fakeRuntime as any);
    const authenticate = jest.fn(async () => {});
    const machine = createConnectionMachine({ connect, authenticate, pin: '1234', maxRetries: 3 });
    const actor = createActor(machine).start();

    const s = await waitFor(actor, (st) => st.matches('ready'));
    expect(connect).toHaveBeenCalledTimes(1);
    expect(authenticate).toHaveBeenCalledWith(fakeRuntime);
    expect(s.context.runtime).toBe(fakeRuntime);
  });

  it('goes to failed when authenticate rejects with an auth error (no retry on bad PIN)', async () => {
    const connect = jest.fn(async () => ({} as any));
    const authenticate = jest.fn(async () => { const e: any = new Error('auth rejected (wrong PIN)'); e.name = 'AuthError'; throw e; });
    const machine = createConnectionMachine({ connect, authenticate, pin: 'bad', maxRetries: 3 });
    const actor = createActor(machine).start();

    const s = await waitFor(actor, (st) => st.matches('failed'));
    expect(s.context.error).toMatch(/PIN/i);
    expect(authenticate).toHaveBeenCalledTimes(1); // not retried
  });

  it('retries connect on a transport failure then succeeds', async () => {
    let attempts = 0;
    const connect = jest.fn(async () => { attempts++; if (attempts < 2) throw new Error('gatt error'); return { id: 'rt' } as any; });
    const authenticate = jest.fn(async () => {});
    const machine = createConnectionMachine({ connect, authenticate, pin: '1234', maxRetries: 3, retryDelayMs: 1 });
    const actor = createActor(machine).start();

    const s = await waitFor(actor, (st) => st.matches('ready'));
    expect(attempts).toBe(2);
    expect(s.context.runtime).toEqual({ id: 'rt' });
  });

  it('gives up to failed after maxRetries transport failures', async () => {
    const connect = jest.fn(async () => { throw new Error('gatt error'); });
    const authenticate = jest.fn(async () => {});
    const machine = createConnectionMachine({ connect, authenticate, pin: '1234', maxRetries: 2, retryDelayMs: 1 });
    const actor = createActor(machine).start();

    const s = await waitFor(actor, (st) => st.matches('failed'));
    expect(connect.mock.calls.length).toBe(3); // initial + 2 retries
  });
});
