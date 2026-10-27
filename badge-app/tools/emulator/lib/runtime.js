'use strict';

/**
 * The badger.github.io simulator runtime: where it comes from, where it is
 * cached, and the two pieces of its source the emulator has to reproduce
 * (the firmware compatibility prelude and the decorator rewrite).
 *
 * Everything is fetched from the commit pinned in ../runtime.json, so the
 * runtime only changes when that file does.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

const PIN_FILE = path.join(__dirname, '..', 'runtime.json');
const COMPAT_SOURCE = 'src/lib/badge-firmware-compat.ts';

function readPin(file = PIN_FILE) {
	const pin = JSON.parse(fs.readFileSync(file, 'utf8'));
	if (typeof pin.repository !== 'string' || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(pin.repository)) {
		throw new Error(`${file}: repository must be "owner/name"`);
	}
	if (typeof pin.revision !== 'string' || !/^[0-9a-f]{40}$/.test(pin.revision)) {
		throw new Error(`${file}: revision must be a full 40-character commit SHA`);
	}
	return { repository: pin.repository, revision: pin.revision };
}

/** `BADGE_EMULATOR_CACHE`, else ~/.cache/ai-fluency-badge-emulator, one folder per revision. */
function cacheRoot(pin, env = process.env) {
	const base = env.BADGE_EMULATOR_CACHE || path.join(os.homedir(), '.cache', 'ai-fluency-badge-emulator');
	return path.join(base, pin.revision);
}

/**
 * A runtime path requested by the page or the worker, relative to the site's
 * public/simulator/ folder. Only plain segments are accepted, so a request can
 * never name a file outside the cache or a different place in the repository.
 */
function safeRuntimePath(rel) {
	const parts = String(rel).split('/');
	if (parts.length === 0 || parts.length > 8 || parts.some((p) => !/^[A-Za-z0-9_][A-Za-z0-9_.-]*$/.test(p) || p.includes('..'))) {
		return null;
	}
	return parts.join('/');
}

function rawUrl(pin, repoPath) {
	return `https://raw.githubusercontent.com/${pin.repository}/${pin.revision}/${repoPath}`;
}

/**
 * Returns the cached copy of a repository file, downloading it on first use.
 * Resolves to null when the file does not exist at the pinned revision.
 */
async function fetchCached(pin, repoPath, root, fetchImpl = fetch) {
	const file = path.join(root, ...repoPath.split('/'));
	if (fs.existsSync(file)) { return fs.readFileSync(file); }
	const response = await fetchImpl(rawUrl(pin, repoPath));
	if (response.status === 404) { return null; }
	if (!response.ok) { throw new Error(`GET ${repoPath} at ${pin.revision.slice(0, 7)} failed: HTTP ${response.status}`); }
	const data = Buffer.from(await response.arrayBuffer());
	fs.mkdirSync(path.dirname(file), { recursive: true });
	// Write then rename, so an interrupted download never leaves a truncated file in the cache.
	const partial = `${file}.${process.pid}.partial`;
	fs.writeFileSync(partial, data);
	fs.renameSync(partial, file);
	return data;
}

function fetchRuntimeFile(pin, rel, root, fetchImpl) {
	const safe = safeRuntimePath(rel);
	if (!safe) { return Promise.resolve(null); }
	return fetchCached(pin, `public/simulator/${safe}`, path.join(root, 'simulator'), fetchImpl);
}

/**
 * Pulls the MicroPython text out of `export const firmwareCompat = \`...\``.
 *
 * The source is parsed rather than evaluated: it is downloaded text, so it is
 * never run as JavaScript. A template literal with an interpolation or an
 * escape this does not know is refused instead of guessed at.
 */
function extractFirmwareCompat(source) {
	const opener = 'export const firmwareCompat = `';
	const start = source.indexOf(opener);
	if (start < 0) { throw new Error('firmwareCompat export not found in the simulator source'); }
	const escapes = { '\\': '\\', '`': '`', $: '$', n: '\n', t: '\t' };
	let out = '';
	for (let i = start + opener.length; i < source.length; i++) {
		const ch = source[i];
		if (ch === '`') { return out; }
		if (ch === '$' && source[i + 1] === '{') { throw new Error('firmwareCompat has an interpolation; update the extractor'); }
		if (ch === '\\') {
			const next = source[++i];
			if (!(next in escapes)) { throw new Error(`firmwareCompat uses an unsupported escape \\${next}`); }
			out += escapes[next];
			continue;
		}
		out += ch;
	}
	throw new Error('firmwareCompat template literal is not terminated');
}

async function loadFirmwareCompat(pin, root, fetchImpl) {
	const data = await fetchCached(pin, COMPAT_SOURCE, path.join(root, 'source'), fetchImpl);
	if (!data) { throw new Error(`${COMPAT_SOURCE} does not exist at ${pin.revision}`); }
	return extractFirmwareCompat(data.toString('utf8'));
}

/**
 * Port of `simulationSource` in the site's src/lib/badge-editor-project.ts: the
 * simulator cannot compile native or viper code, so those decorators are
 * swapped for the editor_support stand-ins. Lines inside strings are left alone.
 */
function simulationSource(source) {
	let quote = '';
	let triple = false;
	let escaped = false;
	return source.split('\n').map((line) => {
		const result = !quote ? line.replace(/^(\s*)@micropython\.(native|viper)\s*$/, '$1@editor_support.$2') : line;
		for (let index = 0; index < line.length; index++) {
			const character = line[index];
			if (escaped) { escaped = false; continue; }
			if (character === '\\') { escaped = true; continue; }
			if (quote) {
				if (character === quote && (!triple || line.slice(index, index + 3) === quote.repeat(3))) {
					if (triple) { index += 2; }
					quote = '';
					triple = false;
				}
			} else if (character === '#') {
				break;
			} else if (character === '"' || character === "'") {
				quote = character;
				triple = line.slice(index, index + 3) === character.repeat(3);
				if (triple) { index += 2; }
			}
		}
		if (!triple && !escaped) { quote = ''; }
		escaped = false;
		return result;
	}).join('\n');
}

module.exports = {
	cacheRoot,
	extractFirmwareCompat,
	fetchRuntimeFile,
	loadFirmwareCompat,
	readPin,
	safeRuntimePath,
	simulationSource,
};
