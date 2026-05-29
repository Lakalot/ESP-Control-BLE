/**
 * Which runtime backs the control screen:
 *  - 'device'  : BleRuntime over real BLE (production default).
 *  - 'fixture' : bundled FixtureRuntime (no hardware) — a debug mode for
 *                exercising the full UI without an ESP32.
 * In-memory only; production builds start on 'device'.
 */
export type ManifestRuntimeFlag = 'device' | 'fixture';

let inMemory: ManifestRuntimeFlag = 'device';

export function getManifestRuntime(): ManifestRuntimeFlag { return inMemory; }

export function setManifestRuntime(value: ManifestRuntimeFlag | null): void {
  inMemory = value === 'fixture' ? 'fixture' : 'device';
}
