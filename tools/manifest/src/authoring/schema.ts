import { Type } from '@sinclair/typebox';
import { ActionSpec } from '../schema/actions.js';
import { AppShellSpec } from '../schema/appShell.js';
import { ContainerKind, WidgetKind } from '../schema/nodes.js';
import { FirmwareSymbol, Label, SlugId, TokenRef } from '../schema/primitives.js';
import { ResourceSpec } from '../schema/resources.js';
import { RuleSpec } from '../schema/rules.js';

const AuthoringBindingFields = {
  resource: Type.Optional(SlugId),
  action: Type.Optional(SlugId),
};

const AuthoringCommonNodeFields = {
  id: SlugId,
  firmwareSymbol: Type.Optional(FirmwareSymbol),
  title: Type.Optional(Label),
  tone: Type.Optional(TokenRef),
  visibleIf: Type.Optional(RuleSpec),
  enabledIf: Type.Optional(RuleSpec),
};

export const AuthoringContentSpec = Type.Recursive(
  (Self) =>
    Type.Union([
      Type.Object(
        {
          ...AuthoringCommonNodeFields,
          kind: ContainerKind,
          content: Type.Array(Self, { minItems: 1, maxItems: 32 }),
          columns: Type.Optional(Type.Integer({ minimum: 1, maximum: 4 })),
        },
        { additionalProperties: false },
      ),
      Type.Object(
        {
          ...AuthoringCommonNodeFields,
          kind: WidgetKind,
          ...AuthoringBindingFields,
          text: Type.Optional(Type.String({ maxLength: 240 })),
          formatHint: Type.Optional(Type.String({ maxLength: 24 })),
        },
        { additionalProperties: false },
      ),
    ]),
  { $id: 'AuthoringContent' },
);

export const AuthoringViewSpec = Type.Object(
  {
    id: SlugId,
    firmwareSymbol: Type.Optional(FirmwareSymbol),
    title: Label,
    routeKey: Type.Optional(SlugId),
    entryRules: Type.Optional(Type.Array(RuleSpec, { maxItems: 4 })),
    content: Type.Array(AuthoringContentSpec, { minItems: 1, maxItems: 32 }),
  },
  { additionalProperties: false },
);

export const AuthoringManifestSpec = Type.Object(
  {
    version: Type.Literal(5),
    schemaVersion: Type.Integer({ minimum: 1, maximum: 1 }),
    minAppVersion: Type.String({ pattern: '^\\d+\\.\\d+\\.\\d+$' }),
    appShell: Type.Optional(AppShellSpec),
    capabilities: Type.Object(
      {
        required: Type.Array(SlugId, { maxItems: 32 }),
        optional: Type.Array(SlugId, { maxItems: 32 }),
      },
      { additionalProperties: false },
    ),
    resources: Type.Array(ResourceSpec, { maxItems: 128 }),
    actions: Type.Array(ActionSpec, { maxItems: 128 }),
    views: Type.Array(AuthoringViewSpec, { maxItems: 32 }),
  },
  { additionalProperties: false },
);
