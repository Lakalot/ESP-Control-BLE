import { BleDevice } from '../types/ble.types';
import { bleManagerService } from './BleManager';

const SERVICE_UUID = '12345678-1234-1234-1234-123456789abc';

export class BleScanner {
  private isScanning = false;

  startScan(onDevice: (device: BleDevice) => void, onError: (error: Error) => void): void {
    if (this.isScanning) return;
    this.isScanning = true;

    const manager = bleManagerService.getPlxManager();

    manager.startDeviceScan([SERVICE_UUID], null, (error, device) => {
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
  }

  stopScan(): void {
    if (!this.isScanning) return;
    bleManagerService.getPlxManager().stopDeviceScan();
    this.isScanning = false;
  }

  getIsScanning(): boolean {
    return this.isScanning;
  }
}

export const bleScanner = new BleScanner();
