// @ts-nocheck
import './vscode-shim-register';
import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as vscode from 'vscode';

test('AzureResourceService - buildProfileOptions returns correct options', () => {
	(vscode as any).__mock.reset();
	
	const deps = {
		log: () => {},
		getSettings: () => ({}),
		startTimerIfEnabled: () => {},
		syncToBackendStore: async () => {},
		clearQueryCache: () => {}
	};
	
	delete require.cache[require.resolve('../../src/backend/services/azureResourceService')];
	const { AzureResourceService } = require('../../src/backend/services/azureResourceService');
	
	const credentialService = {} as any;
	const dataPlaneService = {} as any;
	
	const svc = new AzureResourceService(deps as any, credentialService, dataPlaneService);
	
	// Access private method
	const options = (svc as any).buildProfileOptions();
	
	// Verify structure
	assert.equal(options.length, 5, 'Should have 5 profile options');
	
	// Verify each option has required fields
	for (const option of options) {
		assert.ok(option.label, 'Should have label');
		assert.ok(option.description, 'Should have description');
		assert.ok(option.detail, 'Should have detail');
		assert.ok(option.profile, 'Should have profile');
		assert.ok(typeof option.sharingLevel === 'number', 'Should have sharingLevel as number');
	}
	
	// Verify specific profiles
	const profiles = options.map(o => o.profile);
	assert.ok(profiles.includes('off'));
	assert.ok(profiles.includes('teamAnonymized'));
	assert.ok(profiles.includes('teamPseudonymous'));
	assert.ok(profiles.includes('teamIdentified'));
	assert.ok(profiles.includes('soloFull'));
	
	// Verify sharing levels are in order
	const levels = options.map(o => o.sharingLevel);
	assert.deepEqual(levels, [0, 1, 2, 3, 4]);
});

test('AzureResourceService - getProfileDefaults returns correct defaults for teamPseudonymous', () => {
	(vscode as any).__mock.reset();
	
	const config = {
		get: (key: string, defaultValue: any) => defaultValue
	} as any;
	
	const deps = {
		log: () => {},
		getSettings: () => ({}),
		startTimerIfEnabled: () => {},
		syncToBackendStore: async () => {},
		clearQueryCache: () => {}
	};
	
	delete require.cache[require.resolve('../../src/backend/services/azureResourceService')];
	const { AzureResourceService } = require('../../src/backend/services/azureResourceService');
	
	const credentialService = {} as any;
	const dataPlaneService = {} as any;
	
	const svc = new AzureResourceService(deps as any, credentialService, dataPlaneService);
	
	// Access private method
	const defaults = (svc as any).getProfileDefaults('teamPseudonymous', config);
	
	assert.equal(defaults.shareWithTeam, true);
	assert.equal(defaults.shareWorkspaceMachineNames, false);
	assert.equal(defaults.userId, '');
	assert.equal(defaults.userIdMode, 'alias');
	assert.equal(defaults.userIdentityMode, 'pseudonymous');
	assert.ok(defaults.shareConsentAt, 'Should have shareConsentAt timestamp');
});

test('AzureResourceService - getProfileDefaults returns correct defaults for teamIdentified with existing config', () => {
	(vscode as any).__mock.reset();
	
	const config = {
		get: (key: string, defaultValue: any) => {
			if (key === 'backend.userIdentityMode') return 'teamAlias';
			if (key === 'backend.userId') return 'test-user';
			if (key === 'backend.userIdMode') return 'alias';
			return defaultValue;
		}
	} as any;
	
	const deps = {
		log: () => {},
		getSettings: () => ({}),
		startTimerIfEnabled: () => {},
		syncToBackendStore: async () => {},
		clearQueryCache: () => {}
	};
	
	delete require.cache[require.resolve('../../src/backend/services/azureResourceService')];
	const { AzureResourceService } = require('../../src/backend/services/azureResourceService');
	
	const credentialService = {} as any;
	const dataPlaneService = {} as any;
	
	const svc = new AzureResourceService(deps as any, credentialService, dataPlaneService);
	
	// Access private method
	const defaults = (svc as any).getProfileDefaults('teamIdentified', config);
	
	assert.equal(defaults.shareWithTeam, true);
	assert.equal(defaults.shareWorkspaceMachineNames, false);
	assert.equal(defaults.userId, 'test-user');
	assert.equal(defaults.userIdMode, 'alias');
	assert.equal(defaults.userIdentityMode, 'teamAlias');
	assert.ok(defaults.shareConsentAt, 'Should have shareConsentAt timestamp');
});

