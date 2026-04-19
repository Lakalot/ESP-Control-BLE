import { useCallback } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';

import { useAuthStore } from '../store/authStore';
import { useBleStore } from '../store/bleStore';
import { useDeviceStore } from '../store/deviceStore';
import { bleConnection } from '../transport/BleConnection';
import { bleScanner } from '../transport/BleScanner';
import type { BleDevice } from '../types/ble.types';
import { createBleAuth } from './useBleAuth';

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

export function useBleConnection() {
  const bleState = useBleStore((state) => state.bleState);
  const isScanning = useBleStore((state) => state.isScanning);
  const discoveredDevices = useBleStore((state) => state.discoveredDevices);
  const connectedDevice = useBleStore((state) => state.connectedDevice);
  const connectionState = useBleStore((state) => state.connectionState);

  const setBleState = useBleStore((state) => state.setBleState);
  const setIsScanning = useBleStore((state) => state.setIsScanning);
  const addDiscoveredDevice = useBleStore((state) => state.addDiscoveredDevice);
  const clearDiscoveredDevices = useBleStore((state) => state.clearDiscoveredDevices);
  const setConnectedDevice = useBleStore((state) => state.setConnectedDevice);
  const setConnectionState = useBleStore((state) => state.setConnectionState);

  const removePin = useAuthStore((state) => state.removePin);
  const resetDeviceStore = useDeviceStore((state) => state.reset);

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

  const connect = useCallback(
    async (device: BleDevice, pin: string) => {
      resetDeviceStore();
      setConnectionState('connecting');
      setConnectedDevice(device);

      try {
        const serviceUUID = device.serviceUUIDs?.[0] ?? undefined;
        await bleConnection.connect(device.id, serviceUUID);
        setConnectionState('authenticating');
        const authenticate = createBleAuth(bleConnection);
        await authenticate(pin);
        bleConnection.onUnrecoverableDisconnect(() => {
          setConnectionState('error');
          setConnectedDevice(null);
          resetDeviceStore();
        });
      } catch (error) {
        if (error instanceof Error && error.message === 'AUTH_FAIL') {
          void removePin(device.id).catch(() => undefined);
        }
        setConnectionState('error');
        setConnectedDevice(null);
        resetDeviceStore();
        throw error;
      }
    },
    [removePin, resetDeviceStore, setConnectedDevice, setConnectionState],
  );

  const disconnect = useCallback(async () => {
    await bleConnection.disconnect();
    setConnectedDevice(null);
    setConnectionState('idle');
    resetDeviceStore();
  }, [resetDeviceStore, setConnectedDevice, setConnectionState]);

  return {
    bleState,
    isScanning,
    discoveredDevices,
    connectedDevice,
    connectionState,
    startScan,
    stopScan,
    connect,
    disconnect,
  };
}
