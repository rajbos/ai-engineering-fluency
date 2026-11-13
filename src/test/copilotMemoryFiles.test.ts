import test, { after } from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import {
	decodeSessionFolderName,
	discoverMemoryFilesInUserPath,
	discoverAllMemoryFiles,
	analyzeMemoryFiles,
	toMemoryFilesAnalysisView,
} from '../copilotMemoryFiles';
import type { MemoryFilesAnalysis } from '../types';

// ---------------------------------------------------------------------------
// Temp directory registry — all dirs created via mkTmpDir() are removed after
// the entire test suite completes (avoids accumulation in CI and dev machines).
// ---------------------------------------------------------------------------

const _tmpDirs: string[] = [];
function mkTmpDir(prefix: string): string {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
	_tmpDirs.push(dir);
	return dir;
}
after(() => {
	for (const dir of _tmpDirs) {
		fs.rmSync(dir, { recursive: true, force: true });
	}
});

function writeFile(filePath: string, content: string, mtimeDaysAgo?: number): void {
	fs.mkdirSync(path.dirname(filePath), { recursive: true });
	fs.writeFileSync(filePath, content, 'utf8');
	if (mtimeDaysAgo !== undefined) {
		const time = new Date(Date.now() - mtimeDaysAgo * 24 * 60 * 60 * 1000);
		fs.utimesSync(filePath, time, time);
	}
}

const SESSION_UUID = '763eb849-7fb9-49f9-8e31-aeda4cb8d0b8';
const SESSION_FOLDER_NAME = Buffer.from(SESSION_UUID, 'utf8').toString('base64');

// ---------------------------------------------------------------------------
// decodeSessionFolderName
// ---------------------------------------------------------------------------

test('decodeSessionFolderName decodes a base64 session UUID folder name', () => {
	assert.equal(decodeSessionFolderName(SESSION_FOLDER_NAME), SESSION_UUID);
});

test('decodeSessionFolderName returns undefined for the literal "repo" folder', () => {
	assert.equal(decodeSessionFolderName('repo'), undefined);
});

test('decodeSessionFolderName returns undefined for non-base64 / non-UUID names', () => {
	assert.equal(decodeSessionFolderName('not-a-session-folder'), undefined);
	assert.equal(decodeSessionFolderName(''), undefined);
});

test('decodeSessionFolderName rejects a valid encoded UUID with trailing invalid characters', () => {
	// Buffer.from(..., 'base64') silently ignores characters outside the base64 alphabet, so
	// without alphabet validation this would previously decode to SESSION_UUID and be
	// misclassified as a valid session folder.
	assert.equal(decodeSessionFolderName(`${SESSION_FOLDER_NAME}!`), undefined);
});

// ---------------------------------------------------------------------------
// discoverMemoryFilesInUserPath
// ---------------------------------------------------------------------------

test('discoverMemoryFilesInUserPath finds user, repo and session scope memory files', () => {
	const userPath = mkTmpDir('memowl-user-');

	// User (global) scope
	writeFile(path.join(userPath, 'globalStorage', 'GitHub.copilot-chat', 'memory-tool', 'memories', 'global-note.md'), '# Global note');

	// Repo scope, under one workspace hash
	const hash = 'abc123';
	writeFile(
		path.join(userPath, 'workspaceStorage', hash, 'GitHub.copilot-chat', 'memory-tool', 'memories', 'repo', 'conventions.md'),
		'# Conventions',
	);
	writeFile(
		path.join(userPath, 'workspaceStorage', hash, 'workspace.json'),
		JSON.stringify({ folder: 'file:///c%3A/Users/dev/my-repo' }),
	);

	// Session scope, same workspace hash
	writeFile(
		path.join(userPath, 'workspaceStorage', hash, 'GitHub.copilot-chat', 'memory-tool', 'memories', SESSION_FOLDER_NAME, 'plan.md'),
		'# Plan',
	);

	// A workspace hash with no memory-tool folder at all — must be skipped without error.
	fs.mkdirSync(path.join(userPath, 'workspaceStorage', 'empty-hash'), { recursive: true });

	const entries = discoverMemoryFilesInUserPath(userPath);
	assert.equal(entries.length, 3);

	const userEntry = entries.find(e => e.scope === 'user');
	assert.ok(userEntry);
	assert.equal(userEntry?.title, 'global-note');
	assert.equal(userEntry?.workspaceHash, undefined);

	const repoEntry = entries.find(e => e.scope === 'repo');
	assert.ok(repoEntry);
	assert.equal(repoEntry?.workspaceHash, hash);
	assert.match(repoEntry!.workspaceName ?? '', /my-repo$/);

	const sessionEntry = entries.find(e => e.scope === 'session');
	assert.ok(sessionEntry);
	assert.equal(sessionEntry?.sessionId, SESSION_UUID);
	assert.equal(sessionEntry?.workspaceHash, hash);
});

