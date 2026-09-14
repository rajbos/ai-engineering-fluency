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

test('a switchTab message (e.g. the What\'s New "Take me there" action) navigates to the requested tab and group', async () => {
	await preloadBundle();
	const harness = bootWebviewUnsettled(buildInitialData());
	await harness.settle();

	harness.post({ command: 'switchTab', tab: 'mistral-cloud' });
	await harness.settle();

	const doc = harness.window.document;
	assert.ok(doc.querySelector('.group-tab[data-group="research"]')?.classList.contains('active'), 'expected the Research group tab to be active');
	assert.ok(doc.querySelector('.tab[data-tab="mistral-cloud"]')?.classList.contains('active'), 'expected the Mistral Cloud tab button to be active');
	assert.ok(doc.getElementById('tab-mistral-cloud')?.classList.contains('active'), 'expected the Mistral Cloud tab content to be active');
});

test('a switchTab message that arrives before the layout renders still lands on the requested tab', async () => {
	// Mirrors the backendStorageInfoLoaded early-arrival tests above: the message listener is
	// registered before renderLayout() runs (bootstrap() awaits a dynamic import first), so a
	// switchTab request — e.g. from the What's New "Take me there" action — can legitimately
	// arrive before any tab button exists yet.
	await preloadBundle();
	const harness = bootWebviewUnsettled(buildInitialData());

	assert.equal(harness.window.document.getElementById('tab-mistral-cloud'), null, 'layout must not exist yet');
	harness.postSync({ command: 'switchTab', tab: 'mistral-cloud' });

	await harness.settle();

	const doc = harness.window.document;
	assert.ok(doc.querySelector('.group-tab[data-group="research"]')?.classList.contains('active'), 'expected the Research group tab to be active');
	assert.ok(doc.querySelector('.tab[data-tab="mistral-cloud"]')?.classList.contains('active'), 'expected the Mistral Cloud tab button to be active');
});

test('a switchTab message naming an unknown tab is ignored rather than breaking navigation', async () => {
	await preloadBundle();
	const harness = bootWebviewUnsettled(buildInitialData());
	await harness.settle();

	harness.post({ command: 'switchTab', tab: 'not-a-real-tab' });
	await harness.settle();

	const doc = harness.window.document;
	assert.ok(doc.querySelector('.tab[data-tab="report"]')?.classList.contains('active'), 'expected the default report tab to remain active');
});

test('Mistral Cloud tab: neither Connect nor Refresh render before the Mistral status is known', async () => {
	// A real diagnostics load has no mistralCloudSessionsStatus in its initial payload — it arrives
	// later via its own dedicated message (posted independently of backendStorageInfoLoaded, so the
	// key status doesn't wait on backend storage's session discovery). Defaulting to "not
	// configured" in the meantime would let a user with an existing key click Connect and overwrite
	// it before the real status shows up.
	await preloadBundle();
	const harness = bootWebviewUnsettled(buildInitialData());
	await harness.settle();

	assert.equal(harness.window.document.getElementById('btn-mistral-connect'), null, 'Connect must not render before status is known');
	assert.equal(harness.window.document.getElementById('btn-mistral-refresh'), null, 'Refresh must not render before status is known');

	harness.post({
		command: 'backendStorageInfoLoaded',
		backendStorageInfo: configuredBackendStorageInfo(),
		githubAuth: { authenticated: false },
	});
	await harness.settle();
	assert.equal(harness.window.document.getElementById('btn-mistral-refresh'), null, 'Refresh must still not render — backendStorageInfoLoaded no longer carries the Mistral status');

	harness.post({ command: 'mistralCloudSessionsStatus', mistralCloudSessionsStatus: { apiKeyConfigured: true } });
	await harness.settle();

	assert.ok(harness.window.document.getElementById('btn-mistral-refresh'), 'expected Refresh once status arrives and reports a configured key');
});

test('Mistral Cloud tab: an ambiguous error result arriving before any status message does not render Connect', async () => {
	// A key-check-failure result (authenticated: false, a non-empty error) leaves
	// currentMistralApiKeyConfigured untouched in handleMistralCloudSessionsResult — it must not
	// also be treated as "status known" purely because *a* result arrived, or a transient failure
	// would render Connect over a key that may still be configured.
	await preloadBundle();
	const harness = bootWebviewUnsettled(buildInitialData());
	await harness.settle();

	harness.post({
		command: 'mistralCloudSessionsResult',
		result: { conversations: [], totalCount: 0, authenticated: false, fetchedAt: '', error: "Couldn't verify the Mistral API key is still current; try Refresh again." },
	});
	await harness.settle();

	assert.equal(harness.window.document.getElementById('btn-mistral-connect'), null, 'Connect must not render from an ambiguous error result alone');
	assert.equal(harness.window.document.getElementById('btn-mistral-refresh'), null, 'Refresh must not render from an ambiguous error result alone');
});

