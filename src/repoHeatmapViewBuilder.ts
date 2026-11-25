/**
 * Builds the Repository Heatmap view's payload (`window.__INITIAL_REPO_HEATMAP__`): every
 * file an agent touched, grouped by repository and folder, filterable by the standard
 * period selector.
 *
 * Pure (no `vscode`, no filesystem): hosts gather {@link RepoHeatmapSessionInput}s by running
 * `extractFileActivity()` over their session files, then call {@link buildRepoHeatmapViewData}
 * once and {@link summarizeRepoHeatmap} on every period/filter change.
 *
 * File paths stay local. This payload is for the local views only and must never be uploaded
 * (sharing-server receives numeric rollups, not paths).
 */
import type { ChartTimeWindow } from './types';
import { FILE_ACTIVITY_KINDS, type FileActivityKind, type FileTouch } from './fileActivity';
import { getTimeWindowStartDayKey } from './timeWindows';
import { toLocalDayKey } from './utils/dayKeys';
import { repoDisplayName } from './repeatedTasks';
import { isUnsafeObjectKey } from './utils/protoGuard';
import type { CodeNavTool, DetectedCodeNavTool } from './codeNavTools';

/** Per-kind counters in {@link FILE_ACTIVITY_KINDS} order: read, edited, created, deleted. */
export type KindCounts = [number, number, number, number];

/** One session's file activity plus what the builder needs to anchor it to a repository. */
export interface RepoHeatmapSessionInput {
	/** Git remote URL (or name) of the session's repository, when resolved. */
	repository?: string | null;
	/** Local workspace folder of the session; paths under it are made repository-relative. */
	workspaceFolderPath?: string | null;
	/** Local day (YYYY-MM-DD) of the session's last activity; used for touches without a timestamp. */
	fallbackDayKey: string;
	touches: FileTouch[];
}

export interface RepoHeatmapFile {
	/** Repository-relative path with `/` separators. */
	path: string;
	/** Counters per local day (YYYY-MM-DD). */
	days: Record<string, KindCounts>;
	/** Per local day, for the reads whose size the log records. Absent when none do. */
	readSizes?: Record<string, ReadSize>;
	/** True when every delete of this file was inferred from a shell command. */
	inferredDeletes?: boolean;
}

/** Characters returned to the model, and how many reads that covers. */
export type ReadSize = [chars: number, reads: number];

export interface RepoHeatmapRepo {
	key: string;
	label: string;
	files: RepoHeatmapFile[];
	/** Files dropped after {@link MAX_FILES_PER_REPO}, least-touched first. */
	truncatedFiles: number;
}

export interface RepoHeatmapViewData {
	repos: RepoHeatmapRepo[];
	/** Touches outside every session's workspace (home-dir files, other repos): not shown. */
	outsideRepoTouches: number;
	lastUpdated: string;
	hasData: boolean;
	/**
	 * Code-graph and symbol-lookup tools: the ones found set up on this machine or in an open
	 * workspace folder, and the catalog to suggest from. Set by hosts that can look; the
	 * hotspot tip falls back to generic advice without it.
	 */
	codeNavTools?: { detected: DetectedCodeNavTool[]; suggested: CodeNavTool[] };
}

export const MAX_FILES_PER_REPO = 3000;

const EMPTY_COUNTS = (): KindCounts => [0, 0, 0, 0];
const KIND_INDEX: Record<FileActivityKind, number> = { read: 0, edited: 1, created: 2, deleted: 3 };

// ── Path anchoring ───────────────────────────────────────────────────────────

function slashes(p: string): string { return p.replace(/\\/g, '/').replace(/\/+$/, ''); }

