import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { ControlProps } from '../../../types/control.types';
import { triggerSelectionHaptic } from '../../feedback/haptics';
import { palette, radius, withAlpha } from '../../theme/ui';
import { CardShell } from './shared/CardShell';
import { makeIndexPayload } from './shared/controlUtils';

export function MultiSelectControl({
  command,
  currentValue,
  isPending,
  onAction,
  variant,
  surfaceStyle,
  titleOverride,
  subtitle,
}: ControlProps) {
  const choices = command.options.choices?.split('|').filter(Boolean) ?? [];
  const selectedIndex = typeof currentValue === 'number' ? currentValue : null;
  const accentColor = command.options.color ?? palette.accentAlt;
  const isDisabled = Boolean(command.options.disabled) || isPending;

  return (
    <CardShell
      command={command}
      variant={variant}
      surfaceStyle={surfaceStyle}
      titleOverride={titleOverride}
      subtitle={subtitle}
      isPending={isPending}
      isDisabled={Boolean(command.options.disabled)}
      metaItems={Boolean(command.options.disabled) ? ['Desactive'] : []}
    >
      {choices.length === 0 ? (
        <Text style={styles.emptyText}>Aucune option disponible.</Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {choices.map((label, index) => {
            const isSelected = selectedIndex === index;
            return (
              <TouchableOpacity
                key={`${label}-${index}`}
                style={[
                  styles.pill,
                  isSelected
                    ? {
                        backgroundColor: withAlpha(accentColor, 0.16),
                        borderColor: withAlpha(accentColor, 0.55),
                      }
                    : styles.pillInactive,
                  isDisabled && styles.pillDisabled,
                ]}
                onPress={() => {
                  if (!isDisabled) {
                    triggerSelectionHaptic();
                    onAction(command.id, makeIndexPayload(index));
                  }
                }}
                disabled={isDisabled}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.pillText,
                    isSelected ? { color: accentColor } : styles.pillTextInactive,
                    isDisabled && styles.pillTextDisabled,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {Boolean(command.options.disabled) ? (
        <View pointerEvents="none" style={styles.disabledOverlay} />
      ) : null}
    </CardShell>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  pill: {
    borderRadius: radius.pill,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  pillInactive: {
    backgroundColor: palette.panelInset,
    borderColor: palette.border,
  },
  pillDisabled: {
    opacity: 0.4,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  pillTextInactive: {
    color: palette.muted,
  },
  pillTextDisabled: {
    color: palette.subtle,
  },
  emptyText: {
    color: palette.muted,
    fontSize: 13,
  },
  disabledOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: withAlpha(palette.bg, 0.18),
  },
});
