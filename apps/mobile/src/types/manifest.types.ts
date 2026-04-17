export type CmdId = number; // 0x00–0xFF

export enum CmdType {
  ACTION = 0x01,
  RANGE = 0x02,
  TOGGLE = 0x03,
  READ_ONLY = 0x04,
}

export interface RangeParams {
  min: number; // int16
  max: number; // int16
}

export interface ManifestCommand {
  id: CmdId;
  type: CmdType;
  name: string;
  params?: RangeParams; // présent seulement si type === RANGE
}

export interface ParsedManifest {
  version: number;
  commands: ManifestCommand[];
}
