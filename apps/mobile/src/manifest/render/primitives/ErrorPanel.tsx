import React, { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { palette, radius } from '../../../ui/theme/ui';

export function ErrorPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View testID="error-panel" style={styles.panel}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: withAlpha(palette.danger, 0.08),
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: withAlpha(palette.danger, 0.25),
    padding: 16,
    gap: 6,
  },
  title: {
    color: palette.danger,
    fontSize: 15,
    fontWeight: '700',
  },
  body: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 19,
  },
});

function withAlpha(hex: string, alpha: number): string {
  const safeHex = hex.replace('#', '');
  if (safeHex.length !== 6) return `rgba(255,255,255,${alpha})`;
  const r = parseInt(safeHex.slice(0, 2), 16);
  const g = parseInt(safeHex.slice(2, 4), 16);
  const b = parseInt(safeHex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
}
