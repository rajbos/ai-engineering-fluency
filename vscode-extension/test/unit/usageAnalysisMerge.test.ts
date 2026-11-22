import test from 'node:test';
import * as assert from 'node:assert/strict';
import { emptyAnalysis, emptyPeriod } from './usageAnalysisFixtures';
import { mergeUsageAnalysis, mergeModelEfficiencyTokens } from '../../../src/usageAnalysis';

// Tests for folding per-session usage analyses into a period aggregate
// (mergeUsageAnalysis / mergeModelEfficiencyTokens).

test('mergeUsageAnalysis: accumulates tool call counts across sessions', () => {
    const period = emptyPeriod();
    const a1 = emptyAnalysis();
    a1.toolCalls.total = 3;
    a1.toolCalls.byTool = { editFiles: 2, run_in_terminal: 1 };

    const a2 = emptyAnalysis();
    a2.toolCalls.total = 2;
    a2.toolCalls.byTool = { editFiles: 1, listFiles: 1 };

    mergeUsageAnalysis(period, a1);
    mergeUsageAnalysis(period, a2);

    assert.equal(period.toolCalls.total, 5);
    assert.equal(period.toolCalls.byTool['editFiles'], 3);
    assert.equal(period.toolCalls.byTool['run_in_terminal'], 1);
    assert.equal(period.toolCalls.byTool['listFiles'], 1);
});

test('mergeUsageAnalysis: sums Copilot Fusion rollups across sessions and merges the pattern mix', () => {
    const period = emptyPeriod();
    const rollup = (turns: number, aiu: number, pattern: string) => ({
        sessions: 1, totalTurns: turns, compoundTurns: 1, judgeAccepts: 0, judgeRejects: 1, escalatedTurns: 1,
        totalAiu: aiu, reviewAiu: aiu / 2, degradedTurns: 0, patternCounts: [{ pattern, turns, aiu }],
    });
    const a1 = emptyAnalysis();
    a1.hydraFusion = rollup(2, 10, 'cascade');
    const a2 = emptyAnalysis();
    a2.hydraFusion = rollup(1, 4, 'cascade');
    const a3 = emptyAnalysis();
    a3.hydraFusion = rollup(1, 1, 'single');
    mergeUsageAnalysis(period, a1);
    mergeUsageAnalysis(period, a2);
    mergeUsageAnalysis(period, a3);
    mergeUsageAnalysis(period, emptyAnalysis());
    assert.equal(period.hydraFusion!.sessions, 3);
    assert.equal(period.hydraFusion!.totalTurns, 4);
    assert.equal(period.hydraFusion!.totalAiu, 15);
    assert.deepEqual(period.hydraFusion!.patternCounts, [{ pattern: 'cascade', turns: 3, aiu: 14 }, { pattern: 'single', turns: 1, aiu: 1 }]);
    // The session's own rollup is not mutated by being merged.
    assert.equal(a1.hydraFusion.totalTurns, 2);
});

test('mergeUsageAnalysis: a period with no routed sessions has no hydraFusion rollup', () => {
    const period = emptyPeriod();
    mergeUsageAnalysis(period, emptyAnalysis());
    assert.equal(period.hydraFusion, undefined);
});

test('mergeUsageAnalysis: accumulates model efficiency counters per model', () => {
    const period = emptyPeriod();
    const a = emptyAnalysis();
    a.modelEfficiency = {
        'gpt-4o': {
            calls: 3, editTurns: 2, oneShotEditTurns: 1, retries: 1, selfCorrections: 0,
            editToolCalls: 3, inputTokens: 0, outputTokens: 0, cachedReadTokens: 0, cost: 0,
        },
    };
    mergeUsageAnalysis(period, a);
    mergeUsageAnalysis(period, a);

    assert.equal(period.modelEfficiency?.['gpt-4o'].calls, 6);
    assert.equal(period.modelEfficiency?.['gpt-4o'].editTurns, 4);
    assert.equal(period.modelEfficiency?.['gpt-4o'].oneShotEditTurns, 2);
    assert.equal(period.modelEfficiency?.['gpt-4o'].retries, 2);
});

