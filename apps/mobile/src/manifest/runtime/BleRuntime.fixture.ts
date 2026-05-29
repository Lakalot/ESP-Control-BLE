export interface FixtureBleDevice {
  write(frame: Uint8Array): Promise<void>;
  onNotify(cb: (chunk: Uint8Array) => void): () => void;
  onDisconnected(cb: () => void): () => void;
  queueIncoming(chunk: Uint8Array): void;
  sentFrames: Uint8Array[];
  /**
   * Tear down the GATT connection. Optional on the interface: the in-memory
   * fixture has no real transport to close, so it omits this; RealBleDevice
   * implements it. BleRuntime.disconnect() guards the call accordingly.
   */
  disconnect?(): Promise<void>;
}

export function createFixtureBleDevice(): FixtureBleDevice & { simulateDisconnect(): void } {
  const sentFrames: Uint8Array[] = [];
  const listeners: Array<(c: Uint8Array) => void> = [];
  const disconnectListeners: Array<() => void> = [];
  return {
    sentFrames,
    async write(frame) { sentFrames.push(frame); },
    onNotify(cb) { listeners.push(cb); return () => { const i = listeners.indexOf(cb); if (i >= 0) listeners.splice(i, 1); }; },
    onDisconnected(cb) { disconnectListeners.push(cb); return () => { const i = disconnectListeners.indexOf(cb); if (i >= 0) disconnectListeners.splice(i, 1); }; },
    queueIncoming(chunk) { for (const l of listeners) l(chunk); },
    // Test-only: simulate a transport-level drop so callers can exercise
    // disconnect handling without a real BLE device.
    simulateDisconnect() { for (const l of [...disconnectListeners]) l(); },
  };
}
