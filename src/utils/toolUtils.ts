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
