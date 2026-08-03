/**
 * scripts/check-version.mjs
 * Fails if public manifests drift from package.json version.
 * Run via: bun run check:version
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf-8'));
const expected = pkg.version;

const manifests = ['public/manifest.json', 'public/manifest.firefox.json'];
let failed = false;

for (const rel of manifests) {
  const manifest = JSON.parse(readFileSync(resolve(root, rel), 'utf-8'));
  if (manifest.version !== expected) {
    console.error(
      `❌ ${rel} has version "${manifest.version}" but package.json is "${expected}".`,
    );
    failed = true;
  } else {
    console.log(`✅ ${rel} → ${manifest.version}`);
  }
}

if (failed) {
  console.error('Version drift detected. Update the manifest(s) before shipping.');
  process.exit(1);
}
console.log('✅ Versions in sync.');
