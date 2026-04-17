import { create } from 'zustand';
import { BleDevice, BleStateType, ConnectionState } from '../types/ble.types';

interface BleStore {
  bleState: BleStateType;
  isScanning: boolean;
  discoveredDevices: BleDevice[];
  connectedDevice: BleDevice | null;
  connectionState: ConnectionState;

  setBleState: (state: BleStateType) => void;
  setIsScanning: (scanning: boolean) => void;
  addDiscoveredDevice: (device: BleDevice) => void;
  clearDiscoveredDevices: () => void;
  setConnectedDevice: (device: BleDevice | null) => void;
  setConnectionState: (state: ConnectionState) => void;
}

export const useBleStore = create<BleStore>((set) => ({
  bleState: 'unknown',
  isScanning: false,
  discoveredDevices: [],
  connectedDevice: null,
  connectionState: 'idle',

  setBleState: (bleState) => set({ bleState }),
  setIsScanning: (isScanning) => set({ isScanning }),
  addDiscoveredDevice: (device) =>
    set((state) => {
      const exists = state.discoveredDevices.some((d) => d.id === device.id);
      if (exists) {
        return {
          discoveredDevices: state.discoveredDevices.map((d) =>
            d.id === device.id ? { ...d, rssi: device.rssi } : d,
          ),
        };
      }
      return { discoveredDevices: [...state.discoveredDevices, device] };
    }),
  clearDiscoveredDevices: () => set({ discoveredDevices: [] }),
  setConnectedDevice: (connectedDevice) => set({ connectedDevice }),
  setConnectionState: (connectionState) => set({ connectionState }),
}));
