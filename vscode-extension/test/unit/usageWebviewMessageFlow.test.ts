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

/**
 * `buildStats()` with a Workspace Health customization matrix mirroring a real long-tail
 * distribution: 5 heavily-used workspaces (110-60 sessions) followed by 5 workspaces with
 * only 1-2 sessions each — the "clear cliff" `computeWorkspaceHealthGrouping()` should detect.
 */
function buildStatsWithLongTailWorkspaces(): Record<string, unknown> {
	const stats = buildStats();
	const majorSessionCounts = [110, 90, 80, 70, 60];
	const tailSessionCounts = [2, 2, 1, 1, 1];
	const workspaces = [...majorSessionCounts, ...tailSessionCounts].map((sessionCount, index) => ({
		workspacePath: `/repos/repo-${index + 1}`,
		workspaceName: `repo-${index + 1}`,
		sessionCount,
		interactionCount: sessionCount * 10,
		typeStatuses: {},
	}));
	stats.customizationMatrix = {
		customizationTypes: [],
		workspaces,
		totalWorkspaces: workspaces.length,
		workspacesWithIssues: 0,
	};
	return stats;
}

function buildStatsWithCorrections(): Record<string, unknown> {
	return {
		...buildStats(),
		correctionReport: {
			sessionsPerRepo: 25,
			sessionsWithMoments: 1,
			counts: {
				userCorrections: 1, editRetries: 0, editSelfCorrections: 0,
				toolErrors: 1, toolErrorsRetried: 1, agentSelfCorrections: 0,
			},
			repos: [{
				repository: 'acme/web-app',
				sessionsWithMoments: 1,
				counts: {
					userCorrections: 1, editRetries: 0, editSelfCorrections: 0,
					toolErrors: 1, toolErrorsRetried: 1, agentSelfCorrections: 0,
				},
				sessions: [{
					file: '/sessions/example.jsonl',
					title: 'Correcting the build',
					moments: [
						{ type: 'user-correction', turnNumber: 2, timestamp: '2026-08-01T12:00:00.000Z', snippet: 'No, use the existing endpoint.', matchedPattern: 'no' },
						{ type: 'tool-error', turnNumber: 3, timestamp: '2026-08-01T12:01:00.000Z', snippet: 'Tool failed: edit', tool: 'edit', retried: true },
					],
				}],
			}],
		},
	};
}

