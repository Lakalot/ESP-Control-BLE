import { decodeFrames, type DecodedFrame } from './frameCodec';

type Listener = (frame: DecodedFrame) => void;

export class BleFrameStream {
  private buffer: Uint8Array = new Uint8Array(0);
  private listeners: Listener[] = [];

  onFrame(listener: Listener): () => void {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter(l => l !== listener); };
  }

  feed(chunk: Uint8Array): void {
    const merged = new Uint8Array(this.buffer.length + chunk.length);
    merged.set(this.buffer, 0);
    merged.set(chunk, this.buffer.length);
    const { frames, leftover } = decodeFrames(merged);
    this.buffer = new Uint8Array(leftover);
    for (const frame of frames) for (const listener of this.listeners) listener(frame);
  }
}
