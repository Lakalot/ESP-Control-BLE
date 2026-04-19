import { describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runCli } from '../src/cli/main.js';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const DEMO = join(HERE, 'fixtures', 'demo.manifest.ts');

describe('runCli', () => {
  it('validate returns exitCode 0 for the demo fixture', async () => {
    const result = await runCli(['validate', '--source', DEMO]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('OK');
  });

  it('compile writes a protobuf file', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'manifest-v5-'));
    const out = join(dir, 'manifest.pb');
    const result = await runCli(['compile', '--source', DEMO, '--out', out]);
    expect(result.exitCode).toBe(0);
    expect(readFileSync(out).byteLength).toBeGreaterThan(0);
  });

  it('inspect prints counts and byte size', async () => {
    const result = await runCli(['inspect', '--source', DEMO]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toMatch(/resources:\s+\d+/);
    expect(result.stdout).toMatch(/nodes:\s+\d+/);
    expect(result.stdout).toMatch(/bytes:\s+\d+/);
  });

  it('validate returns exitCode 1 for an invalid fixture', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'manifest-v5-'));
    const broken = join(dir, 'broken.ts');
    writeFileSync(broken, `export const manifest = { version: 4 };\n`);
    const result = await runCli(['validate', '--source', broken]);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toMatch(/version|capabilities|resources/);
  });
});
