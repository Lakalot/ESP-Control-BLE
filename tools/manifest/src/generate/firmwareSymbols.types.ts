export type FirmwareSymbolCategory = 'resource' | 'action' | 'screen' | 'node';

export interface FirmwareSymbolItem {
  id: string;
  firmwareSymbol?: string;
}

export interface FirmwareSymbolManifest {
  resources: readonly FirmwareSymbolItem[];
  actions: readonly FirmwareSymbolItem[];
  screens: readonly FirmwareSymbolItem[];
  nodes: readonly FirmwareSymbolItem[];
}

export interface GeneratedFirmwareSymbols {
  headerText: string;
  sourceText: string;
}
