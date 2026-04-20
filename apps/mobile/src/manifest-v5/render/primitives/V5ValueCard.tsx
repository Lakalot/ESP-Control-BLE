import React, { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { palette, radius } from '../../../ui/theme/ui';

export function V5ValueCard({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.panelElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    padding: 14,
    gap: 8,
  },
});
