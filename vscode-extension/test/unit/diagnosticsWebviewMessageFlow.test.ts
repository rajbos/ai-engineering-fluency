/// <reference path="../../src/types/jsdom.d.ts" />
import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as path from 'node:path';
import * as esbuild from 'esbuild';
import { JSDOM } from 'jsdom';

/**
 * End-to-end message-flow tests for the Diagnostics webview (part of the Item 3 audit of the
 * other five webviews after PR #1919's shared-handler fix).
 *
 * The host sends `backendStorageInfoLoaded` *before* the slower `diagnosticDataLoaded` message
 * (see `sendBackendStorageInfoEarly` in extension.ts) specifically so the Backend Storage tab
 * can populate early. Because the webview's own `bootstrap()` awaits a dynamic import before it
 * builds the DOM (`renderLayout`), that early message can genuinely arrive before the layout —
 * and its containers — exist. These tests bundle and execute the *real*
 * `src/webview/diagnostics/main.ts` in jsdom to prove that an early arrival is captured (not
 * silently dropped) and is not subsequently discarded by the first full render.
 */

// Compiled tests live at <ext>/out/vscode-extension/test/unit, so four levels up is <ext>.
const EXT_ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const ENTRY = path.join(EXT_ROOT, 'src', 'webview', 'diagnostics', 'main.ts');

let bundlePromise: Promise<string> | undefined;

function bundleDiagnosticsWebview(): Promise<string> {
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

function buildInitialData(overrides: Record<string, unknown> = {}): Record<string, unknown> {
	return {
		report: 'Diagnostic Report\n==================',
		sessionFiles: [],
		detailedSessionFiles: [],
		cacheInfo: { size: 0, sizeInMB: 0, lastUpdated: null, location: 'VS Code Global State', storagePath: null },
		backendStorageInfo: null,
		backendConfigured: false,
		isDebugMode: false,
		globalStateCounters: {
			openCount: 0, unknownMcpOpenCount: 0, fluencyBannerDismissed: false,
			unknownMcpDismissedVersion: '', efficiencyTabBannerDismissed: false,
		},
		githubAuth: { authenticated: false },
		sessionFolders: [],
		displaySettings: { showTokens: true, showCost: true, monthlyBudget: null },
		quotaEntitlements: null,
		toolCallStats: null,
		skillCallStats: null,
		skillCallsByEditor: null,
		skillDescriptions: {},
		toolFamilies: [],
		otelComparison: null,
		...overrides,
	};
}

function configuredBackendStorageInfo(): Record<string, unknown> {
	return {
		azure: {
			enabled: true, isConfigured: true, storageAccount: 'myuniquestorageaccount', subscriptionId: 'sub-1',
			resourceGroup: 'rg-1', aggTable: 'agg', eventsTable: 'events', authMode: 'entraId',
			sharingProfile: 'team', lastSyncTime: null, deviceCount: 1, sessionCount: 10, recordCount: 5,
		},
		teamServer: {
			enabled: false, isConfigured: false, endpointUrl: '', sharingProfile: 'team',
			lastSyncTime: null, sessionCount: 0,
		},
	};
}

interface Harness {
	window: any;
	posted: any[];
	post: (message: Record<string, unknown>) => void;
	postSync: (message: Record<string, unknown>) => void;
	text: (selector: string) => string | null;
	settle: () => Promise<void>;
}

/**
 * Boots the bundled webview in jsdom. `initialData` mirrors `window.__INITIAL_DIAGNOSTICS__`.
 * Unlike the usage-panel harness, this does NOT await settling before returning — callers that
 * need to dispatch a message *before* `bootstrap()`'s pending dynamic import resolves (i.e.
 * before `renderLayout` has run) must do so immediately, then call `settle()` themselves.
 */
function bootWebviewUnsettled(initialData: Record<string, unknown> | null, savedState?: Record<string, unknown>): Harness {
	const bundle = getSyncBundle();
	const dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>', {
		runScripts: 'outside-only',
		pretendToBeVisual: true,
		url: 'https://example.org/',
	});
	const window = dom.window as any;
	const posted: any[] = [];
	window.acquireVsCodeApi = () => ({
		postMessage: (message: unknown) => { posted.push(message); },
		getState: () => savedState,
		setState: () => undefined,
	});
	// jsdom's ElementInternals is a stub; <vscode-button> calls setFormValue on it.
	window.HTMLElement.prototype.attachInternals = () => ({
		setFormValue() { /* no-op */ }, setValidity() { /* no-op */ }, form: null, states: new Set(), role: null,
	});
	if (initialData) { window.__INITIAL_DIAGNOSTICS__ = initialData; }

	window.eval(bundle);

	const settle = async (): Promise<void> => {
		for (let i = 0; i < 20; i++) { await new Promise((resolve) => setImmediate(resolve)); }
	};

	return {
		window,
		posted,
		settle,
		post: (message) => {
			const event = new window.MessageEvent('message', { data: message, origin: window.location.origin });
			Object.defineProperty(event, 'source', { value: {} });
			window.dispatchEvent(event);
		},
		// Alias kept distinct from `post` to make call sites self-documenting about intent:
		// dispatched synchronously, immediately after boot, before any await has run.
		postSync(message) {
			this.post(message);
		},
		text: (selector) => {
			const el = window.document.querySelector(selector);
			return el ? el.textContent.replace(/\s+/g, ' ').trim() : null;
		},
	};
}

