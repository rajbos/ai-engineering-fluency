import test from 'node:test';
import * as assert from 'node:assert/strict';
import { INSIGHT_CATALOG, evaluateInsights } from '../../src/insightsEngine';
import type { InsightContext } from '../../src/insightsEngine';
import type { ToolCurationAnalysis, UsageAnalysisPeriod } from '../../../src/types';

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
			autoSessions: 0, foundryWindowsSessions: 0, unknownProviderSessions: 0,
			selectedModelExtensions: [], unknownProviderModels: [],
		},
		repositories: [], repositoriesWithCustomization: [],
		editScope: { singleFileEdits: 0, multiFileEdits: 0, totalEditedFiles: 0, avgFilesPerSession: 0 },
		applyUsage: { totalApplies: 0, totalCodeBlocks: 0, applyRate: 0 },
		sessionDuration: { totalDurationMs: 0, avgDurationMs: 0, avgFirstProgressMs: 0, avgTotalElapsedMs: 0, avgWaitTimeMs: 0, activeDurationMs: 0 },
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
		underusedAgentPlugins: [],
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

// ---------------------------------------------------------------------------
// stale-skills insight tests
// ---------------------------------------------------------------------------

const STALE_SKILLS_ID = 'stale-skills';

test('stale-skills: fires when exactly one unused skill exists', () => {
	const ctx: InsightContext = {
		today: emptyPeriod(),
		last30Days: emptyPeriod(),
		missedPotential: [],
		curationAnalysis: {
			windowDays: 30,
			availableTools: [
				{ name: 'my-skill', description: 'Skill', source: 'skill', skillPath: '.github/skills/my-skill/SKILL.md' },
			],
			usedTools: [],
			unusedTools: [
				{ name: 'my-skill', description: 'Skill', source: 'skill', skillPath: '.github/skills/my-skill/SKILL.md' },
			],
			underusedMcpServers: [],
			underusedAgentPlugins: [],
			estimatedPromptBloat: { totalTokens: 0, byServer: {} },
			recommendations: [],
		},
	};

	const results = evaluateInsights(ctx, {}, 7, null);
	const insight = results.find(i => i.id === STALE_SKILLS_ID);
	assert.ok(insight, 'stale-skills should trigger with one unused skill');
});

test('stale-skills: does not fire when no unused skills exist', () => {
	const ctx: InsightContext = {
		today: emptyPeriod(),
		last30Days: emptyPeriod(),
		missedPotential: [],
		curationAnalysis: {
			windowDays: 30,
			availableTools: [],
			usedTools: [],
			unusedTools: [],
			underusedMcpServers: [],
			underusedAgentPlugins: [],
			estimatedPromptBloat: { totalTokens: 0, byServer: {} },
			recommendations: [],
		},
	};

	const results = evaluateInsights(ctx, {}, 7, null);
	const insight = results.find(i => i.id === STALE_SKILLS_ID);
	assert.equal(insight, undefined);
});

// ---------------------------------------------------------------------------
// long-context pricing tier insights
// ---------------------------------------------------------------------------

import type { TodaySessionSummary } from '../../../src/types';

const LC_CROSSED_ID = 'long-context-pricing-crossed';
const LC_HEADROOM_ID = 'long-context-headroom';

function makeTodaySession(overrides: Partial<TodaySessionSummary>): TodaySessionSummary {
	return {
		title: null, filePath: '/tmp/session.jsonl', interactions: 5, toolCalls: 2,
		inputTokens: 1000, outputTokens: 500, thinkingTokens: 0, cachedTokens: 0,
		totalTokens: 1500, estimatedCost: 0.01, editor: 'VS Code',
		models: ['gpt-5.6-luna'], lastActivity: new Date().toISOString(),
		...overrides,
	};
}

function makeLcCtx(sessions: TodaySessionSummary[]): InsightContext {
	return {
		today: emptyPeriod(),
		last30Days: emptyPeriod(),
		missedPotential: [],
		todaySessions: sessions,
	};
}