test('mergeUsageAnalysis: sums vendorStats across sessions and keeps absent stats absent', () => {
    const period = emptyPeriod();
    const a = emptyAnalysis();
    a.vendorStats = {
        tokensPerSecond: { samples: 1, sum: 100 }, reportedCostDollars: 0.5, steps: 10,
        toolOutcomes: { succeeded: 8, failed: 1 },
    };
    const b = emptyAnalysis();
    b.vendorStats = {
        tokensPerSecond: { samples: 1, sum: 50 }, lastTurnDurationMs: { samples: 1, sum: 2000 },
        toolOutcomes: { succeeded: 2, rejected: 3, hookDenied: 1 },
    };
    mergeUsageAnalysis(period, a);
    mergeUsageAnalysis(period, b);
    mergeUsageAnalysis(period, emptyAnalysis());

    const v = period.vendorStats!;
    assert.deepEqual(v.tokensPerSecond, { samples: 2, sum: 150 });
    assert.deepEqual(v.lastTurnDurationMs, { samples: 1, sum: 2000 });
    assert.equal(v.reportedCostDollars, 0.5);
    assert.equal(v.steps, 10);
    assert.deepEqual(v.toolOutcomes, { succeeded: 10, failed: 1, rejected: 3, hookDenied: 1 });
    assert.equal('agreed' in v.toolOutcomes!, false, 'a counter no session reported stays absent');
});

test('mergeUsageAnalysis: leaves period.vendorStats absent when no analysis has it', () => {
    const period = emptyPeriod();
    mergeUsageAnalysis(period, emptyAnalysis());
    assert.equal(period.vendorStats, undefined);
});

test('mergeUsageAnalysis: leaves period.modelEfficiency absent when analysis has none', () => {
    const period = emptyPeriod();
    mergeUsageAnalysis(period, emptyAnalysis());
    assert.equal(period.modelEfficiency, undefined);
});

test('mergeUsageAnalysis: uses uncapped correction counts and tracks user-correction sessions separately', () => {
    const period = emptyPeriod();
    const analysis = emptyAnalysis();
    analysis.correctionMoments = [{
        type: 'tool-error', turnNumber: 1, timestamp: null, snippet: 'Tool failed: edit', tool: 'edit',
    }];
    analysis.correctionCounts = {
        userCorrections: 2, editRetries: 60, editSelfCorrections: 4,
        toolErrors: 70, toolErrorsRetried: 50, agentSelfCorrections: 1, escalatedUserCorrections: 1,
    };
    mergeUsageAnalysis(period, analysis);
    assert.equal(period.corrections?.editRetries, 60);
    assert.equal(period.corrections?.toolErrors, 70);
    assert.equal(period.corrections?.sessionsWithMoments, 1);
    assert.equal(period.corrections?.sessionsWithUserCorrections, 1);
    assert.equal(period.corrections?.sessionsWithEscalations, 1);
});

test('mergeModelEfficiencyTokens: folds per-session model usage tokens and cost into the period', () => {
    const period = emptyPeriod();
    mergeModelEfficiencyTokens(period, {
        'gpt-4o': { inputTokens: 1_000_000, outputTokens: 100_000, cachedReadTokens: 250_000, sessions: 0},
    }, { 'gpt-4o': { inputCostPerMillion: 2.5, outputCostPerMillion: 10 } } as any);

    const c = period.modelEfficiency?.['gpt-4o'];
    assert.ok(c);
    assert.equal(c.inputTokens, 1_000_000);
    assert.equal(c.outputTokens, 100_000);
    assert.equal(c.cachedReadTokens, 250_000);
    assert.ok(c.cost > 0);
    // Empty usage is a no-op and does not create the aggregate
    const untouched = emptyPeriod();
    mergeModelEfficiencyTokens(untouched, {}, {});
    assert.equal(untouched.modelEfficiency, undefined);
});

