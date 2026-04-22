import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { runCli } from '../src/cli/main.js';
import { generateFirmwareSymbols } from '../src/generate/generateFirmwareSymbols.js';

function loadManifestFixture(name: string) {
  return JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8'));
}

const MANIFEST_WITH_SYMBOLS = {
  version: 5,
  schemaVersion: 1,
  minAppVersion: '1.0.0',
  capabilities: {
    required: [],
    optional: [],
  },
  resources: [
    {
      id: 'system.load',
      firmwareSymbol: 'system_load',
      valueType: 'uint',
      readMode: 'subscribe',
      staleAfterMs: 1000,
    },
    {
      id: 'relay.auto',
      firmwareSymbol: 'relay_auto',
      valueType: 'bool',
      readMode: 'subscribe',
      staleAfterMs: 1000,
    },
  ],
  actions: [
    {
      id: 'system.restart',
      firmwareSymbol: 'system_restart',
      dangerLevel: 'dangerous',
      inputSchema: {},
    },
  ],
  screens: [
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
      children: ['home.status'],
    },
    {
      id: 'home.status',
      firmwareSymbol: 'home_status',
      kind: 'widget',
      widget: 'text',
      text: 'Ready',
    },
  ],
} as const;

describe('generateFirmwareSymbols', () => {
  it('emits header and source text using assignIds ordering and explicit firmware symbols', () => {
    const generated = generateFirmwareSymbols(MANIFEST_WITH_SYMBOLS as never);

    expect(generated.headerText).toContain('struct ManifestSymbolEntry');
    expect(generated.headerText).toContain('namespace manifest_resources');
    expect(generated.headerText).toContain('extern const uint32_t relay_auto;');
    expect(generated.headerText).toContain('extern const uint32_t system_load;');
    expect(generated.headerText).toContain('namespace manifest_actions');
    expect(generated.headerText).toContain('extern const uint32_t system_restart;');
    expect(generated.headerText).toContain('namespace manifest_screens');
    expect(generated.headerText).toContain('extern const uint32_t home_screen;');
    expect(generated.headerText).toContain('namespace manifest_nodes');
    expect(generated.headerText).toContain('extern const uint32_t home_root;');
    expect(generated.headerText).toContain('extern const uint32_t home_status;');
    expect(generated.headerText).toContain('find_manifest_resource_symbol(uint32_t id)');

    expect(generated.sourceText).toContain('const ManifestSymbolEntry kManifestResourceSymbols[] = {');
    expect(generated.sourceText).toContain('namespace manifest_resources {');
    expect(generated.sourceText).toContain('const uint32_t relay_auto = 1u;');
    expect(generated.sourceText).toContain('{manifest_resources::relay_auto, "relay_auto", "relay.auto"}');
    expect(generated.sourceText).toContain('{manifest_resources::system_load, "system_load", "system.load"}');
    expect(generated.sourceText).toContain('find_manifest_node_symbol(uint32_t id)');
  });

  it('rejects a missing firmwareSymbol', () => {
    const manifest = loadManifestFixture('invalid-missing-firmware-symbol.json');

    expect(() => generateFirmwareSymbols(manifest as never)).toThrowError(
      'missing firmwareSymbol for resource "system.load"',
    );
  });

  it('rejects an invalid firmwareSymbol identifier', () => {
    expect(() =>
      generateFirmwareSymbols({
        ...MANIFEST_WITH_SYMBOLS,
        resources: [
          {
            ...MANIFEST_WITH_SYMBOLS.resources[0],
            firmwareSymbol: '9system_load',
          },
          MANIFEST_WITH_SYMBOLS.resources[1],
        ],
      } as never),
    ).toThrowError('invalid firmwareSymbol "9system_load" for resource "system.load"');
  });

  it('rejects reserved firmwareSymbol names', () => {
    expect(() =>
      generateFirmwareSymbols({
        ...MANIFEST_WITH_SYMBOLS,
        resources: [
          {
            ...MANIFEST_WITH_SYMBOLS.resources[0],
            firmwareSymbol: 'and',
          },
          MANIFEST_WITH_SYMBOLS.resources[1],
        ],
      } as never),
    ).toThrowError('reserved firmwareSymbol "and" for resource "system.load"');

    expect(() =>
      generateFirmwareSymbols({
        ...MANIFEST_WITH_SYMBOLS,
        resources: [
          {
            ...MANIFEST_WITH_SYMBOLS.resources[0],
            firmwareSymbol: 'concept',
          },
          MANIFEST_WITH_SYMBOLS.resources[1],
        ],
      } as never),
    ).toThrowError('reserved firmwareSymbol "concept" for resource "system.load"');

    expect(() =>
      generateFirmwareSymbols({
        ...MANIFEST_WITH_SYMBOLS,
        resources: [
          {
            ...MANIFEST_WITH_SYMBOLS.resources[0],
            firmwareSymbol: 'xor',
          },
          MANIFEST_WITH_SYMBOLS.resources[1],
        ],
      } as never),
    ).toThrowError('reserved firmwareSymbol "xor" for resource "system.load"');

    expect(() =>
      generateFirmwareSymbols({
        ...MANIFEST_WITH_SYMBOLS,
        resources: [
          {
            ...MANIFEST_WITH_SYMBOLS.resources[0],
            firmwareSymbol: '__system_load',
          },
          MANIFEST_WITH_SYMBOLS.resources[1],
        ],
      } as never),
    ).toThrowError('invalid firmwareSymbol "__system_load" for resource "system.load"');

    expect(() =>
      generateFirmwareSymbols({
        ...MANIFEST_WITH_SYMBOLS,
        resources: [
          {
            ...MANIFEST_WITH_SYMBOLS.resources[0],
            firmwareSymbol: '_system_load',
          },
          MANIFEST_WITH_SYMBOLS.resources[1],
        ],
      } as never),
    ).toThrowError('invalid firmwareSymbol "_system_load" for resource "system.load"');
  });

  it('emits safe empty-category tables', () => {
    const generated = generateFirmwareSymbols({
      ...MANIFEST_WITH_SYMBOLS,
      resources: [],
      actions: [],
      screens: [],
      nodes: [],
    } as never);

    expect(generated.headerText).toContain('extern const ManifestSymbolEntry kManifestResourceSymbols[];');
    expect(generated.sourceText).toContain('const ManifestSymbolEntry kManifestResourceSymbols[1] = {};');
    expect(generated.sourceText).toContain('const size_t kManifestResourceSymbolsCount = 0;');
    expect(generated.sourceText).not.toContain('sizeof(kManifestResourceSymbols[0])');
    expect(generated.sourceText).toContain('return nullptr;');
  });

  it('rejects duplicate firmware symbols within a category', () => {
    const manifest = loadManifestFixture('invalid-duplicate-firmware-symbol.json');

    expect(() => generateFirmwareSymbols(manifest as never)).toThrowError(
      'duplicate firmwareSymbol "shared_symbol" for resource "relay.auto"',
    );
  });

  it('rejects firmware symbols that collide with generated emitted names', () => {
    expect(() =>
      generateFirmwareSymbols({
        ...MANIFEST_WITH_SYMBOLS,
        resources: [
          {
            ...MANIFEST_WITH_SYMBOLS.resources[0],
            firmwareSymbol: 'manifest_resources',
          },
          MANIFEST_WITH_SYMBOLS.resources[1],
        ],
      } as never),
    ).toThrowError(
      'firmwareSymbol "manifest_resources" for resource "system.load" collides with emitted name "manifest_resources"',
    );
  });

  it('writes generated files through the symbols CLI command', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'manifest-symbols-'));
    const source = join(dir, 'manifest-with-symbols.ts');
    const headerOut = join(dir, 'manifest_symbols.h');
    const sourceOut = join(dir, 'manifest_symbols.cpp');

    writeFileSync(source, `export const manifest = ${JSON.stringify(MANIFEST_WITH_SYMBOLS, null, 2)};\n`);

    const result = await runCli([
      'symbols',
      '--source',
      source,
      '--header-out',
      headerOut,
      '--source-out',
      sourceOut,
    ]);

    expect(result.exitCode).toBe(0);
    expect(readFileSync(headerOut, 'utf8')).toContain('namespace manifest_resources');
    expect(readFileSync(sourceOut, 'utf8')).toContain('kManifestNodeSymbols');
  });

  it('regenerates the checked-in firmware symbol artifacts from the real firmware manifest', async () => {
    const source = new URL('../../../firmware/esp32/src/manifest.json', import.meta.url);
    const expectedHeader = readFileSync(new URL('../../../firmware/esp32/src/manifest_symbols.h', import.meta.url), 'utf8');
    const expectedSource = readFileSync(new URL('../../../firmware/esp32/src/manifest_symbols.cpp', import.meta.url), 'utf8');
    const dir = mkdtempSync(join(tmpdir(), 'firmware-symbols-'));
    const headerOut = join(dir, 'manifest_symbols.h');
    const sourceOut = join(dir, 'manifest_symbols.cpp');

    const result = await runCli([
      'symbols',
      '--source',
      fileURLToPath(source),
      '--header-out',
      headerOut,
      '--source-out',
      sourceOut,
    ]);

    expect(result.exitCode).toBe(0);
    expect(readFileSync(headerOut, 'utf8')).toBe(expectedHeader);
    expect(readFileSync(sourceOut, 'utf8')).toBe(expectedSource);
  });

  it('firmware prebuild script emits manifest data and symbol artifacts from the real firmware manifest', () => {
    const projectDir = fileURLToPath(new URL('../../../firmware/esp32', import.meta.url));
    const scriptPath = fileURLToPath(new URL('../../../firmware/esp32/tools/embed_manifest.py', import.meta.url));
    const expectedHeader = readFileSync(new URL('../../../firmware/esp32/src/manifest_symbols.h', import.meta.url), 'utf8');
    const expectedSource = readFileSync(new URL('../../../firmware/esp32/src/manifest_symbols.cpp', import.meta.url), 'utf8');
    const pythonArgs = process.platform === 'win32' ? ['-3'] : [];
    const bootstrap = [
      'from pathlib import Path',
      'import sys',
      'script = Path(sys.argv[1])',
      'project_dir = sys.argv[2]',
      'globals_dict = {',
      '  "__name__": "__main__",',
      '  "__file__": str(script),',
      '  "env": {"PROJECT_DIR": project_dir},',
      '  "Import": lambda *_args, **_kwargs: None,',
      '}',
      'exec(compile(script.read_text(), str(script), "exec"), globals_dict)',
    ].join('\n');

    const result = spawnSync(
      process.platform === 'win32' ? 'py' : 'python3',
      [...pythonArgs, '-c', bootstrap, scriptPath, projectDir],
      { encoding: 'utf8', cwd: projectDir },
    );

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('manifest_data.h');
    expect(result.stdout).toContain('manifest_symbols.h');
    expect(result.stdout).toContain('manifest_symbols.cpp');
    expect(readFileSync(new URL('../../../firmware/esp32/src/manifest_symbols.h', import.meta.url), 'utf8')).toBe(expectedHeader);
    expect(readFileSync(new URL('../../../firmware/esp32/src/manifest_symbols.cpp', import.meta.url), 'utf8')).toBe(expectedSource);
  });
});
