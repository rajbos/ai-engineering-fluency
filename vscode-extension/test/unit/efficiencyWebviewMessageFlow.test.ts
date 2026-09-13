/// <reference path="../../src/types/jsdom.d.ts" />
import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as path from 'node:path';
import * as esbuild from 'esbuild';
import { JSDOM } from 'jsdom';

/**
 * Click/message-flow tests for the Efficiency webview's Value tab.
 *
 * The "Open Repository PRs" button in the empty state is exactly the shape of bug the
 * contract checker cannot see: the host handler can exist and the markup can be perfect
 * while nobody ever called `addEventListener` on the button. So this bundles and runs the
 * *real* `src/webview/efficiency/main.ts` in jsdom, clicks the button, and asserts the
 * command the host actually dispatches on.
 */

// Compiled tests live at <ext>/out/vscode-extension/test/unit, so four levels up is <ext>.
const EXT_ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const ENTRY = path.join(EXT_ROOT, 'src', 'webview', 'efficiency', 'main.ts');

let bundlePromise: Promise<string> | undefined;

function bundleEfficiencyWebview(): Promise<string> {
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

/** Minimal `__INITIAL_EFFICIENCY__` payload; `userPrs` decides the Value tab empty state. */
function buildData(userPrs: number | null): Record<string, unknown> {
	return {
		weekly: [],
		hasLoc: false,
		hasDuration: false,
		hasRetry: false,
		hasApply: false,
		attribution: null,
		attributionWindows: { prev: 'previous 30 days', cur: 'last 30 days', prevRange: 'Jul 1 – Jul 30', curRange: 'Jul 31 – Aug 29' },
		deltas: [],
		deltaWindows: { prev: 'previous 30 days', cur: 'last 30 days' },
		value: {
			userPrs,
			mergedPrs: userPrs === null ? null : 4,
			aiPrs: userPrs === null ? null : 1,
			prsSince: userPrs === null ? null : '2026-08-01T00:00:00.000Z',
			prsPerWeek: userPrs === null ? null : 1.2,
			costPerMergedPr: userPrs === null ? null : 3.1,
			applyRate: null,
			appliedBlocks: 0,
			totalBlocks: 0,
			locPerDollar: null,
			linesChanged: 0,
			periodCost: 0,
		},
		skillTrends: { weeks: [], topSkills: [], totalCalls: 0 },
		skillImpact: [],
		hasSkills: false,
		modelDaily: [],
		hasModelComparison: false,
		cacheBreakage: null,
		lastUpdated: '2026-08-29T12:00:00.000Z',
		backendConfigured: false,
		localization: {
			'efficiency.value.openRepositoryPrs': 'Open Repository PRs',
			'efficiency.value.prsHint': '💡 Connect GitHub and open {0} once to add pull-request metrics here.',
			'efficiency.value.prsHintDestination': 'Usage Analysis → Repository PRs',
			'__language__': 'en',
		},
	};
}

interface Harness {
	window: any;
	posted: any[];
	settle: () => Promise<void>;
	clickTab: (tab: string) => Promise<void>;
}

/** Boots the bundled Efficiency webview in jsdom. */
async function bootWebview(initialData: Record<string, unknown>): Promise<Harness> {
	const bundle = await bundleEfficiencyWebview();
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
	window.__INITIAL_EFFICIENCY__ = initialData;

	window.eval(bundle);

	const settle = async (): Promise<void> => {
		for (let i = 0; i < 20; i++) { await new Promise((resolve) => setImmediate(resolve)); }
	};
	await settle();

	return {
		window,
		posted,
		settle,
		clickTab: async (tab: string) => {
			const btn = window.document.querySelector(`.eff-tab[data-tab="${tab}"]`);
			assert.ok(btn, `expected an Efficiency tab button for "${tab}"`);
			btn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
			await settle();
		},
	};
}

test('efficiency Value empty state: Open Repository PRs button asks the host for the Repository PRs tab', async () => {
	const harness = await bootWebview(buildData(null));
	await harness.clickTab('value');

	const hint = harness.window.document.querySelector('.value-hint-text');
	assert.equal(
		hint?.textContent.trim(),
		'💡 Connect GitHub and open Usage Analysis → Repository PRs once to add pull-request metrics here.',
		'the explanation comes from the localization payload, with the destination interpolated',
	);
	assert.equal(
		hint?.querySelector('b')?.textContent,
		'Usage Analysis → Repository PRs',
		'the destination stays emphasized rather than arriving as escaped markup',
	);

	const button = harness.window.document.getElementById('btn-open-repo-prs');
	assert.ok(button, 'expected the Open Repository PRs button in the Value tab empty state');
	assert.equal(button.textContent.trim(), 'Open Repository PRs', 'button carries the localized label');

	button.dispatchEvent(new harness.window.MouseEvent('click', { bubbles: true }));
	await harness.settle();

	const commands = harness.posted.map((m: any) => m.command);
	assert.ok(
		commands.includes('showUsageAnalysisRepoPrs'),
		`expected showUsageAnalysisRepoPrs to be posted, got: ${JSON.stringify(commands)}`,
	);
});

test('efficiency Value tab: no Repository PRs action once PR metrics are available', async () => {
	const harness = await bootWebview(buildData(18));
	await harness.clickTab('value');

	assert.equal(
		harness.window.document.getElementById('btn-open-repo-prs'),
		null,
		'the empty-state action must not shadow the real PR cards',
	);
});
