import { requireNativeModule } from 'expo-modules-core';
import { Platform } from 'react-native';

export interface SppDeviceInfo { name: string | null; address: string; bonded: boolean; }

interface EcbSppNative {
  isAvailable(): Promise<boolean>;
  listBondedDevices(): Promise<SppDeviceInfo[]>;
  startDiscovery(): Promise<void>;
  stopDiscovery(): Promise<void>;
  connect(address: string): Promise<void>;
  write(base64: string): Promise<void>;
  disconnect(): Promise<void>;
  addListener(event: string, listener: (payload: any) => void): { remove(): void };
}

const native: EcbSppNative | null =
  Platform.OS === 'android' ? requireNativeModule('EcbSpp') : null;

function require_(): EcbSppNative {
  if (!native) throw new Error('EcbSpp is only available on Android');
  return native;
}

export const EcbSpp = {
  isAvailable: () => (native ? native.isAvailable() : Promise.resolve(false)),
  listBondedDevices: () => require_().listBondedDevices(),
  startDiscovery: () => require_().startDiscovery(),
  stopDiscovery: () => require_().stopDiscovery(),
  connect: (address: string) => require_().connect(address),
  write: (base64: string) => require_().write(base64),
  disconnect: () => require_().disconnect(),
  onData: (cb: (chunkBase64: string) => void) =>
    require_().addListener('onData', (p) => cb(p.data)),
  onDisconnected: (cb: () => void) =>
    require_().addListener('onDisconnected', () => cb()),
  onDeviceFound: (cb: (d: SppDeviceInfo) => void) =>
    require_().addListener('onDeviceFound', (p) => cb(p)),
};
