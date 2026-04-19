import type { Static } from '@sinclair/typebox';
import type { ManifestSpec } from '../schema/manifest.js';
import { validateManifest } from '../validation/ajv.js';
import { lintRules } from '../validation/ruleLinter.js';
import { assignIds } from './assignIds.js';
import { resolveRefs } from './resolveRefs.js';
import { StringTable } from './stringTable.js';

type Manifest = Static<typeof ManifestSpec>;

export interface NormalizedManifest {
  version: 5;
  capabilities: { featureIdxs: number[] };
  strings: string[];
  resources: NormalizedResource[];
  actions: NormalizedAction[];
  screens: NormalizedScreen[];
  nodes: NormalizedNode[];
}

export interface NormalizedResource {
  id: number;
  slugIdx: number;
  labelIdx: number;
  unitIdx: number;
  valueType: number;
  readMode: number;
  staleAfterMs: number;
  pollMs: number;
  enumValueIdxs: number[];
}

export interface NormalizedAction {
  id: number;
  slugIdx: number;
  labelIdx: number;
  dangerLevel: number;
  confirmIdx: number;
  cooldownMs: number;
  inputSchemaIdx: number;
  resultSchemaIdx: number;
}

export interface NormalizedScreen {
  id: number;
  slugIdx: number;
  titleIdx: number;
  routeKeyIdx: number;
  rootNodeId: number;
  entryRules: { jsonlogic: string }[];
}

export interface NormalizedNode {
  id: number;
  slugIdx: number;
  kind: number;
  widgetKind: number;
  titleIdx: number;
  toneIdx: number;
  childrenIds: number[];
  columns: number;
  bind: { resourceId: number; actionId: number };
  visibleIf: { jsonlogic: string } | null;
  enabledIf: { jsonlogic: string } | null;
  textIdx: number;
  formatHintIdx: number;
}

const VALUE_TYPE_MAP: Record<string, number> = {
  bool: 1,
  int: 2,
  uint: 3,
  float: 4,
  string: 5,
  enum: 6,
  duration_ms: 7,
};

const READ_MODE_MAP: Record<string, number> = {
  snapshot: 1,
  subscribe: 2,
  poll: 3,
};

const DANGER_LEVEL_MAP: Record<string, number> = {
  normal: 1,
  elevated: 2,
  dangerous: 3,
};

const NODE_KIND_MAP: Record<string, number> = {
  stack: 1,
  row: 2,
  grid: 3,
  section: 4,
  widget: 5,
};

const WIDGET_KIND_MAP: Record<string, number> = {
  text: 1,
  stat: 2,
  toggle: 3,
  button: 4,
  slider: 5,
  select: 6,
  text_input: 7,
  badge: 8,
  progress: 9,
  timer: 10,
};

export function normalize(input: Manifest): NormalizedManifest {
  const validation = validateManifest(input);
  if (!validation.ok) {
    throw new Error(
      `manifest failed validation: ${validation.errors
        .map((error) => `${error.path} ${error.message}`)
        .join('; ')}`,
    );
  }

  const ruleDiagnostics = lintRules(input);
  if (ruleDiagnostics.length > 0) {
    throw new Error(
      `manifest rules failed lint: ${ruleDiagnostics.map((d) => d.message).join('; ')}`,      
    );
  }

  const ids = assignIds(input);
  resolveRefs(input, ids);

  const strings = new StringTable();
  const toRule = (rule: unknown): { jsonlogic: string } | null =>
    rule === undefined || rule === null ? null : { jsonlogic: JSON.stringify(rule) };

  const featureIdxs = [...input.capabilities.required, ...input.capabilities.optional].map(
    (feature) => strings.intern(feature),
  );
  const resources = input.resources.map((resource) => ({
    id: ids.resources.get(resource.id)!,
    slugIdx: strings.intern(resource.id),
    labelIdx: strings.internOptional(resource.label),
    unitIdx: strings.internOptional(resource.unit),
    valueType: VALUE_TYPE_MAP[resource.valueType]!,
    readMode: READ_MODE_MAP[resource.readMode]!,
    staleAfterMs: resource.staleAfterMs,
    pollMs: resource.pollMs ?? 0,
    enumValueIdxs: (resource.enumValues ?? []).map((value) => strings.intern(value)),
  }));

  const actions = input.actions.map((action) => ({
    id: ids.actions.get(action.id)!,
    slugIdx: strings.intern(action.id),
    labelIdx: strings.internOptional(action.label),
    dangerLevel: DANGER_LEVEL_MAP[action.dangerLevel]!,
    confirmIdx: strings.internOptional(action.confirm),
    cooldownMs: action.cooldownMs ?? 0,
    inputSchemaIdx: strings.intern(JSON.stringify(action.inputSchema)),
    resultSchemaIdx: action.resultSchema
      ? strings.intern(JSON.stringify(action.resultSchema))
      : 0,
  }));

  const screens = input.screens.map((screen) => ({
    id: ids.screens.get(screen.id)!,
    slugIdx: strings.intern(screen.id),
    titleIdx: strings.intern(screen.title),
    routeKeyIdx: strings.internOptional(screen.routeKey),
    rootNodeId: ids.nodes.get(screen.rootNodeId)!,
    entryRules: (screen.entryRules ?? []).map((rule) => ({
      jsonlogic: JSON.stringify(rule),
    })),
  }));

  const nodes = input.nodes.map((node) => ({
    id: ids.nodes.get(node.id)!,
    slugIdx: strings.intern(node.id),
    kind: NODE_KIND_MAP[node.kind]!,
    widgetKind: node.kind === 'widget' ? WIDGET_KIND_MAP[node.widget]! : 0,
    titleIdx: strings.internOptional(node.title),
    toneIdx: strings.internOptional(node.tone),
    childrenIds:
      node.kind === 'widget'
        ? []
        : node.children.map((childId) => ids.nodes.get(childId)!),
    columns: node.kind === 'widget' ? 0 : node.columns ?? 0,
    bind: {
      resourceId:
        node.kind === 'widget' && node.bind?.resource
          ? ids.resources.get(node.bind.resource)!
          : 0,
      actionId:
        node.kind === 'widget' && node.bind?.action
          ? ids.actions.get(node.bind.action)!
          : 0,
    },
    visibleIf: toRule(node.visibleIf),
    enabledIf: toRule(node.enabledIf),
    textIdx: node.kind === 'widget' ? strings.internOptional(node.text) : 0,
    formatHintIdx: node.kind === 'widget' ? strings.internOptional(node.formatHint) : 0,      
  }));

  return {
    version: 5,
    capabilities: { featureIdxs },
    strings: strings.toArray().slice(),
    resources,
    actions,
    screens,
    nodes,
  };
}