test('discoverMemoryFilesInUserPath skips unrecognized memory subfolders', () => {
	const userPath = mkTmpDir('memowl-user-');
	const hash = 'def456';
	writeFile(
		path.join(userPath, 'workspaceStorage', hash, 'GitHub.copilot-chat', 'memory-tool', 'memories', 'not-repo-or-session', 'note.md'),
		'# Note',
	);

	const entries = discoverMemoryFilesInUserPath(userPath);
	assert.equal(entries.length, 0);
});

test('discoverMemoryFilesInUserPath returns [] for a nonexistent user path', () => {
	assert.deepEqual(discoverMemoryFilesInUserPath(path.join(os.tmpdir(), 'does-not-exist-memowl')), []);
});

test('discoverMemoryFilesInUserPath treats a literal "session" folder as session scope', () => {
	// Some memory-tool layouts use a literal "session" folder rather than encoding the session
	// UUID into the folder name (per current VS Code agent-memory documentation).
	const userPath = mkTmpDir('memowl-user-');
	const hash = 'literal-session-hash';
	writeFile(
		path.join(userPath, 'workspaceStorage', hash, 'GitHub.copilot-chat', 'memory-tool', 'memories', 'session', 'plan.md'),
		'# Plan',
	);

	const entries = discoverMemoryFilesInUserPath(userPath);
	assert.equal(entries.length, 1);
	assert.equal(entries[0].scope, 'session');
	assert.equal(entries[0].sessionId, undefined);
});

// ---------------------------------------------------------------------------
// Workspace-hash discovery edge cases (memories/ sub-folder classification)
// ---------------------------------------------------------------------------

function memoriesDir(userPath: string, hash: string): string {
	return path.join(userPath, 'workspaceStorage', hash, 'GitHub.copilot-chat', 'memory-tool', 'memories');
}

test('discoverMemoryFilesInUserPath returns [] when the workspaceStorage folder or a hash\'s memories folder is missing', () => {
	const noStorage = mkTmpDir('memowl-user-');
	assert.deepEqual(discoverMemoryFilesInUserPath(noStorage), []);

	const noMemories = mkTmpDir('memowl-user-');
	// The extension folder exists but has no memory-tool/memories under it.
	fs.mkdirSync(path.join(noMemories, 'workspaceStorage', 'hash-a', 'GitHub.copilot-chat', 'memory-tool'), { recursive: true });
	writeFile(path.join(noMemories, 'workspaceStorage', 'hash-a', 'GitHub.copilot-chat', 'stray.md'), '# Not a memory');
	assert.deepEqual(discoverMemoryFilesInUserPath(noMemories), []);
});

test('discoverMemoryFilesInUserPath returns [] for empty memories and scope folders', () => {
	const userPath = mkTmpDir('memowl-user-');
	fs.mkdirSync(memoriesDir(userPath, 'empty-memories'), { recursive: true });
	fs.mkdirSync(path.join(memoriesDir(userPath, 'empty-scopes'), 'repo'), { recursive: true });
	fs.mkdirSync(path.join(memoriesDir(userPath, 'empty-scopes'), 'session'), { recursive: true });
	fs.mkdirSync(path.join(memoriesDir(userPath, 'empty-scopes'), SESSION_FOLDER_NAME), { recursive: true });
	assert.deepEqual(discoverMemoryFilesInUserPath(userPath), []);
});

