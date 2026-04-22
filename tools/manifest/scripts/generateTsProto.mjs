import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pbjs = require.resolve('protobufjs-cli/bin/pbjs');
const pbts = require.resolve('protobufjs-cli/bin/pbts');

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PROTO = resolve(ROOT, '../../proto/manifest.proto');
const OUT_JS = resolve(ROOT, 'src/generated/manifest.pbjs.js');
const OUT_DTS = resolve(ROOT, 'src/generated/manifest.pbjs.d.ts');

mkdirSync(dirname(OUT_JS), { recursive: true });

run(process.execPath, [pbjs, '-t', 'static-module', '-w', 'es6', '-o', OUT_JS, PROTO]);       

// Fix protobufjs ESM issue
let jsContent = readFileSync(OUT_JS, 'utf8');

// Replace import * as $protobuf with import $protobuf
jsContent = jsContent.replace(
  'import * as $protobuf from "protobufjs/minimal";',
  'import $protobuf from "protobufjs/minimal.js";'
);

// Fix $root assignment
jsContent = jsContent.replace(
  'const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});',
  'const $root = {};'
);

// Ensure aliases work with default import
jsContent = jsContent.replace(
  'const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;',
  'const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util || $protobuf.default.util;'
);

writeFileSync(OUT_JS, jsContent);

run(process.execPath, [pbts, '-o', OUT_DTS, OUT_JS]);

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
