import React from 'react';
import { Switch } from 'react-native';
import type { WidgetProps } from '../widgetRegistry';

export function ToggleWidget({ node, value, enabled, onInvoke }: WidgetProps) {
  const val = value?.value;
  const isOn = val?.kind === 'bool' ? val.value : false;
  return (
    <Switch
      disabled={!enabled}
      value={isOn}
      onValueChange={(val) => {
        if (node.bind?.action) onInvoke(node.bind.action, { value: val });
      }}
    />
  );
}
