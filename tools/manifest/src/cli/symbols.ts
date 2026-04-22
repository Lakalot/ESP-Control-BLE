import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { lintRules } from '../validation/ruleLinter.js';
import { validateManifest } from '../validation/ajv.js';
import { loadManifestSource } from './loadSource.js';
import type { CliResult } from './main.js';
import { generateFirmwareSymbols } from '../generate/generateFirmwareSymbols.js';

export async function symbolsCmd(
  sourcePath: string,
  headerOutPath: string,
  sourceOutPath: string,
): Promise<CliResult> {
  const manifest = await loadManifestSource(sourcePath);
  const validation = validateManifest(manifest);

  if (!validation.ok) {
    return {
      exitCode: 1,
      stdout: '',
      stderr: validation.errors.map((error) => `${error.path} ${error.message}`).join('\n') + '\n',
    };
  }

  const ruleDiagnostics = lintRules(manifest as never);
  if (ruleDiagnostics.length > 0) {
    return {
      exitCode: 1,
      stdout: '',
      stderr: ruleDiagnostics.map((error) => `${error.path} ${error.message}`).join('\n') + '\n',
    };
  }

  const generated = generateFirmwareSymbols(manifest as never);

  mkdirSync(dirname(headerOutPath), { recursive: true });
  mkdirSync(dirname(sourceOutPath), { recursive: true });
  writeFileSync(headerOutPath, generated.headerText);
  writeFileSync(sourceOutPath, generated.sourceText);

  return {
    exitCode: 0,
    stdout: `wrote ${headerOutPath}\nwrote ${sourceOutPath}\n`,
    stderr: '',
  };
}
