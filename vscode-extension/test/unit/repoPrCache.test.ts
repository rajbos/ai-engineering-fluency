import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'fs';
import * as path from 'path';
import {
	REPO_PRS_CACHE_SCHEMA_VERSION,
	REPO_PRS_REFRESH_INTERVAL_MS,
	canServeRepoPrSnapshot,
	getRepoPrCachePath,
	isRepoPrEnvelopeUsable,
	isRepoPrSnapshotFresh,
	nextRepoPrRefreshAt,
	readRepoPrSnapshot,
	writeRepoPrSnapshot,
	type RepoPrCacheEnvelope,
} from '../../src/repoPrCache';
import type { RepoPrStatsResult } from '../../src/githubPrService';

const NOW = Date.parse('2026-08-29T12:00:00Z');
const SINCE = new Date('2026-07-30T12:00:00Z');

function makeResult(overrides: Partial<RepoPrStatsResult> = {}): RepoPrStatsResult {
	return {
		repos: [],
		authenticated: true,
		since: SINCE.toISOString(),
		fetchedAt: new Date(NOW).toISOString(),
		...overrides,
	};
}

function makeEnvelope(overrides: Partial<RepoPrCacheEnvelope> = {}): RepoPrCacheEnvelope {
	return {
		schemaVersion: REPO_PRS_CACHE_SCHEMA_VERSION,
		fetchedAt: new Date(NOW).toISOString(),
		since: SINCE.toISOString(),
		data: makeResult(),
		...overrides,
	};
}

// ---------------------------------------------------------------------------
// Freshness
// ---------------------------------------------------------------------------

test('isRepoPrSnapshotFresh: a snapshot younger than the interval is fresh', () => {
	const fetchedAt = new Date(NOW - 59 * 60 * 1000).toISOString();
	assert.equal(isRepoPrSnapshotFresh(fetchedAt, NOW), true);
});

test('isRepoPrSnapshotFresh: a snapshot at or past the interval is stale', () => {
	const exactly = new Date(NOW - REPO_PRS_REFRESH_INTERVAL_MS).toISOString();
	const older = new Date(NOW - 3 * REPO_PRS_REFRESH_INTERVAL_MS).toISOString();
	assert.equal(isRepoPrSnapshotFresh(exactly, NOW), false);
	assert.equal(isRepoPrSnapshotFresh(older, NOW), false);
});

test('isRepoPrSnapshotFresh: missing or unparseable timestamps are stale', () => {
	assert.equal(isRepoPrSnapshotFresh(undefined, NOW), false);
	assert.equal(isRepoPrSnapshotFresh('', NOW), false);
	assert.equal(isRepoPrSnapshotFresh('not-a-date', NOW), false);
});

test('isRepoPrSnapshotFresh: a far-future timestamp (clock change) is stale, not pinned fresh', () => {
	const future = new Date(NOW + 5 * REPO_PRS_REFRESH_INTERVAL_MS).toISOString();
	assert.equal(isRepoPrSnapshotFresh(future, NOW), false);
});

test('nextRepoPrRefreshAt: one interval after the fetch, undefined without one', () => {
	const fetchedAt = new Date(NOW).toISOString();
	assert.equal(nextRepoPrRefreshAt(fetchedAt), new Date(NOW + REPO_PRS_REFRESH_INTERVAL_MS).toISOString());
	assert.equal(nextRepoPrRefreshAt(undefined), undefined);
	assert.equal(nextRepoPrRefreshAt('nonsense'), undefined);
});

// ---------------------------------------------------------------------------
// Envelope usability
// ---------------------------------------------------------------------------

test('isRepoPrEnvelopeUsable: accepts a current-schema envelope covering the window', () => {
	assert.equal(isRepoPrEnvelopeUsable(makeEnvelope(), SINCE), true);
});

test('isRepoPrEnvelopeUsable: rejects a snapshot written by another schema version', () => {
	assert.equal(isRepoPrEnvelopeUsable(makeEnvelope({ schemaVersion: 0 }), SINCE), false);
});

test('isRepoPrEnvelopeUsable: rejects a snapshot covering a shorter window than asked for', () => {
	const shorter = makeEnvelope({ since: new Date(SINCE.getTime() + 24 * 60 * 60 * 1000).toISOString() });
	assert.equal(isRepoPrEnvelopeUsable(shorter, SINCE), false);
});

test('isRepoPrEnvelopeUsable: accepts a slightly older window (since is recomputed per call)', () => {
	const drifted = makeEnvelope({ since: new Date(SINCE.getTime() - 30 * 1000).toISOString() });
	assert.equal(isRepoPrEnvelopeUsable(drifted, SINCE), true);
});

test('isRepoPrEnvelopeUsable: rejects missing, malformed, and repo-less payloads', () => {
	assert.equal(isRepoPrEnvelopeUsable(undefined, SINCE), false);
	assert.equal(isRepoPrEnvelopeUsable(makeEnvelope({ since: 'garbage' }), SINCE), false);
	assert.equal(isRepoPrEnvelopeUsable({ ...makeEnvelope(), data: undefined as any }, SINCE), false);
});

test('canServeRepoPrSnapshot: a usable but stale snapshot is not served without a refresh', () => {
	const stale = makeEnvelope({ fetchedAt: new Date(NOW - 2 * REPO_PRS_REFRESH_INTERVAL_MS).toISOString() });
	assert.equal(isRepoPrEnvelopeUsable(stale, SINCE), true);
	assert.equal(canServeRepoPrSnapshot(stale, SINCE, NOW), false);
	assert.equal(canServeRepoPrSnapshot(makeEnvelope(), SINCE, NOW), true);
});

// ---------------------------------------------------------------------------
// Disk round-trip
// ---------------------------------------------------------------------------

test('getRepoPrCachePath: keeps dev and prod snapshots apart', () => {
	assert.equal(getRepoPrCachePath('/store', 'prod'), path.join('/store', 'repoprs_prod.snapshot.json'));
	assert.notEqual(getRepoPrCachePath('/store', 'dev-abc'), getRepoPrCachePath('/store', 'prod'));
});

test('writeRepoPrSnapshot/readRepoPrSnapshot: round-trips the snapshot', async () => {
	const dir = await fs.promises.mkdtemp(path.join(process.cwd(), 'repoprs-'));
	const filePath = getRepoPrCachePath(path.join(dir, 'nested'), 'prod');
	const envelope = makeEnvelope({ data: makeResult({ repos: [{ owner: 'a', repo: 'b', repoUrl: 'https://github.com/a/b', totalPrs: 3, aiAuthoredPrs: 1, aiReviewRequestedPrs: 0, aiDetails: [] }] }) });

	await writeRepoPrSnapshot(filePath, envelope);
	const readBack = await readRepoPrSnapshot(filePath);

	assert.deepEqual(readBack, envelope);
	assert.deepEqual(await fs.promises.readdir(path.dirname(filePath)), [path.basename(filePath)]);
	await fs.promises.rm(dir, { recursive: true, force: true });
});

test('readRepoPrSnapshot: missing or corrupt files read as undefined, never throw', async () => {
	const dir = await fs.promises.mkdtemp(path.join(process.cwd(), 'repoprs-'));
	const missing = path.join(dir, 'nope.json');
	const corrupt = path.join(dir, 'corrupt.json');
	await fs.promises.writeFile(corrupt, '{ this is not json', 'utf8');

	assert.equal(await readRepoPrSnapshot(missing), undefined);
	assert.equal(await readRepoPrSnapshot(corrupt), undefined);
	await fs.promises.rm(dir, { recursive: true, force: true });
});
