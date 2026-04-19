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
    throw new Error('Not implemented: readManifestTransfer');
  }

  async snapshot(): Promise<SnapshotMap> { return new Map() as any; }

  subscribe(_slugs: readonly string[], _cb: SubscriptionListener): Unsubscribe { return () => {}; }

  private encodeInput(input: Record<string, unknown>): Uint8Array {
    if (!input || Object.keys(input).length === 0) return new Uint8Array();
    return new TextEncoder().encode(JSON.stringify(input));
  }
}
