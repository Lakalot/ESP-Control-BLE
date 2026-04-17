import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface KnownDevice {
  pin: string;
  name: string;
  lastSeen: string;
}

interface AuthStore {
  knownDevices: Record<string, KnownDevice>;
  savePin: (deviceId: string, pin: string, name: string) => Promise<void>;
  getPin: (deviceId: string) => string | null;
  removePin: (deviceId: string) => Promise<void>;
  loadFromSecureStore: () => Promise<void>;
}

const SECURE_STORE_KEY = 'esp_control_ble_known_devices';

export const useAuthStore = create<AuthStore>((set, get) => ({
  knownDevices: {},

  loadFromSecureStore: async () => {
    try {
      const raw = await SecureStore.getItemAsync(SECURE_STORE_KEY);
      if (raw) {
        set({ knownDevices: JSON.parse(raw) });
      }
    } catch {
      // Ignore erreur lecture initiale
    }
  },

  savePin: async (deviceId, pin, name) => {
    const entry: KnownDevice = { pin, name, lastSeen: new Date().toISOString() };
    const next = { ...get().knownDevices, [deviceId]: entry };
    set({ knownDevices: next });
    await SecureStore.setItemAsync(SECURE_STORE_KEY, JSON.stringify(next));
  },

  getPin: (deviceId) => {
    return get().knownDevices[deviceId]?.pin ?? null;
  },

  removePin: async (deviceId) => {
    const next = { ...get().knownDevices };
    delete next[deviceId];
    set({ knownDevices: next });
    await SecureStore.setItemAsync(SECURE_STORE_KEY, JSON.stringify(next));
  },
}));
