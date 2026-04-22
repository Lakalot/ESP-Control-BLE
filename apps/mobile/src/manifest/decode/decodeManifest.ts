import * as pb from '../generated/manifest.pbjs';
import type {
  RuntimeAction, RuntimeForm, RuntimeFormField, RuntimeManifest, RuntimeNode,
  RuntimeResource, RuntimeScreen, RuntimeValueType, RuntimeReadMode,
  RuntimeDangerLevel, RuntimeNodeKind, RuntimeWidgetKind, RuntimeRule,
} from '../model/runtime.types';
import {
  assertManifestIntegrity, ManifestDecodeError, isCompatibleAppVersion,
  SUPPORTED_CAPABILITIES, requiresCapability,
} from './integrity';

const V = pb.esp_control;

const VALUE_TYPE: Record<number, RuntimeValueType> = {
  1: 'bool', 2: 'int', 3: 'uint', 4: 'float', 5: 'string', 6: 'enum', 7: 'duration_ms',
};
const READ_MODE: Record<number, RuntimeReadMode> = {
  1: 'snapshot', 2: 'subscribe', 3: 'poll',
};
const DANGER_LEVEL: Record<number, RuntimeDangerLevel> = {
  1: 'normal', 2: 'elevated', 3: 'dangerous',
};
const NODE_KIND: Record<number, RuntimeNodeKind> = {
  1: 'stack', 2: 'row', 3: 'grid', 4: 'section', 5: 'widget',
};
const WIDGET_KIND: Record<number, RuntimeWidgetKind> = {
  1: 'text',
  2: 'stat',
  3: 'toggle',
  4: 'button',
  5: 'slider',
  6: 'select',
  7: 'text_input',
  8: 'badge',
  9: 'progress',
  10: 'timer',
};
const FIELD_KIND: Record<number, RuntimeFormField['kind']> = {
  10: 'text', 11: 'number', 12: 'duration', 13: 'select',
};

const mapLookup = <T extends number, U>(table: Record<T, U>, v: T, ctx: string): U => {
  const found = table[v];
  if (found === undefined) throw new ManifestDecodeError(`${ctx}: unknown enum value ${String(v)}`);
  return found;
};

