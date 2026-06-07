/**
 * Workspace resolution and utility helper functions.
 * Pure functions extracted from CopilotTokenTracker.
 */
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import type { CustomizationFileEntry } from './types';
import * as packageJson from '../package.json';
import customizationPatternsData from './customizationPatterns.json';
import { resolveFileUri } from './workspacePathResolver';
import {
	fileUriToPath,
	hasWindowsDriveSegment,
	normalizePath,
	normalizePathForComparison,
	normalizePathForDedup,
	splitNormalizedPath,
	stripWindowsDriveUriPrefix,
	toPlatformPath
} from './utils/pathUtils';
import { withErrorRecoverySync } from './utils/errors';
import { isGuidMcpTool } from './utils/toolUtils';

export {
	fileUriToPath,
	normalizePath,
	normalizePathForComparison,
	normalizePathForDedup,
	normalizePathSeparators
} from './utils/pathUtils';


// ── Local type definitions ────────────────────────────────────────────────

/** Represents a VS Code Copilot interaction mode object read from session data. */
interface ModeObject {
	kind?: string;
	id?: string;
}

/** A single file/path reference inside a chat content-reference item. */
interface ContentReferenceData {
	fsPath?: string;
	path?: string;
}

/**
 * A content-reference item as stored in Copilot session data.
 * The `kind` field determines which nested reference key is present.
 */
interface ContentReferenceItem {
	kind?: string;
	reference?: ContentReferenceData;
	inlineReference?: ContentReferenceData;
}

/** A single pattern entry in customizationPatterns.json. */
interface CustomizationPattern {
	id?: string;
	type?: string;
	category?: 'copilot' | 'non-copilot';
	icon?: string;
	label?: string;
	path: string;
	scanMode?: string;
	caseInsensitive?: boolean;
	maxDepth?: number;
}

/** Top-level structure of customizationPatterns.json. */
interface CustomizationPatternsConfig {
	stalenessThresholdDays?: number;
	excludeDirs?: string[];
	patterns?: CustomizationPattern[];
}

/**
 * Resolve the workspace folder full path from a session file path.
 * Looks for a `workspaceStorage/<id>/` segment and reads `workspace.json` or `meta.json`.
 * Synchronous by design to keep the analysis flow simple and cached.
 */
// Helper: read a workspaceStorage JSON file and extract a candidate folder path from configured keys
export function parseWorkspaceStorageJsonFile(jsonPath: string, candidateKeys: string[]): string | undefined {
	if (typeof jsonPath !== 'string' || !jsonPath || !Array.isArray(candidateKeys)) { return undefined; }
	try {
		const raw = fs.readFileSync(jsonPath, 'utf8');
		const obj = JSON.parse(raw);
		if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) { return undefined; }
		for (const key of candidateKeys) {
			const candidate = obj[key];
			if (typeof candidate !== 'string') { continue; }
			// Resolve file:// URIs using the safe resolver (handles Windows, POSIX, UNC, encoded chars).
			if (candidate.startsWith('file://')) {
				const resolved = resolveFileUri(candidate);
				if (resolved) { return resolved; }
				continue;
			}
			// Non-URI value — treat as a plain filesystem path.
			return candidate;
		}
	} catch {
		// ignore parse/read errors
	}
	return undefined;
}

/**
 * Extract workspace ID from a session file path, if it's workspace-scoped.
 * Returns the workspace ID or undefined if not a workspace-scoped session.
 */
export function extractWorkspaceIdFromSessionPath(sessionFilePath: string): string | undefined {
	try {
		const parts = splitNormalizedPath(sessionFilePath);
		const idx = parts.findIndex(p => p.toLowerCase() === 'workspacestorage');
		if (idx === -1 || idx + 1 >= parts.length) {
			return undefined; // Not a workspace-scoped session file
		}
		return parts[idx + 1];
	} catch {
		return undefined;
	}
}

/** Escape all regex special characters in a literal string fragment. */
export function escapeRegexSpecials(pattern: string): string {
	return pattern.replace(/([.+^=!:${}()|[\]\\])/g, '\\$1');
}

/**
 * Replace globstar tokens with a placeholder so they survive the single-star
 * replacement step.  Two cases:
 *   - double-star between slashes (or at start) in the middle of a path -> optional sub-tree
 *   - standalone or trailing double-star                                 -> any depth remainder
 */
export function replaceGlobstars(pattern: string): string {
	let result = pattern.replace(/(^|\/)\*\*\/(?!$)/g, '$1__GLOBSTAR__/');
	result = result.replace(/\*\*/g, '__GLOBSTAR__');
	return result;
}

/** Replace single `*` with a segment-local wildcard `[^/]*`. */
export function replaceWildcards(pattern: string): string {
	return pattern.replace(/\*/g, '[^/]*');
}

/** Replace `?` with a single-character matcher `.`. */
export function replaceQuestionMarks(pattern: string): string {
	return pattern.replace(/\?/g, '.');
}

