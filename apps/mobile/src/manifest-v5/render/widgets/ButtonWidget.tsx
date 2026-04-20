import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import type { WidgetProps } from '../widgetRegistry';
import { palette, radius, withAlpha } from '../../../ui/theme/ui';
import { V5ValueCard } from '../primitives/V5ValueCard';

export function ButtonWidget({ node, action, isPending, enabled, onInvoke }: WidgetProps) {
  const isDestructive = action?.dangerLevel === 'dangerous';
  const canPress = enabled && !isPending && Boolean(node.bind?.action) && Boolean(action);

  return (
    <V5ValueCard>
      <TouchableOpacity
        testID="v5-button-widget"
        style={[styles.button, isDestructive ? styles.buttonDanger : styles.buttonDefault, !canPress && styles.disabled]}
        disabled={!canPress}
        onPress={() => {
          if (node.bind?.action) onInvoke(node.bind.action, {});
        }}
        activeOpacity={0.8}
      >
        {isPending ? (
          <ActivityIndicator color={palette.white} size="small" />
        ) : (
          <Text style={styles.label}>{node.label ?? node.slug}</Text>
        )}
      </TouchableOpacity>
    </V5ValueCard>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  buttonDefault: {
    backgroundColor: palette.accent,
    borderColor: palette.accent,
  },
  buttonDanger: {
    backgroundColor: palette.danger,
    borderColor: withAlpha(palette.white, 0.18),
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    color: palette.white,
    fontWeight: '700',
    fontSize: 14,
  },
});
