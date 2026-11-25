import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { CODE_NAV_TOOLS, detectCodeNavTools } from '../codeNavTools';

function tempDir(t: { after(fn: () => void): void }): string {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'code-nav-tools-'));
	t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
	return dir;
}

function write(file: string, content = ''): void {
	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.writeFileSync(file, content);
}

test('detectCodeNavTools: nothing set up means nothing detected', async t => {
	const root = tempDir(t);
	assert.deepEqual(await detectCodeNavTools(path.join(root, 'home'), [path.join(root, 'ws')]), []);
});

test('detectCodeNavTools: a user-level skill folder is found, for any agent skill root', async t => {
	const home = tempDir(t);
	write(path.join(home, '.claude', 'skills', 'graphify', 'SKILL.md'));
	write(path.join(home, '.agents', 'skills', 'serena', 'SKILL.md'));
	// A skill folder without a SKILL.md, and an unrelated skill, are not tools.
	fs.mkdirSync(path.join(home, '.copilot', 'skills', 'codegraph'), { recursive: true });
	write(path.join(home, '.claude', 'skills', 'deploy', 'SKILL.md'));
	const found = await detectCodeNavTools(home, []);
	assert.deepEqual(found.map(f => [f.id, f.scope]), [['graphify', 'user'], ['serena', 'user']]);
});

test('detectCodeNavTools: workspace markers, workspace skills and MCP server entries are found', async t => {
	const root = tempDir(t);
	const home = path.join(root, 'home'), a = path.join(root, 'a'), b = path.join(root, 'b');
	fs.mkdirSync(path.join(a, 'graphify-out'), { recursive: true });
	write(path.join(b, '.github', 'skills', 'codegraph', 'SKILL.md'));
	// JSONC with a comment: matched by server name, not parsed.
	write(path.join(b, '.vscode', 'mcp.json'), '{\n  // local servers\n  "servers": { "Serena" : { "command": "uvx" }, "github": {} }\n}');
	const found = await detectCodeNavTools(home, [a, b]);
	assert.deepEqual(found.map(f => [f.id, f.scope]), [['graphify', 'workspace'], ['codegraph', 'workspace'], ['serena', 'workspace']]);
});

test('detectCodeNavTools: user level wins over workspace; a server name used as a value is not a match', async t => {
	const root = tempDir(t);
	const home = path.join(root, 'home'), ws = path.join(root, 'ws');
	write(path.join(home, '.mcp.json'), '{ "mcpServers": { "codebase-memory-mcp": {} } }');
	fs.mkdirSync(path.join(ws, '.codegraph'), { recursive: true });
	write(path.join(ws, '.mcp.json'), '{ "mcpServers": { "codebase-memory-mcp": {}, "docs": { "args": ["serena"] } } }');
	const found = await detectCodeNavTools(home, [ws]);
	assert.deepEqual(found.map(f => [f.id, f.scope]), [['codegraph', 'workspace'], ['codebase-memory-mcp', 'user']]);
	// A workspace marker is not looked for in the home folder.
	fs.mkdirSync(path.join(home, 'graphify-out'), { recursive: true });
	assert.equal((await detectCodeNavTools(home, [])).some(f => f.id === 'graphify'), false);
});

test('CODE_NAV_TOOLS: every catalog tool has a name and an https link', () => {
	assert.ok(CODE_NAV_TOOLS.length >= 3);
	for (const tool of CODE_NAV_TOOLS) {
		assert.ok(tool.name);
		assert.match(tool.url, /^https:\/\//);
	}
});
