import test from 'node:test';
import * as assert from 'node:assert/strict';

import { resolveGuidMcpToolName, isGuidMcpTool, resolveMcpFamilyToolName, isMcpFamilyResolvedTool } from '../../../src/utils/toolUtils';

// ── resolveGuidMcpToolName ───────────────────────────────────────────────────

test('resolveGuidMcpToolName: returns friendly name for GUID-keyed MCP tool', () => {
	const result = resolveGuidMcpToolName('mcp__e292a297-0140-4fb7-a4de-39bd4e3f0fd6__sharepoint_search');
	assert.equal(result, 'Claude MCP: M365 Connector - Sharepoint Search');
});

test('resolveGuidMcpToolName: formats multi-word tool name with title case', () => {
	const result = resolveGuidMcpToolName('mcp__e292a297-0140-4fb7-a4de-39bd4e3f0fd6__sharepoint_folder_search');
	assert.equal(result, 'Claude MCP: M365 Connector - Sharepoint Folder Search');
});

test('resolveGuidMcpToolName: handles read_resource tool', () => {
	const result = resolveGuidMcpToolName('mcp__e292a297-0140-4fb7-a4de-39bd4e3f0fd6__read_resource');
	assert.equal(result, 'Claude MCP: M365 Connector - Read Resource');
});

test('resolveGuidMcpToolName: works with any tenant GUID', () => {
	const result = resolveGuidMcpToolName('mcp__a1b2c3d4-0000-1111-2222-333344445555__some_tool');
	assert.equal(result, 'Claude MCP: M365 Connector - Some Tool');
});

test('resolveGuidMcpToolName: returns undefined for non-GUID mcp__ tool', () => {
	assert.equal(resolveGuidMcpToolName('mcp__github__create_issue'), undefined);
});

test('resolveGuidMcpToolName: returns undefined for non-MCP tool', () => {
	assert.equal(resolveGuidMcpToolName('run_in_terminal'), undefined);
});

test('resolveGuidMcpToolName: returns undefined for mcp_ (underscore) format', () => {
	assert.equal(resolveGuidMcpToolName('mcp_io_github_git_list_issues'), undefined);
});

// ── isGuidMcpTool ────────────────────────────────────────────────────────────

test('isGuidMcpTool: returns true for GUID-keyed MCP tool', () => {
	assert.ok(isGuidMcpTool('mcp__e292a297-0140-4fb7-a4de-39bd4e3f0fd6__sharepoint_search'));
});

test('isGuidMcpTool: returns true for any tenant GUID', () => {
	assert.ok(isGuidMcpTool('mcp__a1b2c3d4-0000-1111-2222-333344445555__tool'));
});

test('isGuidMcpTool: returns false for non-GUID mcp__ tool', () => {
	assert.equal(isGuidMcpTool('mcp__github__create_issue'), false);
});

test('isGuidMcpTool: returns false for regular tool', () => {
	assert.equal(isGuidMcpTool('run_in_terminal'), false);
});

test('isGuidMcpTool: returns false for mcp_ (underscore) format', () => {
	assert.equal(isGuidMcpTool('mcp_io_github_git_list_issues'), false);
});

// ── resolveMcpFamilyToolName ─────────────────────────────────────────────────
// Regression coverage for issue #1760: new MCP client/server-registration
// spellings of an already-recognized tool must resolve without a literal
// toolNames.json entry for every possible prefix.

test('resolveMcpFamilyToolName: resolves bare Claude Code GitHub MCP registration', () => {
	assert.equal(resolveMcpFamilyToolName('mcp__github__create_pull_request'), 'GitHub MCP: Create Pull Request');
	assert.equal(resolveMcpFamilyToolName('mcp__github__list_pull_requests'), 'GitHub MCP: List Pull Requests');
	assert.equal(resolveMcpFamilyToolName('mcp__github__pull_request_read'), 'GitHub MCP: Pull Request Read');
	assert.equal(resolveMcpFamilyToolName('mcp__github__update_pull_request'), 'GitHub MCP: Update Pull Request');
});

