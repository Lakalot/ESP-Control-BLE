export type CmdId = number;

export enum CmdType {
  ACTION = 0x01,
  RANGE = 0x02,
  TOGGLE = 0x03,
  READ_ONLY = 0x04,
  TEXT_INPUT = 0x05,
  COLOR_PICKER = 0x06,
  XY_PAD = 0x07,
  MULTI_SELECT = 0x08,
  PROGRESS = 0x09,
}

export enum NodeKind {
  SECTION = 0x01,
  STACK = 0x02,
  ROW = 0x03,
  GRID = 0x04,
  COMMAND = 0x05,
  TEXT = 0x06,
  DIVIDER = 0x07,
}

export enum NodeVariant {
  DEFAULT = 0x00,
  CARD = 0x01,
  COMPACT = 0x02,
  HERO = 0x03,
  INLINE = 0x04,
}

export enum NodeStyle {
  DEFAULT = 0x00,
  SURFACE = 0x01,
  INSET = 0x02,
  TOOLBAR = 0x03,
}

export interface RangeParams {
  min: number;
  max: number;
}

export interface CmdOptions {
  unit?: string;
  icon?: string;
  color?: string;
  confirm?: string;
  refreshMs?: number;
  step?: number;
  format?: string;
  scale?: number;
  minLabel?: string;
  maxLabel?: string;
  dangerous?: boolean;
  disabled?: boolean;
  badge?: string;
  choices?: string;
  hint?: string;
}

export interface ManifestCommand {
  id: CmdId;
  type: CmdType;
  name: string;
  params?: RangeParams;
  options: CmdOptions;
}

export interface NodeOptions {
  title?: string;
  subtitle?: string;
  text?: string;
  columns?: number;
  span?: number;
  variant?: NodeVariant;
  style?: NodeStyle;
  collapsed?: boolean;
  gap?: number;
}

export interface ManifestNode {
  id: number;
  parentId: number | null;
  kind: NodeKind;
  refId?: number;
  options: NodeOptions;
  children: ManifestNode[];
  command?: ManifestCommand;
}

export interface ParsedManifest {
  version: number;
  commands: ManifestCommand[];
  nodes: ManifestNode[];
  rootNodes: ManifestNode[];
}
