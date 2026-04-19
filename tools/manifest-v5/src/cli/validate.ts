import { validateManifest } from '../validation/ajv.js';
import { lintRules } from '../validation/ruleLinter.js';
import { loadManifestSource } from './loadSource.js';
import type { CliResult } from './main.js';

export async function validateCmd(sourcePath: string): Promise<CliResult> {
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

  return { exitCode: 0, stdout: 'OK\n', stderr: '' };
}
