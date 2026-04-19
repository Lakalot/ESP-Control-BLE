import { Type, type Static } from '@sinclair/typebox';
import { Label, SlugId } from './primitives.js';

export const DangerLevel = Type.Union(
  [Type.Literal('normal'), Type.Literal('elevated'), Type.Literal('dangerous')],
);
export type DangerLevel = Static<typeof DangerLevel>;

export const EmbeddedJsonSchema = Type.Record(Type.String(), Type.Unknown());
export type EmbeddedJsonSchema = Static<typeof EmbeddedJsonSchema>;

export const ActionSpec = Type.Object(
  {
    id: SlugId,
    label: Type.Optional(Label),
    dangerLevel: DangerLevel,
    confirm: Type.Optional(Type.String({ maxLength: 200 })),
    cooldownMs: Type.Optional(Type.Integer({ minimum: 0, maximum: 60_000 })),
    inputSchema: EmbeddedJsonSchema,
    resultSchema: Type.Optional(EmbeddedJsonSchema),
  },
  {
    additionalProperties: false,
  },
);
export type ActionSpec = Static<typeof ActionSpec>;
