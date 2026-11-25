import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { checkWebviewSessionFilePath, findSessionFilePathProblem, parseWebviewTurnNumber, type SessionFilePathGuardDeps } from '../../src/sessionFilePathGuard';

function withTempDir(run: (dir: string) => Promise<void>): () => Promise<void> {
	return async () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'session-path-guard-'));
		try { await run(dir); } finally { fs.rmSync(dir, { recursive: true, force: true }); }
	};
}

function deps(known: string[], cached: string[] = [], logs: string[] = []): SessionFilePathGuardDeps {
	return {
		isCachedSessionFile: (p) => cached.includes(p),
		listSessionFiles: async () => known,
		log: (m) => logs.push(m),
	};
}

test('accepts a discovered session file that exists', withTempDir(async (dir) => {
	const file = path.join(dir, 'session.jsonl');
	fs.writeFileSync(file, '{}\n');
	const logs: string[] = [];
	assert.equal(await checkWebviewSessionFilePath(file, 'test', deps([file], [], logs)), file);
	assert.deepEqual(logs, []);
}));

test('accepts a file known only to the session cache without listing discovery', withTempDir(async (dir) => {
	const file = path.join(dir, 'cached.json');
	fs.writeFileSync(file, '{}');
	let listed = false;
	const d: SessionFilePathGuardDeps = { isCachedSessionFile: (p) => p === file, listSessionFiles: async () => { listed = true; return []; }, log: () => undefined };
	assert.equal(await findSessionFilePathProblem(file, d), undefined);
	assert.equal(listed, false);
}));

test('matches discovered paths by normalized identity (separators, case off Linux)', withTempDir(async (dir) => {
	const file = path.join(dir, 'Session.jsonl');
	fs.writeFileSync(file, '{}\n');
	const spelled = process.platform === 'linux' ? file : file.replace(/\\/g, '/').toUpperCase();
	assert.equal(await findSessionFilePathProblem(file, deps([spelled])), undefined);
}));

test('accepts a known virtual db#id session path when its database file exists', withTempDir(async (dir) => {
	const db = path.join(dir, 'state.sqlite');
	fs.writeFileSync(db, '');
	const virtual = `${db}#thread-1`;
	assert.equal(await findSessionFilePathProblem(virtual, deps([virtual])), undefined);
}));

test('rejects non-strings, empty strings and NUL bytes', async () => {
	for (const bad of [undefined, null, 42, {}, ['a'], '', 'a\0b']) {
		assert.notEqual(await findSessionFilePathProblem(bad, deps([])), undefined, `expected rejection for ${String(bad)}`);
	}
});

test('rejects relative paths even when they appear in the known list', async () => {
	assert.equal(await findSessionFilePathProblem('session.jsonl', deps(['session.jsonl'])), 'not an absolute path');
	assert.equal(await findSessionFilePathProblem('./a/session.jsonl', deps(['./a/session.jsonl'])), 'not an absolute path');
});

test('rejects ".." traversal even when it resolves to a known file', withTempDir(async (dir) => {
	const file = path.join(dir, 'session.jsonl');
	fs.writeFileSync(file, '{}\n');
	const traversal = dir + path.sep + 'sub' + path.sep + '..' + path.sep + 'session.jsonl';
	assert.equal(await findSessionFilePathProblem(traversal, deps([file, traversal])), 'contains a ".." segment');
	assert.equal(await findSessionFilePathProblem(dir + '/sub/../session.jsonl', deps([file])), 'contains a ".." segment');
}));

test('rejects an existing file that discovery does not know', withTempDir(async (dir) => {
	const known = path.join(dir, 'known.jsonl');
	const other = path.join(dir, 'secrets.txt');
	fs.writeFileSync(known, '{}\n');
	fs.writeFileSync(other, 'x');
	assert.equal(await findSessionFilePathProblem(other, deps([known])), 'not a discovered session file');
}));

test('rejects a known path that is a directory or no longer exists', withTempDir(async (dir) => {
	const sub = path.join(dir, 'folder.jsonl');
	fs.mkdirSync(sub);
	const gone = path.join(dir, 'gone.jsonl');
	assert.equal(await findSessionFilePathProblem(sub, deps([sub])), 'not an existing regular file');
	assert.equal(await findSessionFilePathProblem(gone, deps([gone])), 'not an existing regular file');
}));

test('a refusal is logged with its source and returns undefined; a failing discovery is a refusal', async () => {
	const logs: string[] = [];
	const abs = path.resolve(os.tmpdir(), 'nope.jsonl');
	assert.equal(await checkWebviewSessionFilePath(abs, 'openSessionFile:analysis', deps([], [], logs)), undefined);
	assert.equal(logs.length, 1);
	assert.match(logs[0], /openSessionFile:analysis/);
	assert.match(logs[0], /not a discovered session file/);

	const failing: SessionFilePathGuardDeps = { isCachedSessionFile: () => false, listSessionFiles: async () => { throw new Error('boom'); }, log: (m) => logs.push(m) };
	assert.equal(await checkWebviewSessionFilePath(abs, 'src', failing), undefined);
	assert.match(logs[1], /check failed: boom/);
});

test('parseWebviewTurnNumber keeps only positive safe integers', () => {
	assert.equal(parseWebviewTurnNumber(3), 3);
	for (const bad of [0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, '3', undefined, null, NaN]) {
		assert.equal(parseWebviewTurnNumber(bad), undefined);
	}
});

test('wiring: every webview handler that opens a session file goes through the path check', () => {
	const src = fs.readFileSync(path.join(__dirname, '../../../../src/extension.ts'), 'utf8');
	const analysis = src.slice(src.indexOf('private async _handleOpenSessionFile('), src.indexOf('private _getAnalysisMessageHandlers('));
	assert.match(analysis, /const file = await this\.checkWebviewSessionFile\(message\.file, 'openSessionFile:analysis'\); if \(!file\) \{ return; \}/);
	assert.doesNotMatch(analysis, /showLogViewer\(message\.file/);

	const diagStart = src.indexOf('private async handleDiagnosticConditionalCommand(');
	const diag = src.slice(diagStart, src.indexOf('private async handleDiagnosticTypedCommand(', diagStart));
	assert.match(diag, /case "openSessionFile":\s*\{ const file = await this\.checkWebviewSessionFile\(message\.file, 'openSessionFile:diagnostics'\); if \(file\)/);
	assert.match(diag, /case "openFormattedJsonlFile":\s*\{ const file = await this\.checkWebviewSessionFile\(message\.file, 'openFormattedJsonlFile:diagnostics'\); if \(file\)/);
	assert.doesNotMatch(diag, /showLogViewer\(message\.file|diagHandleOpenFormattedJsonlFile\(message\.file/);

	// No other place may hand a webview message's path straight to the log viewer or formatted view.
	assert.doesNotMatch(src, /showLogViewer\(message\./);
	assert.doesNotMatch(src, /showFormattedJsonlFile\(message\./);
	assert.match(src, /openSessionFile: \(message\) => this\._handleOpenSessionFile\(message\)/);
});
