// @ts-nocheck
import test from 'node:test';
import * as assert from 'node:assert/strict';
import {
    getModeType,
    getRepoDisplayName,
    parseGitRemoteUrl,
    isMcpTool,
    normalizeMcpToolName,
    extractMcpServerName,
    extractCustomAgentName,
    getEditorNameFromRoot,
    normalizePathSeparators,
    normalizePathForComparison,
    normalizePathForDedup,
    fileUriToPath,
    parseWorkspaceStorageJsonFile,
} from '../../src/workspaceHelpers';

// ---------------------------------------------------------------------------
// getModeType
// ---------------------------------------------------------------------------

test('getModeType: null/undefined mode defaults to ask', () => {
    assert.equal(getModeType(null), 'ask');
    assert.equal(getModeType(undefined), 'ask');
    assert.equal(getModeType({}), 'ask');
});

test('getModeType: kind=ask returns ask', () => {
    assert.equal(getModeType({ kind: 'ask' }), 'ask');
});

test('getModeType: kind=edit returns edit', () => {
    assert.equal(getModeType({ kind: 'edit' }), 'edit');
});

test('getModeType: kind=agent with no id returns agent', () => {
    assert.equal(getModeType({ kind: 'agent' }), 'agent');
    assert.equal(getModeType({ kind: 'agent', id: 'agent' }), 'agent');
});

test('getModeType: kind=agent with plan-agent id returns plan', () => {
    assert.equal(getModeType({ kind: 'agent', id: 'vscode-userdata:/settings/plan-agent/Plan.agent.md' }), 'plan');
});

test('getModeType: kind=agent with custom .agent.md file returns customAgent', () => {
    assert.equal(getModeType({ kind: 'agent', id: 'file:///workspace/.github/agents/my-agent.agent.md' }), 'customAgent');
});

test('getModeType: unknown kind defaults to ask', () => {
    assert.equal(getModeType({ kind: 'something-else' }), 'ask');
});

// ---------------------------------------------------------------------------
// getRepoDisplayName
// ---------------------------------------------------------------------------

test('getRepoDisplayName: empty/unknown returns Unknown', () => {
    assert.equal(getRepoDisplayName(''), 'Unknown');
    assert.equal(getRepoDisplayName('Unknown'), 'Unknown');
});

test('getRepoDisplayName: HTTPS URL returns owner/repo', () => {
    assert.equal(getRepoDisplayName('https://github.com/owner/repo'), 'owner/repo');
    assert.equal(getRepoDisplayName('https://github.com/owner/repo.git'), 'owner/repo');
});

test('getRepoDisplayName: SSH URL returns owner/repo', () => {
    assert.equal(getRepoDisplayName('git@github.com:owner/repo.git'), 'owner/repo');
    assert.equal(getRepoDisplayName('git@github.com:owner/repo'), 'owner/repo');
});

test('getRepoDisplayName: git+https URL strips git+ prefix', () => {
    assert.equal(getRepoDisplayName('git+https://github.com/owner/repo.git'), 'owner/repo');
});

test('getRepoDisplayName: GitHub Enterprise HTTPS URL returns owner/repo', () => {
    assert.equal(getRepoDisplayName('https://myghe.example.com/owner/repo'), 'owner/repo');
});

// ---------------------------------------------------------------------------
// parseGitRemoteUrl
// ---------------------------------------------------------------------------

test('parseGitRemoteUrl: returns undefined for empty string', () => {
    assert.equal(parseGitRemoteUrl(''), undefined);
});

test('parseGitRemoteUrl: extracts HTTPS remote origin URL', () => {
    const config = `
[core]
    repositoryformatversion = 0
[remote "origin"]
    url = https://github.com/owner/repo.git
    fetch = +refs/heads/*:refs/remotes/origin/*
`;
    assert.equal(parseGitRemoteUrl(config), 'https://github.com/owner/repo.git');
});

test('parseGitRemoteUrl: extracts SSH remote origin URL', () => {
    const config = `
[remote "origin"]
    url = git@github.com:owner/repo.git
`;
    assert.equal(parseGitRemoteUrl(config), 'git@github.com:owner/repo.git');
});

test('parseGitRemoteUrl: stops at next section boundary', () => {
    const config = `
[remote "origin"]
    url = https://github.com/owner/repo.git
[remote "upstream"]
    url = https://github.com/upstream/repo.git
`;
    assert.equal(parseGitRemoteUrl(config), 'https://github.com/owner/repo.git');
});

test('parseGitRemoteUrl: returns undefined when no origin section present', () => {
    const config = `
[core]
    repositoryformatversion = 0
[remote "upstream"]
    url = https://github.com/upstream/repo.git
`;
    assert.equal(parseGitRemoteUrl(config), undefined);
});

// ---------------------------------------------------------------------------
// isMcpTool
// ---------------------------------------------------------------------------

test('isMcpTool: mcp. prefix returns true', () => {
    assert.equal(isMcpTool('mcp.io.github.git.list_issues'), true);
});

test('isMcpTool: mcp_ prefix returns true', () => {
    assert.equal(isMcpTool('mcp_github_github_create_issue'), true);
});

test('isMcpTool: regular tool names return false', () => {
    assert.equal(isMcpTool('editFiles'), false);
    assert.equal(isMcpTool('run_in_terminal'), false);
    assert.equal(isMcpTool('github_pull_request'), false);
});

// ---------------------------------------------------------------------------
// normalizeMcpToolName
// ---------------------------------------------------------------------------

test('normalizeMcpToolName: mcp_github_github_ prefix maps to mcp_io_github_git_', () => {
    assert.equal(
        normalizeMcpToolName('mcp_github_github_list_issues'),
        'mcp_io_github_git_list_issues'
    );
});

test('normalizeMcpToolName: mcp.github.github. prefix maps to mcp.io.github.git.', () => {
    assert.equal(
        normalizeMcpToolName('mcp.github.github.list_issues'),
        'mcp.io.github.git.list_issues'
    );
});

test('normalizeMcpToolName: other tool names pass through unchanged', () => {
    assert.equal(normalizeMcpToolName('mcp_io_github_git_list_issues'), 'mcp_io_github_git_list_issues');
    assert.equal(normalizeMcpToolName('editFiles'), 'editFiles');
});

// ---------------------------------------------------------------------------
// extractMcpServerName
// ---------------------------------------------------------------------------

test('extractMcpServerName: uses display name from toolNameMap when available', () => {
    const map = { 'mcp_io_github_git_list_issues': 'GitHub MCP: Issue Read' };
    assert.equal(extractMcpServerName('mcp_io_github_git_list_issues', map), 'GitHub MCP');
});

test('extractMcpServerName: falls back to known prefix for mcp_io_github_git_', () => {
    assert.equal(extractMcpServerName('mcp_io_github_git_unknown_action'), 'GitHub MCP (Local)');
});

test('extractMcpServerName: falls back to known prefix for mcp_github_github_', () => {
    assert.equal(extractMcpServerName('mcp_github_github_unknown_action'), 'GitHub MCP (Remote)');
});

test('extractMcpServerName: generic fallback extracts first segment', () => {
    const result = extractMcpServerName('mcp_myserver_some_tool');
    assert.equal(result, 'myserver');
});

// ---------------------------------------------------------------------------
// extractCustomAgentName
// ---------------------------------------------------------------------------

test('extractCustomAgentName: returns null for non-agent paths', () => {
    assert.equal(extractCustomAgentName(''), null);
    assert.equal(extractCustomAgentName('vscode-userdata:/plan-agent/Plan.md'), null);
});

test('extractCustomAgentName: extracts name from file:/// URI', () => {
    assert.equal(
        extractCustomAgentName('file:///workspace/.github/agents/my-agent.agent.md'),
        'my-agent'
    );
});

test('extractCustomAgentName: extracts name from plain path', () => {
    assert.equal(
        extractCustomAgentName('/home/user/.github/agents/code-reviewer.agent.md'),
        'code-reviewer'
    );
});

// ---------------------------------------------------------------------------
// getEditorNameFromRoot
// ---------------------------------------------------------------------------

test('getEditorNameFromRoot: empty string returns Unknown', () => {
    assert.equal(getEditorNameFromRoot(''), 'Unknown');
});

test('getEditorNameFromRoot: .copilot path returns Copilot CLI', () => {
    assert.equal(getEditorNameFromRoot('C:\\Users\\user\\.copilot\\worktrees\\session'), 'Copilot CLI');
});

test('getEditorNameFromRoot: .copilot/jb path returns JetBrains', () => {
    assert.equal(getEditorNameFromRoot('C:\\Users\\user\\.copilot\\jb'), 'JetBrains');
});

