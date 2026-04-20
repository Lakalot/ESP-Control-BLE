import React, { type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { palette } from '../../../ui/theme/ui';

export function V5ScreenShell({ children }: { children: ReactNode }) {
  return (
    <ScrollView
      testID="v5-screen-shell"
      style={styles.screen}
      contentContainerStyle={styles.content}
    >
      <View style={styles.stack}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bg },
  content: { padding: 16 },
  stack: { gap: 16 },
});
