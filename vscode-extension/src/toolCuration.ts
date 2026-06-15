/**
 * Tool Curation analysis module.
 *
 * Compares the set of *available* tools (MCP servers, extension-contributed tools,
 * skill files discovered on disk) against the tools actually *used* within a
 * look-back window, and produces actionable recommendations to reduce prompt-bloat
 * and unused context overhead.
 *
 * This module is intentionally pure (no direct VS Code API calls) so it can be
 * unit-tested with mocked data and re-used by the CLI.  VS Code-specific data
 * (e.g. `vscode.lm.tools`) is collected in extension.ts and passed in.
 */
import * as fs from 'fs';
import * as path from 'path';

import type {
	AvailableToolEntry,
	ToolCurationAnalysis,
	ToolCurationRecommendation,
	UsageAnalysisPeriod,
} from './types';
import { isMcpTool, extractMcpServerName } from './workspaceHelpers';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Rough characters-per-token ratio used to estimate prompt token overhead. */
const CHARS_PER_TOKEN = 4;

/** Minimum number of MCP tool calls in the window to consider a server "used". */
const MCP_SERVER_USE_THRESHOLD = 1;

// ---------------------------------------------------------------------------
// Runtime tool enumeration (VS Code only — pass `[]` from CLI)
// ---------------------------------------------------------------------------

/**
 * Minimal shape of a VS Code LanguageModelToolInformation entry.
 * Declared locally to avoid a hard dependency on the `vscode` module, which is
 * unavailable when this module is imported by the CLI.
 */
export interface RuntimeToolInfo {
	name: string;
	description: string;
	tags?: readonly string[];
}

/**
 * Convert VS Code runtime tool info (`vscode.lm.tools`) into `AvailableToolEntry` objects.
 * Call this from extension.ts and pass the result to `analyzeToolCuration`.
 */
export function enumerateRuntimeTools(tools: readonly RuntimeToolInfo[]): AvailableToolEntry[] {
	return tools.map((t): AvailableToolEntry => {
		if (isMcpTool(t.name)) {
			return {
				name: t.name,
				description: t.description,
				source: 'mcp',
				server: extractMcpServerName(t.name),
			};
		}
		return {
			name: t.name,
			description: t.description,
			source: 'builtin',
		};
	});
}

// ---------------------------------------------------------------------------
// Extension-contributed MCP servers (VS Code only — pass `[]` from CLI)
// ---------------------------------------------------------------------------

/**
 * Minimal shape of a VS Code Extension object needed for MCP server enumeration.
 * Declared locally to avoid a hard dependency on the `vscode` module.
 */
export interface ExtensionInfo {
	id: string;
	displayName?: string;
	isActive: boolean;
	packageJSON?: {
		displayName?: string;
		contributes?: {
			mcpServers?: Record<string, { label?: string; [key: string]: unknown }>;
		};
	};
}

/**
 * Enumerate MCP servers contributed by installed VS Code extensions via their
 * `contributes.mcpServers` package.json entry.
 *
 * These servers may not be actively running yet (e.g. the server hasn't been started
 * for the current session), so they won't appear in `vscode.lm.tools`. Call this
 * alongside `enumerateRuntimeTools` and deduplicate by server name before merging.
 *
 * @param extensions  Pass `vscode.extensions.all` from extension.ts.
 * @param enabledServerNames  Set of MCP server names that currently have at least one
 *   enabled tool in `vscode.lm.tools`. Used to mark each entry's `enabled` flag so
 *   the UI can tell "installed but tools disabled" apart from "installed and enabled".
 *   Pass an empty set if you don't have this information.
 */
export function enumerateExtensionMcpServers(
	extensions: readonly ExtensionInfo[],
	enabledServerNames: ReadonlySet<string> = new Set(),
): AvailableToolEntry[] {
	const entries: AvailableToolEntry[] = [];
	for (const ext of extensions) {
		const mcpServers = ext.packageJSON?.contributes?.mcpServers;
		if (!mcpServers || typeof mcpServers !== 'object') { continue; }
		for (const serverName of Object.keys(mcpServers)) {
			const serverDef = mcpServers[serverName];
			const label = serverDef?.label ?? serverName;
			const displayName = ext.packageJSON?.displayName ?? ext.displayName ?? ext.id;
			entries.push({
				name: `mcp__${serverName}`,
				description: `MCP server "${label}" provided by extension ${displayName}`,
				source: 'mcp',
				server: serverName,
				extensionId: ext.id,
				enabled: enabledServerNames.has(serverName),
				extensionActive: ext.isActive,
			});
		}
	}
	return entries;
}

