import test from 'node:test';
import * as assert from 'node:assert/strict';
import type { Stats } from 'node:fs';

import type { SessionFileDetails } from '../../../src/types';
import { countFilesByEditor, getPricingCheckTimeRangeBounds, getSessionFileTimestampMs, scanPricingCheckFiles, type PricingCheckScanDeps } from '../../src/pricingCheckScan';

const NOW = new Date(2026, 10, 18, 12, 0, 0);
const DAY_MS = 24 * 60 * 60 * 1000;

interface FakeSession {
	lastInteraction: string | null;
	mtime?: Date;
	editorSource?: string;
}

function fakeDeps(sessions: Record<string, FakeSession>, overrides: Partial<PricingCheckScanDeps> = {}): PricingCheckScanDeps & { loaded: string[] } {
	const loaded: string[] = [];
	return {
		loaded,
		listSessionFiles: async () => Object.keys(sessions),
		statSessionFile: async (file) => {
			const session = sessions[file];
			return { mtime: session.mtime ?? new Date(session.lastInteraction ?? 0) } as Stats;
		},
		getSessionFileDetails: async (file) => {
			loaded.push(file);
			const { lastInteraction, editorSource } = sessions[file];
			return { file, lastInteraction, firstInteraction: null, modified: '', editorSource } as unknown as SessionFileDetails;
		},
		isCancelled: () => false,
		...overrides,
	};
}

const fileNames = (result: { files: SessionFileDetails[] } | null): string[] => (result?.files ?? []).map(f => f.file).sort();

test('All Time counts sessions older than 14 days and more than 500 files', async () => {
	const sessions: Record<string, FakeSession> = {};
	for (let i = 0; i < 600; i++) {
		sessions[`recent-${i}`] = { lastInteraction: new Date(NOW.getTime() - DAY_MS).toISOString() };
	}
	sessions.old = { lastInteraction: new Date(NOW.getTime() - 400 * DAY_MS).toISOString() };

	const result = await scanPricingCheckFiles(fakeDeps(sessions), 'all', NOW);

	assert.equal(result?.files.length, 601);
	assert.ok(fileNames(result).includes('old'));
});

test('Last Month counts exactly the sessions whose last activity is in that month', async () => {
	const sessions: Record<string, FakeSession> = {
		// 49 days before NOW, well past the 14-day window of the Diagnostics session list.
		firstMoment: { lastInteraction: new Date(2026, 9, 1, 0, 0, 0).toISOString() },
		lastMoment: { lastInteraction: new Date(2026, 9, 31, 23, 59, 59).toISOString() },
		tooEarly: { lastInteraction: new Date(2026, 8, 30, 23, 59, 59).toISOString() },
		endExclusive: { lastInteraction: new Date(2026, 10, 1, 0, 0, 0).toISOString() },
	};

	const result = await scanPricingCheckFiles(fakeDeps(sessions), 'lastMonth', NOW);

	assert.deepEqual(fileNames(result), ['firstMoment', 'lastMoment']);
});

test('a file written after the range ends still counts when its last interaction is in the range', async () => {
	const sessions: Record<string, FakeSession> = {
		rewritten: { lastInteraction: new Date(2026, 9, 15).toISOString(), mtime: new Date(2026, 10, 10) },
	};

	const result = await scanPricingCheckFiles(fakeDeps(sessions), 'lastMonth', NOW);

	assert.deepEqual(fileNames(result), ['rewritten']);
});

test('a file last written before the range starts is never loaded', async () => {
	const deps = fakeDeps({
		stale: { lastInteraction: new Date(2026, 5, 1).toISOString() },
		current: { lastInteraction: new Date(2026, 10, 18, 9).toISOString() },
	});

	const result = await scanPricingCheckFiles(deps, 'today', NOW);

	assert.deepEqual(deps.loaded, ['current']);
	assert.deepEqual(fileNames(result), ['current']);
});

