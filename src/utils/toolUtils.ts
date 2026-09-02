/**
 * Utility helpers for resolving tool display names.
 * Handles pattern-based matching for tool IDs that cannot be listed exhaustively,
 * such as GUID-keyed MCP server registrations.
 */

/**
 * Matches Claude MCP tools registered under a tenant GUID, e.g.
 *   mcp__e292a297-0140-4fb7-a4de-39bd4e3f0fd6__sharepoint_search
 * The GUID is a tenant-specific server identifier (e.g. Microsoft 365 Connector).
 */
const GUID_MCP_PATTERN = /^mcp__[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}__(.+)$/i;

function toTitleCase(s: string): string {
	return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Resolve a GUID-based MCP tool name to a friendly display name.
 * Returns `undefined` when the ID does not match the GUID MCP pattern.
 *
 * Example:
 *   `mcp__e292a297-0140-4fb7-a4de-39bd4e3f0fd6__sharepoint_search`
 *   → `"Claude MCP: M365 Connector - Sharepoint Search"`
 */
export function resolveGuidMcpToolName(id: string): string | undefined {
	const match = GUID_MCP_PATTERN.exec(id);
	if (!match) { return undefined; }
	return `Claude MCP: M365 Connector - ${toTitleCase(match[1])}`;
}

/**
 * Returns `true` when a tool ID uses the GUID-keyed MCP server pattern.
 * Used to exclude these tools from the "unknown tools" list, since they are
 * handled by the regex resolver above rather than by an entry in toolNames.json.
 */
export function isGuidMcpTool(id: string): boolean {
	return GUID_MCP_PATTERN.test(id);
}

/**
 * Known third-party MCP tool families. Each MCP client/host mints its own
 * server-id segment for the *same* upstream server (e.g. VS Code truncates a
 * user-configured server name to 13 chars, Claude Code uses the literal
 * package/plugin id, a remote-vs-local registration gets a different name
 * entirely) — so the raw tool ID's prefix is effectively unbounded, while the
 * upstream server's actual tool/action names are a small, stable set.
 *
 * Rather than enumerate every prefix spelling in toolNames.json (which grows
 * forever as new hosts/configs appear — see issue #1760), we recognize a tool
 * by (a) a family keyword appearing anywhere in the id and (b) the id ending
 * in one of that family's known action names.
 */
interface McpToolFamily {
	/** Prefix used in the synthesized friendly name, e.g. "GitHub MCP". */
	displayName: string;
	/** Lowercase substrings that must appear in the normalized id. */
	keywords: string[];
	/** Known action/tool-name suffixes exposed by the upstream MCP server. */
	actions: Set<string>;
}

const MCP_TOOL_FAMILIES: McpToolFamily[] = [
	{
		displayName: 'GitHub MCP',
		keywords: ['github'],
		actions: new Set([
			'actions_list', 'add_comment_to_pending_review', 'add_issue_comment',
			'add_reply_to_pull_request_comment', 'assign_copilot_to_issue',
			'create_or_update_file', 'create_pull_request', 'create_repository',
			'get_commit', 'get_file_contents', 'get_job_logs', 'get_label', 'get_latest_release',
			'get_me', 'get_release_by_tag', 'get_repository_tree', 'get_tag',
			'issue_read', 'issue_write', 'label_write', 'list_branches',
			'list_code_scanning_alerts', 'list_commits', 'list_issue_fields',
			'list_issue_types', 'list_issues', 'list_label', 'list_pull_requests',
			'list_tags', 'projects_list', 'pull_request_read',
			'pull_request_review_write', 'request_copilot_review', 'search_code',
			'search_issues', 'search_pull_requests', 'search_repositories',
			'search_users', 'semantic_issue_similarity_search',
			'semantic_issues_search', 'sub_issue_write', 'update_pull_request',
		]),
	},
	{
		displayName: 'Playwright MCP',
		keywords: ['playwright'],
		actions: new Set([
			'browser_click', 'browser_close', 'browser_console_messages',
			'browser_evaluate', 'browser_fill_form', 'browser_find', 'browser_hover',
			'browser_install', 'browser_navigate', 'browser_network_request',
			'browser_network_requests', 'browser_press_key', 'browser_resize',
			'browser_run_code', 'browser_run_code_unsafe', 'browser_snapshot',
			'browser_tabs', 'browser_take_screenshot', 'browser_type', 'browser_wait_for',
		]),
	},
	{
		displayName: 'Context7 MCP',
		keywords: ['context7'],
		actions: new Set(['get_library_docs', 'query_docs', 'resolve_library_id']),
	},
	{
		displayName: 'Tavily MCP',
		keywords: ['tavily'],
		actions: new Set(['tavily_crawl', 'tavily_extract', 'tavily_research', 'tavily_search', 'crawl', 'extract', 'research', 'search']),
	},
	{
		displayName: 'Microsoft Docs MCP',
		keywords: ['microsoft_doc', 'microsoftdocs', 'microsoft_learn'],
		actions: new Set(['docs_fetch', 'docs_search', 'code_sample_search']),
	},
	{
		displayName: 'Claude Browser MCP',
		keywords: ['claude_browser', 'claude_in_chrome'],
		actions: new Set([
			'computer', 'find', 'get_page_text', 'javascript_tool', 'navigate',
			'preview_list', 'preview_logs', 'preview_start', 'preview_stop',
			'read_console_messages', 'read_network_requests', 'read_page',
			'resize_window', 'tabs_close', 'tabs_context', 'tabs_create', 'tabs_select',
		]),
	},
];

/** Lowercases and folds `.`/`-` separators to `_` so prefix/action matching is separator-agnostic. */
function normalizeMcpId(id: string): string {
	return id.toLowerCase().replace(/[.-]/g, '_');
}

/**
 * Resolve a tool ID to a friendly name by recognizing a known MCP tool family
 * (from a keyword anywhere in the id) plus a known action name (as the id's
 * suffix), regardless of the server-registration prefix in between.
 *
 * Returns `undefined` when the id doesn't match any known family+action pair,
 * so callers can fall back to an exact toolNames.json entry or the raw id.
 */
export function resolveMcpFamilyToolName(id: string): string | undefined {
	const normalized = normalizeMcpId(id);
	for (const family of MCP_TOOL_FAMILIES) {
		if (!family.keywords.some(keyword => normalized.includes(keyword))) { continue; }
		for (const action of family.actions) {
			if (normalized === action || normalized.endsWith(`_${action}`)) {
				return `${family.displayName}: ${toTitleCase(action)}`;
			}
		}
	}
	return undefined;
}

/**
 * Returns `true` when a tool ID resolves via a known MCP family+action pair.
 * Used to exclude these tools from the "unknown tools" list — a new
 * server-registration spelling for a tool we already recognize shouldn't
 * generate another "add missing friendly name" report.
 */
export function isMcpFamilyResolvedTool(id: string): boolean {
	return resolveMcpFamilyToolName(id) !== undefined;
}
