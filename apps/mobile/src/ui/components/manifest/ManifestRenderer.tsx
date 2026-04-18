import React, { ReactNode, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CommandControl } from '../CommandControl';
import type { Value } from '../../../store/deviceStore';
import { palette, radius, shadows, withAlpha } from '../../theme/ui';
import { ManifestNode, NodeKind, NodeStyle, NodeVariant } from '../../../types/manifest.types';

interface ManifestRendererProps {
  nodes: ManifestNode[];
  commandValues: Record<number, Value>;
  commandUpdatedAt: Record<number, number>;
  pendingCommands: Set<number>;
  onAction: (cmdId: number, payload: Uint8Array) => void;
}

interface NodeRendererProps extends ManifestRendererProps {
  node: ManifestNode;
}

function getGap(node: ManifestNode): number {
  if (node.options.gap != null) return node.options.gap;

  switch (node.kind) {
    case NodeKind.ROW:
      return 10;
    case NodeKind.GRID:
      return 12;
    case NodeKind.SECTION:
      return 12;
    default:
      return 10;
  }
}

function getShellStyle(style?: NodeStyle) {
  switch (style) {
    case NodeStyle.SURFACE:
      return {
        backgroundColor: palette.panelElevated,
        borderColor: withAlpha(palette.white, 0.08),
      };
    case NodeStyle.INSET:
      return {
        backgroundColor: palette.panelInset,
        borderColor: withAlpha(palette.white, 0.05),
      };
    case NodeStyle.TOOLBAR:
      return {
        backgroundColor: withAlpha(palette.white, 0.03),
        borderColor: withAlpha(palette.white, 0.05),
      };
    default:
      return {
        backgroundColor: palette.panel,
        borderColor: palette.border,
      };
  }
}

