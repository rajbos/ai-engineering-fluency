/**
 * The CLI's Skill Suggestions path: calculateUsageAnalysisStats builds the
 * repeated-task report through the shared buildRepeatedTaskReport() only when
 * asked, and `skill-suggestions --json` leaves prompt text out unless opted in.
 * Session files are synthetic, written to a temporary directory.
 */
import test, { before } from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { calculateUsageAnalysisStats, createSessionActivityLookup, isActiveSince, repeatedTaskActivityMs, type SessionActivitySources, type SessionMeta } from '../helpers';
import { disableCache } from '../cliCache';
import { createSkillSuggestionsPayload, formatSkillSuggestionsReport } from '../commands/skillSuggestions';
import type { RepeatedTaskReport } from '../../../src/types';

// node --test runs each test file in its own process, so this only affects this file.
before(() => disableCache());

/** A minimal VS Code Chat delta-format session whose only request is `prompt`. */
function deltaSession(id: string, prompt: string): string {
	const now = Date.now();
	return [
		{ kind: 0, v: { version: 3, sessionId: id, creationDate: now, requesterUsername: 'u', responderUsername: 'GitHub Copilot', requests: [] } },
		{ kind: 2, k: ['requests'], v: {
			requestId: `request_${id}`, timestamp: now, modelId: 'copilot/gpt-4o',
			message: { text: prompt, parts: [{ kind: 'text', text: prompt }] },
			response: [{ kind: 'markdownContent', content: { value: 'Done.' } }],
			result: { promptTokens: 10, outputTokens: 5, metadata: { modelId: 'copilot/gpt-4o' } },
		} },
	].map(line => JSON.stringify(line)).join('\n') + '\n';
}

function writeSessions(t: { after: (fn: () => void) => void }, prompts: string[]): string[] {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cli-skill-suggestions-'));
	t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
	return prompts.map((prompt, i) => {
		const file = path.join(dir, `session-${i}.jsonl`);
		fs.writeFileSync(file, deltaSession(`s${i}`, prompt));
		return file;
	});
}

/** Never reads the real ~/.copilot/data.db or Claude desktop data. */
const NO_SCHEDULED_TASKS = async () => ({ automationRuns: new Map<string, string>(), definitions: [] });

const REPEATED_PROMPTS = [
	'run the tests and fix the failures',
	'please run the tests and fix any failures',
	'update the changelog and bump the version',
];

test('calculateUsageAnalysisStats omits repeatedTasks unless asked', async (t) => {
	const files = writeSessions(t, REPEATED_PROMPTS);
	const stats = await calculateUsageAnalysisStats(files);
	assert.equal('repeatedTasks' in stats, false);
});

test('calculateUsageAnalysisStats builds the repeated-task report from session first prompts', async (t) => {
	const files = writeSessions(t, REPEATED_PROMPTS);
	const stats = await calculateUsageAnalysisStats(files, { includeRepeatedTasks: true, loadScheduledTaskSources: NO_SCHEDULED_TASKS });
	const report = stats.repeatedTasks;
	assert.ok(report, 'expected a repeated-task report');
	assert.equal(report.sessionsScanned, 3);
	assert.equal(report.clusters.length, 1);
	assert.equal(report.clusters[0].sessionCount, 2);
	assert.deepEqual(report.clusters[0].sessions.map(s => path.basename(s.file)).sort(), ['session-0.jsonl', 'session-1.jsonl']);
	assert.ok(report.clusters[0].sharedKeywords.includes('tests'));
});

test('calculateUsageAnalysisStats leaves repeatedTasks undefined when no prompt recurs', async (t) => {
	const files = writeSessions(t, ['run the tests and fix the failures', 'update the changelog and bump the version']);
	const stats = await calculateUsageAnalysisStats(files, { includeRepeatedTasks: true, loadScheduledTaskSources: NO_SCHEDULED_TASKS });
	assert.equal(stats.repeatedTasks, undefined);
	assert.equal(JSON.parse(JSON.stringify(stats)).repeatedTasks, undefined);
});

test("repeatedTaskActivityMs uses each session's own last interaction, not the shared file mtime", () => {
	const mtime = Date.parse('2026-10-08T00:00:00Z');
	// A DB-backed session: the database file changed today, the session itself is a year old.
	assert.equal(repeatedTaskActivityMs({ lastInteraction: '2025-10-01T00:00:00Z', mtime }), Date.parse('2025-10-01T00:00:00Z'));
	assert.equal(repeatedTaskActivityMs({ lastInteraction: null, mtime }), mtime);
	assert.equal(repeatedTaskActivityMs({ lastInteraction: 'not a date', mtime }), mtime);
});

