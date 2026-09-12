#!/usr/bin/env node
/**
 * Unit tests for check-hardcoded-strings.mjs — the AST-based detector that
 * flags UI-rendering string literals bypassing localize()/t()/vscode.l10n.t().
 *
 * Run with: node --test scripts/check-hardcoded-strings.test.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { looksProse, scanFile, hashLine, isLocalizationCall, isConsoleCall } from './check-hardcoded-strings.mjs';

// ── looksProse ───────────────────────────────────────────────────────────────

test('looksProse: prose strings are flagged', () => {
	assert.equal(looksProse('Refresh'), true);
	assert.equal(looksProse('Usage Analysis'), true);
	assert.equal(looksProse('One model solved the task on its own'), true);
});

test('looksProse: numbers, symbols, and empty strings are not prose', () => {
	assert.equal(looksProse(''), false);
	assert.equal(looksProse('42'), false);
	assert.equal(looksProse('%'), false);
	assert.equal(looksProse('{0}%'), false);
});

test('looksProse: URLs and protocol strings are not prose', () => {
	assert.equal(looksProse('https://example.com/docs'), false);
	assert.equal(looksProse('//example.com/path'), false);
	assert.equal(looksProse('vscode-resource://foo/bar'), false);
});

test('looksProse: CSS values are not prose', () => {
	assert.equal(looksProse('16px'), false);
	assert.equal(looksProse('1.5em'), false);
	assert.equal(looksProse('#fff'), false);
	assert.equal(looksProse('#ff00aa'), false);
	assert.equal(looksProse('rgba(0,0,0,0.5)'), false);
	assert.equal(looksProse('var(--foo-bar)'), false);
});

test('looksProse: kebab-case class/id tokens are not prose', () => {
	assert.equal(looksProse('nav-btn-refresh'), false);
	assert.equal(looksProse('usage-analysis-panel'), false);
});

test('looksProse: single-word camelCase identifiers are not prose, but camelCase with spaces is', () => {
	assert.equal(looksProse('myVariableName'), false);
	assert.equal(looksProse('myVariableName is set'), true);
});

// ── hashLine ─────────────────────────────────────────────────────────────────

test('hashLine: stable for identical content, differs for different content', () => {
	assert.equal(hashLine('el.title = "Refresh";'), hashLine('el.title = "Refresh";'));
	assert.notEqual(hashLine('el.title = "Refresh";'), hashLine('el.title = "Other";'));
});

// ── isLocalizationCall / isConsoleCall ────────────────────────────────────────

test('isLocalizationCall: recognizes localize/t/l10n.t call chains', () => {
	assert.equal(isLocalizationCall('localize'), true);
	assert.equal(isLocalizationCall('localizeFormat'), true);
	assert.equal(isLocalizationCall('t'), true);
	assert.equal(isLocalizationCall('l10n.t'), true);
	assert.equal(isLocalizationCall('vscode.l10n.t'), true);
	assert.equal(isLocalizationCall('somethingElse'), false);
	assert.equal(isLocalizationCall(null), false);
});

test('isConsoleCall: recognizes console.* call chains', () => {
	assert.equal(isConsoleCall('console.log'), true);
	assert.equal(isConsoleCall('console.warn'), true);
	assert.equal(isConsoleCall('console.error'), true);
	assert.equal(isConsoleCall('console.table'), false);
	assert.equal(isConsoleCall(null), false);
});

// ── scanFile (end-to-end AST scan against a real temp .ts file) ─────────────

function withTempFile(content, run) {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'check-hardcoded-strings-test-'));
	const filePath = path.join(dir, 'fixture.ts');
	fs.writeFileSync(filePath, content);
	try {
		return run(filePath);
	} finally {
		fs.rmSync(dir, { recursive: true, force: true });
	}
}

test('scanFile: flags a hardcoded .textContent assignment', () => {
	withTempFile(`el.textContent = 'Refresh';\n`, (filePath) => {
		const violations = [];
		scanFile(filePath, new Set(), violations);
		assert.equal(violations.length, 1);
		assert.equal(violations[0].text, 'Refresh');
		assert.match(violations[0].reason, /assignment to \.textContent/);
	});
});

test('scanFile: does not flag a literal passed to localize()/t()/vscode.l10n.t()', () => {
	withTempFile(
		`el.textContent = localize('nav.btnRefresh');\nother.title = t('some.key');\nthird.title = vscode.l10n.t('another.key');\n`,
		(filePath) => {
			const violations = [];
			scanFile(filePath, new Set(), violations);
			assert.equal(violations.length, 0);
		},
	);
});

test('scanFile: does not flag console.log/warn/error arguments', () => {
	withTempFile(`console.log('Refreshing the view now');\nconsole.error('Something went wrong here');\n`, (filePath) => {
		const violations = [];
		scanFile(filePath, new Set(), violations);
		assert.equal(violations.length, 0);
	});
});

test('scanFile: flags prose text content inside an HTML template literal tag', () => {
	withTempFile('const html = `<h2>Usage Analysis</h2>`;\n', (filePath) => {
		const violations = [];
		scanFile(filePath, new Set(), violations);
		assert.equal(violations.length, 1);
		assert.equal(violations[0].text, 'Usage Analysis');
	});
});

test('scanFile: flags aria-label/title attribute values in a template literal, but not class/id attributes', () => {
	withTempFile(
		'const html = `<button class="nav-btn-refresh" id="refresh-btn" aria-label="Refresh the session list"></button>`;\n',
		(filePath) => {
			const violations = [];
			scanFile(filePath, new Set(), violations);
			assert.equal(violations.length, 1);
			assert.equal(violations[0].text, 'Refresh the session list');
		},
	);
});

test('scanFile: an inline "i18n-exempt" comment on the same line suppresses the finding', () => {
	withTempFile(`el.title = 'AI Engineering Fluency'; // i18n-exempt: brand name\n`, (filePath) => {
		const violations = [];
		scanFile(filePath, new Set(), violations);
		assert.equal(violations.length, 0);
	});
});

test('scanFile: an inline "i18n-exempt" comment on the line above suppresses the finding', () => {
	withTempFile(`// i18n-exempt: brand name\nel.title = 'AI Engineering Fluency';\n`, (filePath) => {
		const violations = [];
		scanFile(filePath, new Set(), violations);
		assert.equal(violations.length, 0);
	});
});

test('scanFile: an allowlisted literal is not flagged', () => {
	withTempFile(`el.title = 'AI Engineering Fluency';\n`, (filePath) => {
		const violations = [];
		scanFile(filePath, new Set(['AI Engineering Fluency']), violations);
		assert.equal(violations.length, 0);
	});
});

test('scanFile: numeric/CSS-only literals in a UI-rendering position are not flagged', () => {
	withTempFile(`el.title = '42';\nother.style.width = '16px';\n`, (filePath) => {
		const violations = [];
		scanFile(filePath, new Set(), violations);
		assert.equal(violations.length, 0);
	});
});
