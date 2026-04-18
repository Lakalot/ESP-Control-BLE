import React, { useMemo } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import type { ControlProps } from '../../../types/control.types';
import { NodeVariant } from '../../../types/manifest.types';
import { triggerSelectionHaptic } from '../../feedback/haptics';
import { palette, radius, withAlpha } from '../../theme/ui';
import { CardShell } from './shared/CardShell';

export function ToggleControl({
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
  const boolValue =
    typeof currentValue === 'boolean' ? currentValue : currentValue === 1 ? true : false;

  const metaItems = useMemo(() => {
    const items: string[] = [];
    if (isDisabled) items.push('Desactive');
    return items;
  }, [isDisabled]);

  if (variant === NodeVariant.INLINE) {
    return (
      <View
        style={[
          styles.inlinePill,
          {
            backgroundColor: withAlpha(accentColor, boolValue ? 0.14 : 0.05),
            borderColor: withAlpha(accentColor, 0.24),
          },
        ]}
      >
        <Text style={styles.inlineLabel}>{titleOverride ?? command.name}</Text>
        <Switch
          value={boolValue}
          onValueChange={(value) => {
            if (!isDisabled) {
              triggerSelectionHaptic();
              onAction(command.id, new Uint8Array([value ? 0x01 : 0x00]));
            }
          }}
          disabled={isPending || isDisabled}
          trackColor={{
            false: withAlpha(palette.white, 0.08),
            true: withAlpha(accentColor, 0.32),
          }}
          thumbColor={boolValue ? accentColor : palette.subtle}
        />
      </View>
    );
  }

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
      <View style={styles.toggleCard}>
        <View>
          <Text style={styles.caption}>Etat</Text>
          <Text style={[styles.state, { color: boolValue ? accentColor : palette.muted }]}>
            {boolValue ? 'Actif' : 'Inactif'}
          </Text>
        </View>

        <Switch
          value={boolValue}
          onValueChange={(value) => {
            if (!isDisabled) {
              triggerSelectionHaptic();
              onAction(command.id, new Uint8Array([value ? 0x01 : 0x00]));
            }
          }}
          disabled={isPending || isDisabled}
          trackColor={{
            false: withAlpha(palette.white, 0.08),
            true: withAlpha(accentColor, 0.32),
          }}
          thumbColor={boolValue ? accentColor : palette.subtle}
        />
      </View>

      {isDisabled ? <View pointerEvents="none" style={styles.disabledOverlay} /> : null}
    </CardShell>
  );
}

const styles = StyleSheet.create({
  inlinePill: {
    minHeight: 52,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  inlineLabel: {
    color: palette.text,
    fontSize: 13,
    fontWeight: '700',
  },
  toggleCard: {
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: palette.panelInset,
    borderWidth: 1,
    borderColor: palette.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  caption: {
    fontSize: 12,
    color: palette.subtle,
    marginBottom: 4,
  },
  state: {
    fontSize: 18,
    fontWeight: '700',
  },
  disabledOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: withAlpha(palette.bg, 0.18),
  },
});
