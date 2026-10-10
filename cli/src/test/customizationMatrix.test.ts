/**
 * buildCustomizationMatrix counts workspaces that have no agent instructions file.
 * Each accepted spelling must satisfy the check on its own, matching the shared
 * scanner (src/customizationPatterns.json), which is case-insensitive.
 */

import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { buildCustomizationMatrix } from '../helpers';

/**
 * A VS Code chat session with one request: the matrix only counts sessions with interactions
 * in the last 30 days, like the extension, so an empty `{}` file would be skipped.
 */
const ONE_REQUEST_SESSION = JSON.stringify({
	version: 3,
	requests: [{ requestId: 'r1', timestamp: Date.now(), message: { text: 'hello' }, response: [{ value: 'hi' }] }],
});

/** Build a VS Code-style session file whose workspace.json points at a temp workspace. */
function makeWorkspace(files: string[]): { root: string; sessionFile: string } {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cli-custmatrix-'));
	const workspace = path.join(root, 'ws');
	fs.mkdirSync(workspace);
	for (const rel of files) {
		const abs = path.join(workspace, rel);
		fs.mkdirSync(path.dirname(abs), { recursive: true });
		fs.writeFileSync(abs, '# instructions');
	}
	const hashDir = path.join(root, 'workspaceStorage', 'abc123');
	const chatDir = path.join(hashDir, 'chatSessions');
	fs.mkdirSync(chatDir, { recursive: true });
	fs.writeFileSync(
		path.join(hashDir, 'workspace.json'),
		JSON.stringify({ folder: 'file:///' + workspace.replace(/\\/g, '/') })
	);
	const sessionFile = path.join(chatDir, 's1.json');
	fs.writeFileSync(sessionFile, ONE_REQUEST_SESSION);
	return { root, sessionFile };
}