test('mergeUsageAnalysis: accumulates mode usage counts', () => {
    const period = emptyPeriod();
    const a = emptyAnalysis();
    a.modeUsage = { ask: 5, edit: 2, agent: 3, plan: 1, customAgent: 0, cli: 0 };
    mergeUsageAnalysis(period, a);
    mergeUsageAnalysis(period, a); // merge twice

    assert.equal(period.modeUsage.ask, 10);
    assert.equal(period.modeUsage.edit, 4);
    assert.equal(period.modeUsage.agent, 6);
    assert.equal(period.modeUsage.plan, 2);
});

test('mergeUsageAnalysis: accumulates context reference counts', () => {
    const period = emptyPeriod();
    const a = emptyAnalysis();
    a.contextReferences.file = 3;
    a.contextReferences.workspace = 2;
    a.contextReferences.codebase = 1;
    mergeUsageAnalysis(period, a);
    mergeUsageAnalysis(period, a);

    assert.equal(period.contextReferences.file, 6);
    assert.equal(period.contextReferences.workspace, 4);
    assert.equal(period.contextReferences.codebase, 2);
});

test('mergeUsageAnalysis: aggregates task-category primary and weighted sessions', () => {
    const period = emptyPeriod();
    const a1 = emptyAnalysis();
    a1.taskClassification.primaryCategory = 'Coding';
    a1.taskClassification.categoryShares = {
    	Coding: 0.75,
    	Testing: 0.25,
    	Debugging: 0,
    	'Feature Dev': 0,
    	Refactoring: 0,
    	Exploration: 0,
    	Planning: 0,
    	Delegation: 0,
    	'Git Ops': 0,
    	'Build/Deploy': 0,
    	Brainstorming: 0,
    	Conversation: 0,
    };
    const a2 = emptyAnalysis();
    a2.taskClassification.primaryCategory = 'Testing';
    a2.taskClassification.categoryShares = {
    	Coding: 0.2,
    	Testing: 0.8,
    	Debugging: 0,
    	'Feature Dev': 0,
    	Refactoring: 0,
    	Exploration: 0,
    	Planning: 0,
    	Delegation: 0,
    	'Git Ops': 0,
    	'Build/Deploy': 0,
    	Brainstorming: 0,
    	Conversation: 0,
    };
    mergeUsageAnalysis(period, a1);
    mergeUsageAnalysis(period, a2);
    assert.equal(period.taskCategoryPrimarySessions?.Coding, 1);
    assert.equal(period.taskCategoryPrimarySessions?.Testing, 1);
    assert.ok(Math.abs((period.taskCategoryWeightedSessions?.Coding ?? 0) - 0.95) < 1e-9);
    assert.ok(Math.abs((period.taskCategoryWeightedSessions?.Testing ?? 0) - 1.05) < 1e-9);
});

test('mergeUsageAnalysis: accumulates code context line counts', () => {
    const period = emptyPeriod();
    const a1 = emptyAnalysis();
    a1.contextReferences.codeContextLines = 12;
    const a2 = emptyAnalysis();
    a2.contextReferences.codeContextLines = 8;

    mergeUsageAnalysis(period, a1);
    mergeUsageAnalysis(period, a2);

    assert.equal(period.contextReferences.codeContextLines, 20);
});

test('mergeUsageAnalysis: accumulates MCP tool counts by server and tool', () => {
    const period = emptyPeriod();
    const a = emptyAnalysis();
    a.mcpTools.total = 4;
    a.mcpTools.byServer = { 'GitHub MCP': 3, 'Jira MCP': 1 };
    a.mcpTools.byTool = { 'mcp_io_github_git_list_issues': 3, 'mcp_jira_get_issue': 1 };
    mergeUsageAnalysis(period, a);
    mergeUsageAnalysis(period, a);

    assert.equal(period.mcpTools.total, 8);
    assert.equal(period.mcpTools.byServer['GitHub MCP'], 6);
    assert.equal(period.mcpTools.byServer['Jira MCP'], 2);
});