test('Mistral Cloud tab: Connect posts promptMistralApiKey when no key is configured', async () => {
	await preloadBundle();
	const harness = bootWebviewUnsettled(buildInitialData({ mistralCloudSessionsStatus: { apiKeyConfigured: false } }));
	await harness.settle();

	const connectButton = harness.window.document.getElementById('btn-mistral-connect') as HTMLButtonElement | null;
	assert.ok(connectButton, 'expected a Connect button when no API key is configured');
	assert.equal(harness.window.document.getElementById('btn-mistral-refresh'), null, 'Refresh should not render before a key is configured');
	connectButton!.click();

	const posted = harness.posted.find((m) => m.command === 'promptMistralApiKey');
	assert.ok(posted, `expected a promptMistralApiKey message, got: ${JSON.stringify(harness.posted)}`);
});

test('Mistral Cloud tab: Refresh and Remove API key post their commands once a key is configured', async () => {
	await preloadBundle();
	const harness = bootWebviewUnsettled(buildInitialData({ mistralCloudSessionsStatus: { apiKeyConfigured: true } }));
	await harness.settle();

	const refreshButton = harness.window.document.getElementById('btn-mistral-refresh') as HTMLButtonElement | null;
	const disconnectButton = harness.window.document.getElementById('btn-mistral-disconnect') as HTMLButtonElement | null;
	assert.ok(refreshButton, 'expected a Refresh button once an API key is configured');
	assert.ok(disconnectButton, 'expected a Remove API key button once an API key is configured');

	refreshButton!.click();
	assert.ok(
		harness.posted.some((m) => m.command === 'refreshMistralCloudSessions'),
		`expected a refreshMistralCloudSessions message, got: ${JSON.stringify(harness.posted)}`,
	);

	disconnectButton!.click();
	assert.ok(
		harness.posted.some((m) => m.command === 'clearMistralApiKey'),
		`expected a clearMistralApiKey message, got: ${JSON.stringify(harness.posted)}`,
	);
});

test('Mistral Cloud tab: a mistralCloudSessionsResult message rerenders the tab with fetched conversations', async () => {
	await preloadBundle();
	const harness = bootWebviewUnsettled(buildInitialData({ mistralCloudSessionsStatus: { apiKeyConfigured: true } }));
	await harness.settle();

	harness.post({
		command: 'mistralCloudSessionsResult',
		result: {
			conversations: [{
				id: 'conv-123', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-02T00:00:00Z',
				agentId: 'agent-1', name: 'My beta conversation', description: null, agentVersion: '1',
			}],
			totalCount: 1,
			authenticated: true,
			fetchedAt: '2026-01-02T00:00:00Z',
			error: '',
		},
	});
	await harness.settle();

	const rendered = harness.text('#tab-mistral-cloud');
	assert.ok(rendered?.includes('My beta conversation'), `expected the fetched conversation name, got: ${rendered}`);
});

test('Mistral Cloud tab: a totalIsLowerBound result renders "N+" instead of a fabricated "N of N+1"', async () => {
	await preloadBundle();
	const harness = bootWebviewUnsettled(buildInitialData({ mistralCloudSessionsStatus: { apiKeyConfigured: true } }));
	await harness.settle();

	harness.post({
		command: 'mistralCloudSessionsResult',
		result: {
			conversations: Array.from({ length: 2000 }, (_, i) => ({
				id: `conv-${i}`, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-02T00:00:00Z',
				agentId: 'agent-1', name: `Conversation ${i}`, description: null, agentVersion: '1',
			})),
			totalCount: 2000,
			totalIsLowerBound: true,
			authenticated: true,
			fetchedAt: '2026-01-02T00:00:00Z',
			error: '',
		},
	});
	await harness.settle();

	const rendered = harness.text('#tab-mistral-cloud');
	assert.ok(rendered?.includes('2,000+'), `expected a lower-bound "2,000+" count, got: ${rendered}`);
	assert.ok(!rendered?.includes('2,000 of'), `expected no fabricated "of" total, got: ${rendered}`);
});

