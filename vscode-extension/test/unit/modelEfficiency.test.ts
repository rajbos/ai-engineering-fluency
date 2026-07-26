import test from 'node:test';
import * as assert from 'node:assert/strict';
import {
    isEditToolName,
    extractEditFilePath,
    computeEfficiencyFromTurns,
    jsonRequestToToolCalls,
    mergeModelEfficiency,
    applyModelUsageToEfficiency,
    deriveModelEfficiencyRates,
    createEmptyModelEfficiencyCounters,
    computeEfficiencyLowUsageThreshold,
    type EfficiencyTurn,
} from '../../../src/modelEfficiency';
import type { ModelEfficiencyUsage, ModelPricing } from '../../../src/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function editCall(file: string, toolName = 'Edit'): { toolName: string; arguments?: string } {
    return { toolName, arguments: JSON.stringify({ file_path: file }) };
}

function turn(model: string | null, toolCalls: { toolName: string; arguments?: string }[]): EfficiencyTurn {
    return { model, toolCalls };
}

const PRICING: { [key: string]: ModelPricing } = {
    'gpt-4o': { inputCostPerMillion: 2.5, outputCostPerMillion: 10 },
    'claude-sonnet-4.5': { inputCostPerMillion: 3, outputCostPerMillion: 15, cachedInputCostPerMillion: 0.3 },
};

// ---------------------------------------------------------------------------
// isEditToolName / extractEditFilePath
// ---------------------------------------------------------------------------

test('isEditToolName: recognizes edit tools across editors', () => {
    // Claude Code, Copilot CLI, Copilot Chat, Cline, Gemini CLI, Kiro
    for (const name of ['Edit', 'Write', 'MultiEdit', 'NotebookEdit', 'edit', 'create', 'editFiles', 'apply_patch', 'replace_string_in_file', 'write_to_file', 'replace', 'fsWrite', 'strReplace']) {
        assert.equal(isEditToolName(name), true, `${name} should be an edit tool`);
    }
});

test('isEditToolName: rejects read-only and terminal tools', () => {
    for (const name of ['Read', 'Bash', 'Grep', 'Glob', 'runCommand', 'terminal', 'search', 'fetch_webpage', 'view']) {
        assert.equal(isEditToolName(name), false, `${name} should not be an edit tool`);
    }
});

test('extractEditFilePath: reads common path argument keys', () => {
    assert.equal(extractEditFilePath(JSON.stringify({ file_path: '/a/b.ts' })), '/a/b.ts');
    assert.equal(extractEditFilePath(JSON.stringify({ path: 'src/x.ts' })), 'src/x.ts');
    assert.equal(extractEditFilePath(JSON.stringify({ filePath: 'y.py' })), 'y.py');
    assert.equal(extractEditFilePath(JSON.stringify({ uri: { fsPath: 'C:\\z.cs' } })), 'C:\\z.cs');
    assert.equal(extractEditFilePath(JSON.stringify({ uri: { path: '/w.go' } })), '/w.go');
});

test('extractEditFilePath: returns null for missing/invalid arguments', () => {
    assert.equal(extractEditFilePath(undefined), null);
    assert.equal(extractEditFilePath('not-json'), null);
    assert.equal(extractEditFilePath(JSON.stringify({ old_str: 'x', new_str: 'y' })), null);
    assert.equal(extractEditFilePath(JSON.stringify('a-string')), null);
});

// ---------------------------------------------------------------------------
// computeEfficiencyFromTurns
// ---------------------------------------------------------------------------

test('computeEfficiencyFromTurns: one-shot edit turn counts as one-shot', () => {
    const eff = computeEfficiencyFromTurns([
        turn('gpt-4o', [{ toolName: 'Read' }, editCall('/a.ts'), editCall('/b.ts')]),
    ]);
    const c = eff['gpt-4o'];
    assert.equal(c.calls, 1);
    assert.equal(c.editTurns, 1);
    assert.equal(c.oneShotEditTurns, 1);
    assert.equal(c.retries, 0);
    assert.equal(c.selfCorrections, 0);
    assert.equal(c.editToolCalls, 2);
});

test('computeEfficiencyFromTurns: consecutive same-file edits count as retries', () => {
    const eff = computeEfficiencyFromTurns([
        turn('gpt-4o', [editCall('/a.ts'), editCall('/a.ts'), editCall('/a.ts')]),
    ]);
    const c = eff['gpt-4o'];
    assert.equal(c.editTurns, 1);
    assert.equal(c.retries, 2);
    assert.equal(c.selfCorrections, 0);
    assert.equal(c.oneShotEditTurns, 0);
});

test('computeEfficiencyFromTurns: re-edit after another tool call is a self-correction', () => {
    const eff = computeEfficiencyFromTurns([
        turn('claude-sonnet-4.5', [editCall('/a.ts'), { toolName: 'Bash' }, editCall('/a.ts')]),
    ]);
    const c = eff['claude-sonnet-4.5'];
    assert.equal(c.editTurns, 1);
    assert.equal(c.retries, 0);
    assert.equal(c.selfCorrections, 1);
    assert.equal(c.oneShotEditTurns, 0);
});