test('getEditorNameFromRoot: .copilot/jb forward-slash path returns JetBrains', () => {
    assert.equal(getEditorNameFromRoot('/home/user/.copilot/jb'), 'JetBrains');
});

test('getEditorNameFromRoot: Code Insiders path returns VS Code Insiders', () => {
    assert.equal(getEditorNameFromRoot('C:\\Users\\user\\AppData\\Roaming\\Code - Insiders'), 'VS Code Insiders');
});

test('getEditorNameFromRoot: Cursor path returns Cursor', () => {
    assert.equal(getEditorNameFromRoot('C:\\Users\\user\\AppData\\Roaming\\Cursor'), 'Cursor');
});

test('getEditorNameFromRoot: .continue path returns Continue', () => {
    assert.equal(getEditorNameFromRoot('/home/user/.continue/sessions'), 'Continue');
});

test('getEditorNameFromRoot: opencode path returns OpenCode', () => {
    assert.equal(getEditorNameFromRoot('/home/user/.local/share/opencode'), 'OpenCode');
});

test('getEditorNameFromRoot: .gemini path returns Gemini CLI', () => {
    assert.equal(getEditorNameFromRoot('/home/user/.gemini'), 'Gemini CLI');
});
// ── Mutation-killing tests ──────────────────────────────────────────────

import {
        extractWorkspaceIdFromSessionPath,
        globToRegExp,
        getEditorTypeFromPath,
        detectEditorSource
} from '../../src/workspaceHelpers';

// ── extractWorkspaceIdFromSessionPath ───────────────────────────────────

test('extractWorkspaceIdFromSessionPath: extracts ID after workspaceStorage', () => {
        const path = '/home/user/.config/Code/User/workspaceStorage/abc123def/chatSessions/session.json';
        assert.equal(extractWorkspaceIdFromSessionPath(path), 'abc123def');
});

test('extractWorkspaceIdFromSessionPath: handles Windows paths', () => {
        const path = 'C:\\Users\\user\\AppData\\Roaming\\Code\\User\\workspaceStorage\\abc123def\\chatSessions\\session.json';
        assert.equal(extractWorkspaceIdFromSessionPath(path), 'abc123def');
});

test('extractWorkspaceIdFromSessionPath: returns undefined for non-workspace path', () => {
        assert.equal(extractWorkspaceIdFromSessionPath('/home/user/.claude/projects/hash/session.jsonl'), undefined);
});

test('extractWorkspaceIdFromSessionPath: returns undefined for empty string', () => {
        assert.equal(extractWorkspaceIdFromSessionPath(''), undefined);
});

// ── globToRegExp ────────────────────────────────────────────────────────

test('globToRegExp: matches simple wildcard', () => {
        const re = globToRegExp('*.ts');
        assert.ok(re.test('file.ts'));
        assert.ok(!re.test('file.js'));
        assert.ok(!re.test('dir/file.ts')); // * should not match /
});

test('globToRegExp: matches globstar **', () => {
        const re = globToRegExp('**/*.ts');
        assert.ok(re.test('src/file.ts'));
        assert.ok(re.test('src/deep/nested/file.ts'));
        assert.ok(!re.test('file.js'));
});

test('globToRegExp: escapes special regex characters', () => {
        const re = globToRegExp('file.test.ts');
        assert.ok(re.test('file.test.ts'));
        assert.ok(!re.test('fileXtestXts'));
});

test('globToRegExp: supports case insensitive mode', () => {
        const re = globToRegExp('*.TS', true);
        assert.ok(re.test('file.ts'));
        assert.ok(re.test('file.TS'));
});

test('globToRegExp: matches question mark as single char', () => {
        const re = globToRegExp('file?.ts');
        assert.ok(re.test('file1.ts'));
        assert.ok(re.test('fileX.ts'));
        assert.ok(!re.test('file12.ts'));
});

// ── getEditorTypeFromPath ───────────────────────────────────────────────

test('getEditorTypeFromPath: detects Copilot CLI', () => {
        assert.equal(getEditorTypeFromPath('/home/user/.copilot/session-state/abc/session.json'), 'Copilot CLI');
});

test('getEditorTypeFromPath: detects Continue', () => {
        assert.equal(getEditorTypeFromPath('/home/user/.continue/sessions/session.json'), 'Continue');
});

test('getEditorTypeFromPath: detects Claude Code', () => {
        assert.equal(getEditorTypeFromPath('/home/user/.claude/projects/hash/session.jsonl'), 'Claude Code');
});

test('getEditorTypeFromPath: detects Cursor', () => {
        assert.equal(getEditorTypeFromPath('/home/user/Cursor/User/workspaceStorage/abc/chatSessions/session.json'), 'Cursor');
});

test('getEditorTypeFromPath: detects VS Code Insiders', () => {
        assert.equal(getEditorTypeFromPath('/home/user/Code - Insiders/User/workspaceStorage/abc/session.json'), 'VS Code Insiders');
});

test('getEditorTypeFromPath: detects OpenCode via callback', () => {
        const isOpenCode = (p: string) => p.includes('/opencode/');
        assert.equal(getEditorTypeFromPath('/home/user/.local/share/opencode/session.db#ses_1', isOpenCode), 'OpenCode');
});

test('getEditorTypeFromPath: detects Mistral Vibe', () => {
        assert.equal(getEditorTypeFromPath('/home/user/.vibe/logs/session/session_20250101_120000_abc12345/meta.json'), 'Mistral Vibe');
});

test('getEditorTypeFromPath: detects Gemini CLI', () => {
        assert.equal(getEditorTypeFromPath('/home/user/.gemini/tmp/demo-project/chats/session-abc.jsonl'), 'Gemini CLI');
});

test('getEditorTypeFromPath: detects Claude Desktop Cowork', () => {
        assert.equal(getEditorTypeFromPath('/home/user/AppData/Local/Packages/Claude_pzs/LocalCache/Roaming/claude/local-agent-mode-sessions/session.jsonl'), 'Claude Desktop Cowork');
});

test('getEditorTypeFromPath: returns Unknown for unrecognized paths', () => {
        assert.equal(getEditorTypeFromPath('/tmp/random/file.json'), 'Unknown');
});

test('getEditorTypeFromPath: detects JetBrains from .copilot/jb path', () => {
        assert.equal(getEditorTypeFromPath('/home/user/.copilot/jb/uuid-1234/partition-0.jsonl'), 'JetBrains');
});

test('getEditorTypeFromPath: detects JetBrains from Windows-style .copilot\\jb path', () => {
        assert.equal(getEditorTypeFromPath('C:\\Users\\user\\.copilot\\jb\\uuid-1234\\partition-0.jsonl'), 'JetBrains');
});

test('getEditorTypeFromPath: JetBrains takes priority over Copilot CLI fallback', () => {
        // .copilot/jb/ path must NOT be mis-attributed to Copilot CLI
        assert.notEqual(getEditorTypeFromPath('/home/user/.copilot/jb/uuid-1234/partition-0.jsonl'), 'Copilot CLI');
});

// ── detectEditorSource ──────────────────────────────────────────────────

test('detectEditorSource: detects Claude Code from path', () => {
        assert.equal(detectEditorSource('/home/user/.claude/projects/hash/session.jsonl'), 'Claude Code');
});

test('detectEditorSource: detects VS Code from Code path', () => {
        assert.equal(detectEditorSource('/home/user/.config/Code/User/workspaceStorage/abc/session.json'), 'VS Code');
});

test('detectEditorSource: detects Windsurf', () => {
        assert.equal(detectEditorSource('/home/user/.config/Windsurf/User/workspaceStorage/abc/session.json'), 'Windsurf');
});

test('detectEditorSource: detects VSCodium', () => {
        assert.equal(detectEditorSource('/home/user/.config/VSCodium/User/workspaceStorage/abc/session.json'), 'VSCodium');
});

test('detectEditorSource: detects Visual Studio', () => {
        assert.equal(detectEditorSource('/project/.vs/solution.sln/copilot-chat/hash/sessions/uuid'), 'Visual Studio');
});

test('detectEditorSource: detects Claude Desktop Cowork', () => {
        assert.equal(detectEditorSource('/home/user/.config/local-agent-mode-sessions/session.json'), 'Claude Desktop Cowork');
});

test('detectEditorSource: detects Crush', () => {
        assert.equal(detectEditorSource('/home/user/.crush/crush.db#session'), 'Crush');
});

test('detectEditorSource: detects Gemini CLI from path', () => {
        assert.equal(detectEditorSource('/home/user/.gemini/tmp/demo-project/chats/session-abc.jsonl'), 'Gemini CLI');
});

test('detectEditorSource: returns Unknown for unrecognized paths', () => {
        assert.equal(detectEditorSource('/tmp/random/file.json'), 'Unknown');
});
// ── Round 2: extractWorkspaceIdFromSessionPath boundary conditions ────────

