import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import type { ControlProps } from '../../../types/control.types';
import { palette, radius, withAlpha } from '../../theme/ui';
import { CardShell } from './shared/CardShell';
import { makeTextPayload } from './shared/controlUtils';

export function TextInputControl({
  command,
  currentValue,
  isPending,
  onAction,
  variant,
  surfaceStyle,
  titleOverride,
  subtitle,
}: ControlProps) {
  const textValue = typeof currentValue === 'string' ? currentValue : null;
  const accentColor = command.options.color ?? palette.accentAlt;
  const isDisabled = Boolean(command.options.disabled) || isPending;
  const [draft, setDraft] = useState(textValue ?? '');

  useEffect(() => {
    if (textValue != null) setDraft(textValue);
  }, [textValue]);

  const handleSend = () => {
    if (isDisabled) return;

    const encoder = new TextEncoder();
    let nextValue = draft;
    while (encoder.encode(nextValue).length > 32) {
      nextValue = nextValue.slice(0, -1);
    }

    onAction(command.id, makeTextPayload(nextValue));
  };

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
      <View style={styles.container}>
        <Text style={styles.caption}>
          {command.options.hint ?? 'Texte envoye sur 32 octets maximum.'}
        </Text>

        <View style={styles.row}>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: withAlpha(accentColor, 0.45),
                opacity: isDisabled ? 0.4 : 1,
              },
            ]}
            value={draft}
            onChangeText={setDraft}
            editable={!isDisabled}
            maxLength={64}
            placeholder="Saisir une valeur..."
            placeholderTextColor={palette.subtle}
            selectionColor={accentColor}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: accentColor },
              isDisabled && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={isDisabled}
            activeOpacity={0.85}
          >
            <Text style={styles.sendButtonText}>{isPending ? '...' : 'Envoyer'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {Boolean(command.options.disabled) ? (
        <View pointerEvents="none" style={styles.disabledOverlay} />
      ) : null}
    </CardShell>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  caption: {
    fontSize: 12,
    color: palette.muted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: palette.panelInset,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: palette.text,
  },
  sendButton: {
    minWidth: 94,
    height: 46,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  sendButtonDisabled: {
    backgroundColor: palette.borderStrong,
  },
  sendButtonText: {
    color: palette.bg,
    fontWeight: '700',
    fontSize: 13,
  },
  disabledOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: withAlpha(palette.bg, 0.18),
  },
});
