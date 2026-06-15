import test from 'node:test';
import * as assert from 'node:assert/strict';

import { getModelBillingProvider, getBillingGroup, COPILOT_EDITOR_NAMES } from '../../src/chartDataBuilder';

// ── getModelBillingProvider ───────────────────────────────────────────────────

test('getModelBillingProvider: claude maps to Anthropic', () => {
	assert.equal(getModelBillingProvider('claude-3-5-sonnet'), 'Anthropic');
});

test('getModelBillingProvider: anthropic prefix maps to Anthropic', () => {
	assert.equal(getModelBillingProvider('anthropic-some-model'), 'Anthropic');
});

test('getModelBillingProvider: gemini maps to Google', () => {
	assert.equal(getModelBillingProvider('gemini-2.0-flash'), 'Google');
});

test('getModelBillingProvider: google prefix maps to Google', () => {
	assert.equal(getModelBillingProvider('google-something'), 'Google');
});

test('getModelBillingProvider: mistral maps to Mistral AI', () => {
	assert.equal(getModelBillingProvider('mistral-large'), 'Mistral AI');
});

test('getModelBillingProvider: codestral maps to Mistral AI', () => {
	assert.equal(getModelBillingProvider('codestral-latest'), 'Mistral AI');
});

test('getModelBillingProvider: magistral maps to Mistral AI', () => {
	assert.equal(getModelBillingProvider('magistral-medium'), 'Mistral AI');
});

test('getModelBillingProvider: gpt maps to OpenAI', () => {
	assert.equal(getModelBillingProvider('gpt-4o'), 'OpenAI');
});

test('getModelBillingProvider: o1 maps to OpenAI', () => {
	assert.equal(getModelBillingProvider('o1-mini'), 'OpenAI');
});

test('getModelBillingProvider: o3 maps to OpenAI', () => {
	assert.equal(getModelBillingProvider('o3'), 'OpenAI');
});

test('getModelBillingProvider: o4 maps to OpenAI', () => {
	assert.equal(getModelBillingProvider('o4-mini'), 'OpenAI');
});

test('getModelBillingProvider: grok maps to xAI', () => {
	assert.equal(getModelBillingProvider('grok-2'), 'xAI');
});

test('getModelBillingProvider: qwen maps to Alibaba', () => {
	assert.equal(getModelBillingProvider('qwen2.5-coder'), 'Alibaba');
});

test('getModelBillingProvider: mai- maps to Microsoft', () => {
	assert.equal(getModelBillingProvider('mai-ds-r1'), 'Microsoft');
});

test('getModelBillingProvider: unknown model maps to Other', () => {
	assert.equal(getModelBillingProvider('some-unknown-model'), 'Other');
});

test('getModelBillingProvider: case insensitive', () => {
	assert.equal(getModelBillingProvider('Claude-3-Opus'), 'Anthropic');
	assert.equal(getModelBillingProvider('GPT-4O'), 'OpenAI');
});

// ── getBillingGroup ───────────────────────────────────────────────────────────

test('getBillingGroup: VS Code editor returns GitHub Copilot', () => {
	assert.equal(getBillingGroup('VS Code', 'gpt-4o'), 'GitHub Copilot');
});

test('getBillingGroup: Visual Studio editor returns GitHub Copilot', () => {
	assert.equal(getBillingGroup('Visual Studio', 'claude-3-5-sonnet'), 'GitHub Copilot');
});

test('getBillingGroup: JetBrains editor returns GitHub Copilot', () => {
	assert.equal(getBillingGroup('JetBrains', 'gemini-2.0-flash'), 'GitHub Copilot');
});

test('getBillingGroup: Copilot CLI editor returns GitHub Copilot', () => {
	assert.equal(getBillingGroup('Copilot CLI', 'claude-sonnet-4-5'), 'GitHub Copilot');
});

test('getBillingGroup: Claude Code editor returns Anthropic from model', () => {
	assert.equal(getBillingGroup('Claude Code', 'claude-3-5-sonnet'), 'Anthropic');
});

test('getBillingGroup: Gemini CLI editor returns Google from model', () => {
	assert.equal(getBillingGroup('Gemini CLI', 'gemini-2.0-flash'), 'Google');
});

test('getBillingGroup: unknown editor with OpenAI model returns OpenAI', () => {
	assert.equal(getBillingGroup('Some Editor', 'gpt-4o'), 'OpenAI');
});

// ── COPILOT_EDITOR_NAMES ─────────────────────────────────────────────────────

test('COPILOT_EDITOR_NAMES includes VS Code', () => {
	assert.ok(COPILOT_EDITOR_NAMES.has('VS Code'));
});

test('COPILOT_EDITOR_NAMES includes Visual Studio', () => {
	assert.ok(COPILOT_EDITOR_NAMES.has('Visual Studio'));
});

test('COPILOT_EDITOR_NAMES includes JetBrains', () => {
	assert.ok(COPILOT_EDITOR_NAMES.has('JetBrains'));
});
