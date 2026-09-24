import './vscode-shim-register';
import test from 'node:test';
import * as assert from 'node:assert/strict';

import * as vscode from 'vscode';

import { SyncService, type SyncServiceDeps } from '../../src/backend/services/syncService';
import { BackendUtility } from '../../src/backend/services/utilityService';
import { getBackendSettings, resolveSyncTargets, type BackendSettings } from '../../src/backend/settings';
import { inferSharingProfile } from '../../src/backend/settingsValidation';

/**
 * Azure Storage and the self-hosted Team Server are independent upload targets.
 * Azure is gated on `backend.enabled`; the Team Server on its own
 * `backend.sharingServer.enabled` + endpoint URL. A sharing profile of `off` blocks both.
 */

const AZURE_FIELDS = { subscriptionId: 'sub', resourceGroup: 'rg', storageAccount: 'sa', aggTable: 'agg' };
const NO_AZURE_FIELDS = { subscriptionId: '', resourceGroup: '', storageAccount: '', aggTable: 'usageAggDaily' };
const TEAM_SERVER = { sharingServerEnabled: true, sharingServerEndpointUrl: 'https://team.example.com' };
const NO_TEAM_SERVER = { sharingServerEnabled: false, sharingServerEndpointUrl: '' };

function makeSettings(overrides: Partial<BackendSettings>): BackendSettings {
	return {
		enabled: false,
		backend: 'storageTables',
		authMode: 'entraId',
		datasetId: 'default',
		sharingProfile: 'teamAnonymized',
		shareWithTeam: false,
		shareWorkspaceMachineNames: false,
		shareConsentAt: '',
		userIdentityMode: 'pseudonymous',
		userId: '',
		userIdMode: 'alias',
		...NO_AZURE_FIELDS,
		eventsTable: 'usageEvents',
		lookbackDays: 7,
		includeMachineBreakdown: false,
		blobUploadEnabled: false,
		blobContainerName: 'copilot-session-logs',
		blobUploadFrequencyHours: 24,
		blobCompressFiles: true,
		...NO_TEAM_SERVER,
		...overrides,
	};
}

const teamServerOnly = () => makeSettings({ enabled: false, ...TEAM_SERVER });
const azureOnly = () => makeSettings({ enabled: true, ...AZURE_FIELDS });
const both = () => makeSettings({ enabled: true, ...AZURE_FIELDS, ...TEAM_SERVER });

// ── resolveSyncTargets ────────────────────────────────────────────────────

test('resolveSyncTargets: Team Server only does not need backend.enabled', () => {
	assert.deepEqual(resolveSyncTargets(teamServerOnly()), { azure: false, sharingServer: true });
});

test('resolveSyncTargets: Azure only', () => {
	assert.deepEqual(resolveSyncTargets(azureOnly()), { azure: true, sharingServer: false });
});

test('resolveSyncTargets: both targets enabled', () => {
	assert.deepEqual(resolveSyncTargets(both()), { azure: true, sharingServer: true });
});

test('resolveSyncTargets: profile off disables every target', () => {
	assert.deepEqual(resolveSyncTargets({ ...both(), sharingProfile: 'off' }), { azure: false, sharingServer: false });
});

test('resolveSyncTargets: Azure stays gated on backend.enabled even when its fields are filled', () => {
	const settings = makeSettings({ enabled: false, ...AZURE_FIELDS, ...TEAM_SERVER });
	assert.deepEqual(resolveSyncTargets(settings), { azure: false, sharingServer: true });
});

test('resolveSyncTargets: Team Server needs both the toggle and an endpoint URL', () => {
	assert.equal(resolveSyncTargets(makeSettings({ sharingServerEnabled: true, sharingServerEndpointUrl: '' })).sharingServer, false);
	assert.equal(resolveSyncTargets(makeSettings({ sharingServerEnabled: false, sharingServerEndpointUrl: 'https://x' })).sharingServer, false);
});

// ── profile inference ─────────────────────────────────────────────────────

test('inferSharingProfile: an enabled Team Server alone infers teamAnonymized, not off', () => {
	(vscode as any).__mock.reset();
	(vscode as any).__mock.setConfig({
		'aiEngineeringFluency.backend.enabled': false,
		'aiEngineeringFluency.backend.sharingServer.enabled': true,
		'aiEngineeringFluency.backend.sharingServer.endpointUrl': 'https://team.example.com',
	});
	const s = getBackendSettings();
	assert.equal(s.sharingProfile, 'teamAnonymized');
	assert.deepEqual(resolveSyncTargets(s), { azure: false, sharingServer: true });
});

test('inferSharingProfile: neither target enabled still infers off', () => {
	(vscode as any).__mock.reset();
	(vscode as any).__mock.setConfig({
		'aiEngineeringFluency.backend.enabled': false,
		'aiEngineeringFluency.backend.sharingServer.enabled': false,
	});
	assert.equal(getBackendSettings().sharingProfile, 'off');
});

test('inferSharingProfile: an explicit off profile wins over an enabled target', () => {
	assert.equal(inferSharingProfile('off', true, false, 'pseudonymous'), 'off');
});

// ── SyncService gating ────────────────────────────────────────────────────

interface Calls { azure: number; teamServer: number; backfillAzure: number }