test('long-context insights exist in INSIGHT_CATALOG', () => {
	assert.ok(INSIGHT_CATALOG.find(d => d.id === LC_CROSSED_ID));
	assert.ok(INSIGHT_CATALOG.find(d => d.id === LC_HEADROOM_ID));
});

test('long-context-pricing-crossed: fires when a request exceeds the model threshold', () => {
	// gpt-5.6-luna default tier is <= 200K in modelPricing.json
	const ctx = makeLcCtx([makeTodaySession({ maxRequestInputTokens: 210_000 })]);
	const results = evaluateInsights(ctx, {}, 7, null);
	const insight = results.find(i => i.id === LC_CROSSED_ID);
	assert.ok(insight, 'should fire above 200K for gpt-5.6-luna');
	assert.ok(insight!.body.includes('210K'), 'body should show the max request size');
	assert.ok(insight!.body.includes('200K'), 'body should show the threshold');
	assert.ok(insight!.body.includes('gpt-5.6-luna'), 'body should name the model');
});

test('long-context-pricing-crossed: fires for a non-default CLI context tier', () => {
	const ctx = makeLcCtx([makeTodaySession({ models: ['claude-sonnet-4.5'], contextTier: 'long-context' })]);
	const results = evaluateInsights(ctx, {}, 7, null);
	const insight = results.find(i => i.id === LC_CROSSED_ID);
	assert.ok(insight, 'should fire for non-default contextTier');
	assert.ok(insight!.body.includes('long-context'), 'body should name the tier');
});

test('long-context-pricing-crossed: does NOT fire for default tier under the threshold', () => {
	const ctx = makeLcCtx([makeTodaySession({ maxRequestInputTokens: 120_000, contextTier: 'default' })]);
	const results = evaluateInsights(ctx, {}, 7, null);
	assert.equal(results.find(i => i.id === LC_CROSSED_ID), undefined);
});

test('long-context-pricing-crossed: does NOT fire for non-tiered models over 200K', () => {
	// claude-sonnet-4.5 has no longContext block, so no threshold to cross
	const ctx = makeLcCtx([makeTodaySession({ models: ['claude-sonnet-4.5'], maxRequestInputTokens: 500_000 })]);
	const results = evaluateInsights(ctx, {}, 7, null);
	assert.equal(results.find(i => i.id === LC_CROSSED_ID), undefined);
});

test('long-context-headroom: fires at >= 70% of the threshold', () => {
	const ctx = makeLcCtx([makeTodaySession({ maxRequestInputTokens: 150_000 })]); // 75% of 200K
	const results = evaluateInsights(ctx, {}, 7, null);
	const insight = results.find(i => i.id === LC_HEADROOM_ID);
	assert.ok(insight, 'should fire at 75% of threshold');
	assert.ok(insight!.body.includes('75%'), 'body should show percentage of the window');
	assert.ok(insight!.body.includes('150K'), 'body should show the max request size');
	assert.ok(insight!.body.includes('MB of code'), 'body should show the max repo size that fits the default tier');
});

test('long-context-headroom: does NOT fire below 70% of the threshold', () => {
	const ctx = makeLcCtx([makeTodaySession({ maxRequestInputTokens: 120_000 })]); // 60% of 200K
	const results = evaluateInsights(ctx, {}, 7, null);
	assert.equal(results.find(i => i.id === LC_HEADROOM_ID), undefined);
});

test('long-context-headroom: suppressed when the crossed insight fires', () => {
	const ctx = makeLcCtx([
		makeTodaySession({ maxRequestInputTokens: 210_000 }),
		makeTodaySession({ maxRequestInputTokens: 150_000 }),
	]);
	const results = evaluateInsights(ctx, {}, 7, null);
	assert.ok(results.find(i => i.id === LC_CROSSED_ID), 'crossed insight should fire');
	assert.equal(results.find(i => i.id === LC_HEADROOM_ID), undefined, 'headroom tip should be suppressed');
});

test('long-context insights: no todaySessions means neither fires', () => {
	const ctx = makeLcCtx([]);
	const results = evaluateInsights(ctx, {}, 7, null);
	assert.equal(results.find(i => i.id === LC_CROSSED_ID), undefined);
	assert.equal(results.find(i => i.id === LC_HEADROOM_ID), undefined);
});