export function decodeManifest(bytes: Uint8Array): RuntimeManifest {
  let msg: pb.esp_control.ManifestBundle;
  try {
    msg = V.ManifestBundle.decode(bytes);
  } catch (err) {
    throw new ManifestDecodeError(`protobuf decode failed: ${(err as Error).message}`);
  }

  const schemaVersion = (msg as any).schemaVersion ?? 1;
  if (schemaVersion !== 1) {
    throw new ManifestDecodeError(`unsupported schemaVersion ${schemaVersion}`);
  }

  const minAppVersion = (msg as any).minAppVersion ?? '0.0.0';
  if (!isCompatibleAppVersion(minAppVersion)) {
    throw new ManifestDecodeError(`requires app >= ${minAppVersion}`);
  }

  const strings = (msg.strings ?? []).map((s) => s.value ?? '');
  const s = (idx: number | null | undefined): string | undefined => {
    if (idx === undefined || idx === null || idx === 0) return undefined;
    const v = strings[idx];
    if (v === undefined) throw new ManifestDecodeError(`string index ${idx} out of range`);
    return v;
  };
  const sReq = (idx: number | null | undefined, ctx: string): string => {
    const v = s(idx);
    if (v === undefined) throw new ManifestDecodeError(`${ctx}: required string missing`);
    return v;
  };

  // id -> slug back-references (per section)
  const resSlug = new Map<number, string>();
  const actSlug = new Map<number, string>();
  const screenSlug = new Map<number, string>();
  const nodeSlug = new Map<number, string>();
  const formSlug = new Map<number, string>();

  (msg.resources ?? []).forEach((r) => resSlug.set(r.id!, sReq(r.slugIdx, 'resource.slug')));
  (msg.actions ?? []).forEach((a) => actSlug.set(a.id!, sReq(a.slugIdx, 'action.slug')));
  (msg.screens ?? []).forEach((sc) => screenSlug.set(sc.id!, sReq(sc.slugIdx, 'screen.slug')));
  (msg.nodes ?? []).forEach((n) => nodeSlug.set(n.id!, sReq(n.slugIdx, 'node.slug')));
  // (msg.forms ?? []).forEach((f) => formSlug.set(f.id!, sReq(f.slugIdx, 'form.slug')));

  const parseRule = (r: pb.esp_control.IRule | null | undefined): RuntimeRule | undefined => {
    if (!r || !r.jsonlogic) return undefined;
    try { return JSON.parse(r.jsonlogic) as RuntimeRule; }
    catch { throw new ManifestDecodeError(`rule JSON parse failed: ${r.jsonlogic}`); }
  };

  const resources = new Map<string, RuntimeResource>();
  for (const r of msg.resources ?? []) {
    const slug = sReq(r.slugIdx, 'resource.slug');
    resources.set(slug, {
      runtimeId: r.id!,
      slug,
      label: s(r.labelIdx),
      unit: s(r.unitIdx),
      valueType: mapLookup(VALUE_TYPE, r.valueType!, 'resource.valueType'),
      readMode: mapLookup(READ_MODE, r.readMode!, 'resource.readMode'),
      staleAfterMs: r.staleAfterMs ?? 0,
      pollMs: r.pollMs ? r.pollMs : undefined,
      enumValues: (r.enumValueIdxs ?? []).map((i) => sReq(i, 'resource.enumValue')),
    });
  }

  const actions = new Map<string, RuntimeAction>();
  for (const a of msg.actions ?? []) {
    const slug = sReq(a.slugIdx, 'action.slug');
    const inputSchema = s(a.inputSchemaIdx) ?? '{}';
    const resultSchemaStr = s(a.resultSchemaIdx);
    actions.set(slug, {
      runtimeId: a.id!,
      slug,
      label: s(a.labelIdx),
      dangerLevel: mapLookup(DANGER_LEVEL, a.dangerLevel!, 'action.dangerLevel'),
      confirm: s(a.confirmIdx),
      cooldownMs: a.cooldownMs ?? 0,
      inputSchema: JSON.parse(inputSchema) as Record<string, unknown>,
      resultSchema: resultSchemaStr ? (JSON.parse(resultSchemaStr) as Record<string, unknown>) : undefined,
    });
  }

  const screens = new Map<string, RuntimeScreen>();
  for (const sc of msg.screens ?? []) {
    const slug = sReq(sc.slugIdx, 'screen.slug');
    const rootSlug = nodeSlug.get(sc.rootNodeId!);
    if (!rootSlug) throw new ManifestDecodeError(`screen '${slug}' has unknown rootNodeId`);
    screens.set(slug, {
      slug,
      title: sReq(sc.titleIdx, 'screen.title'),
      icon: undefined,
      routeKey: s(sc.routeKeyIdx),
      rootNodeSlug: rootSlug,
      entryRules: (sc.entryRules ?? []).map(parseRule).filter((r): r is RuntimeRule => r !== undefined),
    });
  }

  const nodes = new Map<string, RuntimeNode>();
  for (const n of msg.nodes ?? []) {
    const slug = sReq(n.slugIdx, 'node.slug');
    const kind = mapLookup(NODE_KIND, n.kind!, 'node.kind');
    const base = {
      slug,
      label: s((n as any).titleIdx),
      tone: s(n.toneIdx),
      visibleIf: parseRule(n.visibleIf),
      enabledIf: parseRule(n.enabledIf),
    };
    if (kind === 'widget' || (n.widgetKind && n.widgetKind > 0)) {
      const widget = mapLookup(WIDGET_KIND, n.widgetKind!, 'node.widgetKind');
      if (!SUPPORTED_CAPABILITIES.has(`widget.${widget}`) && requiresCapability(widget)) {
        throw new ManifestDecodeError(`unsupported capability widget.${widget}`);
      }
      const bind = n.bind && (n.bind.resourceId || n.bind.actionId)
        ? {
            resource: n.bind.resourceId ? resSlug.get(n.bind.resourceId) : undefined,
            action: n.bind.actionId ? actSlug.get(n.bind.actionId) : undefined,
            form: undefined,
          }
        : undefined;
      nodes.set(slug, {
        ...base,
        kind: 'widget',
        widget,
        bind,
        formatHint: s((n as any).formatHintIdx),
      });
    } else {
      nodes.set(slug, {
        ...base,
        kind,
        childrenSlugs: (n.childrenIds ?? []).map((id) => {
          const cs = nodeSlug.get(id);
          if (!cs) throw new ManifestDecodeError(`node '${slug}' child id ${id} not found`);
          return cs;
        }),
        columns: n.columns ? n.columns : undefined,
      });
    }
  }

  const forms = new Map<string, RuntimeForm>();
  /* forms not supported in proto yet
  for (const f of (msg as any).forms ?? []) {
    const slug = sReq(f.slugIdx, 'form.slug');
    const submit = actSlug.get(f.submitActionId!);
    if (!submit) throw new ManifestDecodeError(`form '${slug}' submitActionId unknown`);
    const valueSchemaStr = s(f.valueSchemaIdx);
    forms.set(slug, {
      slug,
      submitActionSlug: submit,
      fields: (f.fields ?? []).map((fd: any): RuntimeFormField => ({
        slug: sReq(fd.slugIdx, 'formField.slug'),
        kind: mapLookup(FIELD_KIND, fd.kind!, 'formField.kind'),
        label: sReq(fd.labelIdx, 'formField.label'),
        defaultIf: parseRule(fd.defaultIf),
        visibleIf: parseRule(fd.visibleIf),
        enabledIf: parseRule(fd.enabledIf),
        options: (fd.optionIdxs ?? []).map((i: number) => sReq(i, 'formField.option')),
      })),
      valueSchema: valueSchemaStr ? (JSON.parse(valueSchemaStr) as Record<string, unknown>) : undefined,
    });
  }
  */

  const themeTokens = new Map<string, string>();
  /* themeTokens not supported in proto yet
  for (const t of (msg as any).themeTokens ?? []) {
    themeTokens.set(sReq(t.nameIdx, 'theme.name'), sReq(t.valueIdx, 'theme.value'));
  }
  */

  const capabilities = new Set<string>(
    (msg.capabilities?.featureIdxs ?? []).map((i) => sReq(i, 'capability')),
  );

  const out: RuntimeManifest = {
    version: 5,
    schemaVersion: 1,
    minAppVersion: (msg as any).minAppVersion ?? '0.0.0',
    capabilities,
    resources,
    actions,
    screens,
    nodes,
    forms,
    themeTokens,
  };
  assertManifestIntegrity(out);
  return out;
}
