export type ResourceValue =
  | { kind: 'bool'; value: boolean }
  | { kind: 'int'; value: number }
  | { kind: 'uint'; value: number }
  | { kind: 'float'; value: number }
  | { kind: 'string'; value: string }
  | { kind: 'enum'; value: string }
  | { kind: 'duration_ms'; value: number }
  | { kind: 'null' };

export interface ResourceState {
  slug: string;
  value: ResourceValue;
  updatedAt: number;      // epoch ms when last observed
  stale: boolean;         // derived: now - updatedAt > staleAfterMs
}

export type SnapshotMap = ReadonlyMap<string, ResourceState>;