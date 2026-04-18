import { useCallback } from 'react';

import { useAuthStore } from '../store/authStore';
import { useBleStore } from '../store/bleStore';
import { useDeviceStore } from '../store/deviceStore';
import type { BleDevice } from '../types/ble.types';
import { useBleCommands } from './useBleCommands';
import { useBleConnection } from './useBleConnection';
import { useBleManifest } from './useBleManifest';

export function useBle() {
  const savePin = useAuthStore((state) => state.savePin);
  const { connect: connectBase, disconnect: disconnectBase, ...connection } = useBleConnection();
  const { fetchManifest } = useBleManifest();
  const commands = useBleCommands();

  const setConnectedDevice = useBleStore((state) => state.setConnectedDevice);
  const setConnectionState = useBleStore((state) => state.setConnectionState);
  const resetDeviceStore = useDeviceStore((state) => state.reset);

  const connect = useCallback(
    async (device: BleDevice, pin: string) => {
      try {
        await connectBase(device, pin);
        await fetchManifest(pin);
        await savePin(device.id, pin, device.name ?? device.id);
        setConnectionState('ready');
      } catch (error) {
        await disconnectBase().catch(() => undefined);
        setConnectionState('error');
        setConnectedDevice(null);
        resetDeviceStore();
        throw error;
      }
    },
    [
      connectBase,
      disconnectBase,
      fetchManifest,
      resetDeviceStore,
      savePin,
      setConnectedDevice,
      setConnectionState,
    ],
  );

  return {
    ...connection,
    ...commands,
    connect,
    connectToDevice: connect,
    disconnect: disconnectBase,
    fetchManifest,
  };
}