test('mergeUsageAnalysis: tracks mixed-tier sessions when modelCount > 0', () => {
    const period = emptyPeriod();
    const a = emptyAnalysis();
    a.modelSwitching.modelCount = 2;
    a.modelSwitching.hasMixedTiers = true;
    a.modelSwitching.tiers.standard = ['gpt-4o-mini'];
    a.modelSwitching.tiers.premium = ['claude-sonnet'];
    a.modelSwitching.standardRequests = 3;
    a.modelSwitching.premiumRequests = 2;
    a.modelSwitching.lowCostRequests = 1;
    a.modelSwitching.mediumCostRequests = 3;
    a.modelSwitching.highCostRequests = 1;
    a.modelSwitching.hasMixedCosts = true;
    a.modelSwitching.costBuckets.low = ['gpt-4o-mini'];
    a.modelSwitching.costBuckets.medium = ['claude-sonnet'];
    a.modelSwitching.totalRequests = 5;
    mergeUsageAnalysis(period, a);

    assert.equal(period.modelSwitching.mixedTierSessions, 1);
    assert.equal(period.modelSwitching.mixedCostSessions, 1);
    assert.equal(period.modelSwitching.totalSessions, 1);
    assert.ok(period.modelSwitching.standardModels.includes('gpt-4o-mini'));
    assert.ok(period.modelSwitching.premiumModels.includes('claude-sonnet'));
    assert.ok(period.modelSwitching.lowCostModels.includes('gpt-4o-mini'));
    assert.ok(period.modelSwitching.mediumCostModels.includes('claude-sonnet'));
    assert.equal(period.modelSwitching.standardRequests, 3);
    assert.equal(period.modelSwitching.premiumRequests, 2);
    assert.equal(period.modelSwitching.lowCostRequests, 1);
    assert.equal(period.modelSwitching.mediumCostRequests, 3);
    assert.equal(period.modelSwitching.highCostRequests, 1);
});

test('mergeUsageAnalysis: sessions with modelCount=0 do not affect switching stats', () => {
    const period = emptyPeriod();
    const a = emptyAnalysis();
    a.modelSwitching.modelCount = 0; // no models detected
    mergeUsageAnalysis(period, a);

    assert.equal(period.modelSwitching.totalSessions, 0);
    assert.equal(period.modelSwitching.mixedTierSessions, 0);
});

test('mergeUsageAnalysis: accumulates byKind context counts', () => {
    const period = emptyPeriod();
    const a = emptyAnalysis();
    a.contextReferences.byKind = { 'copilot.image': 2, 'file': 5 };
    mergeUsageAnalysis(period, a);
    mergeUsageAnalysis(period, a);

    assert.equal(period.contextReferences.byKind['copilot.image'], 4);
    assert.equal(period.contextReferences.byKind['file'], 10);
});

