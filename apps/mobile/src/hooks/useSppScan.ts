import { useCallback, useEffect, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';

import { EcbSpp, type SppDeviceInfo } from '../../modules/ecb-spp';
import type { BleDevice } from '../types/ble.types';

/** Bluetooth Classic discovery needs ACCESS_FINE_LOCATION at runtime on the
 *  target tablet (API 27). Mirrors the pre-31 branch of useBleScan's helper. */
async function requestSppPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );
  return result === 'granted';
}

/** Map an SPP device descriptor onto the BleDevice shape the list UI renders,
 *  so DeviceCard / the FlashList are reused unchanged. The MAC address is the
 *  id (used verbatim as the SPP connect target on the control screen). */
function toBleDevice(info: SppDeviceInfo): BleDevice {
  return { id: info.address, name: info.name, rssi: null, serviceUUIDs: null };
}

/**
 * SPP counterpart of useBleScan, shaped identically so the scan screen body can
 * consume either. Seeds the list from bonded devices, then live-appends devices
 * found by EcbSpp discovery (deduped by MAC). Discovery starts on mount and
 * stops on unmount.
 */
export function useSppScan() {
  const [discoveredDevices, setDiscoveredDevices] = useState<BleDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const upsert = useCallback((info: SppDeviceInfo) => {
    setDiscoveredDevices((prev) => {
      const next = toBleDevice(info);
      const index = prev.findIndex((d) => d.id === next.id);
      if (index === -1) return [...prev, next];
      // Keep a name once we have one (discovery sometimes reports null first).
      const merged = { ...prev[index], name: next.name ?? prev[index].name };
      const copy = [...prev];
      copy[index] = merged;
      return copy;
    });
  }, []);

  const startScan = useCallback(async () => {
    const granted = await requestSppPermissions();
    if (!granted) return;

    const bonded = await EcbSpp.listBondedDevices().catch(() => [] as SppDeviceInfo[]);
    bonded.forEach(upsert);

    setIsScanning(true);
    await EcbSpp.startDiscovery().catch((error) => {
      console.error('[SPP] startDiscovery error:', error);
      setIsScanning(false);
    });
  }, [upsert]);

  const stopScan = useCallback(() => {
    setIsScanning(false);
    EcbSpp.stopDiscovery().catch(() => {});
  }, []);

  useEffect(() => {
    const sub = EcbSpp.onDeviceFound((info) => upsert(info));
    startScan();
    return () => {
      sub.remove();
      EcbSpp.stopDiscovery().catch(() => {});
    };
    // Run the discovery lifecycle exactly once for this screen mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // bleState is fixed to 'on' so the shared screen body treats SPP as "ready
  // to scan" (SPP has no BLE adapter state of its own).
  return {
    bleState: 'on' as const,
    isScanning,
    discoveredDevices,
    startScan,
    stopScan,
  };
}
