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

function parseJsonLines(lines: string[]): unknown[] {
	const events: unknown[] = [];
	for (const line of lines) {
		try { events.push(JSON.parse(line)); } catch { /* skip malformed */ }
	}
	return events;
}

async function contentReferencesOfJsonl(content: string): Promise<SessionContentReference[]> {
	const lines = content.trim().split('\n').filter(l => l.trim());
	const events = parseJsonLines(lines);
	const first = events[0] as { kind?: unknown } | undefined;
	if (first && typeof first.kind === 'number') {
		// Delta-based (VS Code Chat JSONL): rebuild the session state, then read its requests.
		const { sessionState } = await reconstructJsonlStateAsync(lines);
		return (sessionState.requests || []).flatMap(contentReferencesOfRequest);
	}
	return events.flatMap(contentReferencesOfCliToolEvent);
}

/**
 * The repository a session file worked in, for hosts without the extension's details pass.
 * Returns `''` when the session was checked and names no repository, and `undefined` when it
 * could not be read (callers should not cache that).
 */
export async function resolveSessionRepository(ecosystems: IEcosystemAdapter[], sessionFile: string, content?: string): Promise<string | undefined> {
	try {
		const eco = ecosystems.find(e => e.handles(sessionFile));
		if (eco) { return repositoryFromEcosystemMeta(await eco.getMeta(sessionFile)) ?? ''; }
		const fileContent = content ?? await fs.promises.readFile(sessionFile, 'utf8');
		if (isUuidPointerFile(fileContent)) { return ''; }
		if (sessionFile.endsWith('.jsonl') || isJsonlContent(fileContent)) {
			return await resolveRepositoryFromContentReferences(await contentReferencesOfJsonl(fileContent));
		}
		const parsed = JSON.parse(fileContent) as { requests?: unknown };
		const requests = Array.isArray(parsed.requests) ? parsed.requests : [];
		return await resolveRepositoryFromContentReferences(requests.flatMap(contentReferencesOfRequest));
	} catch {
		return undefined;
	}
}
