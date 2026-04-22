import { assign, setup } from 'xstate';
import { evaluateRule } from '../rules/evaluateRule';
import type { RuntimeRule } from '../model/runtime.types';
import type { FlatRuleContext } from '../rules/ruleContext';

interface Input {
  screenSlug: string;
  entryRules: readonly RuntimeRule[];
}

interface Context {
  screenSlug: string;
  entryRules: readonly RuntimeRule[];
  lastReason: string | null;
}

type Event =
  | { type: 'ENTER'; context: FlatRuleContext }
  | { type: 'STALE' }
  | { type: 'FRESH' }
  | { type: 'EXIT' };

/**
 * Per-screen lifecycle. `loading_snapshot` covers the initial paint; once the
 * first snapshot arrives the screen is `ready`. `STALE` fires when a
 * subscribed resource exceeds its `staleAfterMs` (handled in the React hook).
 */
export function createScreenMachine(cfg: Input) {
  return setup({
    types: {} as { context: Context; events: Event },
    guards: {
      entryAllowed: ({ context, event }) => {
        if (event.type !== 'ENTER') return false;
        return context.entryRules.every((r) => Boolean(evaluateRule(r, event.context)));
      },
    },
    actions: {
      recordBlocked: assign({ lastReason: () => 'entry rule rejected' }),
    },
  }).createMachine({
    id: `screen-${cfg.screenSlug}`,
    initial: 'gated',
    context: { screenSlug: cfg.screenSlug, entryRules: cfg.entryRules, lastReason: null },
    states: {
      gated: {
        on: {
          ENTER: [
            { guard: 'entryAllowed', target: 'loading_snapshot' },
            { target: 'blocked', actions: 'recordBlocked' },
          ],
        },
      },
      blocked: {
        on: { ENTER: [{ guard: 'entryAllowed', target: 'loading_snapshot' }] },
      },
      loading_snapshot: {
        on: { FRESH: 'ready', STALE: 'staleData', EXIT: 'gated' },
      },
      ready: {
        on: { STALE: 'staleData', EXIT: 'gated' },
      },
      staleData: {
        on: { FRESH: 'ready', EXIT: 'gated' },
      },
    },
  });
}