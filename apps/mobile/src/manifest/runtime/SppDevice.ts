import type { FixtureBleDevice } from './BleRuntime.fixture';
import { EcbSpp } from '../../../modules/ecb-spp';

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

/**
 * SPP transport device. Implements the same interface as RealBleDevice so the
 * whole BleRuntime/connectionMachine engine is reused. The native EcbSpp module
 * delivers arbitrary byte chunks; BleRuntime's BleFrameStream reassembles frames
 * by header length (same as the firmware FrameAccumulator).
 */
export class SppDevice implements FixtureBleDevice {
  readonly sentFrames: Uint8Array[] = []; // not used in production
  private notifyListeners: Array<(chunk: Uint8Array) => void> = [];
  private disconnectListeners: Array<() => void> = [];
  private dataSub: { remove(): void };
  private dropSub: { remove(): void };

  constructor() {
    this.dataSub = EcbSpp.onData((b64) => {
      const chunk = base64ToUint8Array(b64);
      for (const l of this.notifyListeners) l(chunk);
    });
    this.dropSub = EcbSpp.onDisconnected(() => {
      for (const l of [...this.disconnectListeners]) l();
    });
  }

  async write(frame: Uint8Array): Promise<void> {
    await EcbSpp.write(uint8ArrayToBase64(frame));
  }

  onNotify(cb: (chunk: Uint8Array) => void): () => void {
    this.notifyListeners.push(cb);
    return () => { this.notifyListeners = this.notifyListeners.filter((l) => l !== cb); };
  }

  onDisconnected(cb: () => void): () => void {
    this.disconnectListeners.push(cb);
    return () => { this.disconnectListeners = this.disconnectListeners.filter((l) => l !== cb); };
  }

  queueIncoming(_chunk: Uint8Array): void {} // not used in production

  async disconnect(): Promise<void> {
    this.dataSub.remove();
    this.dropSub.remove();
    this.notifyListeners = [];
    this.disconnectListeners = [];
    await EcbSpp.disconnect();
  }
}

/** Connect over SPP to the given MAC address and return a ready SppDevice. */
export async function createSppDevice(address: string): Promise<SppDevice> {
  await EcbSpp.connect(address);
  return new SppDevice();
}
