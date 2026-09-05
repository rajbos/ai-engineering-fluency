/// <reference path="../../src/types/jsdom.d.ts" />
import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as path from 'node:path';
import * as esbuild from 'esbuild';
import { JSDOM } from 'jsdom';

/**
 * End-to-end message-flow tests for the Usage Analysis webview.
 *
 * These bundle and execute the *real* `src/webview/usage/main.ts` in jsdom and drive it the way
 * the extension host does. The "Repository PRs" / "Cloud Agent" tabs previously sat on "Loading…"
 * forever even though the host had fetched and posted the data — a class of bug no unit test on
 * either side could catch, because each half was individually correct and only the hand-off broke.
 */

// Compiled tests live at <ext>/out/vscode-extension/test/unit, so four levels up is <ext>.
const EXT_ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const ENTRY = path.join(EXT_ROOT, 'src', 'webview', 'usage', 'main.ts');

let bundlePromise: Promise<string> | undefined;

function bundleUsageWebview(): Promise<string> {
	bundlePromise ??= esbuild.build({
		entryPoints: [ENTRY],
		bundle: true,
		write: false,
		format: 'iife',
		platform: 'browser',
		target: 'es2020',
		nodePaths: [path.join(EXT_ROOT, 'node_modules')],
		loader: { '.css': 'text' },
		logLevel: 'silent',
	}).then((result) => result.outputFiles[0].text);
	return bundlePromise;
}

function emptyPeriod(): Record<string, unknown> {
	return {
		sessions: 1,
		modeUsage: {},
		contextReferences: { total: 0, byKind: {}, byPath: {} },
		toolCalls: { total: 0, byTool: {} },
		mcpTools: { total: 0, byServer: {}, byTool: {} },
		modelSwitching: {
			modelsPerSession: [], totalSessions: 0, averageModelsPerSession: 0, maxModelsPerSession: 0,
			minModelsPerSession: 0, switchingFrequency: 0, standardModels: [], premiumModels: [],
			unknownModels: [], mixedTierSessions: 0, lowCostModels: [], mediumCostModels: [],
			highCostModels: [], mixedCostSessions: 0, standardRequests: 0, premiumRequests: 0,
			lowCostRequests: 0, mediumCostRequests: 0, highCostRequests: 0, unknownRequests: 0, totalRequests: 0,
		},
	};
}

function emptyModelEfficiencyCounters(calls: number): Record<string, unknown> {
	return {
		calls, toolCalls: 0, editTurns: 0, oneShotEditTurns: 0, retries: 0, selfCorrections: 0,
		editToolCalls: 0, inputTokens: 0, outputTokens: 0, cachedReadTokens: 0, cost: 0,
	};
}

/** Local usage counts mirroring a real long-tail leaderboard: a clear cliff after the 4th model. */
function longTailModelEfficiency(): Record<string, unknown> {
	const counts: Record<string, number> = {
		kimi: 309, sol: 144, sonnet5: 120, opus5: 82,
		unknown: 20, hydrafusion: 16, mistralMedium: 14, sonnet46: 12, terra: 12, maiCode: 11,
	};
	return Object.fromEntries(Object.entries(counts).map(([model, calls]) => [model, emptyModelEfficiencyCounters(calls)]));
}

function buildStats(): Record<string, unknown> {
	return {
		today: emptyPeriod(),
		last30Days: emptyPeriod(),
		month: emptyPeriod(),
		lastMonth: emptyPeriod(),
		locale: 'en-US',
		customizationMatrix: null,
		missedPotential: [],
		todaySessions: [],
		lastUpdated: new Date().toISOString(),
		backendConfigured: false,
		currentWorkspacePaths: [],
		insights: [],
	};
}

/** `buildStats()` with a long-tail "Most used models locally" dataset for `last30Days`. */
function buildStatsWithLongTailModelEfficiency(): Record<string, unknown> {
	const stats = buildStats();
	stats.last30Days = { ...(stats.last30Days as Record<string, unknown>), modelEfficiency: longTailModelEfficiency() };
	return stats;
}

interface Harness {
	window: any;
	posted: any[];
	post: (message: Record<string, unknown>) => void;
	postFromHostFrame: (message: Record<string, unknown>) => void;
	postFromForeignOrigin: (message: Record<string, unknown>) => void;
	text: (selector: string) => string | null;
	settle: () => Promise<void>;
}