// ---------------------------------------------------------------------------
// large-context-window-unused tip
// ---------------------------------------------------------------------------

const LC_UNUSED_ID = 'large-context-window-unused';

test('large-context-window-unused: fires when a non-default tier session stayed under the model threshold', () => {
	// gpt-5.6-luna default-tier threshold is 200K; session only reached 80K
	const ctx = makeLcCtx([makeTodaySession({ contextTier: 'long-context', contextWindowLimit: 400_000, contextReachedTokens: 80_000 })]);
	const results = evaluateInsights(ctx, {}, 7, null);
	const insight = results.find(i => i.id === LC_UNUSED_ID);
	assert.ok(insight, 'should fire when the big window was never needed');
	assert.ok(insight!.body.includes('80K'), 'body should show the reached context size');
	assert.ok(insight!.body.includes('long-context'), 'body should name the selected tier');
});

test('large-context-window-unused: fires for non-tiered models under 60% of the selected window', () => {
	const ctx = makeLcCtx([makeTodaySession({ models: ['claude-sonnet-4.5'], contextTier: 'xl', contextWindowLimit: 400_000, contextReachedTokens: 100_000 })]);
	const results = evaluateInsights(ctx, {}, 7, null);
	assert.ok(results.find(i => i.id === LC_UNUSED_ID), 'should fire at 25% window usage');
});

test('large-context-window-unused: suppresses the generic crossed insight for the same session', () => {
	const ctx = makeLcCtx([makeTodaySession({ contextTier: 'long-context', contextWindowLimit: 400_000, contextReachedTokens: 80_000 })]);
	const results = evaluateInsights(ctx, {}, 7, null);
	assert.ok(results.find(i => i.id === LC_UNUSED_ID), 'unused tip should fire');
	assert.equal(results.find(i => i.id === LC_CROSSED_ID), undefined, 'generic tier warning should not double up');
});

test('large-context-window-unused: does NOT fire for the default tier', () => {
	const ctx = makeLcCtx([makeTodaySession({ contextTier: 'default', contextWindowLimit: 200_000, contextReachedTokens: 80_000 })]);
	const results = evaluateInsights(ctx, {}, 7, null);
	assert.equal(results.find(i => i.id === LC_UNUSED_ID), undefined);
});

test('large-context-window-unused: does NOT fire when window usage is unknown (crossed generic fires instead)', () => {
	const ctx = makeLcCtx([makeTodaySession({ contextTier: 'long-context' })]);
	const results = evaluateInsights(ctx, {}, 7, null);
	assert.equal(results.find(i => i.id === LC_UNUSED_ID), undefined, 'no usage data — cannot claim unused');
	assert.ok(results.find(i => i.id === LC_CROSSED_ID), 'generic tier warning still applies');
});

test('large-context-window-unused: does NOT fire when the context actually exceeded the threshold', () => {
	const ctx = makeLcCtx([makeTodaySession({ contextTier: 'long-context', contextWindowLimit: 400_000, contextReachedTokens: 250_000 })]);
	const results = evaluateInsights(ctx, {}, 7, null);
	assert.equal(results.find(i => i.id === LC_UNUSED_ID), undefined, 'window was genuinely used past the threshold');
	assert.ok(results.find(i => i.id === LC_CROSSED_ID), 'crossed/tier warning applies instead');
});

// ---------------------------------------------------------------------------
// model-edit-retries insight tests (issue #1649)
// ---------------------------------------------------------------------------

const RETRIES_ID = 'model-edit-retries';

function effCounters(retries: number, editTurns: number) {
	return {
		calls: editTurns, editTurns, oneShotEditTurns: Math.max(0, editTurns - retries),
		retries, selfCorrections: 0, editToolCalls: editTurns + retries,
		inputTokens: 0, outputTokens: 0, cachedReadTokens: 0, cost: 0,
	};
}

function makeRetryCtx(modelEfficiency: NonNullable<UsageAnalysisPeriod['modelEfficiency']>): InsightContext {
	const ctx = makeCtx();
	ctx.last30Days.modelEfficiency = modelEfficiency;
	return ctx;
}

