import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import type { WidgetProps } from '../widgetRegistry';
import { palette } from '../../../ui/theme/ui';
import { ValueCard } from '../primitives/ValueCard';

export function SliderWidget({ node, action, value, enabled, tone, isPending, onInvoke }: WidgetProps) {
  const val = value?.value;
  const confirmedValue = val?.kind === 'int' || val?.kind === 'uint' || val?.kind === 'float' ? val.value : 0;
  const canSlide = enabled && !isPending && Boolean(node.bind?.action) && Boolean(action);

  // Optimistic local state: keeps the slider at the submitted position
  // until the server-confirmed Delta arrives with the actual new value.
  const [localValue, setLocalValue] = useState<number | null>(null);
  const displayValue = localValue ?? confirmedValue;

  // When the server confirms (Delta received), clear the optimistic override.
  useEffect(() => {
    if (localValue !== null) {
      setLocalValue(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.updatedAt]);

  return (
    <View testID="slider-widget">
    <ValueCard>
      <View style={styles.header}>
        <Text style={styles.title}>{node.label ?? node.slug}</Text>
        <Text style={[styles.valueText, { color: tone ?? palette.accent }]}>
          {Math.round(displayValue)}
        </Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={100}
        step={1}
        value={confirmedValue}
        disabled={!canSlide}
        minimumTrackTintColor={palette.accent}
        maximumTrackTintColor={palette.border}
        thumbTintColor={palette.text}
        onValueChange={(next) => {
          if (canSlide) setLocalValue(next);
        }}
        onSlidingComplete={(finalValue) => {
          if (canSlide && node.bind?.action) {
            setLocalValue(Math.round(finalValue));
            onInvoke(node.bind.action, { value: Math.round(finalValue) });
          }
        }}
      />
      {isPending && (
        <Text style={styles.pending}>Applying...</Text>
      )}
    </ValueCard>
    </View>
  );
}

SliderWidget.displayName = 'SliderWidget';

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '600',
  },
  valueText: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  slider: {
    width: '100%',
    height: 40,
  },
  pending: {
    color: palette.muted,
    fontSize: 12,
    fontStyle: 'italic',
  },
});
