import { BleDevice } from '../types/ble.types';
import { bleManagerService } from './BleManager';

const SCAN_COOLDOWN_MS = 500;

const ECB_SERVICE_UUID = '12345678-1234-1234-1234-123456789abc';

export class BleScanner {
  private isScanning = false;
  private lastStopTime = 0;

  startScan(onDevice: (device: BleDevice) => void, onError: (error: Error) => void): void {
    if (this.isScanning) return;

    const timeSinceStop = Date.now() - this.lastStopTime;
    const delay = timeSinceStop < SCAN_COOLDOWN_MS ? SCAN_COOLDOWN_MS - timeSinceStop : 0;

    setTimeout(() => {
      if (this.isScanning) return; // annulé entre temps
      this.isScanning = true;

      const manager = bleManagerService.getPlxManager();
      manager.startDeviceScan([ECB_SERVICE_UUID], null, (error, device) => {
        if (error) {
          this.isScanning = false;
          onError(error);
          return;
        }
        if (!device) return;

        onDevice({
          id: device.id,
          name: device.name,
          rssi: device.rssi,
          serviceUUIDs: device.serviceUUIDs ?? null,
        });
      });
    }, delay);
  }

  stopScan(): void {
    if (!this.isScanning) return;
    bleManagerService.getPlxManager().stopDeviceScan();
    this.isScanning = false;
    this.lastStopTime = Date.now();
  }

  getIsScanning(): boolean {
    return this.isScanning;
  }
}

export const bleScanner = new BleScanner();
