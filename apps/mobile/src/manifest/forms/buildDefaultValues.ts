import type { RuntimeForm, RuntimeFormField } from '../model/runtime.types';
import { evaluateRule } from '../rules/evaluateRule';
import type { FlatRuleContext } from '../rules/ruleContext';

const EMPTY_FOR: Record<RuntimeFormField['kind'], unknown> = {
  text: '',
  number: 0,
  duration: 0,
  select: null,
};

export function buildDefaultValues(
  form: RuntimeForm,
  ctx: FlatRuleContext,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const field of form.fields) {
    if (field.defaultIf !== undefined) {
      const result = evaluateRule(field.defaultIf, ctx);
      out[field.slug] = result === true ? EMPTY_FOR[field.kind] : result;
    } else {
      out[field.slug] = EMPTY_FOR[field.kind];
    }
  }
  return out;
}