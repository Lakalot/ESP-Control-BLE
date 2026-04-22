export type FirmwareSymbolCategory = 'resource' | 'action' | 'screen' | 'node';

export interface FirmwareSymbolItem {
  id: string;
  firmwareSymbol?: string;
}

export interface FirmwareSymbolManifest {
  resources: readonly FirmwareSymbolItem[];
  actions: readonly FirmwareSymbolItem[];
  nodes: readonly FirmwareSymbolItem[];
}

export type FirmwareSymbolManifestInput = FirmwareSymbolManifest &
  ({ screens: readonly FirmwareSymbolItem[] } | { views: readonly FirmwareSymbolItem[] });

export interface GeneratedFirmwareSymbols {
  headerText: string;
  sourceText: string;
}