function renderHeader(title?: string, subtitle?: string, collapsed?: boolean, onPress?: () => void) {
  if (!title && !subtitle) return null;

  if (!onPress) {
    return (
      <View style={styles.shellHeader}>
        <View style={styles.shellHeaderText}>
          {title ? <Text style={styles.shellTitle}>{title}</Text> : null}
          {subtitle ? <Text style={styles.shellSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
    );
  }

  return (
    <Pressable style={styles.shellHeader} onPress={onPress}>
      <View style={styles.shellHeaderText}>
        {title ? <Text style={styles.shellTitle}>{title}</Text> : null}
        {subtitle ? <Text style={styles.shellSubtitle}>{subtitle}</Text> : null}
      </View>
      <Text style={styles.chevron}>{collapsed ? '>' : 'v'}</Text>
    </Pressable>
  );
}

function Shell({
  title,
  subtitle,
  style,
  children,
  collapsible,
  initialCollapsed,
}: {
  title?: string;
  subtitle?: string;
  style?: NodeStyle;
  children: ReactNode;
  collapsible?: boolean;
  initialCollapsed?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(Boolean(initialCollapsed));
  const shellStyle = getShellStyle(style ?? NodeStyle.DEFAULT);
  const header = renderHeader(
    title,
    subtitle,
    collapsed,
    collapsible ? () => setCollapsed((value) => !value) : undefined,
  );

  return (
    <View
      style={[
        styles.shell,
        shadows.card,
        {
          backgroundColor: shellStyle.backgroundColor,
          borderColor: shellStyle.borderColor,
        },
      ]}
    >
      {header}
      {!collapsed ? children : null}
    </View>
  );
}

function StackNode(props: NodeRendererProps) {
  const { node, ...rest } = props;
  const gap = getGap(node);
  const body = (
    <View style={[styles.stack, { gap }]}>
      {node.children.map((child) => (
        <NodeRenderer key={child.id} node={child} {...rest} />
      ))}
    </View>
  );

  const hasShell =
    node.options.title != null ||
    node.options.subtitle != null ||
    (node.options.style != null && node.options.style !== NodeStyle.DEFAULT);

  if (!hasShell) return body;

  return (
    <Shell title={node.options.title} subtitle={node.options.subtitle} style={node.options.style}>
      {body}
    </Shell>
  );
}

function RowNode(props: NodeRendererProps) {
  const { node, ...rest } = props;
  const gap = getGap(node);
  const body = (
    <View style={[styles.row, { gap }]}>
      {node.children.map((child) => (
        <NodeRenderer key={child.id} node={child} {...rest} />
      ))}
    </View>
  );

  const hasShell =
    node.options.title != null ||
    node.options.subtitle != null ||
    (node.options.style != null && node.options.style !== NodeStyle.DEFAULT);

  if (!hasShell) return body;

  return (
    <Shell title={node.options.title} subtitle={node.options.subtitle} style={node.options.style}>
      {body}
    </Shell>
  );
}

function GridNode(props: NodeRendererProps) {
  const { node, ...rest } = props;
  const gap = getGap(node);
  const columns = Math.max(1, Math.min(4, node.options.columns ?? 2));
  const body = (
    <View style={[styles.grid, { marginHorizontal: -(gap / 2) }]}>
      {node.children.map((child) => {
        const span = Math.max(1, Math.min(columns, child.options.span ?? 1));
        return (
          <View
            key={child.id}
            style={[
              styles.gridCell,
              {
                width: `${(span / columns) * 100}%`,
                paddingHorizontal: gap / 2,
                marginBottom: gap,
              },
            ]}
          >
            <NodeRenderer node={child} {...rest} />
          </View>
        );
      })}
    </View>
  );

  const hasShell =
    node.options.title != null ||
    node.options.subtitle != null ||
    (node.options.style != null && node.options.style !== NodeStyle.DEFAULT);

  if (!hasShell) return body;

  return (
    <Shell title={node.options.title} subtitle={node.options.subtitle} style={node.options.style}>
      {body}
    </Shell>
  );
}

function SectionNode(props: NodeRendererProps) {
  const { node, ...rest } = props;
  const gap = getGap(node);

  return (
    <Shell
      title={node.options.title}
      subtitle={node.options.subtitle}
      style={node.options.style ?? NodeStyle.SURFACE}
      collapsible
      initialCollapsed={node.options.collapsed}
    >
      <View style={[styles.stack, { gap }]}>
        {node.children.map((child) => (
          <NodeRenderer key={child.id} node={child} {...rest} />
        ))}
      </View>
    </Shell>
  );
}

function TextNode({ node }: NodeRendererProps) {
  const shellStyle = getShellStyle(node.options.style ?? NodeStyle.INSET);
  const text = node.options.text ?? node.options.title ?? '';

  return (
    <View
      style={[
        styles.textCard,
        {
          backgroundColor: shellStyle.backgroundColor,
          borderColor: shellStyle.borderColor,
        },
      ]}
    >
      {node.options.title && node.options.text ? <Text style={styles.textCardTitle}>{node.options.title}</Text> : null}
      <Text style={styles.textCardBody}>{text}</Text>
      {node.options.subtitle ? <Text style={styles.textCardCaption}>{node.options.subtitle}</Text> : null}
    </View>
  );
}

function CommandNode({
  node,
  commandValues,
  commandUpdatedAt,
  pendingCommands,
  onAction,
}: NodeRendererProps) {
  if (!node.command) return null;

  return (
    <CommandControl
      command={node.command}
      currentValue={commandValues[node.command.id] ?? null}
      lastUpdatedAt={commandUpdatedAt[node.command.id]}
      isPending={pendingCommands.has(node.command.id)}
      onAction={onAction}
      variant={node.options.variant ?? NodeVariant.CARD}
      surfaceStyle={node.options.style ?? NodeStyle.DEFAULT}
      titleOverride={node.options.title}
      subtitle={node.options.subtitle}
    />
  );
}

function NodeRenderer(props: NodeRendererProps) {
  const { node } = props;

  switch (node.kind) {
    case NodeKind.SECTION:
      return <SectionNode {...props} />;
    case NodeKind.STACK:
      return <StackNode {...props} />;
    case NodeKind.ROW:
      return <RowNode {...props} />;
    case NodeKind.GRID:
      return <GridNode {...props} />;
    case NodeKind.COMMAND:
      return <CommandNode {...props} />;
    case NodeKind.TEXT:
      return <TextNode {...props} />;
    case NodeKind.DIVIDER:
      return <View style={styles.divider} />;
    default:
      return null;
  }
}

export function ManifestRenderer(props: ManifestRendererProps) {
  const content = useMemo(
    () =>
      props.nodes.map((node) => <NodeRenderer key={node.id} node={node} {...props} />),
    [props],
  );

  return <View style={styles.root}>{content}</View>;
}

const styles = StyleSheet.create({
  root: {
    gap: 14,
  },
  shell: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  shellHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  shellHeaderText: {
    flex: 1,
    gap: 4,
  },
  shellTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '800',
  },
  shellSubtitle: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  chevron: {
    color: palette.subtle,
    fontSize: 12,
    fontWeight: '800',
  },
  stack: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridCell: {
    minWidth: '50%',
  },
  textCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  textCardTitle: {
    color: palette.text,
    fontSize: 14,
    fontWeight: '700',
  },
  textCardBody: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 20,
  },
  textCardCaption: {
    color: palette.subtle,
    fontSize: 12,
  },
  divider: {
    height: 1,
    borderRadius: radius.pill,
    backgroundColor: withAlpha(palette.white, 0.08),
  },
});