test('computeEfficiencyFromTurns: edit of a different file between re-edits still self-corrects', () => {
    // a.ts edited, b.ts edited, back to a.ts: the a.ts re-edit is not adjacent → self-correction
    const eff = computeEfficiencyFromTurns([
        turn('gpt-4o', [editCall('/a.ts'), editCall('/b.ts'), editCall('/a.ts')]),
    ]);
    const c = eff['gpt-4o'];
    assert.equal(c.retries, 0);
    assert.equal(c.selfCorrections, 1);
});

test('computeEfficiencyFromTurns: edits without extractable paths never count as retries', () => {
    const eff = computeEfficiencyFromTurns([
        turn('gpt-4o', [{ toolName: 'Edit' }, { toolName: 'Edit' }, { toolName: 'Edit' }]),
    ]);
    const c = eff['gpt-4o'];
    assert.equal(c.editTurns, 1);
    assert.equal(c.editToolCalls, 3);
    assert.equal(c.retries, 0);
    assert.equal(c.selfCorrections, 0);
    assert.equal(c.oneShotEditTurns, 1);
});

test('computeEfficiencyFromTurns: attributes turns per model, null model becomes unknown', () => {
    const eff = computeEfficiencyFromTurns([
        turn('gpt-4o', []),
        turn('gpt-4o', [editCall('/a.ts')]),
        turn('claude-sonnet-4.5', []),
        turn(null, []),
    ]);
    assert.equal(eff['gpt-4o'].calls, 2);
    assert.equal(eff['gpt-4o'].editTurns, 1);
    assert.equal(eff['claude-sonnet-4.5'].calls, 1);
    assert.equal(eff['unknown'].calls, 1);
});

test('computeEfficiencyFromTurns: same file across different turns is not a retry', () => {
    const eff = computeEfficiencyFromTurns([
        turn('gpt-4o', [editCall('/a.ts')]),
        turn('gpt-4o', [editCall('/a.ts')]),
    ]);
    const c = eff['gpt-4o'];
    assert.equal(c.editTurns, 2);
    assert.equal(c.retries, 0);
    assert.equal(c.selfCorrections, 0);
    assert.equal(c.oneShotEditTurns, 2);
});

// ---------------------------------------------------------------------------
// jsonRequestToToolCalls (Copilot Chat JSON sessions)
// ---------------------------------------------------------------------------

test('jsonRequestToToolCalls: maps textEditGroup and tool invocations', () => {
    const calls = jsonRequestToToolCalls({
        response: [
            { kind: 'markdownContent' },
            { kind: 'textEditGroup', uri: { path: '/src/a.ts' } },
            { kind: 'toolInvocationSerialized' },
            { kind: 'textEditGroup', uri: { path: '/src/a.ts' } },
        ],
    });
    assert.equal(calls.length, 3);
    assert.equal(calls[0].toolName, 'edit');
    assert.equal(extractEditFilePath(calls[0].arguments), '/src/a.ts');
    assert.equal(calls[1].toolName, 'toolInvocation');
    // Feeding the sequence through the turn analyzer detects the self-correction
    const eff = computeEfficiencyFromTurns([{ model: 'gpt-4o', toolCalls: calls }]);
    assert.equal(eff['gpt-4o'].selfCorrections, 1);
    assert.equal(eff['gpt-4o'].retries, 0);
});

test('jsonRequestToToolCalls: handles missing response gracefully', () => {
    assert.deepEqual(jsonRequestToToolCalls({}), []);
    assert.deepEqual(jsonRequestToToolCalls({ response: undefined }), []);
});

// ---------------------------------------------------------------------------
// mergeModelEfficiency / applyModelUsageToEfficiency
// ---------------------------------------------------------------------------

test('mergeModelEfficiency: sums counters per model and creates missing entries', () => {
    const target: ModelEfficiencyUsage = {
        'gpt-4o': { ...createEmptyModelEfficiencyCounters(), calls: 2, editTurns: 1, oneShotEditTurns: 1 },
    };
    mergeModelEfficiency(target, {
        'gpt-4o': { ...createEmptyModelEfficiencyCounters(), calls: 3, editTurns: 2, retries: 1 },
        'claude-sonnet-4.5': { ...createEmptyModelEfficiencyCounters(), calls: 1 },
    });
    assert.equal(target['gpt-4o'].calls, 5);
    assert.equal(target['gpt-4o'].editTurns, 3);
    assert.equal(target['gpt-4o'].oneShotEditTurns, 1);
    assert.equal(target['gpt-4o'].retries, 1);
    assert.equal(target['claude-sonnet-4.5'].calls, 1);
});

test('mergeModelEfficiency: undefined source is a no-op', () => {
    const target: ModelEfficiencyUsage = {};
    mergeModelEfficiency(target, undefined);
    assert.deepEqual(target, {});
});

