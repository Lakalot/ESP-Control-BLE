import { CmdOptions } from '../types/manifest.types';

export function applyFormat(fmt: string, value: number): string {
  const match = fmt.match(/^%(\.\d+)?([dfisFI])$/);
  if (!match) return String(value);

  const precisionToken = match[1];
  const specifier = match[2].toLowerCase();

  if (specifier === 'f') {
    const precision = precisionToken != null ? parseInt(precisionToken.slice(1), 10) : 6;
    return value.toFixed(precision);
  }

  if (specifier === 'd' || specifier === 'i') {
    return String(Math.trunc(value));
  }

  return String(value);
}

export function formatValue(raw: number, opts: CmdOptions): string {
  const scaled = opts.scale != null && opts.scale !== 0 ? raw / opts.scale : raw;

  let formatted: string;
  if (opts.format) {
    formatted = applyFormat(opts.format, scaled);
  } else {
    formatted = Number.isInteger(scaled)
      ? String(scaled)
      : scaled.toFixed(2).replace(/\.?0+$/, '');
  }

  return opts.unit ? `${formatted} ${opts.unit}` : formatted;
}
