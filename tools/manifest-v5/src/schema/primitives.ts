import { Type, type Static } from '@sinclair/typebox';

export const SlugId = Type.String({
  $id: 'SlugId',
  pattern: '^[a-z][a-z0-9_]*(\\.[a-z0-9_]+)*$',
  minLength: 1,
  maxLength: 48,
});
export type SlugId = Static<typeof SlugId>;

export const Label = Type.String({
  $id: 'Label',
  minLength: 1,
  maxLength: 64,
});
export type Label = Static<typeof Label>;

export const TokenRef = Type.String({
  $id: 'TokenRef',
  pattern: '^[a-z][a-z0-9_]*\\.[a-z0-9_]+$',
  minLength: 3,
  maxLength: 48,
});
export type TokenRef = Static<typeof TokenRef>;
