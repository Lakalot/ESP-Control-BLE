import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { WidgetProps } from '../widgetRegistry';
import { palette } from '../../../ui/theme/ui';
import { ValueCard } from '../primitives/ValueCard';

function formatValue(raw: number, formatHint: string | undefined): string {
  switch (formatHint) {
    case 'float_2': return raw.toFixed(2);
    case 'float_1': return raw.toFixed(1);
    case 'percent': return `${Math.round(raw)}`;
    default:        return String(Math.round(raw));
  }
}

function unitSuffix(formatHint: string | undefined): string {
  switch (formatHint) {
    case 'percent': return '%';
    default:        return '';
  }
}

export function StatWidget({ node, value, tone }: WidgetProps) {
  const val = value?.value;
  const isNumeric = val?.kind === 'int' || val?.kind === 'uint' || val?.kind === 'float';
  const raw = isNumeric ? (val as { value: number }).value : null;
  const display = raw !== null ? formatValue(raw, node.formatHint ?? undefined) : '---';
  const suffix  = raw !== null ? unitSuffix(node.formatHint ?? undefined) : '';

  return (
    <ValueCard>
      <Text style={styles.label}>{node.label ?? node.slug}</Text>
      <View style={styles.row}>
        <Text style={[styles.value, { color: tone ?? palette.text }]}>{display}</Text>
        {suffix ? <Text style={[styles.unit, { color: tone ?? palette.muted }]}>{suffix}</Text> : null}
      </View>
    </ValueCard>
  );
}

const styles = StyleSheet.create({
  label: { color: palette.muted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8 },
  row:   { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  value: { fontSize: 28, fontWeight: '700' },
  unit:  { fontSize: 14, fontWeight: '600', paddingBottom: 3 },
});
