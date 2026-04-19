import { normalize } from '../compiler/normalize.js';
import { encodeManifest } from '../compiler/encodeProto.js';
import { loadManifestSource } from './loadSource.js';
import type { CliResult } from './main.js';

export async function inspectCmd(sourcePath: string): Promise<CliResult> {
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
    stdout:
      `resources: ${manifest.resources.length}\n` +
      `actions:   ${manifest.actions.length}\n` +
      `screens:   ${manifest.screens.length}\n` +
      `nodes:     ${manifest.nodes.length}\n` +
      `strings:   ${normalized.strings.length}\n` +
      `bytes:     ${bytes.byteLength}\n`,
    stderr: '',
  };
}