test('Mistral Cloud tab: a status update reporting the key removed clears a previously cached result', async () => {
	await preloadBundle();
	const harness = bootWebviewUnsettled(buildInitialData({ mistralCloudSessionsStatus: { apiKeyConfigured: true } }));
	await harness.settle();

	harness.post({
		command: 'mistralCloudSessionsResult',
		result: {
			conversations: [{
				id: 'conv-123', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-02T00:00:00Z',
				agentId: 'agent-1', name: 'Old account conversation', description: null, agentVersion: '1',
			}],
			totalCount: 1,
			authenticated: true,
			fetchedAt: '2026-01-02T00:00:00Z',
			error: '',
		},
	});
	await harness.settle();
	assert.ok(harness.text('#tab-mistral-cloud')?.includes('Old account conversation'));

	// A later status refresh (its own dedicated message, posted on every diagnostics load
	// independently of backendStorageInfoLoaded) reports the key was removed, possibly from another
	// window. The stale cached result must not linger and keep showing the old account's
	// conversations with the Refresh/Remove buttons.
	harness.post({ command: 'mistralCloudSessionsStatus', mistralCloudSessionsStatus: { apiKeyConfigured: false } });
	await harness.settle();

	const rendered = harness.text('#tab-mistral-cloud');
	assert.ok(!rendered?.includes('Old account conversation'), `expected the stale conversation to be cleared, got: ${rendered}`);
	assert.ok(harness.window.document.getElementById('btn-mistral-connect'), 'expected the Connect button to reappear');
	assert.equal(harness.window.document.getElementById('btn-mistral-refresh'), null, 'Refresh must not remain after the key is reported removed');
});

test('Mistral Cloud tab: a cache-invalidated message clears the stale listing without flipping to Connect', async () => {
	// Distinct from the "key removed" case above: here the key is still configured (just a
	// different one than the cached listing belongs to), so the tab must stay in the
	// Refresh/Remove state, not fall back to Connect.
	await preloadBundle();
	const harness = bootWebviewUnsettled(buildInitialData({ mistralCloudSessionsStatus: { apiKeyConfigured: true } }));
	await harness.settle();

	harness.post({
		command: 'mistralCloudSessionsResult',
		result: {
			conversations: [{
				id: 'conv-123', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-02T00:00:00Z',
				agentId: 'agent-1', name: 'Old account conversation', description: null, agentVersion: '1',
			}],
			totalCount: 1,
			authenticated: true,
			fetchedAt: '2026-01-02T00:00:00Z',
			error: '',
		},
	});
	await harness.settle();
	assert.ok(harness.text('#tab-mistral-cloud')?.includes('Old account conversation'));

	harness.post({ command: 'mistralCloudSessionsCacheInvalidated' });
	await harness.settle();

	const rendered = harness.text('#tab-mistral-cloud');
	assert.ok(!rendered?.includes('Old account conversation'), `expected the stale conversation to be cleared, got: ${rendered}`);
	assert.ok(harness.window.document.getElementById('btn-mistral-refresh'), 'expected Refresh to remain — the key is still configured, just a different one');
	assert.equal(harness.window.document.getElementById('btn-mistral-connect'), null, 'Connect must not render — a key is still configured');
});

test('Mistral Cloud tab: a status update reporting the key removed mid-refresh does not leave Connect stuck disabled', async () => {
	await preloadBundle();
	const harness = bootWebviewUnsettled(buildInitialData({ mistralCloudSessionsStatus: { apiKeyConfigured: true } }));
	await harness.settle();
	const refreshButton = () => harness.window.document.getElementById('btn-mistral-refresh') as HTMLButtonElement | null;
	const connectButton = () => harness.window.document.getElementById('btn-mistral-connect') as HTMLButtonElement | null;

	assert.ok(refreshButton(), 'expected a Refresh button when a key is configured');
	refreshButton()!.click();
	await harness.settle();
	assert.equal(refreshButton()?.disabled, true, 'expected Refresh to disable itself while the request is in flight');

	// The key is removed (e.g. from another VS Code window) while this window's refresh is still
	// in flight. The host silently discards a superseded generation rather than posting a final
	// result, so this status message may be the only signal this window ever gets.
	harness.post({ command: 'mistralCloudSessionsStatus', mistralCloudSessionsStatus: { apiKeyConfigured: false } });
	await harness.settle();

	assert.ok(connectButton(), 'expected Connect to render after the key is reported removed');
	assert.equal(connectButton()?.disabled, false, 'expected Connect to be clickable, not stuck disabled by the superseded in-flight refresh');
});

test('Mistral Cloud tab: a status-check failure renders a Retry control that re-requests the status', async () => {
	await preloadBundle();
	const harness = bootWebviewUnsettled(buildInitialData());
	await harness.settle();
	assert.equal(harness.window.document.getElementById('btn-mistral-retry-status'), null, 'no Retry control before any failure is reported');

	harness.post({ command: 'mistralCloudSessionsStatusCheckFailed' });
	await harness.settle();

	const retryButton = harness.window.document.getElementById('btn-mistral-retry-status') as HTMLButtonElement | null;
	assert.ok(retryButton, 'expected a Retry control once the status check is reported as failed');
	assert.equal(harness.window.document.getElementById('btn-mistral-connect'), null, 'Connect must still not render — the status remains unknown, not "not configured"');

	retryButton!.click();
	const posted = harness.posted.find((m) => m.command === 'retryMistralCloudSessionsStatus');
	assert.ok(posted, `expected a retryMistralCloudSessionsStatus message, got: ${JSON.stringify(harness.posted)}`);
});