test('mergeUsageAnalysis: failure counts and latency histograms are summed across sessions and absent fields are skipped', () => {
    const period = emptyPeriod();
    const a = emptyAnalysis();
    a.toolCalls.completedByTool = { view: 2 };
    a.mcpTools.completedByServer = { gh: 1 };
    a.toolCalls.failuresByTool = { view: 1 };
    a.toolCalls.latencyByTool = { view: { count: 2, sumMs: 60, buckets: [0, 0, 0, 0, 1, 1] } };
    a.mcpTools.failuresByServer = { gh: 1 };
    a.mcpTools.latencyByServer = { gh: { count: 1, sumMs: 1500, buckets: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1] } };
    const b = emptyAnalysis();
    b.toolCalls.completedByTool = { view: 1, edit: 1 };
    b.toolCalls.failuresByTool = { view: 2, edit: 1 };
    b.toolCalls.latencyByTool = { view: { count: 1, sumMs: 5000, buckets: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1] } };
    const c = emptyAnalysis(); // no new fields at all (old cache entry)

    mergeUsageAnalysis(period, a);
    mergeUsageAnalysis(period, b);
    mergeUsageAnalysis(period, c);

    assert.deepEqual(period.toolCalls.completedByTool, { view: 3, edit: 1 });
    assert.deepEqual(period.mcpTools.completedByServer, { gh: 1 });
    assert.deepEqual(period.toolCalls.failuresByTool, { view: 3, edit: 1 });
    assert.equal(period.toolCalls.latencyByTool!.view.count, 3);
    assert.equal(period.toolCalls.latencyByTool!.view.sumMs, 5060);
    assert.equal(period.toolCalls.latencyByTool!.view.buckets[4], 1);
    assert.equal(period.toolCalls.latencyByTool!.view.buckets[12], 1);
    assert.deepEqual(period.mcpTools.failuresByServer, { gh: 1 });
    assert.equal(period.mcpTools.latencyByServer!.gh.sumMs, 1500);

    const untouched = emptyPeriod();
    mergeUsageAnalysis(untouched, c);
    assert.equal(untouched.toolCalls.completedByTool, undefined);
    assert.equal(untouched.toolCalls.failuresByTool, undefined);
    assert.equal(untouched.toolCalls.latencyByTool, undefined);
    assert.equal(untouched.mcpTools.failuresByServer, undefined);
});

test('mergeUsageAnalysis: accumulates outputTokensByTool when present', () => {
    const period = emptyPeriod();
    const a1 = emptyAnalysis();
    a1.toolCalls.total = 2;
    a1.toolCalls.byTool = { read: 2 };
    a1.toolCalls.outputTokensByTool = { read: 1200 };

    const a2 = emptyAnalysis();
    a2.toolCalls.total = 1;
    a2.toolCalls.byTool = { read: 1 };
    a2.toolCalls.outputTokensByTool = { read: 800 };

    mergeUsageAnalysis(period, a1);
    mergeUsageAnalysis(period, a2);

    assert.equal(period.toolCalls.outputTokensByTool?.['read'], 2000);
});

test('mergeUsageAnalysis: handles missing outputTokensByTool gracefully', () => {
    const period = emptyPeriod();
    const a = emptyAnalysis();
    a.toolCalls.total = 1;
    a.toolCalls.byTool = { search: 1 };
    // No outputTokensByTool set

    mergeUsageAnalysis(period, a);

    assert.equal(period.toolCalls.outputTokensByTool, undefined);
});

test('mergeUsageAnalysis: merges outputTokensByTool from multiple tools', () => {
    const period = emptyPeriod();
    const a1 = emptyAnalysis();
    a1.toolCalls.byTool = { read: 1, search: 1 };
    a1.toolCalls.outputTokensByTool = { read: 500, search: 300 };

    const a2 = emptyAnalysis();
    a2.toolCalls.byTool = { read: 1, edit: 1 };
    a2.toolCalls.outputTokensByTool = { read: 400, edit: 50 };

    mergeUsageAnalysis(period, a1);
    mergeUsageAnalysis(period, a2);

    assert.equal(period.toolCalls.outputTokensByTool?.['read'], 900);
    assert.equal(period.toolCalls.outputTokensByTool?.['search'], 300);
    assert.equal(period.toolCalls.outputTokensByTool?.['edit'], 50);
});

test('mergeUsageAnalysis: merges editScope singleFileEdits and avgFilesPerSession', () => {
    const period = emptyPeriod();
    const a = emptyAnalysis();
    a.editScope = { singleFileEdits: 1, multiFileEdits: 0, totalEditedFiles: 1, avgFilesPerSession: 1 };
    mergeUsageAnalysis(period, a);
    assert.equal(period.editScope.singleFileEdits, 1);
    assert.equal(period.editScope.multiFileEdits, 0);
    assert.equal(period.editScope.totalEditedFiles, 1);
    assert.equal(period.editScope.avgFilesPerSession, 1);
});

