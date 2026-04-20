import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { palette, radius, withAlpha } from '../../../ui/theme/ui';
import { V5ValueCard } from '../primitives/V5ValueCard';
import type { WidgetProps } from '../widgetRegistry';

export function SelectWidget({ node, action, value, enabled, isPending, onInvoke, enumOptions }: WidgetProps) {
  const selected = value?.value?.kind === 'enum' ? value.value.value : undefined;
  const options = enumOptions ?? [];
  const canSelect = enabled && !isPending && Boolean(node.bind?.action) && Boolean(action);

  return (
    <View testID="v5-select-widget">
      <V5ValueCard>
        <Text style={styles.title}>{node.label ?? node.slug}</Text>
        {options.length > 0 ? (
          <View style={styles.row}>
            {options.map((option) => {
              const isActive = selected === option;
              return (
                <Pressable
                  key={option}
                  disabled={!canSelect}
                  onPress={() => {
                    if (node.bind?.action) onInvoke(node.bind.action, { value: option });
                  }}
                  style={[styles.chip, isActive && styles.chipActive, !canSelect && styles.chipDisabled]}
                >
                  <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <Text style={styles.placeholder}>No options available</Text>
        )}
      </V5ValueCard>
    </View>
  );
}

SelectWidget.displayName = 'SelectWidget';

const styles = StyleSheet.create({
  title: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radius.sm,
    backgroundColor: palette.chip,
    borderWidth: 1,
    borderColor: palette.border,
  },
  chipActive: {
    backgroundColor: palette.accent,
    borderColor: palette.accent,
  },
  chipDisabled: {
    opacity: 0.5,
  },
  chipText: {
    color: palette.text,
    fontSize: 14,
    fontWeight: '500',
  },
  chipTextActive: {
    color: palette.black,
    fontWeight: '700',
  },
  placeholder: {
    color: palette.muted,
    fontSize: 13,
    fontStyle: 'italic',
  },
});
