import React from 'react';
import { Text, View } from 'react-native';
import type { WidgetProps } from '../widgetRegistry';
import { palette } from '../../../ui/theme/ui';

export function StatWidget({ node, value, tone }: WidgetProps) {
  const val = value?.value;
  const display = val?.kind === 'int' || val?.kind === 'uint' || val?.kind === 'float' ? val.value : '---';
  return (
    <View>
      <Text style={{ color: palette.muted, fontSize: 12 }}>{node.label ?? node.slug}</Text>
      <Text style={{ color: tone ?? palette.text, fontSize: 24, fontWeight: 'bold' }}>{display}</Text>
    </View>
  );
}
