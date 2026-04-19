import jsonLogic from 'json-logic-js';
import type { RuntimeRule } from '../model/runtime.types';
import type { FlatRuleContext } from './ruleContext';

const ALLOWED = new Set([
  '==', '!=', '>', '>=', '<', '<=',
  'and', 'or', '!', 'if', 'in', 'cat', 'var',
]);

/** Walks the rule tree and throws on the first disallowed operator. */
function assertAllowed(rule: unknown): void {
  if (rule === null || typeof rule !== 'object') return;
  const keys = Object.keys(rule as Record<string, unknown>);
  if (keys.length !== 1) return;
  const op = keys[0]!;
  if (!ALLOWED.has(op)) {
    throw new Error(`evaluateRule: operator '${op}' is not permitted`);
  }
  const payload = (rule as Record<string, unknown>)[op];
  if (op === 'var') return; // payload is a string or array, leaf
  if (Array.isArray(payload)) payload.forEach(assertAllowed);
  else assertAllowed(payload);
}

/**
 * Evaluate a JsonLogic rule against a flat context. Returns:
 *  - `true` for undefined/null rules (so callers can use the same function
 *    for both `visibleIf` and raw expressions without conditionals)
 *  - the JsonLogic result otherwise
 *
 * Unknown `var` references resolve to `null` (JsonLogic default), which the
 * caller treats as falsy for visibility/enablement.
 */
export function evaluateRule(rule: RuntimeRule | undefined, ctx: FlatRuleContext): unknown {
  if (rule === undefined || rule === null) return true;
  assertAllowed(rule);

  // Patch var operator to read from flat context
  jsonLogic.add_operation('var', (name: unknown) => {
    if (typeof name !== 'string') return null;
    const val = ctx[name];
    return val === undefined ? null : val;
  });

  return jsonLogic.apply(rule as jsonLogic.RulesLogic, ctx as Record<string, unknown>);
}