import test from 'node:test';
import * as assert from 'node:assert/strict';

import { getModelDisplayName } from '../../src/webview/shared/modelUtils';
import {
	setFormatLocale,
	getEditorIcon,
	getCharsPerToken,
	formatFixed,
	formatPercent,
	formatNumber,
	formatCost,
	escapeHtml,
	markdownToHtml,
	STAGE_LABELS,
	STAGE_DESCRIPTIONS
} from '../../src/webview/shared/formatUtils';

// ── getModelDisplayName ─────────────────────────────────────────────────

test('getModelDisplayName: returns display name for known models', () => {
	assert.equal(getModelDisplayName('gpt-4o'), 'GPT-4o');
	assert.equal(getModelDisplayName('claude-sonnet-4.5'), 'Claude Sonnet 4.5');
	assert.equal(getModelDisplayName('o3-mini'), 'o3-mini');
	assert.equal(getModelDisplayName('gpt-5'), 'GPT-5');
});

test('getModelDisplayName: returns raw model ID for unknown models', () => {
	assert.equal(getModelDisplayName('some-future-model-99'), 'some-future-model-99');
	assert.equal(getModelDisplayName(''), '');
});

test('getModelDisplayName: decodes URI-encoded segments in unknown model IDs', () => {
	assert.equal(
		getModelDisplayName('unify-chat-provider/OpenCode%20Go%20(Anthropic%20Messages)/qwen3.7-max'),
		'unify-chat-provider/OpenCode Go (Anthropic Messages)/qwen3.7-max'
	);
	assert.equal(getModelDisplayName('provider/Model%20Name'), 'provider/Model Name');
});

test('getModelDisplayName: returns raw ID when URI decoding fails (malformed percent)', () => {
	assert.equal(getModelDisplayName('bad%2model'), 'bad%2model');
});

// ── getEditorIcon ───────────────────────────────────────────────────────

test('getEditorIcon: returns correct icons for known editors', () => {
	assert.equal(getEditorIcon('VS Code'), '💙');
	assert.equal(getEditorIcon('Cursor'), '🖱️');
	assert.equal(getEditorIcon('OpenCode'), '🟢');
	assert.equal(getEditorIcon('Gemini CLI'), '💎');
	assert.equal(getEditorIcon('Unknown'), '❓');
});

test('getEditorIcon: returns fallback icon for unrecognized editors', () => {
	assert.equal(getEditorIcon('SomeNewEditor'), '📝');
});

// ── getCharsPerToken ────────────────────────────────────────────────────

test('getCharsPerToken: returns a positive number for known models', () => {
	const result = getCharsPerToken('gpt-4o');
	assert.ok(result > 0, 'chars per token should be positive');
	assert.ok(result < 20, 'chars per token should be reasonable');
});

test('getCharsPerToken: returns default for unknown models', () => {
	const result = getCharsPerToken('nonexistent-model-xyz');
	// Default ratio is 0.25, so 1/0.25 = 4
	assert.equal(result, 4);
});

// ── formatFixed ─────────────────────────────────────────────────────────

test('formatFixed: formats to specified decimal places', () => {
	setFormatLocale('en-US');
	assert.equal(formatFixed(3.14159, 2), '3.14');
	assert.equal(formatFixed(1000, 0), '1,000');
	assert.equal(formatFixed(0.5, 3), '0.500');
});

// ── formatPercent ───────────────────────────────────────────────────────

test('formatPercent: formats as percentage with default 1 decimal', () => {
	setFormatLocale('en-US');
	assert.equal(formatPercent(42.567), '42.6%');
	assert.equal(formatPercent(100, 0), '100%');
	assert.equal(formatPercent(0), '0.0%');
});

// ── formatNumber ────────────────────────────────────────────────────────

test('formatNumber: adds thousand separators', () => {
	setFormatLocale('en-US');
	assert.equal(formatNumber(1234567), '1,234,567');
	assert.equal(formatNumber(42), '42');
	assert.equal(formatNumber(0), '0');
});

// ── formatCost ──────────────────────────────────────────────────────────

test('formatCost: formats as USD with 2 decimal places', () => {
	setFormatLocale('en-US');
	const result = formatCost(1.23456789);
	assert.ok(result.includes('$'), 'should contain dollar sign');
	assert.ok(result.includes('1.23'), 'should round to 2 decimal places');
});

test('formatCost: zero cost', () => {
	setFormatLocale('en-US');
	const result = formatCost(0);
	assert.ok(result.includes('$'), 'should contain dollar sign');
	assert.ok(result.includes('0.00'), 'should show two decimal zeros');
});

// ── escapeHtml ──────────────────────────────────────────────────────────

test('escapeHtml: escapes ampersand, angle brackets, double quote, single quote', () => {
	assert.equal(escapeHtml('a & b'), 'a &amp; b');
	assert.equal(escapeHtml('<div>'), '&lt;div&gt;');
	assert.equal(escapeHtml('"quoted"'), '&quot;quoted&quot;');
	assert.equal(escapeHtml("it's"), 'it&#039;s');
});

test('escapeHtml: leaves safe text unchanged', () => {
	assert.equal(escapeHtml('hello world'), 'hello world');
});

test('escapeHtml: neutralises a script injection attempt', () => {
	const result = escapeHtml('<script>alert("xss")</script>');
	assert.ok(!result.includes('<script'));
	assert.equal(result, '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
});

// ── markdownToHtml ──────────────────────────────────────────────────────

test('markdownToHtml: converts markdown link to anchor tag', () => {
	const result = markdownToHtml('[click here](https://example.com)');
	assert.equal(result, '<a href="https://example.com" target="_blank" rel="noopener noreferrer">click here</a>');
});

test('markdownToHtml: escapes HTML outside of links', () => {
	const result = markdownToHtml('See <this> & [link](https://example.com)');
	assert.ok(result.includes('&lt;this&gt;'));
	assert.ok(result.includes('&amp;'));
	assert.ok(result.includes('<a href='));
});

test('markdownToHtml: plain text without links is just HTML-escaped', () => {
	assert.equal(markdownToHtml('hello & world'), 'hello &amp; world');
});

test('markdownToHtml: generated anchor has target=_blank and rel=noopener noreferrer', () => {
	const result = markdownToHtml('[docs](https://docs.example.com)');
	assert.ok(result.includes('target="_blank"'));
	assert.ok(result.includes('rel="noopener noreferrer"'));
});

// ── STAGE_LABELS ────────────────────────────────────────────────────────

test('STAGE_LABELS: defines labels for all four stages', () => {
	assert.equal(STAGE_LABELS[1], 'Stage 1: AI Skeptic');
	assert.equal(STAGE_LABELS[2], 'Stage 2: AI Explorer');
	assert.equal(STAGE_LABELS[3], 'Stage 3: AI Collaborator');
	assert.equal(STAGE_LABELS[4], 'Stage 4: AI Strategist');
});

// ── STAGE_DESCRIPTIONS ──────────────────────────────────────────────────

test('STAGE_DESCRIPTIONS: defines descriptions for all four stages', () => {
	assert.ok(STAGE_DESCRIPTIONS[1].length > 0);
	assert.ok(STAGE_DESCRIPTIONS[2].length > 0);
	assert.ok(STAGE_DESCRIPTIONS[3].length > 0);
	assert.ok(STAGE_DESCRIPTIONS[4].length > 0);
});
