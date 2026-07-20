import test from 'node:test';
import * as assert from 'node:assert/strict';

import { buildChartData, getModelBillingProvider, getBillingGroup, COPILOT_EDITOR_NAMES } from '../../../src/chartDataBuilder';
import type { DailyTokenStats } from '../../../src/types';

// ── getModelBillingProvider ───────────────────────────────────────────────────

test('getModelBillingProvider: claude maps to Anthropic', () => {
	assert.equal(getModelBillingProvider('claude-3-5-sonnet'), 'Anthropic');
});

test('getModelBillingProvider: anthropic prefix maps to Anthropic', () => {
	assert.equal(getModelBillingProvider('anthropic-some-model'), 'Anthropic');
});

test('getModelBillingProvider: gemini maps to Google', () => {
	assert.equal(getModelBillingProvider('gemini-2.0-flash'), 'Google');
});

test('getModelBillingProvider: google prefix maps to Google', () => {
	assert.equal(getModelBillingProvider('google-something'), 'Google');
});

test('getModelBillingProvider: mistral maps to Mistral AI', () => {
	assert.equal(getModelBillingProvider('mistral-large'), 'Mistral AI');
});

test('getModelBillingProvider: codestral maps to Mistral AI', () => {
	assert.equal(getModelBillingProvider('codestral-latest'), 'Mistral AI');
});

test('getModelBillingProvider: magistral maps to Mistral AI', () => {
	assert.equal(getModelBillingProvider('magistral-medium'), 'Mistral AI');
});

test('getModelBillingProvider: gpt maps to OpenAI', () => {
	assert.equal(getModelBillingProvider('gpt-4o'), 'OpenAI');
});

test('getModelBillingProvider: o1 maps to OpenAI', () => {
	assert.equal(getModelBillingProvider('o1-mini'), 'OpenAI');
});

test('getModelBillingProvider: o3 maps to OpenAI', () => {
	assert.equal(getModelBillingProvider('o3'), 'OpenAI');
});

test('getModelBillingProvider: o4 maps to OpenAI', () => {
	assert.equal(getModelBillingProvider('o4-mini'), 'OpenAI');
});

test('getModelBillingProvider: grok maps to xAI', () => {
	assert.equal(getModelBillingProvider('grok-2'), 'xAI');
});

test('getModelBillingProvider: qwen maps to Alibaba', () => {
	assert.equal(getModelBillingProvider('qwen2.5-coder'), 'Alibaba');
});

test('getModelBillingProvider: mai- maps to Microsoft', () => {
	assert.equal(getModelBillingProvider('mai-ds-r1'), 'Microsoft');
});

test('getModelBillingProvider: unknown model maps to Other', () => {
	assert.equal(getModelBillingProvider('some-unknown-model'), 'Other');
});

test('getModelBillingProvider: case insensitive', () => {
	assert.equal(getModelBillingProvider('Claude-3-Opus'), 'Anthropic');
	assert.equal(getModelBillingProvider('GPT-4O'), 'OpenAI');
});

// ── getBillingGroup ───────────────────────────────────────────────────────────

test('getBillingGroup: VS Code editor returns GitHub Copilot', () => {
	assert.equal(getBillingGroup('VS Code', 'gpt-4o'), 'GitHub Copilot');
});

test('getBillingGroup: Visual Studio editor returns GitHub Copilot', () => {
	assert.equal(getBillingGroup('Visual Studio', 'claude-3-5-sonnet'), 'GitHub Copilot');
});

test('getBillingGroup: JetBrains editor returns GitHub Copilot', () => {
	assert.equal(getBillingGroup('JetBrains', 'gemini-2.0-flash'), 'GitHub Copilot');
});

test('getBillingGroup: Copilot CLI editor returns GitHub Copilot', () => {
	assert.equal(getBillingGroup('Copilot CLI', 'claude-sonnet-4-5'), 'GitHub Copilot');
});

test('getBillingGroup: Claude Code editor returns Anthropic from model', () => {
	assert.equal(getBillingGroup('Claude Code', 'claude-3-5-sonnet'), 'Anthropic');
});

