export interface InvokeResult {
  status: 'ok' | 'error';
  payload?: Uint8Array;
  message?: string;
}

export interface SnapshotMap {
  get(resourceId: number): any;
}

export type SubscriptionListener = (snapshot: any) => void;
export type Unsubscribe = () => void;

export interface ManifestV5Runtime {
  loadManifest(): Promise<any>;
  snapshot(): Promise<SnapshotMap>;
  subscribe(slugs: readonly string[], cb: SubscriptionListener): Unsubscribe;
  invokeAction(actionSlug: string, input: Record<string, unknown>): Promise<InvokeResult>;
}
