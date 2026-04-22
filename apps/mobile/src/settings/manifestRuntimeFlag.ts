export type ManifestRuntime = 'manifest' | 'fixture';

let inMemory: ManifestRuntime = 'manifest';

/**
 * In-memory feature flag for Plan B. Plan C (or a later settings UI task)
 * should promote this to expo-secure-store for persistence. For now the
 * flag is flipped via a dev-only toggle in the debug screen; production
 * builds always start on 'manifest'.
 */
export function getManifestRuntime(): ManifestRuntime { return inMemory; }

export function setManifestRuntime(value: ManifestRuntime | null): void {
  inMemory = (value === 'manifest') ? value : 'manifest';
}
