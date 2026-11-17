import test from 'node:test';
import * as assert from 'node:assert/strict';
import type * as fs from 'fs';

import { DailyRollupBuilder } from '../teamServer/dailyRollupBuilder';
import { buildTeamServerEntries, canonicalTeamServerUrl } from '../teamServer/teamServerEntries';
import { buildFluencyScorePayload } from '../teamServer/fluencyScorePayload';
import { computeBackendSharingPolicy, hashMachineIdForTeam, hashWorkspaceIdForTeam } from '../teamServer/sharingProfile';
import type { SessionFileCache } from '../types';

const today = new Date().toISOString().slice(0, 10);
const longAgo = '2000-01-01';
const silent = { log: () => {}, warn: () => {} };

function cacheFor(days: Record<string, { input: number; output: number; interactions: number }>): SessionFileCache {
	const dailyRollups: NonNullable<SessionFileCache['dailyRollups']> = {};
	let input = 0; let output = 0; let interactions = 0;
	for (const [day, d] of Object.entries(days)) {
		dailyRollups[day] = { tokens: d.input + d.output, actualTokens: 0, thinkingTokens: 0, interactions: d.interactions, modelUsage: { 'gpt-4o': { inputTokens: d.input, outputTokens: d.output, sessions: 1 } } };
		input += d.input; output += d.output; interactions += d.interactions;
	}
	return { tokens: input + output, interactions, modelUsage: { 'gpt-4o': { inputTokens: input, outputTokens: output, sessions: 1 } }, mtime: Date.now(), dailyRollups };
}

function builderFor(files: Record<string, SessionFileCache | 'unstatable'>, machineId = 'machine-1'): DailyRollupBuilder {
	return new DailyRollupBuilder({
		logger: silent,
		sessionHandlers: {
			getCopilotSessionFiles: async () => Object.keys(files),
			estimateTokensFromText: () => 0,
			getModelFromRequest: () => 'gpt-4o',
			statSessionFile: async (file: string) => {
				if (files[file] === 'unstatable') { throw new Error('ENOENT'); }
				return { mtimeMs: Date.now(), size: 10 } as fs.Stats;
			},
			getSessionFileDataCached: async (file: string) => files[file] as SessionFileCache,
		},
		getEditorLabel: () => 'Cursor',
		getMachineId: () => machineId,
	});
}

test('DailyRollupBuilder: rolls cached per-day data up per day, model, editor and the injected machine id', async () => {
	const builder = builderFor({
		'/home/u/.claude/projects/a/s1.jsonl': cacheFor({ [today]: { input: 100, output: 50, interactions: 2 } }),
		'/home/u/.claude/projects/a/s2.jsonl': cacheFor({ [today]: { input: 10, output: 5, interactions: 1 } }),
	});
	const { rollups, filesFailed, machineNamesById } = await builder.computeRollups({ lookbackDays: 7, includeEditorDimension: true });
	assert.equal(filesFailed, 0);
	const values = [...rollups.values()];
	assert.equal(values.length, 1, 'both sessions share one (day, model, workspace, machine, editor) key');
	assert.equal(values[0].key.day, today);
	assert.equal(values[0].key.machineId, 'machine-1');
	assert.equal(values[0].key.editor, 'Cursor');
	assert.deepEqual([values[0].value.inputTokens, values[0].value.outputTokens, values[0].value.interactions], [110, 55, 3]);
	assert.ok(machineNamesById['machine-1'], 'the machine name is recorded under the injected id');
});

test('DailyRollupBuilder: days before the lookback window are left out, unreadable files are counted as failed', async () => {
	const builder = builderFor({
		'/s/old-and-new.jsonl': cacheFor({ [longAgo]: { input: 999, output: 999, interactions: 9 }, [today]: { input: 1, output: 1, interactions: 1 } }),
		'/s/gone.jsonl': 'unstatable',
	});
	const { rollups, filesFailed } = await builder.computeRollups({ lookbackDays: 7, includeEditorDimension: true });
	assert.deepEqual([...rollups.values()].map(r => r.key.day), [today]);
	assert.equal(filesFailed, 1);
});

