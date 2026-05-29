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
 * The native EcbSpp module is a process-wide singleton with a single live RFCOMM
 * socket. Its `onData`/`onDisconnected` emitters fan out to EVERY registered
 * listener, so an orphaned SppDevice whose subscriptions are never removed keeps
 * receiving chunks forever (unlike RealBleDevice, whose subs bind to a
 * per-instance Device object that goes inert once orphaned).
 *
 * The reconnect flow (`reconnecting` → `connecting` → createSppDevice → new
 * SppDevice) builds a fresh device WITHOUT disconnecting the previous one, so we
 * enforce here that only the latest device is wired to the singleton: each new
 * instance detaches the prior `activeDevice`'s native subscriptions before
 * registering its own. We do NOT close the native socket on detach — the new
 * connect() reuses/replaces that same singleton socket, so closing it would kill
 * the live connection the new device depends on.
 */
let activeDevice: SppDevice | null = null;

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
    // Only one SppDevice may be wired to the native singleton at a time. Detach
    // the previous one (remove its native subs) before we register ours, so a
    // reconnect that builds a new device without disconnecting the old one does
    // not leave stale subscriptions double-delivering native chunks.
    if (activeDevice && activeDevice !== this) activeDevice.detach();
    activeDevice = this;
    this.dataSub = EcbSpp.onData((b64) => {
      const chunk = base64ToUint8Array(b64);
      for (const l of this.notifyListeners) l(chunk);
    });
    this.dropSub = EcbSpp.onDisconnected(() => {
      for (const l of [...this.disconnectListeners]) l();
    });
  }

  /**
   * Remove this instance's native subscriptions and clear its local listeners,
   * WITHOUT closing the native socket. Used both when a newer device supersedes
   * this one (socket reused by the new connect) and by disconnect() (which then
   * also closes the socket).
   */
  private detach(): void {
    this.dataSub.remove();
    this.dropSub.remove();
    this.notifyListeners = [];
    this.disconnectListeners = [];
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
    this.detach();
    if (activeDevice === this) activeDevice = null;
    await EcbSpp.disconnect();
  }
}

/** Connect over SPP to the given MAC address and return a ready SppDevice. */
export async function createSppDevice(address: string): Promise<SppDevice> {
  await EcbSpp.connect(address);
  return new SppDevice();
}