test('getBillingGroup: Gemini CLI editor returns Google from model', () => {
	assert.equal(getBillingGroup('Gemini CLI', 'gemini-2.0-flash'), 'Google');
});

test('getBillingGroup: unknown editor with OpenAI model returns OpenAI', () => {
	assert.equal(getBillingGroup('Some Editor', 'gpt-4o'), 'OpenAI');
});

// ── COPILOT_EDITOR_NAMES ─────────────────────────────────────────────────────

test('COPILOT_EDITOR_NAMES includes VS Code', () => {
	assert.ok(COPILOT_EDITOR_NAMES.has('VS Code'));
});

test('COPILOT_EDITOR_NAMES includes Visual Studio', () => {
	assert.ok(COPILOT_EDITOR_NAMES.has('Visual Studio'));
});

test('COPILOT_EDITOR_NAMES includes JetBrains', () => {
	assert.ok(COPILOT_EDITOR_NAMES.has('JetBrains'));
});

// ── buildChartData sessions splits ────────────────────────────────────────────

const testDailyStats: DailyTokenStats[] = [
	{
		date: '2025-01-01',
		tokens: 1000,
		sessions: 2,
		interactions: 10,
		modelUsage: {
			'gpt-4o': { inputTokens: 400, outputTokens: 100, sessions: 1 },
			'claude-3-5-sonnet': { inputTokens: 300, outputTokens: 200, sessions: 1 },
		},
		editorUsage: { 'VS Code': { tokens: 1000, sessions: 2 } },
		repositoryUsage: { 'owner/repo': { tokens: 1000, sessions: 2 } },
		editorModelUsage: {
			'VS Code': {
				'gpt-4o': { inputTokens: 400, outputTokens: 100, sessions: 1 },
				'claude-3-5-sonnet': { inputTokens: 300, outputTokens: 200, sessions: 1 },
			},
		},
	},
	{
		date: '2025-01-02',
		tokens: 500,
		sessions: 1,
		interactions: 5,
		modelUsage: { 'gpt-4o': { inputTokens: 300, outputTokens: 200, sessions: 1 } },
		editorUsage: { 'VS Code': { tokens: 500, sessions: 1 } },
		repositoryUsage: { 'owner/repo': { tokens: 500, sessions: 1 } },
		editorModelUsage: {
			'VS Code': { 'gpt-4o': { inputTokens: 300, outputTokens: 200, sessions: 1 } },
		},
	},
];

const testDeps = {
	getRepoDisplayName: (url: string) => url,
	calculateEstimatedCost: () => 0,
	backendConfigured: false,
	compactNumbers: false,
	now: new Date('2025-01-15T12:00:00Z'),
};

test('buildChartData builds non-empty model session datasets', () => {
	const data = buildChartData(testDailyStats, testDeps);
	assert.ok(data.periods.day.modelSessionsDatasets);
	assert.equal(data.periods.day.modelSessionsDatasets.length, 2);
	const totals = data.periods.day.modelSessionsDatasets.map((d: any) => d.data.reduce((a: number, b: number) => a + b, 0)).sort((a: number, b: number) => a - b);
	assert.deepEqual(totals, [1, 2]);
});

test('buildChartData builds non-empty editor session datasets', () => {
	const data = buildChartData(testDailyStats, testDeps);
	const vsCodeDataset = data.periods.day.editorSessionsDatasets?.find((d: any) => d.label === 'VS Code');
	assert.ok(vsCodeDataset, 'expected VS Code session dataset');
	assert.equal((vsCodeDataset as any).data.reduce((a: number, b: number) => a + b, 0), 3);
});

test('buildChartData builds non-empty provider session datasets', () => {
	const data = buildChartData(testDailyStats, testDeps);
	assert.ok(data.periods.day.providerSessionsDatasets);
	assert.ok(data.periods.day.providerSessionsDatasets!.length > 0);
	const copilotDataset = data.periods.day.providerSessionsDatasets!.find((d: any) => d.label === 'GitHub Copilot');
	assert.ok(copilotDataset, 'expected GitHub Copilot provider session dataset');
	assert.equal((copilotDataset as any).data.reduce((a: number, b: number) => a + b, 0), 3);
});
