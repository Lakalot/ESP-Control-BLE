import type { Static } from '@sinclair/typebox';
import { ManifestSpec } from '../../src/schema/manifest.js';

export const DEMO_MANIFEST: Static<typeof ManifestSpec> = {
  version: 5,
  schemaVersion: 1,
  minAppVersion: '1.0.0',
  capabilities: {
    required: ['layout.sections', 'rules.visibility'],
    optional: [],
  },
  resources: [
    {
      id: 'relay.auto',
      label: 'Main Power',
      valueType: 'bool',
      readMode: 'subscribe',
      staleAfterMs: 5000,
    },
    {
      id: 'light.brightness',
      label: 'Brightness',
      valueType: 'uint',
      unit: '%',
      readMode: 'subscribe',
      staleAfterMs: 5000,
    },
    {
      id: 'env.temperature',
      label: 'Temperature',
      valueType: 'float',
      unit: 'C',
      readMode: 'poll',
      staleAfterMs: 3000,
      pollMs: 2000,
    },
    {
      id: 'fan.profile',
      label: 'Fan Profile',
      valueType: 'enum',
      readMode: 'subscribe',
      staleAfterMs: 5000,
      enumValues: ['slow', 'normal', 'fast'],
    },
    {
      id: 'system.load',
      label: 'Load',
      valueType: 'uint',
      unit: '%',
      readMode: 'poll',
      staleAfterMs: 3000,
      pollMs: 1000,
    },
    {
      id: 'device.debug',
      label: 'Debug Mode',
      valueType: 'bool',
      readMode: 'snapshot',
      staleAfterMs: 10000,
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
    {
      id: 'light.set_brightness',
      label: 'Set Brightness',
      dangerLevel: 'normal',
      inputSchema: {
        type: 'object',
        additionalProperties: false,
        required: ['value'],
        properties: {
          value: { type: 'integer', minimum: 0, maximum: 100 },
        },
      },
    },
    {
      id: 'fan.set_profile',
      label: 'Set Fan Profile',
      dangerLevel: 'normal',
      inputSchema: {
        type: 'object',
        additionalProperties: false,
        required: ['value'],
        properties: {
          value: { type: 'string', enum: ['slow', 'normal', 'fast'] },
        },
      },
    },
    {
      id: 'device.set_debug',
      label: 'Set Debug Mode',
      dangerLevel: 'elevated',
      inputSchema: {
        type: 'object',
        additionalProperties: false,
        required: ['value'],
        properties: {
          value: { type: 'boolean' },
        },
      },
    },
    {
      id: 'system.factory_reset',
      label: 'Factory Reset',
      dangerLevel: 'dangerous',
      confirm: 'This will erase all settings. Continue?',
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
      children: ['home.banner', 'lighting.section', 'telemetry.section', 'advanced.section'], 
    },
    {
      id: 'home.banner',
      kind: 'widget',
      widget: 'text',
      title: 'Manifest V5 demo',
      text: 'Representative authoring fixture derived from the current v4 manifest.',
    },
    {
      id: 'lighting.section',
      kind: 'section',
      title: 'Lighting',
      children: ['lighting.toggle', 'lighting.slider'],
    },
    {
      id: 'lighting.toggle',
      kind: 'widget',
      widget: 'toggle',
      title: 'Main Power',
      bind: {
        resource: 'relay.auto',
        action: 'relay.toggle',
      },
      tone: 'tone.success',
    },
    {
      id: 'lighting.slider',
      kind: 'widget',
      widget: 'slider',
      title: 'Brightness',
      bind: {
        resource: 'light.brightness',
        action: 'light.set_brightness',
      },
      formatHint: 'percent',
    },
    {
      id: 'telemetry.section',
      kind: 'section',
      title: 'Telemetry',
      children: ['telemetry.temp', 'telemetry.load', 'telemetry.profile'],
    },
    {
      id: 'telemetry.temp',
      kind: 'widget',
      widget: 'stat',
      title: 'Temperature',
      bind: {
        resource: 'env.temperature',
      },
      formatHint: 'float_2',
    },
    {
      id: 'telemetry.load',
      kind: 'widget',
      widget: 'stat',
      title: 'Load',
      bind: {
        resource: 'system.load',
      },
      formatHint: 'percent',
    },
    {
      id: 'telemetry.profile',
      kind: 'widget',
      widget: 'select',
      title: 'Fan Profile',
      bind: {
        resource: 'fan.profile',
        action: 'fan.set_profile',
      },
    },
    {
      id: 'advanced.section',
      kind: 'section',
      title: 'Advanced',
      visibleIf: {
        '==': [{ var: 'runtime.role' }, 'admin'],
      },
      children: ['advanced.debug', 'advanced.note', 'advanced.reset'],
    },
    {
      id: 'advanced.debug',
      kind: 'widget',
      widget: 'toggle',
      title: 'Debug Mode',
      bind: {
        resource: 'device.debug',
        action: 'device.set_debug',
      },
    },
    {
      id: 'advanced.note',
      kind: 'widget',
      widget: 'text',
      text: 'Advanced settings',
    },
    {
      id: 'advanced.reset',
      kind: 'widget',
      widget: 'button',
      title: 'Factory Reset',
      bind: {
        action: 'system.factory_reset',
      },
    },
  ],
};
