/// <reference path="../../src/types/jsdom.d.ts" />
import test from 'node:test';
import * as assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { wireExtensionPointButtons } from '../../src/webview/shared/extensionPoints';

/**
 * `wireExtensionPointButtons` reads/writes the ambient `window`/`document` at call time (it has
 * no injectable DOM), so these tests point the Node.js globals at a fresh jsdom `Window` per
 * test rather than bundling the module — there is no webview `main.ts` entry point to bundle,
 * this is a small shared helper used by all nine panels.
 */
function setupDom(initialButtons?: Array<{ id: string; label: string }>): {
	window: any;
	postExtensionPointButtonsUpdated: (buttons: Array<{ id: string; label: string }>) => void;
	buttonIds: () => string[];
} {
	const dom = new JSDOM('<!DOCTYPE html><html><body><div class="button-row"></div></body></html>', {
		url: 'https://example.org/',
	});
	const window = dom.window as any;
	(global as any).window = window;
	(global as any).document = window.document;
	if (initialButtons) { window.__EXTENSION_POINT_BUTTONS__ = initialButtons; }

	return {
		window,
		postExtensionPointButtonsUpdated: (buttons) => {
			// Reproduces VS Code's real relay shape (see docs/vscode-extension/WEBVIEW-MESSAGING.md):
			// an unidentifiable source stamped with the webview's own origin.
			const event = new window.MessageEvent('message', {
				data: { command: 'extensionPointButtonsUpdated', buttons },
				origin: window.location.origin,
			});
			Object.defineProperty(event, 'source', { value: {} });
			window.dispatchEvent(event);
		},
		buttonIds: () => Array.from(window.document.querySelectorAll('.button-row [id^="ext-point-"]')).map((el: any) => el.id),
	};
}

test('wireExtensionPointButtons: renders the buttons present at HTML-generation time', () => {
	const { window, buttonIds } = setupDom([{ id: 'alpha', label: 'Alpha' }, { id: 'beta', label: 'Beta' }]);
	const posted: unknown[] = [];
	wireExtensionPointButtons({ postMessage: (m) => posted.push(m) });

	assert.deepEqual(buttonIds(), ['ext-point-alpha', 'ext-point-beta']);
	assert.equal(window.document.getElementById('ext-point-alpha').textContent, 'Alpha');
});

test('wireExtensionPointButtons: a button click posts extensionPointAction with its id', () => {
	const { window } = setupDom([{ id: 'alpha', label: 'Alpha' }]);
	const posted: any[] = [];
	wireExtensionPointButtons({ postMessage: (m) => posted.push(m) });

	window.document.getElementById('ext-point-alpha').dispatchEvent(new window.Event('click'));

	assert.deepEqual(posted, [{ command: 'extensionPointAction', buttonId: 'alpha' }]);
});

test('wireExtensionPointButtons: a button registered by a companion extension after this panel opened appears live', () => {
	// This is the PR #1919 follow-up scenario: registerExtensionPointButton() was called after
	// this panel's HTML (and its window.__EXTENSION_POINT_BUTTONS__ snapshot) was already
	// generated. Before host -> webview messaging worked, this button could never appear here.
	const { buttonIds, postExtensionPointButtonsUpdated } = setupDom([{ id: 'alpha', label: 'Alpha' }]);
	wireExtensionPointButtons({ postMessage: () => {} });
	assert.deepEqual(buttonIds(), ['ext-point-alpha']);

	postExtensionPointButtonsUpdated([{ id: 'alpha', label: 'Alpha' }, { id: 'beta', label: 'Beta' }]);

	assert.deepEqual(buttonIds(), ['ext-point-alpha', 'ext-point-beta']);
});

test('wireExtensionPointButtons: disposing a companion button removes it from an already-open panel', () => {
	const { buttonIds, postExtensionPointButtonsUpdated } = setupDom([
		{ id: 'alpha', label: 'Alpha' },
		{ id: 'beta', label: 'Beta' },
	]);
	wireExtensionPointButtons({ postMessage: () => {} });
	assert.deepEqual(buttonIds(), ['ext-point-alpha', 'ext-point-beta']);

	postExtensionPointButtonsUpdated([{ id: 'alpha', label: 'Alpha' }]);

	assert.deepEqual(buttonIds(), ['ext-point-alpha']);
});

test('wireExtensionPointButtons: repeated updates with the same button never duplicate it', () => {
	// wireExtensionPointButtons's own initial render plus every later extensionPointButtonsUpdated
	// message reconcile the same .button-row; a naive re-render that always appends would
	// duplicate a button on the very next unrelated update.
	const { buttonIds, postExtensionPointButtonsUpdated } = setupDom([{ id: 'alpha', label: 'Alpha' }]);
	wireExtensionPointButtons({ postMessage: () => {} });

	postExtensionPointButtonsUpdated([{ id: 'alpha', label: 'Alpha' }, { id: 'beta', label: 'Beta' }]);
	postExtensionPointButtonsUpdated([{ id: 'alpha', label: 'Alpha' }, { id: 'beta', label: 'Beta' }]);
	postExtensionPointButtonsUpdated([{ id: 'alpha', label: 'Alpha' }, { id: 'beta', label: 'Beta' }]);

	assert.deepEqual(buttonIds(), ['ext-point-alpha', 'ext-point-beta']);
});

test('wireExtensionPointButtons: an untrusted extensionPointButtonsUpdated message is ignored', () => {
	const { window, buttonIds } = setupDom([{ id: 'alpha', label: 'Alpha' }]);
	wireExtensionPointButtons({ postMessage: () => {} });

	const event = new window.MessageEvent('message', {
		data: { command: 'extensionPointButtonsUpdated', buttons: [{ id: 'alpha', label: 'Alpha' }, { id: 'evil', label: 'Evil' }] },
		origin: 'https://evil.example',
	});
	Object.defineProperty(event, 'source', { value: {} });
	window.dispatchEvent(event);

	assert.deepEqual(buttonIds(), ['ext-point-alpha']);
});

test('wireExtensionPointButtons: no .button-row element is a silent no-op, not a throw', () => {
	const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', { url: 'https://example.org/' });
	const window = dom.window as any;
	(global as any).window = window;
	(global as any).document = window.document;
	window.__EXTENSION_POINT_BUTTONS__ = [{ id: 'alpha', label: 'Alpha' }];

	assert.doesNotThrow(() => wireExtensionPointButtons({ postMessage: () => {} }));
});

test('wireExtensionPointButtons: calling it again on the same window (e.g. a re-render) does not register a second message listener', () => {
	// Some panels call wireExtensionPointButtons after every render that rebuilds .button-row
	// (e.g. the chart panel, on every `updateChartData`). registerMessageHandler has no
	// dispose/dedupe of its own, so a naive re-run would add another `window` "message" listener
	// on every refresh -- leaking handlers and processing each future update once per
	// accumulated listener. The fix tracks a flag on `window` itself, which is why this test
	// reuses one jsdom window across two calls instead of setupDom's usual fresh-window-per-test.
	const { window } = setupDom([{ id: 'alpha', label: 'Alpha' }]);
	let messageListenerCount = 0;
	const originalAddEventListener = window.addEventListener.bind(window);
	window.addEventListener = (type: string, ...rest: unknown[]) => {
		if (type === 'message') { messageListenerCount++; }
		return originalAddEventListener(type, ...rest);
	};

	wireExtensionPointButtons({ postMessage: () => {} });
	wireExtensionPointButtons({ postMessage: () => {} });
	wireExtensionPointButtons({ postMessage: () => {} });

	assert.equal(messageListenerCount, 1);
});