test('model-edit-retries: insight exists in INSIGHT_CATALOG', () => {
	const def = INSIGHT_CATALOG.find(d => d.id === RETRIES_ID);
	assert.ok(def, 'model-edit-retries should be in INSIGHT_CATALOG');
	assert.equal(def!.severity, 'tip');
	assert.equal(def!.category, 'agentic');
});

test('model-edit-retries: does NOT fire without model efficiency data', () => {
	const results = evaluateInsights(makeCtx(), {}, 7, null);
	assert.equal(results.find(i => i.id === RETRIES_ID), undefined);
});

test('model-edit-retries: does NOT fire when models have too few edit turns', () => {
	// High rate but only 5 edit turns — below the 10-turn minimum
	const ctx = makeRetryCtx({ 'gpt-4o': effCounters(4, 5) });
	const results = evaluateInsights(ctx, {}, 7, null);
	assert.equal(results.find(i => i.id === RETRIES_ID), undefined);
});

test('model-edit-retries: fires when a single model has a high retry rate', () => {
	const ctx = makeRetryCtx({ 'gpt-4o': effCounters(10, 20) }); // 0.5 retries/edit
	const results = evaluateInsights(ctx, {}, 7, null);
	const insight = results.find(i => i.id === RETRIES_ID);
	assert.ok(insight, 'should fire at 0.5 retries per edit turn');
	assert.ok(insight!.body.includes('10 retries across 20 edit turns'), `body should carry the counts, got: ${insight!.body}`);
});

test('model-edit-retries: does NOT fire for a single model with a modest retry rate', () => {
	const ctx = makeRetryCtx({ 'gpt-4o': effCounters(6, 20) }); // 0.3 retries/edit, no comparison model
	const results = evaluateInsights(ctx, {}, 7, null);
	assert.equal(results.find(i => i.id === RETRIES_ID), undefined);
});

test('model-edit-retries: fires on a clear gap between two models and names both', () => {
	const ctx = makeRetryCtx({
		'model-worst': effCounters(6, 20),  // 0.3 retries/edit
		'model-best': effCounters(1, 20),   // 0.05 retries/edit
	});
	const results = evaluateInsights(ctx, {}, 7, null);
	const insight = results.find(i => i.id === RETRIES_ID);
	assert.ok(insight, 'should fire when the worst model retries 2x+ more than the best');
	assert.ok(insight!.body.includes('model-worst'), 'body should name the high-retry model');
	assert.ok(insight!.body.includes('model-best'), 'body should name the comparison model');
});

test('model-edit-retries: does NOT fire when models retry at similar modest rates', () => {
	const ctx = makeRetryCtx({
		'model-a': effCounters(6, 20),  // 0.3
		'model-b': effCounters(5, 20),  // 0.25 — no 2x gap, neither >= 0.5
	});
	const results = evaluateInsights(ctx, {}, 7, null);
	assert.equal(results.find(i => i.id === RETRIES_ID), undefined);
});

test('model-edit-retries: action opens the usage analysis view', () => {
	const ctx = makeRetryCtx({ 'gpt-4o': effCounters(10, 20) });
	const results = evaluateInsights(ctx, {}, 7, null);
	const insight = results.find(i => i.id === RETRIES_ID);
	assert.equal(insight!.actionCommand, 'aiEngineeringFluency.showUsageAnalysis');
});

// ---------------------------------------------------------------------------
// multi-agent-orchestration / subagent-delegation insight tests
// ---------------------------------------------------------------------------

const MULTI_AGENT_ID = 'multi-agent-orchestration';
const SUBAGENT_DELEGATION_ID = 'subagent-delegation';

test('multi-agent-orchestration: fires when multiAgentParentSessions >= 3', () => {
	const ctx = makeCtx();
	(ctx.last30Days as UsageAnalysisPeriod & { multiAgentParentSessions?: number }).multiAgentParentSessions = 3;
	const results = evaluateInsights(ctx, {}, 7, null);
	const insight = results.find(i => i.id === MULTI_AGENT_ID);
	assert.ok(insight, 'should fire at 3 multi-agent parent sessions');
	assert.ok(insight!.body.includes('3'));
});

