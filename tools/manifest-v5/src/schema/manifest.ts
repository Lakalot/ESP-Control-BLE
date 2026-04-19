import { Type, type Static } from '@sinclair/typebox';
import { SlugId } from './primitives.js';
import { ResourceSpec } from './resources.js';
import { ActionSpec } from './actions.js';
import { ScreenSpec } from './screens.js';
import { NodeSpec } from './nodes.js';

export const CapabilitiesSpec = Type.Object(
  {
    required: Type.Array(SlugId, { maxItems: 32 }),
    optional: Type.Array(SlugId, { maxItems: 32 }),
  },
  { additionalProperties: false },
);

export const ManifestSpec = Type.Object(
  {
    version: Type.Literal(5),
    schemaVersion: Type.Integer({ minimum: 1, maximum: 1 }),
    minAppVersion: Type.String({ pattern: '^\\d+\\.\\d+\\.\\d+$' }),
    capabilities: CapabilitiesSpec,
    resources: Type.Array(ResourceSpec, { maxItems: 128 }),
    actions: Type.Array(ActionSpec, { maxItems: 128 }),
    screens: Type.Array(ScreenSpec, { maxItems: 32 }),
    nodes: Type.Array(NodeSpec, { maxItems: 512 }),
  },
  {
    additionalProperties: false,
  },
);
export type ManifestSpec = Static<typeof ManifestSpec>;
