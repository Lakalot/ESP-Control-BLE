import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useDeviceUi } from '../runtime/useDeviceUi';
import { buildRuleContext } from '../rules/ruleContext';
import { NodeRenderer } from './NodeRenderer';
import type { ManifestRuntime } from '../runtime/ManifestRuntime';
import { ScreenShell } from './primitives/ScreenShell';
import { StatusText } from './primitives/StatusText';
import { ErrorPanel } from './primitives/ErrorPanel';
import { BottomNavBar } from './primitives/BottomNavBar';

export interface ManifestScreenRendererProps {
  runtime: ManifestRuntime;
  screenSlug: string;
}

export function ManifestScreenRenderer({ runtime, screenSlug }: ManifestScreenRendererProps) {
  const { state, manifest, snapshot } = useDeviceUi(runtime);
  const [pendingActions, setPendingActions] = useState<ReadonlySet<string>>(new Set());
  const [activeScreenSlug, setActiveScreenSlug] = useState(screenSlug);
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

  const firstScreenSlug = manifest?.screens.values().next().value?.slug;
  const navItems = manifest?.appShell?.navBar?.items ?? [];
  const requestedScreenSlug = manifest?.screens.get(screenSlug)?.slug;
  const initialScreenSlug = navItems[0]?.screenSlug ?? requestedScreenSlug ?? firstScreenSlug;

  useEffect(() => {
    if (initialScreenSlug) {
      setActiveScreenSlug(initialScreenSlug);
    }
  }, [initialScreenSlug]);

  const ctx = useMemo(
    () => buildRuleContext({ snapshot, form: {}, screen: { id: activeScreenSlug }, runtime: { online: true } }),
    [activeScreenSlug, snapshot],
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

  const screen = manifest.screens.get(activeScreenSlug) ?? manifest.screens.values().next().value;
  if (!screen) {
    return (
      <ScreenShell>
        <StatusText>No screens in manifest</StatusText>
      </ScreenShell>
    );
  }

  return (
    <View style={styles.container}>
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
      {navItems.length > 0 ? (
        <BottomNavBar
          items={navItems}
          activeScreenSlug={screen.slug}
          onSelect={setActiveScreenSlug}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
