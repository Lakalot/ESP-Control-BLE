import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { palette, radius, shadows, withAlpha } from '../theme/ui';

interface Props {
  visible: boolean;
  deviceName: string;
  onSubmit: (pin: string) => void;
  onCancel: () => void;
}

export function PinPrompt({ visible, deviceName, onSubmit, onCancel }: Props) {
  const [pin, setPin] = useState('');

  const handleSubmit = () => {
    if (pin.trim().length === 0) return;
    onSubmit(pin.trim());
    setPin('');
  };

  const handleCancel = () => {
    setPin('');
    onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.box, shadows.card]}>
          <View style={styles.eyebrow}>
            <Text style={styles.eyebrowText}>PIN requis</Text>
          </View>

          <Text style={styles.title}>Authentification locale</Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            Saisissez le PIN de {deviceName} pour ouvrir la console BLE.
          </Text>

          <TextInput
            style={styles.input}
            value={pin}
            onChangeText={setPin}
            onSubmitEditing={handleSubmit}
            placeholder="Entrez le PIN"
            placeholderTextColor={palette.subtle}
            secureTextEntry
            keyboardType="numeric"
            maxLength={8}
            autoFocus
          />

          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={handleCancel}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitBtn, pin.trim().length === 0 && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={pin.trim().length === 0}
              activeOpacity={0.8}
            >
              <Text style={styles.submitText}>Connexion</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: withAlpha(palette.overlay, 0.82),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  box: {
    width: '100%',
    maxWidth: 360,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.panel,
    padding: 24,
  },
  eyebrow: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: palette.chip,
    marginBottom: 14,
  },
  eyebrowText: {
    color: palette.accent,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.7,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: palette.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: palette.muted,
    marginBottom: 20,
  },
  input: {
    backgroundColor: palette.panelInset,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 15,
    color: palette.text,
    fontSize: 20,
    letterSpacing: 5,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: palette.borderStrong,
    marginBottom: 20,
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: withAlpha(palette.white, 0.04),
  },
  cancelText: {
    color: palette.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  submitBtn: {
    flex: 1,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: palette.accent,
  },
  submitBtnDisabled: {
    backgroundColor: palette.borderStrong,
  },
  submitText: {
    color: palette.bg,
    fontSize: 14,
    fontWeight: '700',
  },
});
