/**
 * Unit tests for ClineDataAccess (src/cline.ts).
 * Fixtures mirror the real on-disk format of the Cline VS Code extension
 * (saoudrizwan.claude-dev): per-task ui_messages.json plus the sibling
 * state/taskHistory.json index with authoritative token totals.
 */
import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as path from 'node:path';
import * as os from 'node:os';
import * as fs from 'node:fs';

import { ClineDataAccess } from '../../../src/cline';

const TASK_ID = '1782681302220';

/** Build a fixture globalStorage tree and return the session file path. */
function makeFixture(opts?: {
    uiMessages?: any[];
    taskHistory?: any[];
}): { root: string; sessionFile: string; storageDir: string } {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cline-test-'));
    const storageDir = path.join(root, 'Code', 'User', 'globalStorage', 'saoudrizwan.claude-dev');
    const taskDir = path.join(storageDir, 'tasks', TASK_ID);
    fs.mkdirSync(taskDir, { recursive: true });
    fs.mkdirSync(path.join(storageDir, 'state'), { recursive: true });

    const uiMessages = opts?.uiMessages ?? defaultUiMessages();
    const sessionFile = path.join(taskDir, 'ui_messages.json');
    fs.writeFileSync(sessionFile, JSON.stringify(uiMessages));

    const taskHistory = opts?.taskHistory ?? defaultTaskHistory();
    fs.writeFileSync(path.join(storageDir, 'state', 'taskHistory.json'), JSON.stringify(taskHistory));

    return { root, sessionFile, storageDir };
}

/** Mirrors the observed real ui_messages.json shape (Cline 4.x). */
function defaultUiMessages(): any[] {
    const modelInfo = { providerId: 'cline', modelId: 'stepfun/step-3.7-flash', mode: 'act' };
    return [
        { ts: 1782681302233, type: 'say', say: 'task', text: 'how many users does cline have?', modelInfo },
        {
            ts: 1782681323228, type: 'say', say: 'api_req_started', modelInfo,
            text: JSON.stringify({ request: '<task>...</task>', tokensIn: 13670, tokensOut: 311, cacheWrites: 0, cacheReads: 0, cost: 0 }),
        },
        { ts: 1782681340440, type: 'say', say: 'reasoning', text: 'The user is asking...', modelInfo },
        { ts: 1782681342835, type: 'say', say: 'text', text: 'Let me search.<tool_call>\n<search_files>\n<path>.</path>\n</search_files>', modelInfo },
        { ts: 1782681343771, type: 'say', say: 'tool', text: JSON.stringify({ tool: 'searchFiles', path: 'repo', content: 'Found 43 results.' }), modelInfo },
        {
            ts: 1782681345277, type: 'say', say: 'api_req_started', modelInfo,
            text: JSON.stringify({ request: '...', tokensIn: 3292, tokensOut: 295, cacheWrites: 0, cacheReads: 13312, cost: 0 }),
        },
        { ts: 1782681356109, type: 'say', say: 'text', text: 'Here is what I found.', modelInfo },
    ];
}

/** Mirrors the observed real state/taskHistory.json shape. */
function defaultTaskHistory(): any[] {
    return [{
        id: TASK_ID,
        ulid: '01KW81BX6GN4JC29YAQYWTENZY',
        ts: 1782681581474,
        task: 'how many users does cline have?',
        tokensIn: 16962,
        tokensOut: 606,
        cacheWrites: 0,
        cacheReads: 13312,
        totalCost: 0,
        cwdOnTaskInitialization: 'c:\\Users\\user\\repos\\my-project',
        modelId: 'stepfun/step-3.7-flash',
    }];
}

function cleanup(root: string): void {
    fs.rmSync(root, { recursive: true, force: true });
}

// ── isClineSessionFile ──────────────────────────────────────────────────────

test('isClineSessionFile: recognises task ui_messages.json (both slash styles)', () => {
    const da = new ClineDataAccess();
    assert.ok(da.isClineSessionFile('C:\\Users\\u\\AppData\\Roaming\\Code\\User\\globalStorage\\saoudrizwan.claude-dev\\tasks\\123\\ui_messages.json'));
    assert.ok(da.isClineSessionFile('/home/u/.config/Code/User/globalStorage/saoudrizwan.claude-dev/tasks/123/ui_messages.json'));
});

test('isClineSessionFile: rejects sibling task files and other paths', () => {
    const da = new ClineDataAccess();
    assert.ok(!da.isClineSessionFile('/x/saoudrizwan.claude-dev/tasks/123/api_conversation_history.json'));
    assert.ok(!da.isClineSessionFile('/x/saoudrizwan.claude-dev/state/taskHistory.json'));
    assert.ok(!da.isClineSessionFile('/home/u/.continue/sessions/abc.json'));
});

// ── tokens ──────────────────────────────────────────────────────────────────

test('getTokensFromClineSession: sums real per-request tokens incl. cache reads/writes', async () => {
    const { root, sessionFile } = makeFixture();
    try {
        const da = new ClineDataAccess();
        const result = await da.getTokensFromClineSession(sessionFile);
        // (13670+0+0+311) + (3292+0+13312+295) = 30880
        assert.equal(result.tokens, 30880);
        assert.equal(result.thinkingTokens, 0);
    } finally {
        cleanup(root);
    }
});

