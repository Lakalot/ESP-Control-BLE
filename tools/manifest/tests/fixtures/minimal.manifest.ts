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
      firmwareSymbol: 'relay_auto',
      label: 'Main Power',
      valueType: 'bool',
      readMode: 'subscribe',
      staleAfterMs: 5000,
    },
  ],
  actions: [
    {
      id: 'relay.toggle',
      firmwareSymbol: 'relay_toggle',
      label: 'Toggle',
      dangerLevel: 'normal',
      inputSchema: {
        type: 'object',
        additionalProperties: false,
        properties: {},
      },
    },
  ],
  views: [
    {
      id: 'home',
      firmwareSymbol: 'home_screen',
      title: 'Home',
      rootNodeId: 'home.root',
    },
  ],
  nodes: [
    {
      id: 'home.root',
      firmwareSymbol: 'home_root',
      kind: 'stack',
      children: ['home.toggle'],
    },
    {
      id: 'home.toggle',
      firmwareSymbol: 'home_toggle',
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