test('isActiveSince falls back to the session’s last activity when the file mtime is stale', () => {
	const cutoff = new Date('2026-09-01T00:00:00Z');
	const staleDbMtime = new Date('2026-08-01T00:00:00Z'); // newer writes still in the WAL
	assert.equal(isActiveSince(staleDbMtime, new Date('2026-10-08T00:00:00Z'), cutoff), true);
	assert.equal(isActiveSince(staleDbMtime, new Date('2026-08-15T00:00:00Z'), cutoff), false);
	assert.equal(isActiveSince(staleDbMtime, null, cutoff), false);
	assert.equal(isActiveSince(new Date('2026-09-02T00:00:00Z'), null, cutoff), true);
});

/** Fake adapter lookups that count how often each is called. */
function fakeSources(opts: { lastActivity: Date | null; meta: SessionMeta | null; virtual: boolean }) {
	const calls = { lastActivity: 0, meta: 0 };
	const sources: SessionActivitySources = {
		getLastActivity: async () => { calls.lastActivity++; return opts.lastActivity; },
		getMeta: async () => { calls.meta++; return opts.meta; },
		getBackingPath: file => (opts.virtual ? 'state.vscdb' : file),
	};
	return { sources, calls };
}

const META: SessionMeta = { title: 'T', firstInteraction: null, lastInteraction: '2026-10-08T00:00:00Z' };

test('session activity: DB-backed session without getLastActivity falls back to metadata, read once', async () => {
	const { sources, calls } = fakeSources({ lastActivity: null, meta: META, virtual: true });
	const lookup = createSessionActivityLookup('state.vscdb#abc', sources);
	assert.equal((await lookup.lastActivity())?.toISOString(), '2026-10-08T00:00:00.000Z');
	assert.equal(await lookup.meta(), META);
	await lookup.lastActivity();
	assert.deepEqual(calls, { lastActivity: 1, meta: 1 });
});

test('session activity: the cheap lookup wins and metadata is not read for it', async () => {
	const { sources, calls } = fakeSources({ lastActivity: new Date('2026-10-01T00:00:00Z'), meta: META, virtual: true });
	const lookup = createSessionActivityLookup('opencode.db#abc', sources);
	assert.equal((await lookup.lastActivity())?.toISOString(), '2026-10-01T00:00:00.000Z');
	assert.deepEqual(calls, { lastActivity: 1, meta: 0 });
});

test('session activity: regular files rely on their mtime, without any adapter lookup', async () => {
	const { sources, calls } = fakeSources({ lastActivity: new Date('2026-10-01T00:00:00Z'), meta: META, virtual: false });
	const lookup = createSessionActivityLookup('/sessions/a.jsonl', sources);
	assert.equal(await lookup.lastActivity(), null);
	assert.deepEqual(calls, { lastActivity: 0, meta: 0 });
});

const REPORT: RepeatedTaskReport = {
	minClusterSize: 2,
	sessionsScanned: 5,
	clusters: [{
		representativePrompt: 'run the tests and fix the failures',
		sessionCount: 2,
		repositories: ['o/r'],
		sharedKeywords: ['failures', 'tests'],
		sessions: [
			{ file: 'b.jsonl', title: 'Fix failing tests', lastInteraction: '2026-08-02T10:00:00Z', repository: 'o/r' },
			{ file: 'a.jsonl', title: null, lastInteraction: '2026-08-01T10:00:00Z', repository: 'o/r' },
		],
	}],
};

test('skill-suggestions JSON leaves prompts, keywords and titles out by default', () => {
	const payload = createSkillSuggestionsPayload(REPORT, false);
	assert.equal(payload.promptsIncluded, false);
	const json = JSON.stringify(payload);
	assert.ok(!json.includes('run the tests and fix the failures'));
	assert.ok(!json.includes('Fix failing tests'));
	for (const keyword of REPORT.clusters[0].sharedKeywords) {
		assert.ok(!json.includes(keyword), `prompt keyword "${keyword}" leaked into redacted JSON`);
	}
	const cluster = payload.repeatedTasks!.clusters[0];
	assert.equal('representativePrompt' in cluster, false);
	assert.equal('sharedKeywords' in cluster, false);
	assert.deepEqual(Object.keys(cluster.sessions[0]).sort(), ['file', 'lastInteraction', 'repository']);
	assert.equal(cluster.sessionCount, 2);
	assert.equal(payload.repeatedTasks!.sessionsScanned, 5);
	// Allowlisted: an unknown (possibly prompt-derived) field added later is not copied.
	const withExtra = {
		...REPORT,
		clusters: REPORT.clusters.map(c => ({ ...c, futurePromptField: 'secret prompt words',
			sessions: c.sessions.map(s => ({ ...s, futureTitleField: 'secret title words' })) })),
	} as RepeatedTaskReport;
	assert.ok(!JSON.stringify(createSkillSuggestionsPayload(withExtra, false)).includes('secret'));
	// The input report is not mutated.
	assert.equal(REPORT.clusters[0].representativePrompt, 'run the tests and fix the failures');
	assert.equal(REPORT.clusters[0].sessions[0].title, 'Fix failing tests');
});

