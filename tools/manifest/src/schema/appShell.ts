import { Type, type Static } from '@sinclair/typebox';
import { Label, SlugId } from './primitives.js';

export const NavBarItemSpec = Type.Object(
  {
    id: SlugId,
    label: Label,
    icon: Type.String({ minLength: 1, maxLength: 64 }),
    viewId: SlugId,
  },
  { additionalProperties: false },
);

export const AppShellSpec = Type.Object(
  {
    navBar: Type.Optional(
      Type.Object(
        {
          items: Type.Array(NavBarItemSpec, { minItems: 1, maxItems: 5 }),
        },
        { additionalProperties: false },
      ),
    ),
  },
  { additionalProperties: false },
);

export type AppShellSpec = Static<typeof AppShellSpec>;
