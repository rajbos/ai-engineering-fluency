/**
 * Hostile-fixture XSS regression tests.
 *
 * Webview session-log data (session titles, tool names, model names, file paths) is untrusted:
 * it originates from AI-agent session log files that a malicious repo or a prompt-injected agent
 * can shape. Parsers themselves are NOT expected to sanitize — they must faithfully return
 * whatever the log contains — so the tests below first confirm that raw parsed values carry the
 * payload unchanged (documenting the trust boundary), then confirm that every escaping/sanitize
 * helper the webviews actually render through neutralizes that same payload before it would ever
 * reach `setHtml()` (src/webview/shared/domUtils.ts).
 */
import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as path from 'node:path';
import * as os from 'node:os';

import { ClaudeCodeDataAccess } from '../../../src/claudecode';
import { CopilotCliAdapter } from '../../../src/adapters/copilotCliAdapter';
import { escapeHtml as escapeHtmlNode } from '../../src/utils/html';
import { escapeHtml as escapeHtmlWebview } from '../../src/webview/shared/formatUtils';
import { sanitizeAgentSessionsData } from '../../src/webview/usage/agentSessionsSanitizer';

// The fixture matches the Claude Code JSONL session-log format (see test/unit/claudecode.test.ts
// for other tests exercising this format). Its session title (`ai-title`), model id, tool_use
// name, tool_use file_path input, and cwd are all seeded with XSS payloads.
const FIXTURE_PATH = path.resolve(__dirname, '..', '..', '..', '..', 'test', 'fixtures', 'sample-session-data', 'xss-hostile-claude-session.jsonl');

const IMG_PAYLOAD = "<img src=x onerror=alert(1)>";
const SCRIPT_BREAKOUT_PAYLOAD = "\"><script>document.title='pwned'</script>";

function assertNeutralized(escaped: string, rawPayloadFragments: string[]): void {
	// The security property escaping provides isn't the absence of the words "script" or
	// "onerror" (those remain as inert text) — it's that no raw `<`, `>`, or `"` survive to be
	// re-parsed as markup/attributes by the browser. Assert on that directly.
	assert.ok(!escaped.includes('<'), `expected no raw '<' character, got: ${escaped}`);
	assert.ok(!escaped.includes('>'), `expected no raw '>' character, got: ${escaped}`);
	assert.ok(!escaped.includes('"'), `expected no raw '"' character, got: ${escaped}`);
	for (const fragment of rawPayloadFragments) {
		assert.ok(!escaped.includes(fragment), `expected escaped output to not contain raw fragment "${fragment}"`);
	}
}

// ---------------------------------------------------------------------------
// Claude Code JSONL fixture: parser passes payloads through untouched
// ---------------------------------------------------------------------------

test('hostile fixture: Claude Code session-log fixture file exists and is valid JSONL', async () => {
	const fs = await import('node:fs');
	assert.ok(fs.existsSync(FIXTURE_PATH), `fixture not found at ${FIXTURE_PATH}`);
	const lines = fs.readFileSync(FIXTURE_PATH, 'utf8').trim().split('\n');
	assert.ok(lines.length >= 4, 'fixture should contain multiple JSONL events');
	for (const line of lines) {
		assert.doesNotThrow(() => JSON.parse(line), `line should be valid JSON: ${line}`);
	}
});

test('hostile fixture: getClaudeCodeSessionMeta returns the raw (unescaped) malicious title and cwd', async () => {
	const claudeCode = new ClaudeCodeDataAccess();
	const meta = await claudeCode.getClaudeCodeSessionMeta(FIXTURE_PATH);
	assert.ok(meta);
	// Parsing must not silently rewrite attacker data — sanitization is a render-time
	// responsibility performed by the webview layer, not the parser.
	assert.ok(meta!.title?.includes(IMG_PAYLOAD), 'raw title should still contain the payload pre-escaping');
	assert.ok(meta!.cwd?.includes(IMG_PAYLOAD), 'raw cwd should still contain the payload pre-escaping');
});

test('hostile fixture: getClaudeCodeModelUsage keys the raw (unescaped) malicious model id', async () => {
	const claudeCode = new ClaudeCodeDataAccess();
	const usage = await claudeCode.getClaudeCodeModelUsage(FIXTURE_PATH);
	const maliciousModelKey = Object.keys(usage).find(k => k.includes('onerror='));
	assert.ok(maliciousModelKey, `expected a raw malicious model key among: ${Object.keys(usage).join(', ')}`);
});

// ---------------------------------------------------------------------------
// escapeHtml (both the extension-host copy and the webview copy) neutralizes
// session title / tool name / model name / file path payloads
// ---------------------------------------------------------------------------

test('escapeHtml (webview/shared/formatUtils): neutralizes a hostile Claude Code session title', async () => {
	const claudeCode = new ClaudeCodeDataAccess();
	const meta = await claudeCode.getClaudeCodeSessionMeta(FIXTURE_PATH);
	const escaped = escapeHtmlWebview(meta!.title ?? '');
	assertNeutralized(escaped, [IMG_PAYLOAD, SCRIPT_BREAKOUT_PAYLOAD]);
});

test('escapeHtml (webview/shared/formatUtils): neutralizes a hostile Claude Code cwd (file path)', async () => {
	const claudeCode = new ClaudeCodeDataAccess();
	const meta = await claudeCode.getClaudeCodeSessionMeta(FIXTURE_PATH);
	const escaped = escapeHtmlWebview(meta!.cwd ?? '');
	assertNeutralized(escaped, [IMG_PAYLOAD]);
});

