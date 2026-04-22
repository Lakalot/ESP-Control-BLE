import React from 'react';
import { Text, View } from 'react-native';
import type { WidgetProps } from '../widgetRegistry';
import { palette } from '../../../ui/theme/ui';

export function TimerWidget({ node, value, tone }: WidgetProps) {
  const val = value?.value;
  const display = val?.kind === 'int' || val?.kind === 'uint' ? `${Math.floor(val.value / 60)}:${String(val.value % 60).padStart(2, '0')}` : '--:--';
  return (
    <View>
      <Text style={{ color: palette.muted, fontSize: 12 }}>{node.label ?? node.slug}</Text>
      <Text style={{ color: tone ?? palette.text, fontSize: 32, fontWeight: 'bold', fontFamily: 'monospace' }}>{display}</Text>
    </View>
  );
}
