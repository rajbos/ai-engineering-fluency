#!/usr/bin/env node
'use strict';

// Preview: node scripts/cleanup-test-fixtures.js
// Delete:  node scripts/cleanup-test-fixtures.js --apply
const fs = require('node:fs');
const path = require('node:path');

const fixtureName = /^(?:ctt-snapshot(?:-test)?|pi-test)-[A-Za-z0-9]{6}$/;

function cleanupTestFixtures(root, apply = false) {
  const targets = fs.readdirSync(root, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && fixtureName.test(entry.name))
    .map(entry => path.join(root, entry.name))
    .filter(dir => !fs.existsSync(path.join(dir, '.git')));

  if (apply) {
    for (const dir of targets) {
      fs.rmSync(dir, { recursive: true, force: true, maxRetries: 3 });
    }
  }
  return targets;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.some(arg => arg !== '--apply')) {
    console.error('Usage: node scripts/cleanup-test-fixtures.js [--apply]');
    process.exitCode = 1;
  } else {
    const apply = args.includes('--apply');
    const root = path.resolve(__dirname, '..', 'vscode-extension');
    const targets = cleanupTestFixtures(root, apply);
    for (const dir of targets) {
      console.log(`${apply ? 'Removed' : 'Would remove'} ${dir}`);
    }
    console.log(`${targets.length} fixture directories ${apply ? 'removed' : 'found (dry run; use --apply to remove)'}.`);
  }
}

module.exports = { cleanupTestFixtures };