test('discoverMemoryFilesInUserPath keeps only .md files in recognized scope folders from a mixed memories folder', () => {
	const userPath = mkTmpDir('memowl-user-');
	const hash = 'mixed-hash';
	const memories = memoriesDir(userPath, hash);
	// Matching entries.
	writeFile(path.join(memories, 'repo', 'conventions.md'), '# Conventions');
	writeFile(path.join(memories, 'repo', 'UPPER.MD'), '# Upper-case extension');
	writeFile(path.join(memories, 'session', 'scratch.md'), '# Scratch');
	writeFile(path.join(memories, SESSION_FOLDER_NAME, 'plan.md'), '# Plan');
	// Non-matching entries.
	writeFile(path.join(memories, 'repo', 'notes.txt'), 'not markdown');
	writeFile(path.join(memories, 'repo', 'nested', 'deep.md'), '# Nested folders are not walked');
	writeFile(path.join(memories, 'loose.md'), '# Directly under memories/, outside any scope folder');
	writeFile(path.join(memories, 'not-a-session', 'note.md'), '# Unrecognized folder');
	writeFile(path.join(memories, Buffer.from('not-a-uuid', 'utf8').toString('base64'), 'note.md'), '# Base64 but not a UUID');
	writeFile(path.join(memories, 'repo.md'), '# A file named like a scope folder');

	const entries = discoverMemoryFilesInUserPath(userPath);
	const summary = entries
		.map(e => `${e.scope}|${e.sessionId ?? '-'}|${e.workspaceHash}|${path.basename(e.path)}`)
		.sort();
	assert.deepEqual(summary, [
		'repo|-|mixed-hash|UPPER.MD',
		'repo|-|mixed-hash|conventions.md',
		'session|-|mixed-hash|scratch.md',
		`session|${SESSION_UUID}|mixed-hash|plan.md`,
	]);
	// No workspace.json/meta.json, so there is no resolved workspace name.
	assert.ok(entries.every(e => e.workspaceName === undefined));
});

test('discoverMemoryFilesInUserPath merges memory files across multiple coexisting extension-folder spellings, not just the first match', () => {
	const userPath = mkTmpDir('memowl-user-');

	// Global scope files under two distinct extension-id spellings that can coexist on disk
	// (e.g. after an extension id migration). Both must be discovered, not just the first.
	writeFile(path.join(userPath, 'globalStorage', 'GitHub.copilot-chat', 'memory-tool', 'memories', 'chat-note.md'), '# Chat note');
	writeFile(path.join(userPath, 'globalStorage', 'GitHub.copilot', 'memory-tool', 'memories', 'copilot-note.md'), '# Copilot note');

	// Per-workspace repo-scope files, same two spellings, same workspace hash.
	const hash = 'multi-spelling-hash';
	writeFile(
		path.join(userPath, 'workspaceStorage', hash, 'GitHub.copilot-chat', 'memory-tool', 'memories', 'repo', 'from-chat.md'),
		'# From chat',
	);
	writeFile(
		path.join(userPath, 'workspaceStorage', hash, 'GitHub.copilot', 'memory-tool', 'memories', 'repo', 'from-copilot.md'),
		'# From copilot',
	);

	const entries = discoverMemoryFilesInUserPath(userPath);
	assert.deepEqual(entries.map(e => e.title).sort(), ['chat-note', 'copilot-note', 'from-chat', 'from-copilot']);
});

// ---------------------------------------------------------------------------
// discoverAllMemoryFiles
// ---------------------------------------------------------------------------

test('discoverAllMemoryFiles aggregates across multiple user paths', () => {
	const userPathA = mkTmpDir('memowl-user-a-');
	const userPathB = mkTmpDir('memowl-user-b-');
	writeFile(path.join(userPathA, 'globalStorage', 'GitHub.copilot-chat', 'memory-tool', 'memories', 'a.md'), '# A');
	writeFile(path.join(userPathB, 'globalStorage', 'github.copilot-chat', 'memory-tool', 'memories', 'b.md'), '# B');

	const entries = discoverAllMemoryFiles([userPathA, userPathB]);
	assert.equal(entries.length, 2);
	assert.deepEqual(entries.map(e => e.title).sort(), ['a', 'b']);
});

// ---------------------------------------------------------------------------
// analyzeMemoryFiles
// ---------------------------------------------------------------------------

