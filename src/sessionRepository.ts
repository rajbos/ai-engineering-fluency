/**
 * Which repository a session worked in — the "By Repository" key of the daily stats.
 *
 * One implementation for every host: the extension's details pass
 * (vscode-extension/src/analysis/sessionDetailsAnalyzer.ts) collects references with the
 * helpers below while it walks a session for other details, and hosts without that pass (the
 * CLI, and the desktop app through it) call {@link resolveSessionRepository} (#2316).
 *
 * No `vscode` dependency. Resolution reads the referenced paths' git config, so callers should
 * cache the result per session file version.
 */
import * as fs from 'fs';

import type { IEcosystemAdapter } from './ecosystemAdapter';
import { isJsonlContent, isUuidPointerFile, reconstructJsonlStateAsync } from './tokenEstimation';
import { extractRepositoryFromContentReferences, getRepoNameFromWorkspacePath } from './workspaceHelpers';

/** A content reference as sessions record it; see extractRepositoryFromContentReferences. */
export type SessionContentReference = Parameters<typeof extractRepositoryFromContentReferences>[0][number];

/**
 * An ecosystem's repository for a session: its own authoritative id (e.g. Copilot CLI's DB
 * "owner/repo" column) whenever it records one — with or without a workspace, since the
 * adapter contract defines the two fields independently — else a worktree-aware name derived
 * from the workspace path, so app-store worktree paths resolve to the repo folder rather than
 * the transient worktree name. Undefined when the session has neither.
 */
export function repositoryFromEcosystemMeta(meta: { repository?: string; workspacePath?: string }): string | undefined {
	if (meta.repository) { return meta.repository; }
	return meta.workspacePath ? getRepoNameFromWorkspacePath(meta.workspacePath) : undefined;
}

/** The content references one chat request carries (VS Code JSON and delta-JSONL sessions). */
export function contentReferencesOfRequest(request: unknown): SessionContentReference[] {
	const refs = (request as { contentReferences?: unknown } | null | undefined)?.contentReferences;
	return Array.isArray(refs) ? refs as SessionContentReference[] : [];
}

/**
 * Path-like tool arguments of a Copilot CLI `tool.execution_start` event, as content references.
 * The CLI log has no contentReferences, so the files its tools touched stand in for them.
 */
export function contentReferencesOfCliToolEvent(event: unknown): SessionContentReference[] {
	const e = event as { type?: unknown; data?: { arguments?: unknown } } | null | undefined;
	if (e?.type !== 'tool.execution_start' || !e.data?.arguments || typeof e.data.arguments !== 'object') { return []; }
	const refs: SessionContentReference[] = [];
	for (const val of Object.values(e.data.arguments as Record<string, unknown>)) {
		if (typeof val === 'string' && val.length > 3 && (val.includes('/') || val.includes('\\'))) {
			refs.push({ kind: 'reference', reference: { fsPath: val } } as SessionContentReference);
		}
	}
	return refs;
}

/**
 * The repository the referenced files belong to. `''` is a "checked but not found" sentinel,
 * so warm-cache runs don't re-parse the file.
 */
export async function resolveRepositoryFromContentReferences(refs: SessionContentReference[]): Promise<string> {
	return refs.length > 0 ? (await extractRepositoryFromContentReferences(refs) ?? '') : '';
}

function tryParseJson(line: string): unknown {
	try { return JSON.parse(line); } catch { return undefined; }
}

/** References and custom title of a JSONL session, parsing each line at most once. */
async function scanJsonl(content: string): Promise<{ refs: SessionContentReference[]; title?: string }> {
	const lines = content.trim().split('\n').filter(l => l.trim());
	// The format is decided by the first valid line alone: a delta-based (VS Code Chat) log
	// starts with a `kind` record and is rebuilt in a single pass by reconstructJsonlStateAsync.
	let first: unknown;
	for (const line of lines) { first = tryParseJson(line); if (first !== undefined) { break; } }
	if (first && typeof (first as { kind?: unknown }).kind === 'number') {
		const { sessionState } = await reconstructJsonlStateAsync(lines);
		const title = typeof sessionState.customTitle === 'string' && sessionState.customTitle ? sessionState.customTitle : undefined;
		return { refs: (sessionState.requests || []).flatMap(contentReferencesOfRequest), ...(title ? { title } : {}) };
	}
	// Copilot CLI events: stream the lines, keeping only the references (no event array).
	const refs: SessionContentReference[] = [];
	for (const line of lines) {
		const event = tryParseJson(line);
		if (event !== undefined) { refs.push(...contentReferencesOfCliToolEvent(event)); }
	}
	return { refs };
}

/** What {@link resolveSessionAttributes} found for one session. */
export interface SessionAttributes {
	/** Repository the session worked in; `''` when it names none. */
	repository: string;
	/**
	 * The session's own title, when the source records one: the adapter's title, or a VS Code
	 * session's custom title. The task heuristic reads it for sessions whose analysis classified
	 * no turns — the case where it matters, since a file-based session with turns always gets a
	 * turn classification.
	 */
	title?: string;
}

/**
 * The repository and title of a session file, for hosts without the extension's details pass.
 * One read of the session (one getMeta() call for adapter sessions). Returns `undefined` when
 * the session could not be read (callers should not cache that).
 */
export async function resolveSessionAttributes(ecosystems: IEcosystemAdapter[], sessionFile: string, content?: string): Promise<SessionAttributes | undefined> {
	try {
		const eco = ecosystems.find(e => e.handles(sessionFile));
		if (eco) {
			const meta = await eco.getMeta(sessionFile);
			return { repository: repositoryFromEcosystemMeta(meta) ?? '', ...(meta.title ? { title: meta.title } : {}) };
		}
		const fileContent = content ?? await fs.promises.readFile(sessionFile, 'utf8');
		if (isUuidPointerFile(fileContent)) { return { repository: '' }; }
		if (sessionFile.endsWith('.jsonl') || isJsonlContent(fileContent)) {
			const { refs, title } = await scanJsonl(fileContent);
			return { repository: await resolveRepositoryFromContentReferences(refs), ...(title ? { title } : {}) };
		}
		const parsed = JSON.parse(fileContent) as { requests?: unknown; customTitle?: unknown };
		const requests = Array.isArray(parsed.requests) ? parsed.requests : [];
		const title = typeof parsed.customTitle === 'string' && parsed.customTitle ? parsed.customTitle : undefined;
		return { repository: await resolveRepositoryFromContentReferences(requests.flatMap(contentReferencesOfRequest)), ...(title ? { title } : {}) };
	} catch {
		return undefined;
	}
}

/**
 * The repository a session file worked in, for hosts without the extension's details pass.
 * Returns `''` when the session was checked and names no repository, and `undefined` when it
 * could not be read (callers should not cache that).
 */
export async function resolveSessionRepository(ecosystems: IEcosystemAdapter[], sessionFile: string, content?: string): Promise<string | undefined> {
	return (await resolveSessionAttributes(ecosystems, sessionFile, content))?.repository;
}
