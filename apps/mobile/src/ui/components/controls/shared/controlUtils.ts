import { palette, withAlpha } from '../../../theme/ui';
import { NodeStyle } from '../../../../types/manifest.types';

export function resolveSurface(style: NodeStyle) {
  switch (style) {
    case NodeStyle.SURFACE:
      return {
        backgroundColor: palette.panelElevated,
        borderColor: withAlpha(palette.white, 0.08),
      };
    case NodeStyle.INSET:
      return {
        backgroundColor: palette.panelInset,
        borderColor: withAlpha(palette.white, 0.05),
      };
    case NodeStyle.TOOLBAR:
      return {
        backgroundColor: withAlpha(palette.white, 0.03),
        borderColor: withAlpha(palette.white, 0.05),
      };
    default:
      return {
        backgroundColor: palette.panel,
        borderColor: palette.border,
      };
  }
}

export function iconChar(name: string): string {
  const icons: Record<string, string> = {
    brightness: '*',
    speed: '~',
    temp: 'T',
    power: 'P',
    fan: 'F',
    lock: 'L',
    bell: 'B',
    wifi: 'W',
    color: 'C',
    joystick: 'J',
  };
  return icons[name] ?? 'O';
}

export function makeRangePayload(value: number): Uint8Array {
  const payload = new Uint8Array(2);
  new DataView(payload.buffer).setInt16(0, Math.round(value), false);
  return payload;
}

export function makeTextPayload(text: string): Uint8Array {
  return new TextEncoder().encode(text).slice(0, 32);
}

export function makeColorPayload(hex: string): Uint8Array {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return new Uint8Array([r, g, b]);
}

export function makeXyPayload(x: number, y: number): Uint8Array {
  const payload = new Uint8Array(4);
  const view = new DataView(payload.buffer);
  view.setInt16(0, x, false);
  view.setInt16(2, y, false);
  return payload;
}

export function makeIndexPayload(index: number): Uint8Array {
  return new Uint8Array([index & 0xff]);
}
