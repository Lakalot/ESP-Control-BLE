import { Type, type Static } from '@sinclair/typebox';
import { FirmwareSymbol, Label, SlugId } from './primitives.js';

export const ValueType = Type.Union(
  [
    Type.Literal('bool'),
    Type.Literal('int'),
    Type.Literal('uint'),
    Type.Literal('float'),
    Type.Literal('string'),
    Type.Literal('enum'),
    Type.Literal('duration_ms'),
  ],
);
export type ValueType = Static<typeof ValueType>;

export const ReadMode = Type.Union(
  [Type.Literal('snapshot'), Type.Literal('subscribe'), Type.Literal('poll')],
);
export type ReadMode = Static<typeof ReadMode>;

export const ResourceSpec = Type.Object(
  {
    id: SlugId,
    firmwareSymbol: FirmwareSymbol,
    label: Type.Optional(Label),
    valueType: ValueType,
    unit: Type.Optional(Type.String({ maxLength: 16 })),
    readMode: ReadMode,
    staleAfterMs: Type.Integer({ minimum: 1, maximum: 3_600_000 }),
    pollMs: Type.Optional(Type.Integer({ minimum: 100, maximum: 60_000 })),
    enumValues: Type.Optional(Type.Array(SlugId, { minItems: 1, maxItems: 32 })),
  },
  {
    additionalProperties: false,
  },
);
export type ResourceSpec = Static<typeof ResourceSpec>;