/** Boots the bundled webview in jsdom. `initialData` mirrors `window.__INITIAL_USAGE__`. */
async function bootWebview(initialData: Record<string, unknown> | null): Promise<Harness> {
	const bundle = await bundleUsageWebview();
	const dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>', {
		runScripts: 'outside-only',
		pretendToBeVisual: true,
		url: 'https://example.org/',
	});
	const window = dom.window as any;
	const posted: any[] = [];
	window.acquireVsCodeApi = () => ({
		postMessage: (message: unknown) => { posted.push(message); },
		getState: () => undefined,
		setState: () => undefined,
	});
	// jsdom's ElementInternals is a stub; <vscode-button> calls setFormValue on it.
	window.HTMLElement.prototype.attachInternals = () => ({
		setFormValue() { /* no-op */ }, setValidity() { /* no-op */ }, form: null, states: new Set(), role: null,
	});
	if (initialData) { window.__INITIAL_USAGE__ = initialData; }

	window.eval(bundle);

	const settle = async (): Promise<void> => {
		for (let i = 0; i < 20; i++) { await new Promise((resolve) => setImmediate(resolve)); }
	};
	await settle();

	return {
		window,
		posted,
		settle,
		post: (message) => {
			const event = new window.MessageEvent('message', { data: message });
			Object.defineProperty(event, 'source', { value: null });
			window.dispatchEvent(event);
		},
		postFromHostFrame: (message: Record<string, unknown>) => {
			// Reproduces VS Code's real relay: an unidentifiable window object stamped with the
			// webview's own origin. Identity comparison against window/parent/top fails here.
			const event = new window.MessageEvent('message', { data: message, origin: window.location.origin });
			Object.defineProperty(event, 'source', { value: {} });
			window.dispatchEvent(event);
		},
		postFromForeignOrigin: (message: Record<string, unknown>) => {
			const event = new window.MessageEvent('message', { data: message, origin: 'https://evil.example' });
			Object.defineProperty(event, 'source', { value: {} });
			window.dispatchEvent(event);
		},
		text: (selector) => {
			const el = window.document.querySelector(selector);
			return el ? el.textContent.replace(/\s+/g, ' ').trim() : null;
		},
	};
}

function repoPrPayload(): Record<string, unknown> {
	return {
		authenticated: true,
		since: new Date('2026-08-01T00:00:00Z').toISOString(),
		repos: [
			{ owner: 'rajbos', repo: 'ai-engineering-fluency', repoUrl: 'https://github.com/rajbos/ai-engineering-fluency', totalPrs: 99, aiAuthoredPrs: 7, aiReviewRequestedPrs: 3, userAuthoredPrs: 40, userMergedPrs: 38, aiDetails: [] },
			{ owner: 'xebia', repo: 'xms-techradar', repoUrl: 'https://github.com/xebia/xms-techradar', totalPrs: 0, aiAuthoredPrs: 0, aiReviewRequestedPrs: 0, userAuthoredPrs: 0, userMergedPrs: 0, aiDetails: [], error: 'Repo not found or not accessible with current token' },
		],
	};
}

test('announces readiness both at listener registration and after the layout renders', async () => {
	const harness = await bootWebview(buildStats());
	const ready = harness.posted.filter((m) => m.command === 'usageWebviewReady');

	assert.ok(
		ready.some((m) => m.reason === 'listener-registered'),
		'must announce readiness as soon as the message listener exists',
	);
	const afterLayout = ready.find((m) => m.reason === 'layout-rendered');
	assert.ok(afterLayout, 'must re-announce readiness once the layout (and its containers) exists');
	assert.equal(afterLayout.hasGitHubActivityContainers, true);
});

test('renders repository PR results delivered after the layout exists', async () => {
	const harness = await bootWebview(buildStats());

	harness.post({ command: 'repoPrStatsLoaded', data: repoPrPayload() });

	const rendered = harness.text('#repos-pr-content');
	assert.ok(rendered?.includes('ai-engineering-fluency'), `expected the repo table, got: ${rendered}`);
	assert.ok(rendered?.includes('99'), 'expected the PR count in the rendered table');
	assert.ok(
		!rendered?.includes('sign in with GitHub'),
		'the placeholder must be replaced, not left in place',
	);
});