test('skill-suggestions JSON includes prompts with --include-prompts, and null without a report', () => {
	assert.deepEqual(createSkillSuggestionsPayload(REPORT, true), { promptsIncluded: true, repeatedTasks: REPORT });
	assert.deepEqual(createSkillSuggestionsPayload(undefined, false), { promptsIncluded: false, repeatedTasks: null });
});

test('skill-suggestions text report lists each repeated task', () => {
	const text = formatSkillSuggestionsReport(REPORT);
	assert.match(text, /1 repeated task\(s\) in 5 session\(s\)/);
	assert.match(text, /1\. "run the tests and fix the failures"/);
	assert.match(text, /Sessions:\s+2/);
	assert.match(text, /Keywords:\s+failures, tests/);
	assert.match(text, /Repositories:\s+o\/r/);
	assert.match(text, /Last seen:\s+2026-08-02/);
	assert.match(formatSkillSuggestionsReport(undefined), /No repeated tasks found/);
	assert.doesNotMatch(text, /Recurs:|Automate:|can also be scheduled/);
});

const RECURRING_REPORT: RepeatedTaskReport = {
	...REPORT,
	clusters: [{
		...REPORT.clusters[0],
		sessions: REPORT.clusters[0].sessions.map((s, i) => ({ ...s, editor: i === 0 ? 'Claude Code' : 'Copilot CLI' })),
		editors: ['Claude Code', 'Copilot CLI'],
		recurrence: { cadence: 'weekly', activeDays: 4, typicalGapDays: 7 },
	}],
};

test('skill-suggestions text report shows editors, cadence and an automation option per platform for recurring tasks', () => {
	const text = formatSkillSuggestionsReport(RECURRING_REPORT);
	assert.match(text, /Editors:\s+Claude Code, Copilot CLI/);
	assert.match(text, /Recurs:\s+about weekly \(4 days\)/);
	assert.match(text, /Automate:\s+Claude Code scheduled task/);
	assert.match(text, /Automate:\s+GitHub Copilot automation/);
	assert.match(text, /can also be scheduled/);
});

test('skill-suggestions redacted JSON keeps editors and recurrence (no prompt text in them)', () => {
	const cluster = createSkillSuggestionsPayload(RECURRING_REPORT, false).repeatedTasks!.clusters[0];
	assert.deepEqual(cluster.editors, ['Claude Code', 'Copilot CLI']);
	assert.deepEqual(cluster.recurrence, { cadence: 'weekly', activeDays: 4, typicalGapDays: 7 });
	assert.equal(cluster.sessions[0].editor, 'Claude Code');
});

test('skill-suggestions text report strips newlines and terminal control sequences from session data', () => {
	const hostile: RepeatedTaskReport = {
		...REPORT,
		clusters: [{
			...REPORT.clusters[0],
			representativePrompt: 'fix tests\n2. "forged line"\u001b]0;pwned\u0007\u001b[2J\u009b31m',
			sharedKeywords: ['tests\u001b[31m'],
			repositories: ['o/r\r\nRepositories: forged'],
			sessions: [{ file: 'a.jsonl', lastInteraction: '\u001b[2J2026-08-02T10:00:00Z', repository: 'o/r' }],
		}],
	};
	const text = formatSkillSuggestionsReport(hostile);
	// Only the report's own line breaks may remain.
	assert.ok(!/[\u0000-\u0009\u000B-\u001F\u007F-\u009F]/.test(text), 'control characters reached the terminal output');
	assert.ok(!text.includes('\n2. "forged line"'), 'a prompt newline forged a report line');
	assert.equal(text.split('\n').filter(line => line.startsWith('   Repositories:')).length, 1);
	assert.ok(text.includes('1. "fix tests 2. "forged line" ]0;pwned [2J 31m"'));
});

const SCHEDULED_REPORT: RepeatedTaskReport = {
	...REPORT,
	scheduledTasks: [
		{ name: 'repo-health-scan-daily', platform: 'claude', runCount: 12, activeDays: 11, lastRun: '2026-11-24T06:00:00.000Z' },
		{ name: 'Dependabot review', platform: 'copilot', runCount: 3, activeDays: 3, lastRun: null },
	],
};