test('AzureResourceService - getProfileDefaults returns correct defaults for off', () => {
	(vscode as any).__mock.reset();
	
	const config = {
		get: (key: string, defaultValue: any) => defaultValue
	} as any;
	
	const deps = {
		log: () => {},
		getSettings: () => ({}),
		startTimerIfEnabled: () => {},
		syncToBackendStore: async () => {},
		clearQueryCache: () => {}
	};
	
	delete require.cache[require.resolve('../../src/backend/services/azureResourceService')];
	const { AzureResourceService } = require('../../src/backend/services/azureResourceService');
	
	const credentialService = {} as any;
	const dataPlaneService = {} as any;
	
	const svc = new AzureResourceService(deps as any, credentialService, dataPlaneService);
	
	// Access private method
	const defaults = (svc as any).getProfileDefaults('off', config);
	
	assert.equal(defaults.shareWithTeam, false);
	assert.equal(defaults.shareWorkspaceMachineNames, false);
	assert.equal(defaults.userId, '');
	assert.equal(defaults.userIdMode, 'alias');
	assert.equal(defaults.userIdentityMode, 'pseudonymous');
	assert.equal(defaults.shareConsentAt, '');
});

test('AzureResourceService - getProfileDefaults returns correct defaults for soloFull', () => {
	(vscode as any).__mock.reset();
	
	const config = {
		get: (key: string, defaultValue: any) => defaultValue
	} as any;
	
	const deps = {
		log: () => {},
		getSettings: () => ({}),
		startTimerIfEnabled: () => {},
		syncToBackendStore: async () => {},
		clearQueryCache: () => {}
	};
	
	delete require.cache[require.resolve('../../src/backend/services/azureResourceService')];
	const { AzureResourceService } = require('../../src/backend/services/azureResourceService');
	
	const credentialService = {} as any;
	const dataPlaneService = {} as any;
	
	const svc = new AzureResourceService(deps as any, credentialService, dataPlaneService);
	
	// Access private method
	const defaults = (svc as any).getProfileDefaults('soloFull', config);
	
	assert.equal(defaults.shareWithTeam, false);
	assert.equal(defaults.shareWorkspaceMachineNames, true);
	assert.equal(defaults.userId, '');
	assert.equal(defaults.userIdMode, 'alias');
	assert.equal(defaults.userIdentityMode, 'pseudonymous');
	assert.equal(defaults.shareConsentAt, '');
});

test('AzureResourceService - maybeAskNamesForTeamProfile returns undefined for non-team profiles', async () => {
	(vscode as any).__mock.reset();
	
	const deps = {
		log: () => {},
		getSettings: () => ({}),
		startTimerIfEnabled: () => {},
		syncToBackendStore: async () => {},
		clearQueryCache: () => {}
	};
	
	delete require.cache[require.resolve('../../src/backend/services/azureResourceService')];
	const { AzureResourceService } = require('../../src/backend/services/azureResourceService');
	
	const credentialService = {} as any;
	const dataPlaneService = {} as any;
	
	const svc = new AzureResourceService(deps as any, credentialService, dataPlaneService);
	
	// Access private method
	const result = await (svc as any).maybeAskNamesForTeamProfile('off', 0, 0);
	
	assert.equal(result, undefined);
});

test('AzureResourceService - maybeAskNamesForTeamProfile returns undefined when new level <= current', async () => {
	(vscode as any).__mock.reset();
	
	const deps = {
		log: () => {},
		getSettings: () => ({}),
		startTimerIfEnabled: () => {},
		syncToBackendStore: async () => {},
		clearQueryCache: () => {}
	};
	
	delete require.cache[require.resolve('../../src/backend/services/azureResourceService')];
	const { AzureResourceService } = require('../../src/backend/services/azureResourceService');
	
	const credentialService = {} as any;
	const dataPlaneService = {} as any;
	
	const svc = new AzureResourceService(deps as any, credentialService, dataPlaneService);
	
	// Access private method - teamPseudonymous has level 2, current is 2
	const result = await (svc as any).maybeAskNamesForTeamProfile('teamPseudonymous', 2, 2);
	
	assert.equal(result, undefined);
});

test('AzureResourceService - maybeAskNamesForTeamProfile returns boolean for team profiles with higher level', async () => {
	(vscode as any).__mock.reset();
	
	let quickPickResult: any = null;
	
	const windowMock = vscode.window as any;
	windowMock.showQuickPick = async (items: any[], options?: any) => {
		quickPickResult = items[0];
		return items[0];
	};
	
	const deps = {
		log: () => {},
		getSettings: () => ({}),
		startTimerIfEnabled: () => {},
		syncToBackendStore: async () => {},
		clearQueryCache: () => {}
	};
	
	delete require.cache[require.resolve('../../src/backend/services/azureResourceService')];
	const { AzureResourceService } = require('../../src/backend/services/azureResourceService');
	
	const credentialService = {} as any;
	const dataPlaneService = {} as any;
	
	const svc = new AzureResourceService(deps as any, credentialService, dataPlaneService);
	
	// Access private method - teamPseudonymous has level 2, current is 0
	const result = await (svc as any).maybeAskNamesForTeamProfile('teamPseudonymous', 2, 0);
	
	assert.equal(result, false); // First option has shareNames: false
	assert.ok(quickPickResult, 'Should have called showQuickPick');
});
