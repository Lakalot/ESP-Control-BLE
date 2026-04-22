import { readFileSync } from 'node:fs';
import { resolve, extname } from 'node:path';
import { pathToFileURL } from 'node:url';

export async function loadManifestSource(sourcePath: string): Promise<unknown> {
  const absolute = resolve(sourcePath);

  if (extname(absolute) === '.json') {
    return JSON.parse(readFileSync(absolute, 'utf8'));
  }

  const moduleUrl = pathToFileURL(absolute).href;
  const mod = (await import(moduleUrl)) as Record<string, unknown>;

  for (const [key, value] of Object.entries(mod)) {
    if (key === 'default') continue;
    if (
      value !== null &&
      typeof value === 'object' &&
      ((value as { version?: unknown }).version === 5 ||
        key === 'manifest' ||
        key === 'MANIFEST' ||
        key.endsWith('_MANIFEST'))
    ) {
      return value;
    }
  }

  if (mod.default !== undefined) {
    return mod.default;
  }

  throw new Error(`no manifest export found in ${absolute}`);
}
