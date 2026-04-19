import type { ResourceValue, SnapshotMap } from '../model/snapshot.types';
import type { RuntimeManifest } from '../model/runtime.types';

export type { SnapshotMap } from '../model/snapshot.types';

export interface InvokeResult {
  status: 'ok' | 'error';
  payload?: Uint8Array;
  message?: string;
}

export interface SubscriptionUpdate {
  slug: string;
  value: ResourceValue;
  updatedAt: number;
}

export type SubscriptionListener = (update: SubscriptionUpdate) => void;
export type Unsubscribe = () => void;

export interface ManifestV5Runtime {
  loadManifest(): Promise<RuntimeManifest>;
  snapshot(): Promise<SnapshotMap>;
  subscribe(slugs: readonly string[], cb: (update: SubscriptionUpdate) => void): Unsubscribe;
  invokeAction(actionSlug: string, input: Record<string, unknown>): Promise<InvokeResult>;
}
