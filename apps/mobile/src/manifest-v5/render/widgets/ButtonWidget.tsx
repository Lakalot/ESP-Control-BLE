import React from 'react';
import { Button } from '../../../ui/components/controls/Button';
import type { WidgetProps } from '../widgetRegistry';

export function ButtonWidget({ node, isPending, onInvoke }: WidgetProps) {
  return (
    <Button
      label={node.label ?? node.slug}
      isPending={isPending}
      onPress={() => {
        if (node.bind?.action) onInvoke(node.bind.action, {});
      }}
    />
  );
}
