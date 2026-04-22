export interface FixtureBleDevice {
  write(frame: Uint8Array): Promise<void>;
  onNotify(cb: (chunk: Uint8Array) => void): () => void;
  queueIncoming(chunk: Uint8Array): void;
  sentFrames: Uint8Array[];
}

export function createFixtureBleDevice(): FixtureBleDevice {
  const sentFrames: Uint8Array[] = [];
  const listeners: Array<(c: Uint8Array) => void> = [];
  return {
    sentFrames,
    async write(frame) { sentFrames.push(frame); },
    onNotify(cb) { listeners.push(cb); return () => { const i = listeners.indexOf(cb); if (i >= 0) listeners.splice(i, 1); }; },
    queueIncoming(chunk) { for (const l of listeners) l(chunk); },
  };
}
