/**
 * Production BLE device adapter implementing the FixtureBleDevice interface
 * over react-native-ble-plx. Used by BleRuntime in the real V5 path.
 */
import { Device, Characteristic } from 'react-native-ble-plx';
import { bleManagerService } from '../../transport/BleManager';
import type { FixtureBleDevice } from './BleRuntime.fixture';

const ECB_V5_SERVICE_UUID = '12345678-1234-1234-1234-123456789abc';
const ECB_V5_CMD_CHAR_UUID = '12345678-1234-1234-1234-123456789abe';
const ECB_V5_NOTIFY_CHAR_UUID = '12345678-1234-1234-1234-123456789abd';

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToUint8Array(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export class RealBleDevice implements FixtureBleDevice {
  /** Not used in production path — present to satisfy FixtureBleDevice interface. */
  readonly sentFrames: Uint8Array[] = [];

  private device: Device | null = null;
  private notifyListeners: Array<(chunk: Uint8Array) => void> = [];
  private notifySubscription: { remove(): void } | null = null;

  constructor(private readonly deviceId: string) {}

  async connect(): Promise<void> {
    const manager = bleManagerService.getPlxManager();
    const device = await manager.connectToDevice(this.deviceId, { requestMTU: 512 });
    await device.discoverAllServicesAndCharacteristics();
    this.device = device;

    this.notifySubscription = device.monitorCharacteristicForService(
      ECB_V5_SERVICE_UUID,
      ECB_V5_NOTIFY_CHAR_UUID,
      (_err, characteristic) => {
        if (characteristic?.value) {
          const chunk = base64ToUint8Array(characteristic.value);
          for (const l of this.notifyListeners) l(chunk);
        }
      },
    );
  }

  async write(frame: Uint8Array): Promise<void> {
    if (!this.device) throw new Error('RealBleDevice: not connected');
    await this.device.writeCharacteristicWithResponseForService(
      ECB_V5_SERVICE_UUID,
      ECB_V5_CMD_CHAR_UUID,
      uint8ArrayToBase64(frame),
    );
  }

  onNotify(cb: (chunk: Uint8Array) => void): () => void {
    this.notifyListeners.push(cb);
    return () => {
      this.notifyListeners = this.notifyListeners.filter((l) => l !== cb);
    };
  }

  /** Not used in production — present to satisfy FixtureBleDevice interface. */
  queueIncoming(_chunk: Uint8Array): void {}
}

/**
 * Creates and connects a RealBleDevice for the given BLE device ID.
 * Returns the connected device ready to pass to BleRuntime.
 */
export async function createRealBleDevice(deviceId: string): Promise<RealBleDevice> {
  const device = new RealBleDevice(deviceId);
  await device.connect();
  return device;
}
