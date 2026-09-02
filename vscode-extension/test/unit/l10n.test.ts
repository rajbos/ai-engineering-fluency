import test from 'node:test';
import * as assert from 'node:assert/strict';

import * as vscode from 'vscode';
import { t } from '../../src/l10n';

const mock = (vscode as any).__mock;

// The shim's default l10n.t returns the raw key — exactly what real VS Code
// does for key-based calls on the default (English) display language.

test('l10n: VS Code-provided bundle translation takes precedence', () => {
	mock.setL10nBundle({ 'statusBar.loadingText': 'Chargement…' });
	assert.equal(t('statusBar.loadingText'), 'Chargement…');
	mock.setL10nBundle(null);
});

test('l10n: VS Code bundle args are passed through', () => {
	mock.setL10nBundle({ 'statusBar.analyzingLogs': 'Analyse: {0}%' });
	assert.equal(t('statusBar.analyzingLogs', '42'), 'Analyse: 42%');
	mock.setL10nBundle(null);
});

test('l10n: resolves English from the inlined package.nls.json when VS Code returns the raw key', () => {
	const value = t('statusBar.loadingText');
	assert.notEqual(value, 'statusBar.loadingText');
	assert.ok(value.includes('AI Fluency'), `expected English text, got: ${value}`);
});

test('l10n: inlined fallback formats {0} placeholders', () => {
	assert.equal(t('statusBar.analyzingLogs', '42'), '$(loading~spin) Analyzing Logs: 42%');
});

test('l10n: resolves zh-cn strings when the display language is zh-cn', () => {
	mock.setLanguage('zh-cn');
	assert.equal(t('nav.btnRefresh'), '刷新');
	mock.setLanguage('en');
});

test('l10n: bare language tag zh matches the zh-cn bundle', () => {
	mock.setLanguage('zh');
	assert.equal(t('nav.btnRefresh'), '刷新');
	mock.setLanguage('en');
});

test('l10n: zh-tw does not get the Simplified Chinese bundle', () => {
	mock.setLanguage('zh-tw');
	assert.equal(t('nav.btnRefresh'), 'Refresh');
	mock.setLanguage('en');
});

test('l10n: unknown key returns the key itself and warns once', () => {
	const warnings: string[] = [];
	const originalWarn = console.warn;
	console.warn = (msg: unknown) => { warnings.push(String(msg)); };
	try {
		assert.equal(t('no.such.key.exists'), 'no.such.key.exists');
		t('no.such.key.exists');
	} finally {
		console.warn = originalWarn;
	}
	assert.equal(warnings.length, 1);
	assert.ok(warnings[0].includes('No localization found for key "no.such.key.exists"'));
});

// Keys added for the dialog/toast buttons and insights status bar name
// (PR #1876 follow-up) — guards against raw keys resurfacing in the UI.
test('l10n: dialog button and insights status bar keys resolve in English', () => {
	const expected: Record<string, string> = {
		'statusBar.nameInsights': 'AI Engineering Fluency — Insights',
		'button.openSettings': 'Open Settings',
		'button.openUsageAnalysis': 'Open Usage Analysis',
		'button.openInsightsTab': 'Open Insights tab',
		'button.removeOldExtension': 'Remove Old Extension',
		'button.dismiss': 'Dismiss',
	};
	for (const [key, english] of Object.entries(expected)) {
		assert.equal(t(key), english, `English value for ${key}`);
	}
});

test('l10n: dialog button and insights status bar keys resolve in zh-cn', () => {
	mock.setLanguage('zh-cn');
	try {
		const expected: Record<string, string> = {
			'statusBar.nameInsights': 'AI 工程熟练度 —— 洞察',
			'button.openSettings': '打开设置',
			'button.openUsageAnalysis': '打开使用分析',
			'button.openInsightsTab': '打开洞察标签页',
			'button.removeOldExtension': '删除旧扩展',
			'button.dismiss': '忽略',
		};
		for (const [key, chinese] of Object.entries(expected)) {
			assert.equal(t(key), chinese, `zh-cn value for ${key}`);
		}
	} finally {
		mock.setLanguage('en');
	}
});