// ---------------------------------------------------------------------------
// Settings-based MCP servers (VS Code only — pass `{}` from CLI)
// ---------------------------------------------------------------------------

/**
 * Build `AvailableToolEntry` stubs for MCP servers configured in VS Code's
 * `mcp.servers` setting (user or workspace scope).
 *
 * This covers servers added via the VS Code UI or settings.json directly,
 * which is separate from the file-based `.vscode/mcp.json` approach.
 *
 * Pass `vscode.workspace.getConfiguration('mcp').get<Record<string, unknown>>('servers', {})`.
 */
export function buildMcpEntriesFromSettings(servers: Record<string, unknown>): AvailableToolEntry[] {
	if (!servers || typeof servers !== 'object') { return []; }
	return Object.keys(servers).map((serverName): AvailableToolEntry => ({
		name: `mcp__${serverName}`,
		description: `MCP server: ${serverName}`,
		source: 'mcp',
		server: serverName,
	}));
}

// ---------------------------------------------------------------------------
// MCP JSON parsing (works in both VS Code and CLI)
// ---------------------------------------------------------------------------

interface McpJsonServer {
	command?: string;
	url?: string;
	[key: string]: unknown;
}

interface McpJsonFile {
	servers?: Record<string, McpJsonServer>;
	inputs?: unknown[];
}

/**
 * Parse a `.vscode/mcp.json` file and return the configured server names.
 * Returns an empty array when the file does not exist or cannot be parsed.
 */
export function parseMcpJson(mcpJsonPath: string): string[] {
	try {
		if (!fs.existsSync(mcpJsonPath)) { return []; }
		const raw = fs.readFileSync(mcpJsonPath, 'utf-8');
		const parsed = JSON.parse(raw) as McpJsonFile;
		const servers = parsed?.servers;
		if (!servers || typeof servers !== 'object') { return []; }
		return Object.keys(servers);
	} catch {
		return [];
	}
}

/**
 * Candidate MCP config file paths for a workspace folder, in priority order.
 *
 * Covers:
 * - VS Code:         `<folder>/.vscode/mcp.json`
 * - Visual Studio:   `<folder>/.mcp.json`, `<folder>/.vs/mcp.json`
 * - Cursor:          `<folder>/.cursor/mcp.json`
 */
function mcpConfigPathsForFolder(folder: string): string[] {
	return [
		path.join(folder, '.vscode', 'mcp.json'),
		path.join(folder, '.mcp.json'),
		path.join(folder, '.vs', 'mcp.json'),
		path.join(folder, '.cursor', 'mcp.json'),
	];
}

/**
 * User-level MCP config paths (Visual Studio reads `%USERPROFILE%\.mcp.json`).
 * Returns an empty array when the HOME/USERPROFILE env var is not set.
 */
function userMcpConfigPaths(): string[] {
	const home = process.env.USERPROFILE ?? process.env.HOME ?? '';
	if (!home) { return []; }
	return [path.join(home, '.mcp.json')];
}

/**
 * Build `AvailableToolEntry` stubs for MCP servers discovered from config files.
 * Because mcp.json doesn't enumerate per-tool capabilities we create one entry
 * per server (source = 'mcp') so the curation report can flag entire servers.
 *
 * Checks (in order, deduplicating by server name):
 * - `<folder>/.vscode/mcp.json`  (VS Code)
 * - `<folder>/.mcp.json`         (Visual Studio repo-root)
 * - `<folder>/.vs/mcp.json`      (Visual Studio solution-scoped)
 * - `<folder>/.cursor/mcp.json`  (Cursor)
 * - `%USERPROFILE%/.mcp.json`    (Visual Studio user-global)
 */
