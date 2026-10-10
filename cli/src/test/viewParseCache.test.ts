/**
 * The view parse (processSessionFileForViews) reads a session twice — the base parse, then the
 * usage analysis — and writes the enriched result back to the session cache. It must key that
 * entry by the stat taken before reading, and skip the write when the file changed in between:
 * otherwise an actively-written session stores data parsed from an older version under the
 * newer mtime, and the stale entry is served until the file changes again.
 *
 * Kept in its own file because the other contract tests disable the cache. This file never
 * loads or saves the on-disk cache, so it only touches the in-memory map.
 */
import test, { type TestContext } from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'fs';
import * as path from 'path';

import { calculateDailyStats, calculateEfficiencySessionInputs, calculateUsageAnalysisStats, calculateViewStats, processSessionFileForViews } from '../helpers';
import { getCached } from '../cliCache';

type MockOptions = { changeDuringAnalysis?: boolean; failAnalysisRead?: boolean; content?: string };

function mockSession(t: TestContext, id: string, changeDuringAnalysis: boolean | MockOptions): { filePath: string; mtimes: number[]; reads: () => number } {
	const opts: MockOptions = typeof changeDuringAnalysis === 'boolean' ? { changeDuringAnalysis } : changeDuringAnalysis;
	const filePath = path.join(__dirname, 'workspaceStorage', 'synthetic', 'chatSessions', `${id}.json`);
	const content = opts.content ?? JSON.stringify({ requests: [{
		requestId: 'r1', timestamp: Date.now(), modelId: 'copilot/gpt-4o',
		message: { text: 'Write a test', parts: [{ text: 'Write a test' }] },
		response: [], result: { promptTokens: 100, outputTokens: 20 },
	}] });
	const first = new Date(); first.setMilliseconds(0);
	let mtime = first.getTime();
	const mtimes = [mtime];
	let sessionReads = 0;
	t.mock.method(fs.promises, 'stat', async (file: string) => {
		assert.equal(file, filePath);
		return { mtime: new Date(mtime), mtimeMs: mtime, size: content.length, isFile: () => true } as unknown as fs.Stats;
	});
	t.mock.method(fs.promises, 'readFile', async (file: string) => {
		if (file === filePath) {
			// The second read is the usage analysis: simulate the editor appending meanwhile.
			if (++sessionReads === 2 && opts.changeDuringAnalysis) { mtime += 5000; mtimes.push(mtime); }
			if (sessionReads === 2 && opts.failAnalysisRead) { throw Object.assign(new Error('EBUSY'), { code: 'EBUSY' }); }
			return content;
		}
		throw Object.assign(new Error('no debug log'), { code: 'ENOENT' });
	});
	return { filePath, mtimes, reads: () => sessionReads };
}

test('the enriched view parse is cached under the pre-parse stat when the file is unchanged', async t => {
	const { filePath, mtimes } = mockSession(t, '22222222-2222-4222-8222-222222222222', false);
	const data = await processSessionFileForViews(filePath);
	assert.equal(data?.viewAttributesResolved, true);
	const size = (await fs.promises.stat(filePath)).size;
	assert.equal(getCached(filePath, mtimes[0], size)?.viewAttributesResolved, true);
});

test('the enriched view parse is not cached when the file changed while it was read', async t => {
	const { filePath, mtimes } = mockSession(t, '33333333-3333-4333-8333-333333333333', true);
	const data = await processSessionFileForViews(filePath);
	assert.equal(data?.viewAttributesResolved, true, 'this run still gets the enriched data');
	assert.equal(mtimes.length, 2, 'the fixture must have changed the file during the analysis read');
	const size = (await fs.promises.stat(filePath)).size;
	assert.equal(getCached(filePath, mtimes[1], size), null, 'older data must not be stored under the newer mtime');
	assert.equal(getCached(filePath, mtimes[0], size)?.viewAttributesResolved, undefined, 'only the base parse stays cached for the old version');
});

test('a failed view analysis is neither marked resolved nor cached, so the next run retries', async t => {
	// analyzeSessionUsage() swallows read/parser errors and returns an empty analysis; caching
	// that as resolved would hide the session's task/LOC/efficiency data until the file changes.
	const { filePath, mtimes } = mockSession(t, '44444444-4444-4444-8444-444444444444', { failAnalysisRead: true });
	const data = await processSessionFileForViews(filePath);
	assert.ok(data, 'the base parse still counts the session');
	assert.equal(data.viewAttributesResolved, undefined);
	assert.equal(data.taskCategory, undefined);
	const size = (await fs.promises.stat(filePath)).size;
	assert.equal(getCached(filePath, mtimes[0], size)?.viewAttributesResolved, undefined);
});

test('calculateViewStats walks the files once and matches the single-purpose collectors', async t => {
	const { filePath, reads } = mockSession(t, '55555555-5555-4555-8555-555555555555', false);
	const viewStats = await calculateViewStats([filePath]);
	assert.equal(reads(), 2, 'one base parse and one usage analysis — not a second walk');
	assert.deepEqual(viewStats.dailyStats, await calculateDailyStats([filePath]));
	assert.deepEqual(viewStats.efficiencySessionInputs, await calculateEfficiencySessionInputs([filePath]));
	assert.equal(reads(), 2, 'the collectors reuse the cached enriched parse');
	assert.equal(viewStats.efficiencySessionInputs.length, 1);
});

test('a non-fatal analysis warning does not discard the enriched view parse', async t => {
	// analyzeSessionUsage() also uses deps.warn for notices that leave a valid analysis (here an
	// unexpected session format). Only its dedicated onAnalysisError signal marks a failure.
	const { filePath, mtimes } = mockSession(t, '66666666-6666-4666-8666-666666666666', { content: JSON.stringify({ requests: 'not-an-array' }) });
	const data = await processSessionFileForViews(filePath);
	assert.ok(data);
	assert.equal(data.viewAttributesResolved, true, 'a warning alone must not be treated as a failed analysis');
	const size = (await fs.promises.stat(filePath)).size;
	assert.equal(getCached(filePath, mtimes[0], size)?.viewAttributesResolved, true);
});

test('the view walk and Usage Analysis share one analysis per file version', async t => {
	// `cli all` and the desktop Efficiency build need both; the session cache only keeps the
	// slim enriched data, so without the shared analysis each recent session was analyzed twice.
	const { filePath, reads } = mockSession(t, '88888888-8888-4888-8888-888888888888', false);
	await calculateViewStats([filePath]);
	assert.equal(reads(), 2, 'one base parse and one read shared by analysis and repository');
	const usage = await calculateUsageAnalysisStats([filePath]);
	assert.equal(reads(), 2, 'Usage Analysis must reuse the analysis instead of reading the session again');
	assert.equal(usage.last30Days.sessions, 1);
});