/**
 * Reads one Share Card stat tile ("Sessions", "Interactions", …) by its label. The value and the
 * label live in sibling divs with no whitespace between them, so `harness.text()` would run them
 * together ("1Sessions"); going through the DOM keeps the assertion readable.
 */
function shareStat(harness: Harness, label: string): string | undefined {
	const tiles = Array.from(harness.window.document.querySelectorAll('#tab-share .share-stat')) as any[];
	const tile = tiles.find((t) => t.querySelector('.share-stat-label')?.textContent === label);
	return tile?.querySelector('.share-stat-value')?.textContent;
}

let syncBundle: string | undefined;
function getSyncBundle(): string {
	if (syncBundle === undefined) { throw new Error('Bundle not preloaded — call preloadBundle() first'); }
	return syncBundle;
}
async function preloadBundle(): Promise<void> {
	syncBundle ??= await bundleDiagnosticsWebview();
}

test('Backend Storage tab renders normally when no early message arrives', async () => {
	await preloadBundle();
	const harness = bootWebviewUnsettled(buildInitialData({ backendStorageInfo: configuredBackendStorageInfo() }));
	await harness.settle();

	const rendered = harness.text('#tab-backend');
	assert.ok(rendered?.includes('Configured & Enabled'), `expected configured status, got: ${rendered}`);
});

test('Backend Storage tab shows the loading placeholder until data arrives', async () => {
	await preloadBundle();
	const harness = bootWebviewUnsettled(buildInitialData());
	await harness.settle();

	const rendered = harness.text('#tab-backend');
	assert.ok(rendered?.includes('Loading backend storage status'), `expected placeholder, got: ${rendered}`);
});

test('a backendStorageInfoLoaded message delivered before the layout renders is not discarded by the first paint', async () => {
	// The host sends this message as early as possible (sendBackendStorageInfoEarly), racing the
	// webview's own bootstrap() which awaits a dynamic import before building any DOM. Dispatching
	// synchronously right after eval — before the pending import microtask resolves — reproduces
	// that race deterministically: renderLayout() has not run yet, so no #tab-backend exists.
	await preloadBundle();
	const harness = bootWebviewUnsettled(buildInitialData({ backendStorageInfo: null }));

	assert.equal(harness.window.document.getElementById('tab-backend'), null, 'layout must not exist yet');
	harness.postSync({ command: 'backendStorageInfoLoaded', backendStorageInfo: configuredBackendStorageInfo(), githubAuth: { authenticated: true, username: 'octocat' } });

	await harness.settle();

	const rendered = harness.text('#tab-backend');
	assert.ok(
		rendered?.includes('Configured & Enabled'),
		`the early message's data must survive into the first paint, got: ${rendered}`,
	);
	assert.ok(
		!rendered?.includes('Loading backend storage status'),
		'the first paint must not silently fall back to the placeholder once real data already arrived',
	);
});

test('a githubAuth value from an early backendStorageInfoLoaded message also survives the first paint', async () => {
	await preloadBundle();
	const harness = bootWebviewUnsettled(buildInitialData({ backendStorageInfo: null, githubAuth: { authenticated: false } }));

	harness.postSync({
		command: 'backendStorageInfoLoaded',
		backendStorageInfo: configuredBackendStorageInfo(),
		githubAuth: { authenticated: true, username: 'octocat' },
	});
	await harness.settle();

	const rendered = harness.text('#tab-github');
	assert.ok(rendered?.includes('octocat'), `expected the authenticated GitHub user to render, got: ${rendered}`);
});

test('changing the Share Card period refreshes the card and keeps its controls interactive', async () => {
	await preloadBundle();
	const recent = new Date().toISOString();
	const old = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
	const session = (file: string, lastInteraction: string) => ({
		file,
		size: 100,
		modified: lastInteraction,
		interactions: 2,
		tokens: 1_000,
		contextReferences: {},
		firstInteraction: lastInteraction,
		lastInteraction,
		editorSource: 'VS Code',
	});
	const harness = bootWebviewUnsettled(buildInitialData({
		detailedSessionFiles: [session('recent.json', recent), session('old.json', old)],
	}));
	await harness.settle();

	const initialCard = harness.text('#tab-share');
	assert.ok(
		initialCard?.includes('Last 14 days · 1 editor detected'),
		`expected the default 14-day subtitle, got: ${initialCard}`,
	);
	assert.equal(shareStat(harness, 'Sessions'), '1', 'only the recent session falls inside the default period');

	const selector = harness.window.document.getElementById('share-card-period-select') as HTMLSelectElement;
	selector.value = 'allTime';
	selector.dispatchEvent(new harness.window.Event('change', { bubbles: true }));

	const refreshedCard = harness.text('#tab-share');
	assert.ok(
		refreshedCard?.includes('All time · 1 editor detected'),
		`expected the card to re-render for the new period, got: ${refreshedCard}`,
	);
	assert.equal(shareStat(harness, 'Sessions'), '2', 'the 60-day-old session joins the count once the period is All time');
	assert.equal(harness.window.document.querySelectorAll('#tab-share').length, 1);
	const refreshedSelector = harness.window.document.getElementById('share-card-period-select') as HTMLSelectElement;
	assert.equal(refreshedSelector.value, 'allTime');

	(harness.window.document.getElementById('btn-copy-share-summary') as HTMLButtonElement).click();
	assert.equal(harness.posted.at(-1)?.command, 'copyText');
	assert.match(harness.posted.at(-1)?.text, /2 sessions.*of all time/);
});

