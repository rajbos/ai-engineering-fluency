import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
	bucketMultiAgentParentsByDay,
	collectMultiAgentCandidates,
	countMultiAgentParents,
	createMultiAgentSources,
	type MultiAgentSource,
} from '../multiAgentSources';
import { MistralVibeDataAccess } from '../mistralvibe';
import type { HermesDataAccess } from '../hermes';

/** A controllable in-memory source for the shared collect/count/bucket helpers. */
function stubSource(id: string, idsByFile: Record<string, string>, childCounts: Record<string, number>, opts: { failExtract?: boolean; failCounts?: boolean } = {}): MultiAgentSource {
	return {
		id,
		extractId: (f) => {
			if (opts.failExtract) { throw new Error('boom'); }
			return idsByFile[f] ?? null;
		},
		getChildCounts: async (candidateIds) => {
			if (opts.failCounts) { throw new Error('boom'); }
			const counts = new Map<string, number>();
			for (const id of candidateIds) {
				if (childCounts[id] !== undefined) { counts.set(id, childCounts[id]); }
			}
			return counts;
		},
	};
}

test('collectMultiAgentCandidates: first matching source claims each row; unclaimed rows are skipped', async () => {
	const a = stubSource('a', { '/a/1': 'a1', '/shared': 'a-shared' }, {});
	const b = stubSource('b', { '/b/1': 'b1', '/shared': 'b-shared' }, {});
	const candidates = await collectMultiAgentCandidates([a, b], [
		{ sessionFile: '/a/1', dayKey: '2026-09-20' },
		{ sessionFile: '/shared', dayKey: '2026-09-21' },
		{ sessionFile: '/b/1', dayKey: '2026-09-22' },
		{ sessionFile: '/unknown', dayKey: '2026-09-23' },
	]);
	assert.deepEqual(candidates.map(c => [c.source.id, c.id, c.dayKey]), [
		['a', 'a1', '2026-09-20'],
		['a', 'a-shared', '2026-09-21'], // first source wins for /shared
		['b', 'b1', '2026-09-22'],
	]);
});

test('collectMultiAgentCandidates: a source that throws on extract is skipped, not fatal', async () => {
	const bad = stubSource('bad', {}, {}, { failExtract: true });
	const good = stubSource('good', { '/g/1': 'g1' }, {});
	const candidates = await collectMultiAgentCandidates([bad, good], [{ sessionFile: '/g/1', dayKey: '2026-09-20' }]);
	assert.deepEqual(candidates.map(c => c.id), ['g1']);
});

test('countMultiAgentParents: counts distinct candidate ids at/above the threshold; a failing source contributes 0', async () => {
	const a = stubSource('a', { '/a/p': 'p', '/a/c1': 'c1', '/a/c2': 'c2', '/a/dup': 'p' }, { p: 2 });
	const failing = stubSource('failing', { '/f/p': 'fp' }, {}, { failCounts: true });
	const candidates = await collectMultiAgentCandidates([a, failing], [
		{ sessionFile: '/a/p', dayKey: '2026-09-20' },
		{ sessionFile: '/a/c1', dayKey: '2026-09-20' },
		{ sessionFile: '/a/c2', dayKey: '2026-09-21' },
		{ sessionFile: '/a/dup', dayKey: '2026-09-22' }, // duplicate id of p — counted once
		{ sessionFile: '/f/p', dayKey: '2026-09-20' },
	]);
	// default threshold is 2: p has 2 children (counted once despite the duplicate row), c1/c2 have none, fp's source failed.
	assert.equal(await countMultiAgentParents(candidates), 1);
	// explicit threshold 1: p (2 children) and any id with >= 1 child; fp still 0 (source failed).
	assert.equal(await countMultiAgentParents(candidates, 1), 1);
	assert.equal(await countMultiAgentParents([], 1), 0);
});

