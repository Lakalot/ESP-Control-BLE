import React, { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { palette, radius } from '../../../ui/theme/ui';

export function SectionCard({
  title,
  subtitle,
  children,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.card}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.panel,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 16,
    gap: 12,
  },
  title: { color: palette.text, fontSize: 18, fontWeight: '700' },
  subtitle: { color: palette.muted, fontSize: 13, lineHeight: 19 },
  body: { gap: 12 },
});