test('resolveMcpFamilyToolName: resolves VS Code plugin-marketplace Playwright registration', () => {
	assert.equal(
		resolveMcpFamilyToolName('mcp__plugin_playwright_playwright__browser_click'),
		'Playwright MCP: Browser Click'
	);
	assert.equal(
		resolveMcpFamilyToolName('mcp__plugin_playwright_playwright__browser_take_screenshot'),
		'Playwright MCP: Browser Take Screenshot'
	);
});

test('resolveMcpFamilyToolName: resolves other known prefix spellings for the same families', () => {
	assert.equal(resolveMcpFamilyToolName('mcp_github_mcp_se_issue_write'), 'GitHub MCP: Issue Write');
	assert.equal(resolveMcpFamilyToolName('mcp_playwright_browser_navigate'), 'Playwright MCP: Browser Navigate');
	assert.equal(resolveMcpFamilyToolName('mcp_context7_resolve_library_id'), 'Context7 MCP: Resolve Library Id');
	assert.equal(resolveMcpFamilyToolName('mcp_tavily_tavily_search'), 'Tavily MCP: Tavily Search');
	assert.equal(resolveMcpFamilyToolName('mcp__claude-in-chrome__navigate'), 'Claude Browser MCP: Navigate');
});

test('resolveMcpFamilyToolName: does NOT resolve a VS Code 13-char-truncated prefix (needs a literal entry)', () => {
	// "mcp_microsoft_pla_" truncates "microsoft_playwright" to 13 chars — the
	// literal keyword "playwright" never appears, so this intentionally falls
	// through to the literal toolNames.json entry rather than this resolver.
	assert.equal(resolveMcpFamilyToolName('mcp_microsoft_pla_browser_navigate'), undefined);
});

test('resolveMcpFamilyToolName: returns undefined for unrelated tools', () => {
	assert.equal(resolveMcpFamilyToolName('shell_command'), undefined);
	assert.equal(resolveMcpFamilyToolName('Apply Patch'), undefined);
	assert.equal(resolveMcpFamilyToolName('run_in_terminal'), undefined);
});

test('resolveMcpFamilyToolName: does not match a family action without the family keyword present', () => {
	assert.equal(resolveMcpFamilyToolName('mcp__foo__create_pull_request'), undefined);
});

// ── isMcpFamilyResolvedTool ───────────────────────────────────────────────────

test('isMcpFamilyResolvedTool: true for a new-prefix family match', () => {
	assert.ok(isMcpFamilyResolvedTool('mcp__github__create_pull_request'));
	assert.ok(isMcpFamilyResolvedTool('mcp__plugin_playwright_playwright__browser_click'));
});

test('isMcpFamilyResolvedTool: false for tools outside known families', () => {
	assert.equal(isMcpFamilyResolvedTool('shell_command'), false);
});

// Regression coverage for issue #1761: a differently-cased VS Code server alias
// ("Microsoft_Learn") and a not-yet-seen GitHub action ("get_label").

test('resolveMcpFamilyToolName: resolves Microsoft Learn docs tools under a mixed-case VS Code alias', () => {
	assert.equal(
		resolveMcpFamilyToolName('mcp_Microsoft_Learn_microsoft_docs_fetch'),
		'Microsoft Docs MCP: Docs Fetch'
	);
	assert.equal(
		resolveMcpFamilyToolName('mcp_Microsoft_Learn_microsoft_docs_search'),
		'Microsoft Docs MCP: Docs Search'
	);
});

test('resolveMcpFamilyToolName: resolves GitHub get_label under an unseen server alias', () => {
	assert.equal(resolveMcpFamilyToolName('mcp_github_mcp_s13be_get_label'), 'GitHub MCP: Get Label');
	assert.equal(resolveMcpFamilyToolName('mcp_github_mcp_s13be_issue_write'), 'GitHub MCP: Issue Write');
});
