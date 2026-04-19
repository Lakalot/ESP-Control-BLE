import { Type, type Static } from '@sinclair/typebox';
import { Label, SlugId, TokenRef } from './primitives.js';
import { RuleSpec } from './rules.js';

export const ContainerKind = Type.Union(
  [
    Type.Literal('stack'),
    Type.Literal('row'),
    Type.Literal('grid'),
    Type.Literal('section'),
  ],
  { $id: 'ContainerKind' },
);
export type ContainerKind = Static<typeof ContainerKind>;

export const WidgetKind = Type.Union(
  [
    Type.Literal('action'),
    Type.Literal('toggle'),
    Type.Literal('range'),
    Type.Literal('select'),
    Type.Literal('read_only'),
    Type.Literal('text'),
    Type.Literal('divider'),
  ],
  { $id: 'WidgetKind' },
);
export type WidgetKind = Static<typeof WidgetKind>;

const BindingSpec = Type.Object(
  {
    resource: Type.Optional(SlugId),
    action: Type.Optional(SlugId),
  },
  { additionalProperties: false },
);

const CommonNodeFields = {
  id: SlugId,
  title: Type.Optional(Label),
  tone: Type.Optional(TokenRef),
  visibleIf: Type.Optional(RuleSpec),
  enabledIf: Type.Optional(RuleSpec),
};

export const ContainerNodeSpec = Type.Object(
  {
    ...CommonNodeFields,
    kind: ContainerKind,
    children: Type.Array(SlugId, { minItems: 1, maxItems: 32 }),
    columns: Type.Optional(Type.Integer({ minimum: 1, maximum: 4 })),
  },
  { additionalProperties: false },
);

export const WidgetNodeSpec = Type.Object(
  {
    ...CommonNodeFields,
    kind: Type.Literal('widget'),
    widget: WidgetKind,
    bind: Type.Optional(BindingSpec),
    text: Type.Optional(Type.String({ maxLength: 240 })),
    formatHint: Type.Optional(Type.String({ maxLength: 24 })),
  },
  { additionalProperties: false },
);

export const NodeSpec = Type.Union([ContainerNodeSpec, WidgetNodeSpec], {
  $id: 'NodeSpec',
});
export type NodeSpec = Static<typeof NodeSpec>;
