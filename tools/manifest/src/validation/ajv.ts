import Ajv, { type ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import { GENERATED_TOP_LEVEL_NAMES_SET } from '../generate/firmwareSymbolRules.js';
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
  const errors: Diagnostic[] = structuralOk ? [] : formatAjvErrors(validate.errors);

  if (structuralOk) {
    errors.push(...collectDuplicateIdErrors(input as Record<string, unknown>));
    errors.push(...collectDuplicateFirmwareSymbolErrors(input as Record<string, unknown>));
    errors.push(...collectFirmwareSymbolCollisionErrors(input as Record<string, unknown>));
  }

  return errors.length === 0 ? { ok: true } : { ok: false, errors };
}

function collectDuplicateIdErrors(manifest: Record<string, unknown>): Diagnostic[] {
  const sections: Array<[string, unknown]> = [
    ['resources', manifest.resources],
    ['actions', manifest.actions],
    ['views', manifest.views],
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

function collectDuplicateFirmwareSymbolErrors(manifest: Record<string, unknown>): Diagnostic[] {
  const sections: Array<[string, unknown]> = [
    ['resources', manifest.resources],
    ['actions', manifest.actions],
    ['views', manifest.views],
    ['nodes', manifest.nodes],
  ];
  const out: Diagnostic[] = [];

  for (const [section, value] of sections) {
    if (!Array.isArray(value)) continue;
    const seen = new Set<string>();
    for (const item of value) {
      const symbol = (item as { firmwareSymbol?: unknown }).firmwareSymbol;
      if (typeof symbol !== 'string') continue;
      if (seen.has(symbol)) {
        out.push({
          path: `/${section}`,
          keyword: 'uniqueFirmwareSymbol',
          message: `duplicate firmwareSymbol '${symbol}' in ${section}`,
          objectId: symbol,
        });
      }
      seen.add(symbol);
    }
  }

  return out;
}

function collectFirmwareSymbolCollisionErrors(manifest: Record<string, unknown>): Diagnostic[] {
  const sections: Array<[string, unknown]> = [
    ['resources', manifest.resources],
    ['actions', manifest.actions],
    ['views', manifest.views],
    ['nodes', manifest.nodes],
  ];
  const out: Diagnostic[] = [];

  for (const [section, value] of sections) {
    if (!Array.isArray(value)) continue;
    for (let index = 0; index < value.length; ++index) {
      const symbol = (value[index] as { firmwareSymbol?: unknown }).firmwareSymbol;
      if (typeof symbol !== 'string') continue;
      if (GENERATED_TOP_LEVEL_NAMES_SET.has(symbol)) {
        out.push({
          path: `/${section}/${index}/firmwareSymbol`,
          keyword: 'emittedNameCollision',
          message: `firmwareSymbol '${symbol}' collides with an emitted name`,
          objectId: symbol,
        });
      }
    }
  }

  return out;
}
