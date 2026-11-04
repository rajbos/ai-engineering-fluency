import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as path from 'path';
import {
	buildCacheInfo,
	buildDiagnosticDataLoadedMessage,
	buildDiagnosticsCliUsageFields,
	buildDiagnosticsViewData,
	buildSessionFolderData,
	diagnosticsToolCallStats,
	DIAGNOSTICS_VIEW_KEYS,
	skillDescriptionsFromStats,
	type DiagnosticsViewInputs,
} from '../diagnosticsViewBuilder';
import type { IEcosystemAdapter } from '../ecosystemAdapter';
import type { UsageAnalysisStats } from '../types';

const toolCalls = { total: 3, byTool: { a: 2, b: 1 } };
const stats = {
	last30Days: { toolCalls, skillCalls: { total: 1, byName: { s: 1 } } },
	curationAnalysis: { availableTools: [
		{ source: 'skill', name: 's', description: 'does s' },
		{ source: 'mcp', name: 'm', description: 'ignored' },
		{ source: 'skill', name: 'nodesc' },
	] },
} as unknown as UsageAnalysisStats;

const inputs = (over: Partial<DiagnosticsViewInputs> = {}): DiagnosticsViewInputs => ({
	report: 'r', sessionFiles: [], detailedSessionFiles: [], sessionFolders: [],
	cacheInfo: buildCacheInfo(0, 0, 'loc', null), backendStorageInfo: null, backendConfigured: false,
	isDebugMode: false,
	globalStateCounters: { openCount: 0, unknownMcpOpenCount: 0, fluencyBannerDismissed: false, unknownMcpDismissedVersion: '' },
	displaySettings: { showTokens: true, showCost: true, monthlyBudget: 0 },
	quotaEntitlements: null, accountBudgets: [],
	...over,
});

test('buildDiagnosticsViewData emits exactly the pinned keys', () => {
	assert.deepEqual(Object.keys(buildDiagnosticsViewData(inputs())).sort(), [...DIAGNOSTICS_VIEW_KEYS].sort());
});

test('the Diagnostics payload no longer carries the tool and skill analytics that moved to Usage and Efficiency', () => {
	const d = buildDiagnosticsViewData(inputs()) as unknown as Record<string, unknown>;
	for (const key of ['toolCallStats', 'skillCallStats', 'skillCallsByEditor', 'skillDescriptions', 'toolFamilies']) {
		assert.ok(!(key in d), `${key} should not be in the webview payload`);
	}
});

test('the CLI usage fields keep their shape: last-30-days stats, empty values without stats', () => {
	const families = [{ id: 'f' }];
	assert.deepEqual(buildDiagnosticsCliUsageFields(null, families), {
		toolCallStats: null, skillCallStats: null, skillCallsByEditor: null, skillDescriptions: {}, toolFamilies: families,
	});
	const fields = buildDiagnosticsCliUsageFields(stats, families);
	assert.equal(fields.toolCallStats, toolCalls);
	assert.deepEqual(fields.skillCallStats, { total: 1, byName: { s: 1 } });
	assert.deepEqual(fields.skillDescriptions, { s: 'does s' });
	assert.equal(diagnosticsToolCallStats(undefined), null);
});

test('skill descriptions: skills with a description only', () => {
	assert.deepEqual(skillDescriptionsFromStats(stats), { s: 'does s' });
});

test('buildCacheInfo reports lastUpdated only for a non-empty cache', () => {
	const now = new Date('2026-10-16T00:00:00.000Z');
	assert.deepEqual(buildCacheInfo(0, 0, 'l', null, now), { size: 0, sizeInMB: 0, lastUpdated: null, location: 'l', storagePath: null });
	assert.equal(buildCacheInfo(2, 1.5, 'l', '/p', now).lastUpdated, now.toISOString());
});

test('buildSessionFolderData groups by editor root and names the editor', () => {
	const eco = {
		handles: (f: string) => f.startsWith('/eco/'),
		getEditorRoot: () => '/eco',
		displayName: 'Eco',
	} as unknown as IEcosystemAdapter;
	const deps = { findEcosystem: (f: string) => (f.startsWith('/eco/') ? eco : null), homeDir: path.join('/home', 'u') };
	const sep = path.sep;
	const vscodeDir = ['', 'x', 'Code', 'User', 'workspaceStorage', 'w', 'chatSessions'].join(sep);
	const folders = buildSessionFolderData(['/eco/1', '/eco/2', `${vscodeDir}${sep}a.json`, `${vscodeDir}${sep}b.json`], deps);
	assert.equal(folders.length, 2);
	assert.deepEqual(folders.find(f => f.dir === '/eco'), { dir: '/eco', count: 2, editorName: 'Eco' });
	const code = folders.find(f => f.dir !== '/eco')!;
	assert.equal(code.count, 2);
	assert.equal(code.editorName, 'VS Code');
});

test('Copilot CLI session-state folders collapse into one row', () => {
	const home = path.join('/home', 'u');
	const state = path.join(home, '.copilot', 'session-state');
	const folders = buildSessionFolderData(
		[path.join(state, 'a', 'events.jsonl'), path.join(state, 'b', 'events.jsonl')],
		{ findEcosystem: () => null, homeDir: home },
	);
	assert.equal(folders.length, 1);
	assert.equal(folders[0].dir, state);
	assert.equal(folders[0].count, 2);
});

test('buildDiagnosticDataLoadedMessage pins the message keys', () => {
	const msg = buildDiagnosticDataLoadedMessage({
		report: 'r', sessionFiles: [], sessionFolders: [], candidatePaths: [], backendStorageInfo: null,
		githubAuth: { authenticated: false }, accountBudgets: [], quotaEntitlements: null, otelComparison: null,
	});
	assert.deepEqual(Object.keys(msg).sort(), [
		'accountBudgets', 'backendStorageInfo', 'candidatePaths', 'command', 'githubAuth', 'otelComparison',
		'quotaEntitlements', 'report', 'sessionFiles', 'sessionFolders',
	]);
	assert.equal(msg.command, 'diagnosticDataLoaded');
});