test('escapeHtml (webview/shared/formatUtils): neutralizes a hostile model id', async () => {
	const claudeCode = new ClaudeCodeDataAccess();
	const usage = await claudeCode.getClaudeCodeModelUsage(FIXTURE_PATH);
	const maliciousModelKey = Object.keys(usage).find(k => k.includes('onerror='))!;
	const escaped = escapeHtmlWebview(maliciousModelKey);
	assertNeutralized(escaped, [maliciousModelKey]);
});

test('escapeHtml (webview/shared/formatUtils): neutralizes a hostile tool name and tool file_path input', () => {
	const toolName = "<img src=x onerror=alert('tool')>Read";
	const toolPath = "/repo/\"><script>alert('path')</script>/notes.md";
	assertNeutralized(escapeHtmlWebview(toolName), [toolName]);
	assertNeutralized(escapeHtmlWebview(toolPath), [toolPath]);
});

test('escapeHtml (src/utils/html.ts, used by the extension-host / backend webview scripts): neutralizes the same payloads', () => {
	assertNeutralized(escapeHtmlNode(IMG_PAYLOAD), [IMG_PAYLOAD]);
	assertNeutralized(escapeHtmlNode(SCRIPT_BREAKOUT_PAYLOAD), [SCRIPT_BREAKOUT_PAYLOAD]);
});

// ---------------------------------------------------------------------------
// sanitizeAgentSessionsData: every string field is escaped at the trust boundary
// ---------------------------------------------------------------------------

test('sanitizeAgentSessionsData: escapes owner, repo, and error fields containing XSS payloads', () => {
	const hostileInput = {
		authenticated: true,
		since: '2026-01-01T00:00:00.000Z',
		fetchedAt: '2026-01-01T00:00:00.000Z',
		totalTasks: 1,
		totalSessions: 1,
		totalCredits: 1,
		repos: [
			{
				owner: IMG_PAYLOAD,
				repo: SCRIPT_BREAKOUT_PAYLOAD,
				totalTasks: 1,
				totalSessions: 1,
				totalCredits: 1,
				tasksScanned: 1,
				tasksTotal: 1,
				partial: false,
				error: `${IMG_PAYLOAD}${SCRIPT_BREAKOUT_PAYLOAD}`,
			},
		],
	};

	const result = sanitizeAgentSessionsData(hostileInput);
	assert.equal(result.repos.length, 1);
	const repo = result.repos[0];

	assertNeutralized(repo.owner, [IMG_PAYLOAD]);
	assertNeutralized(repo.repo, [SCRIPT_BREAKOUT_PAYLOAD]);
	assertNeutralized(repo.error ?? '', [IMG_PAYLOAD, SCRIPT_BREAKOUT_PAYLOAD]);

	// repoUrl is derived from the (already-escaped) owner/repo via a strict URL constructor —
	// it must never carry the raw payload either, and must fall back to a safe placeholder
	// once the escaped owner/repo no longer form a valid https URL path.
	assert.ok(!repo.repoUrl.includes('<'));
	assert.ok(!repo.repoUrl.includes('>'));
});

test('sanitizeAgentSessionsData: escapes the "since" field containing an XSS payload', () => {
	const result = sanitizeAgentSessionsData({
		authenticated: false,
		since: `2026-01-01${IMG_PAYLOAD}`,
		repos: [],
	});
	assertNeutralized(result.since, [IMG_PAYLOAD]);
});

test('sanitizeAgentSessionsData: non-string / malformed repo entries do not throw and produce safe defaults', () => {
	const result = sanitizeAgentSessionsData({
		authenticated: true,
		repos: [null, 42, 'not-an-object', { owner: IMG_PAYLOAD }],
	});
	assert.equal(result.repos.length, 4);
	for (const repo of result.repos) {
		assert.ok(!repo.owner.includes('<img'));
		assert.ok(!repo.repo.includes('<img'));
	}
});

// ---------------------------------------------------------------------------
// Second format: Copilot CLI session metadata (DB-backed `summary` / `cwd`)
// mirrors the same trust boundary as Claude Code's JSONL `ai-title` / `cwd`.
// ---------------------------------------------------------------------------

test('hostile fixture: CopilotCliAdapter.getMeta returns the raw (unescaped) malicious summary/cwd, and escapeHtml neutralizes them', async () => {
	const sessionId = 'xss-test-9999-9999-9999-999999999999';
	const virtualPath = path.join(os.homedir(), '.copilot', `session-store.db#${sessionId}`);
	const mockStore = {
		isCliStoreSession: (p: string) => p === virtualPath,
		readSession: async (_p: string) => ({
			id: sessionId,
			cwd: `C:\\Users\\victim\\code\\${IMG_PAYLOAD}-repo`,
			repository: null,
			branch: null,
			summary: `Fix bug ${SCRIPT_BREAKOUT_PAYLOAD}`,
			created_at: '2026-07-20T10:00:00.000Z',
			updated_at: '2026-07-20T10:05:00.000Z',
		}),
	};

	const adapter = new CopilotCliAdapter();
	(adapter as unknown as { store: typeof mockStore }).store = mockStore;

	const meta = await adapter.getMeta(virtualPath);

	// Raw parser output still carries the payload — confirms the trust boundary is downstream.
	assert.ok(meta.title?.includes(SCRIPT_BREAKOUT_PAYLOAD));
	assert.ok(meta.workspacePath?.includes(IMG_PAYLOAD));

	// escapeHtml neutralizes both before they would ever reach setHtml().
	assertNeutralized(escapeHtmlWebview(meta.title ?? ''), [SCRIPT_BREAKOUT_PAYLOAD]);
	assertNeutralized(escapeHtmlWebview(meta.workspacePath ?? ''), [IMG_PAYLOAD]);
});
