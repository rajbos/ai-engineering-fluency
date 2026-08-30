import test from 'node:test';
import * as assert from 'node:assert/strict';
import {
    detectCorrectionMoments,
    summarizeCorrectionMoments,
    mergeCorrectionCounts,
    createEmptyCorrectionCounts,
    MAX_MOMENTS_PER_SESSION,
    USER_CORRECTION_PATTERNS,
    AGENT_SELF_CORRECTION_PATTERNS,
    type CorrectionTurn,
} from '../../../src/correctionDetection';
import type { ChatTurn } from '../../../src/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function editCall(file: string, toolName = 'Edit'): { toolName: string; arguments?: string } {
    return { toolName, arguments: JSON.stringify({ file_path: file }) };
}

function readCall(file: string): { toolName: string; arguments?: string } {
    return { toolName: 'Read', arguments: JSON.stringify({ file_path: file }) };
}

// ---------------------------------------------------------------------------
// user-correction
// ---------------------------------------------------------------------------

test('user-correction: detects common correction phrasings', () => {
    const cases = [
        'no, that is the wrong file',
        'No.',
        "that's wrong, use the other endpoint",
        'not what I asked for',
        "you're wrong about the API",
        'actually, keep the old behavior',
        'please revert that change',
        'why did you delete the test?',
        'you broke the build',
        'I already said to use vitest',
        "don't touch the migrations folder",
        'stop changing that file',
        "that didn't work",
        'wrong branch — use main',
    ];
    for (const [i, message] of cases.entries()) {
        const moments = detectCorrectionMoments([{ userMessage: message }]);
        assert.equal(moments.length, 1, `case ${i}: "${message}" should produce one moment`);
        assert.equal(moments[0].type, 'user-correction');
        assert.equal(moments[0].turnNumber, 1);
        assert.ok(moments[0].matchedPattern, 'should record the matched pattern label');
        assert.ok(moments[0].snippet.length > 0);
    }
});

test('user-correction: leaves ordinary requests alone', () => {
    const cases = [
        'add a login page',
        'yes, please continue',
        'can you stop the server when done?',  // "stop" only counts as an imperative correction
        'run the tests',
        'note: actually is fine inside prose-only requests',  // no comma after "actually"
    ];
    for (const message of cases) {
        const moments = detectCorrectionMoments([{ userMessage: message }]);
        assert.equal(moments.filter(m => m.type === 'user-correction').length, 0, `"${message}" should not be flagged`);
    }
});

// ---------------------------------------------------------------------------
// agent-self-correction
// ---------------------------------------------------------------------------

test('agent-self-correction: detects admission phrasings', () => {
    const cases = [
        'Let me fix that for you.',
        'My mistake — the path was wrong.',
        "I was wrong about the default.",
        "You're right, I'll change it.",
        'Apologies for the confusion.',
        'Sorry, that failed. Retrying now.',
        'I incorrectly assumed the file existed.',
    ];
    for (const response of cases) {
        const moments = detectCorrectionMoments([{ assistantResponse: response }]);
        assert.equal(moments.length, 1, `"${response}" should produce one moment`);
        assert.equal(moments[0].type, 'agent-self-correction');
    }
});

test('agent-self-correction: leaves ordinary responses alone', () => {
    const moments = detectCorrectionMoments([{ assistantResponse: 'Done — I added the login page and tests pass.' }]);
    assert.equal(moments.length, 0);
});

// ---------------------------------------------------------------------------
// edit-retry / edit-self-correction
// ---------------------------------------------------------------------------

test('edit-retry: repeat edit immediately after editing the same file', () => {
    const turns: CorrectionTurn[] = [{ toolCalls: [editCall('/a.ts'), editCall('/a.ts')] }];
    const moments = detectCorrectionMoments(turns);
    assert.equal(moments.length, 1);
    assert.equal(moments[0].type, 'edit-retry');
    assert.equal(moments[0].file, '/a.ts');
});

