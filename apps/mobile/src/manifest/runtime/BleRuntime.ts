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
import { makeLog } from '../../utils/logger';

// Protocol tracing (manifest transfer, snapshot/delta decode, subscribe). Off by
// default; enable with EXPO_PUBLIC_DEBUG=ble (see utils/logger.ts).
const log = makeLog('ble');

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
  private manifestTimer: ReturnType<typeof setTimeout> | null = null;
  private bufferedManifest: Uint8Array | null = null;
  private pin: string | null = null;
  private authResolve: (() => void) | null = null;
  private authReject: ((err: Error) => void) | null = null;
  private authTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private device: FixtureBleDevice) {
    device.onNotify((chunk) => this.stream.feed(chunk));
    this.stream.onFrame((frame) => this.dispatchFrame(frame.kind, frame.body));
    // A transport drop must clear any partial manifest transfer so a later
    // reconnect starts from a clean slate (no stale chunks corrupting the next
    // assembly).
    device.onDisconnected(() => this.reset());
  }

  /**
   * Subscribe to UNINTENTIONAL transport drops. Thin passthrough to the device
   * so the owning screen can forward drops to the connection machine without
   * reaching into the underlying RealBleDevice.
   */
  onDisconnected(cb: () => void): () => void {
    return this.device.onDisconnected(cb);
  }

  /**
   * Tear down the GATT connection. Thin passthrough so the screen can free the
   * firmware's exclusive session on unmount. The fixture device has no real
   * transport (disconnect is optional on the interface), so the `?.()` guard
   * resolves to a no-op there; RealBleDevice closes the link.
   */
  disconnect(): Promise<void> {
    return this.device.disconnect?.() ?? Promise.resolve();
  }

  /**
   * Clears in-flight manifest-transfer state. Called on disconnect so a partial
   * (un-EOF'd) transfer is discarded and any pending loadManifest() rejects
   * rather than hanging forever.
   */
  reset(): void {
    this.manifestChunks = [];
    this.manifestTotalLen = 0;
    const reject = this.manifestReject;
    this.clearManifestWaiters();
    reject?.(new Error('disconnected'));
  }

  /** Clears the manifest-transfer resolvers and any pending timeout timer. */
  private clearManifestWaiters() {
    if (this.manifestTimer) { clearTimeout(this.manifestTimer); this.manifestTimer = null; }
    this.manifestResolve = null;
    this.manifestReject = null;
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
      log('manifest frame kind=', kind, 'bodyLen=', body.length);
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
      log('Snapshot received, values count:', (msg.values ?? []).length);
      for (const rv of (msg.values ?? [])) {
        const slug = this.idToSlug.get(rv.resourceId);
        log('Snapshot rv.resourceId=', rv.resourceId, 'slug=', slug, 'hasValue=', !!rv.value);
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
      log('Delta received resourceId=', msg.resourceId, 'slug=', slug, 'hasValue=', !!msg.value, 'kind=', msg.value?.kind);
      if (!slug || !msg.value) return;
      const value = decodeCommonValue(msg.value);
      log('Delta decoded value=', JSON.stringify(value));
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
        const reject = this.manifestReject;
        this.clearManifestWaiters();
        reject?.(new Error('Manifest EOF frame too small'));
        return;
      }
      const view = new DataView(body.buffer, body.byteOffset, body.byteLength);
      const expectedSize = view.getUint32(0, false);
      const expectedCrc = view.getUint32(4, false);

      if (fullManifest.length !== expectedSize) {
        const reject = this.manifestReject;
        this.clearManifestWaiters();
        reject?.(new Error(`Manifest size mismatch: ${fullManifest.length} vs ${expectedSize}`));
        return;
      }
      if (this.crc32(fullManifest) !== expectedCrc) {
        const reject = this.manifestReject;
        this.clearManifestWaiters();
        reject?.(new Error('Manifest CRC mismatch'));
        return;
      }
      if (this.manifestResolve) {
        const resolve = this.manifestResolve;
        this.clearManifestWaiters();
        resolve(fullManifest);
      } else {
        this.bufferedManifest = fullManifest;
      }
      return;
    }

    log('Unhandled frame kind=', kind, 'bodyLen=', body.length);
  }

  private fanOut(slug: string, state: ResourceState) {
    const update: SubscriptionUpdate = { slug, value: state.value, updatedAt: state.updatedAt };
    this.listeners.get(slug)?.forEach((l) => l(update));
  }

  async loadManifest(timeoutMs = 10000): Promise<RuntimeManifest> {
    if (this.manifest) return this.manifest;
    log('loadManifest: waiting for manifest transfer');
    const bytes = await this.readManifestTransfer(timeoutMs);
    log('loadManifest: got', bytes.length, 'bytes, decoding...');
    this.manifest = decodeManifest(bytes);
    log('loadManifest: decoded OK, resources=', this.manifest.resources.size, 'actions=', this.manifest.actions.size);
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

  private async readManifestTransfer(timeoutMs = 10000): Promise<Uint8Array> {
    if (this.bufferedManifest) {
      log('readManifestTransfer: using buffered manifest', this.bufferedManifest.length);
      const cached = this.bufferedManifest;
      this.bufferedManifest = null;
      return cached;
    }
    if ((this.device as any).manifestBytes) {
      log('readManifestTransfer: using fixture manifest bytes');
      return (this.device as any).manifestBytes;
    }

    return new Promise((resolve, reject) => {
      log('readManifestTransfer: awaiting live manifest frames');
      this.manifestResolve = resolve;
      this.manifestReject = reject;
      // Guard against a transfer that never completes (no EOF / silent peer).
      // The timer is cleared on any settle path via clearManifestWaiters().
      this.manifestTimer = setTimeout(() => {
        const rej = this.manifestReject;
        this.clearManifestWaiters();
        rej?.(new Error('manifest transfer timed out'));
      }, timeoutMs);
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
      log('Subscribing to slugs=', newSlugs, 'resourceIds=', resourceIds);
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
