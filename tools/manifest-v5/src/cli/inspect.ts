import { normalize } from '../compiler/normalize.js';
import { encodeManifest } from '../compiler/encodeProto.js';
import { loadManifestSource } from './loadSource.js';
import type { CliResult } from './main.js';

export async function inspectCmd(sourcePath: string, includeIds = false): Promise<CliResult> {
  const manifest = (await loadManifestSource(sourcePath)) as {
    resources: unknown[];
    actions: unknown[];
    screens: unknown[];
    nodes: unknown[];
  };

  const normalized = normalize(manifest as never);
  const bytes = encodeManifest(normalized);

  return {
    exitCode: 0,
    stdout: buildOutput(manifest, normalized, bytes.byteLength, includeIds),
    stderr: '',
  };
}

function buildOutput(
  manifest: { resources: unknown[]; actions: unknown[]; screens: unknown[]; nodes: unknown[] },
  normalized: {
    strings: string[];
    resources: { id: number; runtimeId: string }[];
    actions: { id: number; runtimeId: string }[];
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
  [...normalized.resources]
    .sort((left, right) => left.id - right.id)
    .forEach((resource) => {
      lines.push(`${resource.id} ${resource.runtimeId}`);
    });

  lines.push('');
  lines.push('action_id runtime_id');
  [...normalized.actions]
    .sort((left, right) => left.id - right.id)
    .forEach((action) => {
      lines.push(`${action.id} ${action.runtimeId}`);
    });

  return `${lines.join('\n')}\n`;
}
