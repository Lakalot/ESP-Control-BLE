import { Writer, Reader } from 'protobufjs/minimal';
import type { ManifestV5Runtime, InvokeResult, SnapshotMap, SubscriptionListener, Unsubscribe, SubscriptionUpdate } from './ManifestV5Runtime';
import { BleFrameStream } from './bleFrameStream';
import { encodeFrame, FrameKind } from './frameCodecV5';
import * as root from '../generated/manifest_v5.pbjs';
const manifest_v5 = (root as any).esp_control.v5;
import type { FixtureBleDevice } from './BleRuntime.fixture';
import { RuntimeManifest } from '../model/runtime.types';
import { decodeManifest } from '../decode/decodeManifest';
import type { ResourceValue, ResourceState } from '../model/snapshot.types';

function decodeCommonValue(cv: any): ResourceValue {
  switch (cv.kind) {
    case 'boolValue': return { kind: 'bool', value: cv.boolValue ?? false };
    case 'intValue': return { kind: 'int', value: cv.intValue ?? 0 };
    case 'uintValue': return { kind: 'uint', value: cv.uintValue ?? 0 };
    case 'floatValue': return { kind: 'float', value: cv.floatValue ?? 0 };
    case 'stringValue': return { kind: 'string', value: cv.stringValue ?? '' };
    case 'enumValue': return { kind: 'enum', value: cv.enumValue ?? '' };
    case 'durationMsValue': return { kind: 'duration_ms', value: cv.durationMsValue ?? 0 };
    default: return { kind: 'null' };
  }
}

export class BleRuntime implements ManifestV5Runtime {
  private stream = new BleFrameStream();
  private pending = new Map<number, (r: InvokeResult) => void>();
  private nextCorrelation = 1;
  private manifest: RuntimeManifest | null = null;
  private resourceIds = new Map<string, number>();
  private idToSlug = new Map<number, string>();
  private actionIds = new Map<string, number>();
  private listeners = new Map<string, Set<SubscriptionListener>>();
  private localSnapshot = new Map<string, ResourceState>();
  private subscribedSlugs = new Set<string>();

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
      return;
    }

    if (kind === FrameKind.Snapshot) {
      const msg = manifest_v5.ResourceSnapshot.decode(new Reader(body));
      const now = Date.now();
      console.log('[BleRuntime] Snapshot received, values count:', (msg.values ?? []).length);
      for (const rv of (msg.values ?? [])) {
        const slug = this.idToSlug.get(rv.resourceId);
        console.log('[BleRuntime] Snapshot rv.resourceId=', rv.resourceId, 'slug=', slug, 'hasValue=', !!rv.value);
        if (!slug || !rv.value) continue;
        const value = decodeCommonValue(rv.value);
        const state: ResourceState = { slug, value, updatedAt: now, stale: false };
        this.localSnapshot.set(slug, state);
        this.fanOut(slug, state);
      }
      return;
    }

    if (kind === FrameKind.Delta) {
      const msg = manifest_v5.ResourceDelta.decode(new Reader(body));
      const slug = this.idToSlug.get(msg.resourceId);
      console.log('[BleRuntime] Delta received resourceId=', msg.resourceId, 'slug=', slug, 'hasValue=', !!msg.value, 'kind=', msg.value?.kind);
      if (!slug || !msg.value) return;
      const value = decodeCommonValue(msg.value);
      console.log('[BleRuntime] Delta decoded value=', JSON.stringify(value));
      const state: ResourceState = { slug, value, updatedAt: Date.now(), stale: false };
      this.localSnapshot.set(slug, state);
      this.fanOut(slug, state);
      return;
    }

    // ManifestChunk (0x01) and ManifestEof (0x02) are handled by readManifestTransfer, not here.
    if (kind !== FrameKind.ManifestChunk && kind !== FrameKind.ManifestEof) {
      console.log('[BleRuntime] Unhandled frame kind=', kind, 'bodyLen=', body.length);
    }
  }

  private fanOut(slug: string, state: ResourceState) {
    const update: SubscriptionUpdate = { slug, value: state.value, updatedAt: state.updatedAt };
    this.listeners.get(slug)?.forEach((l) => l(update));
  }

  async loadManifest(): Promise<RuntimeManifest> {
    if (this.manifest) return this.manifest;
    const bytes = await this.readManifestTransfer();
    this.manifest = decodeManifest(bytes);
    this.resourceIds = new Map([...this.manifest.resources.values()].map((r) => [r.slug, r.runtimeId]));
    this.idToSlug = new Map([...this.manifest.resources.values()].map((r) => [r.runtimeId, r.slug]));
    this.actionIds = new Map([...this.manifest.actions.values()].map((a) => [a.slug, a.runtimeId]));
    return this.manifest;
  }

  async invokeAction(actionSlug: string, input: Record<string, unknown>): Promise<InvokeResult> {
    const actionId = this.actionIds.get(actionSlug);
    if (!actionId) throw new Error(`unknown action ${actionSlug}`);
    const correlationId = this.nextCorrelation++;

    const resultPromise = this.awaitInvokeResult(correlationId);

    const payload = this.buildPayload(input);
    const msg = manifest_v5.InvokeAction.create({
      actionId,
      correlationId,
      ...(payload ? { payload } : {}),
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
          const expectedSize = view.getUint32(0, false);
          const expectedCrc = view.getUint32(4, false);

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

  async snapshot(): Promise<SnapshotMap> {
    return new Map(this.localSnapshot);
  }

  subscribe(slugs: readonly string[], cb: SubscriptionListener): Unsubscribe {
    const newSlugs: string[] = [];
    for (const slug of slugs) {
      const bag = this.listeners.get(slug) ?? new Set<SubscriptionListener>();
      bag.add(cb);
      this.listeners.set(slug, bag);
      if (!this.subscribedSlugs.has(slug)) {
        this.subscribedSlugs.add(slug);
        newSlugs.push(slug);
      }
    }

    if (newSlugs.length > 0) {
      const resourceIds = newSlugs
        .map((s) => this.resourceIds.get(s))
        .filter((id): id is number => id !== undefined);
      console.log('[BleRuntime] Subscribing to slugs=', newSlugs, 'resourceIds=', resourceIds);
      if (resourceIds.length > 0) {
        const msg = manifest_v5.Subscribe.create({ resourceIds });
        const encoded = manifest_v5.Subscribe.encode(msg).finish();
        this.device.write(encodeFrame(FrameKind.Subscribe, 0, encoded)).catch(() => {});
      }
    }

    return () => {
      for (const slug of slugs) {
        this.listeners.get(slug)?.delete(cb);
      }
    };
  }

  private buildPayload(input: Record<string, unknown>): any | null {
    if (!input || Object.keys(input).length === 0) return null;
    const v = input.value;
    if (v === undefined || v === null) return null;

    // Build a CommonValue object for the InvokeAction.payload submessage field.
    if (typeof v === 'boolean') {
      return manifest_v5.CommonValue.create({ boolValue: v });
    }
    if (typeof v === 'number') {
      if (Number.isInteger(v) && v >= 0) {
        return manifest_v5.CommonValue.create({ uintValue: v >>> 0 });
      }
      if (Number.isInteger(v)) {
        return manifest_v5.CommonValue.create({ intValue: v });
      }
      return manifest_v5.CommonValue.create({ floatValue: v });
    }
    if (typeof v === 'string') {
      return manifest_v5.CommonValue.create({ enumValue: v });
    }
    return null;
  }
}
