import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';
import * as vm from 'node:vm';
import * as ts from 'typescript';
import { assertViewableSessionTurns, createExtensionApi } from '../../src/extensionPoints';
import { ClaudeCodeAdapter } from '../../../src/adapters/claudeCodeAdapter';
import { ClaudeCodeDataAccess } from '../../../src/claudecode';

async function withSessionFiles(run: (files: string[], directory: string) => Promise<void>): Promise<void> {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'session-viewer-api-'));
  try {
    const files = ['claude.jsonl', 'subagents/agent-123.jsonl', 'events.jsonl', 'chat.json']
      .map(name => path.join(directory, ...name.split('/')));
    await fs.mkdir(path.join(directory, 'subagents'));
    await Promise.all(files.map(file => fs.writeFile(file, '{}')));
    await run(files, directory);
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
}

test('API forwards scanner paths unchanged to strict viewer and preserves registerButton', async () => {
  await withSessionFiles(async files => {
    const calls: unknown[][] = [];
    const button = { id: 'companion', label: 'Companion' };
    const handler = () => {};
    const disposable = { dispose() {} };
    const api = createExtensionApi({
      registerExtensionPointButton: (config, callback) => {
        assert.equal(config, button);
        assert.equal(callback, handler);
        return disposable;
      },
      showLogViewer: async (...args) => { calls.push(args); },
    });
    assert.equal(api.registerButton(button, handler), disposable);
    for (const file of files) { await api.openSessionLog(file); }
    assert.deepEqual(calls, files.map(file => [file, undefined, true]));
  });
});

test('API rejects invalid paths, unsupported sources, missing files and directories before forwarding', async () => {
  await withSessionFiles(async (_files, directory) => {
    let calls = 0;
    const api = createExtensionApi({
      registerExtensionPointButton: () => ({ dispose() {} }),
      showLogViewer: async () => { calls++; },
    });
    const invalid: unknown[] = [null, undefined, 42, '', ' ', 'relative.jsonl',
      `${directory}\0.jsonl`, 'windsurf://trajectory/id', path.join(directory, 'session.pb'),
      path.join(directory, 'opencode.db#ses_123'), path.join(directory, 'missing.jsonl')];
    const sessionDirectory = path.join(directory, 'folder.jsonl');
    await fs.mkdir(sessionDirectory);
    invalid.push(sessionDirectory);
    for (const input of invalid) {
      // Exercise JavaScript companions that do not have the exported TypeScript contract.
      await assert.rejects(api.openSessionLog(input as string));
    }
    assert.equal(calls, 0);
  });
});

test('API waits for loading, serializes calls and propagates failures without blocking later opens', async () => {
  await withSessionFiles(async files => {
    const failure = new Error('viewer load failed');
    let release!: () => void;
    const loading = new Promise<void>(resolve => { release = resolve; });
    let started!: () => void;
    const firstStarted = new Promise<void>(resolve => { started = resolve; });
    const calls: string[] = [];
    const api = createExtensionApi({
      registerExtensionPointButton: () => ({ dispose() {} }),
      showLogViewer: async file => {
        calls.push(file);
        if (file === files[0]) { started(); await loading; throw failure; }
      },
    });
    const first = assert.rejects(api.openSessionLog(files[0]), error => error === failure);
    await firstStarted;
    const second = api.openSessionLog(files[1]);
    assert.deepEqual(calls, [files[0]]);
    release();
    await Promise.all([first, second]);
    assert.deepEqual(calls, [files[0], files[1]]);
  });
});

// Execute the production methods without activating a VS Code host or its background services.
async function viewerMethods(globals: Record<string, unknown> = {}): Promise<Record<string, any>> {
  const source = await fs.readFile(path.join(__dirname, '../../../../src/extension.ts'), 'utf8');
  const ast = ts.createSourceFile('extension.ts', source, ts.ScriptTarget.Latest, true);
  const tracker = ast.statements.find(node => ts.isClassDeclaration(node) && node.name?.text === 'CopilotTokenTracker');
  assert.ok(tracker && ts.isClassDeclaration(tracker));
  const methods = tracker.members.filter(member => ts.isMethodDeclaration(member) &&
    ['showLogViewer', 'getSessionLogData'].includes(member.name.getText(ast)));
  assert.equal(methods.length, 2);
  const compiled = ts.transpileModule(`class Viewer { ${methods.map(member => member.getText(ast)).join('\n')} }\nnew Viewer();`,
    { compilerOptions: { target: ts.ScriptTarget.ES2022 } });
  return vm.runInNewContext(compiled.outputText, { path, fs: { promises: fs }, assertViewableSessionTurns, ...globals });
}

