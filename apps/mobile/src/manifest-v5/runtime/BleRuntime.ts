import { Writer, Reader } from 'protobufjs/minimal';
import type { ManifestV5Runtime, InvokeResult, SnapshotMap, SubscriptionListener, Unsubscribe } from './ManifestV5Runtime';
import { BleFrameStream } from './bleFrameStream';
import { encodeFrame, FrameKind } from './frameCodecV5';
import * as root from '../generated/manifest_v5.pbjs';
const manifest_v5 = (root as any).esp_control.v5;
import type { FixtureBleDevice } from './BleRuntime.fixture';
import { RuntimeManifest } from '../model/runtime.types';
import { decodeManifest } from '../decode/decodeManifest';

export class BleRuntime implements ManifestV5Runtime {
  private stream = new BleFrameStream();
  private pending = new Map<number, (r: InvokeResult) => void>();
  private nextCorrelation = 1;
  private manifest: RuntimeManifest | null = null;
  private resourceIds = new Map<string, number>();
  private actionIds = new Map<string, number>();

  constructor(private device: FixtureBleDevice) {
    device.onNotify((chunk) => this.stream.feed(chunk));
    this.stream.onFrame((frame) => this.dispatchFrame(frame.kind, frame.body));
  }

  private dispatchFrame(kind: FrameKind, body: Uint8Array) {
    if (kind === FrameKind.InvokeResult) {
      const msg = manifest_v5.InvokeResult.decode(new Reader(body));
      const resolver = this.pending.get(msg.correlationId);
      if (resolver) {
        this.pending.delete(msg.correlationId);
        resolver({
          status: msg.status === manifest_v5.Status.STATUS_OK ? 'ok' : 'error',
          payload: msg.payload ?? new Uint8Array(),
          message: msg.message ?? '',
        });
      }
    }
  }

  async loadManifest(): Promise<RuntimeManifest> {
    if (this.manifest) return this.manifest;
    const bytes = await this.readManifestTransfer();
    this.manifest = decodeManifest(bytes);
    this.resourceIds = new Map([...this.manifest.resources.values()].map((r) => [r.slug, r.runtimeId]));
    this.actionIds = new Map([...this.manifest.actions.values()].map((a) => [a.slug, a.runtimeId]));
    return this.manifest;
  }

  async invokeAction(actionSlug: string, input: Record<string, unknown>): Promise<InvokeResult> {
    const actionId = this.actionIds.get(actionSlug);
    if (!actionId) throw new Error(`unknown action ${actionSlug}`);
    const correlationId = this.nextCorrelation++;
    
    // Set up resolver BEFORE writing, so that dispatchFrame can find it
    const resultPromise = this.awaitInvokeResult(correlationId);
    
    const msg = manifest_v5.InvokeAction.create({
      actionId,
      correlationId,
      payload: this.encodeInput(input),
    });
    await this.device.write(encodeFrame(FrameKind.InvokeAction, 0, manifest_v5.InvokeAction.encode(msg).finish()));
    return await resultPromise;
  }

  private async awaitInvokeResult(correlationId: number): Promise<InvokeResult> {
    return new Promise((resolve) => {
        this.pending.set(correlationId, resolve);
    });
  }

  private async readManifestTransfer(): Promise<Uint8Array> {
    // For test compatibility with device.queueManifest
    if ((this.device as any).manifestBytes) {
      return (this.device as any).manifestBytes;
    }

    return new Promise((resolve, reject) => {
      let chunks: Uint8Array[] = [];
      let totalLength = 0;
      
      const unsubscribe = this.stream.onFrame((frame) => {
        if (frame.kind === FrameKind.ManifestChunk) {
          chunks.push(frame.body);
          totalLength += frame.body.length;
        } else if (frame.kind === FrameKind.ManifestEof) {
          unsubscribe();
          
          const fullManifest = new Uint8Array(totalLength);
          let offset = 0;
          for (const chunk of chunks) {
            fullManifest.set(chunk, offset);
            offset += chunk.length;
          }
          
          if (frame.body.length < 8) {
            reject(new Error('Manifest EOF frame too small'));
            return;
          }
          const view = new DataView(frame.body.buffer, frame.body.byteOffset, frame.body.byteLength);
          const expectedCrc = view.getUint32(0, true);
          const expectedSize = view.getUint32(4, true);

          if (fullManifest.length !== expectedSize) {
            reject(new Error('Manifest size mismatch'));
            return;
          }

          if (this.crc32(fullManifest) !== expectedCrc) {
            reject(new Error('Manifest CRC mismatch'));
            return;
          }
          
          resolve(fullManifest);
        }
      });
    });
  }

  private crc32(buf: Uint8Array): number {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) {
      crc ^= buf[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
      }
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  async snapshot(): Promise<SnapshotMap> { return new Map() as any; }

  subscribe(_slugs: readonly string[], _cb: SubscriptionListener): Unsubscribe { return () => {}; }

  private encodeInput(input: Record<string, unknown>): Uint8Array {
    if (!input || Object.keys(input).length === 0) return new Uint8Array();
    return new TextEncoder().encode(JSON.stringify(input));
  }
}
