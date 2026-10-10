import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import {
	collectSessionContentReferences,
	extractRepositoryFromSessionContent,
	extractWorkspaceRepository,
	referencesWithinWorkspace,
	requestContentReferences,
	toolArgumentPathReferences,
} from '../../../src/sessionRepository';

const ref = (fsPath: string) => ({ kind: 'reference', reference: { fsPath } });

test('requestContentReferences: a request\'s own references, or nothing', () => {
	assert.deepEqual(requestContentReferences({ contentReferences: [ref('/a/b.ts')] }), [ref('/a/b.ts')]);
	assert.deepEqual(requestContentReferences({ contentReferences: 'nope' }), []);
	assert.deepEqual(requestContentReferences(null), []);
	assert.deepEqual(requestContentReferences(undefined), []);
});

test('toolArgumentPathReferences: path-like string arguments only', () => {
	assert.deepEqual(toolArgumentPathReferences({ path: '/repo/src/a.ts', file: 'C:\\repo\\b.ts', n: 3, short: 'a/b', text: 'hello' }), [
		ref('/repo/src/a.ts'),
		ref('C:\\repo\\b.ts'),
	]);
	assert.deepEqual(toolArgumentPathReferences(undefined), []);
	assert.deepEqual(toolArgumentPathReferences('not-an-object'), []);
});

test('collectSessionContentReferences reads VS Code JSON, VS Code delta JSONL and Copilot CLI JSONL', async () => {
	const json = JSON.stringify({ requests: [{ contentReferences: [ref('/r/a.ts')] }, { contentReferences: [ref('/r/b.ts')] }] });
	assert.deepEqual(await collectSessionContentReferences(json), [ref('/r/a.ts'), ref('/r/b.ts')]);

	const delta = [
		JSON.stringify({ kind: 0, v: { version: 3, requests: [] } }),
		JSON.stringify({ kind: 2, k: ['requests'], v: { requestId: 'r1', message: { text: 'x' }, contentReferences: [ref('/r/c.ts')] } }),
	].join('\n');
	assert.deepEqual(await collectSessionContentReferences(delta), [ref('/r/c.ts')]);

	const cli = [
		JSON.stringify({ type: 'user.message', data: { content: 'hi' } }),
		JSON.stringify({ type: 'tool.execution_start', data: { toolName: 'view', arguments: { path: '/r/d.ts' } } }),
		'not json',
	].join('\n');
	assert.deepEqual(await collectSessionContentReferences(cli), [ref('/r/d.ts')]);

	assert.deepEqual(await collectSessionContentReferences('{ broken'), []);
	assert.deepEqual(await collectSessionContentReferences(JSON.stringify({ requests: 'nope' })), []);
});

test('extractRepositoryFromSessionContent finds the remote of the referenced files\' repository', async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'session-repo-'));
	try {
		const repo = path.join(root, 'widget');
		fs.mkdirSync(path.join(repo, '.git'), { recursive: true });
		fs.mkdirSync(path.join(repo, 'src'));
		fs.writeFileSync(path.join(repo, '.git', 'config'), '[remote "origin"]\n\turl = https://github.com/acme/widget.git\n');
		const file = path.join(repo, 'src', 'index.ts');
		fs.writeFileSync(file, '');

		const content = JSON.stringify({ requests: [{ contentReferences: [ref(file)] }] });
		assert.equal(await extractRepositoryFromSessionContent(content), 'https://github.com/acme/widget.git');
		assert.equal(await extractRepositoryFromSessionContent(JSON.stringify({ requests: [] })), undefined);
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
});

test('referencesWithinWorkspace keeps only files inside the workspace folder', () => {
	const refs = [
		ref('C:\\code\\app\\src\\a.ts'),
		ref('/c:/code/app/b.ts'), // URI-style path of the same folder
		ref('C:\\code\\app-other\\c.ts'), // shares the prefix, not the folder
		ref('C:\\code\\lib\\d.ts'),
		{ kind: 'reference', inlineReference: { path: 'c:/CODE/App/e.ts' } },
		{ kind: 'reference' },
	];
	assert.deepEqual(
		referencesWithinWorkspace(refs, 'C:\\code\\app\\').map(r => (r.reference ?? r.inlineReference)?.fsPath ?? (r.reference ?? r.inlineReference)?.path),
		['C:\\code\\app\\src\\a.ts', '/c:/code/app/b.ts', 'c:/CODE/App/e.ts'],
	);
	assert.equal(referencesWithinWorkspace([ref('/home/u/app')], '/home/u/app').length, 1, 'the folder itself counts');
});

test('referencesWithinWorkspace resolves dot segments and folds case only on case-insensitive filesystems', () => {
	// `..` is resolved before the boundary check: this file is in /home/u/lib, not /home/u/app.
	assert.equal(referencesWithinWorkspace([ref('/home/u/app/../lib/file.ts')], '/home/u/app', 'linux').length, 0);
	assert.equal(referencesWithinWorkspace([ref('/home/u/app/./src/../file.ts')], '/home/u/app', 'linux').length, 1);
	assert.equal(referencesWithinWorkspace([ref('C:\\code\\app\\..\\lib\\x.ts')], 'C:\\code\\app', 'win32').length, 0);
	// Linux paths keep their case; Windows paths and macOS fold it.
	assert.equal(referencesWithinWorkspace([ref('/home/u/App/x.ts')], '/home/u/app', 'linux').length, 0);
	assert.equal(referencesWithinWorkspace([ref('/Users/u/App/x.ts')], '/Users/u/app', 'darwin').length, 1);
	assert.equal(referencesWithinWorkspace([ref('C:\\Code\\App\\x.ts')], 'c:\\code\\app', 'linux').length, 1, 'a drive-letter path is case-insensitive whatever the host');
	// UNC roots keep their double separator and still match.
	assert.equal(referencesWithinWorkspace([ref('\\\\nas\\code\\app\\x.ts')], '//nas/code/app', 'win32').length, 1);
	assert.equal(referencesWithinWorkspace([ref('\\\\nas\\code\\app\\x.ts')], '/nas/code/app', 'linux').length, 0, 'a UNC path is not the POSIX /nas path');
});

test('extractWorkspaceRepository ignores a repository the session only referenced from outside its workspace', async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'session-repo-'));
	try {
		const makeRepo = (name: string) => {
			const repo = path.join(root, name);
			fs.mkdirSync(path.join(repo, '.git'), { recursive: true });
			fs.writeFileSync(path.join(repo, '.git', 'config'), `[remote "origin"]\n\turl = https://github.com/acme/${name}.git\n`);
			const file = path.join(repo, 'index.ts');
			fs.writeFileSync(file, '');
			return { repo, file };
		};
		const a = makeRepo('app');
		const b = makeRepo('lib');
		// The session's workspace is repo A; it looked at repo B first.
		const refs = [ref(b.file), ref(a.file)];
		assert.equal(await extractWorkspaceRepository(refs, a.repo), 'https://github.com/acme/app.git');
		assert.equal(await extractWorkspaceRepository([ref(b.file)], a.repo), undefined, 'only an outside reference: no remote');
		assert.equal(await extractWorkspaceRepository([ref(b.file)]), 'https://github.com/acme/lib.git', 'no known workspace: every reference counts');
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
});
