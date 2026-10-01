import test, { before, after } from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import tokenEstimatorsData from '../../../src/tokenEstimators.json';
import modelPricingData from '../../../src/modelPricing.json';
import toolNamesData from '../../../src/toolNames.json';
import type { ModelPricing, SessionFileDetails, TokenEstimator } from '../../../src/types';
import { buildAdapterRegistry, createDataAccessInstances } from '../../../src/adapters';
import { estimateTokensFromText } from '../../../src/tokenEstimation';
import { isMcpTool, extractMcpServerName } from '../../../src/workspaceHelpers';
import { analyzeSessionFile, type SessionAnalyzerDeps } from '../../src/analysis/sessionFileAnalyzer';
import { AnalysisWorkerPool } from '../../src/analysis/analysisWorkerPool';
import { computeSessionFileDetails } from '../../src/analysis/sessionDetailsAnalyzer';
import { scanCustomizationFilesForWorkspace } from '../../src/analysis/workspaceCustomizationScan';

/**
 * The worker is only safe to ship if it produces exactly what the in-process analyzer does,
 * and only worth shipping if it really keeps the host's event loop free. These build the real
 * worker bundle (same esbuild settings as esbuild.js) and test both claims against it.
 */
const EXTENSION_ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const FIXTURES = [
	path.join(EXTENSION_ROOT, 'test', 'fixtures', 'sample-session-data', 'chatSessions', 'session-01-today.json'),
	path.join(EXTENSION_ROOT, 'test', 'fixtures', 'sample-session-data', 'chatSessions', 'session-03-twelve-days-ago.json'),
	path.join(EXTENSION_ROOT, '..', 'cli', 'src', 'test', 'fixtures', 'vscode-delta-session.jsonl'),
	path.join(EXTENSION_ROOT, 'test', 'fixtures', 'sample-session-data', 'xss-hostile-claude-session.jsonl'),
];

let scratchDir: string;
let workerPath: string;

before(async () => {
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	const esbuild = require('esbuild') as typeof import('esbuild');
	scratchDir = fs.mkdtempSync(path.join(os.tmpdir(), 'analysis-worker-'));
	workerPath = path.join(scratchDir, 'analysisWorker.js');
	await esbuild.build({
		entryPoints: [path.join(EXTENSION_ROOT, 'src', 'analysis', 'analysisWorker.ts')],
		bundle: true,
		format: 'cjs',
		platform: 'node',
		outfile: workerPath,
		alias: { vscode: path.join(EXTENSION_ROOT, 'src', 'analysis', 'vscodeStub.ts') },
		nodePaths: [path.join(EXTENSION_ROOT, 'node_modules')],
		logLevel: 'silent',
		banner: { js: 'var __importMetaUrl = require("url").pathToFileURL(__filename).href;' },
		define: { 'import.meta.url': '__importMetaUrl' },
	});
});

after(() => {
	if (scratchDir) { fs.rmSync(scratchDir, { recursive: true, force: true }); }
});

function makePool(size = 2): AnalysisWorkerPool {
	return new AnalysisWorkerPool({ workerPath, extensionPath: EXTENSION_ROOT, size, log: () => undefined, warn: () => undefined });
}

function buildInProcessDeps(): SessionAnalyzerDeps {
	const tokenEstimators = tokenEstimatorsData.estimators as Record<string, TokenEstimator>;
	const toolNameMap = toolNamesData as { [key: string]: string };
	const extensionUri = { fsPath: EXTENSION_ROOT, path: EXTENSION_ROOT, scheme: 'file' };
	return {
		warn: () => undefined,
		tokenEstimators,
		modelPricing: modelPricingData.pricing as { [key: string]: ModelPricing },
		toolNameMap,
		ecosystems: buildAdapterRegistry({
			...createDataAccessInstances(extensionUri),
			estimateTokens: (text, model) => estimateTokensFromText(text, model ?? 'gpt-4', tokenEstimators),
			isMcpTool: (tool) => isMcpTool(tool),
			extractMcpServerName: (tool) => extractMcpServerName(tool, toolNameMap),
		}),
	};
}

