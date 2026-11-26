/**
 * calculateDetailedStats (`usage`, `environmental`, `segment`, `all`) only reports windows from
 * the start of last month on, so it skips parsing sessions that certainly had no activity since
 * then. A regular file is judged by its mtime; a DB-backed (virtual) session by its own
 * adapter-reported activity, never by the shared database's mtime.
 */
import test, { type TestContext } from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'fs';
import * as path from 'path';

import { calculateDetailedStats, createSessionActivityLookup, mayHaveActivitySince, recentAnalysisCutoff } from '../helpers';
import { disableCache } from '../cliCache';

const DAY_MS = 86_400_000;

/** A VS Code chat session file with one request at `when`, its mtime set to `when`; counts reads of it. */
function sessionFile(t: TestContext, id: string, when: Date): { filePath: string; reads: () => number } {
	// Under the git-ignored build output: the size-guarded reader refuses os.tmpdir().
	const root = fs.mkdtempSync(path.join(__dirname, 'prefilter-'));
	t.after(() => fs.rmSync(root, { recursive: true, force: true }));
	const filePath = path.join(root, 'workspaceStorage', 'synthetic', 'chatSessions', `${id}.json`);
	fs.mkdirSync(path.dirname(filePath), { recursive: true });
	fs.writeFileSync(filePath, JSON.stringify({ requests: [{
		requestId: 'r1', timestamp: when.getTime(), modelId: 'copilot/gpt-4o',
		message: { text: 'Write a test', parts: [{ text: 'Write a test' }] },
		response: [], result: { promptTokens: 100, outputTokens: 20 },
	}] }));
	fs.utimesSync(filePath, when, when);
	let reads = 0;
	const realOpen = fs.promises.open.bind(fs.promises) as (...a: unknown[]) => Promise<unknown>;
	const realReadFile = fs.promises.readFile.bind(fs.promises) as (...a: unknown[]) => Promise<unknown>;
	t.mock.method(fs.promises, 'open', async (file: string, ...rest: unknown[]) => {
		if (file === filePath) { reads++; }
		return realOpen(file, ...rest);
	});
	t.mock.method(fs.promises, 'readFile', async (file: string, ...rest: unknown[]) => {
		if (file === filePath) { reads++; }
		return realReadFile(file, ...rest);
	});
	return { filePath, reads: () => reads };
}

test('mayHaveActivitySince: a regular file is judged by its own mtime', async t => {
	const cutoff = recentAnalysisCutoff();
	const old = sessionFile(t, '55555555-5555-4555-8555-555555555555', new Date(cutoff.getTime() - 10 * DAY_MS));
	assert.equal(await mayHaveActivitySince(old.filePath, cutoff), false);
	assert.equal(await mayHaveActivitySince(old.filePath, new Date(cutoff.getTime() - 20 * DAY_MS)), true);
	// A file that cannot be stat'ed is kept, so processSessionFile reports it as before.
	assert.equal(await mayHaveActivitySince(path.join(__dirname, 'missing-session.json'), cutoff), true);
});

test('mayHaveActivitySince: a DB-backed session is judged by its own activity, never the database mtime', async () => {
	const cutoff = new Date(2026, 4, 1);
	const virtual = (lastActivity: Date | null) => createSessionActivityLookup('store.db#1', {
		getBackingPath: () => 'store.db',
		getLastActivity: async () => lastActivity,
		getMeta: async () => null,
	});
	// The database file is never stat'ed for a virtual session (its path does not even exist
	// here): an old database mtime with recent own activity keeps the session.
	assert.equal(await mayHaveActivitySince('store.db#1', cutoff, virtual(new Date(2026, 4, 5))), true);
	assert.equal(await mayHaveActivitySince('store.db#1', cutoff, virtual(new Date(2026, 3, 5))), false);
	// Unknown own activity: kept, rather than decided by the database mtime.
	assert.equal(await mayHaveActivitySince('store.db#1', cutoff, virtual(null)), true);
});

test('calculateDetailedStats does not parse a session file last written before the window', async t => {
	disableCache();
	const old = sessionFile(t, '66666666-6666-4666-8666-666666666666', new Date(recentAnalysisCutoff().getTime() - 5 * DAY_MS));
	const recent = sessionFile(t, '77777777-7777-4777-8777-777777777777', new Date());
	let progress = 0;
	const stats = await calculateDetailedStats([old.filePath, recent.filePath], (completed) => { progress = completed; });
	assert.equal(old.reads(), 0, 'the old session must not be read');
	assert.ok(recent.reads() > 0, 'the recent session is parsed');
	assert.equal(progress, 2, 'skipped files still count towards progress');
	assert.equal(stats.today.sessions, 1);
	assert.equal(stats.lastMonth.sessions + stats.month.sessions, 1);
});