function isAbsolute(p: string): boolean { return p.startsWith('/') || /^[a-zA-Z]:\//.test(p); }

/**
 * Makes `filePath` relative to `root` (case-insensitive, as Windows drives are). Returns
 * undefined when the file lives outside the root. A relative input is taken as already
 * relative to the workspace (shell deletes are logged relative to the working directory).
 */
export function toRepoRelativePath(filePath: string, root: string | null | undefined): string | undefined {
	const p = slashes(filePath);
	if (!isAbsolute(p)) {
		const rel = p.replace(/^\.\//, '');
		// `../x` escapes the workspace.
		return rel === '..' || rel.startsWith('../') ? undefined : rel;
	}
	if (!root) { return undefined; }
	const r = slashes(root);
	if (p.toLowerCase().startsWith(`${r.toLowerCase()}/`)) { return p.slice(r.length + 1); }
	return undefined;
}

/**
 * Agent worktree layouts: the checkout lives in a per-session folder and the repository's name
 * is part of the path. `root` is the worktree folder; `repoName` the repository it belongs to.
 *   `.claude/worktrees/<repo>/<name>`, `.copilot/copilot-worktrees/<repo>/<name>`, `<repo>.worktrees/<name>`
 */
const WORKTREE_PATTERNS: RegExp[] = [
	/^(.*\/\.claude\/worktrees\/([^/]+)\/[^/]+)(?:\/|$)/i,
	/^(.*\/\.copilot\/copilot-worktrees\/([^/]+)\/[^/]+)(?:\/|$)/i,
	/^(.*\/([^/]+)\.worktrees\/[^/]+)(?:\/|$)/i,
];

/** The worktree folder and repository name of a path inside an agent worktree, else undefined. */
export function agentWorktreeInfo(filePath: string): { root: string; repoName: string } | undefined {
	const p = slashes(filePath);
	for (const pattern of WORKTREE_PATTERNS) {
		const m = pattern.exec(p);
		if (m) { return { root: m[1], repoName: m[2] }; }
	}
	return undefined;
}

interface RepoIdentity { key: string; label: string }

const nameIdentity = (repoName: string): RepoIdentity => ({ key: `name:${repoName.toLowerCase()}`, label: repoName });

function repoIdentity(session: RepoHeatmapSessionInput): RepoIdentity {
	if (session.repository) { return { key: session.repository, label: repoDisplayName(session.repository) }; }
	const folder = session.workspaceFolderPath ? slashes(session.workspaceFolderPath) : '';
	// Worktrees of a repository without a resolvable remote still belong together.
	const worktree = folder ? agentWorktreeInfo(folder) : undefined;
	if (worktree) { return nameIdentity(worktree.repoName); }
	if (folder) { return { key: folder.toLowerCase(), label: folder.split('/').pop() || folder }; }
	return { key: 'Unknown', label: 'Unknown' };
}

interface TouchTarget extends RepoIdentity { rel: string }

/**
 * Where one touch lands. A file inside an agent worktree other than the session's own folder
 * (a multi-root group folder, or a sibling worktree) belongs to that worktree's repository;
 * anything else is anchored to the session's workspace. Undefined: outside every known workspace.
 */
function resolveTouchTarget(session: RepoHeatmapSessionInput, identity: RepoIdentity, touch: FileTouch): TouchTarget | undefined {
	const abs = slashes(touch.path);
	const worktree = isAbsolute(abs) ? agentWorktreeInfo(abs) : undefined;
	const sessionRoot = session.workspaceFolderPath ? slashes(session.workspaceFolderPath).toLowerCase() : '';
	if (worktree && worktree.root.toLowerCase() !== sessionRoot) {
		return { ...nameIdentity(worktree.repoName), rel: abs.slice(worktree.root.length + 1) };
	}
	const rel = toRepoRelativePath(touch.path, session.workspaceFolderPath);
	return rel ? { ...identity, rel } : undefined;
}

// ── Payload ──────────────────────────────────────────────────────────────────

function touchDayKey(touch: FileTouch, fallback: string): string {
	return touch.ts !== undefined ? toLocalDayKey(new Date(touch.ts)) : fallback;
}

interface FileAcc { days: Record<string, KindCounts>; readSizes: Record<string, ReadSize>; inferred: number; deletes: number }

function addTouch(files: Map<string, FileAcc>, relPath: string, dayKey: string, touch: FileTouch): void {
	let acc = files.get(relPath);
	if (!acc) { acc = { days: {}, readSizes: {}, inferred: 0, deletes: 0 }; files.set(relPath, acc); }
	const counts = (acc.days[dayKey] ??= EMPTY_COUNTS());
	counts[KIND_INDEX[touch.kind]]++;
	if (touch.kind === 'read' && touch.chars) {
		const size = (acc.readSizes[dayKey] ??= [0, 0]);
		size[0] += touch.chars;
		size[1]++;
	}
	if (touch.kind === 'deleted') { acc.deletes++; if (touch.inferred) { acc.inferred++; } }
}

function totalOf(acc: FileAcc): number {
	let n = 0;
	for (const c of Object.values(acc.days)) { n += c[0] + c[1] + c[2] + c[3]; }
	return n;
}

function toRepo(key: string, label: string, files: Map<string, FileAcc>): RepoHeatmapRepo {
	const ranked = [...files.entries()].sort((a, b) => totalOf(b[1]) - totalOf(a[1]) || a[0].localeCompare(b[0]));
	const kept = ranked.slice(0, MAX_FILES_PER_REPO);
	return {
		key, label,
		files: kept.map(([path, acc]) => ({
			path,
			days: acc.days,
			...(Object.keys(acc.readSizes).length > 0 ? { readSizes: acc.readSizes } : {}),
			...(acc.deletes > 0 && acc.inferred === acc.deletes ? { inferredDeletes: true } : {}),
		})),
		truncatedFiles: ranked.length - kept.length,
	};
}

type RepoAcc = { label: string; files: Map<string, FileAcc> };

function mergeFileAcc(into: FileAcc, from: FileAcc): void {
	for (const [day, c] of Object.entries(from.days)) {
		const target = (into.days[day] ??= EMPTY_COUNTS());
		for (let i = 0; i < 4; i++) { target[i] += c[i]; }
	}
	for (const [day, [chars, reads]] of Object.entries(from.readSizes)) {
		const target = (into.readSizes[day] ??= [0, 0]);
		target[0] += chars;
		target[1] += reads;
	}
	into.inferred += from.inferred;
	into.deletes += from.deletes;
}

/**
 * Folds worktree-name repositories (no remote known) into the one remote-keyed repository whose
 * name matches, so `ai-engineering-fluency` worktrees join `owner/ai-engineering-fluency`.
 * Ambiguous names (two remotes ending the same way) stay separate rather than guess.
 */
function mergeNameKeyedRepos(repos: Map<string, RepoAcc>): void {
	for (const [key, acc] of [...repos.entries()]) {
		if (!key.startsWith('name:')) { continue; }
		const name = key.slice('name:'.length);
		const matches = [...repos.entries()].filter(([k, r]) => !k.startsWith('name:') && r.label.split('/').pop()?.toLowerCase() === name);
		if (matches.length !== 1) { continue; }
		const target = matches[0][1].files;
		for (const [path, file] of acc.files) {
			const existing = target.get(path);
			if (existing) { mergeFileAcc(existing, file); } else { target.set(path, file); }
		}
		repos.delete(key);
	}
}

/** Folds every session's touches into per-repository, per-file, per-day counters. */
export function buildRepoHeatmapViewData(sessions: RepoHeatmapSessionInput[], now: Date): RepoHeatmapViewData {
	const repos = new Map<string, RepoAcc>();
	let outside = 0;
	for (const session of sessions) {
		const identity = repoIdentity(session);
		for (const touch of session.touches) {
			const target = resolveTouchTarget(session, identity, touch);
			// Repository and path names come from session metadata and logs — see protoGuard.ts.
			if (!target || isUnsafeObjectKey(target.key) || isUnsafeObjectKey(target.rel)) { outside++; continue; }
			let repo = repos.get(target.key);
			if (!repo) { repo = { label: target.label, files: new Map() }; repos.set(target.key, repo); }
			addTouch(repo.files, target.rel, touchDayKey(touch, session.fallbackDayKey), touch);
		}
	}
	mergeNameKeyedRepos(repos);
	const out = [...repos.entries()].map(([key, r]) => toRepo(key, r.label, r.files));
	// Busiest repository first: the view opens on it.
	out.sort((a, b) => repoTouchTotal(b) - repoTouchTotal(a) || a.label.localeCompare(b.label));
	return { repos: out, outsideRepoTouches: outside, lastUpdated: now.toISOString(), hasData: out.length > 0 };
}

function repoTouchTotal(repo: RepoHeatmapRepo): number {
	let n = 0;
	for (const f of repo.files) { for (const c of Object.values(f.days)) { n += c[0] + c[1] + c[2] + c[3]; } }
	return n;
}

// ── Period filtering and folder grouping ─────────────────────────────────────

export interface RepoHeatmapCell {
	/** File name (last path segment). */
	name: string;
	path: string;
	counts: KindCounts;
	/** Sum of the counts for the kinds selected by the filter. */
	total: number;
	inferredDeletes: boolean;
	/** Characters returned by the reads whose size is known, and how many reads that is. */
	readChars: number;
	sizedReads: number;
}

export interface RepoHeatmapFolder {
	/** Repository-relative folder, `.` for the repository root. */
	folder: string;
	files: RepoHeatmapCell[];
	counts: KindCounts;
	total: number;
}

export interface RepoHeatmapSummary {
	folders: RepoHeatmapFolder[];
	counts: KindCounts;
	fileCount: number;
	/** Largest per-cell `total`, the scale for cell colour. */
	maxCellTotal: number;
}

/** Local-day lower bound (inclusive) of a period; `0000-00-00` for all time. */
export function periodStartDayKey(period: ChartTimeWindow, now: Date): string {
	return getTimeWindowStartDayKey(period, now);
}

function sumKinds(counts: KindCounts, kinds: ReadonlySet<FileActivityKind>): number {
	let n = 0;
	for (const kind of FILE_ACTIVITY_KINDS) { if (kinds.has(kind)) { n += counts[KIND_INDEX[kind]]; } }
	return n;
}

function fileCellIn(file: RepoHeatmapFile, startKey: string, todayKey: string, kinds: ReadonlySet<FileActivityKind>): RepoHeatmapCell | undefined {
	const counts = EMPTY_COUNTS();
	for (const [day, c] of Object.entries(file.days)) {
		if (day < startKey || day > todayKey) { continue; }
		for (let i = 0; i < 4; i++) { counts[i] += c[i]; }
	}
	const total = sumKinds(counts, kinds);
	if (total === 0) { return undefined; }
	let readChars = 0, sizedReads = 0;
	for (const [day, [chars, reads]] of Object.entries(file.readSizes ?? {})) {
		if (day < startKey || day > todayKey) { continue; }
		readChars += chars;
		sizedReads += reads;
	}
	const name = file.path.split('/').pop() ?? file.path;
	return { name, path: file.path, counts, total, inferredDeletes: file.inferredDeletes === true, readChars, sizedReads };
}

function folderOf(path: string): string {
	const i = path.lastIndexOf('/');
	return i < 0 ? '.' : path.slice(0, i);
}

/**
 * One repository's files for a period and kind filter, grouped by folder. Folders sort by
 * activity (busiest first); files inside a folder likewise. A file only appears when it has
 * activity of a selected kind in the period.
 */
export function summarizeRepoHeatmap(
	repo: RepoHeatmapRepo,
	period: ChartTimeWindow,
	now: Date,
	kinds: ReadonlySet<FileActivityKind> = new Set(FILE_ACTIVITY_KINDS),
): RepoHeatmapSummary {
	const startKey = periodStartDayKey(period, now);
	const todayKey = toLocalDayKey(now);
	const byFolder = new Map<string, RepoHeatmapFolder>();
	const counts = EMPTY_COUNTS();
	let fileCount = 0, maxCellTotal = 0;
	for (const file of repo.files) {
		const cell = fileCellIn(file, startKey, todayKey, kinds);
		if (!cell) { continue; }
		fileCount++;
		maxCellTotal = Math.max(maxCellTotal, cell.total);
		const folder = folderOf(file.path);
		let group = byFolder.get(folder);
		if (!group) { group = { folder, files: [], counts: EMPTY_COUNTS(), total: 0 }; byFolder.set(folder, group); }
		group.files.push(cell);
		group.total += cell.total;
		for (let i = 0; i < 4; i++) { group.counts[i] += cell.counts[i]; counts[i] += cell.counts[i]; }
	}
	const folders = [...byFolder.values()];
	for (const f of folders) { f.files.sort((a, b) => b.total - a.total || a.name.localeCompare(b.name)); }
	folders.sort((a, b) => b.total - a.total || a.folder.localeCompare(b.folder));
	return { folders, counts, fileCount, maxCellTotal };
}

// ── Hotspots: files whose activity pattern the user can do something about ──

/**
 * Why a file is a hotspot. Only patterns with a fix in the user's hands are flagged:
 * - `generated`: a dependency, build output or lockfile agents keep opening; they should skip it.
 * - `reread`: read many times for every edit, so agents navigate it by reading it. A lookup
 *   tool (a code graph, a symbol index) or a smaller file removes the need.
 * Files that are edited a lot, or created and deleted again, are normal work and not flagged.
 */
export type RepoHeatmapHotspotKind = 'generated' | 'reread';

export interface RepoHeatmapHotspot {
	path: string;
	name: string;
	kind: RepoHeatmapHotspotKind;
	/** All four kinds in the period, regardless of the view's kind filter. */
	counts: KindCounts;
	total: number;
	/**
	 * Reads of this file in the period just before this one (same length), so a fix can be
	 * seen working. Undefined when the period has no predecessor (all time).
	 */
	previousReads?: number;
	/**
	 * Estimated tokens the period's reads of this file put into agents' context. Undefined
	 * when no read of it has a recorded size.
	 */
	readTokens?: number;
	/** How many of the reads have a recorded size; the rest are assumed to be average. */
	sizedReads: number;
}

/** Rough characters per token for source text; good enough to rank files by read cost. */
export const HOTSPOT_CHARS_PER_TOKEN = 4;

/**
 * Tokens spent reading a file: the sized reads' text, scaled up to all reads on the assumption
 * that the unsized ones were as large on average.
 */
export function estimateReadTokens(reads: number, readChars: number, sizedReads: number): number | undefined {
	if (sizedReads <= 0 || readChars <= 0) { return undefined; }
	return Math.round((readChars / sizedReads) * Math.max(reads, sizedReads) / HOTSPOT_CHARS_PER_TOKEN);
}

/** Fewest reads before a file counts as re-read; below it the ratio is noise. */
export const HOTSPOT_MIN_READS = 10;
/** Reads per edit at or above which a file counts as re-read. */
export const HOTSPOT_REREAD_RATIO = 4;
/** Fewest reads before a generated file is worth flagging. */
export const HOTSPOT_MIN_GENERATED_READS = 3;
export const MAX_HOTSPOTS = 8;

const GENERATED_PATH = /(^|\/)(node_modules|dist|out|build|coverage|\.next|\.nuxt|vendor|obj|__pycache__|\.venv|target)\//i;
const LOCKFILE = /(^|\/)(package-lock\.json|pnpm-lock\.yaml|yarn\.lock|Cargo\.lock|poetry\.lock|composer\.lock|Gemfile\.lock|go\.sum)$/i;

/** True for dependency folders, build output and lockfiles: files agents rarely need to read. */
export function isGeneratedPath(path: string): boolean {
	return GENERATED_PATH.test(path) || LOCKFILE.test(path) || /\.min\.(js|css)$/i.test(path);
}

/** The hotspot kind of one file's period counts, or undefined when there is nothing to do about it. */
export function classifyHotspot(path: string, counts: KindCounts): RepoHeatmapHotspotKind | undefined {
	const [read, edited] = counts;
	if (isGeneratedPath(path)) { return read >= HOTSPOT_MIN_GENERATED_READS ? 'generated' : undefined; }
	if (read >= HOTSPOT_MIN_READS && read >= HOTSPOT_REREAD_RATIO * Math.max(1, edited)) { return 'reread'; }
	return undefined;
}

/**
 * The last day of the period just before `period`, at local noon, so the same period can be
 * summarized one step back. Undefined for all time, which has nothing before it.
 */
export function previousPeriodEnd(period: ChartTimeWindow, now: Date): Date | undefined {
	const [year, month, day] = periodStartDayKey(period, now).split('-').map(Number);
	return year > 0 ? new Date(year, month - 1, day - 1, 12) : undefined;
}

function toHotspot(cell: RepoHeatmapCell): RepoHeatmapHotspot | undefined {
	const kind = classifyHotspot(cell.path, cell.counts);
	if (!kind) { return undefined; }
	const readTokens = estimateReadTokens(cell.counts[0], cell.readChars, cell.sizedReads);
	return {
		path: cell.path, name: cell.name, kind, counts: cell.counts, total: cell.total, sizedReads: cell.sizedReads,
		...(readTokens !== undefined ? { readTokens } : {}),
	};
}

/**
 * The repository's hotspots in a period, most-read first. Always counts every kind, so the
 * list does not change meaning when the view's kind filter hides reads or edits.
 */
export function findRepoHeatmapHotspots(repo: RepoHeatmapRepo, period: ChartTimeWindow, now: Date, limit = MAX_HOTSPOTS): RepoHeatmapHotspot[] {
	const summary = summarizeRepoHeatmap(repo, period, now);
	const hotspots: RepoHeatmapHotspot[] = [];
	for (const folder of summary.folders) {
		for (const cell of folder.files) {
			const hotspot = toHotspot(cell);
			if (hotspot) { hotspots.push(hotspot); }
		}
	}
	hotspots.sort((a, b) => b.counts[0] - a.counts[0] || a.path.localeCompare(b.path));
	const kept = hotspots.slice(0, limit);
	const previousEnd = previousPeriodEnd(period, now);
	if (previousEnd && kept.length > 0) {
		const previousReads = new Map<string, number>();
		for (const folder of summarizeRepoHeatmap(repo, period, previousEnd).folders) {
			for (const cell of folder.files) { previousReads.set(cell.path, cell.counts[0]); }
		}
		for (const hotspot of kept) { hotspot.previousReads = previousReads.get(hotspot.path) ?? 0; }
	}
	return kept;
}
