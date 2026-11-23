/**
 * A DB-backed session is cached under its own activity time, not the shared database's
 * mtime and size, so a write to one session no longer invalidates every other cached
 * session in the same database (#2710).
 *
 * The OpenCode adapter is stubbed, so no real database is read. The home directory points
 * at a temp folder so a periodic cache flush can never touch the real CLI cache.
 */
import test, { type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { processSessionFile } from '../helpers';
import { getEcosystems, sessionCacheStamp, DB_SESSION_STAMP_SIZE } from '../sessionProcessing';

function useTempHome(t: TestContext): void {
	const home = fs.mkdtempSync(path.join(os.tmpdir(), 'db-session-cache-'));
	const saved = { HOME: process.env.HOME, USERPROFILE: process.env.USERPROFILE };
	process.env.HOME = home;
	process.env.USERPROFILE = home;
	t.after(() => {
		process.env.HOME = saved.HOME;
		process.env.USERPROFILE = saved.USERPROFILE;
		fs.rmSync(home, { recursive: true, force: true });
	});
}

/** Stubs the OpenCode adapter: a shared db stat and a per-session activity the test controls. */
function stubOpenCode(t: TestContext) {
	const eco = getEcosystems().find(e => e.id === 'opencode');
	assert.ok(eco, 'the OpenCode adapter is registered');
	const state = { dbMtimeMs: 1_700_000_000_000, dbSize: 500_000_000, activity: new Date(1_699_000_000_000) as Date | null, parses: 0 };
	t.mock.method(eco, 'stat', async () => ({ mtimeMs: state.dbMtimeMs, mtime: new Date(state.dbMtimeMs), size: state.dbSize }) as unknown as fs.Stats);
	const optional = eco as Required<Pick<typeof eco, 'getLastActivity' | 'getDailyFractions'>>;
	t.mock.method(optional, 'getLastActivity', async () => state.activity);
	t.mock.method(eco, 'getTokens', async () => { state.parses++; return { tokens: 42, thinkingTokens: 0, actualTokens: 42 }; });
	t.mock.method(eco, 'countInteractions', async () => 1);
	t.mock.method(eco, 'getModelUsage', async () => ({}));
	if (eco.getDailyFractions) { t.mock.method(optional, 'getDailyFractions', async () => ({ '2026-11-01': 1 })); }
	return state;
}

const sessionPath = (id: string) => path.join(os.homedir(), '.local', 'share', 'opencode', `opencode.db#ses_${id}`);

test('sessionCacheStamp uses a DB-backed session\'s own activity, otherwise the stat', () => {
	assert.deepEqual(sessionCacheStamp({ mtimeMs: 1, size: 2 }), { mtimeMs: 1, size: 2 });
	assert.deepEqual(sessionCacheStamp({ mtimeMs: 1, size: 2, activityMs: 5 }), { mtimeMs: 5, size: DB_SESSION_STAMP_SIZE });
});

test('a write elsewhere in the database does not invalidate an unchanged session', async t => {
	useTempHome(t);
	const state = stubOpenCode(t);
	const file = sessionPath('unchanged');

	assert.equal((await processSessionFile(file))?.tokens, 42);
	assert.equal(state.parses, 1);

	state.dbMtimeMs += 60_000;
	state.dbSize += 4096;
	await processSessionFile(file);
	assert.equal(state.parses, 1, 'the shared database changed, this session did not: served from cache');

	state.activity = new Date(state.activity!.getTime() + 1);
	await processSessionFile(file);
	assert.equal(state.parses, 2, 'this session\'s own activity moved: re-parsed once');
	await processSessionFile(file);
	assert.equal(state.parses, 2);
});

test('a DB-backed session with no known activity is still keyed on the database stat', async t => {
	useTempHome(t);
	const state = stubOpenCode(t);
	state.activity = null;
	const file = sessionPath('no-activity');

	await processSessionFile(file);
	await processSessionFile(file);
	assert.equal(state.parses, 1, 'an unchanged database is served from cache');

	state.dbMtimeMs += 60_000;
	await processSessionFile(file);
	assert.equal(state.parses, 2, 'without its own activity a database change must re-parse it');
});
