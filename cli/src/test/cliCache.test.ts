/**
 * The CLI session cache persists progress during a run and writes atomically (#2710).
 * Every test points the home directory at a temp folder, so the real cache is never touched.
 */
import test, { mock } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { CACHE_SAVE_INTERVAL_MS, MAX_CACHE_ENTRIES, getCachePath, loadCache, saveCache, setCached } from '../cliCache';
import type { SessionData } from '../helpers';

function withTempHome(t: { after: (fn: () => void) => void }): string {
	const home = fs.mkdtempSync(path.join(os.tmpdir(), 'cli-cache-test-'));
	const saved = { HOME: process.env.HOME, USERPROFILE: process.env.USERPROFILE };
	process.env.HOME = home;
	process.env.USERPROFILE = home;
	t.after(() => {
		process.env.HOME = saved.HOME;
		process.env.USERPROFILE = saved.USERPROFILE;
		fs.rmSync(home, { recursive: true, force: true });
	});
	return home;
}

function session(file: string): SessionData {
	return { file, lastModified: new Date('2026-11-01T00:00:00Z'), tokens: 10, interactions: 1, modelUsage: {} } as unknown as SessionData;
}

function readEntries(): Record<string, unknown> {
	return JSON.parse(fs.readFileSync(getCachePath(), 'utf-8')).entries;
}

test('the cache keeps far more than the old 2,000-entry cap', () => {
	assert.ok(MAX_CACHE_ENTRIES >= 10_000, `MAX_CACHE_ENTRIES is ${MAX_CACHE_ENTRIES}`);
});

test('a long run flushes parsed entries to disk before it finishes', (t) => {
	const home = withTempHome(t);
	mock.timers.enable({ apis: ['Date'], now: 1_000_000 });
	t.after(() => mock.timers.reset());

	loadCache();
	assert.ok(getCachePath().startsWith(home));
	setCached('/s/one.jsonl', 1, 1, session('/s/one.jsonl'));
	assert.equal(fs.existsSync(getCachePath()), false, 'no write before the interval');

	mock.timers.tick(CACHE_SAVE_INTERVAL_MS);
	setCached('/s/two.jsonl', 1, 1, session('/s/two.jsonl'));
	assert.deepEqual(Object.keys(readEntries()).sort(), ['/s/one.jsonl', '/s/two.jsonl'], 'progress so far is on disk without a final saveCache()');

	setCached('/s/three.jsonl', 1, 1, session('/s/three.jsonl'));
	assert.equal(Object.keys(readEntries()).length, 2, 'the next flush waits for another interval');
	saveCache();
	assert.equal(Object.keys(readEntries()).length, 3, 'the end-of-run save still writes the rest');
});

test('saveCache replaces the file atomically and leaves no temp file behind', (t) => {
	withTempHome(t);
	loadCache();
	setCached('/s/a.jsonl', 1, 1, session('/s/a.jsonl'));
	saveCache();
	const dir = path.dirname(getCachePath());
	assert.deepEqual(fs.readdirSync(dir), ['cli-cache.json']);
	assert.ok(readEntries()['/s/a.jsonl']);
});

test('a failed write keeps the previous cache file intact', (t) => {
	withTempHome(t);
	loadCache();
	setCached('/s/a.jsonl', 1, 1, session('/s/a.jsonl'));
	saveCache();
	const before = fs.readFileSync(getCachePath(), 'utf-8');

	setCached('/s/b.jsonl', 1, 1, session('/s/b.jsonl'));
	const tmpPath = `${getCachePath()}.${process.pid}.tmp`;
	fs.mkdirSync(tmpPath); // a directory where the temp file should go makes the write fail
	saveCache();
	assert.equal(fs.readFileSync(getCachePath(), 'utf-8'), before);
	fs.rmdirSync(tmpPath);
});