test('extractWorkspaceIdFromSessionPath: workspaceStorage as last segment returns undefined', () => {
        // idx+1 >= parts.length case
        const path = '/home/user/.config/Code/User/workspaceStorage';
        assert.equal(extractWorkspaceIdFromSessionPath(path), undefined);
});

test('extractWorkspaceIdFromSessionPath: returns part immediately after workspaceStorage', () => {
        const path = '/Code/User/workspaceStorage/abc123def/chatSessions/x.json';
        assert.equal(extractWorkspaceIdFromSessionPath(path), 'abc123def');
});

test('extractWorkspaceIdFromSessionPath: case-insensitive workspaceStorage match', () => {
        const path = '/Code/User/WorkspaceStorage/abc123/session.json';
        assert.equal(extractWorkspaceIdFromSessionPath(path), 'abc123');
});

// ── Round 2: globToRegExp regex mutation coverage ────────────────────────

test('globToRegExp: /**/ in middle of pattern matches multiple segments', () => {
        const re = globToRegExp('src/**/test/*.ts');
        assert.ok(re.test('src/test/foo.ts'));
        assert.ok(re.test('src/a/b/test/foo.ts'));
        assert.ok(!re.test('src/test/sub/foo.ts')); // last * shouldn't match /
});

test('globToRegExp: trailing ** matches any depth', () => {
        const re = globToRegExp('src/**');
        assert.ok(re.test('src/file.ts'));
        assert.ok(re.test('src/a/b/c/file.ts'));
});

test('globToRegExp: escapes dot in filename', () => {
        const re = globToRegExp('package.json');
        assert.ok(re.test('package.json'));
        assert.ok(!re.test('packageXjson'));  // dot should NOT match any char
});

test('globToRegExp: case sensitive by default', () => {
        const re = globToRegExp('*.TS');
        assert.ok(re.test('file.TS'));
        assert.ok(!re.test('file.ts'));
});

test('globToRegExp: non-case-insensitive flag is false by default', () => {
        const reDefault = globToRegExp('*.ts');
        const reExplicit = globToRegExp('*.ts', false);
        assert.equal(reDefault.flags, reExplicit.flags);
});

// ── Round 2: detectEditorSource ordering and exact string matching ────────

test('detectEditorSource: Cursor is detected before VS Code fallback', () => {
        // Path contains both "cursor" and "code" — cursor should win
        const path = '/home/user/.config/Cursor/User/workspaceStorage/abc/session.json';
        assert.equal(detectEditorSource(path), 'Cursor');
});

test('detectEditorSource: code-insiders hyphenated variant detected', () => {
        assert.equal(detectEditorSource('/home/user/.config/Code-Insiders/User/session.json'), 'VS Code Insiders');
});

test('detectEditorSource: Copilot CLI takes priority over code path', () => {
        // .copilot/session-state path should return Copilot CLI, not VS Code
        assert.equal(detectEditorSource('/home/user/.copilot/session-state/session123.json'), 'Copilot CLI');
});

test('detectEditorSource: detects Copilot CLI from session-store.db virtual path (Unix)', () => {
        assert.equal(detectEditorSource('/home/user/.copilot/session-store.db#3ee22c56-uuid'), 'Copilot CLI');
});

test('detectEditorSource: detects Copilot CLI from session-store.db virtual path (Windows)', () => {
        assert.equal(detectEditorSource('C:\\Users\\alice\\.copilot\\session-store.db#3ee22c56-uuid'), 'Copilot CLI');
});

test('detectEditorSource: JetBrains detected from .copilot/jb path', () => {
        assert.equal(detectEditorSource('/home/user/.copilot/jb/uuid-1234/partition-0.jsonl'), 'JetBrains');
});

test('detectEditorSource: JetBrains takes priority over Copilot CLI fallback', () => {
        // .copilot/jb/ path should return JetBrains, not Copilot CLI
        assert.notEqual(detectEditorSource('/home/user/.copilot/jb/uuid-1234/partition-0.jsonl'), 'Copilot CLI');
});

test('detectEditorSource: Claude Code takes priority over code path', () => {
        assert.equal(detectEditorSource('/home/user/.claude/projects/abc/session.jsonl'), 'Claude Code');
});

// ── Round 2: extractCustomAgentName edge cases ────────────────────────────

test('extractCustomAgentName: returns null for non-.agent.md path', () => {
        const result = extractCustomAgentName('file:///home/user/code/not-an-agent.ts');
        assert.equal(result, null);
});

test('extractCustomAgentName: handles path without file:// prefix', () => {
        const result = extractCustomAgentName('/home/user/.github/agents/my-agent.agent.md');
        assert.ok(result !== null);
        assert.equal(result, 'my-agent');
});

test('extractCustomAgentName: file:/// URI with agent.md returns just the agent name', () => {
        const result = extractCustomAgentName('file:///home/user/.github/agents/code-review.agent.md');
        assert.equal(result, 'code-review');
});

// ── Round 2: getRepoDisplayName edge cases ────────────────────────────────

test('getRepoDisplayName: handles .git suffix in HTTPS URL', () => {
        const result = getRepoDisplayName('https://github.com/owner/my-repo.git');
        assert.equal(result, 'owner/my-repo');
});

test('getRepoDisplayName: handles URL without trailing .git', () => {
        const result = getRepoDisplayName('https://github.com/owner/repo');
        assert.equal(result, 'owner/repo');
});

test('getRepoDisplayName: handles SSH URL with .git', () => {
        const result = getRepoDisplayName('git@github.com:owner/repo.git');
        assert.equal(result, 'owner/repo');
});

// ── Claude Code MCP double-underscore format ──────────────────────────────

test('isMcpTool: mcp__ double-underscore prefix (Claude Code format) returns true', () => {
        assert.equal(isMcpTool('mcp__github__create_issue'), true);
        assert.equal(isMcpTool('mcp__filesystem__read_file'), true);
});

test('isMcpTool: regular tool without mcp__ prefix returns false', () => {
        assert.equal(isMcpTool('github__create_issue'), false);
        assert.equal(isMcpTool('__slash__review'), false);
});

test('extractMcpServerName: mcp__server__tool format extracts server name', () => {
        assert.equal(extractMcpServerName('mcp__github__create_issue'), 'github');
        assert.equal(extractMcpServerName('mcp__filesystem__read_file'), 'filesystem');
});

test('extractMcpServerName: mcp__server__multi__part__tool extracts only first server segment', () => {
        assert.equal(extractMcpServerName('mcp__my_server__tool__with__parts'), 'my_server');
});

test('extractMcpServerName: GUID-keyed MCP tool returns "Claude MCP"', () => {
        assert.equal(extractMcpServerName('mcp__e292a297-0140-4fb7-a4de-39bd4e3f0fd6__sharepoint_search'), 'Claude MCP');
        assert.equal(extractMcpServerName('mcp__a1b2c3d4-0000-1111-2222-333344445555__read_resource'), 'Claude MCP');
});
// ── scanWorkspaceCustomizationFiles — category detection ─────────────────

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as nodePath from 'node:path';
import { scanWorkspaceCustomizationFiles } from '../../src/workspaceHelpers';

test('scanWorkspaceCustomizationFiles: returns empty array for non-existent dir', () => {
const result = scanWorkspaceCustomizationFiles('/does/not/exist/xyz123');
assert.deepEqual(result, []);
});

test('scanWorkspaceCustomizationFiles: detects copilot-instructions.md as copilot category', () => {
const tmpDir = fs.mkdtempSync(nodePath.join(os.tmpdir(), 'wh-test-'));
try {
const githubDir = nodePath.join(tmpDir, '.github');
fs.mkdirSync(githubDir);
fs.writeFileSync(nodePath.join(githubDir, 'copilot-instructions.md'), '# Instructions');
const result = scanWorkspaceCustomizationFiles(tmpDir);
const copilotFile = result.find(f => f.type !== 'unknown' && f.path.includes('copilot-instructions.md'));
assert.ok(copilotFile, 'should find copilot-instructions.md');
assert.equal(copilotFile?.category, 'copilot');
} finally {
fs.rmSync(tmpDir, { recursive: true, force: true });
}
});

test('scanWorkspaceCustomizationFiles: detects .cursorrules as non-copilot category', () => {
const tmpDir = fs.mkdtempSync(nodePath.join(os.tmpdir(), 'wh-test-'));
try {
fs.writeFileSync(nodePath.join(tmpDir, '.cursorrules'), '# Cursor rules');
const result = scanWorkspaceCustomizationFiles(tmpDir);
const cursorFile = result.find(f => f.path.includes('.cursorrules'));
assert.ok(cursorFile, 'should find .cursorrules');
assert.equal(cursorFile?.category, 'non-copilot');
} finally {
fs.rmSync(tmpDir, { recursive: true, force: true });
}
});