test('DailyRollupBuilder: without an injected machine id it falls back to one stable value', async () => {
	const make = () => new DailyRollupBuilder({
		logger: silent,
		sessionHandlers: {
			getCopilotSessionFiles: async () => ['/s/a.jsonl'],
			estimateTokensFromText: () => 0,
			getModelFromRequest: () => 'gpt-4o',
			statSessionFile: async () => ({ mtimeMs: Date.now(), size: 1 } as fs.Stats),
			getSessionFileDataCached: async () => cacheFor({ [today]: { input: 1, output: 1, interactions: 1 } }),
		},
	});
	const first = [...(await make().computeRollups({ lookbackDays: 1 })).rollups.values()][0].key.machineId;
	const second = [...(await make().computeRollups({ lookbackDays: 1 })).rollups.values()][0].key.machineId;
	assert.match(first, /^[0-9a-f]{64}$/);
	assert.equal(first, second);
});

function rollupsFixture() {
	return new Map([['k', {
		key: { day: today, model: 'gpt-4o', workspaceId: 'ws-raw', machineId: 'm-raw', editor: undefined as string | undefined },
		value: { inputTokens: 1000, outputTokens: 500, interactions: 3 },
	}]]);
}

test('buildTeamServerEntries: team profiles hash workspace/machine IDs and omit names', () => {
	const entries = buildTeamServerEntries(rollupsFixture(), {
		datasetId: 'ds',
		sharingPolicy: computeBackendSharingPolicy({ enabled: true, profile: 'teamAnonymized', shareWorkspaceMachineNames: true }),
		workspaceNamesById: { 'ws-raw': 'secret-repo' },
		machineNamesById: { 'm-raw': 'my-laptop' },
		pricing: {},
		clientVersion: 'desktop-1.0.0',
		getDefaultEditor: () => 'Unknown',
	});
	assert.equal(entries.length, 1);
	assert.equal(entries[0].workspaceId, hashWorkspaceIdForTeam({ datasetId: 'ds', workspaceId: 'ws-raw' }));
	assert.equal(entries[0].machineId, hashMachineIdForTeam({ datasetId: 'ds', machineId: 'm-raw' }));
	assert.equal(entries[0].workspaceName, undefined);
	assert.equal(entries[0].machineName, undefined);
	assert.equal(entries[0].clientVersion, 'desktop-1.0.0');
	assert.equal(entries[0].editor, 'Unknown');
	assert.ok(!JSON.stringify(entries).includes('ws-raw') && !JSON.stringify(entries).includes('secret-repo'));
});

test('buildTeamServerEntries: soloFull keeps raw IDs and names; the default editor is only looked up when needed', () => {
	let defaultEditorCalls = 0;
	const rollups = rollupsFixture();
	rollups.get('k')!.key.editor = 'VS Code';
	const entries = buildTeamServerEntries(rollups, {
		datasetId: 'ds',
		sharingPolicy: computeBackendSharingPolicy({ enabled: true, profile: 'soloFull', shareWorkspaceMachineNames: false }),
		workspaceNamesById: { 'ws-raw': 'my-repo' },
		machineNamesById: { 'm-raw': 'my-laptop' },
		pricing: {},
		getDefaultEditor: () => { defaultEditorCalls++; return 'Unknown'; },
	});
	assert.equal(entries[0].workspaceId, 'ws-raw');
	assert.equal(entries[0].workspaceName, 'my-repo');
	assert.equal(entries[0].machineName, 'my-laptop');
	assert.equal(entries[0].editor, 'VS Code');
	assert.equal(entries[0].clientVersion, undefined);
	assert.equal(defaultEditorCalls, 0);
});

test('canonicalTeamServerUrl: trailing slashes and host case do not create a second endpoint', () => {
	assert.equal(canonicalTeamServerUrl('https://Fluency.Example.com/'), 'https://fluency.example.com');
	assert.equal(canonicalTeamServerUrl(' https://x.example.com/team// '), 'https://x.example.com/team');
});

test('buildFluencyScorePayload: sends stages, labels and tips but never the per-category evidence', () => {
	const payload = buildFluencyScorePayload({
		overallStage: 3,
		overallLabel: 'Stage 3',
		categories: [{ category: 'Agentic', icon: 'A', stage: 3, tips: ['try plan mode'], evidence: ['used agent mode in secret-repo'] } as never],
	}, new Date('2026-11-17T10:00:00Z'));
	assert.deepEqual(payload, {
		overallStage: 3,
		overallLabel: 'Stage 3',
		categories: [{ category: 'Agentic', icon: 'A', stage: 3, tips: ['try plan mode'] }],
		computedAt: '2026-11-17T10:00:00.000Z',
	});
});
