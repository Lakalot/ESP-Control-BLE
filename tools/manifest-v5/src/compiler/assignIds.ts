import type { Static } from '@sinclair/typebox';
import type { ManifestSpec } from '../schema/manifest.js';

type Manifest = Static<typeof ManifestSpec>;

export interface IdMaps {
  resources: Map<string, number>;
  actions: Map<string, number>;
  screens: Map<string, number>;
  nodes: Map<string, number>;
}

export function assignIds(manifest: Manifest): IdMaps {
  const build = (items: readonly { id: string }[]): Map<string, number> => {
    const out = new Map<string, number>();
    [...items]
      .sort((left, right) => left.id.localeCompare(right.id))
      .forEach((item, index) => {
        out.set(item.id, index + 1);
      });
    return out;
  };

  return {
    resources: build(manifest.resources),
    actions: build(manifest.actions),
    screens: build(manifest.screens),
    nodes: build(manifest.nodes),
  };
}