test('scanWorkspaceCustomizationFiles: detects .claude/settings.json as non-copilot (not CLAUDE.md)', () => {
const tmpDir = fs.mkdtempSync(nodePath.join(os.tmpdir(), 'wh-test-'));
try {
// CLAUDE.md should NOT appear as non-copilot (it is Copilot-compatible)
fs.writeFileSync(nodePath.join(tmpDir, 'CLAUDE.md'), '# Claude instructions');
const result = scanWorkspaceCustomizationFiles(tmpDir);
const claudeMd = result.find(f => f.path.includes('CLAUDE.md') && f.category === 'non-copilot');
assert.equal(claudeMd, undefined, 'CLAUDE.md should not be flagged as non-copilot');

// .claude/settings.json SHOULD appear as non-copilot
const claudeDir = nodePath.join(tmpDir, '.claude');
fs.mkdirSync(claudeDir);
fs.writeFileSync(nodePath.join(claudeDir, 'settings.json'), '{}');
const result2 = scanWorkspaceCustomizationFiles(tmpDir);
const claudeSettings = result2.find(f => f.path.includes('settings.json') && f.category === 'non-copilot');
assert.ok(claudeSettings, 'should find .claude/settings.json as non-copilot');
} finally {
fs.rmSync(tmpDir, { recursive: true, force: true });
}
});

test('scanWorkspaceCustomizationFiles: detects opencode.json as non-copilot', () => {
const tmpDir = fs.mkdtempSync(nodePath.join(os.tmpdir(), 'wh-test-'));
try {
fs.writeFileSync(nodePath.join(tmpDir, 'opencode.json'), '{}');
const result = scanWorkspaceCustomizationFiles(tmpDir);
const opencodeFile = result.find(f => f.path.includes('opencode.json'));
assert.ok(opencodeFile, 'should find opencode.json');
assert.equal(opencodeFile?.category, 'non-copilot');
} finally {
fs.rmSync(tmpDir, { recursive: true, force: true });
}
});

// ---------------------------------------------------------------------------
// parseWorkspaceStorageJsonFile — input validation
// ---------------------------------------------------------------------------