/** The skeleton the host prepares before handing a session to the details pass. */
function detailsSkeleton(file: string, stat: fs.Stats): SessionFileDetails {
	return {
		file, size: stat.size, modified: stat.mtime.toISOString(), interactions: 0,
		contextReferences: { file: 0, selection: 0, implicitSelection: 0, symbol: 0, codebase: 0, workspace: 0, terminal: 0, vscode: 0, terminalLastCommand: 0, terminalSelection: 0, clipboard: 0, changes: 0, outputPanel: 0, problemsPanel: 0, pullRequest: 0, byKind: {}, copilotInstructions: 0, agentsMd: 0, byPath: {} },
		firstInteraction: null, lastInteraction: null, editorSource: 'test',
	};
}

/** JSON round-trip drops `undefined`-valued keys, which structured cloning would keep. */
const normalize = <T>(value: T): T => JSON.parse(JSON.stringify(value));

test('worker output is identical to the in-process analyzer', async (t) => {
	const pool = makePool();
	const deps = buildInProcessDeps();
	try {
		const present = FIXTURES.filter((f) => fs.existsSync(f));
		assert.ok(present.length >= 2, 'expected at least the sample chat sessions to exist');
		for (const file of present) {
			await t.test(path.basename(file), async () => {
				const stat = fs.statSync(file);
				const [viaWorker, inProcess] = await Promise.all([
					pool.analyze(file, stat.mtimeMs, stat.size, 'owner/repo'),
					analyzeSessionFile(deps, file, stat.mtimeMs, stat.size, { repository: 'owner/repo' }),
				]);
				assert.deepEqual(normalize(viaWorker), normalize(inProcess));
				assert.equal(viaWorker.repository, 'owner/repo', 'a previously discovered repository must survive a re-parse');
			});
			await t.test(`${path.basename(file)} (details)`, async () => {
				const stat = fs.statSync(file);
				const [viaWorker, inProcess] = await Promise.all([
					pool.computeDetails(file, stat.mtime.getTime(), stat.size, detailsSkeleton(file, stat)),
					computeSessionFileDetails(deps, file, stat, detailsSkeleton(file, stat)),
				]);
				assert.deepEqual(normalize(viaWorker), normalize(inProcess));
				assert.ok(viaWorker.cacheUpdate, 'a readable session produces a cache update');
			});
		}
	} finally {
		await pool.dispose();
	}
});

test('an unparseable session yields the same partial details and no cache update on both sides', async () => {
	const broken = path.join(scratchDir, 'broken-session.json');
	fs.writeFileSync(broken, '{"requests": [ this is not json');
	const stat = fs.statSync(broken);
	const pool = makePool(1);
	try {
		const [viaWorker, inProcess] = await Promise.all([
			pool.computeDetails(broken, stat.mtime.getTime(), stat.size, detailsSkeleton(broken, stat)),
			computeSessionFileDetails(buildInProcessDeps(), broken, stat, detailsSkeleton(broken, stat)),
		]);
		assert.equal(inProcess.cacheUpdate, null, 'a parse failure must not be cached');
		assert.deepEqual(normalize(viaWorker), normalize(inProcess));
	} finally {
		await pool.dispose();
	}
});

test('a missing file rejects through the worker with the original ENOENT code', async () => {
	const pool = makePool(1);
	try {
		await assert.rejects(
			pool.analyze(path.join(scratchDir, 'does-not-exist.json'), 1, 1),
			(e: unknown) => (e as { code?: string }).code === 'ENOENT',
		);
	} finally {
		await pool.dispose();
	}
});

