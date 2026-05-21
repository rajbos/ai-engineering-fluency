import test from 'node:test';
import * as assert from 'node:assert/strict';

import { resolveGuidMcpToolName, isGuidMcpTool } from '../../src/utils/toolUtils';

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
