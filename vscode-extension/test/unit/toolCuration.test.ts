import test, { after } from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import {
	enumerateRuntimeTools,
	enumerateExtensionMcpServers,
	parseMcpJson,
	buildMcpEntriesFromJson,
	buildMcpEntriesFromSettings,
	discoverSkillEntries,
	analyzeToolCuration,
	extractDescriptionFromSkillContent,
	type RuntimeToolInfo,
	type ExtensionInfo,
} from '../../src/toolCuration';
import type { UsageAnalysisPeriod } from '../../src/types';

// ---------------------------------------------------------------------------
// Temp directory registry — all dirs created via mkTmpDir() are removed after
// the entire test suite completes (avoids accumulation in CI and dev machines).
// ---------------------------------------------------------------------------

const _tmpDirs: string[] = [];
function mkTmpDir(prefix: string): string {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
	_tmpDirs.push(dir);
	return dir;
}
after(() => {
	for (const dir of _tmpDirs) {
		fs.rmSync(dir, { recursive: true, force: true });
	}
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Minimal UsageAnalysisPeriod with no usage. */
function emptyPeriod(): UsageAnalysisPeriod {
	return {
		sessions: 0,
		toolCalls: { total: 0, byTool: {} },
		modeUsage: { ask: 0, edit: 0, agent: 0, plan: 0, customAgent: 0, cli: 0 },
		contextReferences: {
			file: 0, selection: 0, implicitSelection: 0, symbol: 0, codebase: 0,
			workspace: 0, terminal: 0, vscode: 0, terminalLastCommand: 0,
			terminalSelection: 0, clipboard: 0, changes: 0, outputPanel: 0,
			problemsPanel: 0, pullRequest: 0, codeContextLines: 0, byKind: {}, byPath: {},
			copilotInstructions: 0, agentsMd: 0,
		},
		mcpTools: { total: 0, byServer: {}, byTool: {} },
		modelSwitching: {
			modelsPerSession: [], totalSessions: 0, averageModelsPerSession: 0,
			maxModelsPerSession: 0, minModelsPerSession: 0, switchingFrequency: 0,
			standardModels: [], premiumModels: [], unknownModels: [], mixedTierSessions: 0,
			standardRequests: 0, premiumRequests: 0, unknownRequests: 0, totalRequests: 0,
			lowCostModels: [], mediumCostModels: [], highCostModels: [], mixedCostSessions: 0,
			lowCostRequests: 0, mediumCostRequests: 0, highCostRequests: 0,
			autoSessions: 0, foundryWindowsSessions: 0, unknownProviderSessions: 0,
			selectedModelExtensions: [], unknownProviderModels: [],
		},
		repositories: [], repositoriesWithCustomization: [],
		editScope: { singleFileEdits: 0, multiFileEdits: 0, totalEditedFiles: 0, avgFilesPerSession: 0 },
		applyUsage: { totalApplies: 0, totalCodeBlocks: 0, applyRate: 0 },
		sessionDuration: { totalDurationMs: 0, avgDurationMs: 0, avgFirstProgressMs: 0, avgTotalElapsedMs: 0, avgWaitTimeMs: 0, activeDurationMs: 0 },
		conversationPatterns: { multiTurnSessions: 0, singleTurnSessions: 0, avgTurnsPerSession: 0, maxTurnsInSession: 0 },
		agentTypes: { editsAgent: 0, defaultAgent: 0, workspaceAgent: 0, other: 0 },
	};
}

/**
 * Redirect HOME/USERPROFILE to an isolated empty temp dir for the duration of `fn`,
 * then restore the originals.  Prevents user-level skill dirs (~/.agents/skills/ etc.)
 * from leaking into workspace-isolation tests.
 */
function withIsolatedHome<T>(fn: () => T): T {
	const isolatedHome = mkTmpDir('ctt-isolated-home-');
	const origUserProfile = process.env.USERPROFILE;
	const origHome = process.env.HOME;
	process.env.USERPROFILE = isolatedHome;
	process.env.HOME = isolatedHome;
	try {
		return fn();
	} finally {
		if (origUserProfile === undefined) { delete process.env.USERPROFILE; } else { process.env.USERPROFILE = origUserProfile; }
		if (origHome === undefined) { delete process.env.HOME; } else { process.env.HOME = origHome; }
		fs.rmSync(isolatedHome, { recursive: true, force: true });
	}
}

/** Write a minimal mcp.json to the given path (creates parent dirs). */
function writeMcpJson(filePath: string, serverNames: string[]): void {
	fs.mkdirSync(path.dirname(filePath), { recursive: true });
	const servers: Record<string, { command: string }> = {};
	for (const name of serverNames) {
		servers[name] = { command: `npx ${name}` };
	}
	fs.writeFileSync(filePath, JSON.stringify({ servers }), 'utf8');
}

/** Write a SKILL.md under `<skillsDir>/<skillName>/SKILL.md`. */
function writeSkill(skillsDir: string, skillName: string, description?: string): void {
	const skillDir = path.join(skillsDir, skillName);
	fs.mkdirSync(skillDir, { recursive: true });
	const content = description
		? `description: ${description}\n`
		: `# ${skillName}\n\nSome skill content.\n`;
	fs.writeFileSync(path.join(skillDir, 'SKILL.md'), content, 'utf8');
}

// ---------------------------------------------------------------------------
// enumerateRuntimeTools
// ---------------------------------------------------------------------------

test('enumerateRuntimeTools: maps builtin tools correctly', () => {
	const tools: RuntimeToolInfo[] = [
		{ name: 'github_create_issue', description: 'Create a GitHub issue' },
	];
	const result = enumerateRuntimeTools(tools);
	assert.equal(result.length, 1);
	assert.equal(result[0].source, 'builtin');
	assert.equal(result[0].name, 'github_create_issue');
	assert.equal(result[0].description, 'Create a GitHub issue');
	assert.equal(result[0].server, undefined);
});

test('enumerateRuntimeTools: maps MCP tools and extracts server name', () => {
	const tools: RuntimeToolInfo[] = [
		{ name: 'mcp__my-server__do_thing', description: 'Does a thing' },
	];
	const result = enumerateRuntimeTools(tools);
	assert.equal(result.length, 1);
	assert.equal(result[0].source, 'mcp');
	assert.equal(result[0].server, 'my-server');
});

test('enumerateRuntimeTools: returns empty array for empty input', () => {
	assert.deepEqual(enumerateRuntimeTools([]), []);
});

// ---------------------------------------------------------------------------
// enumerateExtensionMcpServers
// ---------------------------------------------------------------------------

test('enumerateExtensionMcpServers: returns empty array for no extensions', () => {
	assert.deepEqual(enumerateExtensionMcpServers([]), []);
});

test('enumerateExtensionMcpServers: ignores extensions without mcpServers contribution', () => {
	const ext: ExtensionInfo = { id: 'ms.some-ext', isActive: true, packageJSON: { contributes: {} } };
	assert.deepEqual(enumerateExtensionMcpServers([ext]), []);
});

test('enumerateExtensionMcpServers: returns entry for each contributed server', () => {
	const ext: ExtensionInfo = {
		id: 'ms.my-ext',
		displayName: 'My Extension',
		isActive: true,
		packageJSON: {
			displayName: 'My Extension',
			contributes: {
				mcpServers: {
					'my-server': { command: 'node', args: ['server.js'] },
					'another-server': { label: 'Another', command: 'npx', args: ['another'] },
				},
			},
		},
	};
	const result = enumerateExtensionMcpServers([ext]);
	assert.equal(result.length, 2);
	const serverNames = result.map(e => e.server).sort();
	assert.deepEqual(serverNames, ['another-server', 'my-server']);
	assert.ok(result.every(e => e.source === 'mcp'), 'all entries should have source mcp');
	assert.ok(result.every(e => e.extensionId === 'ms.my-ext'), 'all entries should reference the extension id');
});

test('enumerateExtensionMcpServers: uses server label in description when available', () => {
	const ext: ExtensionInfo = {
		id: 'ms.my-ext',
		isActive: true,
		packageJSON: {
			contributes: {
				mcpServers: { 'srv': { label: 'Friendly Name' } },
			},
		},
	};
	const result = enumerateExtensionMcpServers([ext]);
	assert.equal(result.length, 1);
	assert.ok(result[0].description.includes('Friendly Name'), 'description should include server label');
});

test('enumerateExtensionMcpServers: collects servers from multiple extensions', () => {
	const extA: ExtensionInfo = {
		id: 'pub.ext-a', isActive: true,
		packageJSON: { contributes: { mcpServers: { 'server-a': {} } } },
	};
	const extB: ExtensionInfo = {
		id: 'pub.ext-b', isActive: false,
		packageJSON: { contributes: { mcpServers: { 'server-b': {} } } },
	};
	const result = enumerateExtensionMcpServers([extA, extB]);
	assert.equal(result.length, 2);
	assert.ok(result.some(e => e.server === 'server-a' && e.extensionId === 'pub.ext-a'));
	assert.ok(result.some(e => e.server === 'server-b' && e.extensionId === 'pub.ext-b'));
});

test('enumerateExtensionMcpServers: marks enabled flag from runtime server set', () => {
	const ext: ExtensionInfo = {
		id: 'pub.ext', isActive: true,
		packageJSON: { contributes: { mcpServers: { 'on-server': {}, 'off-server': {} } } },
	};
	const result = enumerateExtensionMcpServers([ext], new Set(['on-server']));
	const on = result.find(e => e.server === 'on-server');
	const off = result.find(e => e.server === 'off-server');
	assert.equal(on?.enabled, true, 'server present in runtime set should be marked enabled');
	assert.equal(off?.enabled, false, 'server absent from runtime set should be marked disabled');
});

test('enumerateExtensionMcpServers: propagates extensionActive from ExtensionInfo', () => {
	const active: ExtensionInfo = {
		id: 'pub.active', isActive: true,
		packageJSON: { contributes: { mcpServers: { 's1': {} } } },
	};
	const inactive: ExtensionInfo = {
		id: 'pub.inactive', isActive: false,
		packageJSON: { contributes: { mcpServers: { 's2': {} } } },
	};
	const result = enumerateExtensionMcpServers([active, inactive]);
	assert.equal(result.find(e => e.server === 's1')?.extensionActive, true);
	assert.equal(result.find(e => e.server === 's2')?.extensionActive, false);
});

test('enumerateExtensionMcpServers: defaults enabled to false when no runtime set provided', () => {
	const ext: ExtensionInfo = {
		id: 'pub.ext', isActive: true,
		packageJSON: { contributes: { mcpServers: { 's': {} } } },
	};
	const result = enumerateExtensionMcpServers([ext]);
	assert.equal(result[0].enabled, false);
});

// ---------------------------------------------------------------------------
// buildMcpEntriesFromSettings
// ---------------------------------------------------------------------------

test('buildMcpEntriesFromSettings: returns empty array for empty object', () => {
	assert.deepEqual(buildMcpEntriesFromSettings({}), []);
});

test('buildMcpEntriesFromSettings: returns entry for each settings server', () => {
	const servers = {
		'settings-server': { command: 'node', args: ['s.js'] },
		'another-settings-server': { url: 'http://localhost:3000' },
	};
	const result = buildMcpEntriesFromSettings(servers);
	assert.equal(result.length, 2);
	const names = result.map(e => e.server).sort();
	assert.deepEqual(names, ['another-settings-server', 'settings-server']);
	assert.ok(result.every(e => e.source === 'mcp'), 'source should be mcp');
});

// ---------------------------------------------------------------------------
// parseMcpJson
// ---------------------------------------------------------------------------

test('parseMcpJson: returns empty array for non-existent file', () => {
	assert.deepEqual(parseMcpJson('/does/not/exist/mcp.json'), []);
});

test('parseMcpJson: parses server names from valid file', () => {
	const tmpDir = mkTmpDir('ctt-mcp-');
	const mcpPath = path.join(tmpDir, 'mcp.json');
	writeMcpJson(mcpPath, ['server-a', 'server-b']);
	const result = parseMcpJson(mcpPath);
	assert.deepEqual(result.sort(), ['server-a', 'server-b']);
});

test('parseMcpJson: returns empty array for file with no servers key', () => {
	const tmpDir = mkTmpDir('ctt-mcp-noservers-');
	const mcpPath = path.join(tmpDir, 'mcp.json');
	fs.writeFileSync(mcpPath, JSON.stringify({ inputs: [] }), 'utf8');
	assert.deepEqual(parseMcpJson(mcpPath), []);
});

test('parseMcpJson: returns empty array for malformed JSON', () => {
	const tmpDir = mkTmpDir('ctt-mcp-bad-');
	const mcpPath = path.join(tmpDir, 'mcp.json');
	fs.writeFileSync(mcpPath, '{ not valid json', 'utf8');
	assert.deepEqual(parseMcpJson(mcpPath), []);
});

// ---------------------------------------------------------------------------
// buildMcpEntriesFromJson — VS Code location (.vscode/mcp.json)
// ---------------------------------------------------------------------------

test('buildMcpEntriesFromJson: discovers servers from .vscode/mcp.json', () => {
	const tmpDir = mkTmpDir('ctt-mcp-vscode-');
	writeMcpJson(path.join(tmpDir, '.vscode', 'mcp.json'), ['vscode-server']);

	const result = buildMcpEntriesFromJson([tmpDir]);

	const names = result.map(e => e.server);
	assert.ok(names.includes('vscode-server'), 'should find .vscode/mcp.json server');
});

// ---------------------------------------------------------------------------
// buildMcpEntriesFromJson — Visual Studio locations
// ---------------------------------------------------------------------------

test('buildMcpEntriesFromJson: discovers servers from .mcp.json (VS repo-root)', () => {
	const tmpDir = mkTmpDir('ctt-mcp-vsroot-');
	writeMcpJson(path.join(tmpDir, '.mcp.json'), ['vs-root-server']);

	const result = buildMcpEntriesFromJson([tmpDir]);

	const names = result.map(e => e.server);
	assert.ok(names.includes('vs-root-server'), 'should find .mcp.json at repo root');
});

test('buildMcpEntriesFromJson: discovers servers from .vs/mcp.json (VS solution-scoped)', () => {
	const tmpDir = mkTmpDir('ctt-mcp-vs-');
	writeMcpJson(path.join(tmpDir, '.vs', 'mcp.json'), ['vs-solution-server']);

	const result = buildMcpEntriesFromJson([tmpDir]);

	const names = result.map(e => e.server);
	assert.ok(names.includes('vs-solution-server'), 'should find .vs/mcp.json server');
});

test('buildMcpEntriesFromJson: discovers servers from .cursor/mcp.json', () => {
	const tmpDir = mkTmpDir('ctt-mcp-cursor-');
	writeMcpJson(path.join(tmpDir, '.cursor', 'mcp.json'), ['cursor-server']);

	const result = buildMcpEntriesFromJson([tmpDir]);

	const names = result.map(e => e.server);
	assert.ok(names.includes('cursor-server'), 'should find .cursor/mcp.json server');
});

test('buildMcpEntriesFromJson: deduplicates servers appearing in multiple config files', () => {
	const tmpDir = mkTmpDir('ctt-mcp-dedup-');
	// Same server name in two locations
	writeMcpJson(path.join(tmpDir, '.vscode', 'mcp.json'), ['shared-server', 'vscode-only']);
	writeMcpJson(path.join(tmpDir, '.mcp.json'), ['shared-server', 'root-only']);

	const result = buildMcpEntriesFromJson([tmpDir]);

	const serverNames = result.map(e => e.server);
	const uniqueNames = new Set(serverNames);
	assert.equal(uniqueNames.size, serverNames.length, 'should not have duplicate servers');
	assert.ok(serverNames.includes('shared-server'));
	assert.ok(serverNames.includes('vscode-only'));
	assert.ok(serverNames.includes('root-only'));
});

test('buildMcpEntriesFromJson: deduplicates across multiple workspace folders', () => {
	const tmpA = mkTmpDir('ctt-mcp-wsa-');
	const tmpB = mkTmpDir('ctt-mcp-wsb-');
	writeMcpJson(path.join(tmpA, '.vscode', 'mcp.json'), ['shared', 'only-a']);
	writeMcpJson(path.join(tmpB, '.vscode', 'mcp.json'), ['shared', 'only-b']);

	const result = buildMcpEntriesFromJson([tmpA, tmpB]);

	const serverNames = result.map(e => e.server);
	const unique = [...new Set(serverNames)];
	assert.equal(unique.length, serverNames.length, 'no duplicates across workspace folders');
	assert.equal(serverNames.filter(n => n === 'shared').length, 1);
});

test('buildMcpEntriesFromJson: returns empty array when no config files exist', () => {
	withIsolatedHome(() => {
		const tmpDir = mkTmpDir('ctt-mcp-empty-');
		assert.deepEqual(buildMcpEntriesFromJson([tmpDir]), []);
	});
});

test('buildMcpEntriesFromJson: result entries have correct shape', () => {
	withIsolatedHome(() => {
		const tmpDir = mkTmpDir('ctt-mcp-shape-');
		writeMcpJson(path.join(tmpDir, '.vscode', 'mcp.json'), ['my-server']);

		const result = buildMcpEntriesFromJson([tmpDir]);

		assert.equal(result.length, 1);
		assert.equal(result[0].name, 'mcp__my-server');
		assert.equal(result[0].source, 'mcp');
		assert.equal(result[0].server, 'my-server');
		assert.ok(result[0].description.includes('my-server'));
	});
});

// ---------------------------------------------------------------------------
// discoverSkillEntries — VS Code location (.github/skills/)
// ---------------------------------------------------------------------------

test('discoverSkillEntries: discovers skills from .github/skills/', () => {
	withIsolatedHome(() => {
		const tmpDir = mkTmpDir('ctt-skills-github-');
		writeSkill(path.join(tmpDir, '.github', 'skills'), 'my-skill', 'Does something useful');

		const result = discoverSkillEntries([tmpDir]);

		assert.equal(result.length, 1);
		assert.equal(result[0].name, 'my-skill');
		assert.equal(result[0].source, 'skill');
		assert.ok(result[0].description.includes('Does something useful'));
	});
});

// ---------------------------------------------------------------------------
// discoverSkillEntries — Visual Studio additional workspace locations
// ---------------------------------------------------------------------------

test('discoverSkillEntries: discovers skills from .claude/skills/ (Visual Studio)', () => {
	withIsolatedHome(() => {
		const tmpDir = mkTmpDir('ctt-skills-claude-');
		writeSkill(path.join(tmpDir, '.claude', 'skills'), 'claude-skill');

		const result = discoverSkillEntries([tmpDir]);

		const names = result.map(s => s.name);
		assert.ok(names.includes('claude-skill'), 'should find .claude/skills/ skill');
	});
});

test('discoverSkillEntries: discovers skills from .agents/skills/ (Visual Studio)', () => {
	withIsolatedHome(() => {
		const tmpDir = mkTmpDir('ctt-skills-agents-');
		writeSkill(path.join(tmpDir, '.agents', 'skills'), 'agents-skill');

		const result = discoverSkillEntries([tmpDir]);

		const names = result.map(s => s.name);
		assert.ok(names.includes('agents-skill'), 'should find .agents/skills/ skill');
	});
});

test('discoverSkillEntries: discovers skills from all three workspace locations', () => {
	withIsolatedHome(() => {
		const tmpDir = mkTmpDir('ctt-skills-all-');
		writeSkill(path.join(tmpDir, '.github', 'skills'), 'github-skill');
		writeSkill(path.join(tmpDir, '.claude', 'skills'), 'claude-skill');
		writeSkill(path.join(tmpDir, '.agents', 'skills'), 'agents-skill');

		const result = discoverSkillEntries([tmpDir]);

		const names = result.map(s => s.name);
		assert.ok(names.includes('github-skill'));
		assert.ok(names.includes('claude-skill'));
		assert.ok(names.includes('agents-skill'));
		assert.equal(result.length, 3);
	});
});

test('discoverSkillEntries: deduplicates skills with the same SKILL.md path', () => {
	withIsolatedHome(() => {
		const tmpDir = mkTmpDir('ctt-skills-dedup-');
		// Same skill name in two different location dirs — different paths, no dedup expected
		writeSkill(path.join(tmpDir, '.github', 'skills'), 'my-skill');
		writeSkill(path.join(tmpDir, '.claude', 'skills'), 'my-skill');

		const result = discoverSkillEntries([tmpDir]);

		// Two different SKILL.md paths, so both are included
		assert.equal(result.filter(s => s.name === 'my-skill').length, 2);
	});
});

test('discoverSkillEntries: deduplicates across multiple workspace folders', () => {
	withIsolatedHome(() => {
		const tmpA = mkTmpDir('ctt-skills-wsa-');
		const tmpB = mkTmpDir('ctt-skills-wsb-');
		writeSkill(path.join(tmpA, '.github', 'skills'), 'skill-a');
		writeSkill(path.join(tmpB, '.github', 'skills'), 'skill-b');

		const result = discoverSkillEntries([tmpA, tmpB]);

		const names = result.map(s => s.name);
		assert.ok(names.includes('skill-a'));
		assert.ok(names.includes('skill-b'));
	});
});

test('discoverSkillEntries: returns empty array when no skill dirs exist', () => {
	withIsolatedHome(() => {
		const tmpDir = mkTmpDir('ctt-skills-none-');
		assert.deepEqual(discoverSkillEntries([tmpDir]), []);
	});
});

test('discoverSkillEntries: ignores entries without SKILL.md', () => {
	withIsolatedHome(() => {
		const tmpDir = mkTmpDir('ctt-skills-nomd-');
		const skillsDir = path.join(tmpDir, '.github', 'skills');
		// Create a sub-directory but without SKILL.md
		fs.mkdirSync(path.join(skillsDir, 'not-a-skill'), { recursive: true });
		fs.writeFileSync(path.join(skillsDir, 'not-a-skill', 'README.md'), '# not a skill', 'utf8');

		const result = discoverSkillEntries([tmpDir]);

		assert.deepEqual(result, []);
	});
});

// ---------------------------------------------------------------------------
// extractDescriptionFromSkillContent — YAML frontmatter parsing
// ---------------------------------------------------------------------------

test('extractDescriptionFromSkillContent: inline description value', () => {
	const content = `---
description: Short description here
---
# Heading
`;
	assert.equal(extractDescriptionFromSkillContent(content), 'Short description here');
});

test('extractDescriptionFromSkillContent: inline quoted description', () => {
	const content = `---
description: "Quoted description"
---
`;
	assert.equal(extractDescriptionFromSkillContent(content), 'Quoted description');
});

test('extractDescriptionFromSkillContent: folded block scalar >- (flowstudio-style)', () => {
	// Real-world format from flowstudio-power-automate-debug
	const content = [
		'---',
		'description: >-',
		'  Debug failing Power Automate cloud flows using the FlowStudio MCP server.',
		'  The Graph API only shows top-level status codes. This skill gives your agent',
		'  action-level inputs and outputs to find the actual root cause.',
		'---',
		'',
	].join('\n');
	const result = extractDescriptionFromSkillContent(content);
	assert.ok(result?.startsWith('Debug failing Power Automate'), `got: ${result}`);
	// Folded: lines joined with a space, no leading/trailing whitespace
	assert.ok(!result?.includes('\n'), 'folded block should have no newlines in result');
	assert.ok(result?.includes('FlowStudio MCP server. The Graph API'), 'lines should be space-joined');
});

test('extractDescriptionFromSkillContent: folded block scalar > (clip chomping)', () => {
	const content = [
		'---',
		'description: >',
		'  First line of the description.',
		'  Second line continues here.',
		'---',
	].join('\n');
	const result = extractDescriptionFromSkillContent(content);
	assert.equal(result, 'First line of the description. Second line continues here.');
});

test('extractDescriptionFromSkillContent: literal block scalar | (pipe)', () => {
	// Real-world format from agent-governance, agent-supply-chain etc.
	const content = [
		'---',
		'description: |',
		'  Governs agentic workflows in compliance with policy.',
		'  Validates against supply chain and OWASP rules.',
		'---',
	].join('\n');
	const result = extractDescriptionFromSkillContent(content);
	assert.ok(result?.startsWith('Governs agentic workflows'), `got: ${result}`);
	// Literal: lines joined with newline
	assert.ok(result?.includes('\n'), 'literal block should preserve newlines');
});

test('extractDescriptionFromSkillContent: literal block scalar |- (strip chomping)', () => {
	const content = [
		'---',
		'description: |-',
		'  Evaluate agentic test suites.',
		'---',
	].join('\n');
	assert.equal(extractDescriptionFromSkillContent(content), 'Evaluate agentic test suites.');
});

test('extractDescriptionFromSkillContent: literal block scalar |> (|> is treated as literal)', () => {
	const content = [
		'---',
		'description: |>',
		'  Supply chain monitoring for AI agents.',
		'---',
	].join('\n');
	const result = extractDescriptionFromSkillContent(content);
	assert.equal(result, 'Supply chain monitoring for AI agents.');
});

test('extractDescriptionFromSkillContent: multi-key frontmatter, description in the middle', () => {
	const content = [
		'---',
		'name: my-skill',
		'description: >-',
		'  The real description across',
		'  two lines.',
		'version: 1',
		'---',
	].join('\n');
	const result = extractDescriptionFromSkillContent(content);
	assert.equal(result, 'The real description across two lines.');
});

test('extractDescriptionFromSkillContent: no frontmatter, falls back to inline description:', () => {
	const content = 'description: Fallback inline description\n\nSome body text.\n';
	assert.equal(extractDescriptionFromSkillContent(content), 'Fallback inline description');
});

test('extractDescriptionFromSkillContent: no frontmatter, falls back to first heading', () => {
	const content = '# My Skill Title\n\nSome body text without a description key.\n';
	assert.equal(extractDescriptionFromSkillContent(content), 'My Skill Title');
});

test('extractDescriptionFromSkillContent: empty content returns undefined', () => {
	assert.equal(extractDescriptionFromSkillContent(''), undefined);
});

test('extractDescriptionFromSkillContent: frontmatter with no description key falls back to heading', () => {
	const content = `---
name: no-desc-skill
---
# Heading Fallback
`;
	assert.equal(extractDescriptionFromSkillContent(content), 'Heading Fallback');
});

test('extractDescriptionFromSkillContent: BOM-prefixed file parsed correctly', () => {
	// Some editors write a UTF-8 BOM (\uFEFF) at the start
	const content = '\uFEFF---\ndescription: BOM-prefixed description\n---\n';
	assert.equal(extractDescriptionFromSkillContent(content), 'BOM-prefixed description');
});

test('extractDescriptionFromSkillContent: block scalar body ending at same-level key', () => {
	// Ensures the body collector stops at the next same-indentation key
	const content = [
		'---',
		'description: >-',
		'  Line one.',
		'  Line two.',
		'other: value',
		'---',
	].join('\n');
	const result = extractDescriptionFromSkillContent(content);
	assert.equal(result, 'Line one. Line two.');
	assert.ok(!result?.includes('other'), 'should not include the next key');
});

// ---------------------------------------------------------------------------

test('discoverSkillEntries: extracts description from SKILL.md', () => {
	withIsolatedHome(() => {
		const tmpDir = mkTmpDir('ctt-skills-desc-');
		writeSkill(path.join(tmpDir, '.github', 'skills'), 'desc-skill', 'This is the skill description');

		const result = discoverSkillEntries([tmpDir]);

		assert.equal(result.length, 1);
		assert.ok(result[0].description.includes('This is the skill description'));
	});
});

test('discoverSkillEntries: falls back to "Skill: <name>" when no description found', () => {
	withIsolatedHome(() => {
		const tmpDir = mkTmpDir('ctt-skills-fallback-');
		const skillsDir = path.join(tmpDir, '.github', 'skills', 'plain-skill');
		fs.mkdirSync(skillsDir, { recursive: true });
		fs.writeFileSync(path.join(skillsDir, 'SKILL.md'), 'Just some text without a description line.\n', 'utf8');

		const result = discoverSkillEntries([tmpDir]);

		assert.equal(result.length, 1);
		assert.equal(result[0].description, 'Skill: plain-skill');
	});
});

test('discoverSkillEntries: skillPath is relative and uses forward slashes', () => {
	withIsolatedHome(() => {
		const tmpDir = mkTmpDir('ctt-skills-relpath-');
		writeSkill(path.join(tmpDir, '.github', 'skills'), 'rel-skill');

		const result = discoverSkillEntries([tmpDir]);

		assert.equal(result.length, 1);
		assert.ok(!result[0].skillPath?.includes('\\'), 'skillPath should use forward slashes');
		assert.ok(result[0].skillPath?.startsWith('.github/skills/'));
	});
});

test('discoverSkillEntries: includes user-level skills from home dir', () => {
	withIsolatedHome(() => {
		const home = process.env.USERPROFILE ?? process.env.HOME ?? '';
		// Write a skill under ~/.agents/skills/ in our isolated home
		writeSkill(path.join(home, '.agents', 'skills'), 'user-level-skill', 'A user skill');

		const result = discoverSkillEntries([]); // no workspace folders

		const names = result.map(s => s.name);
		assert.ok(names.includes('user-level-skill'), 'should discover skills from user-level dirs');
	});
});

test('discoverSkillEntries: includes skills from installed agent-plugins via installed.json', () => {
	withIsolatedHome(() => {
		const home = process.env.USERPROFILE ?? process.env.HOME ?? '';
		const pluginHome = path.join(home, '.vscode', 'agent-plugins');
		const pluginDir = path.join(pluginHome, 'github.com', 'owner', 'repo', 'ref_main');
		const pluginSkillsDir = path.join(pluginDir, 'skills');
		writeSkill(pluginSkillsDir, 'plugin-skill', 'Skill from a VS Code agent plugin');

		fs.writeFileSync(path.join(pluginDir, 'plugin.json'), JSON.stringify({ skills: ['./skills/'] }));
		const pluginUriPath = process.platform === 'win32'
			? '/' + pluginDir.replace(/\\/g, '/')
			: pluginDir;
		fs.writeFileSync(path.join(pluginHome, 'installed.json'), JSON.stringify({
			version: 1,
			installed: [{ pluginUri: `file://${pluginUriPath}`, name: 'my-plugin' }],
		}));

		const result = discoverSkillEntries([]);

		const names = result.map(s => s.name);
		assert.ok(names.includes('plugin-skill'), 'should discover plugin skills from ~/.vscode/agent-plugins');
	});
});

test('discoverSkillEntries: includes skills from chat.agentSkillsLocations in stable + insiders settings', () => {
	withIsolatedHome(() => {
		const home = process.env.USERPROFILE ?? process.env.HOME ?? '';
		const appData = mkTmpDir('ctt-appdata-');
		const originalAppData = process.env.APPDATA;
		if (process.platform === 'win32') {
			process.env.APPDATA = appData;
		}

		try {
			const stableCustomSkills = path.join(home, 'custom-stable-skills');
			const insidersCustomSkills = path.join(home, 'custom-insiders-skills');
			writeSkill(stableCustomSkills, 'stable-setting-skill', 'Configured in stable settings');
			writeSkill(insidersCustomSkills, 'insiders-setting-skill', 'Configured in insiders settings');

			const stableSettingsPath = process.platform === 'win32'
				? path.join(appData, 'Code', 'User', 'settings.json')
				: process.platform === 'darwin'
					? path.join(home, 'Library', 'Application Support', 'Code', 'User', 'settings.json')
					: path.join(home, '.config', 'Code', 'User', 'settings.json');
			const insidersSettingsPath = process.platform === 'win32'
				? path.join(appData, 'Code - Insiders', 'User', 'settings.json')
				: process.platform === 'darwin'
					? path.join(home, 'Library', 'Application Support', 'Code - Insiders', 'User', 'settings.json')
					: path.join(home, '.config', 'Code - Insiders', 'User', 'settings.json');
			fs.mkdirSync(path.dirname(stableSettingsPath), { recursive: true });
			fs.mkdirSync(path.dirname(insidersSettingsPath), { recursive: true });
			fs.writeFileSync(stableSettingsPath, JSON.stringify({ 'chat.agentSkillsLocations': [stableCustomSkills] }), 'utf8');
			fs.writeFileSync(insidersSettingsPath, JSON.stringify({ 'chat.agentSkillsLocations': [insidersCustomSkills] }), 'utf8');

			const result = discoverSkillEntries([]);

			const names = result.map(s => s.name);
			assert.ok(names.includes('stable-setting-skill'), 'should include paths from Code settings.json');
			assert.ok(names.includes('insiders-setting-skill'), 'should include paths from Code - Insiders settings.json');
		} finally {
			if (originalAppData === undefined) { delete process.env.APPDATA; } else { process.env.APPDATA = originalAppData; }
			fs.rmSync(appData, { recursive: true, force: true });
		}
	});
});

test('discoverSkillEntries: ignores malformed additionalSkillDirs option without throwing', () => {
	withIsolatedHome(() => {
		const home = process.env.USERPROFILE ?? process.env.HOME ?? '';
		const configuredSkills = path.join(home, 'custom-configured-skills');
		writeSkill(configuredSkills, 'configured-option-skill', 'Configured via additional dirs option');

		const result = discoverSkillEntries([], { additionalSkillDirs: [configuredSkills] });
		const names = result.map(s => s.name);
		assert.ok(names.includes('configured-option-skill'));

		assert.doesNotThrow(() => discoverSkillEntries([], { additionalSkillDirs: { bad: true } as unknown as string[] }));
	});
});

// ---------------------------------------------------------------------------
// discoverSkillEntries — agent-plugins installed.json discovery
// ---------------------------------------------------------------------------

test('discoverSkillEntries: agent-plugins: loads only declared skills/ from plugin.json', () => {
	withIsolatedHome(() => {
		const home = process.env.USERPROFILE ?? process.env.HOME ?? '';
		const pluginHome = path.join(home, '.vscode', 'agent-plugins');
		const pluginDir = path.join(pluginHome, 'github.com', 'dotnet', 'skills', 'plugins', 'dotnet');
		const declaredSkillsDir = path.join(pluginDir, 'skills');
		const undeclaredSkillsDir = path.join(pluginHome, 'github.com', 'dotnet', 'skills', '.github', 'skills');

		// Skill inside declared skills/ dir
		writeSkill(declaredSkillsDir, 'csharp-scripts', 'Run C# scripts');
		// Skill outside declared path (elsewhere in the repo) — must NOT be loaded
		writeSkill(undeclaredSkillsDir, 'hidden-skill', 'Should not appear');

		// plugin.json declares only ./skills/
		fs.writeFileSync(path.join(pluginDir, 'plugin.json'), JSON.stringify({ name: 'dotnet', skills: ['./skills/'] }));

		// installed.json points to this plugin — encode path as a file:// URI
		const pluginUriPath = process.platform === 'win32'
			? '/' + pluginDir.replace(/\\/g, '/')
			: pluginDir;
		fs.writeFileSync(path.join(pluginHome, 'installed.json'), JSON.stringify({
			version: 1,
			installed: [{ pluginUri: `file://${pluginUriPath}`, name: 'dotnet' }],
		}));

		const result = discoverSkillEntries([]);
		const names = result.map(s => s.name);
		assert.ok(names.includes('csharp-scripts'), 'declared skill should be discovered');
		assert.ok(!names.includes('hidden-skill'), 'undeclared skill should NOT be discovered');
	});
});

test('discoverSkillEntries: agent-plugins: ignores missing pluginUri directories gracefully', () => {
	withIsolatedHome(() => {
		const home = process.env.USERPROFILE ?? process.env.HOME ?? '';
		const pluginHome = path.join(home, '.vscode', 'agent-plugins');
		fs.mkdirSync(pluginHome, { recursive: true });

		// installed.json points to a non-existent directory
		fs.writeFileSync(path.join(pluginHome, 'installed.json'), JSON.stringify({
			version: 1,
			installed: [{ pluginUri: 'file:///nonexistent/plugin/path', name: 'ghost' }],
		}));

		assert.doesNotThrow(() => discoverSkillEntries([]));
		assert.deepEqual(discoverSkillEntries([]), []);
	});
});

test('discoverSkillEntries: agent-plugins: missing installed.json returns no skills', () => {
	withIsolatedHome(() => {
		const home = process.env.USERPROFILE ?? process.env.HOME ?? '';
		const pluginHome = path.join(home, '.vscode', 'agent-plugins');
		fs.mkdirSync(pluginHome, { recursive: true });
		// No installed.json written
		assert.deepEqual(discoverSkillEntries([]), []);
	});
});

test('discoverSkillEntries: agent-plugins: plugin without plugin.json defaults to ./skills/', () => {
	withIsolatedHome(() => {
		const home = process.env.USERPROFILE ?? process.env.HOME ?? '';
		const pluginHome = path.join(home, '.vscode', 'agent-plugins');
		const pluginDir = path.join(pluginHome, 'my-plugin');
		const skillsDir = path.join(pluginDir, 'skills');

		writeSkill(skillsDir, 'my-skill', 'A skill');
		// No plugin.json written — should default to ./skills/

		const pluginUriPath = process.platform === 'win32'
			? '/' + pluginDir.replace(/\\/g, '/')
			: pluginDir;
		fs.writeFileSync(path.join(pluginHome, 'installed.json'), JSON.stringify({
			version: 1,
			installed: [{ pluginUri: `file://${pluginUriPath}`, name: 'my-plugin' }],
		}));

		const result = discoverSkillEntries([]);
		assert.ok(result.map(s => s.name).includes('my-skill'), 'default ./skills/ fallback should work');
	});
});

// ---------------------------------------------------------------------------
// analyzeToolCuration
// ---------------------------------------------------------------------------

test('analyzeToolCuration: flags unused MCP server with disable recommendation', () => {
	const available = [
		{ name: 'mcp__idle-server', description: 'Idle MCP server', source: 'mcp' as const, server: 'idle-server' },
	];
	const period = emptyPeriod();

	const result = analyzeToolCuration(available, period, 30);

	assert.equal(result.unusedTools.length, 1);
	const rec = result.recommendations.find(r => r.type === 'disable-mcp-server');
	assert.ok(rec, 'should have a disable-mcp-server recommendation');
	assert.equal(rec?.target, 'idle-server');
	assert.ok(rec?.reason.includes('30 days'));
});

test('analyzeToolCuration: does not flag used MCP server', () => {
	const available = [
		{ name: 'mcp__active-server', description: 'Active server', source: 'mcp' as const, server: 'active-server' },
	];
	// Tool name in byTool must match the available entry name exactly for usedNames to include it
	const period: UsageAnalysisPeriod = {
		...emptyPeriod(),
		mcpTools: { total: 5, byServer: { 'active-server': 5 }, byTool: { 'mcp__active-server': 5 } },
	};

	const result = analyzeToolCuration(available, period, 30);

	assert.equal(result.unusedTools.length, 0);
	assert.equal(result.recommendations.filter(r => r.type === 'disable-mcp-server').length, 0);
});

test('analyzeToolCuration: flags unused skill with refine recommendation', () => {
	const available = [
		{ name: 'stale-skill', description: 'Stale skill', source: 'skill' as const, skillPath: '.github/skills/stale-skill/SKILL.md' },
	];
	const period = emptyPeriod();

	const result = analyzeToolCuration(available, period, 30);

	const rec = result.recommendations.find(r => r.type === 'refine-skill');
	assert.ok(rec, 'should have a refine-skill recommendation');
	assert.equal(rec?.target, 'stale-skill');
});

test('analyzeToolCuration: includes windowDays in result', () => {
	const result = analyzeToolCuration([], emptyPeriod(), 90);
	assert.equal(result.windowDays, 90);
});

test('analyzeToolCuration: estimatedPromptBloat.totalTokens > 0 for unused tools', () => {
	const available = [
		{ name: 'mcp__idle', description: 'A description long enough to count', source: 'mcp' as const, server: 'idle' },
	];
	const result = analyzeToolCuration(available, emptyPeriod(), 30);
	assert.ok(result.estimatedPromptBloat.totalTokens > 0);
});

test('analyzeToolCuration: does not flag extension-contributed server whose tools are disabled', () => {
	const available = [
		{
			name: 'mcp__disabled',
			description: 'Disabled MCP server',
			source: 'mcp' as const,
			server: 'disabled',
			extensionId: 'pub.ext',
			enabled: false,
			extensionActive: true,
		},
	];
	const result = analyzeToolCuration(available, emptyPeriod(), 30);

	assert.equal(result.underusedMcpServers.length, 0, 'disabled extension server should not appear in underused list');
	assert.equal(result.unusedTools.length, 0, 'disabled tools do not consume prompt budget');
	assert.equal(result.recommendations.filter(r => r.type === 'disable-mcp-server').length, 0, 'no disable recommendation when already disabled');
});

test('analyzeToolCuration: still flags extension-contributed server whose tools are enabled but unused', () => {
	const available = [
		{
			name: 'mcp__enabled',
			description: 'Enabled but unused MCP server',
			source: 'mcp' as const,
			server: 'enabled',
			extensionId: 'pub.ext',
			enabled: true,
			extensionActive: true,
		},
	];
	const result = analyzeToolCuration(available, emptyPeriod(), 30);

	assert.equal(result.underusedMcpServers.length, 1);
	assert.equal(result.underusedMcpServers[0].enabled, true);
	assert.equal(result.underusedMcpServers[0].extensionId, 'pub.ext');
});

test('analyzeToolCuration: avoids ambiguous per-plugin attribution for shared skill names', () => {
	const available = [
		{ name: 'shared-skill', description: 'Skill in plugin A', source: 'skill' as const, pluginName: 'plugin-a' },
		{ name: 'shared-skill', description: 'Skill in plugin B', source: 'skill' as const, pluginName: 'plugin-b' },
		{ name: 'unique-a', description: 'Unique skill in plugin A', source: 'skill' as const, pluginName: 'plugin-a' },
	];
	const period: UsageAnalysisPeriod = {
		...emptyPeriod(),
		toolCalls: { total: 2, byTool: { 'shared-skill': 1, 'unique-a': 1 } },
	};

	const result = analyzeToolCuration(available, period, 30);
	const pluginA = result.underusedAgentPlugins.find(p => p.pluginName === 'plugin-a');
	const pluginB = result.underusedAgentPlugins.find(p => p.pluginName === 'plugin-b');

	assert.equal(pluginA?.availableSkillCount, 2);
	assert.equal(pluginA?.usedSkillCount, 1, 'only uniquely attributable skill usage should count for plugin A');
	assert.equal(pluginB?.availableSkillCount, 1);
	assert.equal(pluginB?.usedSkillCount, 0, 'shared skill usage should not be attributed to plugin B');
});
