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

import { processSessionFileForViews } from '../helpers';
import { getCached } from '../cliCache';

function mockSession(t: TestContext, id: string, changeDuringAnalysis: boolean): { filePath: string; mtimes: number[] } {
	const filePath = path.join(__dirname, 'workspaceStorage', 'synthetic', 'chatSessions', `${id}.json`);
	const content = JSON.stringify({ requests: [{
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
			if (++sessionReads === 2 && changeDuringAnalysis) { mtime += 5000; mtimes.push(mtime); }
			return content;
		}
		throw Object.assign(new Error('no debug log'), { code: 'ENOENT' });
	});
	return { filePath, mtimes };
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
