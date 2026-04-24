import { describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runCli } from '../src/cli/main.js';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const DEMO = join(HERE, 'fixtures', 'demo.manifest.yaml');
const MINIMAL_YAML = join(HERE, 'fixtures', 'minimal.manifest.yaml');
const MULTI_VIEW_YAML = join(HERE, 'fixtures', 'multi-view.manifest.yaml');

describe('runCli', () => {
  it('validate returns exitCode 0 for the YAML demo fixture', async () => {
    const result = await runCli(['validate', '--source', DEMO]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('OK');
  });

  it('compile writes a protobuf file from the YAML demo fixture', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'manifest-'));
    const out = join(dir, 'manifest.pb');
    const result = await runCli(['compile', '--source', DEMO, '--out', out]);
    expect(result.exitCode).toBe(0);
    expect(readFileSync(out).byteLength).toBeGreaterThan(0);
  });

  it('validate returns exitCode 0 for a YAML authoring fixture', async () => {
    const result = await runCli(['validate', '--source', MINIMAL_YAML]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('OK');
  });

  it('validate returns canonical reference diagnostics for invalid YAML authoring ids', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'manifest-'));
    const broken = join(dir, 'broken.manifest.yaml');

    writeFileSync(
      broken,
      `version: 5
schemaVersion: 1
minAppVersion: 1.0.0
capabilities:
  required: []
  optional: []
resources:
  - id: relay.auto
    firmwareSymbol: relay_auto
    label: Main Power
    valueType: bool
    readMode: subscribe
    staleAfterMs: 5000
actions: []
views:
  - id: home
    title: Home
    content:
      - kind: toggle
        id: home.toggle
        title: Main Power
        resource: relay.missing
`,
    );

    const result = await runCli(['validate', '--source', broken]);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("views[0].content[0].resource: unknown resource 'relay.missing'");
  });

  it('compile writes a protobuf file from YAML authoring', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'manifest-'));
    const out = join(dir, 'manifest.pb');
    const result = await runCli(['compile', '--source', MINIMAL_YAML, '--out', out]);
    expect(result.exitCode).toBe(0);
    expect(readFileSync(out).byteLength).toBeGreaterThan(0);
  });

  it('inspect prints counts and byte size for the YAML demo fixture', async () => {
    const result = await runCli(['inspect', '--source', DEMO]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toMatch(/resources:\s+\d+/);
    expect(result.stdout).toMatch(/nodes:\s+\d+/);
    expect(result.stdout).toMatch(/bytes:\s+\d+/);
  });

  it('inspect prints runtime ids for the YAML demo fixture when asked', async () => {
    const result = await runCli(['inspect', '--source', DEMO, '--ids']);
    expect(result.exitCode).toBe(0);
    const lines = result.stdout.trimEnd().split(/\r?\n/);
    expect(lines[0]).toMatch(/^resources:\s+6$/);
    expect(lines[1]).toMatch(/^actions:\s+5$/);
    expect(lines[2]).toMatch(/^screens:\s+1$/);
    expect(lines[3]).toMatch(/^nodes:\s+13$/);
    expect(lines[6]).toBe('');
    expect(lines[7]).toBe('resource_id runtime_id');
    expect(lines.slice(8, 14)).toEqual([
      '1 device.debug',
      '2 env.temperature',
      '3 fan.profile',
      '4 light.brightness',
      '5 relay.auto',
      '6 system.load',
    ]);
    expect(lines[14]).toBe('');
    expect(lines[15]).toBe('action_id runtime_id');
    expect(lines.slice(16, 21)).toEqual([
      '1 device.set_debug',
      '2 fan.set_profile',
      '3 light.set_brightness',
      '4 relay.toggle',
      '5 system.factory_reset',
    ]);
  });

  it('inspect prints canonical counts for YAML authoring', async () => {
    const result = await runCli(['inspect', '--source', MULTI_VIEW_YAML]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('resources: 2');
    expect(result.stdout).toContain('actions:   1');
    expect(result.stdout).toContain('screens:   2');
    expect(result.stdout).toContain('nodes:     5');
  });

  it('validate returns exitCode 1 for an invalid fixture', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'manifest-'));
    const broken = join(dir, 'broken.manifest.yaml');
    writeFileSync(broken, `version: 4\n`);
    const result = await runCli(['validate', '--source', broken]);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toMatch(/version|capabilities|resources/);
  });

  it('symbols returns exitCode 1 for an invalid firmwareSymbol', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'manifest-'));
    const source = join(dir, 'invalid-symbols.manifest.yaml');
    const headerOut = join(dir, 'manifest_symbols.h');
    const sourceOut = join(dir, 'manifest_symbols.cpp');

    writeFileSync(
      source,
      `version: 5
schemaVersion: 1
minAppVersion: 1.0.0
capabilities:
  required: []
  optional: []
resources:
  - id: relay.auto
    firmwareSymbol: 9Bad
    label: Relay
    valueType: bool
    readMode: subscribe
    staleAfterMs: 5000
actions:
  - id: relay.toggle
    firmwareSymbol: RelayToggle
    label: Toggle
    dangerLevel: normal
    inputSchema:
      type: object
      additionalProperties: false
      properties: {}
views:
  - id: home
    firmwareSymbol: HomeScreen
    title: Home
    content:
      - kind: toggle
        id: home.toggle
        firmwareSymbol: HomeToggle
        title: Main Power
        resource: relay.auto
        action: relay.toggle
`,
    );

    const result = await runCli([
      'symbols',
      '--source',
      source,
      '--header-out',
      headerOut,
      '--source-out',
      sourceOut,
    ]);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('resources[0].firmwareSymbol');
  });

  it('symbols writes firmware files from YAML authoring', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'manifest-'));
    const headerOut = join(dir, 'manifest_symbols.h');
    const sourceOut = join(dir, 'manifest_symbols.cpp');

    const result = await runCli([
      'symbols',
      '--source',
      MINIMAL_YAML,
      '--header-out',
      headerOut,
      '--source-out',
      sourceOut,
    ]);

    expect(result.exitCode).toBe(0);
    expect(readFileSync(headerOut, 'utf8')).toContain('relay_auto');
    expect(readFileSync(sourceOut, 'utf8')).toContain('relay_auto');
  });
});