test('mergeUsageAnalysis: merges editScope multiFileEdits', () => {
    const period = emptyPeriod();
    const a = emptyAnalysis();
    a.editScope = { singleFileEdits: 0, multiFileEdits: 1, totalEditedFiles: 3, avgFilesPerSession: 3 };
    mergeUsageAnalysis(period, a);
    assert.equal(period.editScope.multiFileEdits, 1);
    assert.equal(period.editScope.totalEditedFiles, 3);
});

test('mergeUsageAnalysis: merges applyUsage and calculates applyRate', () => {
    const period = emptyPeriod();
    const a = emptyAnalysis();
    a.applyUsage = { totalApplies: 4, totalCodeBlocks: 10, applyRate: 40 };
    mergeUsageAnalysis(period, a);
    assert.equal(period.applyUsage.totalApplies, 4);
    assert.equal(period.applyUsage.totalCodeBlocks, 10);
    assert.equal(period.applyUsage.applyRate, 40);
});

test('mergeUsageAnalysis: applyUsage with zero codeBlocks yields applyRate=0', () => {
    const period = emptyPeriod();
    const a = emptyAnalysis();
    a.applyUsage = { totalApplies: 0, totalCodeBlocks: 0, applyRate: 0 };
    mergeUsageAnalysis(period, a);
    assert.equal(period.applyUsage.applyRate, 0);
});

test('mergeUsageAnalysis: merges sessionDuration when sessions > 0', () => {
    const period = emptyPeriod();
    period.sessions = 1;
    const a = emptyAnalysis();
    a.sessionDuration = { totalDurationMs: 30000, avgDurationMs: 30000, avgFirstProgressMs: 300, avgTotalElapsedMs: 1000, avgWaitTimeMs: 100, activeDurationMs: 15000 };
    mergeUsageAnalysis(period, a);
    assert.equal(period.sessionDuration.totalDurationMs, 30000);
    assert.equal(period.sessionDuration.avgDurationMs, 30000);
    assert.equal(period.sessionDuration.avgFirstProgressMs, 300);
    assert.equal(period.sessionDuration.avgTotalElapsedMs, 1000);
    assert.equal(period.sessionDuration.avgWaitTimeMs, 100);
});

test('mergeUsageAnalysis: sessionDuration with sessions=0 skips avg calculation', () => {
    const period = emptyPeriod();
    // period.sessions defaults to 0
    const a = emptyAnalysis();
    a.sessionDuration = { totalDurationMs: 60000, avgDurationMs: 60000, avgFirstProgressMs: 500, avgTotalElapsedMs: 2000, avgWaitTimeMs: 200, activeDurationMs: 25000 };
    mergeUsageAnalysis(period, a);
    assert.equal(period.sessionDuration.totalDurationMs, 60000);
    // avgDurationMs stays 0 since sessionCount <= 0
    assert.equal(period.sessionDuration.avgDurationMs, 0);
});

test('mergeUsageAnalysis: merges conversationPatterns and updates avgTurnsPerSession', () => {
    const period = emptyPeriod();
    const a = emptyAnalysis();
    a.conversationPatterns = { multiTurnSessions: 1, singleTurnSessions: 0, avgTurnsPerSession: 7, maxTurnsInSession: 7 };
    mergeUsageAnalysis(period, a);
    assert.equal(period.conversationPatterns.multiTurnSessions, 1);
    assert.equal(period.conversationPatterns.singleTurnSessions, 0);
    assert.equal(period.conversationPatterns.maxTurnsInSession, 7);
    assert.equal(period.conversationPatterns.avgTurnsPerSession, 7);
});

test('mergeUsageAnalysis: conversationPatterns with both zero sessions skips avgTurns', () => {
    const period = emptyPeriod();
    const a = emptyAnalysis();
    a.conversationPatterns = { multiTurnSessions: 0, singleTurnSessions: 0, avgTurnsPerSession: 0, maxTurnsInSession: 0 };
    mergeUsageAnalysis(period, a);
    assert.equal(period.conversationPatterns.avgTurnsPerSession, 0);
});

