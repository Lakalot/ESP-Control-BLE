/**
 * Production BLE device adapter implementing the FixtureBleDevice interface
 * over react-native-ble-plx. Used by BleRuntime in the real V5 path.
 */
import { Device, Characteristic } from 'react-native-ble-plx';
import { bleManagerService } from '../../transport/BleManager';
import type { FixtureBleDevice } from './BleRuntime.fixture';

const ECB_DATA_SERVICE_UUID = 'feccc3c2-7a95-4c26-91e6-f86158095207';
const ECB_DATA_DATA_CHAR_UUID = 'fac1a3ac-23e4-4dc0-b78a-0722bea726e5';

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
  private disconnectListeners: Array<() => void> = [];
  private disconnectSubscription: { remove(): void } | null = null;
  /**
   * True only while an intentional disconnect() is in progress.
   * cancelConnection() also fires onDisconnected, so this flag lets the handler
   * suppress the self-triggered notification (which would otherwise spuriously
   * kick off an auto-reconnect).
   */
  private intentional = false;

  constructor(private readonly deviceId: string) {}

  async connect(): Promise<void> {
    this.intentional = false;
    const manager = bleManagerService.getPlxManager();
    const device = await manager.connectToDevice(this.deviceId, { requestMTU: 512 });
    await device.discoverAllServicesAndCharacteristics();
    this.device = device;

    this.disconnectSubscription = device.onDisconnected(() => {
      if (this.intentional) return;
      for (const l of this.disconnectListeners) l();
    });

    this.notifySubscription = device.monitorCharacteristicForService(
      ECB_DATA_SERVICE_UUID,
      ECB_DATA_DATA_CHAR_UUID,
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
      ECB_DATA_SERVICE_UUID,
      ECB_DATA_DATA_CHAR_UUID,
      uint8ArrayToBase64(frame),
    );
  }

  onNotify(cb: (chunk: Uint8Array) => void): () => void {
    this.notifyListeners.push(cb);
    return () => {
      this.notifyListeners = this.notifyListeners.filter((l) => l !== cb);
    };
  }

  onDisconnected(cb: () => void): () => void {
    this.disconnectListeners.push(cb);
    return () => {
      this.disconnectListeners = this.disconnectListeners.filter((l) => l !== cb);
    };
  }

  /** Not used in production — present to satisfy FixtureBleDevice interface. */
  queueIncoming(_chunk: Uint8Array): void {}

  async disconnect(): Promise<void> {
    // Mark before cancelConnection so the onDisconnected handler treats the
    // resulting event as intentional and does not notify listeners.
    this.intentional = true;
    this.notifySubscription?.remove();
    this.notifySubscription = null;
    this.notifyListeners = [];
    this.disconnectSubscription?.remove();
    this.disconnectSubscription = null;
    this.disconnectListeners = [];
    if (this.device) {
      try {
        await this.device.cancelConnection();
      } catch {
        // Ignore errors during disconnect (device may already be gone)
      }
      this.device = null;
    }
  }
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
