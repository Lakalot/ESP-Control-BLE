import { assign, fromPromise, setup } from 'xstate';
import type { BleRuntime } from './BleRuntime';

export interface ConnectionInput {
  connect: () => Promise<BleRuntime>;
  authenticate: (runtime: BleRuntime) => Promise<void>;
  pin: string;
  maxRetries?: number;
  retryDelayMs?: number;
  /** Cap on consecutive reconnect cycles before giving up as "unstable". */
  maxReconnects?: number;
  /** Time the link must stay in `ready` to be deemed stable (clears the storm counter). */
  stableResetMs?: number;
}

interface Context {
  runtime: BleRuntime | null;
  error: string | null;
  /** Message of the most recent connect-actor rejection, for classification. */
  connectErrorMessage: string | null;
  attempts: number;
  maxRetries: number;
  retryDelayMs: number;
  /** Consecutive ready->DISCONNECTED reconnect cycles since the last STABLE ready. */
  reconnectCount: number;
  maxReconnects: number;
  /** How long the link must stay in `ready` before the storm counter resets. */
  stableResetMs: number;
}

type Event = { type: 'RETRY' } | { type: 'CANCEL' } | { type: 'DISCONNECTED' };

function isAuthError(err: unknown): boolean {
  return (err as Error)?.name === 'AuthError' || /PIN|auth/i.test((err as Error)?.message ?? '');
}

/**
 * Best-effort classification of an INITIAL connect failure. When the firmware
 * already has a session it refuses the second connection by dropping the link
 * immediately, which surfaces mobile-side as connect() rejecting (or resolving
 * then dropping) with a message like "disconnected"/"cancelled". We only apply
 * this on the very first attempt (no retries spent, not a reconnect) so a
 * generic flaky-link failure after retries still reads as a plain failure.
 */
function classifyConnectFailure(ctx: Context): string {
  const busy = /busy|refused|cancelled|canceled|disconnected/i.test(ctx.connectErrorMessage ?? '');
  if (busy && ctx.attempts === 0 && ctx.reconnectCount === 0) {
    return 'appareil occupé (déjà connecté ailleurs ?)';
  }
  return 'connection failed';
}

/**
 * Session lifecycle: connect -> authenticate -> ready. Transport failures during
 * connect are retried with a linear backoff up to maxRetries; an auth failure
 * (wrong PIN) is terminal (no retry). The manifest load + subscriptions are
 * owned by deviceUiMachine, which runs once this machine exposes `runtime`.
 *
 * Resilience: a mid-session link drop is delivered by the owner as a
 * DISCONNECTED event (the owner subscribes to the current runtime's device via
 * onDisconnected and re-subscribes whenever context.runtime changes). From
 * `ready`, DISCONNECTED drives a fresh connect+re-auth (the connect callback
 * returns a brand-new runtime each call, so re-running `connecting` produces a
 * new runtime that is re-authenticated with the retained pin). Each connect
 * failure during reconnection is capped by maxRetries; a connect-then-drop
 * storm (succeeds then immediately disconnects) is capped by maxReconnects so
 * the machine cannot reconnect-loop forever.
 */
