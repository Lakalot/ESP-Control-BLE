/**
 * Active transport for the control screen:
 *  - 'ble'     : BleRuntime over BLE (RealBleDevice).
 *  - 'spp'     : BleRuntime over Bluetooth Classic SPP (SppDevice) — for devices
 *                whose BLE hardware is unavailable.
 *  - 'fixture' : bundled FixtureRuntime (no hardware) — debug mode.
 * In-memory only; default 'ble'. The startup auto-detection (selectTransport)
 * may set this to 'spp' when BLE is unsupported.
 */
export type Transport = 'ble' | 'spp' | 'fixture';

let inMemory: Transport = 'ble';

export function getTransport(): Transport { return inMemory; }

export function setTransport(value: Transport | null): void {
  inMemory = value === 'spp' || value === 'fixture' ? value : 'ble';
}
