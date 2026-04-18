import React, { useMemo } from 'react';

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
      <ProgressBarControl
        value={numericValue}
        accentColor={command.options.color ?? palette.accentAlt}
        opts={command.options}
      />
    </CardShell>
  );
}
