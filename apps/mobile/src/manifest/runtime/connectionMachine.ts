import { assign, fromPromise, setup } from 'xstate';
import type { BleRuntime } from './BleRuntime';

export interface ConnectionInput {
  connect: () => Promise<BleRuntime>;
  authenticate: (runtime: BleRuntime) => Promise<void>;
  pin: string;
  maxRetries?: number;
  retryDelayMs?: number;
}

interface Context {
  runtime: BleRuntime | null;
  error: string | null;
  attempts: number;
  maxRetries: number;
  retryDelayMs: number;
}

type Event = { type: 'RETRY' } | { type: 'CANCEL' };

function isAuthError(err: unknown): boolean {
  return (err as Error)?.name === 'AuthError' || /PIN|auth/i.test((err as Error)?.message ?? '');
}

/**
 * Session lifecycle: connect -> authenticate -> ready. Transport failures during
 * connect are retried with a linear backoff up to maxRetries; an auth failure
 * (wrong PIN) is terminal (no retry). The manifest load + subscriptions are
 * owned by deviceUiMachine, which runs once this machine exposes `runtime`.
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
      incAttempts: assign({ attempts: ({ context }) => context.attempts + 1 }),
      resetAttempts: assign({ attempts: () => 0 }),
    },
    delays: {
      backoff: ({ context }) => context.retryDelayMs * Math.max(1, context.attempts),
    },
    guards: {
      canRetry: ({ context }) => context.attempts < context.maxRetries,
    },
  }).createMachine({
    id: 'connection',
    initial: 'connecting',
    context: {
      runtime: null,
      error: null,
      attempts: 0,
      maxRetries: cfg.maxRetries ?? 3,
      retryDelayMs: cfg.retryDelayMs ?? 1000,
    },
    states: {
      connecting: {
        invoke: {
          src: 'connector',
          onDone: {
            target: 'authenticating',
            actions: [{ type: 'recordRuntime', params: ({ event }) => ({ runtime: event.output }) }],
          },
          onError: 'connect_retry_decision',
        },
      },
      connect_retry_decision: {
        always: [
          { guard: 'canRetry', target: 'reconnecting', actions: [{ type: 'incAttempts' }] },
          { target: 'failed', actions: [{ type: 'recordError', params: () => ({ message: 'connection failed' }) }] },
        ],
      },
      reconnecting: {
        after: { backoff: 'connecting' },
      },
      authenticating: {
        invoke: {
          src: 'authenticator',
          input: ({ context }) => ({ runtime: context.runtime as BleRuntime }),
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
        on: { CANCEL: 'cancelled' },
      },
      failed: {
        on: { RETRY: { target: 'connecting', actions: [{ type: 'resetAttempts' }, assign({ error: () => null })] } },
      },
      cancelled: { type: 'final' },
    },
  });
}
