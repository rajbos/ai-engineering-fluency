#!/usr/bin/env node
/**
 * Localization validation for the VS Code extension.
 *
 * Detects the failure mode where VS Code shows raw localization keys
 * (e.g. "statusBar.loadingText", "nav.btnRefresh") instead of translated
 * text:
 *
 *   1. package.nls.json must parse as strict JSON (VS Code's l10n loader
 *      does not tolerate comments or trailing commas).
 *   2. Every %key% reference in package.json must exist in package.nls.json.
 *   3. Every l10n.t('key') call in src/** must exist in package.nls.json.
 *   4. Every locale file (package.nls.<locale>.json) must parse strictly and
 *      contain every key from the base bundle.
 *   5. --vsix mode: the packaged VSIX must contain extension/package.nls.json
 *      whose strict-parsed contents satisfy the packaged package.json's
 *      %key% references.
 *
 * Usage:
 *   node scripts/validate-l10n.mjs
 *   node scripts/validate-l10n.mjs --vsix path/to/ai-engineering-fluency-x.y.z.vsix
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const extRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warnings = [];

function strictParseJson(content, label) {
	try {
		return JSON.parse(content);
	} catch (err) {
		errors.push(`${label}: not strict JSON — ${err.message}`);
		return null;
	}
}

function collectStringValues(value, out = []) {
	if (typeof value === 'string') {
		out.push(value);
	} else if (Array.isArray(value)) {
		for (const item of value) { collectStringValues(item, out); }
	} else if (value && typeof value === 'object') {
		for (const item of Object.values(value)) { collectStringValues(item, out); }
	}
	return out;
}

function extractPercentKeys(jsonValue) {
	const keys = new Set();
	for (const s of collectStringValues(jsonValue)) {
		for (const match of s.matchAll(/%([A-Za-z0-9_.-]+)%/g)) {
			keys.add(match[1]);
		}
	}
	return keys;
}

function extractCodeKeys(dir) {
	const keys = new Set();
	const pattern = /(?:vscode\.)?l10n\.t\(\s*['"]([^'"]+)['"]/g;
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			for (const k of extractCodeKeys(full)) { keys.add(k); }
		} else if (entry.name.endsWith('.ts')) {
			const content = fs.readFileSync(full, 'utf8');
			for (const match of content.matchAll(pattern)) {
				keys.add(match[1]);
			}
		}
	}
	return keys;
}

function checkKeysAgainstBundle(keys, bundle, sourceLabel, bundleLabel) {
	for (const key of keys) {
		if (!(key in bundle)) {
			errors.push(`${sourceLabel} references key '${key}' which is missing from ${bundleLabel}`);
		}
	}
}

function validateSourceTree() {
	const basePath = path.join(extRoot, 'package.nls.json');
	const base = strictParseJson(fs.readFileSync(basePath, 'utf8'), 'package.nls.json');
	if (!base) { return null; }

	// Locale files must parse strictly and cover every base key.
	for (const file of fs.readdirSync(extRoot)) {
		if (!/^package\.nls\..+\.json$/.test(file)) { continue; }
		const locale = strictParseJson(fs.readFileSync(path.join(extRoot, file), 'utf8'), file);
		if (!locale) { continue; }
		for (const key of Object.keys(base)) {
			if (!(key in locale)) {
				errors.push(`${file}: missing translation for key '${key}'`);
			}
		}
		for (const key of Object.keys(locale)) {
			if (!(key in base)) {
				warnings.push(`${file}: key '${key}' has no entry in package.nls.json`);
			}
		}
	}

	// %key% references in package.json must resolve.
	const pkg = JSON.parse(fs.readFileSync(path.join(extRoot, 'package.json'), 'utf8'));
	checkKeysAgainstBundle(extractPercentKeys(pkg), base, 'package.json', 'package.nls.json');

	// l10n.t('key') calls in TypeScript sources must resolve.
	checkKeysAgainstBundle(extractCodeKeys(path.join(extRoot, 'src')), base, 'TypeScript sources', 'package.nls.json');

	return base;
}

/** Minimal ZIP reader: enough to list entries and extract stored/deflate files from a VSIX. */
function readZipEntries(filePath) {
	const buf = fs.readFileSync(filePath);
	let eocd = -1;
	for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) {
		if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
	}
	if (eocd < 0) { throw new Error('not a ZIP file (no end-of-central-directory record)'); }
	const count = buf.readUInt16LE(eocd + 10);
	let offset = buf.readUInt32LE(eocd + 16);
	const entries = new Map();
	for (let i = 0; i < count; i++) {
		if (buf.readUInt32LE(offset) !== 0x02014b50) { break; }
		const nameLen = buf.readUInt16LE(offset + 28);
		const extraLen = buf.readUInt16LE(offset + 30);
		const commentLen = buf.readUInt16LE(offset + 32);
		const name = buf.toString('utf8', offset + 46, offset + 46 + nameLen);
		entries.set(name, {
			method: buf.readUInt16LE(offset + 10),
			compressedSize: buf.readUInt32LE(offset + 20),
			localOffset: buf.readUInt32LE(offset + 42)
		});
		offset += 46 + nameLen + extraLen + commentLen;
	}
	return { buf, entries };
}