test('bucketMultiAgentParentsByDay: multi-agent parents land on their own day keys', async () => {
	const a = stubSource('a', { '/a/p1': 'p1', '/a/p2': 'p2' }, { p1: 3, p2: 2 });
	const candidates = await collectMultiAgentCandidates([a], [
		{ sessionFile: '/a/p1', dayKey: '2026-09-20' },
		{ sessionFile: '/a/p2', dayKey: '2026-09-22' },
	]);
	const byDay = new Map<string, { multiAgentParentSessions: number; delegationSessions: number }>();
	await bucketMultiAgentParentsByDay(candidates, byDay);
	assert.equal(byDay.get('2026-09-20')?.multiAgentParentSessions, 1);
	assert.equal(byDay.get('2026-09-22')?.multiAgentParentSessions, 1);
	assert.equal(byDay.get('2026-09-21'), undefined);
	// below-threshold days are absent when threshold is raised
	const byDay2 = new Map<string, { multiAgentParentSessions: number; delegationSessions: number }>();
	await bucketMultiAgentParentsByDay(candidates, byDay2, 3);
	assert.equal(byDay2.get('2026-09-20')?.multiAgentParentSessions, 1);
	assert.equal(byDay2.get('2026-09-22'), undefined);
});

// ── createMultiAgentSources: the src-resident registry (Vibe real, Hermes stubbed) ──

/** Runs fn with VIBE_HOME pointed at a fresh temp dir; always restores env and removes the dir. */
async function withVibeHome(fn: (root: string) => Promise<void>): Promise<void> {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'vibe-ma-'));
	const prev = process.env.VIBE_HOME;
	process.env.VIBE_HOME = root;
	try {
		await fn(root);
	} finally {
		if (prev === undefined) { delete process.env.VIBE_HOME; } else { process.env.VIBE_HOME = prev; }
		fs.rmSync(root, { recursive: true, force: true });
	}
}

function writeLegacySession(root: string, dirName: string, meta: unknown): string {
	const dir = path.join(root, 'logs', 'session', dirName);
	fs.mkdirSync(dir, { recursive: true });
	const metaPath = path.join(dir, 'meta.json');
	fs.writeFileSync(metaPath, JSON.stringify(meta));
	return metaPath;
}

test('createMultiAgentSources: vibe source extracts meta.json session_id and counts subsessions; hermes source claims only hermes paths', async () => {
	await withVibeHome(async (root) => {
		const parentId = 'aaaa1111-0000-0000-0000-000000000001';
		const parentMeta = writeLegacySession(root, 'session_20260922_091515_aaaa1111', { session_id: parentId, parent_session_id: null });
		const child1 = writeLegacySession(root, 'session_20260922_092000_bbbb2222', { session_id: 'bbbb2222-0000-0000-0000-000000000002', parent_session_id: parentId });
		const child2 = writeLegacySession(root, 'session_20260922_093000_cccc3333', { session_id: 'cccc3333-0000-0000-0000-000000000003', parent_session_id: parentId });

		const hermesStub = {
			isHermesSessionFile: (f: string) => f.includes('state.db#'),
			getSessionId: (f: string) => f.split('state.db#')[1] ?? null,
			getChildCounts: async () => new Map([['h-parent', 5]]),
		} as unknown as HermesDataAccess;
		const sources = createMultiAgentSources({ hermes: hermesStub, mistralVibe: new MistralVibeDataAccess() });
		assert.deepEqual(sources.map(s => s.id), ['hermes', 'mistralvibe']);

		const candidates = await collectMultiAgentCandidates(sources, [
			{ sessionFile: parentMeta, dayKey: '2026-09-22' },
			{ sessionFile: child1, dayKey: '2026-09-22' },
			{ sessionFile: child2, dayKey: '2026-09-23' },
			{ sessionFile: '/home/u/.hermes/state.db#h-parent', dayKey: '2026-09-22' },
			{ sessionFile: '/unrelated/session.jsonl', dayKey: '2026-09-22' },
		]);
		assert.deepEqual(candidates.map(c => [c.source.id, c.id]), [
			['mistralvibe', parentId],
			['mistralvibe', 'bbbb2222-0000-0000-0000-000000000002'],
			['mistralvibe', 'cccc3333-0000-0000-0000-000000000003'],
			['hermes', 'h-parent'],
		]);

		// parent has 2 subsessions on disk → 1 multi-agent parent; hermes stub parent has 5 → +1.
		assert.equal(await countMultiAgentParents(candidates), 2);

		const byDay = new Map<string, { multiAgentParentSessions: number; delegationSessions: number }>();
		await bucketMultiAgentParentsByDay(candidates, byDay);
		assert.equal(byDay.get('2026-09-22')?.multiAgentParentSessions, 2); // vibe parent + hermes parent, both active 2026-09-22
		assert.equal(byDay.get('2026-09-23'), undefined); // only a child that day
	});
});
