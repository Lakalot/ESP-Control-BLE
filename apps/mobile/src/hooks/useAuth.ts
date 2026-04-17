import { useCallback } from 'react';
import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const { knownDevices, savePin, getPin, removePin } = useAuthStore();

  const isKnownDevice = useCallback(
    (deviceId: string) => !!knownDevices[deviceId],
    [knownDevices],
  );

  return { knownDevices, savePin, getPin, removePin, isKnownDevice };
}