test('repository PR results delivered before any layout exists still reach the panel', async () => {
	// The webview announces readiness at module-evaluation time, so the host replays buffered
	// state into a DOM that has no `#repos-pr-content` yet. Without a re-announce + restore
	// after renderLayout, that state is silently dropped and the tab hangs on "Loading…".
	const harness = await bootWebview(null);
	assert.equal(harness.window.document.querySelector('#repos-pr-content'), null);

	harness.post({ command: 'repoPrStatsLoaded', data: repoPrPayload() });
	harness.post({ command: 'updateStats', data: buildStats() });
	await harness.settle();

	const rendered = harness.text('#repos-pr-content');
	assert.ok(rendered?.includes('ai-engineering-fluency'), `expected the repo table, got: ${rendered}`);
});

test('a layout re-render repopulates the GitHub activity panels from retained state', async () => {
	// Any stats refresh rebuilds the whole root, recreating the "Loading…" placeholders. The
	// already-received PR data must be re-applied instead of being visually lost.
	const harness = await bootWebview(buildStats());
	harness.post({ command: 'repoPrStatsLoaded', data: repoPrPayload() });

	harness.post({ command: 'updateStats', data: buildStats() });
	await harness.settle();

	const rendered = harness.text('#repos-pr-content');
	assert.ok(rendered?.includes('ai-engineering-fluency'), `expected the repo table after re-render, got: ${rendered}`);
});

test('tells the host when a payload arrived but could not be rendered', async () => {
	// A payload that lands in a DOM with no container renders nothing, which from the outside
	// is indistinguishable from one that never arrived. The webview must say so. On success it
	// stays quiet — the rendered panel is its own evidence.
	const withoutLayout = await bootWebview(null);
	withoutLayout.posted.length = 0;
	withoutLayout.post({ command: 'repoPrStatsLoaded', data: repoPrPayload() });

	const trace = withoutLayout.posted.find(
		(m) => m.command === 'usageWebviewTrace' && m.stage === 'repoPrStatsLoaded.notRendered',
	);
	assert.ok(trace, 'the host must be told when a delivered payload rendered nothing');
	assert.equal(trace.details.repos, 2);

	const withLayout = await bootWebview(buildStats());
	withLayout.posted.length = 0;
	withLayout.post({ command: 'repoPrStatsLoaded', data: repoPrPayload() });
	assert.ok(
		!withLayout.posted.some((m) => m.command === 'usageWebviewTrace' && String(m.stage).startsWith('repoPrStatsLoaded')),
		'a successful render must not log anything',
	);
});

test('a rejected message is reported to the host instead of vanishing', async () => {
	// The trust check silently dropping real messages is what made every panel hang. If the
	// trust model ever breaks again, the drop must show up in the Output channel.
	const harness = await bootWebview(buildStats());
	harness.posted.length = 0;

	harness.postFromForeignOrigin({ command: 'repoPrStatsLoaded', data: repoPrPayload() });

	const trace = harness.posted.find(
		(m) => m.command === 'usageWebviewTrace' && m.stage === 'message-rejected-untrusted',
	);
	assert.ok(trace, 'a dropped message must be traced back to the host');
	assert.equal(trace.details.command, 'repoPrStatsLoaded');
	assert.ok(
		!harness.text('#repos-pr-content')?.includes('ai-engineering-fluency'),
		'a foreign-origin message must still not be rendered',
	);
});

test('renders repository PR fetch progress into the panel', async () => {
	const harness = await bootWebview(buildStats());

	harness.post({ command: 'repoPrStatsProgress', total: 2, done: 1 });

	const rendered = harness.text('#repos-pr-content');
	assert.ok(rendered?.includes('1/2'), `expected fetch progress, got: ${rendered}`);
});

test('accepts payloads relayed the way VS Code actually delivers them', async () => {
	// The panel hung with `delivered=true` logged host-side because the webview's source-trust
	// check compared window identities. VS Code relays from an internal window, so every
	// extension → webview message was dropped before any handler saw it.
	const harness = await bootWebview(buildStats());

	harness.postFromHostFrame({ command: 'repoPrStatsLoaded', data: repoPrPayload() });

	const rendered = harness.text('#repos-pr-content');
	assert.ok(rendered?.includes('ai-engineering-fluency'), `expected the repo table, got: ${rendered}`);
});

