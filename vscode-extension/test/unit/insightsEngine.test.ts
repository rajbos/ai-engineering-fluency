import test from 'node:test';
import * as assert from 'node:assert/strict';
import { INSIGHT_CATALOG, evaluateInsights } from '../../src/insightsEngine';
import type { InsightContext } from '../../src/insightsEngine';
import type { ToolCurationAnalysis, UsageAnalysisPeriod } from '../../src/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function emptyPeriod(): UsageAnalysisPeriod {
	return {
		sessions: 0,
		toolCalls: { total: 0, byTool: {} },
		modeUsage: { ask: 0, edit: 0, agent: 0, plan: 0, customAgent: 0, cli: 0 },
		contextReferences: {
			file: 0, selection: 0, implicitSelection: 0, symbol: 0, codebase: 0,
			workspace: 0, terminal: 0, vscode: 0, terminalLastCommand: 0,
			terminalSelection: 0, clipboard: 0, changes: 0, outputPanel: 0,
			problemsPanel: 0, pullRequest: 0, byKind: {}, byPath: {}, copilotInstructions: 0, agentsMd: 0,
		},
		mcpTools: { total: 0, byServer: {}, byTool: {} },
		modelSwitching: {
			modelsPerSession: [], totalSessions: 0, averageModelsPerSession: 0,
			maxModelsPerSession: 0, minModelsPerSession: 0, switchingFrequency: 0,
			standardModels: [], premiumModels: [], unknownModels: [], mixedTierSessions: 0,
			standardRequests: 0, premiumRequests: 0, unknownRequests: 0, totalRequests: 0,
			lowCostModels: [], mediumCostModels: [], highCostModels: [], mixedCostSessions: 0,
			lowCostRequests: 0, mediumCostRequests: 0, highCostRequests: 0,
		},
		repositories: [], repositoriesWithCustomization: [],
		editScope: { singleFileEdits: 0, multiFileEdits: 0, totalEditedFiles: 0, avgFilesPerSession: 0 },
		applyUsage: { totalApplies: 0, totalCodeBlocks: 0, applyRate: 0 },
		sessionDuration: { totalDurationMs: 0, avgDurationMs: 0, avgFirstProgressMs: 0, avgTotalElapsedMs: 0, avgWaitTimeMs: 0 },
		conversationPatterns: { multiTurnSessions: 0, singleTurnSessions: 0, avgTurnsPerSession: 0, maxTurnsInSession: 0 },
		agentTypes: { editsAgent: 0, defaultAgent: 0, workspaceAgent: 0, other: 0 },
	};
}

function makeCtx(overrides?: { autoCompact?: number; manualCompact?: number }): InsightContext {
	const last30Days = emptyPeriod();
	last30Days.sessions = 20;
	if (overrides?.autoCompact) {
		last30Days.toolCalls.byTool['__auto_compact__'] = overrides.autoCompact;
	}
	if (overrides?.manualCompact) {
		last30Days.toolCalls.byTool['__slash__compact'] = overrides.manualCompact;
	}
	return {
		today: emptyPeriod(),
		last30Days,
		missedPotential: [],
	};
}

// ---------------------------------------------------------------------------
// auto-compaction-pattern insight tests
// ---------------------------------------------------------------------------

const AUTO_COMPACT_ID = 'auto-compaction-pattern';

test('auto-compaction-pattern: insight exists in INSIGHT_CATALOG', () => {
	const def = INSIGHT_CATALOG.find(d => d.id === AUTO_COMPACT_ID);
	assert.ok(def, 'auto-compaction-pattern should be in INSIGHT_CATALOG');
});

test('auto-compaction-pattern: does NOT fire when __auto_compact__ is absent', () => {
	const ctx = makeCtx();
	const results = evaluateInsights(ctx, {}, 7, null);
	const insight = results.find(i => i.id === AUTO_COMPACT_ID);
	assert.equal(insight, undefined);
});

test('auto-compaction-pattern: does NOT fire when __auto_compact__ = 1 (below threshold)', () => {
	const ctx = makeCtx({ autoCompact: 1 });
	const results = evaluateInsights(ctx, {}, 7, null);
	const insight = results.find(i => i.id === AUTO_COMPACT_ID);
	assert.equal(insight, undefined);
});

test('auto-compaction-pattern: fires when __auto_compact__ = 2 (threshold)', () => {
	const ctx = makeCtx({ autoCompact: 2 });
	const results = evaluateInsights(ctx, {}, 7, null);
	const insight = results.find(i => i.id === AUTO_COMPACT_ID);
	assert.ok(insight, 'insight should fire at count = 2');
});

test('auto-compaction-pattern: fires when __auto_compact__ > 2', () => {
	const ctx = makeCtx({ autoCompact: 7 });
	const results = evaluateInsights(ctx, {}, 7, null);
	const insight = results.find(i => i.id === AUTO_COMPACT_ID);
	assert.ok(insight, 'insight should fire when count > 2');
});

