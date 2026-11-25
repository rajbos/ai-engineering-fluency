/**
 * Detects whether a code-graph or symbol-lookup tool is set up, on this machine or in a
 * workspace folder: a skill folder, an MCP server entry or the tool's own output folder.
 * The Repository Heatmap uses it to tailor the tip it shows next to re-read files.
 *
 * This only answers "is it installed"; whether agents actually use it shows in the heatmap
 * itself, as re-reads going down. The tool catalog is `codeNavTools.json`.
 */
import * as fs from 'fs';
import * as path from 'path';
import catalog from './codeNavTools.json';

export interface CodeNavTool {
	id: string;
	name: string;
	url: string;
}

/** Where a tool was found: for the whole user account, or in one of the given workspace folders. */
export type CodeNavToolScope = 'user' | 'workspace';

export interface DetectedCodeNavTool extends CodeNavTool {
	scope: CodeNavToolScope;
}

/** Every tool the tip can suggest, in catalog order. */
export const CODE_NAV_TOOLS: CodeNavTool[] = catalog.tools.map(({ id, name, url }) => ({ id, name, url }));

async function exists(target: string): Promise<boolean> {
	try { await fs.promises.access(target); return true; } catch { return false; }
}

/**
 * True when an MCP config file names one of `servers` as a key. A text match rather than a
 * JSON parse: these files are often JSONC, and only the server's name matters here.
 */
async function configNamesServer(file: string, servers: string[]): Promise<boolean> {
	let text: string;
	try { text = await fs.promises.readFile(file, 'utf8'); } catch { return false; }
	const lower = text.toLowerCase();
	return servers.some(server => {
		const key = `"${server.toLowerCase()}"`;
		for (let at = lower.indexOf(key); at >= 0; at = lower.indexOf(key, at + 1)) {
			if (lower.slice(at + key.length).trimStart().startsWith(':')) { return true; }
		}
		return false;
	});
}

type CatalogTool = (typeof catalog.tools)[number];

async function foundIn(root: string, scope: CodeNavToolScope, tool: CatalogTool): Promise<boolean> {
	const candidates = catalog.skillRoots[scope].flatMap(dir => tool.skillNames.map(name => path.join(root, dir, name, 'SKILL.md')));
	if (scope === 'workspace') { candidates.push(...tool.workspaceMarkers.map(marker => path.join(root, marker))); }
	for (const candidate of candidates) { if (await exists(candidate)) { return true; } }
	for (const config of catalog.mcpConfigs[scope]) {
		if (await configNamesServer(path.join(root, config), tool.mcpServers)) { return true; }
	}
	return false;
}

/**
 * The catalog tools set up for the user (`homeDir`) or in any of `workspaceFolders`. A tool
 * found in both is reported once, as `user`. Unreadable locations count as not found.
 */
export async function detectCodeNavTools(homeDir: string, workspaceFolders: string[]): Promise<DetectedCodeNavTool[]> {
	const detected: DetectedCodeNavTool[] = [];
	for (const tool of catalog.tools) {
		const { id, name, url } = tool;
		if (await foundIn(homeDir, 'user', tool)) { detected.push({ id, name, url, scope: 'user' }); continue; }
		for (const folder of workspaceFolders) {
			if (await foundIn(folder, 'workspace', tool)) { detected.push({ id, name, url, scope: 'workspace' }); break; }
		}
	}
	return detected;
}