test('Mistral Cloud tab: an error result rerenders the tab with the error box, not stale success state', async () => {
	await preloadBundle();
	const harness = bootWebviewUnsettled(buildInitialData({ mistralCloudSessionsStatus: { apiKeyConfigured: true } }));
	await harness.settle();

	harness.post({
		command: 'mistralCloudSessionsResult',
		result: { conversations: [], totalCount: 0, authenticated: false, fetchedAt: '2026-01-02T00:00:00Z', error: 'HTTP 401' },
	});
	await harness.settle();

	const rendered = harness.text('#tab-mistral-cloud');
	assert.ok(rendered?.includes('HTTP 401'), `expected the error text to render, got: ${rendered}`);
});

test('Mistral Cloud tab: Refresh disables itself while the request is in flight and a second click does not post twice', async () => {
	await preloadBundle();
	const harness = bootWebviewUnsettled(buildInitialData({ mistralCloudSessionsStatus: { apiKeyConfigured: true } }));
	await harness.settle();
	const refreshButton = () => harness.window.document.getElementById('btn-mistral-refresh') as HTMLButtonElement | null;

	refreshButton()!.click();
	assert.equal(
		harness.posted.filter((m) => m.command === 'refreshMistralCloudSessions').length, 1,
		'the first click should post exactly one refresh request',
	);
	assert.ok(refreshButton()?.disabled, 'Refresh must be disabled while its request is in flight');

	// A rapid second click while disabled must not fire a second request against the rate-limited
	// beta API — clicking a disabled native button wouldn't dispatch anyway, but the handler itself
	// also guards on the in-flight flag so this holds regardless of DOM disabled-click semantics.
	refreshButton()!.click();
	assert.equal(
		harness.posted.filter((m) => m.command === 'refreshMistralCloudSessions').length, 1,
		'a click while a request is already in flight must not post a second one',
	);

	// The interim "authenticated, still empty" marker the host posts right as the fetch starts
	// must not re-enable the button — only a final result (with fetchedAt set) should.
	harness.post({
		command: 'mistralCloudSessionsResult',
		result: { conversations: [], totalCount: 0, authenticated: true, fetchedAt: '', error: '' },
	});
	await harness.settle();
	assert.ok(refreshButton()?.disabled, 'the interim loading marker must not re-enable Refresh');

	harness.post({
		command: 'mistralCloudSessionsResult',
		result: { conversations: [], totalCount: 0, authenticated: true, fetchedAt: '2026-01-02T00:00:00Z', error: '' },
	});
	await harness.settle();
	assert.equal(refreshButton()?.disabled, false, 'a final result must re-enable Refresh');

	refreshButton()!.click();
	assert.equal(
		harness.posted.filter((m) => m.command === 'refreshMistralCloudSessions').length, 2,
		'once re-enabled, Refresh must be clickable again',
	);
});

test('Mistral Cloud tab: Connect disables itself while the prompt is in flight and re-enables on cancellation', async () => {
	await preloadBundle();
	const harness = bootWebviewUnsettled(buildInitialData({ mistralCloudSessionsStatus: { apiKeyConfigured: false } }));
	await harness.settle();
	const connectButton = () => harness.window.document.getElementById('btn-mistral-connect') as HTMLButtonElement | null;

	connectButton()!.click();
	assert.equal(harness.posted.filter((m) => m.command === 'promptMistralApiKey').length, 1);
	assert.ok(connectButton()?.disabled, 'Connect must be disabled while the prompt is in flight');

	connectButton()!.click();
	assert.equal(
		harness.posted.filter((m) => m.command === 'promptMistralApiKey').length, 1,
		'a click while the prompt is already in flight must not open a second one',
	);

	// The user cancelled the native input box (e.g. pressed Escape) — no key was entered, so no
	// mistralCloudSessionsResult message ever follows; mistralCloudPromptCancelled is the only
	// signal that re-enables the button in that case.
	harness.post({ command: 'mistralCloudPromptCancelled' });
	await harness.settle();
	assert.equal(connectButton()?.disabled, false, 'a cancelled prompt must re-enable Connect');

	connectButton()!.click();
	assert.equal(harness.posted.filter((m) => m.command === 'promptMistralApiKey').length, 2);
});
