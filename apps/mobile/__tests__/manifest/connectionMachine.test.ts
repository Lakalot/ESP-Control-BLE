import { describe, expect, it, jest } from '@jest/globals';
import { createActor } from 'xstate';
import { createConnectionMachine } from '../../src/manifest/runtime/connectionMachine';

function waitFor(actor: any, predicate: (s: any) => boolean, timeoutMs = 2000): Promise<any> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { sub.unsubscribe(); reject(new Error('timeout')); }, timeoutMs);
    const sub = actor.subscribe((s: any) => {
      if (predicate(s)) { clearTimeout(timer); sub.unsubscribe(); resolve(s); }
    });
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
    actor.stop(); // ready schedules a stability timer; stop it so no handle leaks
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
    actor.stop(); // ready schedules a stability timer; stop it so no handle leaks
  });

  it('gives up to failed after maxRetries transport failures', async () => {
    const connect = jest.fn(async () => { throw new Error('gatt error'); });
    const authenticate = jest.fn(async () => {});
    const machine = createConnectionMachine({ connect, authenticate, pin: '1234', maxRetries: 2, retryDelayMs: 1 });
    const actor = createActor(machine).start();

    const s = await waitFor(actor, (st) => st.matches('failed'));
    expect(connect.mock.calls.length).toBe(3); // initial + 2 retries
  });

  it('classifies an initial busy/refused connect failure as "device busy" (best-effort)', async () => {
    // Firmware with an existing session refuses the 2nd connection by dropping
    // immediately; mobile-side connect() rejects. With no retry budget the very
    // first failure is terminal and gets the busy-specific message.
    const connect = jest.fn(async () => { throw new Error('Device disconnected'); });
    const authenticate = jest.fn(async () => {});
    const machine = createConnectionMachine({ connect, authenticate, pin: '1234', maxRetries: 0, retryDelayMs: 1 });
    const actor = createActor(machine).start();

    const s = await waitFor(actor, (st) => st.matches('failed'));
    expect(s.context.error).toMatch(/occup/i); // "appareil occupé ..."
    actor.stop();
  });

  it('reconnects and re-auths after a disconnect from ready', async () => {
    const connect = jest.fn(async () => ({ id: 'rt' } as any));
    const authenticate = jest.fn(async () => {});
    const machine = createConnectionMachine({ connect, authenticate, pin: '1234', maxRetries: 3, retryDelayMs: 1 });
    const actor = createActor(machine).start();

    await waitFor(actor, (st) => st.matches('ready'));
    expect(connect).toHaveBeenCalledTimes(1);
    expect(authenticate).toHaveBeenCalledTimes(1);

    // Mid-session link drop reported by the owner.
    let sawReconnecting = false;
    const probe = actor.subscribe((s: any) => { if (s.matches('reconnecting')) sawReconnecting = true; });
    actor.send({ type: 'DISCONNECTED' });

    // It should transition back through reconnecting to ready, re-running both steps.
    const s = await waitFor(actor, (st) => st.matches('ready') && connect.mock.calls.length === 2);
    probe.unsubscribe();
    expect(sawReconnecting).toBe(true);
    expect(connect).toHaveBeenCalledTimes(2);
    expect(authenticate).toHaveBeenCalledTimes(2);
    expect(s.matches('ready')).toBe(true);
    actor.stop(); // cancel the pending stability timer so no handle leaks
  });

  it('re-auth on reconnect uses the same pin and the freshest runtime', async () => {
    let callCount = 0;
    const connect = jest.fn(async () => { callCount++; return { id: callCount } as any; });
    const authenticate = jest.fn(async () => {});
    const machine = createConnectionMachine({ connect, authenticate, pin: '1234', maxRetries: 3, retryDelayMs: 1 });
    const actor = createActor(machine).start();

    const first = await waitFor(actor, (st) => st.matches('ready'));
    expect(first.context.runtime).toEqual({ id: 1 });
    expect(authenticate).toHaveBeenLastCalledWith({ id: 1 });

    actor.send({ type: 'DISCONNECTED' });

    const second = await waitFor(actor, (st) => st.matches('ready') && st.context.runtime?.id === 2);
    expect(second.context.runtime).toEqual({ id: 2 });
    // Re-auth ran against the NEW runtime (pin is retained internally via cfg).
    expect(authenticate).toHaveBeenLastCalledWith({ id: 2 });
    expect(authenticate).toHaveBeenCalledTimes(2);
    actor.stop(); // cancel the pending stability timer so no handle leaks
  });

  it('gives up after too many rapid reconnect cycles (connection unstable)', async () => {
    // connect + auth always succeed, but the link keeps dropping the instant we
    // reach ready. The reconnect-storm safeguard must eventually give up rather
    // than loop forever.
    const connect = jest.fn(async () => ({ id: 'rt' } as any));
    const authenticate = jest.fn(async () => {});
    const machine = createConnectionMachine({ connect, authenticate, pin: '1234', maxRetries: 3, retryDelayMs: 1, maxReconnects: 2 });
    const actor = createActor(machine).start();

    // Drive the storm: every time we re-enter ready, kick another disconnect.
    // The driver is self-limiting (a hard sendCount cap) so a regression that
    // breaks the safeguard fails the assertion instead of hanging the suite.
    let sendCount = 0;
    const sub = actor.subscribe((s: any) => {
      if (s.matches('ready') && sendCount < 10) { sendCount++; actor.send({ type: 'DISCONNECTED' }); }
    });

    const s = await waitFor(actor, (st) => st.matches('failed'));
    sub.unsubscribe();
    expect(s.context.error).toMatch(/instable/i);
    // It should give up around maxReconnects, well before the driver's cap.
    expect(sendCount).toBeLessThanOrEqual(4);
    actor.stop();
  });
});
