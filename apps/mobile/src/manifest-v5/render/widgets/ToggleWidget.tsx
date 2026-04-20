import React, { useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import type { WidgetProps } from '../widgetRegistry';
import { palette } from '../../../ui/theme/ui';
import { V5ValueCard } from '../primitives/V5ValueCard';

export function ToggleWidget({ node, action, value, enabled, isPending, onInvoke }: WidgetProps) {
  const val = value?.value;
  const isKnown = val?.kind === 'bool';
  const confirmedValue = isKnown ? val.value : false;

  // Optimistic local state: update immediately on user interaction,
  // then sync back when the server-confirmed Delta arrives.
  const [localValue, setLocalValue] = useState<boolean | null>(null);
  const isOn = localValue ?? confirmedValue;

  // When the server confirms (Delta received), clear the optimistic override.
  useEffect(() => {
    if (localValue !== null) {
      setLocalValue(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.updatedAt]);

  const canToggle = enabled && !isPending && Boolean(node.bind?.action) && Boolean(action);

  return (
    <V5ValueCard>
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={styles.title}>{node.label ?? node.slug}</Text>
          <Text style={[styles.status, isKnown ? (isOn ? styles.on : styles.off) : styles.unknown]}>
            {isKnown ? (isOn ? 'On' : 'Off') : 'Unknown'}
          </Text>
        </View>
        <Switch
          disabled={!canToggle}
          value={isOn}
          onValueChange={(nextValue) => {
            if (!node.bind?.action) return;
            setLocalValue(nextValue);
            onInvoke(node.bind.action, { value: nextValue });
          }}
        />
      </View>
    </V5ValueCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  copy: { flex: 1, gap: 4 },
  title: { color: palette.text, fontSize: 16, fontWeight: '600' },
  status: { fontSize: 13, fontWeight: '600' },
  on: { color: palette.success },
  off: { color: palette.muted },
  unknown: { color: palette.warn },
});
