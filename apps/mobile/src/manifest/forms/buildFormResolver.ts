import Ajv, { type ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import type { Resolver } from 'react-hook-form';

const ajv = new Ajv({ allErrors: true, strict: false, useDefaults: false });
addFormats(ajv);

function ajvErrorsToRhf(errors: ErrorObject[]): Record<string, { type: string; message: string }> {
  const out: Record<string, { type: string; message: string }> = {};
  for (const e of errors) {
    let field = e.instancePath.slice(1).replace(/\//g, '.');
    if (!field && e.keyword === 'required') field = String((e.params as { missingProperty: string }).missingProperty);
    if (!field) continue;
    if (out[field]) continue; // first-error wins
    out[field] = { type: e.keyword, message: e.message ?? e.keyword };
  }
  return out;
}

/**
 * Produce an RHF `Resolver` that validates against a compiled-at-first-use
 * JSON Schema. We intentionally use Ajv here (not a TypeBox-only resolver)
 * because each form's `valueSchema` arrives as JSON via the wire format,
 * not as a TypeBox module.
 */
export function buildFormResolver(schema: Record<string, unknown>): Resolver<Record<string, unknown>> {
  const validate = ajv.compile(schema);
  return async (values) => {
    const ok = validate(values);
    if (ok) return { values, errors: {} };
    return { values: {}, errors: ajvErrorsToRhf(validate.errors ?? []) };
  };
}