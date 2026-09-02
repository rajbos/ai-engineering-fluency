/// <reference path="../../src/types/jsdom.d.ts" />
import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { isTrustedWebviewMessageSource } from '../../src/webview/shared/messageHandler';

test('accepts extension-host messages with a null source', () => {
	const dom = new JSDOM();
	try {
		assert.equal(isTrustedWebviewMessageSource(null, dom.window as unknown as Window), true);
	} finally {
		dom.window.close();
	}
});

test('accepts messages from the top-level webview window', () => {
	const dom = new JSDOM();
	try {
		assert.equal(
			isTrustedWebviewMessageSource(dom.window, dom.window as unknown as Window),
			true,
		);
	} finally {
		dom.window.close();
	}
});

test('rejects messages from a child frame', () => {
	const dom = new JSDOM('<iframe></iframe>');
	try {
		const childWindow = dom.window.document.querySelector('iframe')?.contentWindow;
		assert.ok(childWindow);
		assert.equal(
			isTrustedWebviewMessageSource(childWindow, dom.window as unknown as Window),
			false,
		);
	} finally {
		dom.window.close();
	}
});

test('accepts messages delivered from the hosting frame', () => {
	// VS Code does not guarantee a null source for extension-host messages; when it delivers
	// them from the frame hosting the webview, rejecting the parent kills the entire
	// extension → webview direction while postMessage still reports success.
	const dom = new JSDOM('<iframe></iframe>');
	try {
		const childWindow = dom.window.document.querySelector('iframe')?.contentWindow;
		assert.ok(childWindow);
		assert.equal(
			isTrustedWebviewMessageSource(dom.window as unknown as MessageEventSource, childWindow as unknown as Window),
			true,
			'the parent frame must be trusted from inside a nested webview frame',
		);
	} finally {
		dom.window.close();
	}
});

test('accepts messages relayed from an unidentifiable same-origin window', () => {
	// This is exactly how VS Code delivers extension-host messages: a window object that is
	// neither null, nor this window, nor parent/top, stamped with the webview's own origin.
	// Rejecting it silently discarded every extension → webview message.
	const dom = new JSDOM('', { url: 'vscode-webview://abc123/index.html?id=1' });
	try {
		const relay = {} as unknown as MessageEventSource;
		assert.equal(
			isTrustedWebviewMessageSource(relay, dom.window as unknown as Window, 'vscode-webview://abc123'),
			true,
		);
	} finally {
		dom.window.close();
	}
});

test('rejects messages relayed from a different origin', () => {
	const dom = new JSDOM('', { url: 'vscode-webview://abc123/index.html?id=1' });
	try {
		const relay = {} as unknown as MessageEventSource;
		assert.equal(
			isTrustedWebviewMessageSource(relay, dom.window as unknown as Window, 'https://evil.example'),
			false,
		);
	} finally {
		dom.window.close();
	}
});

test('accepts messages with an undefined source', () => {
	const dom = new JSDOM();
	try {
		assert.equal(
			isTrustedWebviewMessageSource(undefined as unknown as MessageEventSource, dom.window as unknown as Window),
			true,
		);
	} finally {
		dom.window.close();
	}
});
