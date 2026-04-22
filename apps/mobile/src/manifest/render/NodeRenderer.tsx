import React from 'react';
import { View } from 'react-native';
import type { RuntimeManifest, RuntimeNode } from '../model/runtime.types';
import type { SnapshotMap } from '../model/snapshot.types';
import type { FlatRuleContext } from '../rules/ruleContext';
import { evaluateRule } from '../rules/evaluateRule';
import { palette } from '../../ui/theme/ui';
import { SectionCard } from './primitives/SectionCard';
import { getWidget } from './widgetRegistry';

export interface NodeRendererProps {
  manifest: RuntimeManifest;
  slug: string;
  snapshot: SnapshotMap;
  ctx: FlatRuleContext;
  onInvoke: (actionSlug: string, input: Record<string, unknown>) => void;
  pendingActions: ReadonlySet<string>;
  inheritedEnabled?: boolean;
}

function resolveTone(tone: string | undefined): string | undefined {
  switch (tone) {
    case 'tone.success':
      return palette.success;
    case 'tone.warn':
      return palette.warn;
    case 'tone.danger':
      return palette.danger;
    case 'tone.accent':
      return palette.accent;
    case 'tone.accentAlt':
      return palette.accentAlt;
    default:
      return undefined;
  }
}

function ContainerShell({
  node,
  children,
}: {
  node: Exclude<RuntimeNode, { kind: 'widget' }>;
  children: React.ReactNode;
}) {
  const flexDirection = node.kind === 'row' ? 'row' : 'column';
  return <View style={{ flexDirection, gap: 12 }}>{children}</View>;
}

export function NodeRenderer(props: NodeRendererProps) {
  const { manifest, slug, snapshot, ctx, onInvoke, pendingActions } = props;
  const node = manifest.nodes.get(slug);
  if (!node) return null;

  const visible = Boolean(evaluateRule(node.visibleIf, ctx));
  if (!visible) return null;
  const selfEnabled = Boolean(evaluateRule(node.enabledIf, ctx));
  const enabled = (props.inheritedEnabled ?? true) && selfEnabled;

  if (node.kind !== 'widget') {
    const children = node.childrenSlugs.map((childSlug) => (
      <NodeRenderer key={childSlug} {...props} slug={childSlug} inheritedEnabled={enabled} />
    ));

    if (node.kind === 'section') {
      return <SectionCard title={node.label ?? node.slug}>{children}</SectionCard>;
    }

    return <ContainerShell node={node}>{children}</ContainerShell>;
  }

  const Widget = getWidget(node.widget);
  if (!Widget) return null;
  const value = node.bind?.resource ? snapshot.get(node.bind.resource) : undefined;
  const resource = node.bind?.resource ? manifest.resources.get(node.bind.resource) : undefined;
  const action = node.bind?.action ? manifest.actions.get(node.bind.action) : undefined;
  const isPending = node.bind?.action ? pendingActions.has(node.bind.action) : false;
  const enumOptions = resource?.enumValues;
  return (
    <Widget
      node={node}
      action={action}
      value={value}
      enabled={enabled}
      tone={resolveTone(node.tone)}
      onInvoke={onInvoke}
      isPending={isPending}
      enumOptions={enumOptions}
    />
  );
}
