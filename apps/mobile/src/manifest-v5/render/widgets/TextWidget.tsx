import React from 'react';
import { Text } from 'react-native';
import type { WidgetProps } from '../widgetRegistry';
import { palette } from '../../../ui/theme/ui';

export function TextWidget({ node, tone }: WidgetProps) {
  return (
    <Text style={{ color: tone ?? palette.text }}>
      {node.label ?? node.slug}
    </Text>
  );
}
