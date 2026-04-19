import React from 'react';
import { View } from 'react-native';
import type { RuntimeManifest, RuntimeNode } from '../model/runtime.types';
import type { SnapshotMap } from '../model/snapshot.types';
import type { FlatRuleContext } from '../rules/ruleContext';
import { evaluateRule } from '../rules/evaluateRule';
import { getWidget } from './widgetRegistry';

export interface NodeRendererProps {
  manifest: RuntimeManifest;
  slug: string;
  snapshot: SnapshotMap;
  ctx: FlatRuleContext;
  onInvoke: (actionSlug: string, input: Record<string, unknown>) => void;
  pendingActions: ReadonlySet<string>;
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
  const enabled = Boolean(evaluateRule(node.enabledIf, ctx));

  if (node.kind !== 'widget') {
    return (
      <ContainerShell node={node}>
        {node.childrenSlugs.map((childSlug) => (
          <NodeRenderer key={childSlug} {...props} slug={childSlug} />
        ))}
      </ContainerShell>
    );
  }

  const Widget = getWidget(node.widget);
  if (!Widget) return null;
  const value = node.bind?.resource ? snapshot.get(node.bind.resource) : undefined;
  const isPending = node.bind?.action ? pendingActions.has(node.bind.action) : false;
  return (
    <Widget
      node={node}
      value={value}
      enabled={enabled}
      tone={node.tone}
      onInvoke={onInvoke}
      isPending={isPending}
    />
  );
}