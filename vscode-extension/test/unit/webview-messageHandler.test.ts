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