/** Expand the globstar placeholder back to its proper regex fragments. */
function expandGlobstarPlaceholder(pattern: string): string {
	let result = pattern.replace(/__GLOBSTAR__\//g, '(?:.*?/?)');
	result = result.replace(/__GLOBSTAR__/g, '.*');
	return result;
}

/**
 * Convert a simple glob pattern to a RegExp.
 * Supports: ** (match multiple path segments), * (match within a segment), ?.
 */
export function globToRegExp(glob: string, caseInsensitive: boolean = false): RegExp {
	const pattern = [
		normalizePath(glob),
	]
		.map(escapeRegexSpecials)
		.map(replaceGlobstars)
		.map(replaceWildcards)
		.map(replaceQuestionMarks)
		.map(expandGlobstarPlaceholder)[0];

	const flags = caseInsensitive ? 'i' : '';
	return new RegExp('^' + pattern + '$', flags);
}

/**
 * Resolve an exact relative path in a workspace.
 * When `caseInsensitive` is true, path segments are matched case-insensitively.
 */

/**
 * Try to resolve one path segment `segment` inside directory `current`.
 * When `isLast` is false, the resolved entry must be a directory.
 * Returns the resolved absolute path, or undefined if not found / wrong type.
 * @internal
 */
function resolvePathSegment(current: string, segment: string, isLast: boolean): string | undefined {
	if (!fs.existsSync(current)) { return undefined; }
	let entries: fs.Dirent[];
	try {
		entries = fs.readdirSync(current, { withFileTypes: true });
	} catch {
		return undefined;
	}
	const matchedEntry = entries.find(e => e.name.toLowerCase() === segment.toLowerCase());
	if (!matchedEntry) { return undefined; }
	const matchedPath = path.join(current, matchedEntry.name);
	if (isLast) { return matchedPath; }
	try {
		if (!fs.statSync(matchedPath).isDirectory()) { return undefined; }
	} catch {
		return undefined;
	}
	return matchedPath;
}

export function resolveExactWorkspacePath(workspaceFolderPath: string, relativePattern: string, caseInsensitive: boolean): string | undefined {
	const directPath = path.join(workspaceFolderPath, relativePattern);
	if (!caseInsensitive) {
		return fs.existsSync(directPath) ? directPath : undefined;
	}
	if (fs.existsSync(directPath)) { return directPath; }

	const segments = splitNormalizedPath(relativePattern).filter(seg => seg !== '.');
	let current = workspaceFolderPath;
	for (let index = 0; index < segments.length; index++) {
		const resolved = resolvePathSegment(current, segments[index], index === segments.length - 1);
		if (!resolved) { return undefined; }
		current = resolved;
	}
	return fs.existsSync(current) ? current : undefined;
}

// ── scanWorkspaceCustomizationFiles helpers ──────────────────────────────────────────

/** Shared context for building a CustomizationFileEntry from a matched path. */
interface PatternScanContext {
	workspaceFolderPath: string;
	pattern: CustomizationPattern;
	stalenessDays: number;
}

/** Build a CustomizationFileEntry for a matched absolute path. */
function buildCustomizationEntry(
	ctx: PatternScanContext,
	absPath: string,
	displayName?: string
): CustomizationFileEntry {
	const { workspaceFolderPath, pattern, stalenessDays } = ctx;
	const stat = fs.statSync(absPath);
	const name = displayName ?? path.basename(absPath);
	return {
		path: absPath,
		relativePath: normalizePath(path.relative(workspaceFolderPath, absPath)),
		type: pattern.type ?? 'unknown',
		icon: pattern.icon ?? '',
		label: pattern.label ?? name,
		name,
		lastModified: stat.mtime.toISOString(),
		isStale: (Date.now() - stat.mtime.getTime()) > stalenessDays * 24 * 60 * 60 * 1000,
		category: pattern.category
	};
}

/** Handle `scanMode: "exact"` — look for a single file at the given path. */
function scanExactPattern(ctx: PatternScanContext): CustomizationFileEntry | undefined {
	const { workspaceFolderPath, pattern, stalenessDays } = ctx;
	const absPath = resolveExactWorkspacePath(workspaceFolderPath, pattern.path, !!pattern.caseInsensitive);
	if (!absPath) { return undefined; }
	return buildCustomizationEntry({ workspaceFolderPath, pattern, stalenessDays }, absPath);
}

/** Handle `scanMode: "oneLevel"` — enumerate one directory level for wildcard matches. */
function scanOneLevelPattern(ctx: PatternScanContext, excludeDirs: string[]): CustomizationFileEntry[] {
	const { workspaceFolderPath, pattern, stalenessDays } = ctx;
	const normalizedPattern = normalizePath(pattern.path);
	const starIndex = normalizedPattern.indexOf('*');
	if (starIndex === -1) { return []; }

	const beforeStar = normalizedPattern.substring(0, starIndex);
	const afterStar = normalizedPattern.substring(starIndex + 1);
	const baseDirPath = beforeStar.replace(/\/$/, '');
	const baseDir = baseDirPath ? path.join(workspaceFolderPath, baseDirPath) : workspaceFolderPath;
	if (!fs.existsSync(baseDir) || !fs.statSync(baseDir).isDirectory()) { return []; }

	const entries = fs.readdirSync(baseDir, { withFileTypes: true });
	const suffix = afterStar.startsWith('/') ? afterStar.substring(1) : afterStar;
	const results: CustomizationFileEntry[] = [];
	for (const entry of entries) {
		if (excludeDirs.includes(entry.name)) { continue; }
		const candidatePath = path.join(baseDir, entry.name, suffix);
		if (!fs.existsSync(candidatePath)) { continue; }
		const stat = fs.statSync(candidatePath);
		if (!stat.isFile()) { continue; }
		const displayName = pattern.type === 'skill' ? entry.name : path.basename(candidatePath);
		results.push(buildCustomizationEntry(ctx, candidatePath, displayName));
	}
	return results;
}

/**
 * Recursively walk `dir` up to `depth` levels, collecting files that match `regex`.
 * @internal
 */
function walkDirectoryForPattern(
	dir: string,
	depth: number,
	ctx: PatternScanContext,
	regex: RegExp,
	excludeDirs: string[]
): CustomizationFileEntry[] {
	if (depth < 0) { return []; }
	const children = withErrorRecoverySync(
		() => fs.readdirSync(dir, { withFileTypes: true }),
		[] as fs.Dirent[],
		`walkDirectoryForPattern readdir(${dir})`
	);
	const results: CustomizationFileEntry[] = [];
	for (const child of children) {
		const childPath = path.join(dir, child.name);
		if (child.isDirectory() && !excludeDirs.includes(child.name)) {
			results.push(...walkDirectoryForPattern(childPath, depth - 1, ctx, regex, excludeDirs));
		} else if (child.isFile()) {
			const rel = normalizePath(path.relative(ctx.workspaceFolderPath, childPath));
			if (regex.test(rel)) {
				results.push(buildCustomizationEntry(ctx, childPath));
			}
		}
	}
	return results;
}

/** Handle `scanMode: "recursive"` — glob-match files at any depth. */
function scanRecursivePattern(ctx: PatternScanContext, excludeDirs: string[]): CustomizationFileEntry[] {
	const { workspaceFolderPath, pattern } = ctx;
	const maxDepth = typeof pattern.maxDepth === 'number' ? pattern.maxDepth : 6;
	const regex = globToRegExp(pattern.path, !!pattern.caseInsensitive);
	return walkDirectoryForPattern(workspaceFolderPath, maxDepth, ctx, regex, excludeDirs);
}

/**
 * Scan a workspace folder for customization files according to `customizationPatterns.json`.
 */
export function scanWorkspaceCustomizationFiles(workspaceFolderPath: string): CustomizationFileEntry[] {
	if (!workspaceFolderPath || !fs.existsSync(workspaceFolderPath)) { return []; }

	const cfg = customizationPatternsData as CustomizationPatternsConfig;
	const stalenessDays = typeof cfg.stalenessThresholdDays === 'number' ? cfg.stalenessThresholdDays : 90;
	const excludeDirs: string[] = Array.isArray(cfg.excludeDirs) ? cfg.excludeDirs : [];

	const results: CustomizationFileEntry[] = [];
	for (const pattern of (cfg.patterns ?? [])) {
		try {
			const ctx: PatternScanContext = { workspaceFolderPath, pattern, stalenessDays };
			const scanMode = pattern.scanMode ?? 'exact';
			if (scanMode === 'exact') {
				const entry = scanExactPattern(ctx);
				if (entry) { results.push(entry); }
			} else if (scanMode === 'oneLevel') {
				results.push(...scanOneLevelPattern(ctx, excludeDirs));
			} else if (scanMode === 'recursive') {
				results.push(...scanRecursivePattern(ctx, excludeDirs));
			}
		} catch {
			// ignore per-pattern errors
		}
	}

	// Deduplicate by absolute path
	const uniq: Record<string, CustomizationFileEntry> = {};
	for (const r of results) { uniq[path.normalize(r.path)] = r; }
	return Object.values(uniq);
}

// Helper method to get repository URL from package.json
export function getRepositoryUrl(): string {
	const repoUrl = packageJson.repository?.url?.replace(/^git\+/, '').replace(/\.git$/, '');
	return repoUrl || 'https://github.com/rajbos/ai-engineering-fluency';
}

function getModeFromAgentKind(id: string | undefined): 'agent' | 'plan' | 'customAgent' {
	if (!id || id === 'agent') { return 'agent'; }
	if (id.includes('plan-agent/Plan.agent.md')) { return 'plan'; }
	if (id.includes('.agent.md')) { return 'customAgent'; }
	return 'agent';
}

/**
 * Detect the actual mode type from inputState.mode object.
 * Returns 'ask', 'edit', 'agent', 'plan', or 'customAgent'.
 */
export function getModeType(mode: ModeObject | string | null | undefined): 'ask' | 'edit' | 'agent' | 'plan' | 'customAgent' {
	if (!mode) { return 'ask'; }
	if (typeof mode === 'string') {
		if (mode === 'edit') { return 'edit'; }
		if (mode === 'agent') { return 'agent'; }
		return 'ask';
	}
	if (!mode.kind) { return 'ask'; }
	if (mode.kind === 'edit') { return 'edit'; }
	if (mode.kind === 'ask') { return 'ask'; }
	if (mode.kind === 'agent') { return getModeFromAgentKind(mode.id as string | undefined); }
	return 'ask';
}

/**
 * Extract custom agent name from a file:// URI pointing to a .agent.md file.
 * Returns the filename without the .agent.md extension.
 */
export function extractCustomAgentName(modeId: string): string | null {
	if (!modeId || !modeId.includes('.agent.md')) {
		return null;
	}

	try {
		// Resolve file:// URIs via the safe resolver; treat other values as plain paths.
		const fsPath = modeId.startsWith('file://')
			? resolveFileUri(modeId)
			: modeId;
		if (!fsPath) { return null; }

		const filename = path.basename(fsPath);

		// Remove .agent.md extension
		if (filename.endsWith('.agent.md')) {
			return filename.slice(0, -9); // Remove '.agent.md' (9 chars)
		}
		if (filename.endsWith('.md.agent.md')) {
			// Handle case like TestEngineerAgent.md.agent.md
			return filename.slice(0, -10).replace('.md', '');
		}
	} catch {
		return null;
	}

	return null;
}

// ── getEditorNameFromRoot predicates ──────────────────────────────────────────────

/** Returns true when the root folder belongs to a JetBrains IDE Copilot store. */
function isJetBrainsRoot(lower: string): boolean {
	return lower.includes('.copilot/jb');
}

/** Returns true when the root folder belongs to Copilot CLI. */
function isCopilotCliRoot(lower: string): boolean {
	return lower.includes('.copilot') || lower.includes('copilot');
}

/** Returns true when the root folder belongs to VS Code Insiders. */
function isCodeInsidersRoot(lower: string): boolean {
	return lower.includes('code - insiders') || lower.includes('code-insiders') || lower.includes('insiders');
}

/** Returns true when the root folder belongs to VS Code Exploration. */
function isCodeExplorationRoot(lower: string): boolean {
	return lower.includes('code - exploration') || lower.includes('code%20-%20exploration');
}

/** Returns true when the root folder belongs to Visual Studio. */
function isVisualStudioRoot(lower: string): boolean {
	return lower.includes('.vs') && lower.includes('copilot-chat');
}

/** Returns true when the root folder belongs to VS Code. */
function isVSCodeRoot(lower: string): boolean {
	return lower.endsWith('code') || lower.includes('/code/');
}

/**
 * Detect non-VS-Code terminal/CLI tools from a lower-cased normalised root path.
 * Returns the editor name or undefined if none matched.
 * @internal
 */
function detectToolEditorFromRootPath(lower: string): string | undefined {
	if (lower.includes('opencode')) { return 'OpenCode'; }
	if (lower.includes('.continue')) { return 'Continue'; }
	if (lower.includes('.vibe')) { return 'Mistral Vibe'; }
	// Antigravity must be checked before generic .gemini (both live under ~/.gemini/).
	if (lower.includes('.gemini/antigravity')) { return 'Antigravity'; }
	if (lower.includes('.gemini')) { return 'Gemini CLI'; }
	if (lower.includes('.pi/agent')) { return 'Pi'; }
	return undefined;
}

/**
 * Determine a friendly editor name from an editor root path (folder name)
 * e.g. 'C:\\...\\AppData\\Roaming\\Code' -> 'VS Code'
 */
export function getEditorNameFromRoot(rootPath: string): string {
	if (!rootPath) { return 'Unknown'; }
	const lower = normalizePathForComparison(rootPath);
	// Check obvious markers first (JetBrains must precede Copilot CLI)
	if (isJetBrainsRoot(lower)) { return 'JetBrains'; }
	if (isCopilotCliRoot(lower)) { return 'Copilot CLI'; }
	const toolEditor = detectToolEditorFromRootPath(lower);
	if (toolEditor) { return toolEditor; }
	if (isCodeInsidersRoot(lower)) { return 'VS Code Insiders'; }
	if (isCodeExplorationRoot(lower)) { return 'VS Code Exploration'; }
	if (lower.includes('vscodium')) { return 'VSCodium'; }
	if (lower.includes('cursor')) { return 'Cursor'; }
	if (isVisualStudioRoot(lower)) { return 'Visual Studio'; }
	// Generic 'code' match (catch AppData\\Roaming\\Code)
	if (isVSCodeRoot(lower)) { return 'VS Code'; }
	return 'Unknown';
}

/**
 * Extract a friendly display name from a repository URL.
 * Supports HTTPS, SSH, and git:// URLs.
 * @param repoUrl The full repository URL
 * @returns A shortened display name like "owner/repo"
 */
export function getRepoDisplayName(repoUrl: string): string {
	if (!repoUrl || repoUrl === 'Unknown') { return 'Unknown'; }

	// Remove .git suffix if present
	let url = repoUrl.replace(/\.git$/, '');

	// Handle SSH URLs like git@github.com:owner/repo
	if (url.includes('@') && url.includes(':')) {
		const colonIndex = url.lastIndexOf(':');
		const atIndex = url.lastIndexOf('@');
		if (colonIndex > atIndex) {
			return url.substring(colonIndex + 1);
		}
	}

	// Handle HTTPS/git URLs - extract path after the host
	try {
		if (url.includes('://')) {
			const urlObj = new URL(url);
			const pathParts = urlObj.pathname.split('/').filter(p => p);
			if (pathParts.length >= 2) {
				return `${pathParts[pathParts.length - 2]}/${pathParts[pathParts.length - 1]}`;
			}
			return urlObj.pathname.replace(/^\//, '');
		}
	} catch {
		// URL parsing failed, continue to fallback
	}

	// Fallback: return the last part of the path
	const parts = url.split('/').filter(p => p);
	if (parts.length >= 2) {
		return `${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
	}
	return url;
}

/**
 * Parse the remote origin URL from a .git/config file content.
 * Looks for [remote "origin"] section and extracts the url value.
 * @param gitConfigContent The content of a .git/config file
 * @returns The remote origin URL if found, undefined otherwise
 */
export function parseGitRemoteUrl(gitConfigContent: string): string | undefined {
	// Look for [remote "origin"] section and extract url
	const lines = gitConfigContent.split('\n');
	let inOriginSection = false;

	for (const line of lines) {
		const trimmed = line.trim();

		// Check if we're entering the [remote "origin"] section
		if (trimmed.match(/^\[remote\s+"origin"\]$/i)) {
			inOriginSection = true;
			continue;
		}

		// Check if we're leaving the section (new section starts)
		if (inOriginSection && trimmed.startsWith('[')) {
			inOriginSection = false;
			continue;
		}

		// Look for url = ... in the origin section
		if (inOriginSection) {
			const urlMatch = trimmed.match(/^url\s*=\s*(.+)$/i);
			if (urlMatch) {
				return urlMatch[1].trim();
			}
		}
	}

	return undefined;
}

/**
 * Check if a tool name indicates it's an MCP (Model Context Protocol) tool.
 * MCP tools are identified by names starting with "mcp." or "mcp_"
 * Claude Code uses double-underscore format: "mcp__server__tool"
 */
export function isMcpTool(toolName: string): boolean {
	return toolName.startsWith('mcp.') || toolName.startsWith('mcp_') || toolName.startsWith('mcp__');
}

/**
 * Normalize an MCP tool name so that equivalent tools from different servers
 * (local stdio vs remote) are counted under a single canonical key in "By Tool" views.
 * Maps mcp_github_github_<action> → mcp_io_github_git_<action>.
 */
export function normalizeMcpToolName(toolName: string): string {
	if (toolName.startsWith('mcp_github_github_')) {
		return 'mcp_io_github_git_' + toolName.substring('mcp_github_github_'.length);
	}
	if (toolName.startsWith('mcp.github.github.')) {
		return 'mcp.io.github.git.' + toolName.substring('mcp.github.github.'.length);
	}
	return toolName;
}

/**
 * Extract server name from an MCP tool name.
 * MCP tool names follow the format: mcp.server.tool or mcp_server_tool
 * Claude Code uses double-underscore format: mcp__server__tool
 * For example: "mcp.io.github.git.assign_copilot_to_issue" → "GitHub MCP"
 * Uses the display name from toolNames.json (the part before the colon).
 * Falls back to extracting the second segment if no mapping exists.
 */
export function extractMcpServerName(toolName: string, toolNameMap: { [key: string]: string } = {}): string {
	// First, try to get the display name from toolNames.json and extract the server part
	const displayName = toolNameMap[toolName] ?? toolNameMap[toolName.toLowerCase()];
	if (displayName && displayName.includes(':')) {
		// Extract the part before the colon (e.g., "GitHub MCP" from "GitHub MCP: Issue Read")
		return displayName.split(':')[0].trim();
	}

	// Fallback: recognize known MCP server prefixes for unlisted tools
	if (toolName.startsWith('mcp_io_github_git_') || toolName.startsWith('mcp.io.github.git.')) {
		return 'GitHub MCP (Local)';
	}
	if (toolName.startsWith('mcp_github_github_') || toolName.startsWith('mcp.github.github.')) {
		return 'GitHub MCP (Remote)';
	}

	// Claude Code double-underscore format: mcp__server__tool
	// e.g. "mcp__github__create_issue" → "github"
	if (toolName.startsWith('mcp__')) {
		// GUID-keyed MCP servers (e.g. tenant-specific M365 Connector)
		if (isGuidMcpTool(toolName)) {
			return 'Claude MCP';
		}
		const withoutPrefix = toolName.slice('mcp__'.length);
		const serverEnd = withoutPrefix.indexOf('__');
		const serverName = serverEnd >= 0 ? withoutPrefix.slice(0, serverEnd) : withoutPrefix;
		return serverName || 'unknown';
	}

	// Generic fallback: extract from tool name structure (mcp_ or mcp.)
	const withoutPrefix = toolName.replace(/^mcp[._]/, '');
	const parts = withoutPrefix.split(/[._]/);
	return parts[0] || 'unknown';
}

// ── extractRepositoryFromContentReferences helpers ───────────────────────────────────────

/**
 * Normalize a raw content-reference path to a native OS path.
 * VS Code URI paths on Windows start with "/c:/..." and need the leading slash removed.
 */
function normalizeWindowsUriPath(rawPath: string): string {
	return stripWindowsDriveUriPrefix(rawPath);
}

/**
 * Collect all file-system paths from an array of content-reference items.
 * Handles both `reference` and `inlineReference` kinds.
 */
function collectFilePathsFromRefs(contentReferences: ContentReferenceItem[]): string[] {
	const filePaths: string[] = [];
	for (const contentRef of contentReferences) {
		if (!contentRef || typeof contentRef !== 'object') { continue; }
		const { kind } = contentRef;
		let ref: ContentReferenceData | undefined;
		if (kind === 'reference') { ref = contentRef.reference; }
		else if (kind === 'inlineReference') { ref = contentRef.inlineReference; }
		if (!ref) { continue; }
		// Prefer fsPath (native format) over path (URI format)
		const rawPath = ref.fsPath ?? ref.path;
		if (typeof rawPath === 'string' && rawPath.length > 0) {
			filePaths.push(normalizeWindowsUriPath(rawPath));
		}
	}
	return filePaths;
}

/**
 * Build a list of potential git root directories by walking up the directory tree.
 * Returns paths ordered from deepest to shallowest.
 */
function buildPotentialGitRoots(filePath: string): string[] {
	const pathParts = splitNormalizedPath(filePath);
	const isWindowsDrive = hasWindowsDriveSegment(pathParts[0]);
	const roots: string[] = [];
	for (let i = pathParts.length - 1; i >= 1; i--) {
		let potentialRoot = pathParts.slice(0, i).join('/');
		// On Unix, the leading '/' is lost when filtering empty path parts — restore it.
		if (!isWindowsDrive && !potentialRoot.startsWith('/')) {
			potentialRoot = '/' + potentialRoot;
		}
		roots.push(potentialRoot);
	}
	return roots;
}

/**
 * Try to read the remote origin URL from a standard `.git/config` file.
 * Returns undefined if the file does not exist or contains no origin remote.
 */
async function tryReadGitConfigRemote(potentialRoot: string): Promise<string | undefined> {
	try {
		const gitConfig = await fs.promises.readFile(path.join(potentialRoot, '.git', 'config'), 'utf8');
		return parseGitRemoteUrl(gitConfig);
	} catch {
		return undefined;
	}
}

/**
 * Try to read the remote origin URL from a git worktree `.git` file.
 * A worktree `.git` is a plain file containing `gitdir: <path>`.
 * Follows the pointer up two levels to the main git directory where `config` lives.
 * Returns undefined if not a worktree or the URL cannot be determined.
 */
async function tryReadWorktreeGitRemote(potentialRoot: string): Promise<string | undefined> {
	try {
		const gitFileContent = await fs.promises.readFile(path.join(potentialRoot, '.git'), 'utf8');
		const match = gitFileContent.match(/^gitdir:\s*(.+)$/m);
		if (!match) { return undefined; }
		const gitdirPath = match[1].trim();
		const basePath = toPlatformPath(potentialRoot);
		const resolvedGitdir = path.isAbsolute(gitdirPath)
			? gitdirPath
			: path.resolve(basePath, gitdirPath);
		// Standard worktree: gitdir = <main>/.git/worktrees/<name>
		// Main .git dir is 2 levels up; its config holds the remote URL.
		const mainConfigPath = path.join(path.resolve(resolvedGitdir, '..', '..'), 'config');
		const gitConfig = await fs.promises.readFile(mainConfigPath, 'utf8');
		return parseGitRemoteUrl(gitConfig);
	} catch {
		return undefined;
	}
}

/**
 * Extract repository remote URL from file paths found in contentReferences.
 * Walks up the directory tree for each referenced file looking for `.git/config`.
 * Supports both standard repos and git worktrees.
 * @param contentReferences Array of content reference objects from session data
 * @returns The repository remote URL if found, undefined otherwise
 */
export async function extractRepositoryFromContentReferences(contentReferences: ContentReferenceItem[]): Promise<string | undefined> {
	if (!Array.isArray(contentReferences)) { return undefined; }

	const filePaths = collectFilePathsFromRefs(contentReferences);
	if (filePaths.length === 0) { return undefined; }

	const checkedRoots = new Set<string>();
	for (const filePath of filePaths) {
		for (const potentialRoot of buildPotentialGitRoots(filePath)) {
			if (checkedRoots.has(potentialRoot)) { continue; }
			checkedRoots.add(potentialRoot);
			const remoteUrl = await tryReadGitConfigRemote(potentialRoot) ??
				await tryReadWorktreeGitRemote(potentialRoot);
			if (remoteUrl) { return remoteUrl; }
		}
	}
	return undefined;
}

export function resolveWorkspaceFolderFromSessionPath(sessionFilePath: string, workspaceIdToFolderCache: Map<string, string | undefined>): string | undefined {
	try {
		// Normalize and split path into segments
		const normalized = normalizePath(sessionFilePath);
		const parts = splitNormalizedPath(sessionFilePath);
		const idx = parts.findIndex(p => p.toLowerCase() === 'workspacestorage');
		if (idx === -1 || idx + 1 >= parts.length) {
			return undefined; // Not a workspace-scoped session file
		}

		const workspaceId = parts[idx + 1];
		// Return cached value if present
		if (workspaceIdToFolderCache.has(workspaceId)) {
			return workspaceIdToFolderCache.get(workspaceId);
		}

		// Construct the workspaceStorage folder path by slicing the original normalized path
		// This preserves absolute-root semantics on both Windows and Unix.
		const workspaceSegment = `workspaceStorage/${workspaceId}`;
		const lowerNormalized = normalized.toLowerCase();
		const segmentIndex = lowerNormalized.indexOf(workspaceSegment.toLowerCase());
		if (segmentIndex === -1) {
			// Should not happen if parts detection succeeded, but guard just in case
			workspaceIdToFolderCache.set(workspaceId, undefined);
			return undefined;
		}
		const folderPathNormalized = normalized.substring(0, segmentIndex + workspaceSegment.length);
		const workspaceStorageFolder = path.normalize(folderPathNormalized);

		const workspaceJsonPath = path.join(workspaceStorageFolder, 'workspace.json');
		const metaJsonPath = path.join(workspaceStorageFolder, 'meta.json');

		let folderFsPath: string | undefined;

		if (fs.existsSync(workspaceJsonPath)) {
			folderFsPath = parseWorkspaceStorageJsonFile(workspaceJsonPath, ['folder', 'workspace', 'configuration', 'uri', 'path']);
		} else if (fs.existsSync(metaJsonPath)) {
			folderFsPath = parseWorkspaceStorageJsonFile(metaJsonPath, ['folder', 'uri', 'workspace', 'path']);
		}

		// Normalize to undefined if folderFsPath is falsy
		if (!folderFsPath || folderFsPath.length === 0) {
			workspaceIdToFolderCache.set(workspaceId, undefined);
			return undefined;
		}

		// Canonicalize path casing using the real filesystem path.
		// Different VS Code variants (Stable, Insiders, Cursor) may store the same folder with
		// different drive-letter or path casing in their workspace.json (e.g. "C:\Users\" vs "c:\users\").
		// realpathSync.native returns the true OS-level casing, so the same physical folder always
		// produces the same Map key and is deduplicated correctly.
		try {
			folderFsPath = fs.realpathSync.native(folderFsPath);
		} catch {
			// Path may not exist on disk (deleted/moved repo); keep the parsed path as-is.
		}

		workspaceIdToFolderCache.set(workspaceId, folderFsPath);
		return folderFsPath;
	} catch (err) {
		// On any error, cache undefined to avoid repeated failures
		try {
			const parts = splitNormalizedPath(sessionFilePath);
			const idx = parts.findIndex(p => p.toLowerCase() === 'workspacestorage');
			if (idx !== -1 && idx + 1 < parts.length) {
				workspaceIdToFolderCache.set(parts[idx + 1], undefined);
			}
		} catch { }
		return undefined;
	}
}

// ── Editor-detection private predicates ──────────────────────────────────────

/** Returns true for Gemini CLI session paths (`.gemini/tmp/.../chats/session-*.jsonl`). */
function isGeminiCliPath(lowerPath: string): boolean {
	return lowerPath.includes('/.gemini/tmp/') &&
		lowerPath.includes('/chats/session-') &&
		lowerPath.endsWith('.jsonl');
}

/** Returns true for VS Code Insiders path segments (`/code - insiders/` or percent-encoded). */
function isCodeInsidersPath(lowerPath: string): boolean {
	return lowerPath.includes('/code - insiders/') || lowerPath.includes('/code%20-%20insiders/');
}

/** Returns true for VS Code Exploration path segments. */
function isCodeExplorationPath(lowerPath: string): boolean {
	return lowerPath.includes('/code - exploration/') || lowerPath.includes('/code%20-%20exploration/');
}

/** Returns true for VS Code Server path segments. */
function isVSCodeServerPath(lowerPath: string): boolean {
	return lowerPath.includes('.vscode-server/') || lowerPath.includes('.vscode-remote/');
}

/** Returns true for Visual Studio path segments (`/.vs/.../copilot-chat/.../sessions/`). */
function isVisualStudioPath(lowerPath: string): boolean {
	return lowerPath.includes('/.vs/') &&
		lowerPath.includes('/copilot-chat/') &&
		lowerPath.includes('/sessions/');
}

/** Returns true for VS Code Insiders via loose substring match (used by detectEditorSource). */
function isCodeInsidersSource(lowerPath: string): boolean {
	return lowerPath.includes('code - insiders') || lowerPath.includes('code-insiders');
}

// ── getEditorTypeFromPath helpers ───────────────────────────────────────────

/**
 * Detect tool-specific (non-VS Code family) editors from a lower-cased normalised path.
 * Returns the editor name or undefined if none matched.
 * @internal
 */
function detectToolEditorFromPath(
	filePath: string,
	lowerPath: string,
	isOpenCodeSessionFile?: (p: string) => boolean
): string | undefined {
	// Check JetBrains before Copilot CLI: both live under ~/.copilot/ but jb/
	// is a sibling of session-state/ and must be attributed to the JetBrains IDE.
	if (lowerPath.includes('/.copilot/jb/')) { return 'JetBrains'; }
	if (lowerPath.includes('/.copilot/session-store.db#')) { return 'Copilot CLI'; }
	if (lowerPath.includes('/.copilot/session-state/')) { return 'Copilot CLI'; }
	if (isOpenCodeSessionFile?.(filePath)) { return 'OpenCode'; }
	if (lowerPath.includes('/.crush/crush.db#')) { return 'Crush'; }
	// Cursor virtual paths must be checked before the generic /cursor/ match in detectVSCodeVariantFromPath.
	if (lowerPath.includes('/cursor/user/globalstorage/state.vscdb#')) { return 'Cursor'; }
	if (lowerPath.includes('/.pi/agent/sessions/')) { return 'Pi'; }
	if (lowerPath.includes('/.continue/sessions/')) { return 'Continue'; }
	if (lowerPath.includes('/local-agent-mode-sessions/')) { return 'Claude Desktop Cowork'; }
	if (lowerPath.includes('/.claude/projects/')) { return 'Claude Code'; }
	if (lowerPath.includes('/.vibe/logs/session/')) { return 'Mistral Vibe'; }
	// Antigravity must be checked before Gemini CLI: both live under ~/.gemini/
	// but Antigravity sessions are under ~/.gemini/antigravity/brain/ which is more specific.
	if (lowerPath.includes('/.gemini/antigravity/brain/')) { return 'Antigravity'; }
	if (isGeminiCliPath(lowerPath)) { return 'Gemini CLI'; }
	return undefined;
}

/**
 * Detect VS Code family editors (including Cursor, VSCodium, VS Code Server, Visual Studio)
 * from a lower-cased normalised path.
 * Returns the editor name or undefined if none matched.
 * @internal
 */
function detectVSCodeVariantFromPath(lowerPath: string): string | undefined {
	if (isCodeInsidersPath(lowerPath)) { return 'VS Code Insiders'; }
	if (isCodeExplorationPath(lowerPath)) { return 'VS Code Exploration'; }
	if (lowerPath.includes('/vscodium/')) { return 'VSCodium'; }
	if (lowerPath.includes('/cursor/')) { return 'Cursor'; }
	if (lowerPath.includes('.vscode-server-insiders/')) { return 'VS Code Server (Insiders)'; }
	if (isVSCodeServerPath(lowerPath)) { return 'VS Code Server'; }
	if (isVisualStudioPath(lowerPath)) { return 'Visual Studio'; }
	if (lowerPath.includes('/code/')) { return 'VS Code'; }
	return undefined;
}

/**
 * Determine the editor type from a session file path.
 * Returns: 'VS Code', 'VS Code Insiders', 'VSCodium', 'Cursor', 'Copilot CLI',
 *          'JetBrains', 'OpenCode', 'Claude Code', 'Continue', 'Mistral Vibe',
 *          'Gemini CLI', 'Claude Desktop Cowork', 'Crush', or 'Unknown'.
 */
export function getEditorTypeFromPath(filePath: string, isOpenCodeSessionFile?: (p: string) => boolean): string {
	const lowerPath = normalizePathForComparison(filePath);
	if (lowerPath.startsWith('windsurf://')) { return 'Windsurf'; }
	return detectToolEditorFromPath(filePath, lowerPath, isOpenCodeSessionFile) ??
		detectVSCodeVariantFromPath(lowerPath) ??
		'Unknown';
}

// ── detectEditorSource helper ──────────────────────────────────────────

/**
 * Detect VS Code family and related IDE editors via loose substring matching.
 * Used by detectEditorSource which uses broader (no-slash) patterns.
 * @internal
 */
function detectIDEEditorSource(lowerPath: string): string | undefined {
	if (lowerPath.includes('cursor')) { return 'Cursor'; }
	if (isCodeInsidersSource(lowerPath)) { return 'VS Code Insiders'; }
	if (lowerPath.includes('vscodium')) { return 'VSCodium'; }
	if (lowerPath.includes('windsurf')) { return 'Windsurf'; }
	if (isVisualStudioPath(lowerPath)) { return 'Visual Studio'; }
	if (lowerPath.includes('code')) { return 'VS Code'; }
	return undefined;
}

/**
 * Determine which editor the session file belongs to based on its path.
 */
export function detectEditorSource(filePath: string, isOpenCodeSessionFile?: (p: string) => boolean): string {
	const lowerPath = normalizePathForComparison(filePath);
	if (lowerPath.startsWith('windsurf://')) { return 'Windsurf'; }
	// Delegate to the shared tool-editor detector (handles JetBrains, Copilot CLI, OpenCode,
	// Crush, Pi, Continue, Claude, Vibe, Antigravity, Gemini CLI).
	return detectToolEditorFromPath(filePath, lowerPath, isOpenCodeSessionFile) ??
		detectIDEEditorSource(lowerPath) ?? 'Unknown';
}

