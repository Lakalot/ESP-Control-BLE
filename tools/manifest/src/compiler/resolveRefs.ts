import type { Static } from '@sinclair/typebox';
import type { ManifestSpec } from '../schema/manifest.js';
import type { IdMaps } from './assignIds.js';

type Manifest = Static<typeof ManifestSpec>;

export function resolveRefs(manifest: Manifest, ids: IdMaps): void {
  for (const screen of manifest.screens) {
    if (!ids.nodes.has(screen.rootNodeId)) {
      throw new Error(
        `screen '${screen.id}' references unknown rootNodeId '${screen.rootNodeId}'`,
      );
    }
  }

  for (const node of manifest.nodes) {
    if (node.kind !== 'widget') {
      node.children.forEach((childId) => {
        if (!ids.nodes.has(childId)) {
          throw new Error(`node '${node.id}' references unknown child '${childId}'`);
        }
      });
      continue;
    }

    if (node.bind?.resource && !ids.resources.has(node.bind.resource)) {
      throw new Error(`node '${node.id}' binds unknown resource '${node.bind.resource}'`);    
    }

    if (node.bind?.action && !ids.actions.has(node.bind.action)) {
      throw new Error(`node '${node.id}' binds unknown action '${node.bind.action}'`);        
    }
  }
}
