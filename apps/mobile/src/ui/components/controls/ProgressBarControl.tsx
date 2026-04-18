import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { palette, radius, withAlpha } from '../../theme/ui';
import { CmdOptions } from '../../../types/manifest.types';
import { formatValue } from '../../../utils/formatValue';

interface Props {
  value: number | null;
  accentColor: string;
  opts: CmdOptions;
}

export function ProgressBarControl({ value, accentColor, opts }: Props) {
  const percent = value != null ? Math.max(0, Math.min(100, value)) : 0;
  const label = value != null ? formatValue(value, opts) : '--';

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <View>
          <Text style={styles.caption}>Progression</Text>
          <Text style={[styles.percentLabel, { color: accentColor }]}>
            {value != null ? `${percent}%` : '--'}
          </Text>
        </View>
        {(opts.unit || opts.format || opts.scale) ? (
          <Text style={styles.valueLabel}>{label}</Text>
        ) : null}
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%`, backgroundColor: accentColor }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    borderRadius: radius.md,
    backgroundColor: palette.panelInset,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 14,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 12,
  },
  caption: {
    fontSize: 12,
    color: palette.subtle,
    marginBottom: 4,
  },
  percentLabel: {
    fontSize: 24,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  valueLabel: {
    fontSize: 13,
    color: palette.muted,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  track: {
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: withAlpha(palette.white, 0.08),
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
    minWidth: 6,
  },
});
