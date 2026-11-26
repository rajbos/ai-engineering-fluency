import test from 'node:test';
import * as assert from 'node:assert/strict';

import { SessionDiscovery } from '../sessionDiscovery';

type Status = { isActive: boolean } | undefined;

function run(statuses: Record<string, Status>, codespaces: boolean, withLookup = true) {
	const logs: string[] = [];
	const warnings: string[] = [];
	const discovery = new SessionDiscovery({
		log: m => logs.push(m),
		warn: m => warnings.push(m),
		error: () => {},
		ecosystems: [],
		getExtensionStatus: withLookup ? (id: string) => statuses[id] : undefined,
	});
	const previous = process.env.CODESPACES;
	if (codespaces) { process.env.CODESPACES = 'true'; } else { delete process.env.CODESPACES; }
	try {
		discovery.checkCopilotExtension();
	} finally {
		if (previous === undefined) { delete process.env.CODESPACES; } else { process.env.CODESPACES = previous; }
	}
	return { logs, warnings };
}

test('checkCopilotExtension: does nothing without an extension lookup', () => {
	const { logs, warnings } = run({}, true, false);
	assert.deepEqual(logs, []);
	assert.deepEqual(warnings, []);
});

test('checkCopilotExtension: logs a warning line when neither extension is installed', () => {
	const { logs, warnings } = run({}, false);
	assert.deepEqual(logs, ['⚠️ GitHub Copilot extensions not found']);
	assert.deepEqual(warnings, []);
});

test('checkCopilotExtension: reports active, loading and missing extensions', () => {
	assert.deepEqual(
		run({ 'GitHub.copilot': { isActive: true }, 'GitHub.copilot-chat': { isActive: false } }, false).logs,
		['GitHub Copilot: ✅ Active, Chat: ⏳ Loading'],
	);
	assert.deepEqual(
		run({ 'GitHub.copilot-chat': { isActive: true } }, false).logs,
		['GitHub Copilot: ❌ Not found, Chat: ✅ Active'],
	);
});

test('checkCopilotExtension: warns in Codespaces only when an extension is inactive or missing', () => {
	const bothActive = { 'GitHub.copilot': { isActive: true }, 'GitHub.copilot-chat': { isActive: true } };
	assert.deepEqual(run(bothActive, true).warnings, []);
	assert.deepEqual(run(bothActive, false).warnings, []);
	const chatLoading = { 'GitHub.copilot': { isActive: true }, 'GitHub.copilot-chat': { isActive: false } };
	assert.deepEqual(run(chatLoading, true).warnings, ['⚠️ Running in Codespaces with inactive Copilot extensions']);
	assert.deepEqual(run(chatLoading, false).warnings, []);
	assert.deepEqual(run({}, true).warnings, ['⚠️ Running in Codespaces with inactive Copilot extensions']);
});