test('a backendStorageInfoLoaded message delivered before the layout renders is not discarded by the first paint', async () => {
	// The host sends this message as early as possible (sendBackendStorageInfoEarly), racing the
	// webview's own bootstrap() which awaits a dynamic import before building any DOM. Dispatching
	// synchronously right after eval — before the pending import microtask resolves — reproduces
	// that race deterministically: renderLayout() has not run yet, so no #tab-backend exists.
	await preloadBundle();
	const harness = bootWebviewUnsettled(buildInitialData({ backendStorageInfo: null }));

	assert.equal(harness.window.document.getElementById('tab-backend'), null, 'layout must not exist yet');
	harness.postSync({ command: 'backendStorageInfoLoaded', backendStorageInfo: configuredBackendStorageInfo(), githubAuth: { authenticated: true, username: 'octocat' } });

	await harness.settle();

	const rendered = harness.text('#tab-backend');
	assert.ok(
		rendered?.includes('Configured & Enabled'),
		`the early message's data must survive into the first paint, got: ${rendered}`,
	);
	assert.ok(
		!rendered?.includes('Loading backend storage status'),
		'the first paint must not silently fall back to the placeholder once real data already arrived',
	);
});

test('Share Card setup is a no-op on the loading first paint, and does not abort the rest of the wiring', async () => {
	// renderShareCardTab() emits the period selector and share buttons only once session files
	// have loaded. On the loading first paint — which every panel open goes through — none of
	// the elements setupShareSummaryButtonHandler() wires exist yet. It must still return
	// cleanly: setupButtonHandlers() calls it mid-sequence, so anything thrown here would
	// silently leave every button wired after it — starting with btn-issue — dead for the
	// rest of the session. reRenderShareCard() wires them for real once the data arrives.
	await preloadBundle();
	const harness = bootWebviewUnsettled(buildInitialData({ detailedSessionFiles: [] }));
	await harness.settle();

	const card = harness.text('#tab-share');
	assert.ok(card?.includes('Loading session files'), `expected the loading placeholder, got: ${card}`);
	assert.equal(
		harness.window.document.getElementById('share-card-period-select'),
		null,
		'the period selector must not exist while session files are still loading',
	);

	(harness.window.document.getElementById('btn-issue') as HTMLButtonElement).click();
	assert.equal(
		harness.posted.at(-1)?.command,
		'openIssue',
		'a button wired after setupShareSummaryButtonHandler must still be interactive',
	);
});

test('OTel Delta tab shows a detecting message while comparison data is still loading', async () => {
	await preloadBundle();
	const harness = bootWebviewUnsettled(buildInitialData({ otelComparison: undefined }));
	await harness.settle();

	const rendered = harness.text('#tab-otel-delta');
	assert.ok(rendered?.includes('OpenTelemetry Detection Running'), `expected detecting title, got: ${rendered}`);
	assert.ok(rendered?.includes('Detecting Copilot CLI OpenTelemetry export data'), `expected detecting body, got: ${rendered}`);
});

test('restoring the Mistral Cloud tab reveals the Research leaf bar and marks it active', async () => {
	await preloadBundle();
	const harness = bootWebviewUnsettled(buildInitialData(), { activeTab: 'mistral-cloud' });
	await harness.settle();

	const doc = harness.window.document;
	const researchGroupTab = doc.querySelector('.group-tab[data-group="research"]');
	const researchLeafBar = doc.querySelector('.leaf-tabs[data-group="research"]');
	const mistralTabButton = doc.querySelector('.tab[data-tab="mistral-cloud"]');
	const mistralTabContent = doc.getElementById('tab-mistral-cloud');

	assert.ok(researchGroupTab?.classList.contains('active'), 'expected the Research group tab to be active');
	assert.notEqual(researchLeafBar?.style.display, 'none', 'expected the Research leaf tab bar to be visible');
	assert.ok(mistralTabButton?.classList.contains('active'), 'expected the Mistral Cloud tab button to be active');
	assert.ok(mistralTabContent?.classList.contains('active'), 'expected the Mistral Cloud tab content to be active');
});
