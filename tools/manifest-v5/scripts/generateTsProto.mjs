import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pbjs = require.resolve('protobufjs-cli/bin/pbjs');
const pbts = require.resolve('protobufjs-cli/bin/pbts');

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PROTO = resolve(ROOT, '../../proto/manifest_v5.proto');
const OUT_JS = resolve(ROOT, 'src/generated/manifest_v5.pbjs.js');
const OUT_DTS = resolve(ROOT, 'src/generated/manifest_v5.pbjs.d.ts');

mkdirSync(dirname(OUT_JS), { recursive: true });

run(process.execPath, [pbjs, '-t', 'static-module', '-w', 'es6', '-o', OUT_JS, PROTO]);       
run(process.execPath, [pbts, '-o', OUT_DTS, OUT_JS]);

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
