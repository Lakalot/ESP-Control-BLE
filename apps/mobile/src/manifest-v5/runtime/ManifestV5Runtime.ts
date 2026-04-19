import { ResourceValue } from '../model/snapshot.types';
import { RuntimeManifest } from '../model/runtime.types';

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

export interface SnapshotMap {
  get(resourceId: number): any;
}

export type SubscriptionListener = (update: SubscriptionUpdate) => void;
export type Unsubscribe = () => void;

export interface ManifestV5Runtime {
  loadManifest(): Promise<RuntimeManifest>;
  snapshot(): Promise<SnapshotMap>;
  subscribe(slugs: readonly string[], cb: (update: SubscriptionUpdate) => void): Unsubscribe;
  invokeAction(actionSlug: string, input: Record<string, unknown>): Promise<InvokeResult>;
}
