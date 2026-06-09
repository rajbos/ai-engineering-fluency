import './vscode-shim-register';
import { test, describe } from 'node:test';
import * as assert from 'node:assert/strict';

import * as vscode from 'vscode';

import {
	buildBackendConfigClipboardPayload,
	copyBackendConfigToClipboard,
	getBackendConfigSummary
} from '../../src/backend/copyConfig';

const baseSettings: any = {
	enabled: true,
	backend: 'storageTables',
	authMode: 'entraId',
	datasetId: 'default',
	sharingProfile: 'soloFull',
	shareWithTeam: false,
	shareWorkspaceMachineNames: false,
	shareConsentAt: '',
	userIdentityMode: 'pseudonymous',
	userId: 'dev-01',
	userIdMode: 'alias',
	subscriptionId: 'sub',
	resourceGroup: 'rg',
	storageAccount: 'sa',
	aggTable: 'usageAggDaily',
	eventsTable: 'usageEvents',
	lookbackDays: 30,
	includeMachineBreakdown: true
};
describe('backend/copyConfig', { concurrency: false }, () => {
	test('getBackendConfigSummary formats key fields and masks userId presence', () => {
		const summary = getBackendConfigSummary(baseSettings);
		assert.ok(summary.includes('Backend Configuration:'));
		assert.ok(summary.includes('Enabled: true'));
		assert.ok(summary.includes('User ID: [SET]'));
	});

	test('buildBackendConfigClipboardPayload redacts userId and fully redacts machineId', () => {
		const payload = buildBackendConfigClipboardPayload(baseSettings);
		assert.equal(payload.version, 1);
		assert.equal(payload.config.userId, '[REDACTED]');
		assert.equal(payload.machineId, '<redacted>', 'machineId should be fully redacted');
		assert.equal(payload.config.sharingProfile, 'soloFull', 'sharingProfile should be included');
		assert.ok(payload.note.includes('machineId'), 'note should mention machineId');
		assert.ok(payload.note.includes('sessionId'), 'note should mention sessionId');
		assert.ok(payload.note.includes('home directory'), 'note should mention home directory');
	});

	test('copyBackendConfigToClipboard writes JSON to clipboard and shows success message', async () => {
		(vscode as any).__mock.reset();
		const mock = (vscode as any).__mock;
		const ok = await copyBackendConfigToClipboard(baseSettings);
		assert.equal(ok, true);
		assert.ok(mock.state.clipboardText.includes('"version": 1'));
		assert.ok(mock.state.lastInfoMessages.some((m: string) => m.includes('copied to clipboard')));
	});

	test('copyBackendConfigToClipboard returns false when clipboard write fails', async () => {
		(vscode as any).__mock.reset();
		const mock = (vscode as any).__mock;
		mock.setClipboardThrow(true);
		const ok = await copyBackendConfigToClipboard(baseSettings);
		assert.equal(ok, false);
		assert.ok(mock.state.lastErrorMessages.some((m: string) => m.includes('Failed to copy config')));
	});

	test('getBackendConfigSummary: userId not set shows [NOT SET]', () => {
		const settings = { ...baseSettings, userId: '' };
		const summary = getBackendConfigSummary(settings);
		assert.ok(summary.includes('User ID: [NOT SET]'));
	});

	test('getBackendConfigSummary: empty Azure resources show [NOT SET]', () => {
		const settings = { ...baseSettings, subscriptionId: '', resourceGroup: '', storageAccount: '' };
		const summary = getBackendConfigSummary(settings);
		assert.ok(summary.includes('Subscription: [NOT SET]'));
		assert.ok(summary.includes('Resource Group: [NOT SET]'));
		assert.ok(summary.includes('Storage Account: [NOT SET]'));
	});

	test('buildBackendConfigClipboardPayload: shareConsentAt set gets redacted timestamp', () => {
		const settings = { ...baseSettings, shareConsentAt: '2025-01-01T00:00:00.000Z' };
		const payload = buildBackendConfigClipboardPayload(settings);
		assert.equal(payload.config.shareConsentAt, '[REDACTED_TIMESTAMP]');
	});

	test('buildBackendConfigClipboardPayload: empty userId results in empty string in payload', () => {
		const settings = { ...baseSettings, userId: '' };
		const payload = buildBackendConfigClipboardPayload(settings);
		assert.equal(payload.config.userId, '');
	});

	test('copyBackendConfigToClipboard: shareConsentAt set gets redacted in clipboard JSON', async () => {
		(vscode as any).__mock.reset();
		const mock = (vscode as any).__mock;
		const settings = { ...baseSettings, shareConsentAt: '2025-01-01T00:00:00.000Z' };
		const ok = await copyBackendConfigToClipboard(settings);
		assert.equal(ok, true);
		assert.ok(mock.state.clipboardText.includes('[REDACTED_TIMESTAMP]'));
	});

	test('copyBackendConfigToClipboard: empty userId results in empty string in clipboard JSON', async () => {
		(vscode as any).__mock.reset();
		const mock = (vscode as any).__mock;
		const settings = { ...baseSettings, userId: '' };
		const ok = await copyBackendConfigToClipboard(settings);
		assert.equal(ok, true);
		const parsed = JSON.parse(mock.state.clipboardText);
		assert.equal(parsed.config.userId, '');
	});
});
