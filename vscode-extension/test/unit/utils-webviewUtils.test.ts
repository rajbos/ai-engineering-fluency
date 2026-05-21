import test from 'node:test';
import * as assert from 'node:assert/strict';

import { getNonce, buildCspMeta } from '../../src/utils/webviewUtils';

// ── getNonce ────────────────────────────────────────────────────────────

test('getNonce: returns a non-empty string', () => {
	const nonce = getNonce();
	assert.ok(nonce.length > 0, 'nonce should be non-empty');
});

test('getNonce: returns a hex string of 32 characters (16 bytes)', () => {
	const nonce = getNonce();
	assert.equal(nonce.length, 32, 'hex-encoded 16 bytes = 32 chars');
	assert.ok(/^[0-9a-f]+$/.test(nonce), 'nonce should be lowercase hex');
});

test('getNonce: returns a different nonce on each call', () => {
	const nonces = new Set(Array.from({ length: 20 }, () => getNonce()));
	assert.equal(nonces.size, 20, 'all 20 nonces should be unique');
});

// ── buildCspMeta ────────────────────────────────────────────────────────

function makeWebview(cspSource: string) {
	return { cspSource } as import('vscode').Webview;
}

test('buildCspMeta: returns a <meta> tag string', () => {
	const webview = makeWebview('vscode-webview-resource:');
	const nonce = getNonce();
	const result = buildCspMeta(webview, nonce);
	assert.ok(result.startsWith('<meta '), 'should start with <meta');
	assert.ok(result.includes('http-equiv="Content-Security-Policy"'), 'should include CSP http-equiv');
});

test('buildCspMeta: includes the nonce in script-src', () => {
	const webview = makeWebview('vscode-webview-resource:');
	const nonce = 'abc123';
	const result = buildCspMeta(webview, nonce);
	assert.ok(result.includes(`'nonce-abc123'`), 'should embed nonce in script-src');
});

test('buildCspMeta: includes webview.cspSource in img-src', () => {
	const webview = makeWebview('test-csp-source');
	const result = buildCspMeta(webview, getNonce());
	assert.ok(result.includes('test-csp-source'), 'should embed cspSource');
});

test('buildCspMeta: enforces default-src none', () => {
	const webview = makeWebview('vscode-webview-resource:');
	const result = buildCspMeta(webview, getNonce());
	assert.ok(result.includes(`default-src 'none'`), 'should block all origins by default');
});

test('buildCspMeta: includes font-src with cspSource and https: data:', () => {
	const webview = makeWebview('vscode-webview-resource:');
	const result = buildCspMeta(webview, getNonce());
	assert.ok(result.includes('font-src'), 'should include font-src directive');
	assert.ok(result.includes('https:'), 'should allow https fonts');
	assert.ok(result.includes('data:'), 'should allow data: fonts');
});

test('buildCspMeta: includes style-src with unsafe-inline and cspSource', () => {
	const webview = makeWebview('vscode-webview-resource:');
	const result = buildCspMeta(webview, getNonce());
	assert.ok(result.includes(`style-src`), 'should include style-src');
	assert.ok(result.includes(`'unsafe-inline'`), 'should allow unsafe-inline styles');
});
