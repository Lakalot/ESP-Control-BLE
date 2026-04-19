export type ManifestRuntime = 'v4' | 'v5' | 'v5-ble';

let inMemory: ManifestRuntime = 'v4';

/**
 * In-memory feature flag for Plan B. Plan C (or a later settings UI task)
 * should promote this to expo-secure-store for persistence. For now the
 * flag is flipped via a dev-only toggle in the debug screen; production
 * builds always start on 'v4'.
 */
export function getManifestRuntime(): ManifestRuntime { return inMemory; }

export function setManifestRuntime(value: ManifestRuntime | null): void {
  inMemory = (value === 'v5' || value === 'v5-ble') ? value : 'v4';
}
