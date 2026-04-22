import { assign, fromPromise, setup } from 'xstate';
import type { RuntimeManifest } from '../model/runtime.types';
import type { ManifestRuntime } from './ManifestRuntime';

interface Input { runtime: ManifestRuntime; }

interface Context {
  manifest: RuntimeManifest | null;
  error: string | null;
}

type Event =
  | { type: 'RELOAD' }
  | { type: 'CLEAR_ERROR' };

/**
 * Top-level app UI machine. Kept intentionally small: it loads the manifest,
 * exposes it as context, and provides a single RELOAD transition.
 * Snapshot subscription + staleness live in the React layer (useDeviceUi)
 * because they depend on resource-specific staleAfterMs, not global state.
 */
export function createDeviceUiMachine(cfg: Input) {
  return setup({
    types: {} as { context: Context; events: Event },
    actors: {
      loader: fromPromise(async () => cfg.runtime.loadManifest()),
    },
    actions: {
      recordManifest: assign({ manifest: (_, params: { manifest: RuntimeManifest }) => params.manifest, error: () => null }),
      recordError: assign({ error: (_, params: { message: string }) => params.message }),
    },
  }).createMachine({
    id: 'deviceUi',
    initial: 'loading_manifest',
    context: { manifest: null, error: null },
    states: {
      loading_manifest: {
        invoke: {
          src: 'loader',
          onDone: {
            target: 'ready',
            actions: [{ type: 'recordManifest', params: ({ event }) => ({ manifest: event.output }) }],
          },
          onError: {
            target: 'error',
            actions: [{ type: 'recordError', params: ({ event }) => ({ message: (event.error as Error)?.message ?? 'unknown' }) }],
          },
        },
      },
      ready: {
        on: { RELOAD: 'loading_manifest' },
      },
      error: {
        on: {
          RELOAD: { target: 'loading_manifest', actions: assign({ error: () => null }) },
          CLEAR_ERROR: { actions: assign({ error: () => null }) },
        },
      },
    },
  });
}