test('mergeUsageAnalysis: merges agentTypes counts', () => {
    const period = emptyPeriod();
    const a = emptyAnalysis();
    a.agentTypes = { editsAgent: 2, defaultAgent: 3, workspaceAgent: 1, other: 4 };
    mergeUsageAnalysis(period, a);
    assert.equal(period.agentTypes.editsAgent, 2);
    assert.equal(period.agentTypes.defaultAgent, 3);
    assert.equal(period.agentTypes.workspaceAgent, 1);
    assert.equal(period.agentTypes.other, 4);
});

test('mergeUsageAnalysis: accumulates agentTypes on repeated merge', () => {
    const period = emptyPeriod();
    const a = emptyAnalysis();
    a.agentTypes = { editsAgent: 1, defaultAgent: 1, workspaceAgent: 0, other: 0 };
    mergeUsageAnalysis(period, a);
    mergeUsageAnalysis(period, a);
    assert.equal(period.agentTypes.editsAgent, 2);
    assert.equal(period.agentTypes.defaultAgent, 2);
});

test('mergeUsageAnalysis: merges thinkingEffort and initialises period field', () => {
    const period = emptyPeriod();
    const a = emptyAnalysis();
    a.thinkingEffort = { byEffort: { high: 5 }, switchCount: 2, defaultEffort: 'high' };
    mergeUsageAnalysis(period, a);
    assert.ok(period.thinkingEffortUsage, 'thinkingEffortUsage should be initialised');
    assert.equal(period.thinkingEffortUsage!.sessionCount, 1);
    assert.equal(period.thinkingEffortUsage!.byEffort['high'], 5);
    assert.equal(period.thinkingEffortUsage!.switchCount, 2);
});

test('mergeUsageAnalysis: second thinkingEffort merge accumulates sessionCount and byEffort', () => {
    const period = emptyPeriod();
    const a = emptyAnalysis();
    a.thinkingEffort = { byEffort: { high: 3, medium: 1 }, switchCount: 1, defaultEffort: 'high' };
    mergeUsageAnalysis(period, a);
    mergeUsageAnalysis(period, a);
    assert.equal(period.thinkingEffortUsage!.sessionCount, 2);
    assert.equal(period.thinkingEffortUsage!.byEffort['high'], 6);
    assert.equal(period.thinkingEffortUsage!.byEffort['medium'], 2);
    assert.equal(period.thinkingEffortUsage!.switchCount, 2);
});

test('mergeUsageAnalysis: handles null modelSwitching on analysis object gracefully', () => {
    const period = emptyPeriod();
    const a = emptyAnalysis();
    (a as any).modelSwitching = null;
    mergeUsageAnalysis(period, a);
    assert.equal(period.modelSwitching.totalSessions, 0);
});

test('mergeUsageAnalysis: merges unknown-tier models into unknownModels list', () => {
    const period = emptyPeriod();
    const a = emptyAnalysis();
    a.modelSwitching.modelCount = 1;
    a.modelSwitching.tiers = { standard: [], premium: [], unknown: ['some-unknown-model'] };
    a.modelSwitching.totalRequests = 2;
    a.modelSwitching.unknownRequests = 2;
    mergeUsageAnalysis(period, a);
    assert.ok(period.modelSwitching.unknownModels.includes('some-unknown-model'));
    assert.equal(period.modelSwitching.unknownRequests, 2);
});

test('mergeUsageAnalysis: folds cliApp into the period aggregate', () => {
    const period = emptyPeriod();
    const a = emptyAnalysis();
    a.modeUsage.cli = 3;
    a.modeUsage.cliApp = 2;
    mergeUsageAnalysis(period, a);
    assert.equal(period.modeUsage.cli, 3);
    assert.equal(period.modeUsage.cliApp, 2);
});
