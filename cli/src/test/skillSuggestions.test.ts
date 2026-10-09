/**
 * The CLI's Skill Suggestions path: calculateUsageAnalysisStats builds the
 * repeated-task report through the shared buildRepeatedTaskReport() only when
 * asked, and `skill-suggestions --json` leaves prompt text out unless opted in.
 * Session files are synthetic, written to a temporary directory.
 */
import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { calculateUsageAnalysisStats } from '../helpers';
import { disableCache } from '../cliCache';
import { createSkillSuggestionsPayload, formatSkillSuggestionsReport } from '../commands/skill-suggestions';
import type { RepeatedTaskReport } from '../../../src/types';

disableCache();

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
	const stats = await calculateUsageAnalysisStats(files, { includeRepeatedTasks: true });
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
	const stats = await calculateUsageAnalysisStats(files, { includeRepeatedTasks: true });
	assert.equal(stats.repeatedTasks, undefined);
	assert.equal(JSON.parse(JSON.stringify(stats)).repeatedTasks, undefined);
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

test('skill-suggestions JSON leaves prompts and titles out by default', () => {
	const payload = createSkillSuggestionsPayload(REPORT, false);
	assert.equal(payload.promptsIncluded, false);
	const json = JSON.stringify(payload);
	assert.ok(!json.includes('run the tests and fix the failures'));
	assert.ok(!json.includes('Fix failing tests'));
	const cluster = payload.repeatedTasks!.clusters[0];
	assert.equal('representativePrompt' in cluster, false);
	assert.deepEqual(Object.keys(cluster.sessions[0]).sort(), ['file', 'lastInteraction', 'repository']);
	assert.equal(cluster.sessionCount, 2);
	assert.deepEqual(cluster.sharedKeywords, ['failures', 'tests']);
	assert.equal(payload.repeatedTasks!.sessionsScanned, 5);
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
});
