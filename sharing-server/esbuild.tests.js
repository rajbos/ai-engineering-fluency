/**
 * Bundles the sharing-server unit tests (src/test/*.test.ts) into out/test/ so
 * they can be run with `node --test "out/test/*.test.js"`.
 *
 * Uses the same esbuild setup as the main server build (esbuild.js) so the
 * tests exercise the modules exactly as they are shipped (CJS bundle,
 * node:sqlite external).
 */
const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

async function main() {
  const testDir = path.join(__dirname, 'src', 'test');
  const entryPoints = fs
    .readdirSync(testDir)
    .filter((f) => f.endsWith('.test.ts'))
    .map((f) => path.join(testDir, f));

  if (entryPoints.length === 0) {
    throw new Error(`No *.test.ts files found in ${testDir}`);
  }

  await esbuild.build({
    entryPoints,
    bundle: true,
    outdir: path.join(__dirname, 'out', 'test'),
    format: 'cjs',
    platform: 'node',
    target: 'node22',
    sourcemap: true,
    external: ['node:sqlite'],
    logLevel: 'info',
  });
  console.log(`Sharing-server tests bundled successfully (${entryPoints.length} file(s))`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
