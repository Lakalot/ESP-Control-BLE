import { Platform } from 'react-native';

export const palette = {
  bg: '#07111f',
  bgMuted: '#0b1627',
  panel: '#0f1c30',
  panelElevated: '#13233b',
  panelInset: '#091322',
  border: '#23324b',
  borderStrong: '#31425e',
  text: '#eff6ff',
  muted: '#91a6c6',
  subtle: '#667c9d',
  accent: '#53d7c2',
  accentAlt: '#6ecbff',
  success: '#7be495',
  warn: '#ffd166',
  danger: '#ff7b72',
  chip: '#162640',
  overlay: '#050a12',
  white: '#ffffff',
  black: '#000000',
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 24,
  pill: 999,
};

export const shadows = {
  card: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOpacity: 0.24,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
    },
    android: {
      elevation: 5,
    },
    default: {},
  }),
};

export function withAlpha(hex: string, alpha: number): string {
  const safeHex = hex.replace('#', '');
  if (safeHex.length !== 6) return `rgba(255,255,255,${alpha})`;

  const r = parseInt(safeHex.slice(0, 2), 16);
  const g = parseInt(safeHex.slice(2, 4), 16);
  const b = parseInt(safeHex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
}
