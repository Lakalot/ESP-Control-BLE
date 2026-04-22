import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { normalize } from '../compiler/normalize.js';
import { encodeManifest } from '../compiler/encodeProto.js';
import { loadManifestSource } from './loadSource.js';
import type { CliResult } from './main.js';

export async function compileCmd(sourcePath: string, outPath: string): Promise<CliResult> {   
  const manifest = await loadManifestSource(sourcePath);
  const bytes = encodeManifest(normalize(manifest as never));
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, bytes);
  return {
    exitCode: 0,
    stdout: `wrote ${bytes.byteLength} bytes to ${outPath}\n`,
    stderr: '',
  };
}
