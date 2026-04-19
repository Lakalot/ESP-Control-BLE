import { Type, type Static } from '@sinclair/typebox';
import { SlugId } from './primitives.js';
import { ResourceSpec } from './resources.js';
import { ActionSpec } from './actions.js';
import { ScreenSpec } from './screens.js';
import { NodeSpec } from './nodes.js';

export const CapabilitiesSpec = Type.Object(
  {
    features: Type.Array(SlugId, { maxItems: 16 }),
  },
  { additionalProperties: false },
);

export const ManifestSpec = Type.Object(
  {
    version: Type.Literal(5),
    capabilities: CapabilitiesSpec,
    resources: Type.Array(ResourceSpec, { minItems: 1, maxItems: 64 }),
    actions: Type.Array(ActionSpec, { minItems: 1, maxItems: 64 }),
    screens: Type.Array(ScreenSpec, { minItems: 1, maxItems: 16 }),
    nodes: Type.Array(NodeSpec, { minItems: 1, maxItems: 256 }),
  },
  {
    $id: 'ManifestSpec',
    additionalProperties: false,
  },
);
export type ManifestSpec = Static<typeof ManifestSpec>;
