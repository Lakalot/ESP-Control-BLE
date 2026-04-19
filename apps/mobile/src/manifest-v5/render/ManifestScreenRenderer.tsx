import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useDeviceUi } from '../runtime/useDeviceUi';
import { buildRuleContext } from '../rules/ruleContext';
import { NodeRenderer } from './NodeRenderer';
import type { ManifestV5Runtime } from '../runtime/ManifestV5Runtime';

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

  if (state.matches('loading_manifest')) return <ActivityIndicator />;
  if (state.matches('error')) return <Text>Error: {state.context.error}</Text>;
  if (!manifest) return null;

  const screen = manifest.screens.get(screenSlug);
  if (!screen) return <Text>Unknown screen: {screenSlug}</Text>;

  return (
    <View style={{ padding: 16 }}>
      <NodeRenderer
        manifest={manifest}
        slug={screen.rootNodeSlug}
        snapshot={snapshot}
        ctx={ctx}
        onInvoke={onInvoke}
        pendingActions={pendingActions}
      />
    </View>
  );
}