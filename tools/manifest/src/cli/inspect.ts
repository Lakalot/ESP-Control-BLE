import { assignIds } from '../compiler/assignIds.js';
import { normalize } from '../compiler/normalize.js';
import { encodeManifest } from '../compiler/encodeProto.js';
import { loadManifestSource } from './loadSource.js';
import type { CliResult } from './main.js';

export async function inspectCmd(sourcePath: string, includeIds = false): Promise<CliResult> {
  const manifest = (await loadManifestSource(sourcePath)) as {
    resources: { id: string }[];
    actions: { id: string }[];
    nodes: unknown[];
  } & ({ screens: unknown[] } | { views: unknown[] });

  const screens = 'screens' in manifest ? manifest.screens : manifest.views;

  const normalized = normalize(manifest as never);
  const ids = assignIds(manifest as never);
  const bytes = encodeManifest(normalized);

  return {
    exitCode: 0,
    stdout: buildOutput({ ...manifest, screens }, normalized, ids, bytes.byteLength, includeIds),
    stderr: '',
  };
}

function buildOutput(
  manifest: { resources: { id: string }[]; actions: { id: string }[]; screens: unknown[]; nodes: unknown[] },
  normalized: { strings: string[] },
  ids: {
    resources: Map<string, number>;
    actions: Map<string, number>;
  },
  byteLength: number,
  includeIds: boolean,
): string {
  const lines = [
    `resources: ${manifest.resources.length}`,
    `actions:   ${manifest.actions.length}`,
    `screens:   ${manifest.screens.length}`,
    `nodes:     ${manifest.nodes.length}`,
    `strings:   ${normalized.strings.length}`,
    `bytes:     ${byteLength}`,
  ];

  if (!includeIds) {
    return `${lines.join('\n')}\n`;
  }

  lines.push('');
  lines.push('resource_id runtime_id');
  manifest.resources
    .map((resource) => ({ id: ids.resources.get(resource.id)!, runtimeId: resource.id }))
    .sort((left, right) => left.id - right.id)
    .forEach((resource) => {
      lines.push(`${resource.id} ${resource.runtimeId}`);
    });

  lines.push('');
  lines.push('action_id runtime_id');
  manifest.actions
    .map((action) => ({ id: ids.actions.get(action.id)!, runtimeId: action.id }))
    .sort((left, right) => left.id - right.id)
    .forEach((action) => {
      lines.push(`${action.id} ${action.runtimeId}`);
    });

  return `${lines.join('\n')}\n`;
}