test('workspace customization scan: the worker finds exactly what the in-process scan finds', async () => {
	// Layout: a plain workspace with instructions + a prompt, and a multi-root .code-workspace
	// pointing at it — the two shapes ensureWorkspaceCustomizationCached() has to handle.
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'customization-scan-'));
	const pool = makePool(1);
	try {
		const repo = path.join(root, 'repo');
		fs.mkdirSync(path.join(repo, '.github', 'instructions'), { recursive: true });
		fs.mkdirSync(path.join(repo, '.github', 'prompts'), { recursive: true });
		fs.mkdirSync(path.join(repo, 'node_modules', 'dep', '.github'), { recursive: true });
		fs.writeFileSync(path.join(repo, '.github', 'copilot-instructions.md'), '# instructions');
		fs.writeFileSync(path.join(repo, '.github', 'instructions', 'ts.instructions.md'), '---\napplyTo: "**/*.ts"\n---\n');
		fs.writeFileSync(path.join(repo, '.github', 'prompts', 'review.prompt.md'), 'review');
		fs.writeFileSync(path.join(repo, 'node_modules', 'dep', '.github', 'copilot-instructions.md'), 'must be excluded');
		const multiRoot = path.join(root, 'team.code-workspace');
		fs.writeFileSync(multiRoot, JSON.stringify({ folders: [{ path: repo }] }));
		const emptyDir = path.join(root, 'empty');
		fs.mkdirSync(emptyDir);

		for (const workspace of [repo, multiRoot, emptyDir, path.join(root, 'missing')]) {
			const expected = scanCustomizationFilesForWorkspace(workspace);
			const viaWorker = await pool.scanCustomizationFiles(workspace);
			assert.deepEqual(normalize(viaWorker), normalize(expected), `scan of ${path.basename(workspace)}`);
		}
		const repoFiles = await pool.scanCustomizationFiles(repo);
		assert.ok(repoFiles.some((f) => f.relativePath === '.github/copilot-instructions.md'), 'finds the repo instructions');
		assert.ok(repoFiles.every((f) => !f.relativePath.includes('node_modules')), 'honours the excluded directories');
		const multiFiles = await pool.scanCustomizationFiles(multiRoot);
		assert.ok(multiFiles.length > 0, 'a .code-workspace is scanned through its member folders');
	} finally {
		await pool.dispose();
		fs.rmSync(root, { recursive: true, force: true });
	}
});

test('the host event loop stays responsive while the worker parses a large session', async () => {
	// The reason the worker exists. A large session (tens of MB of chat JSON) takes the host well over
	// a second of uninterrupted CPU to parse; a click arriving meanwhile would wait that long. Here the
	// parse runs on the worker, and a ticker on this (the "host") thread records how long it was ever
	// starved. The bar is far below the parse time, so a regression that moves parsing back onto this
	// thread fails it, while ordinary CI scheduling noise does not.
	const bigSession = path.join(scratchDir, 'big-session.json');
	const requests = Array.from({ length: 20000 }, (_, i) => ({
		requestId: `req_${i}`,
		modelId: 'copilot/gpt-4o',
		message: { text: `question ${i} ${'lorem ipsum dolor sit amet '.repeat(20)}`, parts: [{ text: `question ${i} ${'lorem ipsum dolor sit amet '.repeat(20)}`, kind: 'text' }] },
		response: [{ kind: 'markdownContent', content: { value: `answer ${i} ${'consectetur adipiscing elit '.repeat(60)}` } }],
		timestamp: Date.now() - (20000 - i) * 1000,
	}));
	fs.writeFileSync(bigSession, JSON.stringify({ requests }));
	const stat = fs.statSync(bigSession);
	assert.ok(stat.size > 15_000_000, `fixture should be large (got ${stat.size} bytes)`);

	const pool = makePool(1);
	const deps = buildInProcessDeps();
	try {
		// Warm the worker (module load, adapter registry) so startup cost is not mistaken for a parse stall.
		await pool.analyze(FIXTURES[0], 1, 1);

		// What the host would have suffered: the same parse in-process, timed as one blocking stretch.
		const inProcessStart = Date.now();
		await analyzeSessionFile(deps, bigSession, stat.mtimeMs, stat.size);
		const inProcessMs = Date.now() - inProcessStart;

		let last = Date.now();
		let worstGap = 0;
		const ticker = setInterval(() => { const now = Date.now(); worstGap = Math.max(worstGap, now - last); last = now; }, 10);
		try {
			last = Date.now();
			const result = await pool.analyze(bigSession, stat.mtimeMs, stat.size);
			assert.equal(result.interactions, 20000);
			// A parse that blocked this thread resolves before the overdue tick can run; count the stretch since
			// the last tick that did, or such a regression would read as "never starved".
			worstGap = Math.max(worstGap, Date.now() - last);
		} finally {
			clearInterval(ticker);
		}
		assert.ok(inProcessMs > 400, `fixture must be heavy enough to matter (in-process parse took only ${inProcessMs}ms)`);
		assert.ok(
			worstGap < Math.max(250, inProcessMs / 3),
			`host loop was starved for ${worstGap}ms while the worker parsed (the same parse in-process takes ${inProcessMs}ms)`,
		);
	} finally {
		await pool.dispose();
	}
});