async function issuesFor(files: string[]): Promise<number | undefined> {
	const { root, sessionFile } = makeWorkspace(files);
	try {
		return (await buildCustomizationMatrix([sessionFile]))?.workspacesWithIssues;
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
}

test('buildCustomizationMatrix: workspace without any instructions file has an issue', async () => {
	assert.equal(await issuesFor([]), 1);
});

for (const file of [
	'AGENTS.md',
	'agents.md',
	'CLAUDE.md',
	'claude.md',
	'.claude/CLAUDE.md',
	'.claude/claude.md',
	'.CLAUDE/claude.md',
	'.github/copilot-instructions.md',
]) {
	test(`buildCustomizationMatrix: ${file} alone satisfies the instructions check`, async () => {
		assert.equal(await issuesFor([file]), 0);
	});
}

// ── Workspace grouping (shared src/workspaceGrouping.ts) ─────────────────────

import { groupWorkspaces } from '../../../src/workspaceGrouping';
import { prefetchWorkspaceGroupingProbes } from '../../../src/workspaceGroupingProbes';

/** One VS Code-style session file per folder, so each folder counts one session. */
function makeSessions(root: string, folders: string[]): string[] {
	return folders.map((folder, i) => {
		const hashDir = path.join(root, 'workspaceStorage', `hash${i}`);
		const chatDir = path.join(hashDir, 'chatSessions');
		fs.mkdirSync(chatDir, { recursive: true });
		fs.writeFileSync(path.join(hashDir, 'workspace.json'), JSON.stringify({ folder: 'file:///' + folder.replace(/\\/g, '/') }));
		const sessionFile = path.join(chatDir, 's.json');
		fs.writeFileSync(sessionFile, ONE_REQUEST_SESSION);
		return sessionFile;
	});
}

test('buildCustomizationMatrix: worktrees and clones of one repository count as one grouped workspace', async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cli-custmatrix-'));
	try {
		const main = path.join(root, 'code', 'acme-app');
		const sibling = path.join(root, 'code', 'acme-app-refactor-wt');
		const clone = path.join(root, 'tmp', 'acme-app-85ed99');
		const other = path.join(root, 'code', 'other-repo');
		for (const dir of [main, sibling, clone, other]) { fs.mkdirSync(dir, { recursive: true }); }
		// Only the sibling worktree has an instructions file; the group as a whole is covered.
		fs.writeFileSync(path.join(sibling, 'AGENTS.md'), '# instructions');

		const matrix = await buildCustomizationMatrix(makeSessions(root, [main, sibling, clone, other]));
		assert.ok(matrix);
		assert.equal(matrix.totalWorkspaces, 2);
		assert.equal(matrix.workspacesWithIssues, 1, 'only other-repo lacks instructions');
		const acme = matrix.workspaces.find(w => w.workspaceName === 'acme-app');
		assert.ok(acme);
		assert.equal(acme.workspacePath, main);
		assert.equal(acme.sessionCount, 3);
		assert.deepEqual(acme.memberPaths, [main, sibling, clone].sort());
		const otherRow = matrix.workspaces.find(w => w.workspaceName === 'other-repo');
		assert.equal(otherRow?.memberPaths, undefined, 'single-folder rows carry no member list');
		assert.equal(matrix.ungroupedWorkspaceNames, undefined);
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
});

test('buildCustomizationMatrix: grouped totals match the shared grouping the extension uses (parity)', async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cli-custmatrix-'));
	try {
		const folders = [
			path.join(root, 'code', 'widget'),
			path.join(root, 'clones', 'widget'),
			path.join(root, '.copilot', 'copilot-worktrees', 'widget', 'goofy-wozniak-42f712'),
			path.join(root, 'scratch', 'groups-dashboard-layout-85ed99'),
		];
		for (const dir of folders) { fs.mkdirSync(dir, { recursive: true }); }
		const matrix = await buildCustomizationMatrix(makeSessions(root, folders));
		// The extension feeds the same folder → count list through the same function.
		const entries = folders.map(p => ({ path: p, sessionCount: 1, interactionCount: 0 }));
		const expected = groupWorkspaces(entries, await prefetchWorkspaceGroupingProbes(entries));
		assert.ok(matrix);
		assert.equal(matrix.totalWorkspaces, expected.length);
		assert.deepEqual(
			matrix.workspaces.map(w => [w.workspaceName, w.sessionCount]),
			expected.map(g => [g.displayName, g.sessionCount]),
		);
		assert.equal(matrix.totalWorkspaces, 2);
		// The branch-named scratch clone has nothing to join, so the detector reports it.
		assert.deepEqual(matrix.ungroupedWorkspaceNames, ['groups-dashboard-layout-85ed99']);
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
});

test('buildCustomizationMatrix: only sessions with interactions in the last 30 days count, like the extension', async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cli-custmatrix-'));
	try {
		const active = path.join(root, 'code', 'active-repo');
		const old = path.join(root, 'code', 'old-repo');
		const empty = path.join(root, 'code', 'empty-repo');
		for (const dir of [active, old, empty]) { fs.mkdirSync(dir, { recursive: true }); }
		const [activeSession, oldSession, emptySession] = makeSessions(root, [active, old, empty]);
		const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
		fs.utimesSync(oldSession, sixtyDaysAgo, sixtyDaysAgo);
		fs.writeFileSync(emptySession, '{}');
		assert.ok(activeSession);

		const matrix = await buildCustomizationMatrix([activeSession, oldSession, emptySession]);
		assert.ok(matrix);
		assert.deepEqual(matrix.workspaces.map(w => w.workspaceName), ['active-repo']);
		assert.equal(matrix.workspaces[0].sessionCount, 1);
		assert.ok(matrix.workspaces[0].interactionCount > 0, 'interactions are counted, not left at 0');
		assert.equal(await buildCustomizationMatrix([oldSession, emptySession]), undefined);
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
});

test('sessionActiveSince: a DB-backed session is placed by its own activity, never by the shared database mtime', async () => {
	const { sessionActiveSince } = await import('../helpers');
	const cutoff = new Date('2026-09-10T00:00:00Z');
	const recent = new Date('2026-10-01T00:00:00Z');
	const old = new Date('2026-06-01T00:00:00Z');
	// Regular file (no per-session activity): the file mtime decides.
	assert.equal(sessionActiveSince(recent, null, cutoff), true);
	assert.equal(sessionActiveSince(old, null, cutoff), false);
	// DB-backed: an old session in a recently-touched database does not count …
	assert.equal(sessionActiveSince(recent, old, cutoff), false);
	// … and a recent one counts even if the database file looks older.
	assert.equal(sessionActiveSince(old, recent, cutoff), true);
});

test('buildCustomizationMatrix: the 30-day window is the extension\'s (30 calendar dates including today)', async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cli-custmatrix-'));
	try {
		const now = new Date();
		const first = path.join(root, 'code', 'first-day');
		const before = path.join(root, 'code', 'day-before');
		for (const dir of [first, before]) { fs.mkdirSync(dir, { recursive: true }); }
		const [firstSession, beforeSession] = makeSessions(root, [first, before]);
		const firstDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29, 12);
		const dayBefore = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30, 12);
		fs.utimesSync(firstSession, firstDay, firstDay);
		fs.utimesSync(beforeSession, dayBefore, dayBefore);
		const matrix = await buildCustomizationMatrix([firstSession, beforeSession], undefined, now);
		assert.deepEqual(matrix?.workspaces.map(w => w.workspaceName), ['first-day']);
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
});

test('buildCustomizationMatrix: VS Code sessions are grouped by the remote of the files they referenced (parity)', async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cli-custmatrix-'));
	try {
		// The repository both sessions touched; the workspace folders themselves are gone.
		const repo = path.join(root, 'repos', 'widget-main');
		fs.mkdirSync(path.join(repo, '.git'), { recursive: true });
		fs.mkdirSync(path.join(repo, 'src'), { recursive: true });
		fs.writeFileSync(path.join(repo, '.git', 'config'), '[remote "origin"]\n\turl = https://github.com/acme/widget.git\n');
		const touched = path.join(repo, 'src', 'index.ts');
		fs.writeFileSync(touched, '');
		const folders = [path.join(root, 'wt', 'checkout-a'), path.join(root, 'scratch', 'groups-dashboard-layout-85ed99')];
		const sessions = makeSessions(root, folders);
		const withReference = JSON.stringify({
			version: 3,
			requests: [{
				requestId: 'r1', timestamp: Date.now(), message: { text: 'look at this' }, response: [{ value: 'ok' }],
				contentReferences: [{ kind: 'reference', reference: { fsPath: touched } }],
			}],
		});
		for (const s of sessions) { fs.writeFileSync(s, withReference); }

		const matrix = await buildCustomizationMatrix(sessions);
		assert.ok(matrix);
		assert.equal(matrix.totalWorkspaces, 1, 'both folders share the referenced remote');
		assert.equal(matrix.workspaces[0].workspaceName, 'widget');
		assert.deepEqual(matrix.workspaces[0].memberPaths, folders.map(f => path.normalize(f)).sort());
		assert.equal(matrix.ungroupedWorkspaceNames, undefined, 'the branch-named folder is no longer a leftover');
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
});
