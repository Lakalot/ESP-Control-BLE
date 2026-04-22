import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useDeviceUi } from '../runtime/useDeviceUi';
import { buildRuleContext } from '../rules/ruleContext';
import { NodeRenderer } from './NodeRenderer';
import type { ManifestRuntime } from '../runtime/ManifestRuntime';
import { ScreenShell } from './primitives/ScreenShell';
import { StatusText } from './primitives/StatusText';
import { ErrorPanel } from './primitives/ErrorPanel';

export interface ManifestScreenRendererProps {
  runtime: ManifestRuntime;
  screenSlug: string;
}

export function ManifestScreenRenderer({ runtime, screenSlug }: ManifestScreenRendererProps) {
  const { state, manifest, snapshot } = useDeviceUi(runtime);
  console.log('[ManifestScreenRenderer] state.value=', state.value, 'manifest=', !!manifest, 'hasSnapshot=', snapshot.size);
  const [pendingActions, setPendingActions] = useState<ReadonlySet<string>>(new Set());
  const pendingRef = useRef(pendingActions);
  pendingRef.current = pendingActions;

  const onInvoke = useCallback(
    (actionSlug: string, input: Record<string, unknown>) => {
      setPendingActions((prev) => new Set(prev).add(actionSlug));
      runtime
        .invokeAction(actionSlug, input)
        .finally(() => {
          const next = new Set(pendingRef.current);
          next.delete(actionSlug);
          setPendingActions(next);
        });
    },
    [runtime],
  );

  const ctx = useMemo(
    () => buildRuleContext({ snapshot, form: {}, screen: { id: screenSlug }, runtime: { online: true } }),
    [snapshot, screenSlug],
  );

  if (state.matches('loading_manifest')) {
    return (
      <ScreenShell>
        <ActivityIndicator />
      </ScreenShell>
    );
  }

  if (state.matches('error')) {
    return (
      <ScreenShell>
        <ErrorPanel title="Unable to load manifest">
          {String(state.context.error ?? 'Unknown error')}
        </ErrorPanel>
      </ScreenShell>
    );
  }

  if (!manifest) return null;

  const screen = manifest.screens.get(screenSlug) ?? manifest.screens.values().next().value;
  if (!screen) {
    return (
      <ScreenShell>
        <StatusText>No screens in manifest</StatusText>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <NodeRenderer
        manifest={manifest}
        slug={screen.rootNodeSlug}
        snapshot={snapshot}
        ctx={ctx}
        onInvoke={onInvoke}
        pendingActions={pendingActions}
      />
    </ScreenShell>
  );
}