test('auto-compaction-pattern: body includes auto-compact count', () => {
	const ctx = makeCtx({ autoCompact: 3 });
	const results = evaluateInsights(ctx, {}, 7, null);
	const insight = results.find(i => i.id === AUTO_COMPACT_ID);
	assert.ok(insight);
	assert.ok(insight!.body.includes('3'), 'body should mention the count (3)');
});

test('auto-compaction-pattern: has severity=opportunity', () => {
	const def = INSIGHT_CATALOG.find(d => d.id === AUTO_COMPACT_ID);
	assert.equal(def?.severity, 'opportunity');
});

test('auto-compaction-pattern: has allowToast=true', () => {
	const def = INSIGHT_CATALOG.find(d => d.id === AUTO_COMPACT_ID);
	assert.equal(def?.allowToast, true);
});

test('auto-compaction-pattern: has category=consistency', () => {
	const def = INSIGHT_CATALOG.find(d => d.id === AUTO_COMPACT_ID);
	assert.equal(def?.category, 'consistency');
});

test('auto-compaction-pattern: body mentions /compact and /new', () => {
	const ctx = makeCtx({ autoCompact: 2 });
	const results = evaluateInsights(ctx, {}, 7, null);
	const insight = results.find(i => i.id === AUTO_COMPACT_ID);
	assert.ok(insight);
	assert.ok(insight!.body.includes('/compact'), 'body should mention /compact');
	assert.ok(insight!.body.includes('/new'), 'body should mention /new');
});

// ---------------------------------------------------------------------------
// high-prompt-bloat insight tests
// ---------------------------------------------------------------------------

const HIGH_PROMPT_BLOAT_ID = 'high-prompt-bloat';

function makeCurationAnalysis(totalTokens: number, unusedToolCount: number): ToolCurationAnalysis {
	return {
		windowDays: 30,
		availableTools: [],
		usedTools: [],
		unusedTools: Array.from({ length: unusedToolCount }, (_, i) => ({
			name: `tool-${i}`,
			description: 'test tool',
			source: 'mcp' as const,
		})),
		underusedMcpServers: [],
		estimatedPromptBloat: { totalTokens, byServer: {} },
		recommendations: [],
	};
}

test('high-prompt-bloat: insight exists in INSIGHT_CATALOG', () => {
	const def = INSIGHT_CATALOG.find(d => d.id === HIGH_PROMPT_BLOAT_ID);
	assert.ok(def, 'high-prompt-bloat should be in INSIGHT_CATALOG');
});

test('high-prompt-bloat: does NOT fire when curationAnalysis is absent', () => {
	const ctx = makeCtx();
	const results = evaluateInsights(ctx, {}, 7, null);
	const insight = results.find(i => i.id === HIGH_PROMPT_BLOAT_ID);
	assert.equal(insight, undefined);
});

test('high-prompt-bloat: does NOT fire when totalTokens <= 2500', () => {
	const ctx: InsightContext = { ...makeCtx(), curationAnalysis: makeCurationAnalysis(2500, 3) };
	const results = evaluateInsights(ctx, {}, 7, null);
	const insight = results.find(i => i.id === HIGH_PROMPT_BLOAT_ID);
	assert.equal(insight, undefined);
});

test('high-prompt-bloat: fires when totalTokens > 2500', () => {
	const ctx: InsightContext = { ...makeCtx(), curationAnalysis: makeCurationAnalysis(2501, 3) };
	const results = evaluateInsights(ctx, {}, 7, null);
	const insight = results.find(i => i.id === HIGH_PROMPT_BLOAT_ID);
	assert.ok(insight, 'insight should fire when totalTokens > 2500');
});

test('high-prompt-bloat: body includes token count', () => {
	const ctx: InsightContext = { ...makeCtx(), curationAnalysis: makeCurationAnalysis(5000, 2) };
	const results = evaluateInsights(ctx, {}, 7, null);
	const insight = results.find(i => i.id === HIGH_PROMPT_BLOAT_ID);
	assert.ok(insight);
	assert.ok(insight!.body.includes('5'), 'body should mention the token count (5000)');
	assert.ok(/extra tokens/.test(insight!.body), 'body should mention extra tokens');
});

test('high-prompt-bloat: has severity=opportunity', () => {
	const def = INSIGHT_CATALOG.find(d => d.id === HIGH_PROMPT_BLOAT_ID);
	assert.equal(def?.severity, 'opportunity');
});

test('high-prompt-bloat: has category=tools', () => {
	const def = INSIGHT_CATALOG.find(d => d.id === HIGH_PROMPT_BLOAT_ID);
	assert.equal(def?.category, 'tools');
});
