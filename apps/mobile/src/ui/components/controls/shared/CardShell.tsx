import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { palette, radius, shadows, withAlpha } from '../../../theme/ui';
import { CmdType, type ManifestCommand, NodeStyle, NodeVariant } from '../../../../types/manifest.types';
import { iconChar, resolveSurface } from './controlUtils';

interface CardShellProps {
  command: ManifestCommand;
  variant: NodeVariant;
  surfaceStyle: NodeStyle;
  titleOverride?: string;
  subtitle?: string;
  isPending?: boolean;
  isDisabled?: boolean;
  children: React.ReactNode;
  metaItems?: string[];
}

function commandTypeLabel(type: CmdType): string {
  switch (type) {
    case CmdType.ACTION:
      return 'Action';
    case CmdType.TOGGLE:
      return 'Toggle';
    case CmdType.RANGE:
      return 'Range';
    case CmdType.READ_ONLY:
      return 'Lecture';
    case CmdType.TEXT_INPUT:
      return 'Texte';
    case CmdType.COLOR_PICKER:
      return 'Couleur';
    case CmdType.XY_PAD:
      return 'XY Pad';
    case CmdType.MULTI_SELECT:
      return 'Choix';
    case CmdType.PROGRESS:
      return 'Progression';
    default:
      return 'Commande';
  }
}

export function CardShell({
  command,
  variant,
  surfaceStyle,
  titleOverride,
  subtitle,
  isPending,
  isDisabled,
  children,
  metaItems = [],
}: CardShellProps) {
  const accentColor = command.options.color ?? palette.accentAlt;
  const surface = resolveSurface(surfaceStyle);
  const title = titleOverride ?? command.name;
  const metaText = metaItems.filter(Boolean).join(' / ');

  return (
    <View
      style={[
        styles.container,
        shadows.card,
        variant === NodeVariant.COMPACT && styles.containerCompact,
        variant === NodeVariant.HERO && styles.containerHero,
        isDisabled && styles.containerDisabled,
        {
          backgroundColor: surface.backgroundColor,
          borderColor: surface.borderColor,
        },
      ]}
    >
      <View
        style={[
          styles.accentRail,
          variant === NodeVariant.HERO && styles.accentRailHero,
          { backgroundColor: withAlpha(accentColor, 0.85) },
        ]}
      />

      <View style={styles.header}>
        <View style={styles.headerMain}>
          <View style={[styles.iconBubble, { backgroundColor: withAlpha(accentColor, 0.16) }]}>
            <Text style={[styles.iconText, { color: accentColor }]}>
              {command.options.icon
                ? iconChar(command.options.icon)
                : commandTypeLabel(command.type).charAt(0)}
            </Text>
          </View>

          <View style={styles.titleWrap}>
            <Text style={styles.label}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            {metaText ? <Text style={styles.metaText}>{metaText}</Text> : null}
          </View>
        </View>

        <View style={styles.headerBadges}>
          {command.options.badge ? (
            <View style={[styles.badge, { backgroundColor: accentColor }]}>
              <Text style={styles.badgeText}>{command.options.badge}</Text>
            </View>
          ) : null}

          {isPending ? (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>En cours</Text>
            </View>
          ) : null}
        </View>
      </View>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: radius.md,
    padding: 18,
    borderWidth: 1,
    gap: 14,
  },
  containerCompact: {
    padding: 14,
    gap: 10,
  },
  containerHero: {
    padding: 22,
    gap: 16,
  },
  containerDisabled: {
    opacity: 0.65,
  },
  accentRail: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  accentRailHero: {
    height: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerMain: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  iconBubble: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 15,
    fontWeight: '800',
  },
  titleWrap: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.text,
  },
  subtitle: {
    fontSize: 12,
    color: palette.subtle,
  },
  metaText: {
    fontSize: 12,
    color: palette.muted,
  },
  headerBadges: {
    alignItems: 'flex-end',
    gap: 6,
  },
  badge: {
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: palette.bg,
    letterSpacing: 0.6,
  },
  pendingBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: withAlpha(palette.warn, 0.18),
    borderWidth: 1,
    borderColor: withAlpha(palette.warn, 0.4),
  },
  pendingBadgeText: {
    color: palette.warn,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});