test('multi-agent-orchestration: does NOT fire below threshold', () => {
	const ctx = makeCtx();
	(ctx.last30Days as UsageAnalysisPeriod & { multiAgentParentSessions?: number }).multiAgentParentSessions = 2;
	const results = evaluateInsights(ctx, {}, 7, null);
	assert.equal(results.find(i => i.id === MULTI_AGENT_ID), undefined);
});

test('subagent-delegation: fires when delegationSessions >= 5 and no multi-agent hierarchy signal', () => {
	const ctx = makeCtx();
	(ctx.last30Days as UsageAnalysisPeriod & { delegationSessions?: number }).delegationSessions = 5;
	const results = evaluateInsights(ctx, {}, 7, null);
	const insight = results.find(i => i.id === SUBAGENT_DELEGATION_ID);
	assert.ok(insight, 'should fire at 5 delegation sessions');
	assert.ok(insight!.body.includes('5'));
});

test('subagent-delegation: does NOT fire below threshold', () => {
	const ctx = makeCtx();
	(ctx.last30Days as UsageAnalysisPeriod & { delegationSessions?: number }).delegationSessions = 4;
	const results = evaluateInsights(ctx, {}, 7, null);
	assert.equal(results.find(i => i.id === SUBAGENT_DELEGATION_ID), undefined);
});

test('subagent-delegation: does NOT fire when multi-agent-orchestration already covers the signal', () => {
	const ctx = makeCtx();
	const period = ctx.last30Days as UsageAnalysisPeriod & { delegationSessions?: number; multiAgentParentSessions?: number };
	period.delegationSessions = 5;
	period.multiAgentParentSessions = 3;
	const results = evaluateInsights(ctx, {}, 7, null);
	assert.equal(results.find(i => i.id === SUBAGENT_DELEGATION_ID), undefined, 'should defer to the richer multi-agent-orchestration insight');
	assert.ok(results.find(i => i.id === MULTI_AGENT_ID), 'multi-agent-orchestration should still fire');
});

// ---------------------------------------------------------------------------
// Efficiency trend insight tests
// ---------------------------------------------------------------------------

const LEANER_ID = 'trend-leaner-sessions';
const HEAVIER_ID = 'trend-sessions-getting-heavier';
const RETRY_PRICE_ID = 'retry-price-mismatch';

function periodWithTurns(sessions: number, avgTurns: number): UsageAnalysisPeriod {
	const p = emptyPeriod();
	p.sessions = sessions;
	p.conversationPatterns = { multiTurnSessions: sessions, singleTurnSessions: 0, avgTurnsPerSession: avgTurns, maxTurnsInSession: avgTurns };
	return p;
}

test('trend-leaner-sessions: fires when turns/session drops >=15% month over month', () => {
	const ctx = makeCtx();
	ctx.lastMonth = periodWithTurns(20, 10);
	ctx.month = periodWithTurns(15, 7);
	const results = evaluateInsights(ctx, {}, 7, null);
	const insight = results.find(i => i.id === LEANER_ID);
	assert.ok(insight, 'should fire on a 30% drop in turns per session');
	assert.ok(insight!.body.includes('7.0'));
});

test('trend-leaner-sessions: does NOT fire on a small drop', () => {
	const ctx = makeCtx();
	ctx.lastMonth = periodWithTurns(20, 10);
	ctx.month = periodWithTurns(15, 9.5);
	const results = evaluateInsights(ctx, {}, 7, null);
	assert.equal(results.find(i => i.id === LEANER_ID), undefined);
});

test('trend-leaner-sessions: does NOT fire without month periods in context', () => {
	const ctx = makeCtx();
	const results = evaluateInsights(ctx, {}, 7, null);
	assert.equal(results.find(i => i.id === LEANER_ID), undefined);
});