test('files that cannot be read are reported rather than silently left out of the total', async () => {
	const sessions: Record<string, FakeSession> = {
		good: { lastInteraction: NOW.toISOString() },
		noStat: { lastInteraction: NOW.toISOString() },
		noDetails: { lastInteraction: NOW.toISOString() },
	};
	const base = fakeDeps(sessions);
	const result = await scanPricingCheckFiles({
		...base,
		statSessionFile: (file) => file === 'noStat' ? Promise.reject(new Error('gone')) : base.statSessionFile(file),
		getSessionFileDetails: (file, stat) => file === 'noDetails' ? Promise.reject(new Error('bad')) : base.getSessionFileDetails(file, stat),
	}, 'all', NOW);

	assert.deepEqual(fileNames(result), ['good']);
	assert.equal(result?.unreadableCount, 2);
});

test('a failed discovery rejects instead of reporting an empty, zero-cost result', async () => {
	const deps = fakeDeps({}, { listSessionFiles: () => Promise.reject(new Error('discovery failed')) });
	await assert.rejects(scanPricingCheckFiles(deps, 'all', NOW), /discovery failed/);
});

test('a scan superseded partway through stops loading and resolves to null', async () => {
	let cancelled = false;
	const sessions: Record<string, FakeSession> = {
		a: { lastInteraction: NOW.toISOString() },
		b: { lastInteraction: NOW.toISOString() },
		c: { lastInteraction: NOW.toISOString() },
	};
	const base = fakeDeps(sessions, { isCancelled: () => cancelled });
	const result = await scanPricingCheckFiles({
		...base,
		getSessionFileDetails: async (file, stat) => {
			if (file === 'b') { cancelled = true; }
			return base.getSessionFileDetails(file, stat);
		},
	}, 'all', NOW);

	assert.equal(result, null);
	assert.deepEqual(base.loaded, ['a', 'b']);
});

test('progress always ends with every file processed', async () => {
	const progress: Array<[number, number]> = [];
	const deps = fakeDeps({
		a: { lastInteraction: NOW.toISOString() },
		b: { lastInteraction: NOW.toISOString() },
	}, { onProgress: (processed, total) => progress.push([processed, total]) });

	await scanPricingCheckFiles(deps, 'all', NOW);

	assert.deepEqual(progress.at(-1), [2, 2]);
});

test('time range bounds follow the local calendar, including the year boundary', () => {
	assert.equal(getPricingCheckTimeRangeBounds('all', NOW), null);
	assert.deepEqual(getPricingCheckTimeRangeBounds('today', NOW), { startMs: new Date(2026, 10, 18).getTime(), endMs: NOW.getTime() });
	assert.deepEqual(getPricingCheckTimeRangeBounds('yesterday', NOW), { startMs: new Date(2026, 10, 17).getTime(), endMs: new Date(2026, 10, 18).getTime() });
	// 2026-11-18 is a Wednesday, so the ISO week starts on Monday the 16th.
	assert.deepEqual(getPricingCheckTimeRangeBounds('week', NOW), { startMs: new Date(2026, 10, 16).getTime(), endMs: NOW.getTime() });
	assert.deepEqual(getPricingCheckTimeRangeBounds('month', NOW), { startMs: new Date(2026, 10, 1).getTime(), endMs: NOW.getTime() });
	assert.deepEqual(getPricingCheckTimeRangeBounds('lastMonth', new Date(2027, 0, 10)), { startMs: new Date(2026, 11, 1).getTime(), endMs: new Date(2027, 0, 1).getTime() });
});

test('session timestamp prefers the last interaction and rejects an unparseable value', () => {
	const details = (fields: Partial<SessionFileDetails>) => ({ lastInteraction: null, firstInteraction: null, modified: '', ...fields }) as SessionFileDetails;
	const iso = '2026-10-01T00:00:00.000Z';
	assert.equal(getSessionFileTimestampMs(details({ lastInteraction: iso, firstInteraction: '2020-01-01T00:00:00.000Z' })), Date.parse(iso));
	assert.equal(getSessionFileTimestampMs(details({ modified: iso })), Date.parse(iso));
	assert.equal(getSessionFileTimestampMs(details({ modified: 'not a date' })), null);
	assert.equal(getSessionFileTimestampMs(details({})), null);
});

test('editor counts use the same Unknown fallback as the editor filter', () => {
	const files = [{ editorSource: 'Cursor' }, { editorSource: 'Cursor' }, {}] as SessionFileDetails[];
	assert.deepEqual(countFilesByEditor(files), { Cursor: 2, Unknown: 1 });
});