test('skill-suggestions text report lists tasks already on a schedule', () => {
	const text = formatSkillSuggestionsReport(SCHEDULED_REPORT);
	assert.match(text, /Scheduled automations \(2\)/);
	assert.match(text, /"repo-health-scan-daily" \(Claude Code scheduled task\)\n.*last run 2026-11-24 · 12 run\(s\) in this window/);
	assert.match(text, /"Dependabot review" \(GitHub Copilot automation\)\n.*never run · 3 run\(s\) in this window/);

	const onlyScheduled = formatSkillSuggestionsReport({ ...SCHEDULED_REPORT, clusters: [] });
	assert.match(onlyScheduled, /No repeated tasks found/);
	assert.match(onlyScheduled, /Scheduled automations/);
});

test('skill-suggestions redacted JSON keeps scheduled-task counts but not their names', () => {
	const payload = createSkillSuggestionsPayload(SCHEDULED_REPORT, false);
	assert.deepEqual(payload.repeatedTasks!.scheduledTasks, [
		{ platform: 'claude', runCount: 12, activeDays: 11, lastRun: '2026-11-24T06:00:00.000Z' },
		{ platform: 'copilot', runCount: 3, activeDays: 3, lastRun: null },
	]);
	assert.ok(!JSON.stringify(payload).includes('repo-health-scan-daily'));
});

test('skill-suggestions text report shows health, repository, schedule and recent success, and counts at-risk tasks', () => {
	const text = formatSkillSuggestionsReport({
		...REPORT,
		scheduledTasks: [
			{ name: 'stopped', platform: 'copilot', runCount: 0, activeDays: 0, lastRun: '2026-09-01T00:00:00.000Z', schedule: 'daily at 09:00', enabled: true, repository: 'octo/app', health: 'stale', recentRuns: [{ at: '2026-09-01T00:00:00.000Z', ok: true }, { at: '2026-08-31T00:00:00.000Z', ok: false }] },
		],
	});
	assert.match(text, /Scheduled automations \(1, 1 at risk\)/);
	assert.match(text, /"stopped" \(GitHub Copilot automation\) — STALE/);
	assert.match(text, /repo octo\/app · schedule daily at 09:00 · last run 2026-09-01 · 1\/2 recent runs succeeded/);
	assert.match(text, /Stale = enabled with no run for 30 days/);
});

test('skill-suggestions redacted JSON keeps the inventory fields but not task names', () => {
	const payload = createSkillSuggestionsPayload({
		...REPORT,
		scheduledTasks: [{ name: 'secret-task-name', platform: 'claude', runCount: 1, activeDays: 1, lastRun: null, schedule: '0 8 * * *', enabled: true, repository: 'octo/app', folder: 'C:/code/app', totalRuns: 5, failedRuns: 1, recentRuns: [{ at: '2026-11-01T00:00:00Z', ok: false }], health: 'healthy' }],
	}, false);
	assert.deepEqual(payload.repeatedTasks!.scheduledTasks, [{
		platform: 'claude', runCount: 1, activeDays: 1, lastRun: null, schedule: '0 8 * * *', enabled: true, repository: 'octo/app',
		folder: 'C:/code/app', totalRuns: 5, failedRuns: 1, recentRuns: [{ at: '2026-11-01T00:00:00Z', ok: false }], health: 'healthy',
	}]);
	assert.ok(!JSON.stringify(payload).includes('secret-task-name'));
});

test('skill-suggestions text report lists failed runs with their session, tokens and cost', () => {
	const text = formatSkillSuggestionsReport({
		...REPORT,
		scheduledTasks: [{ name: 'nightly', platform: 'claude', runCount: 2, activeDays: 2, lastRun: '2026-11-20T00:00:00.000Z', health: 'failing', recentRuns: [
			{ at: '2026-11-20T00:00:00.000Z', ok: false, sessionFile: 'C:/logs/a.jsonl', tokens: 1234567, costUsd: 2.5 },
			{ at: '2026-11-19T00:00:00.000Z', ok: false, sessionFile: 'C:/logs/b.jsonl' },
			{ at: '2026-11-18T00:00:00.000Z', ok: false },
		] }],
	});
	assert.match(text, /failed runs: 2, 1,234,567 tokens, \$2\.50/);
	assert.match(text, /✗ 2026-11-20 — 1,234,567 tokens, \$2\.50 — C:\/logs\/a\.jsonl/);
	assert.match(text, /✗ 2026-11-19 — \? tokens — C:\/logs\/b\.jsonl/);
});
