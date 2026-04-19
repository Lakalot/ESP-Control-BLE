import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import type { WidgetProps } from '../widgetRegistry';
import { palette, radius } from '../../../ui/theme/ui';

export function ButtonWidget({ node, isPending, enabled, onInvoke }: WidgetProps) {
  return (
    <TouchableOpacity
      style={[styles.button, (!enabled || isPending) && styles.disabled]}
      disabled={!enabled || isPending}
      onPress={() => {
        if (node.bind?.action) onInvoke(node.bind.action, {});
      }}
      activeOpacity={0.8}
    >
      {isPending ? (
        <ActivityIndicator color={palette.bg} size="small" />
      ) : (
        <Text style={styles.label}>{node.label ?? node.slug}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: palette.accent,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    color: palette.bg,
    fontWeight: '700',
    fontSize: 14,
  },
});
