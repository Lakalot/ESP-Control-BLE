import type {
  InvokeResult, ManifestV5Runtime, SubscriptionListener, SubscriptionUpdate, Unsubscribe,
} from './ManifestV5Runtime';
import type { ResourceValue, SnapshotMap, ResourceState } from '../model/snapshot.types';
import type { RuntimeManifest } from '../model/runtime.types';
import { decodeManifest } from '../decode/decodeManifest';

interface FixtureRuntimeOptions {
  manifestBytes: Uint8Array;
  initialState?: Record<string, ResourceValue>;
  /** Invocation side-effect; defaults to a no-op that returns ok:true. */
  onInvoke?: (actionSlug: string, input: Record<string, unknown>) => InvokeResult;
}

/**
 * In-memory runtime used for tests, Storybook, and the pilot's dev harness.
 * Plan C will ship `BleRuntime` implementing the same interface over NimBLE.
 */
export class FixtureRuntime implements ManifestV5Runtime {
  private manifest: RuntimeManifest | null = null;
  private readonly state = new Map<string, ResourceState>();
  private readonly listeners = new Map<string, Set<SubscriptionListener>>();
  public readonly invocations: Array<{ actionSlug: string; input: Record<string, unknown> }> = [];

  constructor(private readonly opts: FixtureRuntimeOptions) {}

  async loadManifest(): Promise<RuntimeManifest> {
    if (!this.manifest) {
      this.manifest = decodeManifest(this.opts.manifestBytes);
      const now = Date.now();
      for (const [slug, value] of Object.entries(this.opts.initialState ?? {})) {
        this.state.set(slug, { slug, value, updatedAt: now, stale: false });
      }
    }
    return this.manifest;
  }

  async snapshot(): Promise<SnapshotMap> {
    return new Map(this.state);
  }

  subscribe(slugs: readonly string[], cb: SubscriptionListener): Unsubscribe {
    const keys = slugs.length ? slugs : ['*'];
    for (const k of keys) {
      const bag = this.listeners.get(k) ?? new Set<SubscriptionListener>();
      bag.add(cb);
      this.listeners.set(k, bag);
    }
    return () => {
      for (const k of keys) this.listeners.get(k)?.delete(cb);
    };
  }

  async invokeAction(actionSlug: string, input: Record<string, unknown>): Promise<InvokeResult> {
    this.invocations.push({ actionSlug, input });
    return this.opts.onInvoke?.(actionSlug, input) ?? { ok: true };
  }

  /** Test/dev helper: push an update that fan-outs to subscribers. */
  push(slug: string, value: ResourceValue): void {
    const updatedAt = Date.now();
    this.state.set(slug, { slug, value, updatedAt, stale: false });
    const update: SubscriptionUpdate = { slug, value, updatedAt };
    this.listeners.get(slug)?.forEach((l) => l(update));
    this.listeners.get('*')?.forEach((l) => l(update));
  }
}