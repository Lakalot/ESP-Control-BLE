import { ALLOWED_RULE_OPERATORS } from '../schema/rules.js';
import type { Diagnostic } from './diagnostics.js';

type RuleTree = unknown;
type RuleScreens = readonly ({ entryRules?: readonly RuleTree[] } & Record<string, unknown>)[];

export type RuleLintManifest = {
  resources: readonly { id: string }[];
  nodes: readonly { visibleIf?: RuleTree; enabledIf?: RuleTree }[];
} & ({ screens: RuleScreens } | { views: RuleScreens });

const OP_SET = new Set<string>(ALLOWED_RULE_OPERATORS);
const ALLOWED_NAMESPACES = ['resource', 'screen', 'runtime'] as const;

export function lintRules(manifest: RuleLintManifest): Diagnostic[] {
  const out: Diagnostic[] = [];
  const resourceIds = new Set(manifest.resources.map((r) => r.id));
  const screenCollectionName = 'screens' in manifest ? 'screens' : 'views';
  const screens = 'screens' in manifest ? manifest.screens : manifest.views;

  const visitRule = (path: string, rule: RuleTree): void => {
    if (rule === null || typeof rule !== 'object') return;

    const keys = Object.keys(rule as Record<string, unknown>);
    if (keys.length !== 1) return;

    const op = keys[0]!;
    if (!OP_SET.has(op)) {
      out.push({
        path,
        keyword: 'ruleOperator',
        message: `operator '${op}' is not in the supported JsonLogic subset`,
      });
      return;
    }

    const payload = (rule as Record<string, unknown>)[op];
    if (op === 'var') {
      checkVarRef(path, payload, out, resourceIds);
      return;
    }

    if (Array.isArray(payload)) {
      payload.forEach((child, index) => visitRule(`${path}[${index}]`, child));
      return;
    }

    visitRule(path, payload);
  };

  manifest.nodes.forEach((node, index) => {
    visitRule(`/nodes/${index}/visibleIf`, node.visibleIf);
    visitRule(`/nodes/${index}/enabledIf`, node.enabledIf);
  });

  screens.forEach((screen: RuleScreens[number], index: number) => {
    screen.entryRules?.forEach((rule: RuleTree, ruleIndex: number) => {
      visitRule(`/${screenCollectionName}/${index}/entryRules/${ruleIndex}`, rule);
    });
  });

  return out.filter((diag) => diag.message.length > 0);
}

function checkVarRef(
  path: string,
  payload: unknown,
  out: Diagnostic[],
  resourceIds: Set<string>,
): void {
  if (typeof payload !== 'string') {
    out.push({
      path,
      keyword: 'ruleVar',
      message: 'var payload must be a string',
    });
    return;
  }

  const [namespace, ...rest] = payload.split('.');
  if (!ALLOWED_NAMESPACES.includes(namespace as (typeof ALLOWED_NAMESPACES)[number])) {
    out.push({
      path,
      keyword: 'ruleVarNamespace',
      message: `var '${payload}' uses unknown namespace '${namespace}'`,
    });
    return;
  }

  const id = rest.join('.');
  if (namespace === 'resource' && !resourceIds.has(id)) {
    out.push({
      path,
      keyword: 'ruleVarResource',
      message: `var '${payload}' refers to unknown resource '${id}'`,
    });
  }
}
