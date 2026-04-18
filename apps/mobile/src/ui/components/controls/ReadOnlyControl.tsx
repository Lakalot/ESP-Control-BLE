import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useSparkline } from '../../../hooks/useSparkline';
import type { ControlProps } from '../../../types/control.types';
import { NodeVariant } from '../../../types/manifest.types';
import { palette } from '../../theme/ui';
import { formatValue } from '../../../utils/formatValue';
import { SparklineChart } from '../SparklineChart';
import { CardShell } from './shared/CardShell';
import { formatRefreshInterval } from './shared/controlUtils';
import { useCommandFreshness } from './shared/useCommandFreshness';

export function ReadOnlyControl({
  command,
  currentValue,
  lastUpdatedAt,
  isPending,
  variant,
  surfaceStyle,
  titleOverride,
  subtitle,
}: ControlProps) {
  const accentColor = command.options.color ?? palette.accentAlt;
  const isDisabled = Boolean(command.options.disabled);
  const numericValue = typeof currentValue === 'number' ? currentValue : null;
  const displayValue = numericValue != null ? formatValue(numericValue, command.options) : '--';
  const history = useSparkline(command.id);
  const freshnessLabel = useCommandFreshness(lastUpdatedAt, isPending);

  const metaItems = useMemo(() => {
    const items: string[] = [];
    items.push(freshnessLabel);
    if (command.options.refreshMs) items.push(`Auto ${formatRefreshInterval(command.options.refreshMs)}`);
    if (isDisabled) items.push('Desactive');
    return items;
  }, [command.options.refreshMs, freshnessLabel, isDisabled]);

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
        <View style={styles.valueBlock}>
          <Text
            style={[
              styles.value,
              variant === NodeVariant.COMPACT && styles.valueCompact,
              variant === NodeVariant.HERO && styles.valueHero,
              { color: accentColor },
            ]}
          >
            {displayValue}
          </Text>
          <Text style={styles.caption}>{freshnessLabel}</Text>
        </View>

        {command.options.refreshMs && history.length >= 2 ? (
          <SparklineChart data={history} width={170} height={40} color={accentColor} />
        ) : null}
      </View>
    </CardShell>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  valueBlock: {
    gap: 3,
  },
  value: {
    fontSize: 30,
    fontWeight: '700',
  },
  valueCompact: {
    fontSize: 24,
  },
  valueHero: {
    fontSize: 34,
  },
  caption: {
    fontSize: 12,
    color: palette.muted,
  },
});
