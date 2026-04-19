import { assign, fromPromise, setup } from 'xstate';
import type { InvokeResult } from './ManifestV5Runtime';

export interface ActionMachineInput {
  invoke: (actionSlug: string, input: Record<string, unknown>) => Promise<InvokeResult>;
  cooldownMs?: number;
}

interface Context {
  actionSlug: string | null;
  input: Record<string, unknown>;
  result: Record<string, unknown> | null;
  error: string | null;
  cooldownMs: number;
}

type Event =
  | { type: 'INVOKE'; actionSlug: string; input: Record<string, unknown> }
  | { type: 'RESET' };

/**
 * XState v5 action lifecycle: idle → pending → (success | error) → [cooldown] → idle.
 *
 * - `pending` runs the promise returned by the `invoke` actor.
 * - `success`/`error` store outcome in context.
 * - Cooldown is a fixed delay in `cooldown` state; `cooldownMs: 0` skips it.
 * - `RESET` returns to idle from any terminal state.
 */
export function createActionMachine(cfg: ActionMachineInput) {
  const cooldownMs = cfg.cooldownMs ?? 0;
  return setup({
    types: {} as { context: Context; events: Event },
    actors: {
      invoker: fromPromise(async ({ input }: { input: { actionSlug: string; input: Record<string, unknown> } }) => {
        return cfg.invoke(input.actionSlug, input.input);
      }),
    },
    actions: {
      recordInput: assign({
        actionSlug: (_, params: { actionSlug: string; input: Record<string, unknown> }) => params.actionSlug,
        input: (_, params: { actionSlug: string; input: Record<string, unknown> }) => params.input,
        result: () => null,
        error: () => null,
      }),
      recordResult: assign({ result: (_, params: { result: Record<string, unknown> | null }) => params.result }),
      recordError: assign({ error: (_, params: { message: string }) => params.message }),
      clear: assign({ actionSlug: () => null, input: () => ({}), result: () => null, error: () => null }),
    },
  }).createMachine({
    id: 'action',
    initial: 'idle',
    context: { actionSlug: null, input: {}, result: null, error: null, cooldownMs },
    states: {
      idle: {
        on: {
          INVOKE: {
            target: 'pending',
            actions: [{ type: 'recordInput', params: ({ event }) => ({ actionSlug: event.actionSlug, input: event.input }) }],
          },
        },
      },
      pending: {
        invoke: {
          src: 'invoker',
          input: ({ context }) => ({ actionSlug: context.actionSlug ?? '', input: context.input }),
          onDone: [
            {
              guard: ({ event }) => (event.output as InvokeResult).ok,
              target: 'success',
              actions: [{ type: 'recordResult', params: ({ event }) => ({ result: (event.output as InvokeResult).result ?? null }) }],
            },
            {
              target: 'error',
              actions: [{ type: 'recordError', params: ({ event }) => ({ message: (event.output as InvokeResult).message ?? 'unknown' }) }],
            },
          ],
          onError: {
            target: 'error',
            actions: [{ type: 'recordError', params: ({ event }) => ({ message: (event.error as Error)?.message ?? 'unknown' }) }],
          },
        },
      },
      success: {
        always: [
          { guard: ({ context }) => context.cooldownMs > 0, target: 'cooldown' },
          { target: 'idle', actions: 'clear' },
        ],
      },
      error: {
        on: { RESET: { target: 'idle', actions: 'clear' } },
      },
      cooldown: {
        after: { [cooldownMs]: { target: 'idle', actions: 'clear' } },
      },
    },
  });
}