import { Writer, Reader } from 'protobufjs/minimal';
import type { ManifestV5Runtime, InvokeResult, SnapshotMap, SubscriptionListener, Unsubscribe } from './ManifestV5Runtime';
import { BleFrameStream } from './bleFrameStream';
import { encodeFrame, FrameKind } from './frameCodecV5';
import * as root from '../generated/manifest_v5.pbjs';
const manifest_v5 = (root as any).esp_control.v5;
import type { FixtureBleDevice } from './BleRuntime.fixture';

export class BleRuntime implements ManifestV5Runtime {
  private stream = new BleFrameStream();
  private pending = new Map<number, (r: InvokeResult) => void>();
  private nextCorrelation = 1;
  private manifest: any | null = null; 

  constructor(private device: FixtureBleDevice) {
    device.onNotify((chunk) => this.stream.feed(chunk));
    this.stream.onFrame((frame) => this.dispatchFrame(frame.kind, frame.body));
  }

  private dispatchFrame(kind: FrameKind, body: Uint8Array) {
    if (kind !== FrameKind.InvokeResult) return;
    const msg = manifest_v5.InvokeResult.decode(new Reader(body));
    const resolver = this.pending.get(msg.correlationId);
    if (!resolver) return;
    this.pending.delete(msg.correlationId);
    resolver({
      status: msg.status === manifest_v5.Status.STATUS_OK ? 'ok' : 'error',
      payload: msg.payload ?? new Uint8Array(),
      message: msg.message ?? '',
    });
  }

  async invokeAction(actionSlug: string, input: Record<string, unknown>): Promise<InvokeResult> {
    const actionId = this.slugFallbackId(actionSlug);
    const correlationId = this.nextCorrelation++;
    const payload = this.encodeInput(input);
    const msg = manifest_v5.InvokeAction.create({ actionId: actionId, correlationId: correlationId, payload: payload });
    const body = manifest_v5.InvokeAction.encode(msg, new Writer()).finish();
    
    return new Promise((resolve) => { 
        this.pending.set(correlationId, resolve);
        this.device.write(encodeFrame(FrameKind.InvokeAction, 0, body));
    });
  }

  async loadManifest(): Promise<any> {
    if (this.manifest) return this.manifest;
    throw new Error('BleRuntime.loadManifest: provide manifest via fixture.setManifest in tests');
  }

  async snapshot(): Promise<SnapshotMap> { return new Map() as any; }

  subscribe(_slugs: readonly string[], _cb: SubscriptionListener): Unsubscribe { return () => {}; }

  async invokeAction(actionSlug: string, input: Record<string, unknown>): Promise<InvokeResult> {
    const actionId = this.slugFallbackId(actionSlug);
    const correlationId = this.nextCorrelation++;
    const payload = this.encodeInput(input);
    const msg = manifest_v5.InvokeAction.create({ actionId: actionId, correlationId: correlationId, payload: payload });
    const body = manifest_v5.InvokeAction.encode(msg, new Writer()).finish();
    
    console.log("Invoking action. correlationId:", correlationId);
    
    const promise = new Promise<InvokeResult>((resolve) => { 
        this.pending.set(correlationId, resolve);
        console.log("Added resolver. Pending after:", Array.from(this.pending.keys()));
    });
    
    // Defer writing to device to ensure pending map is populated
    setTimeout(() => {
        console.log("Writing to device. correlationId:", correlationId);
        this.device.write(encodeFrame(FrameKind.InvokeAction, 0, body));
    }, 0);
    
    return promise;
  }

  private encodeInput(input: Record<string, unknown>): Uint8Array {
    if (!input || Object.keys(input).length === 0) return new Uint8Array();
    return new TextEncoder().encode(JSON.stringify(input));
  }

  private slugFallbackId(slug: string): number {
    if (slug === 'toggle') return 1;
    if (slug === 'setBrightness') return 2;
    throw new Error(`BleRuntime: no numeric id known for slug "${slug}". Load manifest first.`);
  }
}
