/**
 * Tiny tagged debug logger.
 *
 * Protocol-level tracing (manifest transfer, snapshot/delta decode, subscribe)
 * is invaluable when a device's state doesn't show up on the dashboard, but it
 * is noise during normal use. Each tag is gated by a flag so traces can be
 * turned on per-subsystem without editing call sites.
 *
 * Enable by either:
 *   - flipping a flag in `DEBUG_TAGS` below (dev builds), or
 *   - setting the `EXPO_PUBLIC_DEBUG` env var to a comma-separated list of tags
 *     (or `*` for all), e.g. `EXPO_PUBLIC_DEBUG=ble` / `EXPO_PUBLIC_DEBUG=*`.
 */

type DebugTag = 'ble' | 'spp';

// Default per-tag switches. Keep these `false` in committed code; flip locally
// while debugging, or use EXPO_PUBLIC_DEBUG (which overrides these).
const DEBUG_TAGS: Record<DebugTag, boolean> = {
  ble: false,
  spp: false,
};

function envEnabled(tag: DebugTag): boolean {
  const raw = process.env.EXPO_PUBLIC_DEBUG;
  if (!raw) return false;
  if (raw === '*') return true;
  return raw
    .split(',')
    .map((t: string) => t.trim())
    .includes(tag);
}

function enabled(tag: DebugTag): boolean {
  return DEBUG_TAGS[tag] || envEnabled(tag);
}

/** Returns a `console.log`-style function that only emits when `tag` is enabled. */
export function makeLog(tag: DebugTag): (...args: unknown[]) => void {
  const prefix = `[${tag}]`;
  return (...args: unknown[]) => {
    if (enabled(tag)) {
      // eslint-disable-next-line no-console
      console.log(prefix, ...args);
    }
  };
}
