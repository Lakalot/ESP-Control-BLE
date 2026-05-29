import { Writer, Reader } from 'protobufjs/minimal';
import type { ManifestRuntime, InvokeResult, SnapshotMap, SubscriptionListener, Unsubscribe, SubscriptionUpdate } from './ManifestRuntime';
import { BleFrameStream } from './bleFrameStream';
import { encodeFrame, FrameKind } from './frameCodec';
import { computeAuthResponse } from './auth';
import * as root from '../generated/manifest.pbjs';
const manifest = (root as any).esp_control;
import type { FixtureBleDevice } from './BleRuntime.fixture';
import { RuntimeManifest } from '../model/runtime.types';
import { decodeManifest } from '../decode/decodeManifest';
import type { ResourceValue, ResourceState } from '../model/snapshot.types';

export class AuthError extends Error {
  constructor(message: string) { super(message); this.name = 'AuthError'; }
}

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

export class BleRuntime implements ManifestRuntime {
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
  private manifestChunks: Uint8Array[] = [];
  private manifestTotalLen = 0;
  private manifestResolve: ((bytes: Uint8Array) => void) | null = null;
  private manifestReject: ((err: Error) => void) | null = null;
  private bufferedManifest: Uint8Array | null = null;
  private pin: string | null = null;
  private authResolve: (() => void) | null = null;
  private authReject: ((err: Error) => void) | null = null;
  private authTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private device: FixtureBleDevice) {
    device.onNotify((chunk) => this.stream.feed(chunk));
    this.stream.onFrame((frame) => this.dispatchFrame(frame.kind, frame.body));
  }

  /**
   * Run the in-band auth handshake: send AuthRequest, answer the AuthChallenge
   * with SHA-256(pin||nonce)[:16], resolve on AuthResult OK / reject on FAIL.
   */
  authenticate(pin: string, timeoutMs = 5000): Promise<void> {
    // Abort any handshake still in flight before starting a new one, so an
    // earlier timer can never clobber this call's resolvers.
    if (this.authReject) {
      const prevReject = this.authReject;
      this.clearAuthWaiters();
      prevReject(new AuthError('auth superseded by a new attempt'));
    }
    this.pin = pin;
    return new Promise<void>((resolve, reject) => {
      this.authResolve = resolve;
      this.authReject = reject;
      this.authTimer = setTimeout(() => {
        this.clearAuthWaiters();
        reject(new AuthError('auth timed out'));
      }, timeoutMs);
      // Empty-body AuthRequest kicks off the handshake.
      this.device.write(encodeFrame(FrameKind.AuthRequest, 0, new Uint8Array(0)))
        .catch((err) => { this.clearAuthWaiters(); reject(new AuthError(`auth send failed: ${err?.message ?? err}`)); });
    });
  }

  private clearAuthWaiters() {
    if (this.authTimer) { clearTimeout(this.authTimer); this.authTimer = null; }
    this.authResolve = null;
    this.authReject = null;
    this.pin = null;
  }

  private async onAuthChallenge(nonce: Uint8Array) {
    if (!this.pin || !this.authReject) return; // no handshake in progress
    try {
      const hash = await computeAuthResponse(this.pin, nonce);
      await this.device.write(encodeFrame(FrameKind.AuthResponse, 0, hash));
    } catch (err) {
      const reject = this.authReject;
      this.clearAuthWaiters();
      reject?.(new AuthError(`auth response failed: ${(err as Error)?.message ?? err}`));
    }
  }

  private onAuthResult(body: Uint8Array) {
    const ok = body.length >= 1 && body[0] === 0x01;
    const resolve = this.authResolve;
    const reject = this.authReject;
    this.clearAuthWaiters();
    if (ok) resolve?.();
    else reject?.(new AuthError('auth rejected (wrong PIN)'));
  }

  private dispatchFrame(kind: FrameKind, body: Uint8Array) {
    if (kind === FrameKind.AuthChallenge) { void this.onAuthChallenge(body); return; }
    if (kind === FrameKind.AuthResult) { this.onAuthResult(body); return; }

    if (kind === FrameKind.ManifestChunk || kind === FrameKind.ManifestEof) {
      console.log('[BleRuntime] manifest frame kind=', kind, 'bodyLen=', body.length);
    }

    if (kind === FrameKind.InvokeResult) {
      const msg = manifest.InvokeResult.decode(new Reader(body));
      const resolver = this.pending.get(msg.correlationId);
      if (resolver) {
        this.pending.delete(msg.correlationId);
        resolver({
          status: msg.status === manifest.Status.STATUS_OK ? 'ok' : 'error',
          payload: msg.payload ?? new Uint8Array(),
          message: msg.message ?? '',
        });
      }
      return;
    }

    if (kind === FrameKind.Snapshot) {
      const msg = manifest.ResourceSnapshot.decode(new Reader(body));
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
      const msg = manifest.ResourceDelta.decode(new Reader(body));
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

    if (kind === FrameKind.ManifestChunk) {
      this.manifestChunks.push(body);
      this.manifestTotalLen += body.length;
      return;
    }

    if (kind === FrameKind.ManifestEof) {
      const fullManifest = new Uint8Array(this.manifestTotalLen);
      let offset = 0;
      for (const chunk of this.manifestChunks) {
        fullManifest.set(chunk, offset);
        offset += chunk.length;
      }
      this.manifestChunks = [];
      this.manifestTotalLen = 0;

      if (body.length < 8) {
        this.manifestReject?.(new Error('Manifest EOF frame too small'));
        this.manifestResolve = null;
        this.manifestReject = null;
        return;
      }
      const view = new DataView(body.buffer, body.byteOffset, body.byteLength);
      const expectedSize = view.getUint32(0, false);
      const expectedCrc = view.getUint32(4, false);

      if (fullManifest.length !== expectedSize) {
        this.manifestReject?.(new Error(`Manifest size mismatch: ${fullManifest.length} vs ${expectedSize}`));
        this.manifestResolve = null;
        this.manifestReject = null;
        return;
      }
      if (this.crc32(fullManifest) !== expectedCrc) {
        this.manifestReject?.(new Error('Manifest CRC mismatch'));
        this.manifestResolve = null;
        this.manifestReject = null;
        return;
      }
      if (this.manifestResolve) {
        this.manifestResolve(fullManifest);
        this.manifestResolve = null;
        this.manifestReject = null;
      } else {
        this.bufferedManifest = fullManifest;
      }
      return;
    }

    console.log('[BleRuntime] Unhandled frame kind=', kind, 'bodyLen=', body.length);
  }

  private fanOut(slug: string, state: ResourceState) {
    const update: SubscriptionUpdate = { slug, value: state.value, updatedAt: state.updatedAt };
    this.listeners.get(slug)?.forEach((l) => l(update));
  }

  async loadManifest(): Promise<RuntimeManifest> {
    if (this.manifest) return this.manifest;
    console.log('[BleRuntime] loadManifest: waiting for manifest transfer');
    const bytes = await this.readManifestTransfer();
    console.log('[BleRuntime] loadManifest: got', bytes.length, 'bytes, decoding...');
    this.manifest = decodeManifest(bytes);
    console.log('[BleRuntime] loadManifest: decoded OK, resources=', this.manifest.resources.size, 'actions=', this.manifest.actions.size);
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
    const msg = manifest.InvokeAction.create({
      actionId,
      correlationId,
      ...(payload ? { payload } : {}),
    });
    await this.device.write(encodeFrame(FrameKind.InvokeAction, 0, manifest.InvokeAction.encode(msg).finish()));
    return await resultPromise;
  }

  private async awaitInvokeResult(correlationId: number): Promise<InvokeResult> {
    return new Promise((resolve) => {
      this.pending.set(correlationId, resolve);
    });
  }

  private async readManifestTransfer(): Promise<Uint8Array> {
    if (this.bufferedManifest) {
      console.log('[BleRuntime] readManifestTransfer: using buffered manifest', this.bufferedManifest.length);
      const cached = this.bufferedManifest;
      this.bufferedManifest = null;
      return cached;
    }
    if ((this.device as any).manifestBytes) {
      console.log('[BleRuntime] readManifestTransfer: using fixture manifest bytes');
      return (this.device as any).manifestBytes;
    }

    return new Promise((resolve, reject) => {
      console.log('[BleRuntime] readManifestTransfer: awaiting live manifest frames');
      this.manifestResolve = resolve;
      this.manifestReject = reject;
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
        const msg = manifest.Subscribe.create({ resourceIds });
        const encoded = manifest.Subscribe.encode(msg).finish();
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
      return manifest.CommonValue.create({ boolValue: v });
    }
    if (typeof v === 'number') {
      if (Number.isInteger(v) && v >= 0) {
        return manifest.CommonValue.create({ uintValue: v >>> 0 });
      }
      if (Number.isInteger(v)) {
        return manifest.CommonValue.create({ intValue: v });
      }
      return manifest.CommonValue.create({ floatValue: v });
    }
    if (typeof v === 'string') {
      return manifest.CommonValue.create({ enumValue: v });
    }
    return null;
  }
}
