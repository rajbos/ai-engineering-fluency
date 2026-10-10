import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import {
	collectSessionContentReferences,
	extractRepositoryFromSessionContent,
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
