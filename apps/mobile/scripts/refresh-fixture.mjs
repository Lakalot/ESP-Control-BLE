import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const TOOL_DIR = resolve(ROOT, '../tools/manifest');
const SOURCE_MANIFEST = resolve(TOOL_DIR, 'tests/fixtures/demo.manifest.ts');
const TARGET_PB = resolve(ROOT, 'assets/manifest_demo.pb');

mkdirSync(dirname(TARGET_PB), { recursive: true });

console.log('Compiling v5 demo fixture...');
// Use npx tsx directly
const result = spawnSync('npx', [
  'tsx',
  'src/cli/main.ts',
  'compile',
  '--source', SOURCE_MANIFEST,
  '--out', TARGET_PB
], {
  cwd: TOOL_DIR,
  stdio: 'inherit',
  shell: true
});

if (result.status !== 0) {
  console.error(`Failed to compile fixture with exit code ${result.status}`);
  if (result.error) console.error(result.error);
  process.exit(result.status ?? 1);
}

console.log(`Fixture updated at ${TARGET_PB}`);