test('trend-leaner-sessions: does NOT fire when retry rate regressed alongside the drop', () => {
	const ctx = makeCtx();
	ctx.lastMonth = periodWithTurns(20, 10);
	ctx.lastMonth.modelEfficiency = { m: { calls: 20, editTurns: 20, oneShotEditTurns: 19, retries: 1, selfCorrections: 0, editToolCalls: 20, inputTokens: 0, outputTokens: 0, cachedReadTokens: 0, cost: 0 } };
	ctx.month = periodWithTurns(15, 7);
	ctx.month.modelEfficiency = { m: { calls: 20, editTurns: 20, oneShotEditTurns: 10, retries: 10, selfCorrections: 0, editToolCalls: 20, inputTokens: 0, outputTokens: 0, cachedReadTokens: 0, cost: 0 } };
	const results = evaluateInsights(ctx, {}, 7, null);
	assert.equal(results.find(i => i.id === LEANER_ID), undefined, 'a 10x retry regression should suppress the celebration');
});

test('trend-sessions-getting-heavier: fires when turns/session rises >=25%', () => {
	const ctx = makeCtx();
	ctx.lastMonth = periodWithTurns(20, 6);
	ctx.month = periodWithTurns(15, 9);
	const results = evaluateInsights(ctx, {}, 7, null);
	assert.ok(results.find(i => i.id === HEAVIER_ID));
});

test('trend-sessions-getting-heavier: does NOT fire below the sample-size floor', () => {
	const ctx = makeCtx();
	ctx.lastMonth = periodWithTurns(20, 6);
	ctx.month = periodWithTurns(5, 9);
	const results = evaluateInsights(ctx, {}, 7, null);
	assert.equal(results.find(i => i.id === HEAVIER_ID), undefined);
});

test('retry-price-mismatch: fires when the priciest model retries most', () => {
	const ctx = makeCtx();
	// gpt-5 ($10/M output) retries heavily; gpt-5-mini ($2/M) barely retries.
	ctx.last30Days.modelEfficiency = {
		'gpt-5': { calls: 30, editTurns: 30, oneShotEditTurns: 15, retries: 15, selfCorrections: 0, editToolCalls: 45, inputTokens: 0, outputTokens: 0, cachedReadTokens: 0, cost: 0 },
		'gpt-5-mini': { calls: 30, editTurns: 30, oneShotEditTurns: 28, retries: 2, selfCorrections: 0, editToolCalls: 32, inputTokens: 0, outputTokens: 0, cachedReadTokens: 0, cost: 0 },
	};
	const results = evaluateInsights(ctx, {}, 7, null);
	const insight = results.find(i => i.id === RETRY_PRICE_ID);
	assert.ok(insight, 'should fire on a 7.5x retry gap with a 5x price gap');
	assert.ok(insight!.body.includes('5.0'), 'body should mention the price ratio');
});

test('retry-price-mismatch: does NOT fire when the cheap model retries most', () => {
	const ctx = makeCtx();
	ctx.last30Days.modelEfficiency = {
		'gpt-5-mini': { calls: 30, editTurns: 30, oneShotEditTurns: 15, retries: 15, selfCorrections: 0, editToolCalls: 45, inputTokens: 0, outputTokens: 0, cachedReadTokens: 0, cost: 0 },
		'gpt-5': { calls: 30, editTurns: 30, oneShotEditTurns: 28, retries: 2, selfCorrections: 0, editToolCalls: 32, inputTokens: 0, outputTokens: 0, cachedReadTokens: 0, cost: 0 },
	};
	const results = evaluateInsights(ctx, {}, 7, null);
	assert.equal(results.find(i => i.id === RETRY_PRICE_ID), undefined, 'worst retrier is the cheaper model — no mismatch');
});

test('retry-price-mismatch: does NOT fire with a single model', () => {
	const ctx = makeCtx();
	ctx.last30Days.modelEfficiency = {
		'gpt-5': { calls: 30, editTurns: 30, oneShotEditTurns: 15, retries: 15, selfCorrections: 0, editToolCalls: 45, inputTokens: 0, outputTokens: 0, cachedReadTokens: 0, cost: 0 },
	};
	const results = evaluateInsights(ctx, {}, 7, null);
	assert.equal(results.find(i => i.id === RETRY_PRICE_ID), undefined);
});
