import { create } from 'zustand';

/**
 * Active transport for the control screen:
 *  - 'ble'     : BleRuntime over BLE (RealBleDevice).
 *  - 'spp'     : BleRuntime over Bluetooth Classic SPP (SppDevice) — for devices
 *                whose BLE hardware is unavailable.
 *  - 'fixture' : bundled FixtureRuntime (no hardware) — debug mode.
 *
 * Backed by a zustand store so the scan and control screens RE-RENDER when the
 * startup auto-detection (selectInitialTransport) resolves and flips this to
 * 'spp' on a broken-BLE tablet. The store starts at 'ble'; components read it
 * reactively via useTransport(), while non-React callers (startup detection,
 * tests) use the imperative getTransport()/setTransport() below.
 */
export type Transport = 'ble' | 'spp' | 'fixture';

interface TransportStore {
  transport: Transport;
  setTransport: (value: Transport | null) => void;
}

const normalize = (value: Transport | null): Transport =>
  value === 'spp' || value === 'fixture' ? value : 'ble';

export const useTransportStore = create<TransportStore>((set) => ({
  transport: 'ble',
  setTransport: (value) => set({ transport: normalize(value) }),
}));

/** Reactive hook for components — re-renders the caller when the transport changes. */
export function useTransport(): Transport {
  return useTransportStore((state) => state.transport);
}

/** Imperative getter for non-React code (startup detection, tests). */
export function getTransport(): Transport {
  return useTransportStore.getState().transport;
}

/** Imperative setter for non-React code; `null` / invalid values reset to 'ble'. */
export function setTransport(value: Transport | null): void {
  useTransportStore.getState().setTransport(value);
}
