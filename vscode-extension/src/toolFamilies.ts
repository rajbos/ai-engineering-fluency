import * as vscode from 'vscode';

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
		alternatives: ['lsp', 'diagnostics', 'symbol_lookup'],
		description: 'Tools that query language-server or IDE intelligence.',
	},
	{
		id: 'reading',
		name: 'File Reading',
		builtIn: ['read', 'view', 'cat'],
		alternatives: ['lean-ctx', 'read_file', 'copilot_readFile'],
		description: 'Tools that read file contents into context.',
	},
	{
		id: 'writing',
		name: 'File Writing',
		builtIn: ['edit', 'create', 'write'],
		alternatives: ['write_file', 'copilot_createFile', 'copilot_editFile'],
		description: 'Tools that create or modify files.',
	},
	{
		id: 'search',
		name: 'Search & Discovery',
		builtIn: ['search', 'grep', 'rg', 'glob', 'find'],
		alternatives: ['symdex', 'search_files', 'copilot_searchFiles'],
		description: 'Tools that search the codebase for files or text patterns.',
	},
	{
		id: 'shell',
		name: 'Shell / Terminal',
		builtIn: ['run_in_terminal', 'bash', 'shell'],
		alternatives: ['run_command', 'execute_command'],
		description: 'Tools that execute shell commands.',
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

/** Read and merge tool families from VS Code settings. Falls back to defaults on error. */
export function getToolFamilies(): ToolFamily[] {
	try {
		const raw = vscode.workspace.getConfiguration('aiEngineeringFluency').get<ToolFamily[]>('toolFamilies', []);
		return mergeToolFamilies(Array.isArray(raw) ? raw : []);
	} catch {
		return [...DEFAULT_TOOL_FAMILIES];
	}
}
