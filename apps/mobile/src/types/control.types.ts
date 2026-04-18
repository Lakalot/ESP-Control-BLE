import type { Value } from '../store/deviceStore';
import type { ManifestCommand, NodeStyle, NodeVariant } from './manifest.types';

export interface ControlProps {
  command: ManifestCommand;
  currentValue: Value;
  lastUpdatedAt?: number;
  isPending: boolean;
  onAction: (cmdId: number, payload: Uint8Array) => void;
  variant: NodeVariant;
  surfaceStyle: NodeStyle;
  titleOverride?: string;
  subtitle?: string;
}
