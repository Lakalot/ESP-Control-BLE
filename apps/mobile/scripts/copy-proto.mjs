#!/usr/bin/env node
// Copies the pbjs-generated TS module from the Plan A toolchain into the
// mobile app. Runs in CI (pre-test) and as a one-shot after `pnpm proto:gen:ts`
// in the tools workspace. Keeping the file physically copied (not symlinked)
// keeps Metro bundler happy on Windows.
import { copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..', '..', '..');
const src = resolve(repoRoot, 'tools', 'manifest', 'src', 'generated');
const dst = resolve(here, '..', 'src', 'manifest', 'generated');

for (const name of ['manifest.pbjs.js', 'manifest.pbjs.d.ts']) {
  const from = resolve(src, name);
  const to = resolve(dst, name);
  if (!existsSync(from)) {
    console.error(`[copy-proto] missing ${from}; run pnpm proto:gen:ts in tools/manifest first`);
    process.exit(1);
  }
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(from, to);
  console.log(`[copy-proto] ${name}`);
}
