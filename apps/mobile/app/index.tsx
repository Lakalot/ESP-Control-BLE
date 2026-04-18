import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useBle } from '../src/hooks/useBle';
import { useAuth } from '../src/hooks/useAuth';
import { DeviceCard } from '../src/components/DeviceCard';
import { PinPrompt } from '../src/components/PinPrompt';
import { BleDevice } from '../src/types/ble.types';

export default function ScanScreen() {
  const navigation = useNavigation<any>();
  const { bleState, isScanning, discoveredDevices, startScan, stopScan } = useBle();
  const { getPin } = useAuth();

  const [selectedDevice, setSelectedDevice] = React.useState<BleDevice | null>(null);
  const [showPinPrompt, setShowPinPrompt] = React.useState(false);
  const scanBtnDisabled = React.useRef(false);

  const handleScanToggle = () => {
    if (scanBtnDisabled.current) return;
    scanBtnDisabled.current = true;
    setTimeout(() => { scanBtnDisabled.current = false; }, 600);

    if (isScanning) {
      stopScan();
    } else {
      startScan().catch((e) => console.error('[BLE] startScan error:', e));
    }
  };

  useEffect(() => {
    if (bleState === 'on') {
      startScan().catch((e) => console.error('[BLE] startScan error:', e));
    }
    return () => stopScan();
  }, [bleState]);

  const handleDevicePress = (device: BleDevice) => {
    stopScan();
    setSelectedDevice(device);
    const savedPin = getPin(device.id);
    if (savedPin) {
      navigation.navigate('control', { deviceId: device.id, pin: savedPin, device });
    } else {
      setShowPinPrompt(true);
    }
  };

  const handlePinSubmit = (pin: string) => {
    setShowPinPrompt(false);
    if (!selectedDevice) return;
    navigation.navigate('control', {
      deviceId: selectedDevice.id,
      pin,
      device: selectedDevice,
    });
  };

  const handlePinCancel = () => {
    setShowPinPrompt(false);
    setSelectedDevice(null);
    startScan();
  };

  return (
    <View style={styles.container}>
      {bleState !== 'on' && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            {bleState === 'unauthorized'
              ? 'Permission Bluetooth refusée'
              : 'Bluetooth désactivé'}
          </Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.subtitle}>
          {isScanning ? 'Recherche en cours...' : `${discoveredDevices.length} device(s) trouvé(s)`}
        </Text>
        <TouchableOpacity
          style={[styles.scanBtn, isScanning && styles.scanBtnStop]}
          onPress={handleScanToggle}
          disabled={bleState !== 'on'}
        >
          <Text style={styles.scanBtnText}>{isScanning ? 'Arrêter' : 'Scanner'}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={discoveredDevices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DeviceCard device={item} onPress={handleDevicePress} />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {isScanning ? 'Recherche des ESP32...' : 'Aucun device trouvé'}
          </Text>
        }
      />

      <PinPrompt
        visible={showPinPrompt}
        deviceName={selectedDevice?.name ?? selectedDevice?.id ?? ''}
        onSubmit={handlePinSubmit}
        onCancel={handlePinCancel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#181825' },
  banner: { backgroundColor: '#f38ba8', padding: 10, alignItems: 'center' },
  bannerText: { color: '#1e1e2e', fontWeight: '700' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  subtitle: { fontSize: 14, color: '#a6adc8' },
  scanBtn: {
    backgroundColor: '#89b4fa',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  scanBtnStop: { backgroundColor: '#f38ba8' },
  scanBtnText: { color: '#1e1e2e', fontWeight: '700' },
  list: { paddingHorizontal: 16 },
  empty: { color: '#585b70', textAlign: 'center', marginTop: 40 },
});