test('analyzeMemoryFiles flags stale and large files and groups by workspace', () => {
	const userPath = mkTmpDir('memowl-user-');
	const hash = 'ghi789';

	writeFile(
		path.join(userPath, 'workspaceStorage', hash, 'GitHub.copilot-chat', 'memory-tool', 'memories', 'repo', 'fresh.md'),
		'# Fresh',
		1,
	);
	writeFile(
		path.join(userPath, 'workspaceStorage', hash, 'GitHub.copilot-chat', 'memory-tool', 'memories', 'repo', 'stale.md'),
		'# Stale',
		200,
	);
	writeFile(
		path.join(userPath, 'workspaceStorage', hash, 'GitHub.copilot-chat', 'memory-tool', 'memories', 'repo', 'large.md'),
		'#'.repeat(20 * 1024),
		1,
	);

	const files = discoverMemoryFilesInUserPath(userPath);
	assert.equal(files.length, 3);

	const analysis = analyzeMemoryFiles(files, { staleDays: 90, largeFileBytes: 10 * 1024 });
	assert.equal(analysis.totalFiles, 3);
	assert.equal(analysis.staleFileCount, 1);
	assert.equal(analysis.largeFileCount, 1);
	assert.equal(analysis.byWorkspace.length, 1);

	const summary = analysis.byWorkspace[0];
	assert.equal(summary.repoCount, 3);
	assert.equal(summary.sessionCount, 0);
	assert.equal(summary.userCount, 0);
	assert.equal(summary.staleFiles.length, 1);
	assert.equal(summary.staleFiles[0].title, 'stale');
	assert.ok(summary.largestFile);
	assert.equal(summary.largestFile?.title, 'large');
});

test('analyzeMemoryFiles handles an empty file list', () => {
	const analysis = analyzeMemoryFiles([]);
	assert.equal(analysis.totalFiles, 0);
	assert.equal(analysis.totalBytes, 0);
	assert.equal(analysis.staleFileCount, 0);
	assert.equal(analysis.largeFileCount, 0);
	assert.deepEqual(analysis.byWorkspace, []);
});

test('analyzeMemoryFiles groups the user (global) scope separately from workspaces', () => {
	const userPath = mkTmpDir('memowl-user-');
	writeFile(path.join(userPath, 'globalStorage', 'GitHub.copilot-chat', 'memory-tool', 'memories', 'global.md'), '# Global');

	const files = discoverMemoryFilesInUserPath(userPath);
	const analysis = analyzeMemoryFiles(files);
	assert.equal(analysis.byWorkspace.length, 1);
	assert.equal(analysis.byWorkspace[0].workspaceName, 'User (global)');
	assert.equal(analysis.byWorkspace[0].workspaceHash, undefined);
	assert.equal(analysis.byWorkspace[0].userCount, 1);
	assert.equal(analysis.byWorkspace[0].repoCount, 0);
	assert.equal(analysis.byWorkspace[0].sessionCount, 0);
});

// ---------------------------------------------------------------------------
// toMemoryFilesAnalysisView — compact webview projection
// ---------------------------------------------------------------------------

test('toMemoryFilesAnalysisView returns null for a null analysis', () => {
	assert.equal(toMemoryFilesAnalysisView(null), null);
});

