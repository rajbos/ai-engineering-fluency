/**
 * Node filesystem implementation of the probes `groupWorkspaces()` takes.
 * Kept apart from `workspaceGrouping.ts` so the grouping rules stay pure and testable offline.
 */
import * as fs from 'fs';
import * as path from 'path';
import { parseGitRemoteUrl } from './workspaceHelpers';
import type { WorkspaceGitInfo, WorkspaceGroupingProbes } from './workspaceGrouping';

function readFileOrUndefined(filePath: string): string | undefined {
	try { return fs.readFileSync(filePath, 'utf8'); } catch { return undefined; }
}

/**
 * Read a folder's git setup without spawning git:
 *  - `<folder>/.git` directory → remote from `.git/config`;
 *  - `<folder>/.git` file (`gitdir: <main>/.git/worktrees/<name>`) → the main checkout's folder
 *    and the remote from `<main>/.git/config`.
 * Only the folder itself is inspected (no walking up), so a sub-folder of a repo reports nothing.
 */
export function readWorkspaceGitInfo(folderPath: string): WorkspaceGitInfo | undefined {
	const dotGit = path.join(folderPath, '.git');
	let stat: fs.Stats;
	try { stat = fs.statSync(dotGit); } catch { return undefined; }
	if (stat.isDirectory()) {
		const config = readFileOrUndefined(path.join(dotGit, 'config'));
		return config ? { remote: parseGitRemoteUrl(config) } : undefined;
	}
	const pointer = readFileOrUndefined(dotGit)?.match(/^gitdir:\s*(.+)$/m)?.[1]?.trim();
	if (!pointer) { return undefined; }
	const gitdir = path.resolve(folderPath, pointer);
	const worktreesDir = path.dirname(gitdir);
	if (path.basename(worktreesDir).toLowerCase() !== 'worktrees') { return undefined; }
	const mainGitDir = path.dirname(worktreesDir);
	const config = readFileOrUndefined(path.join(mainGitDir, 'config'));
	return {
		remote: config ? parseGitRemoteUrl(config) : undefined,
		// `<main>/.git` → `<main>`; a bare repo's git dir has no checkout to point at.
		mainWorktreePath: path.basename(mainGitDir).toLowerCase() === '.git' ? path.dirname(mainGitDir) : undefined,
	};
}

/** Probes backed by the local filesystem, for the extension and the CLI. */
export function createNodeWorkspaceGroupingProbes(platform: string = process.platform): WorkspaceGroupingProbes {
	return {
		platform,
		pathExists: p => { try { return fs.existsSync(p); } catch { return false; } },
		readGitInfo: readWorkspaceGitInfo,
	};
}
