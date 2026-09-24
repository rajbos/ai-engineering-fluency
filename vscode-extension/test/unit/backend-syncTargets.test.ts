import './vscode-shim-register';
import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';

import * as vscode from 'vscode';

import { SyncService, targetSyncLockName, type SyncServiceDeps } from '../../src/backend/services/syncService';
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

interface Calls { azure: number; teamServer: number; backfillAzure: number; fluencyScore: number }

function makeService(logs: string[], context?: vscode.ExtensionContext): { svc: SyncService; calls: Calls } {
	const calls: Calls = { azure: 0, teamServer: 0, backfillAzure: 0, fluencyScore: 0 };
	const deps: SyncServiceDeps = {
		context,
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
		uploadFluencyScore: async () => { calls.fluencyScore++; },
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
	await svc.backfillSync(teamServerOnly(), 30);
	assert.equal(calls.backfillAzure, 0, 'backfill must not request Azure credentials');
	assert.ok(logs.some(m => m.startsWith('Backfill: skipping')));
});

test('backfillSync: Azure only proceeds to fetch Azure credentials', async () => {
	const logs: string[] = [];
	const { svc, calls } = makeService(logs);
	await svc.backfillSync(azureOnly(), 30);
	assert.equal(calls.backfillAzure, 1);
});

test('backfillSync: ignores the legacy backend.backend selector when Azure is enabled', async () => {
	const logs: string[] = [];
	const { svc, calls } = makeService(logs);
	await svc.backfillSync({ ...azureOnly(), backend: 'sharingServer' }, 30);
	assert.equal(calls.backfillAzure, 1);
});

// ── fluency-score upload ──────────────────────────────────────────────────

test('uploadFluencyScoreToSharingServer: Team Server only uploads', async () => {
	const { svc, calls } = makeService([]);
	await svc.uploadFluencyScoreToSharingServer(teamServerOnly(), { overallStage: 'exploring' });
	assert.equal(calls.fluencyScore, 1);
});

test('uploadFluencyScoreToSharingServer: profile off blocks the score upload like rollup sync', async () => {
	const { svc, calls } = makeService([]);
	await svc.uploadFluencyScoreToSharingServer({ ...teamServerOnly(), sharingProfile: 'off' }, { overallStage: 'exploring' });
	assert.equal(calls.fluencyScore, 0);
});

// ── cross-window locking is keyed by target, not by backend.backend ──────

function withLockDir(fn: (context: vscode.ExtensionContext, dir: string) => Promise<void>): Promise<void> {
	const dir = fs.mkdtempSync(path.join(process.cwd(), 'sync-targets-lock-'));
	const state = new Map<string, unknown>();
	const context = {
		globalStorageUri: { fsPath: dir },
		globalState: { get: (k: string) => state.get(k), update: async (k: string, v: unknown) => { state.set(k, v); } },
	} as unknown as vscode.ExtensionContext;
	return fn(context, dir).finally(() => fs.rmSync(dir, { recursive: true, force: true }));
}

/** Simulates another window holding the lock for a Team Server endpoint. */
function holdTeamServerLock(dir: string, endpointUrl: string): void {
	const serverUrl = `share:${endpointUrl}`;
	const file = `backend_sync_${targetSyncLockName('sharingserver', serverUrl)}.lock`;
	fs.writeFileSync(path.join(dir, file), JSON.stringify({ sessionId: 'other-window', timestamp: Date.now(), serverUrl }));
}

for (const backend of ['storageTables', 'sharingServer'] as const) {
	test(`sync lock: another window uploading to the same Team Server blocks it (backend.backend=${backend})`, async () => {
		await withLockDir(async (context, dir) => {
			holdTeamServerLock(dir, TEAM_SERVER.sharingServerEndpointUrl);
			const logs: string[] = [];
			const { svc, calls } = makeService(logs, context);
			await svc.syncToBackendStore(true, { ...teamServerOnly(), backend }, true);
			assert.equal(calls.teamServer, 0, `Logs:\n${logs.join('\n')}`);
			assert.ok(logs.some(m => m.includes('skipping Team Server')));
		});
	});
}

test('sync lock: a held Team Server lock does not block this window\'s Azure sync', async () => {
	await withLockDir(async (context, dir) => {
		holdTeamServerLock(dir, TEAM_SERVER.sharingServerEndpointUrl);
		const { svc, calls } = makeService([], context);
		await svc.syncToBackendStore(true, both(), true);
		assert.equal(calls.azure, 1);
		assert.equal(calls.teamServer, 0);
	});
});

test('sync lock: a lock held for a different Team Server does not block', async () => {
	await withLockDir(async (context, dir) => {
		holdTeamServerLock(dir, 'https://other-team.example.com');
		const { svc, calls } = makeService([], context);
		await svc.syncToBackendStore(true, teamServerOnly(), true);
		assert.equal(calls.teamServer, 1);
	});
});

test('sync lock: each endpoint gets its own lock file, so another endpoint\'s lock cannot weaken it', async () => {
	await withLockDir(async (context, dir) => {
		// Window A holds server A. Window B takes server B's lock and keeps it while uploading...
		holdTeamServerLock(dir, 'https://other-team.example.com');
		let releaseB!: () => void;
		const bUploading = new Promise<void>(r => { releaseB = r; });
		const b = makeService([], context);
		let bStarted!: () => void;
		const bHasLock = new Promise<void>(r => { bStarted = r; });
		(b.svc as any).runSharingServerSyncIndependently = async () => { b.calls.teamServer++; bStarted(); await bUploading; };
		const bSync = b.svc.syncToBackendStore(true, teamServerOnly(), true);
		await bHasLock;
		// ...so window C, targeting the same server B, must be blocked rather than run concurrently.
		const logs: string[] = [];
		const c = makeService(logs, context);
		await c.svc.syncToBackendStore(true, teamServerOnly(), true);
		assert.equal(c.calls.teamServer, 0, `Logs:\n${logs.join('\n')}`);
		assert.ok(logs.some(m => m.includes('skipping Team Server')));
		releaseB();
		await bSync;
		assert.equal(b.calls.teamServer, 1);
	});
});
