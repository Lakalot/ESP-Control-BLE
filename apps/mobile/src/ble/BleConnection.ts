import { Device } from 'react-native-ble-plx';
import { bleManagerService } from './BleManager';

const SERVICE_UUID = '12345678-1234-1234-1234-123456789abc';
const MANIFEST_CHAR_UUID = '12345678-1234-1234-1234-123456789abd';
const CMD_CHAR_UUID = '12345678-1234-1234-1234-123456789abe';

const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_BASE_DELAY_MS = 1000;

export class BleConnection {
  private device: Device | null = null;
  private reconnectAttempts = 0;
  private onDisconnectCallback: (() => void) | null = null;

  async connect(deviceId: string): Promise<Device> {
    const manager = bleManagerService.getPlxManager();
    const device = await manager.connectToDevice(deviceId, {
      requestMTU: 512,
    });
    await device.discoverAllServicesAndCharacteristics();
    this.device = device;
    this.reconnectAttempts = 0;

    device.onDisconnected((_error, _dev) => {
      this.device = null;
      this.handleUnexpectedDisconnect(deviceId);
    });

    return device;
  }

  private async handleUnexpectedDisconnect(deviceId: string): Promise<void> {
    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      this.onDisconnectCallback?.();
      return;
    }

    this.reconnectAttempts++;
    const delay = RECONNECT_BASE_DELAY_MS * this.reconnectAttempts;
    await new Promise((r) => setTimeout(r, delay));

    try {
      await this.connect(deviceId);
    } catch {
      await this.handleUnexpectedDisconnect(deviceId);
    }
  }

  onUnrecoverableDisconnect(callback: () => void): void {
    this.onDisconnectCallback = callback;
  }

  async disconnect(): Promise<void> {
    if (!this.device) return;
    this.onDisconnectCallback = null;
    await this.device.cancelConnection();
    this.device = null;
  }

  async readManifest(): Promise<Uint8Array> {
    if (!this.device) throw new Error('Non connecté');
    const char = await this.device.readCharacteristicForService(
      SERVICE_UUID,
      MANIFEST_CHAR_UUID,
    );
    if (!char.value) throw new Error('Manifest vide');
    return Uint8Array.from(Buffer.from(char.value, 'base64'));
  }

  async writeCommand(data: Uint8Array): Promise<void> {
    if (!this.device) throw new Error('Non connecté');
    const b64 = Buffer.from(data).toString('base64');
    await this.device.writeCharacteristicWithResponseForService(
      SERVICE_UUID,
      CMD_CHAR_UUID,
      b64,
    );
  }

  subscribeToNotifications(
    onData: (data: Uint8Array) => void,
    onError: (error: Error) => void,
  ): () => void {
    if (!this.device) throw new Error('Non connecté');
    const sub = this.device.monitorCharacteristicForService(
      SERVICE_UUID,
      CMD_CHAR_UUID,
      (error, char) => {
        if (error) {
          onError(error);
          return;
        }
        if (!char?.value) return;
        onData(Uint8Array.from(Buffer.from(char.value, 'base64')));
      },
    );
    return () => sub.remove();
  }

  getDevice(): Device | null {
    return this.device;
  }
}

export const bleConnection = new BleConnection();