/** Same report, but with one escalating user correction so the 📈 filter pill renders. */
function buildStatsWithEscalatingCorrection(): Record<string, unknown> {
	const stats = buildStatsWithCorrections() as any;
	stats.correctionReport.counts.escalatedUserCorrections = 1;
	stats.correctionReport.repos[0].counts.escalatedUserCorrections = 1;
	stats.correctionReport.repos[0].sessions[0].moments[0].escalated = true;
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

test('renders the cleanup log with the worktree path for failing entries', async () => {
	const harness = await bootWebview(buildStats());
	const worktreePath = 'C:\\Users\\me\\.copilot\\copilot-worktrees\\repo\\feature-x';

	harness.post({
		command: 'worktreeFound',
		worktree: {
			path: worktreePath,
			repoLabel: 'repo',
			branch: 'feature-x',
			lastCommit: 'abc1234',
			lastCommitDate: '2026-09-07T10:00:00.000Z',
			pushed: 'yes',
			files: 1,
			folders: 1,
			bytes: 1024,
		},
	});
	harness.post({ command: 'cleanupStarted', total: 1 });
	harness.post({
		command: 'cleanupWorktreeResult',
		path: worktreePath,
		branch: 'feature-x',
		repoLabel: 'repo',
		status: 'error',
		reason: `Could not safely locate the main repository for "${worktreePath}".`,
		processed: 1,
		total: 1,
	});
	harness.post({ command: 'cleanupComplete' });

	const rendered = harness.text('.worktree-cleanup-log');
	assert.ok(rendered?.includes(worktreePath), `expected the worktree path in the cleanup log, got: ${rendered}`);
	assert.ok(rendered?.includes('Could not safely locate the main repository'), 'expected the cleanup reason to stay visible');
});

test('a blocked cleanup entry shows remediation details and actionable buttons', async () => {
	// A bare "Has uncommitted or untracked changes." gives the user nothing to act on. The row
	// has to say how stale the worktree is, whether the branch still exists on the remote, and
	// whether it is pushed — and offer a way to go fix it.
	const harness = await bootWebview(buildStats());
	const worktreePath = 'C:\\Users\\me\\.copilot\\copilot-worktrees\\repo\\stale-branch';

	harness.post({ command: 'cleanupStarted', total: 1 });
	harness.post({
		command: 'cleanupWorktreeResult',
		path: worktreePath,
		branch: 'stale-branch',
		repoLabel: 'repo',
		status: 'skipped',
		reason: 'Has uncommitted or untracked changes.',
		diagnostics: {
			lastModified: '2026-09-01T08:30:00.000Z',
			lastCommitDate: '2026-08-20T09:00:00.000Z',
			lastCommitRelative: '3 weeks ago',
			remoteBranch: 'origin/stale-branch',
			remoteBranchExists: false,
			ahead: 2,
			behind: 5,
			modifiedFiles: 3,
			untrackedFiles: 1,
		},
		processed: 1,
		total: 1,
	});
	harness.post({ command: 'cleanupComplete' });

	const rendered = harness.text('.worktree-cleanup-log');
	assert.ok(rendered?.includes('Last updated:'), `expected a last-updated chip, got: ${rendered}`);
	assert.ok(rendered?.includes('Last commit: 3 weeks ago'), 'expected the relative last-commit age');
	assert.ok(rendered?.includes('origin/stale-branch'), 'expected the remote branch name');
	assert.ok(rendered?.includes('(gone)'), 'a deleted upstream branch must be called out');
	assert.ok(rendered?.includes('2 ahead') && rendered?.includes('5 behind'), 'expected the ahead/behind push status');
	assert.ok(rendered?.includes('3 modified') && rendered?.includes('1 untracked'), 'expected the dirty-file counts');
	assert.ok(rendered?.includes('Open in VS Code'), 'expected an open-in-VS-Code remediation button');
});

test('a synced, never-dirty entry reports "up to date" rather than counts', async () => {
	const harness = await bootWebview(buildStats());

	harness.post({ command: 'cleanupStarted', total: 1 });
	harness.post({
		command: 'cleanupWorktreeResult',
		path: 'C:\\wt\\clean',
		branch: 'clean',
		repoLabel: 'repo',
		status: 'error',
		reason: 'Could not delete worktree.',
		diagnostics: { remoteBranch: 'origin/clean', remoteBranchExists: true, ahead: 0, behind: 0, modifiedFiles: 0, untrackedFiles: 0 },
		processed: 1,
		total: 1,
	});
	harness.post({ command: 'cleanupComplete' });

	const rendered = harness.text('.worktree-cleanup-log');
	assert.ok(rendered?.includes('Push status: up to date'), `expected an up-to-date push status, got: ${rendered}`);
	assert.ok(rendered?.includes('Changes: clean'), 'a clean tree must say so instead of showing zero counts');
	assert.ok(!rendered?.includes('(gone)'), 'an existing upstream branch must not be marked gone');
});

test('a branch that was never pushed is flagged as having no remote', async () => {
	const harness = await bootWebview(buildStats());

	harness.post({ command: 'cleanupStarted', total: 1 });
	harness.post({
		command: 'cleanupWorktreeResult',
		path: 'C:\\wt\\local-only',
		branch: 'local-only',
		repoLabel: 'repo',
		status: 'skipped',
		reason: 'Worktree has commits not pushed to any remote.',
		diagnostics: { remoteBranchExists: false },
		processed: 1,
		total: 1,
	});
	harness.post({ command: 'cleanupComplete' });

	const rendered = harness.text('.worktree-cleanup-log');
	assert.ok(rendered?.includes('Remote: none (never pushed)'), `expected a missing-remote warning, got: ${rendered}`);
});

test('clicking "Open in VS Code" asks the host to open that worktree folder', async () => {
	const harness = await bootWebview(buildStats());
	const worktreePath = 'C:\\wt\\needs-attention';

	harness.post({ command: 'cleanupStarted', total: 1 });
	harness.post({
		command: 'cleanupWorktreeResult',
		path: worktreePath,
		branch: 'needs-attention',
		repoLabel: 'repo',
		status: 'skipped',
		reason: 'Has uncommitted or untracked changes.',
		diagnostics: { modifiedFiles: 2, untrackedFiles: 0 },
		processed: 1,
		total: 1,
	});
	harness.post({ command: 'cleanupComplete' });
	harness.posted.length = 0;

	const button = harness.window.document.querySelector('.worktree-open-editor-btn') as HTMLElement | null;
	assert.ok(button, 'expected an open-in-VS-Code button on the blocked cleanup row');
	button.dispatchEvent(new harness.window.MouseEvent('click', { bubbles: true }));

	const posted = harness.posted.find((m) => m.command === 'openWorktreeInEditor');
	assert.ok(posted, `expected an openWorktreeInEditor message, got: ${JSON.stringify(harness.posted)}`);
	assert.equal(posted.path, worktreePath);
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
	const hydraFusionSession = {
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
	};
	stats.todaySessions = [
		hydraFusionSession,
		// Id variants seen in real session logs must all be recognized...
		{ ...hydraFusionSession, title: 'Prefixed task', filePath: 'b.jsonl', models: ['copilot/hydrafusion'] },
		{ ...hydraFusionSession, title: 'Separated task', filePath: 'c.jsonl', models: ['hydra-fusion'] },
		{ ...hydraFusionSession, title: 'Suffixed task', filePath: 'd.jsonl', models: ['hydrafusion-preview'] },
		// ...while a different model that merely ends in the name must not be.
		{ ...hydraFusionSession, title: 'Unrelated task', filePath: 'e.jsonl', models: ['unrelated-hydrafusion'] },
	];
	const harness = await bootWebview(stats);

	const badges = harness.window.document.querySelectorAll('.hydrafusion-session-badge');
	assert.equal(badges.length, 4, 'every HydraFusion id variant should be marked, and only those');
	const badge = badges[0];
	assert.ok(badge, 'expects a marker for HydraFusion sessions');
	assert.equal(badge.textContent, 'HydraFusion');
	const row = harness.window.document.querySelector('.sessions-table tbody tr');
	assert.match(row.textContent, /12\.5K/);
	assert.match(row.textContent, /1\.5M/);
	assert.match(row.textContent, /\$12\.35/);
	const costCell = [...row.cells].find(cell => cell.textContent === '$12.35');
	assert.equal(costCell?.title, '$12.3450');
});

test('Recent Sessions Duration column falls back to wall-clock time when activeDurationMs is zero', async () => {
	// Regression test for a bug where session formats without per-request timing data (e.g.
	// Copilot CLI JSONL) always reported activeDurationMs === 0, and the Duration column's old
	// `??` fallback treated that defined zero as "no fallback needed", showing a misleading "<1m"
	// for sessions that actually ran much longer.
	const stats = buildStats();
	const cliSession = {
		title: 'Long CLI session', filePath: 'cli-session.jsonl', interactions: 40, toolCalls: 53,
		inputTokens: 3700000, outputTokens: 14300, thinkingTokens: 0, cachedTokens: 3600000, totalTokens: 3800000,
		estimatedCost: 1.13, editor: 'Copilot CLI (App)', models: ['gpt-5.6-terra'],
		lastActivity: '2026-09-06T11:00:00.000Z',
		durationMs: 125 * 60_000, // 125 minutes of wall-clock time
		activeDurationMs: 0, // no per-request timing available for this format
	};
	stats.todaySessions = [cliSession];
	const harness = await bootWebview(stats);

	const row = harness.window.document.querySelector('.sessions-table tbody tr');
	assert.ok(row, 'expects a rendered session row');
	assert.match(row.textContent, /2h 05m/, 'Duration should fall back to the 125-minute wall-clock time, not "<1m"');
	assert.doesNotMatch(row.textContent, /<1m/, 'a zero-but-defined activeDurationMs must not be shown as "<1m"');
});

test('Recent Sessions pill filters narrow the table by editor, vendor, model, and HydraFusion', async () => {
	const stats = buildStats();
	const baseSession = {
		interactions: 10, toolCalls: 5, inputTokens: 1000, outputTokens: 500, thinkingTokens: 0,
		cachedTokens: 0, totalTokens: 1500, estimatedCost: 0.5, lastActivity: '2026-09-06T11:00:00.000Z',
	};
	stats.todaySessions = [
		{ ...baseSession, title: 'CLI session', filePath: 'a.jsonl', editor: 'Copilot CLI (App)', models: ['claude-opus-5'] },
		{ ...baseSession, title: 'VS Code session', filePath: 'b.jsonl', editor: 'VS Code', models: ['gpt-5.6-terra'] },
		{ ...baseSession, title: 'HydraFusion session', filePath: 'c.jsonl', editor: 'VS Code', models: ['hydrafusion'] },
	];
	const harness = await bootWebview(stats);
	const doc = harness.window.document;
	const titles = () => [...doc.querySelectorAll('.sessions-table tbody tr .session-title-link')].map(a => a.textContent.replace(/^HydraFusion/, ''));

	assert.deepEqual(titles(), ['CLI session', 'VS Code session', 'HydraFusion session'], 'all three sessions render before any filter is applied');

	// Filter by editor: only the two VS Code sessions should remain.
	const editorPill = [...doc.querySelectorAll('.session-filter-pill[data-filter-type="editor"]')].find(p => p.getAttribute('data-filter-value') === 'VS Code');
	assert.ok(editorPill, 'expects a VS Code editor filter pill');
	editorPill.click();
	assert.deepEqual(titles(), ['VS Code session', 'HydraFusion session']);
	// The click replaces the whole table container's HTML, so re-query for the live pill.
	const editorPillAfterClick = [...doc.querySelectorAll('.session-filter-pill[data-filter-type="editor"]')].find(p => p.getAttribute('data-filter-value') === 'VS Code');
	assert.equal(editorPillAfterClick?.getAttribute('aria-pressed'), 'true', 'an active pill should expose aria-pressed="true"');

	// Combine with the HydraFusion quick filter: only the HydraFusion session should remain.
	const hydraPill = doc.querySelector('.session-filter-pill-hydrafusion');
	assert.ok(hydraPill, 'expects a HydraFusion quick-filter pill');
	hydraPill.click();
	assert.deepEqual(titles(), ['HydraFusion session']);

	// Clearing filters restores every session.
	const clearButton = doc.getElementById('sessions-filter-clear');
	assert.ok(clearButton, 'expects a "Clear filters" button once a filter is active');
	clearButton.click();
	assert.deepEqual(titles(), ['CLI session', 'VS Code session', 'HydraFusion session']);
	assert.equal(doc.getElementById('sessions-filter-clear'), null, 'the clear button disappears once no filters are active');
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

test('collapses the long tail of low-activity workspaces into an "Other" row on Workspace Health', async () => {
	const harness = await bootWebview(buildStatsWithLongTailWorkspaces());

	const majorRows = harness.window.document.querySelectorAll('#repo-list-pane .repo-name');
	assert.equal(majorRows.length, 5, 'only the 5 high-activity workspaces should render as individual rows');

	const rendered = harness.text('#repo-list-pane');
	assert.match(rendered ?? '', /Other \(5 repositories with low activity\)/);

	const showAllButton = harness.window.document.getElementById('btn-show-other-workspaces');
	assert.ok(showAllButton, 'expects a "Show all" toggle for the collapsed tail');

	showAllButton.click();
	await harness.settle();

	const allRows = harness.window.document.querySelectorAll('#repo-list-pane .repo-name');
	assert.equal(allRows.length, 10, '"Show all" must reveal every workspace, including the low-activity tail');
	assert.equal(
		harness.window.document.getElementById('btn-show-other-workspaces'), null,
		'the "Other" row must disappear once expanded',
	);
	const collapseButton = harness.window.document.getElementById('btn-collapse-other-workspaces');
	assert.ok(collapseButton, 'expects a "Show less" toggle once expanded');

	collapseButton.click();
	await harness.settle();

	const collapsedAgainRows = harness.window.document.querySelectorAll('#repo-list-pane .repo-name');
	assert.equal(collapsedAgainRows.length, 5, '"Show less" must collapse back to just the major group');
});

test('does not group workspaces on Workspace Health when there is no long tail', async () => {
	const stats = buildStats();
	// A gentle, non-cliff distribution with too few workspaces to bother grouping.
	stats.customizationMatrix = {
		customizationTypes: [],
		workspaces: [10, 8, 6, 4].map((sessionCount, index) => ({
			workspacePath: `/repos/repo-${index + 1}`,
			workspaceName: `repo-${index + 1}`,
			sessionCount,
			interactionCount: sessionCount * 10,
			typeStatuses: {},
		})),
		totalWorkspaces: 4,
		workspacesWithIssues: 0,
	};
	const harness = await bootWebview(stats);

	const rows = harness.window.document.querySelectorAll('#repo-list-pane .repo-name');
	assert.equal(rows.length, 4, 'all workspaces should render individually when there is no meaningful drop-off');
	assert.equal(
		harness.window.document.getElementById('btn-show-other-workspaces'), null,
		'no "Other" row should appear for a small, non-cliff workspace list',
	);
});

test('filters corrections by type and opens the selected session turn', async () => {
	const harness = await bootWebview(buildStatsWithCorrections());
	harness.window.document.querySelector('.tab-button[data-tab="corrections"]')?.click();

	const userCorrection = harness.window.document.querySelector('button[data-correction-filter="user-correction"]');
	assert.ok(userCorrection, 'expects a user-corrections filter pill');
	userCorrection.click();

	assert.equal(harness.window.document.querySelectorAll('button.correction-moment').length, 1);
	assert.match(harness.text('.correction-moment') ?? '', /^You corrected the agent No, use the existing endpoint\. turn 2 · matched no/);
	assert.equal(
		harness.window.document.querySelector('button[data-correction-filter="user-correction"]')?.getAttribute('aria-pressed'),
		'true',
	);
	harness.window.document.querySelector('button.correction-moment')?.click();
	harness.window.document.querySelector('button.correction-moment')?.click();
	const message = harness.posted.at(-1);
	assert.equal(message.command, 'openSessionFile');
	assert.equal(message.file, '/sessions/example.jsonl');
	assert.equal(message.turnNumber, 2);
});

test('corrections filter reports how many moments are shown and can be cleared', async () => {
	const harness = await bootWebview(buildStatsWithCorrections());
	harness.window.document.querySelector('.tab-button[data-tab="corrections"]')?.click();

	assert.match(harness.text('#corrections-filter-status') ?? '', /Showing all 2 listed correction moments/);
	assert.equal(harness.window.document.querySelector('button.correction-clear-filter'), null, 'no clear button without a filter');

	harness.window.document.querySelector('button[data-correction-filter="tool-error"]')?.click();
	assert.match(harness.text('#corrections-filter-status') ?? '', /Showing 1 of 2 listed correction moments/);
	assert.match(harness.text('#corrections-filter-status') ?? '', /Tool errors/);
	assert.equal(harness.window.document.querySelectorAll('button.correction-moment').length, 1);

	harness.window.document.querySelector('button.correction-clear-filter')?.click();
	assert.match(harness.text('#corrections-filter-status') ?? '', /Showing all 2 listed correction moments/);
	assert.equal(harness.window.document.querySelectorAll('button.correction-moment').length, 2);
});

test('the escalating pill is a filter that narrows the list to escalated moments', async () => {
	const harness = await bootWebview(buildStatsWithEscalatingCorrection());
	harness.window.document.querySelector('.tab-button[data-tab="corrections"]')?.click();

	const escalating = harness.window.document.querySelector('button[data-correction-filter="escalated"]');
	assert.ok(escalating, 'the escalating pill must be a clickable filter, not a static badge');
	escalating.click();

	assert.equal(
		harness.window.document.querySelector('button[data-correction-filter="escalated"]')?.getAttribute('aria-pressed'),
		'true',
	);
	assert.equal(harness.window.document.querySelectorAll('button.correction-moment').length, 1);
	assert.match(harness.text('#corrections-filter-status') ?? '', /Showing 1 of 2 listed correction moments/);
	assert.match(harness.text('#corrections-filter-status') ?? '', /Escalating corrections/);
});
