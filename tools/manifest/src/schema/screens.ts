import { Type, type Static } from '@sinclair/typebox';
import { FirmwareSymbol, Label, SlugId } from './primitives.js';
import { RuleSpec } from './rules.js';

export const ScreenSpec = Type.Object(
  {
    id: SlugId,
    firmwareSymbol: FirmwareSymbol,
    title: Label,
    routeKey: Type.Optional(SlugId),
    rootNodeId: SlugId,
    entryRules: Type.Optional(Type.Array(RuleSpec, { maxItems: 4 })),
  },
  {
    additionalProperties: false,
  },
);
export type ScreenSpec = Static<typeof ScreenSpec>;
