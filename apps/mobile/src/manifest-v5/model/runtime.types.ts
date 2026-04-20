import type { BindingResolution } from './bindings.types';

export type RuntimeValueType =
  | 'bool' | 'int' | 'uint' | 'float' | 'string' | 'enum' | 'duration_ms';

export type RuntimeReadMode = 'snapshot' | 'subscribe' | 'poll';

export type RuntimeDangerLevel = 'normal' | 'elevated' | 'dangerous';

export type RuntimeNodeKind =
  | 'stack' | 'row' | 'grid' | 'section' | 'tabs' | 'form' | 'widget';

export type RuntimeWidgetKind =
  | 'text' | 'stat' | 'toggle' | 'button' | 'slider' | 'select'
  | 'text_input' | 'badge' | 'progress' | 'timer'
  | 'chart_sparkline' | 'field_text' | 'field_number'
  | 'field_duration' | 'field_select' | 'divider';

/** Rule tree as decoded from the protobuf JsonLogic string. `unknown` is used
 *  because JsonLogic rules are heterogeneous; the evaluator narrows at runtime. */
export type RuntimeRule = unknown;

export interface RuntimeResource {
  runtimeId: number;
  slug: string;
  label: string | undefined;
  unit: string | undefined;
  valueType: RuntimeValueType;
  readMode: RuntimeReadMode;
  staleAfterMs: number;
  pollMs: number | undefined;
  enumValues: readonly string[];
}

export interface RuntimeAction {
  runtimeId: number;
  slug: string;
  label: string | undefined;
  dangerLevel: RuntimeDangerLevel;
  confirm: string | undefined;
  cooldownMs: number;
  inputSchema: Record<string, unknown>;
  resultSchema: Record<string, unknown> | undefined;
}

export interface RuntimeScreen {
  slug: string;
  title: string;
  icon: string | undefined;
  routeKey: string | undefined;
  rootNodeSlug: string;
  entryRules: readonly RuntimeRule[];
}

export type RuntimeNode =
  | RuntimeContainerNode
  | RuntimeWidgetNode;

export interface RuntimeContainerNodeBase {
  slug: string;
  label: string | undefined;
  tone: string | undefined;
  visibleIf: RuntimeRule | undefined;
  enabledIf: RuntimeRule | undefined;
}

export interface RuntimeContainerNode extends RuntimeContainerNodeBase {
  kind: Exclude<RuntimeNodeKind, 'widget'>;
  childrenSlugs: readonly string[];
  columns: number | undefined;
}

export interface RuntimeWidgetNode extends RuntimeContainerNodeBase {
  kind: 'widget';
  widget: RuntimeWidgetKind;
  bind: BindingResolution | undefined;
  formatHint: string | undefined;
}

export interface RuntimeFormField {
  slug: string;
  kind: 'text' | 'number' | 'duration' | 'select';
  label: string;
  defaultIf: RuntimeRule | undefined;
  visibleIf: RuntimeRule | undefined;
  enabledIf: RuntimeRule | undefined;
  options: readonly string[];
}

export interface RuntimeForm {
  slug: string;
  submitActionSlug: string;
  fields: readonly RuntimeFormField[];
  valueSchema: Record<string, unknown> | undefined;
}

export interface RuntimeManifest {
  version: 5;
  schemaVersion: 1;
  minAppVersion: string;
  capabilities: ReadonlySet<string>;
  resources: ReadonlyMap<string, RuntimeResource>;
  actions: ReadonlyMap<string, RuntimeAction>;
  screens: ReadonlyMap<string, RuntimeScreen>;
  nodes: ReadonlyMap<string, RuntimeNode>;
  forms: ReadonlyMap<string, RuntimeForm>;
  themeTokens: ReadonlyMap<string, string>; // name -> value
}