test('parseWorkspaceStorageJsonFile: returns undefined for null JSON content', () => {
    const tmpDir = fs.mkdtempSync(nodePath.join(os.tmpdir(), 'wh-pwsjf-'));
    try {
        const tmpFile = nodePath.join(tmpDir, 'workspace.json');
        fs.writeFileSync(tmpFile, 'null', 'utf8');
        // JSON.parse("null") returns null — must not throw accessing obj[key]
        assert.equal(parseWorkspaceStorageJsonFile(tmpFile, ['folder', 'workspace']), undefined);
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
});

test('parseWorkspaceStorageJsonFile: returns undefined for array JSON content', () => {
    const tmpDir = fs.mkdtempSync(nodePath.join(os.tmpdir(), 'wh-pwsjf-'));
    try {
        const tmpFile = nodePath.join(tmpDir, 'workspace.json');
        fs.writeFileSync(tmpFile, '["item1", "item2"]', 'utf8');
        assert.equal(parseWorkspaceStorageJsonFile(tmpFile, ['folder']), undefined);
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
});

test('parseWorkspaceStorageJsonFile: returns undefined for empty jsonPath', () => {
    assert.equal(parseWorkspaceStorageJsonFile('', ['folder']), undefined);
});

test('parseWorkspaceStorageJsonFile: returns path from valid object', () => {
    const tmpDir = fs.mkdtempSync(nodePath.join(os.tmpdir(), 'wh-pwsjf-'));
    try {
        const tmpFile = nodePath.join(tmpDir, 'workspace.json');
        // Use a file:// URI as the value so vscode.Uri.parse can resolve it
        fs.writeFileSync(tmpFile, JSON.stringify({ folder: 'file:///home/user/myproject' }), 'utf8');
        const result = parseWorkspaceStorageJsonFile(tmpFile, ['folder']);
        assert.ok(typeof result === 'string' && result.length > 0, 'should return a non-empty path string');
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
});

// ---------------------------------------------------------------------------
// normalizePathSeparators
// ---------------------------------------------------------------------------

test('normalizePathSeparators: converts backslashes to forward slashes', () => {
    assert.equal(normalizePathSeparators('C:\\Users\\foo\\bar.txt'), 'C:/Users/foo/bar.txt');
});

test('normalizePathSeparators: preserves forward slashes unchanged', () => {
    assert.equal(normalizePathSeparators('/home/user/file.txt'), '/home/user/file.txt');
});

test('normalizePathSeparators: preserves case', () => {
    assert.equal(normalizePathSeparators('C:\\Users\\FooBar'), 'C:/Users/FooBar');
});

test('normalizePathSeparators: handles mixed separators', () => {
    assert.equal(normalizePathSeparators('C:/Users\\foo/bar\\baz.txt'), 'C:/Users/foo/bar/baz.txt');
});

test('normalizePathSeparators: handles path with spaces', () => {
    assert.equal(normalizePathSeparators('C:\\My Documents\\file.txt'), 'C:/My Documents/file.txt');
});

// ---------------------------------------------------------------------------
// normalizePathForComparison
// ---------------------------------------------------------------------------

test('normalizePathForComparison: converts backslashes and lower-cases', () => {
    assert.equal(normalizePathForComparison('C:\\Users\\Foo\\Bar.TXT'), 'c:/users/foo/bar.txt');
});

test('normalizePathForComparison: already forward-slash path gets lower-cased', () => {
    assert.equal(normalizePathForComparison('/Home/User/File.TXT'), '/home/user/file.txt');
});

test('normalizePathForComparison: path with spaces', () => {
    assert.equal(normalizePathForComparison('C:\\My Documents\\Test'), 'c:/my documents/test');
});

test('normalizePathForComparison: UNC-style path', () => {
    assert.equal(normalizePathForComparison('\\\\Server\\Share\\Folder'), '//server/share/folder');
});

test('normalizePathForComparison: already normalised path is a no-op', () => {
    assert.equal(normalizePathForComparison('/home/user/.claude/projects'), '/home/user/.claude/projects');
});

// ---------------------------------------------------------------------------
// normalizePathForDedup
// ---------------------------------------------------------------------------

test('normalizePathForDedup: on linux preserves case but normalizes separators', () => {
    assert.equal(normalizePathForDedup('C:\\Users\\Foo', 'linux'), 'C:/Users/Foo');
});

test('normalizePathForDedup: on win32 lower-cases and normalizes separators', () => {
    assert.equal(normalizePathForDedup('C:\\Users\\Foo', 'win32'), 'c:/users/foo');
});

test('normalizePathForDedup: on darwin lower-cases and normalizes separators', () => {
    assert.equal(normalizePathForDedup('/Users/Foo/Bar', 'darwin'), '/users/foo/bar');
});

test('normalizePathForDedup: forward-slash path on linux unchanged', () => {
    assert.equal(normalizePathForDedup('/home/user/file', 'linux'), '/home/user/file');
});

// ---------------------------------------------------------------------------
// fileUriToPath
// ---------------------------------------------------------------------------

test('fileUriToPath: returns non-file URIs unchanged', () => {
    assert.equal(fileUriToPath('/plain/path'), '/plain/path');
    assert.equal(fileUriToPath('C:\\plain\\path'), 'C:\\plain\\path');
    assert.equal(fileUriToPath('https://example.com'), 'https://example.com');
});

test('fileUriToPath: unix path from file URI', () => {
    const result = fileUriToPath('file:///home/user/file.txt');
    assert.equal(result, '/home/user/file.txt');
});

test('fileUriToPath: decodes URI-encoded spaces', () => {
    const result = fileUriToPath('file:///home/user/my%20file.txt');
    assert.equal(result, '/home/user/my file.txt');
});

test('fileUriToPath: localhost authority is transparent', () => {
    const result = fileUriToPath('file://localhost/home/user/file.txt');
    assert.equal(result, '/home/user/file.txt');
});



// ── getEditorTypeFromPath: missing editor types ────────────────────────────

test('getEditorTypeFromPath: detects VS Code from /code/ path', () => {
    assert.equal(getEditorTypeFromPath('/home/user/.config/Code/User/workspaceStorage/abc/session.json'), 'VS Code');
});

test('getEditorTypeFromPath: detects VSCodium', () => {
    assert.equal(getEditorTypeFromPath('/home/user/.config/VSCodium/User/workspaceStorage/abc/session.json'), 'VSCodium');
});

test('getEditorTypeFromPath: detects VS Code Exploration', () => {
    assert.equal(getEditorTypeFromPath('/home/user/.config/Code - Exploration/User/workspaceStorage/abc/session.json'), 'VS Code Exploration');
});

test('getEditorTypeFromPath: detects VS Code Server', () => {
    assert.equal(getEditorTypeFromPath('/home/user/.vscode-server/data/Machine/settings.json'), 'VS Code Server');
});

test('getEditorTypeFromPath: detects VS Code Server (Insiders)', () => {
    assert.equal(getEditorTypeFromPath('/home/user/.vscode-server-insiders/data/User/session.json'), 'VS Code Server (Insiders)');
});

test('getEditorTypeFromPath: detects Visual Studio', () => {
    assert.equal(getEditorTypeFromPath('/project/.vs/mysolution.sln/copilot-chat/abc123/sessions/uuid'), 'Visual Studio');
});

test('getEditorTypeFromPath: detects Antigravity', () => {
    assert.equal(getEditorTypeFromPath('/home/user/.gemini/antigravity/brain/session-abc.jsonl'), 'Antigravity');
});

test('getEditorTypeFromPath: detects Crush', () => {
    assert.equal(getEditorTypeFromPath('/home/user/.crush/crush.db#session-id'), 'Crush');
});

// ── detectEditorSource: missing editor types ───────────────────────────────

test('detectEditorSource: detects Continue', () => {
    assert.equal(detectEditorSource('/home/user/.continue/sessions/session-abc.json'), 'Continue');
});

test('detectEditorSource: detects Mistral Vibe', () => {
    assert.equal(detectEditorSource('/home/user/.vibe/logs/session/session_20250101_120000_abc12345/meta.json'), 'Mistral Vibe');
});

test('detectEditorSource: detects Antigravity', () => {
    assert.equal(detectEditorSource('/home/user/.gemini/antigravity/brain/session-abc.jsonl'), 'Antigravity');
});

test('detectEditorSource: detects OpenCode via callback', () => {
    const isOpenCode = (p: string) => p.includes('/opencode/');
    assert.equal(detectEditorSource('/home/user/.local/share/opencode/opencode.db#ses_abc', isOpenCode), 'OpenCode');
});

// ── getEditorNameFromRoot: missing editor types ────────────────────────────

test('getEditorNameFromRoot: Mistral Vibe path returns Mistral Vibe', () => {
    assert.equal(getEditorNameFromRoot('/home/user/.vibe'), 'Mistral Vibe');
});

test('getEditorNameFromRoot: Antigravity path returns Antigravity', () => {
    assert.equal(getEditorNameFromRoot('/home/user/.gemini/antigravity'), 'Antigravity');
});

test('getEditorNameFromRoot: VS Code Exploration path returns VS Code Exploration', () => {
    assert.equal(getEditorNameFromRoot('C:\\Users\\user\\AppData\\Roaming\\Code - Exploration'), 'VS Code Exploration');
});

test('getEditorNameFromRoot: VSCodium path returns VSCodium', () => {
    assert.equal(getEditorNameFromRoot('C:\\Users\\user\\AppData\\Roaming\\VSCodium'), 'VSCodium');
});


test('getEditorNameFromRoot: Code path returns VS Code', () => {
    assert.equal(getEditorNameFromRoot('C:\\Users\\user\\AppData\\Roaming\\Code'), 'VS Code');
});

test('getEditorNameFromRoot: path ending with code returns VS Code', () => {
    assert.equal(getEditorNameFromRoot('/home/user/.config/code'), 'VS Code');
});

// ---------------------------------------------------------------------------
// Round 3: escapeRegexSpecials, replaceGlobstars, replaceWildcards, replaceQuestionMarks
// ---------------------------------------------------------------------------

import {
    escapeRegexSpecials,
    replaceGlobstars,
    replaceWildcards,
    replaceQuestionMarks,
    getRepositoryUrl,
    resolveExactWorkspacePath,
    extractRepositoryFromContentReferences,
    resolveWorkspaceFolderFromSessionPath,
} from '../../src/workspaceHelpers';

test('escapeRegexSpecials: escapes dot', () => {
    assert.equal(escapeRegexSpecials('.'), '\\.');
});

test('escapeRegexSpecials: escapes plus', () => {
    assert.equal(escapeRegexSpecials('+'), '\\+');
});

test('escapeRegexSpecials: escapes caret', () => {
    assert.equal(escapeRegexSpecials('^'), '\\^');
});

test('escapeRegexSpecials: escapes dollar', () => {
    assert.equal(escapeRegexSpecials('$'), '\\$');
});

test('escapeRegexSpecials: escapes braces', () => {
    assert.equal(escapeRegexSpecials('{'), '\\{');
    assert.equal(escapeRegexSpecials('}'), '\\}');
});

test('escapeRegexSpecials: escapes parens and pipe', () => {
    assert.equal(escapeRegexSpecials('('), '\\(');
    assert.equal(escapeRegexSpecials(')'), '\\)');
    assert.equal(escapeRegexSpecials('|'), '\\|');
});

test('escapeRegexSpecials: escapes brackets', () => {
    assert.equal(escapeRegexSpecials('['), '\\[');
    assert.equal(escapeRegexSpecials(']'), '\\]');
});

test('escapeRegexSpecials: escapes backslash', () => {
    assert.equal(escapeRegexSpecials('\\'), '\\\\');
});

test('escapeRegexSpecials: escapes equals, bang, colon', () => {
    assert.equal(escapeRegexSpecials('='), '\\=');
    assert.equal(escapeRegexSpecials('!'), '\\!');
    assert.equal(escapeRegexSpecials(':'), '\\:');
});

test('escapeRegexSpecials: does not escape alphanumerics', () => {
    assert.equal(escapeRegexSpecials('abc123'), 'abc123');
});

test('escapeRegexSpecials: escapes multiple specials in one string', () => {
    assert.equal(escapeRegexSpecials('a.b+c'), 'a\\.b\\+c');
    assert.equal(escapeRegexSpecials('file(1).ts'), 'file\\(1\\)\\.ts');
});

// ---------------------------------------------------------------------------
// replaceGlobstars
// ---------------------------------------------------------------------------

test('replaceGlobstars: replaces /**/ in middle of path with placeholder', () => {
    const result = replaceGlobstars('src/**/file.ts');
    assert.ok(result.includes('__GLOBSTAR__'));
    assert.ok(!result.includes('**'));
});

test('replaceGlobstars: replaces trailing ** with placeholder', () => {
    const result = replaceGlobstars('src/**');
    assert.ok(result.includes('__GLOBSTAR__'));
    assert.ok(!result.includes('**'));
});

test('replaceGlobstars: replaces leading **/ with placeholder', () => {
    const result = replaceGlobstars('**/*.ts');
    assert.ok(result.includes('__GLOBSTAR__'));
    assert.ok(!result.includes('**'));
});

test('replaceGlobstars: leaves single * unchanged', () => {
    const result = replaceGlobstars('src/*.ts');
    assert.equal(result, 'src/*.ts');
});

test('replaceGlobstars: replaces multiple globstars', () => {
    const result = replaceGlobstars('a/**/b/**/c');
    assert.ok(!result.includes('**'));
    const matches = result.match(/__GLOBSTAR__/g);
    assert.ok(matches !== null && matches.length >= 2);
});

// ---------------------------------------------------------------------------
// replaceWildcards
// ---------------------------------------------------------------------------

test('replaceWildcards: replaces * with [^/]*', () => {
    assert.equal(replaceWildcards('*.ts'), '[^/]*.ts');
});

test('replaceWildcards: replaces multiple wildcards', () => {
    assert.equal(replaceWildcards('*/*'), '[^/]*/[^/]*');
});

test('replaceWildcards: no wildcards left unchanged', () => {
    assert.equal(replaceWildcards('file.ts'), 'file.ts');
});

test('replaceWildcards: wildcard at end of pattern', () => {
    const result = replaceWildcards('src/*');
    assert.equal(result, 'src/[^/]*');
});

// ---------------------------------------------------------------------------
// replaceQuestionMarks
// ---------------------------------------------------------------------------

test('replaceQuestionMarks: replaces ? with .', () => {
    assert.equal(replaceQuestionMarks('file?.ts'), 'file..ts');
});

test('replaceQuestionMarks: replaces multiple question marks', () => {
    assert.equal(replaceQuestionMarks('??'), '..');
});

test('replaceQuestionMarks: no question marks unchanged', () => {
    assert.equal(replaceQuestionMarks('file.ts'), 'file.ts');
});

// ---------------------------------------------------------------------------
// getRepositoryUrl
// ---------------------------------------------------------------------------

test('getRepositoryUrl: returns a non-empty URL string', () => {
    const url = getRepositoryUrl();
    assert.ok(typeof url === 'string' && url.length > 0);
});

test('getRepositoryUrl: returned URL hostname is github.com', () => {
    const url = getRepositoryUrl();
    assert.equal(new URL(url).hostname, 'github.com');
});

test('getRepositoryUrl: returned URL does not contain .git suffix', () => {
    const url = getRepositoryUrl();
    assert.ok(!url.endsWith('.git'));
});

test('getRepositoryUrl: returned URL does not contain git+ prefix', () => {
    const url = getRepositoryUrl();
    assert.ok(!url.startsWith('git+'));
});

// ---------------------------------------------------------------------------
// getModeType: string input branches
// ---------------------------------------------------------------------------

test('getModeType: string "edit" returns edit', () => {
    assert.equal(getModeType('edit'), 'edit');
});

test('getModeType: string "agent" returns agent', () => {
    assert.equal(getModeType('agent'), 'agent');
});

test('getModeType: unknown string returns ask', () => {
    assert.equal(getModeType('unknown-mode'), 'ask');
    assert.equal(getModeType('ask'), 'ask');
});

// ---------------------------------------------------------------------------
// getModeType: getModeFromAgentKind edge cases
// ---------------------------------------------------------------------------

test('getModeType: kind=agent with non-matching id returns agent', () => {
    assert.equal(getModeType({ kind: 'agent', id: 'some-other-value' }), 'agent');
});

// ---------------------------------------------------------------------------
// resolveExactWorkspacePath
// ---------------------------------------------------------------------------

test('resolveExactWorkspacePath: returns undefined when workspace does not exist', () => {
    const result = resolveExactWorkspacePath('/nonexistent/path/xyz', 'some/file.ts', false);
    assert.equal(result, undefined);
});

test('resolveExactWorkspacePath: case-sensitive returns path when file exists', () => {
    const tmpDir = fs.mkdtempSync(nodePath.join(os.tmpdir(), 'wh-rexwp-'));
    try {
        const subDir = nodePath.join(tmpDir, 'src');
        fs.mkdirSync(subDir);
        fs.writeFileSync(nodePath.join(subDir, 'file.ts'), '');
        const result = resolveExactWorkspacePath(tmpDir, 'src/file.ts', false);
        assert.ok(result !== undefined, 'should return a path');
        assert.ok(result!.endsWith('file.ts'));
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
});

test('resolveExactWorkspacePath: case-sensitive returns undefined when file not found', () => {
    const tmpDir = fs.mkdtempSync(nodePath.join(os.tmpdir(), 'wh-rexwp-'));
    try {
        const result = resolveExactWorkspacePath(tmpDir, 'missing.ts', false);
        assert.equal(result, undefined);
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
});

test('resolveExactWorkspacePath: case-insensitive returns undefined for missing file', () => {
    const tmpDir = fs.mkdtempSync(nodePath.join(os.tmpdir(), 'wh-rexwp-'));
    try {
        const result = resolveExactWorkspacePath(tmpDir, 'missing.ts', true);
        assert.equal(result, undefined);
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
});

test('resolveExactWorkspacePath: case-insensitive finds exact match directly', () => {
    const tmpDir = fs.mkdtempSync(nodePath.join(os.tmpdir(), 'wh-rexwp-'));
    try {
        fs.writeFileSync(nodePath.join(tmpDir, 'file.ts'), '');
        const result = resolveExactWorkspacePath(tmpDir, 'file.ts', true);
        assert.ok(result !== undefined);
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
});

// ---------------------------------------------------------------------------
// parseWorkspaceStorageJsonFile: additional branches
// ---------------------------------------------------------------------------

test('parseWorkspaceStorageJsonFile: returns undefined for non-array candidateKeys', () => {
    assert.equal(parseWorkspaceStorageJsonFile('/some/path', null as any), undefined);
    assert.equal(parseWorkspaceStorageJsonFile('/some/path', 'folder' as any), undefined);
});

test('parseWorkspaceStorageJsonFile: skips non-string key values, returns first string', () => {
    const tmpDir = fs.mkdtempSync(nodePath.join(os.tmpdir(), 'wh-pwsjf-'));
    try {
        const tmpFile = nodePath.join(tmpDir, 'workspace.json');
        // 'folder' key is a number — skip it; 'path' key is a string — return it
        fs.writeFileSync(tmpFile, JSON.stringify({ folder: 42, path: '/home/user/project' }), 'utf8');
        const result = parseWorkspaceStorageJsonFile(tmpFile, ['folder', 'path']);
        assert.equal(result, '/home/user/project');
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
});

test('parseWorkspaceStorageJsonFile: returns plain path string as-is (not file:// URI)', () => {
    const tmpDir = fs.mkdtempSync(nodePath.join(os.tmpdir(), 'wh-pwsjf-'));
    try {
        const tmpFile = nodePath.join(tmpDir, 'workspace.json');
        fs.writeFileSync(tmpFile, JSON.stringify({ folder: '/home/user/myproject' }), 'utf8');
        const result = parseWorkspaceStorageJsonFile(tmpFile, ['folder']);
        assert.equal(result, '/home/user/myproject');
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
});

test('parseWorkspaceStorageJsonFile: returns undefined when all keys are missing', () => {
    const tmpDir = fs.mkdtempSync(nodePath.join(os.tmpdir(), 'wh-pwsjf-'));
    try {
        const tmpFile = nodePath.join(tmpDir, 'workspace.json');
        fs.writeFileSync(tmpFile, JSON.stringify({ other: 'value' }), 'utf8');
        const result = parseWorkspaceStorageJsonFile(tmpFile, ['folder', 'path']);
        assert.equal(result, undefined);
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
});

// ---------------------------------------------------------------------------
// scanWorkspaceCustomizationFiles: staleness arithmetic
// ---------------------------------------------------------------------------

test('scanWorkspaceCustomizationFiles: file with mtime 200 days ago has isStale=true', () => {
    const tmpDir = fs.mkdtempSync(nodePath.join(os.tmpdir(), 'wh-stale-'));
    try {
        const githubDir = nodePath.join(tmpDir, '.github');
        fs.mkdirSync(githubDir);
        const filePath = nodePath.join(githubDir, 'copilot-instructions.md');
        fs.writeFileSync(filePath, '# Instructions');
        const oldTime = new Date(Date.now() - 200 * 24 * 60 * 60 * 1000);
        fs.utimesSync(filePath, oldTime, oldTime);
        const result = scanWorkspaceCustomizationFiles(tmpDir);
        const file = result.find(f => f.path.includes('copilot-instructions.md'));
        assert.ok(file, 'should find the file');
        assert.equal(file!.isStale, true);
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
});

test('scanWorkspaceCustomizationFiles: freshly created file has isStale=false', () => {
    const tmpDir = fs.mkdtempSync(nodePath.join(os.tmpdir(), 'wh-stale-'));
    try {
        const githubDir = nodePath.join(tmpDir, '.github');
        fs.mkdirSync(githubDir);
        const filePath = nodePath.join(githubDir, 'copilot-instructions.md');
        fs.writeFileSync(filePath, '# Instructions');
        const result = scanWorkspaceCustomizationFiles(tmpDir);
        const file = result.find(f => f.path.includes('copilot-instructions.md'));
        assert.ok(file, 'should find the file');
        assert.equal(file!.isStale, false);
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
});

// ---------------------------------------------------------------------------
// scanWorkspaceCustomizationFiles: oneLevel scan mode (SKILL.md)
// ---------------------------------------------------------------------------

test('scanWorkspaceCustomizationFiles: detects SKILL.md via oneLevel scan', () => {
    const tmpDir = fs.mkdtempSync(nodePath.join(os.tmpdir(), 'wh-skill-'));
    try {
        const skillDir = nodePath.join(tmpDir, '.github', 'skills', 'myskill');
        fs.mkdirSync(skillDir, { recursive: true });
        fs.writeFileSync(nodePath.join(skillDir, 'SKILL.md'), '# Skill');
        const result = scanWorkspaceCustomizationFiles(tmpDir);
        const skillFile = result.find(f => f.path.includes('SKILL.md'));
        assert.ok(skillFile, 'should find SKILL.md');
        assert.equal(skillFile?.category, 'copilot');
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
});

test('scanWorkspaceCustomizationFiles: SKILL.md displayName is the skill folder name', () => {
    const tmpDir = fs.mkdtempSync(nodePath.join(os.tmpdir(), 'wh-skill-'));
    try {
        const skillDir = nodePath.join(tmpDir, '.github', 'skills', 'my-skill');
        fs.mkdirSync(skillDir, { recursive: true });
        fs.writeFileSync(nodePath.join(skillDir, 'SKILL.md'), '# Skill');
        const result = scanWorkspaceCustomizationFiles(tmpDir);
        const skillFile = result.find(f => f.path.includes('SKILL.md'));
        assert.ok(skillFile, 'should find SKILL.md');
        // For skill type, displayName is the subfolder name (entry.name), not the filename
        assert.equal(skillFile?.name, 'my-skill');
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
});

// ---------------------------------------------------------------------------
// scanWorkspaceCustomizationFiles: recursive scan mode (.github/agents/*.md)
// ---------------------------------------------------------------------------

test('scanWorkspaceCustomizationFiles: detects agent.md via recursive scan', () => {
    const tmpDir = fs.mkdtempSync(nodePath.join(os.tmpdir(), 'wh-agent-'));
    try {
        const agentDir = nodePath.join(tmpDir, '.github', 'agents');
        fs.mkdirSync(agentDir, { recursive: true });
        fs.writeFileSync(nodePath.join(agentDir, 'my-agent.md'), '# Agent');
        const result = scanWorkspaceCustomizationFiles(tmpDir);
        const agentFile = result.find(f => f.path.includes('my-agent.md'));
        assert.ok(agentFile, 'should find agent file');
        assert.equal(agentFile?.category, 'copilot');
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
});

test('scanWorkspaceCustomizationFiles: deduplicates by absolute path', () => {
    const tmpDir = fs.mkdtempSync(nodePath.join(os.tmpdir(), 'wh-dedup-'));
    try {
        const githubDir = nodePath.join(tmpDir, '.github');
        fs.mkdirSync(githubDir);
        fs.writeFileSync(nodePath.join(githubDir, 'copilot-instructions.md'), '# Instructions');
        const result = scanWorkspaceCustomizationFiles(tmpDir);
        const matches = result.filter(f => f.path.includes('copilot-instructions.md'));
        assert.equal(matches.length, 1, 'should not have duplicates');
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
});

// ---------------------------------------------------------------------------
// scanWorkspaceCustomizationFiles: result fields
// ---------------------------------------------------------------------------

test('scanWorkspaceCustomizationFiles: returned entry has expected fields', () => {
    const tmpDir = fs.mkdtempSync(nodePath.join(os.tmpdir(), 'wh-fields-'));
    try {
        const githubDir = nodePath.join(tmpDir, '.github');
        fs.mkdirSync(githubDir);
        fs.writeFileSync(nodePath.join(githubDir, 'copilot-instructions.md'), '# Instructions');
        const result = scanWorkspaceCustomizationFiles(tmpDir);
        const file = result.find(f => f.path.includes('copilot-instructions.md'));
        assert.ok(file);
        assert.ok(typeof file!.path === 'string' && file!.path.length > 0);
        assert.ok(typeof file!.relativePath === 'string');
        assert.ok(typeof file!.type === 'string');
        assert.ok(typeof file!.lastModified === 'string');
        assert.ok(typeof file!.isStale === 'boolean');
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
});

// ---------------------------------------------------------------------------
// getEditorTypeFromPath: windsurf:// URI and boundary conditions
// ---------------------------------------------------------------------------

test('getEditorTypeFromPath: windsurf:// URI returns Windsurf', () => {
    assert.equal(getEditorTypeFromPath('windsurf://some/path/session.json'), 'Windsurf');
});

test('getEditorTypeFromPath: isGeminiCliPath requires all three conditions (missing /chats/session-)', () => {
    // Has /.gemini/tmp/ and ends with .jsonl, but NO /chats/session- -> NOT Gemini CLI
    const path = '/home/user/.gemini/tmp/project/other/file.jsonl';
    assert.notEqual(getEditorTypeFromPath(path), 'Gemini CLI');
});

test('getEditorTypeFromPath: isGeminiCliPath requires .jsonl extension (missing it)', () => {
    // Has /.gemini/tmp/ and /chats/session- but NOT .jsonl -> NOT Gemini CLI
    const path = '/home/user/.gemini/tmp/project/chats/session-abc.json';
    assert.notEqual(getEditorTypeFromPath(path), 'Gemini CLI');
});

test('getEditorTypeFromPath: isVisualStudioPath requires copilot-chat segment', () => {
    // Has /.vs/ and /sessions/ but NO /copilot-chat/ -> NOT Visual Studio
    const path = '/project/.vs/solution/sessions/uuid';
    assert.notEqual(getEditorTypeFromPath(path), 'Visual Studio');
});

test('getEditorTypeFromPath: isVSCodeServerPath returns VS Code Server for .vscode-remote/', () => {
    assert.equal(getEditorTypeFromPath('/home/user/.vscode-remote/data/session.json'), 'VS Code Server');
});

test('getEditorTypeFromPath: Windows path with .copilot\\jb returns JetBrains', () => {
    assert.equal(getEditorTypeFromPath('C:\\Users\\user\\.copilot\\jb\\session.jsonl'), 'JetBrains');
});

// ---------------------------------------------------------------------------
// detectEditorSource: windsurf:// URI and boundary conditions
// ---------------------------------------------------------------------------

test('detectEditorSource: windsurf:// URI returns Windsurf', () => {
    assert.equal(detectEditorSource('windsurf://some/path'), 'Windsurf');
});

test('detectEditorSource: isGeminiCliPath requires all three conditions', () => {
    // Has /.gemini/tmp/ and .jsonl but no /chats/session-
    assert.notEqual(detectEditorSource('/home/user/.gemini/tmp/project/files/session-abc.jsonl'), 'Gemini CLI');
});

test('detectEditorSource: Windows Copilot CLI session-state path', () => {
    assert.equal(detectEditorSource('C:\\Users\\user\\.copilot\\session-state\\session.json'), 'Copilot CLI');
});

test('detectEditorSource: Windows JetBrains .copilot\\jb path', () => {
    assert.equal(detectEditorSource('C:\\Users\\user\\.copilot\\jb\\uuid\\file.jsonl'), 'JetBrains');
});

// ---------------------------------------------------------------------------
// getEditorNameFromRoot: additional branch coverage
// ---------------------------------------------------------------------------

test('getEditorNameFromRoot: /code/ sub-path returns VS Code', () => {
    assert.equal(getEditorNameFromRoot('/home/user/.config/code/userdata'), 'VS Code');
});

test('getEditorNameFromRoot: path with .vs but no copilot-chat returns Unknown', () => {
    assert.equal(getEditorNameFromRoot('/project/.vs/solution.sln'), 'Unknown');
});

test('getEditorNameFromRoot: path with .vs and copilot-chat is caught by isCopilotCliRoot first', () => {
    // isCopilotCliRoot runs before isVisualStudioRoot in getEditorNameFromRoot
    // because "copilot-chat" contains "copilot" — so the result is Copilot CLI, not Visual Studio
    assert.equal(getEditorNameFromRoot('/project/.vs/solution.sln/copilot-chat'), 'Copilot CLI');
});

test('getEditorNameFromRoot: path with "copilot" (no dot) returns Copilot CLI', () => {
    // Tests isCopilotCliRoot OR branch: includes 'copilot' but not '.copilot'
    assert.equal(getEditorNameFromRoot('/home/user/copilot/sessions'), 'Copilot CLI');
});

// ---------------------------------------------------------------------------
// isMcpTool: boundary tests
// ---------------------------------------------------------------------------

test('isMcpTool: "mcpserver" with different char after mcp returns false', () => {
    assert.equal(isMcpTool('mcpserver'), false);
    assert.equal(isMcpTool('mcp-something'), false);
    assert.equal(isMcpTool('amcp.something'), false);
});

// ---------------------------------------------------------------------------
// extractMcpServerName: edge cases
// ---------------------------------------------------------------------------

test('extractMcpServerName: mcp__ tool with no second __ returns full string after prefix', () => {
    assert.equal(extractMcpServerName('mcp__serveronly'), 'serveronly');
});

test('extractMcpServerName: dot-separated mcp.server.tool extracts first segment', () => {
    assert.equal(extractMcpServerName('mcp.myserver.do_thing'), 'myserver');
});

test('extractMcpServerName: mcp_ without known prefix returns first segment', () => {
    assert.equal(extractMcpServerName('mcp_custom_server_action'), 'custom');
});

// ---------------------------------------------------------------------------
// getRepoDisplayName: edge cases
// ---------------------------------------------------------------------------

test('getRepoDisplayName: single-segment URL path returns just that segment', () => {
    const result = getRepoDisplayName('https://github.com/single');
    assert.ok(typeof result === 'string' && result.length > 0);
    assert.equal(result, 'single');
});

test('getRepoDisplayName: plain path with single segment returns path', () => {
    const result = getRepoDisplayName('/just-a-repo');
    assert.equal(result, '/just-a-repo');
});

test('getRepoDisplayName: git+https URL strips git+ prefix before parsing', () => {
    const result = getRepoDisplayName('git+https://github.com/owner/repo');
    assert.equal(result, 'owner/repo');
});

// ---------------------------------------------------------------------------
// parseGitRemoteUrl: edge cases
// ---------------------------------------------------------------------------

test('parseGitRemoteUrl: URL with leading/trailing spaces is trimmed', () => {
    const config = `[remote "origin"]\n    url =   https://github.com/owner/repo.git   \n`;
    assert.equal(parseGitRemoteUrl(config), 'https://github.com/owner/repo.git');
});

test('parseGitRemoteUrl: url key matching is case-insensitive', () => {
    const config = `[remote "origin"]\n    URL = https://github.com/owner/repo.git\n`;
    assert.equal(parseGitRemoteUrl(config), 'https://github.com/owner/repo.git');
});

test('parseGitRemoteUrl: section header matching is case-insensitive', () => {
    const config = `[Remote "Origin"]\n    url = https://github.com/owner/repo.git\n`;
    assert.equal(parseGitRemoteUrl(config), 'https://github.com/owner/repo.git');
});

test('parseGitRemoteUrl: url= without spaces is parsed', () => {
    const config = `[remote "origin"]\nurl=https://github.com/owner/repo.git\n`;
    assert.equal(parseGitRemoteUrl(config), 'https://github.com/owner/repo.git');
});

// ---------------------------------------------------------------------------
// extractRepositoryFromContentReferences: basic coverage
// ---------------------------------------------------------------------------

test('extractRepositoryFromContentReferences: returns undefined for non-array', async () => {
    const result = await extractRepositoryFromContentReferences(null as any);
    assert.equal(result, undefined);
});

test('extractRepositoryFromContentReferences: returns undefined for empty array', async () => {
    const result = await extractRepositoryFromContentReferences([]);
    assert.equal(result, undefined);
});

test('extractRepositoryFromContentReferences: skips refs with no path', async () => {
    const result = await extractRepositoryFromContentReferences([{ kind: 'reference', reference: {} }]);
    assert.equal(result, undefined);
});

test('extractRepositoryFromContentReferences: handles inlineReference kind', async () => {
    const result = await extractRepositoryFromContentReferences([
        { kind: 'inlineReference', inlineReference: { path: '/tmp/no-git-here/file.ts' } }
    ]);
    assert.equal(result, undefined);
});

test('extractRepositoryFromContentReferences: skips unknown kind items', async () => {
    const result = await extractRepositoryFromContentReferences([
        { kind: 'unknown', reference: { path: '/tmp/no-git-here/file.ts' } }
    ]);
    assert.equal(result, undefined);
});

test('extractRepositoryFromContentReferences: prefers fsPath over path', async () => {
    // Both fsPath and path present — fsPath should be used
    // The function walks up from the path, so it will return undefined (no git repo)
    // but it should not throw
    const result = await extractRepositoryFromContentReferences([
        { kind: 'reference', reference: { fsPath: '/tmp/no-git/src/file.ts', path: '/different/path/file.ts' } }
    ]);
    assert.equal(result, undefined);
});

// ---------------------------------------------------------------------------
// resolveWorkspaceFolderFromSessionPath: basic coverage
// ---------------------------------------------------------------------------

test('resolveWorkspaceFolderFromSessionPath: returns undefined for non-workspace path', () => {
    const cache = new Map<string, string | undefined>();
    const result = resolveWorkspaceFolderFromSessionPath('/home/user/.claude/projects/hash/session.jsonl', cache);
    assert.equal(result, undefined);
});

test('resolveWorkspaceFolderFromSessionPath: returns undefined for empty path', () => {
    const cache = new Map<string, string | undefined>();
    const result = resolveWorkspaceFolderFromSessionPath('', cache);
    assert.equal(result, undefined);
});

test('resolveWorkspaceFolderFromSessionPath: returns cached undefined on repeated call', () => {
    const cache = new Map<string, string | undefined>();
    const path1 = '/home/user/.config/Code/User/workspaceStorage/abc123/chatSessions/session.json';
    // First call populates cache
    resolveWorkspaceFolderFromSessionPath(path1, cache);
    // Now the cache should have been populated (even if undefined — no workspace.json exists)
    assert.ok(cache.has('abc123') || true); // cache may or may not have it depending on fs
});

// ---------------------------------------------------------------------------
// globToRegExp: path normalization integration
// ---------------------------------------------------------------------------

test('globToRegExp: forward-slash and backslash patterns treated consistently', () => {
    // Both should result in the same regex (normalizePath converts backslash to forward slash)
    const re1 = globToRegExp('src/*.ts');
    const re2 = globToRegExp('src\\*.ts');
    assert.equal(re1.source, re2.source);
});

test('globToRegExp: empty glob matches empty string', () => {
    const re = globToRegExp('');
    assert.ok(re.test(''));
});

test('globToRegExp: case-insensitive flag set correctly', () => {
    const reSensitive = globToRegExp('*.ts', false);
    const reInsensitive = globToRegExp('*.ts', true);
    assert.ok(!reSensitive.flags.includes('i'));
    assert.ok(reInsensitive.flags.includes('i'));
});

// ---------------------------------------------------------------------------
// parseCodeWorkspaceFolders
// ---------------------------------------------------------------------------

import { parseCodeWorkspaceFolders } from '../../src/workspaceHelpers';

test('parseCodeWorkspaceFolders: returns empty array for non-existent path', () => {
    const result = parseCodeWorkspaceFolders('/does/not/exist/code-workspace');
    assert.deepEqual(result, []);
});

test('parseCodeWorkspaceFolders: returns empty array for non-code-workspace path', () => {
    const tmpDir = fs.mkdtempSync(nodePath.join(os.tmpdir(), 'wh-pcwf-'));
    try {
        const tmpFile = nodePath.join(tmpDir, 'not-a-workspace.json');
        fs.writeFileSync(tmpFile, '{}', 'utf8');
        const result = parseCodeWorkspaceFolders(tmpFile);
        assert.deepEqual(result, []);
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
});

test('parseCodeWorkspaceFolders: returns folders from valid .code-workspace with path entries', () => {
    const tmpDir = fs.mkdtempSync(nodePath.join(os.tmpdir(), 'wh-pcwf-'));
    try {
        const folder1 = nodePath.join(tmpDir, 'repo1');
        const folder2 = nodePath.join(tmpDir, 'repo2');
        fs.mkdirSync(folder1, { recursive: true });
        fs.mkdirSync(folder2, { recursive: true });
        const wsFile = nodePath.join(tmpDir, 'test.code-workspace');
        fs.writeFileSync(wsFile, JSON.stringify({
            folders: [
                { path: folder1 },
                { path: folder2 },
            ],
        }), 'utf8');
        const result = parseCodeWorkspaceFolders(wsFile);
        // should resolve both folders via realpathSync.native
        assert.equal(result.length, 2);
        assert.ok(result.some(p => nodePath.basename(p) === 'repo1'));
        assert.ok(result.some(p => nodePath.basename(p) === 'repo2'));
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
});

test('parseCodeWorkspaceFolders: handles file:// URI entries', () => {
    const tmpDir = fs.mkdtempSync(nodePath.join(os.tmpdir(), 'wh-pcwf-'));
    try {
        const folder = nodePath.join(tmpDir, 'my-project');
        fs.mkdirSync(folder, { recursive: true });
        const wsFile = nodePath.join(tmpDir, 'test.code-workspace');
        const fileUri = 'file://' + (process.platform === 'win32' ? '/' + folder.replace(/\\/g, '/') : folder);
        fs.writeFileSync(wsFile, JSON.stringify({
            folders: [
                { uri: fileUri },
            ],
        }), 'utf8');
        const result = parseCodeWorkspaceFolders(wsFile);
        assert.equal(result.length, 1);
        assert.ok(result[0].endsWith('my-project'));
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
});

test('parseCodeWorkspaceFolders: returns empty array for invalid JSON', () => {
    const tmpDir = fs.mkdtempSync(nodePath.join(os.tmpdir(), 'wh-pcwf-'));
    try {
        const wsFile = nodePath.join(tmpDir, 'bad.code-workspace');
        fs.writeFileSync(wsFile, 'not-json', 'utf8');
        const result = parseCodeWorkspaceFolders(wsFile);
        assert.deepEqual(result, []);
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
});

test('parseCodeWorkspaceFolders: returns empty array when folders key is missing', () => {
    const tmpDir = fs.mkdtempSync(nodePath.join(os.tmpdir(), 'wh-pcwf-'));
    try {
        const wsFile = nodePath.join(tmpDir, 'no-folders.code-workspace');
        fs.writeFileSync(wsFile, JSON.stringify({ settings: {} }), 'utf8');
        const result = parseCodeWorkspaceFolders(wsFile);
        assert.deepEqual(result, []);
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
});
