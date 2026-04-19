import React from 'react';
import { RangeControl } from '../../../ui/components/controls/RangeControl';
import type { WidgetProps } from '../widgetRegistry';

export function SliderWidget({ node, value, enabled, isPending, onInvoke }: WidgetProps) {
  const val = value?.value;
  const numValue = val?.kind === 'int' || val?.kind === 'uint' || val?.kind === 'float' ? val.value : null;
  const mockCommand: any = {
    id: 0,
    name: node.slug,
    params: { min: 0, max: 100 },
    options: { disabled: !enabled },
  };
  return (
    <RangeControl
      command={mockCommand}
      currentValue={numValue}
      isPending={isPending}
      variant={0}
      surfaceStyle={0}
      titleOverride={node.label ?? node.slug}
      subtitle={node.slug}
      onAction={(id, payload) => {
        // v5 relies on real values, but here we just pass a placeholder since v4 makes a binary payload
        if (node.bind?.action) onInvoke(node.bind.action, { value: payload[0] });
      }}
    />
  );
}
