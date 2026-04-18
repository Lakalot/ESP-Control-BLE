import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

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

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>Authentification</Text>
          <Text style={styles.subtitle}>PIN pour {deviceName}</Text>
          <TextInput
            style={styles.input}
            value={pin}
            onChangeText={setPin}
            placeholder="Entrez le PIN"
            placeholderTextColor="#585b70"
            secureTextEntry
            keyboardType="numeric"
            autoFocus
          />
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitText}>Connexion</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    backgroundColor: '#1e1e2e',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    borderWidth: 1,
    borderColor: '#313244',
  },
  title: { fontSize: 18, fontWeight: '700', color: '#cdd6f4', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#a6adc8', marginBottom: 16 },
  input: {
    backgroundColor: '#181825',
    borderRadius: 8,
    padding: 12,
    color: '#cdd6f4',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#313244',
    marginBottom: 16,
  },
  buttons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  cancelBtn: { padding: 10 },
  cancelText: { color: '#a6adc8', fontSize: 14 },
  submitBtn: {
    backgroundColor: '#89b4fa',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  submitText: { color: '#1e1e2e', fontSize: 14, fontWeight: '700' },
});
