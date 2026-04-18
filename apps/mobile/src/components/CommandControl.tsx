import React from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { CmdType, ManifestCommand } from '../types/manifest.types';

interface Props {
  command: ManifestCommand;
  currentValue?: number | boolean | null;
  isPending?: boolean;
  onAction: (cmdId: number, payload: Uint8Array) => void;
}

export function CommandControl({ command, currentValue, isPending, onAction }: Props) {
  const sendAction = () => onAction(command.id, new Uint8Array(0));

  const sendToggle = (value: boolean) => {
    const payload = new Uint8Array([value ? 0x01 : 0x00]);
    onAction(command.id, payload);
  };

  const sendRange = (value: number) => {
    const payload = new Uint8Array(2);
    new DataView(payload.buffer).setInt16(0, value, false);
    onAction(command.id, payload);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{command.name}</Text>

      {command.type === CmdType.ACTION && (
        <TouchableOpacity
          style={[styles.button, isPending && styles.buttonPending]}
          onPress={sendAction}
          disabled={isPending}
        >
          <Text style={styles.buttonText}>{isPending ? '...' : 'Exécuter'}</Text>
        </TouchableOpacity>
      )}

      {command.type === CmdType.TOGGLE && (
        <Switch
          value={!!currentValue}
          onValueChange={sendToggle}
          disabled={isPending}
          trackColor={{ false: '#313244', true: '#89b4fa' }}
        />
      )}

      {command.type === CmdType.RANGE && command.params && (
        <View>
          <Slider
            minimumValue={command.params.min}
            maximumValue={command.params.max}
            step={1}
            value={typeof currentValue === 'number' ? currentValue : command.params.min}
            onSlidingComplete={sendRange}
            disabled={isPending}
            minimumTrackTintColor="#89b4fa"
            maximumTrackTintColor="#313244"
            thumbTintColor="#cdd6f4"
          />
          <Text style={styles.rangeValue}>
            {typeof currentValue === 'number' ? currentValue : command.params.min}
            {' '}({command.params.min}–{command.params.max})
          </Text>
        </View>
      )}

      {command.type === CmdType.READ_ONLY && (
        <Text style={styles.readOnly}>
          {currentValue !== null && currentValue !== undefined
            ? String(currentValue)
            : '—'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e1e2e',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#313244',
  },
  label: { fontSize: 15, fontWeight: '600', color: '#cdd6f4', marginBottom: 10 },
  button: {
    backgroundColor: '#89b4fa',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonPending: { backgroundColor: '#585b70' },
  buttonText: { color: '#1e1e2e', fontWeight: '700' },
  rangeValue: { fontSize: 12, color: '#a6adc8', marginTop: 4, textAlign: 'right' },
  readOnly: { fontSize: 20, color: '#a6e3a1', fontWeight: '700' },
});