function makeService(logs: string[]): { svc: SyncService; calls: Calls } {
	const calls: Calls = { azure: 0, teamServer: 0, backfillAzure: 0 };
	const deps: SyncServiceDeps = {
		context: undefined,
		logger: { log: (m) => logs.push(m), warn: (m) => logs.push(m) },
		sessionHandlers: {
			getCopilotSessionFiles: async () => [],
			estimateTokensFromText: () => 0,
			getModelFromRequest: () => 'gpt-4o',
			statSessionFile: async () => ({ mtimeMs: Date.now(), size: 0 } as any),
		},
		editorHandlers: {},
		getGithubToken: () => 'gh-token',
	};
	const credSvc = {
		getBackendDataPlaneCredentials: async () => { calls.backfillAzure++; return undefined; },
		getBackendSecretsToRedactForError: async () => [],
	};
	const dataSvc = {
		ensureTableExists: async () => { calls.azure++; },
		validateAccess: async () => {},
		createTableClient: () => ({}),
		upsertEntitiesBatch: async () => ({ successCount: 0, errors: [] }),
		deleteEntitiesForUserDataset: async () => ({ deletedCount: 0, errors: [] }),
	};
	const sharingServerSvc = {
		uploadRollups: async () => { calls.teamServer++; },
		uploadFluencyScore: async () => {},
	};
	const svc = new SyncService(deps, credSvc as any, dataSvc as any, undefined, BackendUtility, sharingServerSvc as any);
	// Azure table sync and session parsing are exercised elsewhere; here we only need to know
	// which targets a sync pass attempts, so give it one rollup to upload.
	(svc as any).performAzureTableSync = async () => { calls.azure++; };
	(svc as any).computeDailyRollupsFromLocalSessions = async () => ({
		rollups: new Map([['k', {
			key: { day: '2026-01-01', model: 'gpt-4o', workspaceId: 'ws', machineId: 'm', editor: 'VS Code' },
			value: { inputTokens: 10, outputTokens: 20, interactions: 1 },
		}]]),
		workspaceNamesById: {},
		machineNamesById: {},
	});
	return { svc, calls };
}

test('syncToBackendStore: Team Server only uploads rollups without backend.enabled', async () => {
	const logs: string[] = [];
	const { svc, calls } = makeService(logs);
	await svc.syncToBackendStore(true, teamServerOnly(), true);
	assert.equal(calls.teamServer, 1, `expected a Team Server upload. Logs:\n${logs.join('\n')}`);
	assert.equal(calls.azure, 0, 'Azure must not be attempted when backend.enabled is false');
});

test('syncToBackendStore: Azure only never contacts the Team Server', async () => {
	const logs: string[] = [];
	const { svc, calls } = makeService(logs);
	await svc.syncToBackendStore(true, azureOnly(), true);
	assert.equal(calls.azure, 1);
	assert.equal(calls.teamServer, 0);
});

test('syncToBackendStore: both targets sync independently', async () => {
	const logs: string[] = [];
	const { svc, calls } = makeService(logs);
	await svc.syncToBackendStore(true, both(), true);
	assert.equal(calls.azure, 1);
	assert.equal(calls.teamServer, 1);
});

test('syncToBackendStore: profile off uploads nowhere', async () => {
	const logs: string[] = [];
	const { svc, calls } = makeService(logs);
	await svc.syncToBackendStore(true, { ...both(), sharingProfile: 'off' }, true);
	assert.equal(calls.azure, 0);
	assert.equal(calls.teamServer, 0);
	assert.ok(logs.some(m => m.includes('does not allow cloud sync')));
});

test('syncToBackendStore: Azure fields without backend.enabled and no Team Server uploads nowhere', async () => {
	const logs: string[] = [];
	const { svc, calls } = makeService(logs);
	await svc.syncToBackendStore(true, makeSettings({ enabled: false, ...AZURE_FIELDS }), true);
	assert.equal(calls.azure, 0);
	assert.equal(calls.teamServer, 0);
	assert.ok(logs.some(m => m.includes('no sync target enabled')));
});

test('startTimerIfEnabled: Team Server only starts the timer', () => {
	const logs: string[] = [];
	const { svc } = makeService(logs);
	svc.startTimerIfEnabled(teamServerOnly(), true);
	assert.ok(logs.some(m => m.includes('starting timer with interval')), `Logs:\n${logs.join('\n')}`);
	svc.dispose();
});

test('startTimerIfEnabled: profile off does not start the timer', () => {
	const logs: string[] = [];
	const { svc } = makeService(logs);
	svc.startTimerIfEnabled({ ...teamServerOnly(), sharingProfile: 'off' }, true);
	assert.ok(!logs.some(m => m.includes('starting timer with interval')));
	assert.ok(logs.some(m => m.includes('cloud sync disabled')));
	svc.dispose();
});

test('startTimerIfEnabled: no enabled target does not start the timer', () => {
	const logs: string[] = [];
	const { svc } = makeService(logs);
	svc.startTimerIfEnabled(makeSettings({ enabled: false, ...AZURE_FIELDS }), true);
	assert.ok(!logs.some(m => m.includes('starting timer with interval')));
	assert.ok(logs.some(m => m.includes('no sync target enabled')));
	svc.dispose();
});

test('backfillSync: stays Azure-only, so a Team Server-only setup skips it', async () => {
	const logs: string[] = [];
	const { svc, calls } = makeService(logs);
	await svc.backfillSync(teamServerOnly(), true, 30);
	assert.equal(calls.backfillAzure, 0, 'backfill must not request Azure credentials');
	assert.ok(logs.some(m => m.startsWith('Backfill: skipping')));
});

test('backfillSync: Azure only proceeds to fetch Azure credentials', async () => {
	const logs: string[] = [];
	const { svc, calls } = makeService(logs);
	await svc.backfillSync(azureOnly(), true, 30);
	assert.equal(calls.backfillAzure, 1);
});