test('marks HydraFusion sessions in the recent sessions list', async () => {
	const stats = buildStats();
	stats.todaySessions = [{
		title: 'HydraFusion task',
		filePath: 'session.jsonl',
		interactions: 12500,
		toolCalls: 1500,
		inputTokens: 1500000,
		outputTokens: 12000,
		thinkingTokens: 2000,
		cachedTokens: 30000,
		totalTokens: 1544000,
		estimatedCost: 12.345,
		editor: 'VS Code',
		models: ['hydrafusion'],
		lastActivity: '2026-08-31T12:00:00.000Z',
	}];
	const harness = await bootWebview(stats);

	const badge = harness.window.document.querySelector('.hydrafusion-session-badge');
	assert.ok(badge, 'expects a marker for HydraFusion sessions');
	assert.equal(badge.textContent, 'HydraFusion');
	const row = harness.window.document.querySelector('.sessions-table tbody tr');
	assert.match(row.textContent, /12\.5K/);
	assert.match(row.textContent, /1\.5M/);
	assert.match(row.textContent, /\$12\.35/);
});

test('renders cloud agent session results', async () => {
	const harness = await bootWebview(buildStats());

	harness.post({
		command: 'agentSessionsLoaded',
		data: {
			authenticated: true, since: new Date('2026-08-01T00:00:00Z').toISOString(), fetchedAt: new Date().toISOString(),
			totalTasks: 4, totalSessions: 6, totalCredits: 0, totalPremiumRequests: 0,
			accountTasksAvailable: true, partial: false,
			repos: [{ owner: 'rajbos', repo: 'ai-engineering-fluency', repoUrl: 'https://github.com/rajbos/ai-engineering-fluency', tasks: 4, sessions: 6, discovery: 'workspace' }],
		},
	});

	const rendered = harness.text('#agent-sessions-content');
	assert.ok(rendered?.includes('ai-engineering-fluency'), `expected the agent table, got: ${rendered}`);
	assert.ok(!rendered?.includes('sign in with GitHub'), 'the placeholder must be replaced');
});

test('a throwing message handler is reported to the host instead of failing silently', async () => {
	const harness = await bootWebview(buildStats());
	harness.posted.length = 0;
	// `null` data makes sanitizeRepoPrStatsData produce an unauthenticated result rather than
	// throwing, so force a real failure by removing the render target's parent document node.
	harness.window.document.querySelector = () => { throw new Error('boom'); };

	harness.post({ command: 'repoPrStatsLoaded', data: repoPrPayload() });

	const trace = harness.posted.find((m) => m.command === 'usageWebviewTrace' && m.stage === 'handleExtensionMessage.threw');
	assert.ok(trace, 'a render exception must surface in the extension Output channel');
	assert.equal(trace.details.command, 'repoPrStatsLoaded');
});

test('collapses the long-tail of the local model leaderboard into a closed "Other models" group', async () => {
	const harness = await bootWebview(buildStatsWithLongTailModelEfficiency());

	const wraps = harness.window.document.querySelectorAll('.model-leaderboard-table-wrap');
	assert.equal(wraps.length, 2, 'expects a main table plus one collapsed "other models" table');

	const details = harness.window.document.getElementById('model-leaderboard-other');
	assert.ok(details, 'expects a collapsible "Other models" group in the DOM');
	assert.equal(details.open, false, 'the group must be collapsed by default');
	// The default "hide low-usage models" filter drops the 3 lowest-call models (Q1 threshold)
	// first, leaving 7; the long tail is then everything after the cliff among those 7.
	assert.match(details.querySelector('summary').textContent, /Other models \(3,/, 'expects the 3 remaining long-tail models grouped');

	const mainRows = wraps[0].querySelectorAll('tbody tr');
	assert.equal(mainRows.length, 4, 'the 4 models before the cliff stay in the main table');

	const otherRows = details.querySelectorAll('tbody tr');
	assert.equal(otherRows.length, 3, 'the 3 models after the cliff move into the other-models table');
});

test('remembers the "Other models" open state across a leaderboard re-render', async () => {
	const harness = await bootWebview(buildStatsWithLongTailModelEfficiency());

	const details = harness.window.document.getElementById('model-leaderboard-other');
	assert.equal(details.open, false);

	// Open it, mirroring what a real click on <summary> does, then dispatch the `toggle` event
	// the webview listens for (capture phase, since `toggle` does not bubble).
	details.open = true;
	details.dispatchEvent(new harness.window.Event('toggle'));

	// Sorting re-renders just the leaderboard content, recreating the <details> element from
	// scratch; without persisted state it would always snap back to collapsed.
	const modelHeader = harness.window.document.querySelector('th[data-eff-sort="model"]');
	modelHeader.click();

	const detailsAfterSort = harness.window.document.getElementById('model-leaderboard-other');
	assert.ok(detailsAfterSort, 'expects the "Other models" group to still exist after sorting');
	assert.equal(detailsAfterSort.open, true, 'the open state must survive the re-render');
});
