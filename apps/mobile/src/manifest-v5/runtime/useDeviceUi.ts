import { useMachine } from '@xstate/react';
import { useEffect, useMemo, useState } from 'react';
import { createDeviceUiMachine } from './deviceUiMachine';
import type { ManifestV5Runtime } from './ManifestV5Runtime';
import type { SnapshotMap } from '../model/snapshot.types';

export interface UseDeviceUiResult {
  state: ReturnType<ReturnType<typeof createDeviceUiMachine>['getInitialSnapshot']>;
  manifest: ReturnType<ReturnType<typeof createDeviceUiMachine>['getInitialSnapshot']>['context']['manifest'];
  snapshot: SnapshotMap;
  reload: () => void;
}

/** Single entry point for a v5-rendered screen: loads manifest, subscribes
 *  to all declared `subscribe` resources, and exposes a live SnapshotMap. */
export function useDeviceUi(runtime: ManifestV5Runtime): UseDeviceUiResult {
  const machine = useMemo(() => createDeviceUiMachine({ runtime }), [runtime]);
  const [state, send] = useMachine(machine);
  const [snapshot, setSnapshot] = useState<SnapshotMap>(new Map());

  useEffect(() => {
    let unsub: (() => void) | undefined;
    runtime.loadManifest().then(async (manifest) => {
      const snap = await runtime.snapshot();
      setSnapshot(new Map(snap));
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
    });
    return () => { unsub?.(); };
  }, [runtime]);

  return {
    state,
    manifest: state.context.manifest,
    snapshot,
    reload: () => send({ type: 'RELOAD' }),
  };
}