export function buildMcpEntriesFromJson(workspaceFolderPaths: string[]): AvailableToolEntry[] {
	const entries: AvailableToolEntry[] = [];
	// Track server → all config file paths (deduplicate per file too)
	const serverConfigFiles = new Map<string, string[]>();
	const seenServers = new Set<string>();

	const allPaths: string[] = [
		...workspaceFolderPaths.flatMap(mcpConfigPathsForFolder),
		...userMcpConfigPaths(),
	];

	for (const mcpPath of allPaths) {
		for (const serverName of parseMcpJson(mcpPath)) {
			if (!serverConfigFiles.has(serverName)) {
				serverConfigFiles.set(serverName, []);
			}
			const files = serverConfigFiles.get(serverName)!;
			if (!files.includes(mcpPath)) { files.push(mcpPath); }
			if (!seenServers.has(serverName)) {
				seenServers.add(serverName);
				// Placeholder entry — configFiles will be set after all paths scanned
				entries.push({
					name: `mcp__${serverName}`,
					description: `MCP server: ${serverName}`,
					source: 'mcp',
					server: serverName,
					configFiles: files,  // same array reference — will grow as more paths are found
				});
			}
		}
	}

	return entries;
}

// ---------------------------------------------------------------------------
// Skill discovery (works in both VS Code and CLI)
// ---------------------------------------------------------------------------