test('getTokensFromClineSession: falls back to taskHistory totals when no api_req data', async () => {
    const { root, sessionFile } = makeFixture({
        uiMessages: [{ ts: 1782681302233, type: 'say', say: 'task', text: 'hello' }],
    });
    try {
        const da = new ClineDataAccess();
        const result = await da.getTokensFromClineSession(sessionFile);
        // 16962 + 606 + 0 + 13312 = 30880
        assert.equal(result.tokens, 30880);
    } finally {
        cleanup(root);
    }
});

// ── interactions ────────────────────────────────────────────────────────────

test('countClineInteractions: counts task + user_feedback messages', async () => {
    const messages = defaultUiMessages();
    messages.push({ ts: 1782681400000, type: 'say', say: 'user_feedback', text: 'also check the docs' });
    const { root, sessionFile } = makeFixture({ uiMessages: messages });
    try {
        const da = new ClineDataAccess();
        assert.equal(await da.countClineInteractions(sessionFile), 2);
    } finally {
        cleanup(root);
    }
});

// ── model usage ─────────────────────────────────────────────────────────────

test('getClineModelUsage: per-model real usage with cache-read breakdown', async () => {
    const { root, sessionFile } = makeFixture();
    try {
        const da = new ClineDataAccess();
        const usage = await da.getClineModelUsage(sessionFile);
        const model = usage['stepfun/step-3.7-flash'];
        assert.ok(model);
        assert.equal(model.inputTokens, 13670 + 3292 + 13312);
        assert.equal(model.outputTokens, 311 + 295);
        assert.equal(model.cachedReadTokens, 13312);
        assert.equal(model.cacheCreationTokens, undefined);
    } finally {
        cleanup(root);
    }
});

// ── meta ────────────────────────────────────────────────────────────────────

test('getClineSessionMeta: title, timestamps, and workspace from taskHistory', async () => {
    const { root, sessionFile } = makeFixture();
    try {
        const da = new ClineDataAccess();
        const meta = await da.getClineSessionMeta(sessionFile);
        assert.equal(meta.title, 'how many users does cline have?');
        assert.equal(meta.firstInteraction, new Date(1782681302233).toISOString());
        assert.equal(meta.lastInteraction, new Date(1782681356109).toISOString());
        assert.equal(meta.workspacePath, 'c:\\Users\\user\\repos\\my-project');
    } finally {
        cleanup(root);
    }
});

test('getClineSessionMeta: falls back to task-folder epoch-ms id when file is empty', async () => {
    const { root, sessionFile } = makeFixture({ uiMessages: [], taskHistory: [] });
    try {
        const da = new ClineDataAccess();
        const meta = await da.getClineSessionMeta(sessionFile);
        assert.equal(meta.firstInteraction, new Date(Number(TASK_ID)).toISOString());
    } finally {
        cleanup(root);
    }
});

// ── daily fractions ─────────────────────────────────────────────────────────

test('getClineDailyFractions: fractions sum to 1.0', async () => {
    const { root, sessionFile } = makeFixture();
    try {
        const da = new ClineDataAccess();
        const fractions = await da.getClineDailyFractions(sessionFile);
        const sum = Object.values(fractions).reduce((a, b) => a + b, 0);
        assert.ok(Math.abs(sum - 1.0) < 1e-9);
    } finally {
        cleanup(root);
    }
});

// ── turns ───────────────────────────────────────────────────────────────────

test('buildClineTurns: builds one turn with tools, cleaned text, and real tokens', async () => {
    const { root, sessionFile } = makeFixture();
    try {
        const da = new ClineDataAccess();
        const turns = await da.buildClineTurns(sessionFile);
        assert.equal(turns.length, 1);
        const turn = turns[0];
        assert.equal(turn.userText, 'how many users does cline have?');
        // <tool_call> XML is stripped from assistant text
        assert.equal(turn.assistantText, 'Let me search.\n\nHere is what I found.');
        assert.equal(turn.model, 'stepfun/step-3.7-flash');
        assert.equal(turn.mode, 'act');
        assert.equal(turn.toolCalls.length, 1);
        assert.equal(turn.toolCalls[0].toolName, 'searchFiles');
        assert.equal(turn.inputTokens, 13670 + 3292 + 13312);
        assert.equal(turn.outputTokens, 311 + 295);
        assert.equal(turn.timestampMs, 1782681302233);
    } finally {
        cleanup(root);
    }
});

test('buildClineTurns: user_feedback starts a new turn', async () => {
    const messages = defaultUiMessages();
    messages.push({ ts: 1782681400000, type: 'say', say: 'user_feedback', text: 'also check the docs' });
    messages.push({ ts: 1782681400100, type: 'say', say: 'text', text: 'Checking the docs now.' });
    const { root, sessionFile } = makeFixture({ uiMessages: messages });
    try {
        const da = new ClineDataAccess();
        const turns = await da.buildClineTurns(sessionFile);
        assert.equal(turns.length, 2);
        assert.equal(turns[1].userText, 'also check the docs');
        assert.equal(turns[1].assistantText, 'Checking the docs now.');
    } finally {
        cleanup(root);
    }
});

// ── roots ───────────────────────────────────────────────────────────────────

test('getClineRootFromSessionFile: returns the saoudrizwan.claude-dev root', () => {
    const da = new ClineDataAccess();
    const sessionFile = 'C:\\Users\\u\\AppData\\Roaming\\Code\\User\\globalStorage\\saoudrizwan.claude-dev\\tasks\\123\\ui_messages.json';
    const root = da.getClineRootFromSessionFile(sessionFile);
    assert.ok(root.replace(/\\/g, '/').endsWith('/saoudrizwan.claude-dev'));
});