export function createConnectionMachine(cfg: ConnectionInput) {
  return setup({
    types: {} as { context: Context; events: Event },
    actors: {
      connector: fromPromise(async () => cfg.connect()),
      authenticator: fromPromise(async ({ input }: { input: { runtime: BleRuntime } }) => {
        await cfg.authenticate(input.runtime);
      }),
    },
    actions: {
      recordRuntime: assign({ runtime: (_, p: { runtime: BleRuntime }) => p.runtime }),
      recordError: assign({ error: (_, p: { message: string }) => p.message }),
      recordConnectError: assign({ connectErrorMessage: (_, p: { message: string }) => p.message }),
      incAttempts: assign({ attempts: ({ context }) => context.attempts + 1 }),
      resetAttempts: assign({ attempts: () => 0 }),
      incReconnectCount: assign({ reconnectCount: ({ context }) => context.reconnectCount + 1 }),
      resetReconnectCount: assign({ reconnectCount: () => 0 }),
    },
    delays: {
      backoff: ({ context }) => context.retryDelayMs * Math.max(1, context.attempts),
      stable: ({ context }) => context.stableResetMs,
    },
    guards: {
      canRetry: ({ context }) => context.attempts < context.maxRetries,
      canReconnect: ({ context }) => context.reconnectCount < context.maxReconnects,
    },
  }).createMachine({
    id: 'connection',
    initial: 'connecting',
    context: {
      runtime: null,
      error: null,
      connectErrorMessage: null,
      attempts: 0,
      maxRetries: cfg.maxRetries ?? 3,
      retryDelayMs: cfg.retryDelayMs ?? 1000,
      reconnectCount: 0,
      maxReconnects: cfg.maxReconnects ?? 5,
      stableResetMs: cfg.stableResetMs ?? 10000,
    },
    states: {
      connecting: {
        invoke: {
          src: 'connector',
          onDone: {
            target: 'authenticating',
            actions: [{ type: 'recordRuntime', params: ({ event }) => ({ runtime: event.output }) }],
          },
          onError: {
            target: 'connect_retry_decision',
            actions: [{
              type: 'recordConnectError',
              params: ({ event }) => ({ message: (event.error as Error)?.message ?? String(event.error ?? '') }),
            }],
          },
        },
      },
      connect_retry_decision: {
        always: [
          { guard: 'canRetry', target: 'reconnecting', actions: [{ type: 'incAttempts' }] },
          { target: 'failed', actions: [{ type: 'recordError', params: ({ context }) => ({ message: classifyConnectFailure(context) }) }] },
        ],
      },
      reconnecting: {
        after: { backoff: 'connecting' },
      },
      authenticating: {
        invoke: {
          src: 'authenticator',
          input: ({ context }) => ({ runtime: context.runtime as BleRuntime }),
          // A clean auth resets the connect retry budget. The reconnect-storm
          // counter is NOT reset here: resetting it on every ready entry would
          // let a connect-then-instantly-drop storm loop forever. Instead it is
          // cleared only after the link stays stable in `ready` (see below), so
          // isolated disconnects recover while a true storm eventually gives up.
          onDone: { target: 'ready', actions: [{ type: 'resetAttempts' }] },
          onError: {
            // Auth failures are terminal (wrong PIN); we do not retry them.
            target: 'failed',
            actions: [{
              type: 'recordError',
              params: ({ event }) => ({ message: isAuthError(event.error) ? ((event.error as Error).message ?? 'auth failed') : 'auth failed' }),
            }],
          },
        },
      },
      ready: {
        // Surviving in `ready` for stableResetMs proves the link is healthy, so
        // clear the storm counter: subsequent isolated drops get a fresh budget.
        // A connect-then-instant-drop storm never reaches this delay (the next
        // DISCONNECTED fires first), so its counter keeps climbing to the cap.
        after: { stable: { actions: [{ type: 'resetReconnectCount' }] } },
        on: {
          CANCEL: 'cancelled',
          // Mid-session link drop: try to recover with a fresh connect+re-auth.
          // A fresh disconnect starts a new connect retry budget (resetAttempts)
          // but counts against the reconnect-storm cap (incReconnectCount).
          DISCONNECTED: 'reconnect_decision',
        },
      },
      reconnect_decision: {
        entry: [{ type: 'incReconnectCount' }],
        always: [
          { guard: 'canReconnect', target: 'reconnecting', actions: [{ type: 'resetAttempts' }] },
          { target: 'failed', actions: [{ type: 'recordError', params: () => ({ message: 'connexion instable (déconnexions répétées)' }) }] },
        ],
      },
      failed: {
        on: { RETRY: { target: 'connecting', actions: [{ type: 'resetAttempts' }, { type: 'resetReconnectCount' }, assign({ error: () => null })] } },
      },
      cancelled: { type: 'final' },
    },
  });
}
