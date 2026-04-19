import type { Static } from '@sinclair/typebox';
import type { ManifestSpec } from '../../src/schema/manifest.js';

export const MINIMAL_MANIFEST: Static<typeof ManifestSpec> = {
  version: 5,
  schemaVersion: 1,
  minAppVersion: '1.0.0',
  capabilities: { required: [], optional: [] },
  resources: [
    {
      id: 'relay.auto',
      label: 'Main Power',
      valueType: 'bool',
      readMode: 'subscribe',
      staleAfterMs: 5000,
    },
  ],
  actions: [
    {
      id: 'relay.toggle',
      label: 'Toggle',
      dangerLevel: 'normal',
      inputSchema: {
        type: 'object',
        additionalProperties: false,
        properties: {},
      },
    },
  ],
  screens: [
    {
      id: 'home',
      title: 'Home',
      rootNodeId: 'home.root',
    },
  ],
  nodes: [
    {
      id: 'home.root',
      kind: 'stack',
      children: ['home.toggle'],
    },
    {
      id: 'home.toggle',
      kind: 'widget',
      widget: 'toggle',
      title: 'Main Power',
      bind: {
        resource: 'relay.auto',
        action: 'relay.toggle',
      },
    },
  ],
};
