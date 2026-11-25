/**
 * CLI-side multi-agent enrichment: `calculateUsageAnalysisStats` must populate
 * `last30Days.multiAgentParentSessions` (parent sessions with 2+ subsessions) and
 * `last30Days.delegationSessions` (sessions whose tool calls match the delegation pattern,
 * e.g. Vibe's start_session) — via the shared MultiAgentSource list in src/multiAgentSources.ts,
 * the same one the VS Code extension drives.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { calculateUsageAnalysisStats } from '../helpers';
import { disableCache } from '../cliCache';
import { toLocalDayKey } from '../../../src/utils/dayKeys';

/** Writes a legacy-layout Vibe session (meta.json + messages.jsonl) under a temp VIBE_HOME. */
function writeVibeSession(root: string, dirName: string, meta: unknown, messages: unknown[]): string {
	const dir = path.join(root, 'logs', 'session', dirName);
	fs.mkdirSync(dir, { recursive: true });
	const metaPath = path.join(dir, 'meta.json');
	fs.writeFileSync(metaPath, JSON.stringify(meta));
	fs.writeFileSync(path.join(dir, 'messages.jsonl'), messages.map(m => JSON.stringify(m)).join('\n') + '\n');
	return metaPath;
}

test('calculateUsageAnalysisStats: Vibe subsessions count as multi-agent parents and start_session as delegation', async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'vibe-cli-ma-'));
	const prev = process.env.VIBE_HOME;
	process.env.VIBE_HOME = root;
	disableCache();
	try {
		const now = new Date().toISOString();
		const parentId = 'aaaa1111-0000-0000-0000-000000000001';
		const parentMeta = writeVibeSession(root, 'session_20260922_091515_aaaa1111', {
			session_id: parentId, parent_session_id: null, start_time: now, end_time: now,
			config: { active_model: 'devstral' },
			stats: { session_prompt_tokens: 100, session_completion_tokens: 10 },
		}, [
			{ role: 'user', content: 'spawn two subsessions' },
			{ role: 'assistant', content: 'ok', tool_calls: [{ id: 't1', function: { name: 'start_session', arguments: '{}' } }] },
			{ role: 'tool', content: 'started' },
		]);
		const child1 = writeVibeSession(root, 'session_20260922_092000_bbbb2222', {
			session_id: 'bbbb2222-0000-0000-0000-000000000002', parent_session_id: parentId, start_time: now, end_time: now,
			config: { active_model: 'devstral' },
			stats: { session_prompt_tokens: 50, session_completion_tokens: 5 },
		}, [{ role: 'user', content: 'child one' }]);
		const child2 = writeVibeSession(root, 'session_20260922_093000_cccc3333', {
			session_id: 'cccc3333-0000-0000-0000-000000000003', parent_session_id: parentId, start_time: now, end_time: now,
			config: { active_model: 'devstral' },
			stats: { session_prompt_tokens: 50, session_completion_tokens: 5 },
		}, [{ role: 'user', content: 'child two' }]);

		const stats = await calculateUsageAnalysisStats([parentMeta, child1, child2]);
		// The parent has 2 subsessions on disk → 1 multi-agent parent in the last-30-days period.
		assert.equal(stats.last30Days.multiAgentParentSessions, 1);
		// The parent's start_session tool call classifies it as Delegation.
		assert.equal(stats.last30Days.delegationSessions, 1);
		assert.equal(stats.last30Days.sessions, 3);
		// The daily Agentic trend carries both signals on the parent's activity day.
		const todayKey = toLocalDayKey(new Date());
		const trendPoint = stats.agenticDailyTrend?.find(p => p.date === todayKey);
		assert.ok(stats.agenticDailyTrend && stats.agenticDailyTrend.length > 0, 'agenticDailyTrend present');
		assert.ok(trendPoint && trendPoint.multiAgentParentSessions === 1 && trendPoint.delegationSessions === 1,
			`trend point on ${todayKey} has both signals, got ${JSON.stringify(trendPoint)}`);
	} finally {
		if (prev === undefined) { delete process.env.VIBE_HOME; } else { process.env.VIBE_HOME = prev; }
		fs.rmSync(root, { recursive: true, force: true });
	}
});

test('calculateUsageAnalysisStats: a lone Vibe subsession (1 child) is not a multi-agent parent', async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'vibe-cli-ma-'));
	const prev = process.env.VIBE_HOME;
	process.env.VIBE_HOME = root;
	disableCache();
	try {
		const now = new Date().toISOString();
		const parentId = 'aaaa1111-0000-0000-0000-000000000001';
		const parentMeta = writeVibeSession(root, 'session_20260922_091515_aaaa1111', {
			session_id: parentId, parent_session_id: null, start_time: now, end_time: now,
			config: { active_model: 'devstral' },
			stats: { session_prompt_tokens: 100, session_completion_tokens: 10 },
		}, [{ role: 'user', content: 'one sub' }]);
		const child1 = writeVibeSession(root, 'session_20260922_092000_bbbb2222', {
			session_id: 'bbbb2222-0000-0000-0000-000000000002', parent_session_id: parentId, start_time: now, end_time: now,
			config: { active_model: 'devstral' },
			stats: { session_prompt_tokens: 50, session_completion_tokens: 5 },
		}, [{ role: 'user', content: 'child' }]);

		const stats = await calculateUsageAnalysisStats([parentMeta, child1]);
		assert.equal(stats.last30Days.multiAgentParentSessions, undefined);
		assert.equal(stats.last30Days.delegationSessions, undefined);
	} finally {
		if (prev === undefined) { delete process.env.VIBE_HOME; } else { process.env.VIBE_HOME = prev; }
		fs.rmSync(root, { recursive: true, force: true });
	}
});
