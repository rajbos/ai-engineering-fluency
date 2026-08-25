#!/usr/bin/env node

/**
 * Localization Validation Script
 *
 * Ensures that whenever the VS Code extension's localization keys change, all
 * locale files (package.nls.<locale>.json) stay in sync with the base
 * package.nls.json, and that every key referenced from source/package.json
 * actually exists in the base file. Run as part of CI to catch missing
 * translations before merge.
 */

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const vscodeExtDir = path.join(repoRoot, 'vscode-extension');
const srcDir = path.join(vscodeExtDir, 'src');
const basePackageJsonPath = path.join(vscodeExtDir, 'package.json');
const baseNlsPath = path.join(vscodeExtDir, 'package.nls.json');

// Resolve node_modules from the CWD (where npm runs this script from)
const cwdNodeModules = path.join(process.cwd(), 'node_modules');

let parseJsonc;
try {
  const jsoncParser = require(path.join(cwdNodeModules, 'jsonc-parser'));
  parseJsonc = (content) => {
    const errors = [];
    const result = jsoncParser.parse(content, errors, { allowTrailingComma: true });
    if (errors.length > 0) {
      const error = errors[0];
      throw new Error(`${jsoncParser.printParseErrorCode(error.error)} at position ${error.offset}`);
    }
    return result;
  };
} catch (e) {
  const stripJsonComments = require(path.join(cwdNodeModules, 'strip-json-comments'));
  parseJsonc = (content) => JSON.parse(stripJsonComments(content));
}

/** Recursively collect files under `dir` matching `extensions`, skipping test/output folders. */
function collectFiles(dir, extensions) {
  const results = [];
  const skipDirs = new Set(['node_modules', 'out', 'dist', '.vscode-test', 'test']);
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (skipDirs.has(entry.name)) { continue; }
      results.push(...collectFiles(path.join(dir, entry.name), extensions));
    } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
      results.push(path.join(dir, entry.name));
    }
  }
  return results;
}

/** Extract l10n.t('key' ...) / vscode.l10n.t('key' ...) keys referenced from TS source. */
function findUsedKeysInSource() {
  const keys = new Set();
  const pattern = /\bl10n\.t\(\s*['"]([^'"]+)['"]/g;
  for (const file of collectFiles(srcDir, ['.ts'])) {
    if (file.endsWith('.test.ts')) { continue; }
    const content = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = pattern.exec(content)) !== null) {
      keys.add(match[1]);
    }
  }
  return keys;
}

/** Extract %key% placeholders referenced from package.json (contribution point strings). */
function findUsedKeysInPackageJson() {
  const keys = new Set();
  const content = fs.readFileSync(basePackageJsonPath, 'utf8');
  const pattern = /%([a-zA-Z0-9_.]+)%/g;
  let match;
  while ((match = pattern.exec(content)) !== null) {
    keys.add(match[1]);
  }
  return keys;
}

/** True if a string looks like it contains translatable prose (not just symbols/numbers). */
function looksTranslatable(value) {
  return typeof value === 'string' && /[A-Za-z]{2,}/.test(value);
}

function main() {
  console.log('🔍 Validating VS Code extension localization files...\n');

  const errors = [];
  const warnings = [];

  const baseNls = parseJsonc(fs.readFileSync(baseNlsPath, 'utf8'));
  const baseKeys = new Set(Object.keys(baseNls));

  // 1. Every key referenced from source/package.json must exist in the base file.
  const usedKeys = new Set([...findUsedKeysInSource(), ...findUsedKeysInPackageJson()]);
  for (const key of usedKeys) {
    if (!baseKeys.has(key)) {
      errors.push(`Key "${key}" is referenced but missing from package.nls.json`);
    }
  }

  // 2. Every locale file must define a translation for every base key.
  const localeFiles = fs.readdirSync(vscodeExtDir)
    .filter((f) => /^package\.nls\.[a-z0-9-]+\.json$/i.test(f))
    .sort();

  if (localeFiles.length === 0) {
    warnings.push('No package.nls.<locale>.json files found — nothing to compare against the base file.');
  }

  for (const localeFile of localeFiles) {
    const locale = localeFile.replace(/^package\.nls\.|\.json$/g, '');
    const localePath = path.join(vscodeExtDir, localeFile);
    const localeData = parseJsonc(fs.readFileSync(localePath, 'utf8'));
    const localeKeys = new Set(Object.keys(localeData));

    const missing = [...baseKeys].filter((k) => !localeKeys.has(k));
    for (const key of missing) {
      errors.push(`[${locale}] Missing translation for key "${key}" (present in package.nls.json)`);
    }

    const extra = [...localeKeys].filter((k) => !baseKeys.has(k));
    for (const key of extra) {
      warnings.push(`[${locale}] Stale key "${key}" is not present in package.nls.json`);
    }

    for (const key of localeKeys) {
      if (!baseKeys.has(key)) { continue; }
      const localeValue = localeData[key];
      const baseValue = baseNls[key];
      if (looksTranslatable(baseValue) && localeValue === baseValue) {
        warnings.push(`[${locale}] Key "${key}" looks untranslated (identical to English)`);
      }
      if (typeof localeValue === 'string' && localeValue.trim().length === 0) {
        errors.push(`[${locale}] Key "${key}" has an empty translation`);
      }
    }
  }

  // Print results
  if (warnings.length > 0) {
    console.log(`⚠️  ${warnings.length} warning(s):`);
    for (const w of warnings) { console.log(`   - ${w}`); }
    console.log('');
  }

  if (errors.length > 0) {
    console.error(`❌ ${errors.length} error(s):`);
    for (const e of errors) { console.error(`   - ${e}`); }
    console.error('\n❌ Localization validation failed!\n');
    process.exit(1);
  }

  console.log('✅ All localization keys are in sync!\n');
  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { findUsedKeysInSource, findUsedKeysInPackageJson };
