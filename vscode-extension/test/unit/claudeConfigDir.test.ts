import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { makeTmpFixtureDir } from './tmpFixtureDirs';

import { ClaudeCodeDataAccess } from '../../../src/claudecode';
import {
	detectRelocatedAgentHomeFromPath,
	isClaudeCodeSetAsideTranscript,
	normalizePathForComparison,
	resolveClaudeConfigDir,
} from '../../../src/workspaceHelpers';

const SESSION = '0a1b2c3d-1111-2222-3333-444455556666';

/** Runs `fn` with CLAUDE_CONFIG_DIR set (or removed for `undefined`), restoring it afterwards. */
async function withClaudeConfigDir<T>(value: string | undefined, fn: () => Promise<T> | T): Promise<T> {
	const previous = process.env.CLAUDE_CONFIG_DIR;
	if (value === undefined) { delete process.env.CLAUDE_CONFIG_DIR; } else { process.env.CLAUDE_CONFIG_DIR = value; }
	try {
		return await fn();
	} finally {
		if (previous === undefined) { delete process.env.CLAUDE_CONFIG_DIR; } else { process.env.CLAUDE_CONFIG_DIR = previous; }
	}
}

function writeTranscript(file: string): void {
	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.writeFileSync(file, JSON.stringify({ type: 'user', sessionId: SESSION, entrypoint: 'cli', timestamp: '2026-11-20T10:00:00Z', message: { role: 'user', content: 'hi' } }) + '\n');
}

test('resolveClaudeConfigDir: unset or blank means default, a value resolves to an absolute path', () => {
	assert.equal(resolveClaudeConfigDir({}), undefined);
	assert.equal(resolveClaudeConfigDir({ CLAUDE_CONFIG_DIR: '   ' }), undefined);
	const dir = path.join(os.tmpdir(), 'claude-cfg');
	assert.equal(resolveClaudeConfigDir({ CLAUDE_CONFIG_DIR: dir }), path.resolve(dir));
	assert.equal(resolveClaudeConfigDir({ CLAUDE_CONFIG_DIR: 'relative-cfg' }), path.resolve('relative-cfg'));
});

test('ClaudeCodeDataAccess honours CLAUDE_CONFIG_DIR for the data and projects dirs', async () => {
	const dir = makeTmpFixtureDir('ctt-claude-cfg-');
	await withClaudeConfigDir(dir, () => {
		const access = new ClaudeCodeDataAccess();
		assert.equal(access.getClaudeCodeDataDir(), dir);
		assert.equal(access.getClaudeCodeProjectsDir(), path.join(dir, 'projects'));
		assert.ok(access.isClaudeCodeSessionFile(path.join(dir, 'projects', 'proj', `${SESSION}.jsonl`)));
	});
	await withClaudeConfigDir(undefined, () => {
		assert.equal(new ClaudeCodeDataAccess().getClaudeCodeDataDir(), path.join(os.homedir(), '.claude'));
	});
});

test('getClaudeCodeSessionFiles finds sessions under CLAUDE_CONFIG_DIR and skips set-aside copies', async () => {
	const dir = makeTmpFixtureDir('ctt-claude-cfg-');
	const project = path.join(dir, 'projects', 'C--work-repo');
	const live = path.join(project, `${SESSION}.jsonl`);
	const subagent = path.join(project, SESSION, 'subagents', 'agent-abc.jsonl');
	const orphaned = path.join(project, `${SESSION}.orphaned-1764000000000-x1y2.jsonl`);
	const superseded = path.join(project, `${SESSION}.jsonl.superseded-1764000000000`);
	for (const file of [live, subagent, orphaned, superseded]) { writeTranscript(file); }

	const found = await withClaudeConfigDir(dir, () => new ClaudeCodeDataAccess().getClaudeCodeSessionFiles());

	assert.deepEqual(found.sort(), [live, subagent].sort(),
		'the live transcript and its subagent transcript count; an orphaned or superseded copy of the same session must not, or that session is counted twice');
	const access = new ClaudeCodeDataAccess();
	await withClaudeConfigDir(dir, () => {
		assert.equal(access.isClaudeCodeSessionFile(orphaned), false);
		assert.equal(access.isClaudeCodeSessionFile(live), true);
	});
});

test('isClaudeCodeSetAsideTranscript matches only orphaned copies', () => {
	assert.equal(isClaudeCodeSetAsideTranscript(`${SESSION}.orphaned-1764000000000-ab12.jsonl`), true);
	assert.equal(isClaudeCodeSetAsideTranscript(`${SESSION}.ORPHANED-1764000000000-ab12.JSONL`), true);
	assert.equal(isClaudeCodeSetAsideTranscript(`${SESSION}.jsonl`), false);
	assert.equal(isClaudeCodeSetAsideTranscript('agent-orphaned.jsonl'), false, 'a name merely containing "orphaned" is not a set-aside copy');
});

test('detectRelocatedAgentHomeFromPath attributes CLAUDE_CONFIG_DIR transcripts to Claude Code', () => {
	const dir = path.join(os.tmpdir(), 'my-claude-data');
	const env = { CLAUDE_CONFIG_DIR: dir };
	const transcript = normalizePathForComparison(path.join(dir, 'projects', 'proj', `${SESSION}.jsonl`));
	// No filePath: the variant is not peeked, the generic label is returned.
	assert.equal(detectRelocatedAgentHomeFromPath(transcript, env), 'Claude Code');
	// Only the projects tree belongs to sessions; other files under the config dir don't match.
	assert.equal(detectRelocatedAgentHomeFromPath(normalizePathForComparison(path.join(dir, 'settings.json')), env), undefined);
	assert.equal(detectRelocatedAgentHomeFromPath(transcript, {}), undefined);
});
