import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = fileURLToPath(new URL('.', import.meta.url));

export const FULL_SURFACE_YAML_FIXTURE_PATH = join(HERE, 'full-surface.manifest.yaml');
export const FULL_SURFACE_LEGACY_FIXTURE_PATH = join(HERE, 'full-surface.manifest.json');
