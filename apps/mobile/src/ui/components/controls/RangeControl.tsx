import Slider from '@react-native-community/slider';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { ControlProps } from '../../../types/control.types';
import { NodeVariant } from '../../../types/manifest.types';
import { palette, radius, withAlpha } from '../../theme/ui';
import { formatValue } from '../../../utils/formatValue';
import { CardShell } from './shared/CardShell';
import { makeRangePayload } from './shared/controlUtils';

export function RangeControl({
  command,
  currentValue,
  isPending,
  onAction,
  variant,
  surfaceStyle,
  titleOverride,
  subtitle,
}: ControlProps) {
  const accentColor = command.options.color ?? palette.accentAlt;
  const isDisabled = Boolean(command.options.disabled);
  const numericValue = typeof currentValue === 'number' ? currentValue : null;
  const rangeStep = command.options.step ?? 1;
  const rangeDisplay = numericValue != null ? formatValue(numericValue, command.options) : '--';

  const metaItems = useMemo(() => {
    const items: string[] = [];
    if (isDisabled) items.push('Desactive');
    return items;
  }, [isDisabled]);

  if (!command.params) return null;

  return (
    <CardShell
      command={command}
      variant={variant}
      surfaceStyle={surfaceStyle}
      titleOverride={titleOverride}
      subtitle={subtitle}
      isPending={isPending}
      isDisabled={isDisabled}
      metaItems={metaItems}
    >
      <View style={styles.rangePanel}>
        <View style={styles.rangeHeader}>
          <Text
            style={[
              styles.rangeValue,
              variant === NodeVariant.COMPACT && styles.rangeValueCompact,
              variant === NodeVariant.HERO && styles.rangeValueHero,
              { color: accentColor },
            ]}
          >
            {rangeDisplay}
          </Text>
          <Text style={styles.rangeStep}>Pas {rangeStep}</Text>
        </View>

        <Slider
          minimumValue={command.params.min}
          maximumValue={command.params.max}
          step={rangeStep}
          value={numericValue ?? command.params.min}
          onSlidingComplete={(value) => {
            if (!isDisabled) onAction(command.id, makeRangePayload(value));
          }}
          disabled={isPending || isDisabled}
          minimumTrackTintColor={accentColor}
          maximumTrackTintColor={withAlpha(palette.white, 0.08)}
          thumbTintColor={palette.white}
          style={styles.slider}
        />

        <View style={styles.rangeLabels}>
          <Text style={styles.rangeLimit}>
            {command.options.minLabel ??
              `${command.params.min}${command.options.unit ? ` ${command.options.unit}` : ''}`}
          </Text>
          <Text style={styles.rangeLimit}>
            {command.options.maxLabel ??
              `${command.params.max}${command.options.unit ? ` ${command.options.unit}` : ''}`}
          </Text>
        </View>
      </View>

      {isDisabled ? <View pointerEvents="none" style={styles.disabledOverlay} /> : null}
    </CardShell>
  );
}

const styles = StyleSheet.create({
  rangePanel: {
    borderRadius: radius.md,
    backgroundColor: palette.panelInset,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 14,
  },
  rangeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  rangeValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  rangeValueCompact: {
    fontSize: 20,
  },
  rangeValueHero: {
    fontSize: 28,
  },
  rangeStep: {
    fontSize: 12,
    color: palette.muted,
  },
  slider: {
    height: 40,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rangeLimit: {
    fontSize: 11,
    color: palette.subtle,
  },
  disabledOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: withAlpha(palette.bg, 0.18),
  },
});