function extractZipEntryText(buf, entry) {
	const o = entry.localOffset;
	const nameLen = buf.readUInt16LE(o + 26);
	const extraLen = buf.readUInt16LE(o + 28);
	const start = o + 30 + nameLen + extraLen;
	const data = buf.subarray(start, start + entry.compressedSize);
	if (entry.method === 0) { return data.toString('utf8'); }
	if (entry.method === 8) { return zlib.inflateRawSync(data).toString('utf8'); }
	throw new Error(`unsupported ZIP compression method ${entry.method}`);
}

function validateVsix(vsixPath, baseKeys) {
	if (!fs.existsSync(vsixPath)) {
		errors.push(`--vsix: file not found: ${vsixPath}`);
		return;
	}
	let zip;
	try {
		zip = readZipEntries(vsixPath);
	} catch (err) {
		errors.push(`--vsix: failed to read ${vsixPath} — ${err.message}`);
		return;
	}
	const nlsEntry = zip.entries.get('extension/package.nls.json');
	const pkgEntry = zip.entries.get('extension/package.json');
	if (!nlsEntry) {
		errors.push('VSIX is missing extension/package.nls.json — VS Code would show raw localization keys at runtime');
	}
	if (!pkgEntry) {
		errors.push('VSIX is missing extension/package.json');
	}
	if (!nlsEntry || !pkgEntry) { return; }

	const packagedNls = strictParseJson(extractZipEntryText(zip.buf, nlsEntry), 'VSIX extension/package.nls.json');
	const packagedPkg = strictParseJson(extractZipEntryText(zip.buf, pkgEntry), 'VSIX extension/package.json');
	if (!packagedNls || !packagedPkg) { return; }

	checkKeysAgainstBundle(extractPercentKeys(packagedPkg), packagedNls, 'packaged package.json', 'packaged package.nls.json');
	for (const key of baseKeys) {
		if (!(key in packagedNls)) {
			errors.push(`packaged package.nls.json lost key '${key}' that exists in the source bundle`);
		}
	}
}

function main() {
	const vsixIndex = process.argv.indexOf('--vsix');
	const vsixPath = vsixIndex >= 0 ? process.argv[vsixIndex + 1] : undefined;

	const base = validateSourceTree();
	if (vsixPath && base) {
		validateVsix(path.resolve(vsixPath), Object.keys(base));
	}

	for (const warning of warnings) { console.warn(`⚠️  ${warning}`); }
	if (errors.length > 0) {
		for (const error of errors) { console.error(`❌ ${error}`); }
		console.error(`\n${errors.length} localization error(s) found.`);
		process.exit(1);
	}
	console.log(`✅ Localization validation passed (${base ? Object.keys(base).length : 0} keys in package.nls.json${vsixPath ? ', VSIX contents verified' : ''}).`);
}

main();
