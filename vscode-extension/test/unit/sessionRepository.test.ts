import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'fs';
import * as path from 'path';

import {
	contentReferencesOfCliToolEvent,
	contentReferencesOfRequest,
	repositoryFromEcosystemMeta,
	resolveSessionAttributes,
	resolveSessionRepository,
} from '../../../src/sessionRepository';
import type { IEcosystemAdapter } from '../../../src/ecosystemAdapter';
import { makeWorkspaceFixtureDir } from './tmpFixtureDirs';

const REMOTE = 'https://github.com/octo/widgets.git';

/** A fake repository with an origin remote and one source file; returns the file's path. */
function makeRepoWithFile(): string {
	const root = makeWorkspaceFixtureDir('session-repo-');
	fs.mkdirSync(path.join(root, '.git'), { recursive: true });
	fs.writeFileSync(path.join(root, '.git', 'config'), `[remote "origin"]\n\turl = ${REMOTE}\n`);
	fs.mkdirSync(path.join(root, 'src'), { recursive: true });
	const file = path.join(root, 'src', 'index.ts');
	fs.writeFileSync(file, 'export {};\n');
	return file;
}

test('repositoryFromEcosystemMeta prefers the adapter id, else derives one from the workspace', () => {
	assert.equal(repositoryFromEcosystemMeta({ repository: 'octo/widgets', workspacePath: '/src/widgets' }), 'octo/widgets');
	assert.equal(repositoryFromEcosystemMeta({ repository: 'octo/widgets' }), 'octo/widgets', 'a recorded repository needs no workspace');
	assert.equal(repositoryFromEcosystemMeta({}), undefined, 'neither field means no repository');
	assert.ok(repositoryFromEcosystemMeta({ workspacePath: '/src/widgets' }), 'a workspace path yields a derived name');
});

test('contentReferencesOfCliToolEvent keeps only path-like tool arguments', () => {
	const refs = contentReferencesOfCliToolEvent({
		type: 'tool.execution_start',
		data: { arguments: { path: '/repo/src/a.ts', command: 'ls', n: 3, win: 'C:\\repo\\b.ts' } },
	});
	assert.deepEqual(refs.map(r => r.reference?.fsPath), ['/repo/src/a.ts', 'C:\\repo\\b.ts']);
	assert.deepEqual(contentReferencesOfCliToolEvent({ type: 'user.message', data: { arguments: { path: '/x/y' } } }), []);
});

test('contentReferencesOfRequest reads a request\'s contentReferences array only', () => {
	assert.deepEqual(contentReferencesOfRequest({ contentReferences: 'nope' }), []);
	assert.deepEqual(contentReferencesOfRequest(null), []);
	assert.equal(contentReferencesOfRequest({ contentReferences: [{ kind: 'reference' }] }).length, 1);
});

test('resolveSessionRepository finds the repository a JSON session referenced', async () => {
	const file = makeRepoWithFile();
	const content = JSON.stringify({ requests: [{ contentReferences: [{ kind: 'reference', reference: { fsPath: file } }] }] });
	assert.equal(await resolveSessionRepository([], 'session.json', content), REMOTE);
});

test('resolveSessionRepository finds the repository a Copilot CLI JSONL session touched', async () => {
	const file = makeRepoWithFile();
	const content = [
		{ type: 'user.message', data: { content: 'hi' } },
		{ type: 'tool.execution_start', data: { toolName: 'view', arguments: { path: file } } },
	].map(e => JSON.stringify(e)).join('\n');
	assert.equal(await resolveSessionRepository([], 'events.jsonl', content), REMOTE);
});

test('resolveSessionRepository: no references is "checked, none" (\'\'); an unreadable file is undefined', async () => {
	assert.equal(await resolveSessionRepository([], 'session.json', JSON.stringify({ requests: [{}] })), '');
	assert.equal(await resolveSessionRepository([], path.join(__dirname, 'no-such-dir', 'missing.json')), undefined);
});

test('resolveSessionRepository asks the owning ecosystem adapter', async () => {
	const eco = {
		handles: (f: string) => f.endsWith('.db#1'),
		getMeta: async () => ({ title: undefined, firstInteraction: null, lastInteraction: null, repository: 'octo/widgets', workspacePath: '/src/widgets' }),
	} as unknown as IEcosystemAdapter;
	assert.equal(await resolveSessionRepository([eco], 'store.db#1'), 'octo/widgets');
});

test('resolveSessionAttributes finds the repository of a delta-JSONL session and its custom title', async () => {
	const file = makeRepoWithFile();
	const content = [
		{ kind: 0, v: { customTitle: 'Plan the widget rewrite', requests: [] } },
		{ kind: 2, k: ['requests'], v: [{ requestId: 'r1', contentReferences: [{ kind: 'reference', reference: { fsPath: file } }] }] },
	].map(e => JSON.stringify(e)).join('\n');
	const attrs = await resolveSessionAttributes([], 'chat.jsonl', content);
	assert.equal(attrs?.repository, REMOTE);
	assert.equal(attrs?.title, 'Plan the widget rewrite');
});

test('resolveSessionAttributes returns the adapter title and a JSON session\'s custom title', async () => {
	const eco = {
		handles: (f: string) => f.endsWith('.db#2'),
		getMeta: async () => ({ title: 'Plan the release', firstInteraction: null, lastInteraction: null, repository: 'octo/widgets' }),
	} as unknown as IEcosystemAdapter;
	assert.deepEqual(await resolveSessionAttributes([eco], 'store.db#2'), { repository: 'octo/widgets', title: 'Plan the release' });
	assert.deepEqual(
		await resolveSessionAttributes([], 'session.json', JSON.stringify({ customTitle: 'Debug the crash', requests: [] })),
		{ repository: '', title: 'Debug the crash' },
	);
});
