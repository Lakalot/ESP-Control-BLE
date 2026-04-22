import React from 'react';
import { StyleSheet, Text } from 'react-native';
import type { WidgetProps } from '../widgetRegistry';
import { palette } from '../../../ui/theme/ui';
import { ValueCard } from '../primitives/ValueCard';

export function TextWidget({ node, tone }: WidgetProps) {
  const title = node.label ?? node.slug;
  const body = node.formatHint && node.formatHint !== title ? node.formatHint : undefined;

  return (
    <ValueCard>
      <Text testID="text-widget" style={[styles.title, { color: tone ?? palette.text }]}>
        {title}
      </Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
    </ValueCard>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 16, fontWeight: '600' },
  body: { color: palette.muted, fontSize: 13, lineHeight: 19 },
});
