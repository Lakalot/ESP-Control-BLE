import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BleDevice } from '../types/ble.types';

interface Props {
  device: BleDevice;
  onPress: (device: BleDevice) => void;
}

function rssiToSignal(rssi: number | null): string {
  if (rssi === null) return '?';
  if (rssi >= -60) return 'Fort';
  if (rssi >= -80) return 'Moyen';
  return 'Faible';
}

export function DeviceCard({ device, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(device)}>
      <View style={styles.row}>
        <Text style={styles.name}>{device.name ?? 'ESP32 inconnu'}</Text>
        <Text style={styles.rssi}>
          {device.rssi !== null ? `${device.rssi} dBm` : '--'}
        </Text>
      </View>
      <Text style={styles.signal}>Signal: {rssiToSignal(device.rssi)}</Text>
      <Text style={styles.id}>{device.id}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e1e2e',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#313244',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: { fontSize: 16, fontWeight: '600', color: '#cdd6f4' },
  rssi: { fontSize: 14, color: '#89b4fa' },
  signal: { fontSize: 12, color: '#a6e3a1', marginTop: 4 },
  id: { fontSize: 10, color: '#585b70', marginTop: 4 },
});
