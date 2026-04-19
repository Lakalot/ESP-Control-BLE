import Ajv, { type ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import { ManifestSpec } from '../schema/manifest.js';
import { type Diagnostic, formatAjvErrors } from './diagnostics.js';

const ajv = new Ajv({
  strict: true,
  allErrors: true,
  allowUnionTypes: true,
});
// @ts-ignore - ajv-formats has slightly incompatible types with ajv 8 in some environments
addFormats(ajv);

const validate: ValidateFunction = ajv.compile(ManifestSpec);

export type ValidateResult = { ok: true } | { ok: false; errors: Diagnostic[] };

export function validateManifest(input: unknown): ValidateResult {
  const structuralOk = validate(input);
  const errors: Diagnostic[] = structuralOk ? [] : (validate.errors ?? []).map((error) => ({
    path: error.instancePath || '/',
    message: error.message ?? 'schema validation failed',
  }));

  if (structuralOk) {
    errors.push(...collectDuplicateIdErrors(input as Record<string, unknown>));
  }

  return errors.length === 0 ? { ok: true } : { ok: false, errors };
}

function collectDuplicateIdErrors(manifest: Record<string, unknown>): Diagnostic[] {
  const sections: Array<[string, unknown]> = [
    ['resources', manifest.resources],
    ['actions', manifest.actions],
    ['screens', manifest.screens],
    ['nodes', manifest.nodes],
  ];
  const out: Diagnostic[] = [];

  for (const [section, value] of sections) {
    if (!Array.isArray(value)) continue;
    const seen = new Set<string>();
    for (const item of value) {
      const id = (item as { id?: unknown }).id;
      if (typeof id !== 'string') continue;
      if (seen.has(id)) {
        out.push({
          path: `/${section}`,
          keyword: 'uniqueId',
          message: `duplicate id '${id}' in ${section}`,
          objectId: id,
        });
      }
      seen.add(id);
    }
  }

  return out;
}
