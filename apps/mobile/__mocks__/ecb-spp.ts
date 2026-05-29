import type { SppDeviceInfo } from '../modules/ecb-spp';

type Listener = (payload: any) => void;
const listeners: Record<string, Listener[]> = { onData: [], onDisconnected: [], onDeviceFound: [] };

function sub(event: string, cb: Listener) {
  listeners[event].push(cb);
  return { remove() { listeners[event] = listeners[event].filter((l) => l !== cb); } };
}

export const _state = {
  available: true,
  bonded: [] as SppDeviceInfo[],
  writes: [] as string[],
  connected: false,
};

export function _emitData(base64: string) { listeners.onData.forEach((l) => l({ data: base64 })); }
export function _emitDisconnected() { listeners.onDisconnected.forEach((l) => l({})); }
export function _emitDeviceFound(d: SppDeviceInfo) { listeners.onDeviceFound.forEach((l) => l(d)); }
export function _reset() {
  _state.available = true; _state.bonded = []; _state.writes = []; _state.connected = false;
  listeners.onData = []; listeners.onDisconnected = []; listeners.onDeviceFound = [];
}

export const EcbSpp = {
  isAvailable: async () => _state.available,
  listBondedDevices: async () => _state.bonded,
  startDiscovery: async () => {},
  stopDiscovery: async () => {},
  connect: async (_address: string) => { _state.connected = true; },
  write: async (base64: string) => { _state.writes.push(base64); },
  disconnect: async () => { _state.connected = false; },
  onData: (cb: (b: string) => void) => sub('onData', (p) => cb(p.data)),
  onDisconnected: (cb: () => void) => sub('onDisconnected', () => cb()),
  onDeviceFound: (cb: (d: SppDeviceInfo) => void) => sub('onDeviceFound', (p) => cb(p)),
};
