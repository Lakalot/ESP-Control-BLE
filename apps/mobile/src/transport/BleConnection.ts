import { Device } from 'react-native-ble-plx';

import type { IBleTransport } from './IBleTransport';
import { bleManagerService } from './BleManager';

function base64ToUint8Array(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

const MANIFEST_CHAR_UUID = 'f99e14e3-b299-4545-8caa-6bc5adf3fe95';
const CMD_CHAR_UUID = '8bf0baf5-fdba-4b82-99c6-6ae9e9c83952';

const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_BASE_DELAY_MS = 1000;

export class BleConnection implements IBleTransport {
  private device: Device | null = null;
  private serviceUUID: string | null = null;
  private reconnectAttempts = 0;
  private onDisconnectCallback: (() => void) | null = null;
  private disconnectSubscription: { remove(): void } | null = null;
  private notifySubscription: { remove(): void } | null = null;
  private intentionalDisconnect = false;

  async connect(deviceId: string, serviceUUID?: string): Promise<void> {
    // Nettoyer toute souscription précédente
    this.cleanup();

    console.log('[BleConnection] connecting to', deviceId, 'serviceUUID=', serviceUUID ?? 'unknown');
    const manager = bleManagerService.getPlxManager();
    const device = await manager.connectToDevice(deviceId, {
      requestMTU: 512,
    });
    console.log('[BleConnection] connected, discovering services...');
    await device.discoverAllServicesAndCharacteristics();
    console.log('[BleConnection] discovery done');

    if (serviceUUID) {
      this.serviceUUID = serviceUUID;
      console.log('[BleConnection] using advertised serviceUUID:', serviceUUID);
    } else {
      const services = await device.services();
      console.log('[BleConnection] resolving serviceUUID from', services.length, 'services...');
      const resolved = await this.resolveServiceUUID(services);
      if (!resolved) throw new Error('Service ECB introuvable sur cet appareil');
      this.serviceUUID = resolved;
      console.log('[BleConnection] resolved serviceUUID:', resolved);
    }

    this.device = device;
    this.reconnectAttempts = 0;
    this.intentionalDisconnect = false;

    this.disconnectSubscription = device.onDisconnected((error, _dev) => {
      console.log('[BleConnection] onDisconnected fired, intentional=', this.intentionalDisconnect, 'err=', error?.message);
      this.device = null;
      if (!this.intentionalDisconnect) {
        this.handleUnexpectedDisconnect(deviceId);
      }
    });
  }

  private async resolveServiceUUID(services: import('react-native-ble-plx').Service[]): Promise<string | null> {
    const manifestUuid = MANIFEST_CHAR_UUID.toLowerCase();
    for (const service of services) {
      const chars = await service.characteristics();
      if (chars.some((c) => c.uuid.toLowerCase() === manifestUuid)) {
        return service.uuid;
      }
    }
    return null;
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
      await this.connect(deviceId, this.serviceUUID ?? undefined);
    } catch {
      await this.handleUnexpectedDisconnect(deviceId);
    }
  }

  onUnrecoverableDisconnect(callback: () => void): void {
    this.onDisconnectCallback = callback;
  }

  async disconnect(): Promise<void> {
    this.intentionalDisconnect = true;
    this.cleanup();
    if (!this.device) return;
    this.onDisconnectCallback = null;
    await this.device.cancelConnection();
    this.device = null;
  }

  private cleanup(): void {
    this.notifySubscription?.remove();
    this.notifySubscription = null;
    this.disconnectSubscription?.remove();
    this.disconnectSubscription = null;
  }

  async readManifest(): Promise<Uint8Array> {
    if (!this.device) throw new Error('Non connecté');
    const char = await this.device.readCharacteristicForService(
      this.serviceUUID!,
      MANIFEST_CHAR_UUID,
    );
    if (!char.value) throw new Error('Manifest vide');
    return base64ToUint8Array(char.value);
  }

  async writeCommand(data: Uint8Array): Promise<void> {
    if (!this.device) throw new Error('Non connecté');
    const b64 = uint8ArrayToBase64(data);
    await this.device.writeCharacteristicWithResponseForService(
      this.serviceUUID!,
      CMD_CHAR_UUID,
      b64,
    );
  }

  subscribe(
    onData: (data: Uint8Array) => void,
    onError: (error: Error) => void,
  ): () => void {
    if (!this.device) throw new Error('Non connecté');
    // Nettoyer l'ancienne souscription aux notifications
    this.notifySubscription?.remove();
    console.log('[BleConnection] subscribing to notifications on', CMD_CHAR_UUID);
    this.notifySubscription = this.device.monitorCharacteristicForService(
      this.serviceUUID!,
      CMD_CHAR_UUID,
      (error, char) => {
        if (error) {
          console.log('[BleConnection] notify error:', error.message, 'intentional=', this.intentionalDisconnect);
          if (!this.intentionalDisconnect) {
            onError(error);
          }
          return;
        }
        if (!char?.value) {
          console.log('[BleConnection] notify callback fired with no value');
          return;
        }
        const bytes = base64ToUint8Array(char.value);
        console.log('[BleConnection] notify received', bytes.length, 'bytes: first=0x' + bytes[0].toString(16));
        onData(bytes);
      },
    );
    console.log('[BleConnection] monitor registered');
    return () => {
      this.notifySubscription?.remove();
      this.notifySubscription = null;
    };
  }

  subscribeToNotifications(
    onData: (data: Uint8Array) => void,
    onError: (error: Error) => void,
  ): () => void {
    return this.subscribe(onData, onError);
  }

  getDevice(): Device | null {
    return this.device;
  }
}

export const bleConnection = new BleConnection();
