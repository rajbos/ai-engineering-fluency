/**
 * The git remote a session worked in, derived from the files it referenced.
 *
 * Shared by the VS Code extension's session details analyzer (which reads the same references
 * while it walks a session for other details) and the CLI, which has no adapter metadata for
 * VS Code `chatSessions` files and needs the remote for workspace grouping parity
 * (src/workspaceGrouping.ts). One definition of "what counts as a content reference" keeps the
 * two surfaces from drifting apart.
 */
import * as path from 'path';
import { isJsonlContent, isUuidPointerFile, reconstructJsonlStateAsync } from './tokenEstimation';
import { extractRepositoryFromContentReferences } from './workspaceHelpers';

type ContentReferences = Parameters<typeof extractRepositoryFromContentReferences>[0];

/** A VS Code chat request's own content references (attached files, symbols). */
export function requestContentReferences(request: unknown): ContentReferences {
	const refs = (request as { contentReferences?: unknown } | null | undefined)?.contentReferences;
	return Array.isArray(refs) ? refs : [];
}

/**
 * Path-like arguments of a Copilot CLI `tool.execution_start` event, as content references:
 * the CLI log has no attachment list, so the files its tools touched stand in for one.
 */
export function toolArgumentPathReferences(args: unknown): ContentReferences {
	if (!args || typeof args !== 'object') { return []; }
	const refs: ContentReferences = [];
	for (const val of Object.values(args as Record<string, unknown>)) {
		if (typeof val === 'string' && val.length > 3 && (val.includes('/') || val.includes('\\'))) {
			refs.push({ kind: 'reference', reference: { fsPath: val } });
		}
	}
	return refs;
}

function cliEventReferences(line: string): ContentReferences {
	try {
		const event = JSON.parse(line);
		return event?.type === 'tool.execution_start' ? toolArgumentPathReferences(event.data?.arguments) : [];
	} catch {
		return [];
	}
}

/** Every content reference in a session file's content: VS Code JSON, VS Code delta JSONL or Copilot CLI JSONL. */
export async function collectSessionContentReferences(content: string, parsedJson?: unknown): Promise<ContentReferences> {
	if (isUuidPointerFile(content)) { return []; }
	if (isJsonlContent(content)) {
		const lines = content.trim().split('\n').filter(l => l.trim());
		let isDelta = false;
		try { isDelta = typeof JSON.parse(lines[0] ?? '')?.kind === 'number'; } catch { /* not delta */ }
		if (!isDelta) { return lines.flatMap(cliEventReferences); }
		const { sessionState } = await reconstructJsonlStateAsync(lines);
		return (sessionState?.requests ?? []).flatMap(requestContentReferences);
	}
	try {
		const requests = (parsedJson as { requests?: unknown } | undefined ?? JSON.parse(content))?.requests;
		return Array.isArray(requests) ? requests.flatMap(requestContentReferences) : [];
	} catch {
		return [];
	}
}

/**
 * The remote URL of the repository a session's referenced files live in, or undefined.
 * Reads `.git/config` (or a worktree's main config) next to those files, like the extension.
 */
export async function extractRepositoryFromSessionContent(content: string, parsedJson?: unknown, workspacePath?: string): Promise<string | undefined> {
	return extractWorkspaceRepository(await collectSessionContentReferences(content, parsedJson), workspacePath);
}

/**
 * Comparable form of a path for containment checks: forward slashes, no `/C:` URI prefix,
 * `.` / `..` segments resolved (so `/app/../lib/x` is not inside `/app`), no trailing slash.
 * Case is folded only where the filesystem is case-insensitive: Windows-style paths (a drive
 * letter or UNC root) and macOS; POSIX paths elsewhere keep their case, as `/a/App` and `/a/app`
 * are different folders there.
 */
function comparablePath(p: string, platform: string): string {
	const slashed = p.replace(/\\/g, '/').replace(/^\/(?=[a-z]:)/i, '');
	const isWindowsPath = /^[a-z]:\//i.test(slashed) || slashed.startsWith('//');
	const unc = slashed.startsWith('//') ? '/' : '';
	const normalized = (unc + path.posix.normalize(slashed)).replace(/\/+$/, '');
	return isWindowsPath || platform === 'win32' || platform === 'darwin' ? normalized.toLowerCase() : normalized;
}

/** The file path a content reference points at, if any. */
function referencePath(ref: ContentReferences[number]): string | undefined {
	const data = ref.reference ?? ref.inlineReference;
	const p = data?.fsPath ?? data?.path;
	return typeof p === 'string' && p.length > 0 ? p : undefined;
}

/** References to files inside `workspacePath` (the folder itself or below it). */
export function referencesWithinWorkspace(refs: ContentReferences, workspacePath: string, platform: string = process.platform): ContentReferences {
	const root = comparablePath(workspacePath, platform);
	return refs.filter(ref => {
		const p = referencePath(ref);
		if (!p) { return false; }
		const candidate = comparablePath(p, platform);
		return candidate === root || candidate.startsWith(`${root}/`);
	});
}

/**
 * The remote of the repository a session worked in. Attachments and symbols can come from other
 * repositories, so when the session's workspace folder is known only references inside it count:
 * a repo-A session that also looked at repo B is never attributed to B. Without a known
 * workspace every reference counts (the session is not attributed to a workspace then).
 */
export async function extractWorkspaceRepository(refs: ContentReferences, workspacePath?: string): Promise<string | undefined> {
	const scoped = workspacePath ? referencesWithinWorkspace(resolveRelativeReferences(refs, workspacePath), workspacePath) : refs;
	return scoped.length > 0 ? extractRepositoryFromContentReferences(scoped) : undefined;
}

/** Absolute on any platform: POSIX root, drive letter, UNC root, or a `/C:` URI-style path. */
function isAbsoluteAnyPlatform(p: string): boolean {
	return /^(?:[\\/]|[a-z]:[\\/])/i.test(p);
}

/**
 * Tools log cwd-relative paths (`src/a.ts`); resolve them against the workspace so they can count
 * as inside it and be looked up. The result keeps the workspace's separator style, with `.`/`..`
 * resolved, so the git-root walk sees a real path.
 */
export function resolveRelativeReferences(refs: ContentReferences, workspacePath: string): ContentReferences {
	const sep = workspacePath.includes('\\') && !workspacePath.startsWith('/') ? '\\' : '/';
	const resolve = (relative: string): string => {
		const joined = `${workspacePath.replace(/[\\/]+$/, '')}/${relative}`.replace(/\\/g, '/');
		const unc = joined.startsWith('//') ? '/' : '';
		const normalized = unc + path.posix.normalize(joined);
		return sep === '\\' ? normalized.replace(/\//g, '\\') : normalized;
	};
	return refs.map(ref => {
		const p = referencePath(ref);
		if (!p || isAbsoluteAnyPlatform(p)) { return ref; }
		return { kind: ref.kind ?? 'reference', reference: { fsPath: resolve(p) } };
	});
}