test('production viewer awaits rendering and disposes its loading panel on API failures', async () => {
  let disposed = false;
  let onDispose = () => {};
  const panel = {
    title: '', webview: { html: '', onDidReceiveMessage() {} },
    onDidDispose(callback: () => void) { onDispose = callback; },
    dispose() { disposed = true; onDispose(); },
  };
  const viewer = await viewerMethods({
    vscode: {
      window: { createWebviewPanel: () => panel }, ViewColumn: { One: 1 },
      Uri: { joinPath: () => ({}) },
    },
  });
  viewer.windsurf = { isWindsurfSessionFile: () => false };
  viewer.getLoadingHtml = () => 'loading';
  viewer.getLogViewerHtml = () => 'rendered';
  let release!: (data: unknown) => void;
  viewer.getSessionLogData = (file: string, strict: boolean) => {
    assert.equal(file, 'session.jsonl');
    assert.equal(strict, true);
    return new Promise(resolve => { release = resolve; });
  };
  let completed = false;
  const opened = viewer.showLogViewer('session.jsonl', undefined, true).then(() => { completed = true; });
  assert.equal(panel.webview.html, 'loading');
  assert.equal(completed, false);
  release({ title: 'Claude session', turns: [{}] });
  await opened;
  assert.equal(panel.webview.html, 'rendered');
  assert.equal(panel.title, 'Session: Claude session');
  const failure = new Error('read failed');
  viewer.getSessionLogData = async () => { throw failure; };
  await assert.rejects(viewer.showLogViewer('session.jsonl', undefined, true), error => error === failure);
  assert.equal(disposed, true);
});

test('production loader rejects adapter failures and empty results only in strict mode', async () => {
  const viewer = await viewerMethods();
  viewer.diagnosticsCachedFiles = [];
  viewer.getSessionFileDetails = async () => ({ file: 'claude.jsonl' });
  viewer.warn = () => {};
  viewer.getUsageAnalysisFromSessionCached = async () => ({});
  viewer.getCachedSessionData = () => null;
  viewer.buildBaseLogData = (_details: unknown, turns: unknown[]) => ({ turns });
  const failure = new Error('adapter failed');
  viewer.findEcosystem = () => ({ buildTurns: async () => { throw failure; } });
  await assert.rejects(viewer.getSessionLogData('claude.jsonl', true), error => error === failure);
  assert.equal((await viewer.getSessionLogData('claude.jsonl')).turns.length, 0);
  viewer.findEcosystem = () => ({ buildTurns: async () => ({ turns: [] }) });
  await assert.rejects(viewer.getSessionLogData('claude.jsonl', true), /no viewable chat turns/);
  assert.equal((await viewer.getSessionLogData('claude.jsonl')).turns.length, 0);
});

test('production loader propagates filesystem, JSON and usage errors and rejects UUID pointers', async () => {
  await withSessionFiles(async files => {
    const viewer = await viewerMethods();
    viewer.diagnosticsCachedFiles = [];
    viewer.getSessionFileDetails = async () => ({ modified: new Date().toISOString(), size: 2 });
    viewer.findEcosystem = () => undefined;
    viewer.isUuidPointerFile = (content: string) => content.trim() === 'session-id';
    viewer.isJsonlContent = () => false;
    viewer.buildJsonSessionTurns = () => [{ userMessage: 'Hello' }];
    viewer.warn = () => {};
    viewer.getCachedSessionData = () => null;
    viewer.buildBaseLogData = (_details: unknown, turns: unknown[]) => ({ turns });
    viewer.getUsageAnalysisFromSessionCached = async () => ({});
    await assert.rejects(viewer.getSessionLogData(`${files[3]}.missing`, true), /ENOENT/);
    await fs.writeFile(files[3], '{broken');
    await assert.rejects(viewer.getSessionLogData(files[3], true), /JSON/);
    await fs.writeFile(files[3], 'session-id');
    await assert.rejects(viewer.getSessionLogData(files[3], true), /no viewable chat turns/);
    await fs.writeFile(files[3], '{}');
    const failure = new Error('usage analysis failed');
    viewer.getUsageAnalysisFromSessionCached = async () => { throw failure; };
    await assert.rejects(viewer.getSessionLogData(files[3], true), error => error === failure);
    assert.equal((await viewer.getSessionLogData(files[3])).turns.length, 1);
  });
});

test('real Claude parser loads delegated instructions for the viewer without counting them as human turns', async () => {
  await withSessionFiles(async files => {
    const adapter = new ClaudeCodeAdapter(new ClaudeCodeDataAccess());
    const viewer = await viewerMethods();
    viewer.diagnosticsCachedFiles = [];
    viewer.getSessionFileDetails = async () => ({});
    viewer.findEcosystem = () => adapter;
    viewer.buildBaseLogData = (_details: unknown, turns: unknown[]) => ({ turns });
    const events = [
      { type: 'user', message: { role: 'user', content: 'Explain the implementation' } },
      { type: 'assistant', message: { role: 'assistant', model: 'claude-sonnet-4-6',
        stop_reason: 'end_turn', content: [{ type: 'text', text: 'Here is the explanation.' },
          { type: 'tool_use', id: 'tool-1', name: 'Read', input: { file_path: 'module.ts' } }] } },
    ];
    await fs.writeFile(files[0], events.map(event => JSON.stringify(event)).join('\n'));
    const normal = await viewer.getSessionLogData(files[0], true);
    assert.equal(normal.turns.length, 1);
    assert.equal(normal.turns[0].assistantResponse, 'Here is the explanation.');
    await fs.writeFile(files[1], events.map(event => JSON.stringify({ ...event, isSidechain: true })).join('\n'));
    const delegated = await viewer.getSessionLogData(files[1], true);
    assert.equal(delegated.turns.length, 1);
    assert.equal(delegated.turns[0].instructionSource, 'delegated');
    assert.equal(delegated.turns[0].assistantResponse, 'Here is the explanation.');
    assert.equal(delegated.turns[0].toolCalls[0].toolName, 'Read');
    assert.match(delegated.turns[0].toolCalls[0].arguments, /module.ts/);
    assert.equal((await adapter.buildTurns(files[1])).turns.length, 0);
  });
});
