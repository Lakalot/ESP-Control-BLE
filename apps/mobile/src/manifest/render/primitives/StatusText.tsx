import React, { type ReactNode } from 'react';
import { StyleSheet, Text } from 'react-native';
import { palette } from '../../../ui/theme/ui';

export function StatusText({ children }: { children: ReactNode }) {
  return <Text style={styles.text}>{children}</Text>;
}

const styles = StyleSheet.create({
  text: { color: palette.muted, fontSize: 13, lineHeight: 19 },
});
