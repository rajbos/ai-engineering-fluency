import test from 'node:test';
import assert from 'node:assert/strict';
import type { ModelPricing } from '../types';
import { createEmptySessionUsageAnalysis } from '../usageAnalysis';
import { applyModelSwitchingStats } from '../adapters/modelSwitching';
import { EclipseAdapter } from '../adapters/eclipseAdapter';
import { KiroAdapter } from '../adapters/kiroAdapter';
import { VisualStudioAdapter } from '../adapters/visualStudioAdapter';
import type { EclipseDataAccess } from '../eclipse';
import type { KiroDataAccess } from '../kiro';
import { VisualStudioDataAccess } from '../visualstudio';

const pricing: { [key: string]: ModelPricing } = {
	'std-model': { inputCostPerMillion: 1, outputCostPerMillion: 1, tier: 'standard' },
	'prem-model': { inputCostPerMillion: 10, outputCostPerMillion: 10, tier: 'premium' },
};
const ctx = { modelPricing: pricing, toolNameMap: {} };

test('applyModelSwitchingStats: counts unique models, requests and switches', () => {
	const analysis = createEmptySessionUsageAnalysis();
	applyModelSwitchingStats(analysis, ['std-model', 'std-model', 'prem-model', 'std-model'], pricing);
	assert.deepEqual(analysis.modelSwitching.uniqueModels, ['std-model', 'prem-model']);
	assert.equal(analysis.modelSwitching.modelCount, 2);
	assert.equal(analysis.modelSwitching.totalRequests, 4);
	assert.equal(analysis.modelSwitching.switchCount, 2);
	assert.deepEqual(analysis.modelSwitching.tiers, { standard: ['std-model'], premium: ['prem-model'], unknown: [] });
	assert.equal(analysis.modelSwitching.hasMixedTiers, true);
	assert.equal(analysis.modelSwitching.standardRequests, 3);
	assert.equal(analysis.modelSwitching.premiumRequests, 1);
});

test('applyModelSwitchingStats: an empty model list yields zero counts', () => {
	const analysis = createEmptySessionUsageAnalysis();
	applyModelSwitchingStats(analysis, [], pricing);
	assert.deepEqual(analysis.modelSwitching.uniqueModels, []);
	assert.equal(analysis.modelSwitching.modelCount, 0);
	assert.equal(analysis.modelSwitching.totalRequests, 0);
	assert.equal(analysis.modelSwitching.switchCount, 0);
	assert.equal(analysis.modelSwitching.hasMixedTiers, false);
});

function turn(model: string | null, toolNames: string[] = []) {
	return {
		userText: 'q', assistantText: 'a', model, mode: 'agent', reasoningEffort: null, timestamp: null,
		currentDocumentUri: null, toolCalls: toolNames.map(toolName => ({ toolName })),
		inputTokens: 1, outputTokens: 1, thinkingTokens: 0, timestampMs: null,
	};
}

test('EclipseAdapter.analyzeUsage: fills model switching from turn models', async () => {
	const eclipse = { buildEclipseTurns: async () => [turn('std-model', ['read']), turn('prem-model'), turn(null)] };
	const analysis = await new EclipseAdapter(eclipse as unknown as EclipseDataAccess).analyzeUsage('s.json', ctx);
	assert.deepEqual(analysis.modelSwitching.uniqueModels, ['std-model', 'prem-model']);
	assert.equal(analysis.modelSwitching.totalRequests, 2);
	assert.equal(analysis.modelSwitching.switchCount, 1);
	assert.equal(analysis.modelSwitching.hasMixedTiers, true);
	assert.deepEqual(analysis.toolCalls.byTool, { read: 1 });
});

test('KiroAdapter.analyzeUsage: fills model switching from turn models', async () => {
	const kiro = { buildKiroTurns: async () => [turn('std-model'), turn('std-model'), turn('prem-model', ['write'])] };
	const analysis = await new KiroAdapter(kiro as unknown as KiroDataAccess).analyzeUsage('s.json', ctx);
	assert.deepEqual(analysis.modelSwitching.uniqueModels, ['std-model', 'prem-model']);
	assert.equal(analysis.modelSwitching.totalRequests, 3);
	assert.equal(analysis.modelSwitching.switchCount, 1);
	assert.equal(analysis.modeUsage.agent, 3);
	assert.deepEqual(analysis.toolCalls.byTool, { write: 1 });
});

test('VisualStudioAdapter.analyzeUsage: fills model switching from response models', async () => {
	const vs = new VisualStudioDataAccess();
	const response = (id: string) => [1, { Model: [1, { Id: id }], Content: [] }];
	const request = [1, { Content: [] }];
	vs.decodeSessionFile = async () => [[1, {}], request, response('prem-model'), request, response('prem-model'), request, response('std-model')];
	const analysis = await new VisualStudioAdapter(vs, () => 0).analyzeUsage('s.vsconv', ctx);
	assert.deepEqual(analysis.modelSwitching.uniqueModels, ['prem-model', 'std-model']);
	assert.equal(analysis.modelSwitching.totalRequests, 3);
	assert.equal(analysis.modelSwitching.switchCount, 1);
	assert.equal(analysis.modeUsage.ask, 3);
});
