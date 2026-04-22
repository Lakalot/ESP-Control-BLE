import { useMachine } from '@xstate/react';
import { useEffect, useMemo, useState } from 'react';
import { createDeviceUiMachine } from './deviceUiMachine';
import type { ManifestRuntime } from './ManifestRuntime';
import type { ResourceState, SnapshotMap } from '../model/snapshot.types';

export interface UseDeviceUiResult {
  state: ReturnType<ReturnType<typeof createDeviceUiMachine>['getInitialSnapshot']>;
  manifest: ReturnType<ReturnType<typeof createDeviceUiMachine>['getInitialSnapshot']>['context']['manifest'];
  snapshot: SnapshotMap;
  reload: () => void;
}

/** Single entry point for a rendered screen: loads manifest, subscribes
 *  to all declared `subscribe` resources, and exposes a live SnapshotMap. */
export function useDeviceUi(runtime: ManifestRuntime): UseDeviceUiResult {
  const machine = useMemo(() => createDeviceUiMachine({ runtime }), [runtime]);
  const [state, send] = useMachine(machine);
  const [snapshot, setSnapshot] = useState<Map<string, ResourceState>>(new Map());
  const manifest = state.context.manifest;

  useEffect(() => {
    if (!manifest) return;

    let cancelled = false;
    let unsub: (() => void) | undefined;
    Promise.resolve(runtime.snapshot())
      .then(async (snap) => {
        if (cancelled) return;
        setSnapshot(new Map(snap as Map<string, ResourceState>));
        const subscribeSlugs = [...manifest.resources.values()]
          .filter((resource) => resource.readMode === 'subscribe')
          .map((resource) => resource.slug);
        unsub = runtime.subscribe(subscribeSlugs, (update) => {
          setSnapshot((prev) => new Map(prev).set(update.slug, {
            slug: update.slug,
            value: update.value,
            updatedAt: update.updatedAt,
            stale: false,
          }));
        });
      })
      .catch(() => {
        // The XState loader owns the visible error state.
      });

    return () => {
      cancelled = true;
      unsub?.();
    };
  }, [manifest, runtime]);

  return {
    state,
    manifest,
    snapshot,
    reload: () => send({ type: 'RELOAD' }),
  };
}
