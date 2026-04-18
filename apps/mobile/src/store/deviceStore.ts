import { create } from 'zustand';

import { CmdId, ParsedManifest } from '../types/manifest.types';

export type XYValue = { x: number; y: number };
export type Value = number | boolean | string | XYValue | null;

interface DeviceStore {
  manifest: ParsedManifest | null;
  commandValues: Record<CmdId, Value>;
  pendingCommands: Set<CmdId>;

  setManifest: (manifest: ParsedManifest | null) => void;
  setCommandValue: (cmdId: CmdId, value: Value) => void;
  addPendingCommand: (cmdId: CmdId) => void;
  removePendingCommand: (cmdId: CmdId) => void;
  reset: () => void;
}

export const useDeviceStore = create<DeviceStore>((set) => ({
  manifest: null,
  commandValues: {},
  pendingCommands: new Set(),

  setManifest: (manifest) => set({ manifest }),
  setCommandValue: (cmdId, value) =>
    set((state) => ({ commandValues: { ...state.commandValues, [cmdId]: value } })),
  addPendingCommand: (cmdId) =>
    set((state) => ({ pendingCommands: new Set(state.pendingCommands).add(cmdId) })),
  removePendingCommand: (cmdId) =>
    set((state) => {
      const next = new Set(state.pendingCommands);
      next.delete(cmdId);
      return { pendingCommands: next };
    }),
  reset: () => set({ manifest: null, commandValues: {}, pendingCommands: new Set() }),
}));
