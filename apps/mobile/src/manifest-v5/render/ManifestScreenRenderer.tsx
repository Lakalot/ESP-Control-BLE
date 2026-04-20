import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useDeviceUi } from '../runtime/useDeviceUi';
import { buildRuleContext } from '../rules/ruleContext';
import { NodeRenderer } from './NodeRenderer';
import type { ManifestV5Runtime } from '../runtime/ManifestV5Runtime';
import { V5ScreenShell } from './primitives/V5ScreenShell';
import { V5StatusText } from './primitives/V5StatusText';
import { V5ErrorPanel } from './primitives/V5ErrorPanel';

export interface ManifestScreenRendererProps {
  runtime: ManifestV5Runtime;
  screenSlug: string;
}

export function ManifestScreenRenderer({ runtime, screenSlug }: ManifestScreenRendererProps) {
  const { state, manifest, snapshot } = useDeviceUi(runtime);
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
      <V5ScreenShell>
        <ActivityIndicator />
      </V5ScreenShell>
    );
  }

  if (state.matches('error')) {
    return (
      <V5ScreenShell>
        <V5ErrorPanel title="Unable to load manifest">
          {String(state.context.error ?? 'Unknown error')}
        </V5ErrorPanel>
      </V5ScreenShell>
    );
  }

  if (!manifest) return null;

  const screen = manifest.screens.get(screenSlug) ?? manifest.screens.values().next().value;
  if (!screen) {
    return (
      <V5ScreenShell>
        <V5StatusText>No screens in manifest</V5StatusText>
      </V5ScreenShell>
    );
  }

  return (
    <V5ScreenShell>
      <NodeRenderer
        manifest={manifest}
        slug={screen.rootNodeSlug}
        snapshot={snapshot}
        ctx={ctx}
        onInvoke={onInvoke}
        pendingActions={pendingActions}
      />
    </V5ScreenShell>
  );
}
