/**
 * Orchestration for the Dark Factory readiness scan.
 *
 * Turns a list of workspace paths into a {@link DarkFactoryReport}: it decides
 * which paths are repositories worth scanning, collects the filesystem tier
 * (`src/darkFactorySignals.ts`), joins whatever GitHub evidence the extension
 * has *already* fetched, and hands the result to the pure scorer
 * (`src/darkFactoryReadiness.ts`).
 *
 * It issues no network calls of its own. The only GitHub-derived signal it
 * uses is the pull-request statistics the Usage Analysis view already loads,
 * so opening the readiness section costs no extra API requests and cannot slow
 * the existing views down. Everything else in the API tier stays `unknown`,
 * which is the honest state for evidence nothing looked at.
 */
import * as path from 'path';
import {
	agentPullRequestObservation,
	buildDarkFactoryReport,
	scoreDarkFactoryReadiness,
	type DarkFactoryPrStats,
	type DarkFactoryRepoSignals,
} from '../../src/darkFactoryReadiness';
import { collectDarkFactoryFileSignals, isGitRepoRoot, readGitOriginUrl } from '../../src/darkFactorySignals';
import type { DarkFactoryReport } from '../../src/types';
import { buildGitHubHosts, parseGitHubRemote, type RepoPrStatsResult } from './githubPrService';

/**
 * Repositories scanned per run. The filesystem tier is cheap per repository,
 * but a workspace can contribute hundreds of paths, so the scan is bounded and
 * reports how many it skipped rather than silently truncating.
 */
export const MAX_SCANNED_REPOS = 25;

/** Resolve `owner/repo` from a repository's `origin` remote, when it is a GitHub one. */
function resolveNameWithOwner(repoRoot: string, hosts: Set<string>): string | undefined {
	const origin = readGitOriginUrl(repoRoot);
	if (!origin) { return undefined; }
	const parsed = parseGitHubRemote(origin, hosts);
	return parsed ? `${parsed.owner}/${parsed.repo}` : undefined;
}

/**
 * Reduce the caller's workspace paths to distinct git repository roots, keeping
 * the caller's ordering so the paths it considers most relevant survive the cap.
 */
export function selectRepoRoots(workspacePaths: readonly string[]): { roots: string[]; skipped: number } {
	const seen = new Set<string>();
	const roots: string[] = [];
	let eligible = 0;
	for (const workspacePath of workspacePaths) {
		if (!workspacePath || workspacePath.startsWith('<unresolved:')) { continue; }
		const resolved = path.resolve(workspacePath);
		if (seen.has(resolved)) { continue; }
		seen.add(resolved);
		if (!isGitRepoRoot(resolved)) { continue; }
		eligible++;
		if (roots.length < MAX_SCANNED_REPOS) { roots.push(resolved); }
	}
	return { roots, skipped: eligible - roots.length };
}

/** Index the already-fetched pull-request statistics by `owner/repo` for a cheap join. */
export function indexPrStats(prStats: RepoPrStatsResult | undefined): Map<string, DarkFactoryPrStats> {
	const index = new Map<string, DarkFactoryPrStats>();
	if (!prStats?.authenticated) { return index; }
	for (const repo of prStats.repos) {
		index.set(`${repo.owner}/${repo.repo}`.toLowerCase(), {
			totalPrs: repo.totalPrs,
			aiAuthoredPrs: repo.aiAuthoredPrs,
			error: repo.error,
		});
	}
	return index;
}

/** Options for {@link scanDarkFactoryReadiness}. */
export interface DarkFactoryScanOptions {
	/** Candidate paths, most relevant first — only git repository roots are scanned. */
	workspacePaths: readonly string[];
	/** Pull-request statistics already fetched by the Usage Analysis view, when available. */
	prStats?: RepoPrStatsResult;
	/** Configured GitHub Enterprise URI, so enterprise remotes resolve to `owner/repo` too. */
	enterpriseUri?: string;
	/** Injected clock, for deterministic tests. */
	now?: () => Date;
}

/**
 * Run the readiness scan across the caller's workspace paths.
 *
 * Synchronous filesystem work only — no `git` subprocesses and no HTTP — so it
 * is safe to run while building a webview's initial payload.
 */
export function scanDarkFactoryReadiness(options: DarkFactoryScanOptions): DarkFactoryReport {
	const { roots, skipped } = selectRepoRoots(options.workspacePaths);
	const hosts = buildGitHubHosts(options.enterpriseUri);
	const prIndex = indexPrStats(options.prStats);

	const reports = roots.map(repoRoot => {
		const { observations, facts } = collectDarkFactoryFileSignals(repoRoot);
		const nameWithOwner = resolveNameWithOwner(repoRoot, hosts);
		const prObservation = agentPullRequestObservation(nameWithOwner ? prIndex.get(nameWithOwner.toLowerCase()) : undefined);

		const signals: DarkFactoryRepoSignals = {
			name: path.basename(repoRoot),
			repoRoot,
			nameWithOwner,
			observations: { ...observations, 'agent-authored-pull-requests': prObservation },
			facts,
		};
		return scoreDarkFactoryReadiness(signals);
	});

	return buildDarkFactoryReport(reports, {
		scannedAt: (options.now?.() ?? new Date()).toISOString(),
		apiSignalsIncluded: prIndex.size > 0,
		skippedRepoCount: skipped,
	});
}
