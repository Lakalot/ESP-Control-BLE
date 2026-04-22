import React from 'react';
import { Text, View } from 'react-native';
import type { WidgetProps } from '../widgetRegistry';
import { palette, radius } from '../../../ui/theme/ui';

export function BadgeWidget({ node, tone }: WidgetProps) {
  return (
    <View style={{ backgroundColor: tone ?? palette.accentAlt, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.sm, alignSelf: 'flex-start' }}>
      <Text style={{ color: palette.text, fontSize: 12, fontWeight: 'bold' }}>{node.label ?? node.slug}</Text>
    </View>
  );
}
