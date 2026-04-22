import { Type, type Static } from '@sinclair/typebox';

export const ALLOWED_RULE_OPERATORS = [
  '==',
  '!=',
  '>',
  '>=',
  '<',
  '<=',
  'and',
  'or',
  '!',
  'if',
  'in',
  'var',
] as const;

export const RuleSpec = Type.Object(
  Object.fromEntries(
    ALLOWED_RULE_OPERATORS.map((op) => [op, Type.Optional(Type.Unknown())]),
  ),
  {
    additionalProperties: false,
    minProperties: 1,
    maxProperties: 1,
  },
);
export type RuleSpec = Static<typeof RuleSpec>;