test('edit-self-correction: repeat edit with another tool call in between', () => {
    const turns: CorrectionTurn[] = [{ toolCalls: [editCall('/a.ts'), readCall('/b.ts'), editCall('/a.ts')] }];
    const moments = detectCorrectionMoments(turns);
    assert.equal(moments.length, 1);
    assert.equal(moments[0].type, 'edit-self-correction');
    assert.equal(moments[0].file, '/a.ts');
});

test('edit detection: edits to different files produce no moments', () => {
    const turns: CorrectionTurn[] = [{ toolCalls: [editCall('/a.ts'), editCall('/b.ts'), readCall('/a.ts')] }];
    assert.equal(detectCorrectionMoments(turns).length, 0);
});

test('edit detection: matches modelEfficiency definitions across turns', () => {
    // Retries are scoped per turn: editing the same file in two separate turns is not a retry.
    const turns: CorrectionTurn[] = [
        { toolCalls: [editCall('/a.ts')] },
        { toolCalls: [editCall('/a.ts')] },
    ];
    assert.equal(detectCorrectionMoments(turns).length, 0);
});

test('edit detection: edits without a path never produce false positives', () => {
    const noPath = { toolName: 'Edit', arguments: '{}' };
    const turns: CorrectionTurn[] = [{ toolCalls: [noPath, noPath, noPath] }];
    assert.equal(detectCorrectionMoments(turns).length, 0);
});

// ---------------------------------------------------------------------------
// tool-error
// ---------------------------------------------------------------------------

test('tool-error: failed call is flagged; later same-tool call marks it retried', () => {
    const turns: CorrectionTurn[] = [
        { toolCalls: [{ toolName: 'create', isError: true }] },
        { toolCalls: [{ toolName: 'create' }] },
    ];
    const moments = detectCorrectionMoments(turns);
    assert.equal(moments.length, 1);
    assert.equal(moments[0].type, 'tool-error');
    assert.equal(moments[0].tool, 'create');
    assert.equal(moments[0].retried, true);
});

test('tool-error: failure without a later retry stays not-retried', () => {
    const turns: CorrectionTurn[] = [
        { toolCalls: [{ toolName: 'create', isError: true }] },
        { toolCalls: [{ toolName: 'view' }] },
    ];
    const moments = detectCorrectionMoments(turns);
    assert.equal(moments.length, 1);
    assert.equal(moments[0].retried, false);
});

test('tool-error: two consecutive failures of the same tool each get their own moment', () => {
    const turns: CorrectionTurn[] = [
        { toolCalls: [{ toolName: 'edit', isError: true }, { toolName: 'edit', isError: true }] },
    ];
    const moments = detectCorrectionMoments(turns);
    assert.equal(moments.length, 2);
    assert.equal(moments[0].retried, true, 'the first failure counts as retried by the second attempt');
    assert.equal(moments[1].retried, false);
});

// ---------------------------------------------------------------------------
// ChatTurn compatibility and mixed sessions
// ---------------------------------------------------------------------------

test('accepts full ChatTurn objects (superset of CorrectionTurn)', () => {
    // Pick keeps the compiler checking field compatibility without constructing
    // the full ChatTurn (context refs etc. are irrelevant to detection).
    const chatTurn: Pick<ChatTurn, 'turnNumber' | 'timestamp' | 'userMessage' | 'assistantResponse' | 'toolCalls'> = {
        turnNumber: 1,
        timestamp: '2026-08-29T21:00:00.000Z',
        userMessage: 'no, wrong file',
        assistantResponse: 'My mistake, let me fix that.',
        toolCalls: [{ toolName: 'edit', arguments: JSON.stringify({ path: '/x.ts' }), result: 'ok' }],
    };
    const moments = detectCorrectionMoments([chatTurn]);
    assert.deepEqual(moments.map(m => m.type).sort(), ['agent-self-correction', 'user-correction']);
    assert.equal(moments[0].timestamp, '2026-08-29T21:00:00.000Z');
});

