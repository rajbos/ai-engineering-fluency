/**
 * Reads the extension's What's New catalog and resolves its localization keys.
 *
 * `vscode-extension/src/whatsNew/catalog.ts` is deliberately a pure module —
 * no `vscode` import, no side effects — so the cheapest correct way to read it
 * is to transpile it and run it, rather than to pattern-match its source. That
 * keeps this file honest when the catalog's shape changes: a renamed field
 * becomes a type error here instead of a silently empty regex match.
 *
 * The catalog is the right source for a release video (and the CHANGELOG is
 * not) because it is already written for a user rather than for someone
 * reading a diff, and because every feature names the exact `view` + `tab` it
 * added — which is precisely the screenshot the video needs.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as vm from 'node:vm';

import { REPO_ROOT } from './util';

export interface CatalogFeature {
	readonly id: string;
	readonly titleKey: string;
	readonly descriptionKey: string;
	readonly kind: 'view' | 'tab' | 'section';
	readonly surface: { readonly view: string; readonly tab?: string; readonly anchor?: string };
}

export interface CatalogRelease {
	readonly version: string;
	readonly date: string | null;
	readonly headlineKey: string;
	readonly features: readonly CatalogFeature[];
}

export interface ResolvedFeature extends CatalogFeature {
	readonly title: string;
	readonly description: string;
}

export interface ResolvedRelease {
	readonly version: string;
	readonly date: string | null;
	readonly headline: string;
	readonly features: readonly ResolvedFeature[];
	/**
	 * Set when the video covers several releases: the last version an earlier
	 * video already covered. Everything after it, up to `version`, is included.
	 */
	readonly since?: string;
	/** The catalog versions merged into `features`, newest first. */
	readonly covers?: readonly string[];
}

const CATALOG_FILE = path.join(REPO_ROOT, 'vscode-extension', 'src', 'whatsNew', 'catalog.ts');
const NLS_FILE = path.join(REPO_ROOT, 'vscode-extension', 'package.nls.json');

/**
 * Transpiles and evaluates the catalog module.
 *
 * `typescript` is resolved lazily so that the rest of the pipeline (rendering
 * an already-planned manifest) works without it.
 */
function evaluateCatalog(): readonly CatalogRelease[] {
	if (!fs.existsSync(CATALOG_FILE)) {
		throw new Error(`catalog not found at ${CATALOG_FILE}`);
	}

	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const ts = require('typescript') as typeof import('typescript');
	const source = fs.readFileSync(CATALOG_FILE, 'utf8');
	const transpiled = ts.transpileModule(source, {
		compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
		fileName: 'catalog.ts',
	}).outputText;

	// The catalog imports nothing, so the sandbox needs no `require`. Anything
	// that tried to reach for one would throw here rather than get host access.
	const moduleShim = { exports: {} as Record<string, unknown> };
	const context = vm.createContext({ module: moduleShim, exports: moduleShim.exports });
	new vm.Script(transpiled, { filename: 'catalog.ts' }).runInContext(context, { timeout: 5000 });

	const releases = moduleShim.exports.WHATS_NEW_RELEASES;
	if (!Array.isArray(releases)) {
		throw new Error('catalog.ts did not export WHATS_NEW_RELEASES as an array');
	}
	return releases as readonly CatalogRelease[];
}

function loadNls(): Record<string, string> {
	return JSON.parse(fs.readFileSync(NLS_FILE, 'utf8')) as Record<string, string>;
}

/** Every release in the catalog, newest first. */
export function readCatalog(): readonly ResolvedRelease[] {
	const nls = loadNls();
	const resolve = (key: string, what: string): string => {
		const value = nls[key];
		if (typeof value !== 'string' || value.trim() === '') {
			throw new Error(`package.nls.json has no text for ${what} key "${key}"`);
		}
		return value;
	};

	return evaluateCatalog().map((release) => ({
		version: release.version,
		date: release.date,
		headline: resolve(release.headlineKey, 'headline'),
		features: release.features.map((feature) => ({
			...feature,
			title: resolve(feature.titleKey, 'feature title'),
			description: resolve(feature.descriptionKey, 'feature description'),
		})),
	}));
}

/**
 * Picks the release to make a video about.
 *
 * With no version, takes the newest entry that has any features — an entry
 * with an empty `features` list is a release that shipped nothing a user can
 * point at, which is exactly the release there is no video to make about.
 */
export function selectRelease(version?: string, since?: string): ResolvedRelease {
	return pickRelease(readCatalog(), version, since);
}

/**
 * `selectRelease` over a given catalog, so the range logic is testable
 * without the real one.
 *
 * With `since`, the video covers every release after that version up to and
 * including the target — the usual case when the previous video was made a
 * few releases ago, rather than for the last bump alone.
 */
export function pickRelease(releases: readonly ResolvedRelease[], version?: string, since?: string): ResolvedRelease {
	const target = version ? findRelease(releases, version) : newestWithFeatures(releases);
	if (since === undefined) { return target; }
	return mergeSince(releases, target, since);
}

function findRelease(releases: readonly ResolvedRelease[], version: string): ResolvedRelease {
	const found = releases.find((release) => release.version === version);
	if (!found) {
		throw new Error(`no catalog entry for version ${version}; have ${releases.map((r) => r.version).join(', ')}`);
	}
	return found;
}

function newestWithFeatures(releases: readonly ResolvedRelease[]): ResolvedRelease {
	const newest = releases.find((release) => release.features.length > 0);
	if (!newest) {
		throw new Error('no catalog release has any features to show');
	}
	return newest;
}

function mergeSince(releases: readonly ResolvedRelease[], target: ResolvedRelease, since: string): ResolvedRelease {
	if (!/^\d+(\.\d+){0,2}$/.test(since)) {
		throw new Error(`--since must look like 0.17 or 0.17.2, got "${since}"`);
	}
	if (compareVersions(since, target.version) >= 0) {
		throw new Error(`--since ${since} is not older than the release being covered (${target.version})`);
	}

	const covered = releases.filter((release) =>
		compareVersions(release.version, since) > 0 && compareVersions(release.version, target.version) <= 0);

	// Newest release first, keeping each release's own feature order — the
	// catalog puts the most important feature of a release at the top.
	const seen = new Set<string>();
	const features = covered
		.flatMap((release) => release.features)
		.filter((feature) => !seen.has(feature.id) && seen.add(feature.id));

	return { ...target, features, since, covers: covered.map((release) => release.version) };
}

/** Numeric comparison of dotted versions; a missing part counts as 0. */
export function compareVersions(a: string, b: string): number {
	const left = a.split('.').map(Number);
	const right = b.split('.').map(Number);
	for (let i = 0; i < Math.max(left.length, right.length); i++) {
		const difference = (left[i] ?? 0) - (right[i] ?? 0);
		if (difference !== 0) { return Math.sign(difference); }
	}
	return 0;
}
