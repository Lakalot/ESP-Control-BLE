import type { ComponentType } from 'react';
import type { RuntimeAction, RuntimeWidgetKind, RuntimeWidgetNode } from '../model/runtime.types';
import type { ResourceState } from '../model/snapshot.types';
import { TextWidget } from './widgets/TextWidget';
import { StatWidget } from './widgets/StatWidget';
import { ToggleWidget } from './widgets/ToggleWidget';
import { ButtonWidget } from './widgets/ButtonWidget';
import { SliderWidget } from './widgets/SliderWidget';
import { BadgeWidget } from './widgets/BadgeWidget';
import { TimerWidget } from './widgets/TimerWidget';
import { SelectWidget } from './widgets/SelectWidget';

export interface WidgetProps {
  node: RuntimeWidgetNode;
  action: RuntimeAction | undefined;
  value: ResourceState | undefined;
  enabled: boolean;
  tone: string | undefined;
  onInvoke: (actionSlug: string, input: Record<string, unknown>) => void;
  isPending: boolean;
  enumOptions?: readonly string[];
}

export type WidgetComponent = ComponentType<WidgetProps>;

export const WIDGET_REGISTRY = {
  text: TextWidget,
  stat: StatWidget,
  toggle: ToggleWidget,
  button: ButtonWidget,
  slider: SliderWidget,
  select: SelectWidget,
  badge: BadgeWidget,
  timer: TimerWidget,
} as const;

export function getWidget(kind: RuntimeWidgetKind): WidgetComponent | undefined {
  return WIDGET_REGISTRY[kind as keyof typeof WIDGET_REGISTRY];
}