test('turn numbers are 1-based array positions', () => {
    const turns: CorrectionTurn[] = [
        { userMessage: 'add a login page' },
        { userMessage: 'add tests' },
        { userMessage: 'no, not like that' },
    ];
    const moments = detectCorrectionMoments(turns);
    assert.equal(moments.length, 1);
    assert.equal(moments[0].turnNumber, 3);
});

test('caps moments per session at MAX_MOMENTS_PER_SESSION', () => {
    const turns: CorrectionTurn[] = Array.from({ length: MAX_MOMENTS_PER_SESSION + 20 }, () => ({ userMessage: 'no, wrong' }));
    const moments = detectCorrectionMoments(turns);
    assert.equal(moments.length, MAX_MOMENTS_PER_SESSION);
});

test('a single turn cannot exceed MAX_MOMENTS_PER_SESSION', () => {
    const toolCalls = Array.from({ length: 60 }, (_, i) => ({ toolName: `tool${i}`, isError: true, result: 'failed' }));
    const moments = detectCorrectionMoments([{ userMessage: 'do all the things', toolCalls }]);
    assert.equal(moments.length, MAX_MOMENTS_PER_SESSION);
    assert.ok(moments.every(m => m.turnNumber === 1));
});

test('snippets are whitespace-normalized and length-capped', () => {
    const longMessage = 'x'.repeat(500) + '\n\nthat\'s wrong\n\n' + 'y'.repeat(500);
    const [moment] = detectCorrectionMoments([{ userMessage: longMessage }]);
    assert.ok(!moment.snippet.includes('\n'));
    assert.ok(moment.snippet.length <= 245, `snippet was ${moment.snippet.length} chars`);
});

// ---------------------------------------------------------------------------
// counts
// ---------------------------------------------------------------------------

test('summarizeCorrectionMoments: counts by type including retried tool errors', () => {
    const turns: CorrectionTurn[] = [
        { userMessage: 'no, wrong', toolCalls: [{ toolName: 'edit', isError: true }, editCall('/a.ts'), editCall('/a.ts')] },
        { assistantResponse: 'my mistake, let me fix it', toolCalls: [{ toolName: 'edit' }] },
    ];
    const counts = summarizeCorrectionMoments(detectCorrectionMoments(turns));
    assert.equal(counts.userCorrections, 1);
    assert.equal(counts.toolErrors, 1);
    assert.equal(counts.toolErrorsRetried, 1);
    assert.equal(counts.editRetries, 1);
    assert.equal(counts.agentSelfCorrections, 1);
    assert.equal(counts.editSelfCorrections, 0);
});

test('mergeCorrectionCounts: sums all fields and tolerates undefined', () => {
    const target = createEmptyCorrectionCounts();
    mergeCorrectionCounts(target, undefined);
    assert.deepEqual(target, createEmptyCorrectionCounts());
    mergeCorrectionCounts(target, { userCorrections: 2, editRetries: 1, editSelfCorrections: 0, toolErrors: 3, toolErrorsRetried: 2, agentSelfCorrections: 1 });
    mergeCorrectionCounts(target, { userCorrections: 1, editRetries: 0, editSelfCorrections: 4, toolErrors: 0, toolErrorsRetried: 0, agentSelfCorrections: 0 });
    assert.deepEqual(target, { userCorrections: 3, editRetries: 1, editSelfCorrections: 4, toolErrors: 3, toolErrorsRetried: 2, agentSelfCorrections: 1 });
});

test('pattern catalogs stay non-empty and well-formed', () => {
    for (const p of [...USER_CORRECTION_PATTERNS, ...AGENT_SELF_CORRECTION_PATTERNS]) {
        assert.ok(p.re instanceof RegExp);
        assert.ok(p.label.length > 0);
    }
});