test('applyModelUsageToEfficiency: folds tokens and estimated cost into counters', () => {
    const eff: ModelEfficiencyUsage = {
        'gpt-4o': { ...createEmptyModelEfficiencyCounters(), calls: 4 },
    };
    applyModelUsageToEfficiency(eff, {
        'gpt-4o': { inputTokens: 1_000_000, outputTokens: 100_000, sessions: 0},
        'claude-sonnet-4.5': { inputTokens: 500_000, outputTokens: 50_000, cachedReadTokens: 400_000, sessions: 0},
    }, PRICING);

    assert.equal(eff['gpt-4o'].inputTokens, 1_000_000);
    assert.equal(eff['gpt-4o'].outputTokens, 100_000);
    // 1M input at $2.5/M + 100K output at $10/M = 2.5 + 1.0
    assert.ok(Math.abs(eff['gpt-4o'].cost - 3.5) < 1e-9);
    // Model without turn counters still gets a token-only entry
    assert.equal(eff['claude-sonnet-4.5'].calls, 0);
    assert.equal(eff['claude-sonnet-4.5'].cachedReadTokens, 400_000);
    assert.ok(eff['claude-sonnet-4.5'].cost > 0);
});

// ---------------------------------------------------------------------------
// deriveModelEfficiencyRates
// ---------------------------------------------------------------------------

test('deriveModelEfficiencyRates: computes all rates from counters', () => {
    const rates = deriveModelEfficiencyRates({
        calls: 10, editTurns: 4, oneShotEditTurns: 3, retries: 2, selfCorrections: 1,
        editToolCalls: 7, inputTokens: 1000, outputTokens: 500, cachedReadTokens: 800, cost: 2,
    });
    assert.equal(rates.oneShotRate, 0.75);
    assert.equal(rates.retryRate, 0.5);
    assert.equal(rates.selfCorrectionRate, 0.25);
    assert.equal(rates.costPerCall, 0.2);
    assert.equal(rates.costPerEdit, 0.5);
    assert.equal(rates.outputTokensPerCall, 50);
    assert.equal(rates.cacheHitRate, 0.8);
});

test('deriveModelEfficiencyRates: zero denominators produce nulls', () => {
    const rates = deriveModelEfficiencyRates(createEmptyModelEfficiencyCounters());
    assert.equal(rates.oneShotRate, null);
    assert.equal(rates.retryRate, null);
    assert.equal(rates.selfCorrectionRate, null);
    assert.equal(rates.costPerCall, null);
    assert.equal(rates.costPerEdit, null);
    assert.equal(rates.outputTokensPerCall, null);
    assert.equal(rates.cacheHitRate, null);
});

test('deriveModelEfficiencyRates: cacheHitRate is capped at 1.0 when cachedReadTokens > inputTokens', () => {
    // Some providers (e.g. DeepSeek) report cachedReadTokens > inputTokens; cap at 100%.
    const rates = deriveModelEfficiencyRates({
        calls: 5, editTurns: 0, oneShotEditTurns: 0, retries: 0, selfCorrections: 0,
        editToolCalls: 0, inputTokens: 100, outputTokens: 200, cachedReadTokens: 3000, cost: 0,
    });
    assert.equal(rates.cacheHitRate, 1);
});

// ---------------------------------------------------------------------------
// computeEfficiencyLowUsageThreshold
// ---------------------------------------------------------------------------

test('computeEfficiencyLowUsageThreshold: returns null for fewer than 4 models', () => {
    const usage: ModelEfficiencyUsage = {
        a: { ...createEmptyModelEfficiencyCounters(), calls: 100 },
        b: { ...createEmptyModelEfficiencyCounters(), calls: 50 },
        c: { ...createEmptyModelEfficiencyCounters(), calls: 10 },
    };
    assert.equal(computeEfficiencyLowUsageThreshold(usage), null);
});

test('computeEfficiencyLowUsageThreshold: returns Q1 (25th-percentile) turn count', () => {
    // 4 models sorted by calls: 1, 5, 20, 100 → index floor(3 * 0.25) = 0 → value 1
    const usage: ModelEfficiencyUsage = {
        a: { ...createEmptyModelEfficiencyCounters(), calls: 100 },
        b: { ...createEmptyModelEfficiencyCounters(), calls: 20 },
        c: { ...createEmptyModelEfficiencyCounters(), calls: 5 },
        d: { ...createEmptyModelEfficiencyCounters(), calls: 1 },
    };
    assert.equal(computeEfficiencyLowUsageThreshold(usage), 1);
});

test('computeEfficiencyLowUsageThreshold: correctly identifies Q1 across larger dataset', () => {
    // 8 models sorted: 1, 2, 3, 5, 10, 20, 50, 100 → index floor(7 * 0.25) = 1 → value 2
    const usage: ModelEfficiencyUsage = {};
    [100, 50, 20, 10, 5, 3, 2, 1].forEach((calls, i) => {
        usage[`model-${i}`] = { ...createEmptyModelEfficiencyCounters(), calls };
    });
    assert.equal(computeEfficiencyLowUsageThreshold(usage), 2);
});
