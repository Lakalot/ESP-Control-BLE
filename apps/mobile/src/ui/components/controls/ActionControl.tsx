import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { ControlProps } from '../../../types/control.types';
import { NodeVariant } from '../../../types/manifest.types';
import { palette, radius, withAlpha } from '../../theme/ui';
import { CardShell } from './shared/CardShell';
import { iconChar } from './shared/controlUtils';

export function ActionControl({
  command,
  isPending,
  onAction,
  variant,
  surfaceStyle,
  titleOverride,
  subtitle,
}: ControlProps) {
  const opts = command.options;
  const accentColor = opts.color ?? palette.accentAlt;
  const isDisabled = Boolean(opts.disabled);
  const [dangerConfirmVisible, setDangerConfirmVisible] = useState(false);

  const metaItems = useMemo(() => {
    const items: string[] = [];
    if (opts.confirm && !opts.dangerous) items.push('Confirmation');
    if (opts.dangerous) items.push('Risque');
    if (isDisabled) items.push('Desactive');
    return items;
  }, [isDisabled, opts.confirm, opts.dangerous]);

  const helperText = opts.hint ?? (!opts.dangerous ? opts.confirm : undefined);

  const executeAction = () => {
    onAction(command.id, new Uint8Array(0));
    setDangerConfirmVisible(false);
  };

  const sendAction = () => {
    if (isDisabled || isPending) return;

    if (opts.dangerous) {
      if (!dangerConfirmVisible) {
        setDangerConfirmVisible(true);
        return;
      }

      executeAction();
      return;
    }

    if (opts.confirm) {
      Alert.alert('Confirmation', opts.confirm, [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Confirmer', onPress: executeAction },
      ]);
      return;
    }

    executeAction();
  };

  if (variant === NodeVariant.INLINE) {
    return (
      <TouchableOpacity
        style={[
          styles.inlinePill,
          {
            borderColor: withAlpha(accentColor, 0.36),
            backgroundColor: withAlpha(accentColor, 0.1),
          },
          (isPending || isDisabled) && styles.inlinePillDisabled,
        ]}
        onPress={sendAction}
        disabled={isPending || isDisabled}
        activeOpacity={0.85}
      >
        {opts.icon ? (
          <Text style={[styles.inlineIcon, { color: accentColor }]}>{iconChar(opts.icon)}</Text>
        ) : null}
        <Text style={[styles.inlineText, { color: accentColor }]} numberOfLines={1}>
          {titleOverride ?? command.name}
        </Text>
      </TouchableOpacity>
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
      {helperText ? <Text style={styles.helperText}>{helperText}</Text> : null}

      {dangerConfirmVisible ? (
        <TouchableOpacity
          style={styles.dangerBanner}
          onPress={() => setDangerConfirmVisible(false)}
          activeOpacity={0.85}
        >
          <Text style={styles.dangerText}>
            Appuyez une seconde fois pour confirmer. Touchez le message pour annuler.
          </Text>
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity
        style={[
          styles.button,
          variant === NodeVariant.COMPACT && styles.buttonCompact,
          { backgroundColor: dangerConfirmVisible ? palette.danger : accentColor },
          (isPending || isDisabled) && styles.buttonDisabled,
        ]}
        onPress={sendAction}
        disabled={isPending || isDisabled}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>
          {isPending ? 'En cours...' : dangerConfirmVisible ? 'Confirmer' : 'Executer'}
        </Text>
      </TouchableOpacity>

      {isDisabled ? <View pointerEvents="none" style={styles.disabledOverlay} /> : null}
    </CardShell>
  );
}

const styles = StyleSheet.create({
  inlinePill: {
    minHeight: 46,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inlinePillDisabled: {
    opacity: 0.45,
  },
  inlineIcon: {
    fontSize: 14,
    fontWeight: '800',
  },
  inlineText: {
    fontSize: 12,
    fontWeight: '800',
    maxWidth: 180,
  },
  helperText: {
    fontSize: 12,
    lineHeight: 18,
    color: palette.muted,
    marginTop: -4,
  },
  dangerBanner: {
    backgroundColor: withAlpha(palette.danger, 0.12),
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: withAlpha(palette.danger, 0.45),
  },
  dangerText: {
    color: palette.danger,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  button: {
    borderRadius: radius.md,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonCompact: {
    minHeight: 44,
  },
  buttonDisabled: {
    backgroundColor: palette.borderStrong,
  },
  buttonText: {
    color: palette.bg,
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.2,
  },
  disabledOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: withAlpha(palette.bg, 0.18),
  },
});
