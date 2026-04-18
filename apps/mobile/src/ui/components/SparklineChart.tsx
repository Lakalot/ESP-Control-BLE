import React from 'react';
import { StyleSheet, View } from 'react-native';

import { palette, radius, withAlpha } from '../theme/ui';

interface Props {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

const DEFAULT_COLOR = palette.accentAlt;
const MAX_BARS = 24;

function sampleValues(data: number[], count: number): number[] {
  if (data.length <= count) return data;

  return Array.from({ length: count }, (_, index) => {
    const sourceIndex = Math.round((index / (count - 1)) * (data.length - 1));
    return data[sourceIndex];
  });
}

function normalizeHeights(data: number[], height: number): number[] {
  const minValue = Math.min(...data);
  const maxValue = Math.max(...data);
  const range = maxValue - minValue || 1;
  const minHeight = 6;
  const usableHeight = Math.max(height - 4, minHeight);

  return data.map((value) => {
    const ratio = (value - minValue) / range;
    return Math.max(minHeight, Math.round(minHeight + ratio * (usableHeight - minHeight)));
  });
}

export function SparklineChart({
  data,
  width = 168,
  height = 40,
  color = DEFAULT_COLOR,
}: Props) {
  if (data.length < 2) {
    return <View style={{ width, height }} />;
  }

  const sampled = sampleValues(data, MAX_BARS);
  const heights = normalizeHeights(sampled, height);
  const gap = 3;
  const barWidth = Math.max(3, Math.floor((width - gap * (heights.length - 1)) / heights.length));

  return (
    <View style={[styles.frame, { width, height, borderColor: withAlpha(color, 0.2) }]}>
      <View style={[styles.gridLine, { top: Math.round(height * 0.33) }]} />
      <View style={[styles.gridLine, { top: Math.round(height * 0.66) }]} />
      <View style={styles.barRow}>
        {heights.map((barHeight, index) => {
          const isLatest = index === heights.length - 1;
          return (
            <View
              key={`${index}-${barHeight}`}
              style={[
                styles.bar,
                {
                  width: barWidth,
                  height: barHeight,
                  marginRight: index === heights.length - 1 ? 0 : gap,
                  backgroundColor: isLatest ? color : withAlpha(color, 0.45),
                  borderColor: isLatest ? withAlpha(color, 0.95) : 'transparent',
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: radius.sm,
    backgroundColor: palette.panelInset,
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  gridLine: {
    position: 'absolute',
    left: 8,
    right: 8,
    height: 1,
    backgroundColor: withAlpha(palette.white, 0.05),
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
  },
  bar: {
    borderRadius: radius.pill,
    borderWidth: 1,
  },
});