test('toMemoryFilesAnalysisView drops per-file detail (files, staleFiles entries, largestFile, oldestMtimeMs) but keeps every scalar and count the webview renders', () => {
	const userPath = mkTmpDir('memowl-user-');
	const hash = 'view-projection-hash';

	writeFile(
		path.join(userPath, 'workspaceStorage', hash, 'GitHub.copilot-chat', 'memory-tool', 'memories', 'repo', 'fresh.md'),
		'# Fresh',
		1,
	);
	writeFile(
		path.join(userPath, 'workspaceStorage', hash, 'GitHub.copilot-chat', 'memory-tool', 'memories', 'repo', 'stale.md'),
		'# Stale',
		200,
	);

	const files = discoverMemoryFilesInUserPath(userPath);
	const analysis = analyzeMemoryFiles(files, { staleDays: 90, largeFileBytes: 10 * 1024 });
	const view = toMemoryFilesAnalysisView(analysis);

	assert.ok(view);
	// Scalars the webview table/summary line reads must survive the projection unchanged.
	assert.equal(view!.staleDays, analysis.staleDays);
	assert.equal(view!.largeFileBytes, analysis.largeFileBytes);
	assert.equal(view!.totalFiles, analysis.totalFiles);
	assert.equal(view!.totalBytes, analysis.totalBytes);
	assert.equal(view!.staleFileCount, analysis.staleFileCount);
	assert.equal(view!.largeFileCount, analysis.largeFileCount);

	// Never send the full per-file entries (absolute paths, session IDs) to the webview.
	assert.equal((view as unknown as { files?: unknown }).files, undefined);

	assert.equal(view!.byWorkspace.length, 1);
	const [ws] = view!.byWorkspace;
	const [rawWs] = analysis.byWorkspace;
	assert.equal(ws.workspaceHash, rawWs.workspaceHash);
	assert.equal(ws.workspaceName, rawWs.workspaceName);
	assert.equal(ws.repoCount, rawWs.repoCount);
	assert.equal(ws.sessionCount, rawWs.sessionCount);
	assert.equal(ws.userCount, rawWs.userCount);
	assert.equal(ws.totalBytes, rawWs.totalBytes);
	assert.equal(ws.newestMtimeMs, rawWs.newestMtimeMs);
	// The count the table needs, projected from the full staleFiles array without keeping it.
	assert.equal(ws.staleFileCount, rawWs.staleFiles.length);
	assert.equal((ws as unknown as { staleFiles?: unknown }).staleFiles, undefined);
	assert.equal((ws as unknown as { largestFile?: unknown }).largestFile, undefined);
	assert.equal((ws as unknown as { oldestMtimeMs?: unknown }).oldestMtimeMs, undefined);
});

test('toMemoryFilesAnalysisView handles an analysis with no workspaces', () => {
	const view = toMemoryFilesAnalysisView(analyzeMemoryFiles([]));
	assert.ok(view);
	assert.deepEqual(view!.byWorkspace, []);
	assert.equal(view!.totalFiles, 0);
});

test('toMemoryFilesAnalysisView reduces workspaceName to its basename, never the full path', () => {
	const userPath = mkTmpDir('memowl-user-');
	const hash = 'privacy-basename-hash';
	writeFile(
		path.join(userPath, 'workspaceStorage', hash, 'GitHub.copilot-chat', 'memory-tool', 'memories', 'repo', 'notes.md'),
		'# Notes',
	);
	writeFile(
		path.join(userPath, 'workspaceStorage', hash, 'workspace.json'),
		JSON.stringify({ folder: 'file:///c%3A/Users/dev/some-secret-project' }),
	);

	const files = discoverMemoryFilesInUserPath(userPath);
	const analysis = analyzeMemoryFiles(files);

	// The raw analysis (consumed by the extension host / CLI) still carries the full path.
	assert.match(analysis.byWorkspace[0].workspaceName ?? '', /some-secret-project$/);
	assert.ok((analysis.byWorkspace[0].workspaceName ?? '').includes('Users'));

	// The webview-facing view must never see anything beyond the final path segment.
	const view = toMemoryFilesAnalysisView(analysis);
	assert.equal(view!.byWorkspace[0].workspaceName, 'some-secret-project');
});

test('toMemoryFilesAnalysisView falls back to the original path for a root workspace, instead of an empty label', () => {
	// A root path ("/" or "C:\") has its trailing separator trimmed away entirely by
	// basenameOfWorkspacePath's normalization step, leaving nothing to take a "last segment"
	// from — this must fall back to the original path rather than rendering an empty string.
	const analysis: MemoryFilesAnalysis = {
		staleDays: 90,
		largeFileBytes: 1024,
		files: [],
		byWorkspace: [{
			workspaceHash: 'root-hash',
			workspaceName: '/',
			repoCount: 1,
			sessionCount: 0,
			userCount: 0,
			totalBytes: 0,
			newestMtimeMs: null,
			oldestMtimeMs: null,
			staleFiles: [],
		}],
		totalFiles: 0,
		totalBytes: 0,
		staleFileCount: 0,
		largeFileCount: 0,
	};

	const view = toMemoryFilesAnalysisView(analysis);
	assert.equal(view!.byWorkspace[0].workspaceName, '/');
});
