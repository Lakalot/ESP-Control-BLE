import React from 'react';
import { View } from 'react-native';
import type { WidgetProps } from '../widgetRegistry';
import { palette, withAlpha } from '../../../ui/theme/ui';

export function DividerWidget() {
  return (
    <View style={{ height: 1, backgroundColor: withAlpha(palette.white, 0.08) }} />
  );
}
