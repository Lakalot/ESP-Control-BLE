import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { ControlProps } from '../../../types/control.types';
import { palette } from '../../theme/ui';
import { CardShell } from './shared/CardShell';
import { ProgressBarControl } from './ProgressBarControl';
import { formatRefreshInterval } from './shared/controlUtils';
import { useCommandFreshness } from './shared/useCommandFreshness';

export function ProgressControl({
  command,
  currentValue,
  lastUpdatedAt,
  isPending,
  variant,
  surfaceStyle,
  titleOverride,
  subtitle,
}: ControlProps) {
  const isDisabled = Boolean(command.options.disabled);
  const numericValue = typeof currentValue === 'number' ? currentValue : null;
  const freshnessLabel = useCommandFreshness(lastUpdatedAt, isPending);

  const metaItems = useMemo(() => {
    const items: string[] = [];
    if (command.options.refreshMs) items.push(`Auto ${formatRefreshInterval(command.options.refreshMs)}`);
    if (isDisabled) items.push('Desactive');
    return items;
  }, [command.options.refreshMs, isDisabled]);

  return (
    <CardShell
      command={command}
      variant={variant}
      surfaceStyle={surfaceStyle}
      titleOverride={titleOverride}
      subtitle={subtitle}
      isPending={isPending}
      isDisabled={isDisabled}
      metaItems={metaItems}
    >
      <View style={styles.container}>
        <View style={styles.statusChip}>
          <Text style={styles.statusText}>{freshnessLabel}</Text>
        </View>
        <ProgressBarControl
          value={numericValue}
          accentColor={command.options.color ?? palette.accentAlt}
          opts={command.options}
        />
      </View>
    </CardShell>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  statusChip: {
    alignSelf: 'flex-start',
    minWidth: 74,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: palette.panelInset,
  },
  statusText: {
    color: palette.muted,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
});
