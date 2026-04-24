import { readFileSync } from 'node:fs';
import { resolve, extname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { expandAuthoringManifest } from '../authoring/expand.js';
import { loadYamlManifest } from '../authoring/loadYamlManifest.js';

export async function loadManifestSource(sourcePath: string): Promise<unknown> {
  const absolute = resolve(sourcePath);
  const extension = extname(absolute).toLowerCase();

  if (extension === '.json') {
    return JSON.parse(readFileSync(absolute, 'utf8'));
  }

  if (extension === '.yaml' || extension === '.yml') {
    const result = loadYamlManifest(absolute);

    if (!result.ok) {
      throw new Error(result.errors.map((error) => `${error.path}: ${error.message}`).join('\n'));
    }

    return expandAuthoringManifest(result.value);
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
