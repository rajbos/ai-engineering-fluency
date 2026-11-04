import type { ToolCallUsage } from './types';

export interface ToolFamily {
	/** Stable identifier used for override matching (e.g. "reading"). */
	id: string;
	/** Display name shown in the UI. */
	name: string;
	/** Built-in / baseline tool names that define the reference point. */
	builtIn: string[];
	/** Alternative / efficient-replacement tool names to compare against the built-ins. */
	alternatives: string[];
	/** Optional short description shown as a tooltip or subtitle. */
	description?: string;
}

/** Default tool family definitions. Tool names are matched against normalized names in outputTokensByTool. */
export const DEFAULT_TOOL_FAMILIES: ToolFamily[] = [
	{
		id: 'code-intelligence',
		name: 'Code Intelligence',
		builtIn: ['get_errors', 'hover', 'get_references', 'get_definition'],
		alternatives: ['lsp', 'diagnostics', 'symbol_lookup', 'search_workspace_symbols', 'list_code_usages'],
		description: 'Tools that query language-server or IDE intelligence.',
	},
	{
		id: 'reading',
		name: 'File Reading',
		builtIn: ['read', 'view', 'cat', 'Read', 'read_file', 'copilot_readFile'],
		alternatives: ['lean-ctx'],
		description: 'Tools that read file contents into context.',
	},
	{
		id: 'writing',
		name: 'File Writing',
		builtIn: ['edit', 'create', 'write', 'Edit', 'Write', 'edit_file', 'write_file', 'create_file'],
		alternatives: [
			'insert_edit_into_file',
			'replace_string_in_file',
			'str_replace_editor',
			'search_replace',
			'apply_patch',
			'multi_edit',
			'MultiEdit',
			'copilot_createFile',
			'copilot_editFile',
		],
		description: 'Tools that create or modify files. Alternatives use surgical patch/diff-style edits instead of rewriting whole files.',
	},
	{
		id: 'search',
		name: 'Search & Discovery',
		builtIn: ['search', 'grep', 'rg', 'glob', 'find', 'Grep', 'Glob', 'grep_search', 'file_search', 'list_dir', 'list_directory', 'ls'],
		alternatives: ['symdex', 'search_files', 'copilot_searchFiles', 'semantic_search', 'codebase_search'],
		description: 'Tools that search or list the codebase for files, directories, or text patterns.',
	},
	{
		id: 'shell',
		name: 'Shell / Terminal',
		builtIn: ['run_in_terminal', 'bash', 'shell', 'Bash', 'run_shell_command', 'run_command_in_terminal', 'send_to_terminal', 'run_build', 'windsurf_terminal'],
		alternatives: ['run_command', 'execute_command'],
		description: 'Tools that execute shell commands.',
	},
	{
		id: 'web',
		name: 'Web & Research',
		builtIn: ['web_fetch', 'webfetch', 'WebFetch', 'fetch_webpage'],
		alternatives: ['web_search', 'websearch', 'WebSearch', 'google_web_search'],
		description: 'Tools that fetch or search external web content.',
	},
];

/**
 * Merge user-provided family overrides with the defaults.
 * - User entries whose `id` matches a default replace that default entirely.
 * - User entries with no matching default are appended as new families.
 * - Family order: defaults first (with replacements in-place), then new user families.
 * - Tool-to-family assignment: first family that lists the tool wins (no duplicates).
 */
export function mergeToolFamilies(overrides: ToolFamily[]): ToolFamily[] {
	const result: ToolFamily[] = DEFAULT_TOOL_FAMILIES.map(def => {
		const override = overrides.find(o => o.id === def.id);
		return override ?? def;
	});
	for (const override of overrides) {
		if (!DEFAULT_TOOL_FAMILIES.some(def => def.id === override.id)) {
			result.push(override);
		}
	}
	return result;
}

/**
 * Output tokens per completed call: the one divisor every "tokens per call" figure uses.
 * `outputTokensByTool` is only recorded for calls with an explicit verdict, so its population is
 * `completedByTool`. `byTool` also counts orphaned starts, streaming re-logs and verdict-less
 * calls, so dividing by it understates the figure.
 */
export function tokensPerCompletedCall(outputTokens: number, completedCalls: number): number {
	return completedCalls > 0 ? outputTokens / completedCalls : 0;
}

export interface ToolFamilyRow {
	tool: string;
	outputTokens: number;
	completed: number;
	tokensPerCall: number;
	isBuiltIn: boolean;
	/** `tokensPerCall` as a fraction of the family's built-in baseline; null without a baseline, or for a built-in. */
	vsBuiltIn: number | null;
}

export interface ToolFamilyGroup {
	/** The family's id, or null for the tools no family lists. */
	id: string | null;
	name: string | null;
	description?: string;
	rows: ToolFamilyRow[];
}

type ToolTotals = { outputTokens: number; completed: number };

/** Takes the listed tools out of `eligible`, so the first family that lists a tool wins (see mergeToolFamilies). */
function takeFamilyTools(names: readonly string[], isBuiltIn: boolean, eligible: Map<string, ToolTotals>): (ToolTotals & { tool: string; isBuiltIn: boolean })[] {
	const taken = [];
	for (const tool of names) {
		const totals = eligible.get(tool);
		if (!totals) { continue; }
		eligible.delete(tool);
		taken.push({ tool, isBuiltIn, ...totals });
	}
	return taken;
}

/**
 * Groups the tools with sized output by family, in family order, followed by a catch-all group
 * (`id: null`) for tools no family lists. An alternative is compared with the pooled average of
 * its family's built-ins. Families without data are left out.
 */
export function buildToolFamilyGroups(
	toolCalls: Pick<ToolCallUsage, 'outputTokensByTool' | 'completedByTool'>,
	families: readonly ToolFamily[],
	isReportable: (tool: string) => boolean = () => true,
): ToolFamilyGroup[] {
	const completedByTool = toolCalls.completedByTool ?? {};
	const eligible = new Map<string, ToolTotals>();
	for (const [tool, outputTokens] of Object.entries(toolCalls.outputTokensByTool ?? {})) {
		const completed = completedByTool[tool] ?? 0;
		if (completed > 0 && isReportable(tool)) { eligible.set(tool, { outputTokens, completed }); }
	}

	const groups: ToolFamilyGroup[] = [];
	for (const family of families) {
		const builtIns = takeFamilyTools(family.builtIn, true, eligible);
		const alternatives = takeFamilyTools(family.alternatives, false, eligible);
		if (builtIns.length + alternatives.length === 0) { continue; }
		const baseline = tokensPerCompletedCall(
			builtIns.reduce((sum, r) => sum + r.outputTokens, 0),
			builtIns.reduce((sum, r) => sum + r.completed, 0),
		);
		const rows = [...builtIns, ...alternatives].map((r): ToolFamilyRow => {
			const tokensPerCall = tokensPerCompletedCall(r.outputTokens, r.completed);
			return { ...r, tokensPerCall, vsBuiltIn: !r.isBuiltIn && baseline > 0 ? tokensPerCall / baseline : null };
		});
		groups.push({ id: family.id, name: family.name, description: family.description, rows });
	}
	if (eligible.size > 0) {
		const rows = [...eligible].map(([tool, totals]): ToolFamilyRow => ({
			tool, ...totals, isBuiltIn: false, vsBuiltIn: null,
			tokensPerCall: tokensPerCompletedCall(totals.outputTokens, totals.completed),
		}));
		groups.push({ id: null, name: null, rows });
	}
	return groups;
}
