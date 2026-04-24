import { readFileSync } from 'node:fs';
import { parseDocument } from 'yaml';
import { diagnostic, type AuthoringLoadResult } from './diagnostics.js';

export function loadYamlManifest(sourcePath: string): AuthoringLoadResult<unknown> {
  const source = readFileSync(sourcePath, 'utf8');
  const document = parseDocument(source, { prettyErrors: false });

  if (document.errors.length > 0) {
    return {
      ok: false,
      errors: document.errors.map((error) => diagnostic(sourcePath, error.message)),
    };
  }

  const value = document.toJS();

  if (value === null || Array.isArray(value) || typeof value !== 'object') {
    return {
      ok: false,
      errors: [diagnostic(sourcePath, 'root must be a YAML object')],
    };
  }

  return { ok: true, value };
}
