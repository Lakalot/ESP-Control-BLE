import { useCallback } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';

import { useBleStore } from '../store/bleStore';
import { bleScanner } from '../transport/BleScanner';

async function requestBlePermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;

  const apiLevel = Platform.Version as number;
  if (apiLevel >= 31) {
    const results = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ]);
    return (
      results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === 'granted' &&
      results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === 'granted'
    );
  }

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );
  return result === 'granted';
}

/** Scan-only BLE hook: discovery + Bluetooth state, built directly on the
 *  scanner and the BLE store. Connection/auth live in the connection machine. */
export function useBleScan() {
  const bleState = useBleStore((state) => state.bleState);
  const isScanning = useBleStore((state) => state.isScanning);
  const discoveredDevices = useBleStore((state) => state.discoveredDevices);

  const setBleState = useBleStore((state) => state.setBleState);
  const setIsScanning = useBleStore((state) => state.setIsScanning);
  const addDiscoveredDevice = useBleStore((state) => state.addDiscoveredDevice);
  const clearDiscoveredDevices = useBleStore((state) => state.clearDiscoveredDevices);

  const startScan = useCallback(async () => {
    const granted = await requestBlePermissions();
    if (!granted) {
      setBleState('unauthorized');
      return;
    }
    clearDiscoveredDevices();
    setIsScanning(true);
    bleScanner.startScan(
      (device) => addDiscoveredDevice(device),
      (error) => {
        console.error('[BLE] Scan error:', error);
        setIsScanning(false);
      },
    );
  }, [addDiscoveredDevice, clearDiscoveredDevices, setBleState, setIsScanning]);

  const stopScan = useCallback(() => {
    bleScanner.stopScan();
    setIsScanning(false);
  }, [setIsScanning]);

  return { bleState, isScanning, discoveredDevices, startScan, stopScan };
}