/** Extract the first description line from a SKILL.md file, or return a default. */
function readSkillDescription(skillMdPath: string, fallback: string): string {
	try {
		const content = fs.readFileSync(skillMdPath, 'utf-8');
		const descMatch = /^(?:description:|#\s+)(.+)/im.exec(content);
		if (descMatch) {
			return descMatch[1].trim().replace(/^["']|["']$/g, '');
		}
	} catch {
		// ignore read errors
	}
	return fallback;
}

/** Collect skill entries from a single `.github/skills` directory. */
function collectSkillsFromDirectory(folder: string, skillsDir: string, seenPaths: Set<string>): AvailableToolEntry[] {
	let skillDirs: fs.Dirent[];
	try {
		skillDirs = fs.readdirSync(skillsDir, { withFileTypes: true });
	} catch {
		return [];
	}

	const entries: AvailableToolEntry[] = [];
	for (const entry of skillDirs) {
		if (!entry.isDirectory()) { continue; }
		const skillMdPath = path.join(skillsDir, entry.name, 'SKILL.md');
		if (!fs.existsSync(skillMdPath) || seenPaths.has(skillMdPath)) { continue; }
		seenPaths.add(skillMdPath);
		const description = readSkillDescription(skillMdPath, `Skill: ${entry.name}`);
		const relativePath = path.relative(folder, skillMdPath).replace(/\\/g, '/');
		entries.push({ name: entry.name, description, source: 'skill', skillPath: relativePath, configFiles: [skillMdPath] });
	}
	return entries;
}

/**
 * Workspace-relative skill directory names checked by VS Code and Visual Studio.
 *
 * VS Code / GitHub Copilot:  `.github/skills/`
 * Visual Studio (also):      `.claude/skills/`, `.agents/skills/`
 */
const WORKSPACE_SKILL_DIRS = ['.github/skills', '.claude/skills', '.agents/skills'];

/**
 * User-level skill directories (Visual Studio: `~/.copilot/skills/`, `~/.claude/skills/`, `~/.agents/skills/`).
 * Returns an empty array when the HOME/USERPROFILE env var is not set.
 */
function userSkillDirs(): string[] {
	const home = process.env.USERPROFILE ?? process.env.HOME ?? '';
	if (!home) { return []; }
	return [
		path.join(home, '.copilot', 'skills'),
		path.join(home, '.claude', 'skills'),
		path.join(home, '.agents', 'skills'),
	];
}

/**
 * Scan workspace folders and user-level directories for skill files
 * (`SKILL.md`) and return them as `AvailableToolEntry` objects.
 *
 * Workspace locations (relative to each workspace folder):
 *   `.github/skills/`  (VS Code, Visual Studio)
 *   `.claude/skills/`  (Visual Studio)
 *   `.agents/skills/`  (Visual Studio)
 *
 * User-level locations:
 *   `~/.copilot/skills/`  (Visual Studio)
 *   `~/.claude/skills/`   (Visual Studio)
 *   `~/.agents/skills/`   (Visual Studio)
 */
export function discoverSkillEntries(workspaceFolderPaths: string[]): AvailableToolEntry[] {
	const entries: AvailableToolEntry[] = [];
	const seenPaths = new Set<string>();

	// Workspace-scoped skill directories
	for (const folder of workspaceFolderPaths) {
		for (const relDir of WORKSPACE_SKILL_DIRS) {
			const skillsDir = path.join(folder, ...relDir.split('/'));
			if (!fs.existsSync(skillsDir)) { continue; }
			entries.push(...collectSkillsFromDirectory(folder, skillsDir, seenPaths));
		}
	}

	// User-scoped skill directories (not tied to any workspace folder)
	const home = process.env.USERPROFILE ?? process.env.HOME ?? '';
	for (const skillsDir of userSkillDirs()) {
		if (!fs.existsSync(skillsDir)) { continue; }
		entries.push(...collectSkillsFromDirectory(home, skillsDir, seenPaths));
	}

	return entries;
}

// ---------------------------------------------------------------------------
// Core curation analysis
// ---------------------------------------------------------------------------

/**
 * Estimate the number of prompt tokens consumed per interaction by a set of
 * tool descriptions. Uses a simple characters-per-token approximation.
 */
function estimateDescriptionTokens(tools: AvailableToolEntry[]): number {
	return Math.round(
		tools.reduce((sum, t) => sum + (t.name.length + t.description.length + 10), 0) / CHARS_PER_TOKEN
	);
}

function buildUsedCounts(usagePeriod: UsageAnalysisPeriod): Record<string, number> {
	const counts: Record<string, number> = {};
	for (const [tool, count] of Object.entries(usagePeriod.toolCalls.byTool)) {
		counts[tool] = (counts[tool] ?? 0) + count;
	}
	for (const [tool, count] of Object.entries(usagePeriod.mcpTools.byTool)) {
		counts[tool] = (counts[tool] ?? 0) + count;
	}
	return counts;
}

function computeUnderusedMcpServers(
	availableTools: AvailableToolEntry[],
	usedNames: Set<string>,
	usagePeriod: UsageAnalysisPeriod,
): { server: string; availableToolCount: number; usedToolCount: number; configFiles?: string[]; extensionId?: string; enabled?: boolean; extensionActive?: boolean }[] {
	const mcpServers = new Set<string>();
	for (const t of availableTools) {
		if (t.source === 'mcp' && t.server) { mcpServers.add(t.server); }
	}
	return Array.from(mcpServers).map(server => {
		const serverTools = availableTools.filter(t => t.source === 'mcp' && t.server === server);
		// For stub entries (created from mcp.json where name === `mcp__${server}`), `usedNames`
		// contains full tool names like `mcp__server__toolname`, so an exact match will never
		// fire.  Fall back to server-level usage count from `byServer` for these stubs.
		const usedServerTools = serverTools.filter(t => {
			const isStub = t.name === `mcp__${server}`;
			if (isStub) {
				return (usagePeriod.mcpTools.byServer[server] ?? 0) >= MCP_SERVER_USE_THRESHOLD;
			}
			return usedNames.has(t.name);
		});
		// Collect all distinct config files across all entries for this server
		const configFiles = [...new Set(serverTools.flatMap(t => t.configFiles ?? []))];
		// Pick up extensionId / enabled / extensionActive if any entry for this server was contributed by an extension
		const extEntry = serverTools.find(t => t.extensionId);
		const extensionId = extEntry?.extensionId;
		const enabled = extEntry?.enabled;
		const extensionActive = extEntry?.extensionActive;
		return {
			server,
			availableToolCount: serverTools.length,
			usedToolCount: usedServerTools.length,
			configFiles: configFiles.length > 0 ? configFiles : undefined,
			extensionId,
			enabled,
			extensionActive,
		};
	})
	// Keep disabled extension servers out (they consume no prompt budget).
	// Fully-used servers are still included so the UI can show them with the toggle.
	.filter(s => s.enabled !== false);
}

function buildBloatEstimate(
	unusedTools: AvailableToolEntry[],
): { totalTokens: number; byServer: Record<string, number> } {
	const unusedByServer: Record<string, AvailableToolEntry[]> = {};
	for (const t of unusedTools) {
		const key = t.server ?? t.source;
		if (!unusedByServer[key]) { unusedByServer[key] = []; }
		unusedByServer[key].push(t);
	}
	const byServer: Record<string, number> = {};
	for (const [key, tools] of Object.entries(unusedByServer)) {
		byServer[key] = estimateDescriptionTokens(tools);
	}
	return { totalTokens: Object.values(byServer).reduce((s, n) => s + n, 0), byServer };
}

function buildCurationRecommendations(
	underusedMcpServers: { server: string; availableToolCount: number; usedToolCount: number }[],
	unusedTools: AvailableToolEntry[],
	windowDays: number,
): ToolCurationRecommendation[] {
	const recs: ToolCurationRecommendation[] = [];
	for (const s of underusedMcpServers) {
		if (s.usedToolCount === 0) {
			const serverUnused = unusedTools.filter(t => t.source === 'mcp' && t.server === s.server);
			recs.push({
				type: 'disable-mcp-server',
				target: s.server,
				reason: `No tools from the "${s.server}" MCP server were used in the last ${windowDays} days.`,
				estimatedTokenSavings: estimateDescriptionTokens(serverUnused),
			});
		}
	}
	for (const skill of unusedTools.filter(t => t.source === 'skill')) {
		recs.push({
			type: 'refine-skill',
			target: skill.name,
			reason: `The "${skill.name}" skill was not invoked in the last ${windowDays} days. Consider updating its description or removing it to reduce instruction-file bloat.`,
		});
	}
	return recs;
}

/**
 * Perform the full curation analysis.
 *
 * @param availableTools  - Tools visible in the current environment (runtime + mcp.json + skills).
 * @param usagePeriod     - Aggregated usage from the look-back window (use `last30Days` or custom).
 * @param windowDays      - Look-back window used to label the result (informational only).
 */
export function analyzeToolCuration(
	availableTools: AvailableToolEntry[],
	usagePeriod: UsageAnalysisPeriod,
	windowDays: number,
): ToolCurationAnalysis {
	const usedCounts = buildUsedCounts(usagePeriod);
	const usedToolsArray = Object.entries(usedCounts)
		.map(([name, count]) => ({ name, count }))
		.sort((a, b) => b.count - a.count);
	const usedNames = new Set(Object.keys(usedCounts));

	const unusedTools = availableTools.filter(t => {
		if (t.source === 'skill') {
			// Skills are discovered by directory name; use exact match against the set of
			// invoked tool names so that short names like "pdf" don't false-match unrelated tools.
			return !usedNames.has(t.name);
		}
		if (t.source === 'mcp' && t.server) {
			// Disabled extension-contributed servers don't consume prompt budget — don't count
			// them as "unused" or include them in bloat estimates.
			if (t.enabled === false) { return false; }
			// Stub entries (name === `mcp__<server>`) represent the whole server — use server-level count.
			// Per-tool entries (name === `mcp__<server>__<tool>`) support exact per-tool matching.
			const isStub = t.name === `mcp__${t.server}`;
			if (isStub) {
				return (usagePeriod.mcpTools.byServer[t.server] ?? 0) < MCP_SERVER_USE_THRESHOLD;
			}
			return !usedNames.has(t.name);
		}
		return !usedNames.has(t.name);
	});

	const underusedMcpServers = computeUnderusedMcpServers(availableTools, usedNames, usagePeriod);
	const estimatedPromptBloat = buildBloatEstimate(unusedTools);
	const recommendations = buildCurationRecommendations(underusedMcpServers, unusedTools, windowDays);

	return {
		windowDays,
		availableTools,
		usedTools: usedToolsArray,
		unusedTools,
		underusedMcpServers,
		estimatedPromptBloat,
		recommendations,
	};
}
