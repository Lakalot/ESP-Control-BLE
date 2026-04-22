import type { SnapshotMap, ResourceValue } from '../model/snapshot.types';

export interface RuleContextInputs {
  snapshot: SnapshotMap;
  form: Record<string, unknown>;
  screen: Record<string, unknown>;
  runtime: Record<string, unknown>;
}

export type FlatRuleContext = Readonly<Record<string, unknown>>;

const unwrap = (v: ResourceValue): unknown => {
  switch (v.kind) {
    case 'null': return undefined;
    default: return (v as { value: unknown }).value;
  }
};

/** Flatten namespaced inputs into a single map keyed as `<ns>.<slug>`.
 *  We flatten (rather than handing JsonLogic a nested object) because the
 *  rule linter produces var refs like `resource.relay.auto` — i.e. the slug
 *  may contain dots. JsonLogic's default dot-navigation would misread those
 *  as nested properties. */
export function buildRuleContext(inputs: RuleContextInputs): FlatRuleContext {
  const out: Record<string, unknown> = {};
  for (const [slug, state] of inputs.snapshot) {
    out[`resource.${slug}`] = unwrap(state.value);
  }
  for (const [k, v] of Object.entries(inputs.form)) out[`form.${k}`] = v;
  for (const [k, v] of Object.entries(inputs.screen)) out[`screen.${k}`] = v;
  for (const [k, v] of Object.entries(inputs.runtime)) out[`runtime.${k}`] = v;
  return out;
}