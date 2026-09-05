import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
	AGENT_TASKS_CACHE_SCHEMA_VERSION,
	AGENT_TASKS_REFRESH_INTERVAL_MS,
	canServeAgentTasksSnapshot,
	getAgentTasksCachePath,
	isAgentTasksEnvelopeUsable,
	isAgentTasksSnapshotFresh,
	nextAgentTasksRefreshAt,
	readAgentTasksSnapshot,
	writeAgentTasksSnapshot,
	type AgentTasksCacheEnvelope,
} from '../../src/agentTasksCache';
import type { AgentSessionsResult } from '../../../src/types';

const NOW = Date.parse('2026-08-29T12:00:00Z');
const SINCE = new Date('2026-07-30T12:00:00Z');

function makeResult(overrides: Partial<AgentSessionsResult> = {}): AgentSessionsResult {
	return {
		repos: [],
		totalTasks: 0,
		totalSessions: 0,
		totalCredits: 0,
		totalPremiumRequests: 0,
		authenticated: true,
		since: SINCE.toISOString(),
		fetchedAt: new Date(NOW).toISOString(),
		accountTasksAvailable: true,
		partial: false,
		...overrides,
	};
}

function makeEnvelope(overrides: Partial<AgentTasksCacheEnvelope> = {}): AgentTasksCacheEnvelope {
	return {
		schemaVersion: AGENT_TASKS_CACHE_SCHEMA_VERSION,
		fetchedAt: new Date(NOW).toISOString(),
		since: SINCE.toISOString(),
		data: makeResult(),
		...overrides,
	};
}

// ---------------------------------------------------------------------------
// Freshness
// ---------------------------------------------------------------------------

test('isAgentTasksSnapshotFresh: a snapshot younger than the interval is fresh', () => {
	const fetchedAt = new Date(NOW - 59 * 60 * 1000).toISOString();
	assert.equal(isAgentTasksSnapshotFresh(fetchedAt, NOW), true);
});

test('isAgentTasksSnapshotFresh: a snapshot at or past the interval is stale', () => {
	const exactly = new Date(NOW - AGENT_TASKS_REFRESH_INTERVAL_MS).toISOString();
	const older = new Date(NOW - 3 * AGENT_TASKS_REFRESH_INTERVAL_MS).toISOString();
	assert.equal(isAgentTasksSnapshotFresh(exactly, NOW), false);
	assert.equal(isAgentTasksSnapshotFresh(older, NOW), false);
});

test('isAgentTasksSnapshotFresh: missing or unparseable timestamps are stale', () => {
	assert.equal(isAgentTasksSnapshotFresh(undefined, NOW), false);
	assert.equal(isAgentTasksSnapshotFresh('', NOW), false);
	assert.equal(isAgentTasksSnapshotFresh('not-a-date', NOW), false);
});

test('isAgentTasksSnapshotFresh: a far-future timestamp (clock change) is stale, not pinned fresh', () => {
	const future = new Date(NOW + 5 * AGENT_TASKS_REFRESH_INTERVAL_MS).toISOString();
	assert.equal(isAgentTasksSnapshotFresh(future, NOW), false);
});

test('nextAgentTasksRefreshAt: one interval after the fetch, undefined without one', () => {
	const fetchedAt = new Date(NOW).toISOString();
	assert.equal(nextAgentTasksRefreshAt(fetchedAt), new Date(NOW + AGENT_TASKS_REFRESH_INTERVAL_MS).toISOString());
	assert.equal(nextAgentTasksRefreshAt(undefined), undefined);
	assert.equal(nextAgentTasksRefreshAt('nonsense'), undefined);
});

// ---------------------------------------------------------------------------
// Envelope usability
// ---------------------------------------------------------------------------

test('isAgentTasksEnvelopeUsable: accepts a current-schema envelope covering the window', () => {
	assert.equal(isAgentTasksEnvelopeUsable(makeEnvelope(), SINCE), true);
});

test('isAgentTasksEnvelopeUsable: rejects a snapshot written by another schema version', () => {
	assert.equal(isAgentTasksEnvelopeUsable(makeEnvelope({ schemaVersion: 0 }), SINCE), false);
});

test('isAgentTasksEnvelopeUsable: rejects a snapshot covering a shorter window than asked for', () => {
	const shorter = makeEnvelope({ since: new Date(SINCE.getTime() + 24 * 60 * 60 * 1000).toISOString() });
	assert.equal(isAgentTasksEnvelopeUsable(shorter, SINCE), false);
});

test('isAgentTasksEnvelopeUsable: accepts a slightly older window (since is recomputed per call)', () => {
	const drifted = makeEnvelope({ since: new Date(SINCE.getTime() - 30 * 1000).toISOString() });
	assert.equal(isAgentTasksEnvelopeUsable(drifted, SINCE), true);
});

test('isAgentTasksEnvelopeUsable: rejects missing, malformed, and repo-less payloads', () => {
	assert.equal(isAgentTasksEnvelopeUsable(undefined, SINCE), false);
	assert.equal(isAgentTasksEnvelopeUsable(makeEnvelope({ since: 'garbage' }), SINCE), false);
	assert.equal(isAgentTasksEnvelopeUsable({ ...makeEnvelope(), data: undefined as any }, SINCE), false);
});

test('canServeAgentTasksSnapshot: a usable but stale snapshot is not served without a refresh', () => {
	const stale = makeEnvelope({ fetchedAt: new Date(NOW - 2 * AGENT_TASKS_REFRESH_INTERVAL_MS).toISOString() });
	assert.equal(isAgentTasksEnvelopeUsable(stale, SINCE), true);
	assert.equal(canServeAgentTasksSnapshot(stale, SINCE, NOW), false);
	assert.equal(canServeAgentTasksSnapshot(makeEnvelope(), SINCE, NOW), true);
});

// ---------------------------------------------------------------------------
// Disk round-trip
// ---------------------------------------------------------------------------

test('getAgentTasksCachePath: keeps dev and prod snapshots apart', () => {
	assert.equal(getAgentTasksCachePath('/store', 'prod'), path.join('/store', 'agenttasks_prod.snapshot.json'));
	assert.notEqual(getAgentTasksCachePath('/store', 'dev-abc'), getAgentTasksCachePath('/store', 'prod'));
});

test('writeAgentTasksSnapshot/readAgentTasksSnapshot: round-trips the snapshot', async () => {
	const dir = await fs.promises.mkdtemp(path.join(process.cwd(), 'agenttasks-'));
	const filePath = getAgentTasksCachePath(path.join(dir, 'nested'), 'prod');
	const envelope = makeEnvelope({ data: makeResult({ totalCredits: 43.4, totalTasks: 2 }) });

	await writeAgentTasksSnapshot(filePath, envelope);
	const readBack = await readAgentTasksSnapshot(filePath);

	assert.deepEqual(readBack, envelope);
	assert.deepEqual(await fs.promises.readdir(path.dirname(filePath)), [path.basename(filePath)]);
	await fs.promises.rm(dir, { recursive: true, force: true });
});

test('readAgentTasksSnapshot: missing or corrupt files read as undefined, never throw', async () => {
	const dir = await fs.promises.mkdtemp(path.join(process.cwd(), 'agenttasks-'));
	const missing = path.join(dir, 'nope.json');
	const corrupt = path.join(dir, 'corrupt.json');
	await fs.promises.writeFile(corrupt, '{ this is not json', 'utf8');

	assert.equal(await readAgentTasksSnapshot(missing), undefined);
	assert.equal(await readAgentTasksSnapshot(corrupt), undefined);
	await fs.promises.rm(dir, { recursive: true, force: true });
});
