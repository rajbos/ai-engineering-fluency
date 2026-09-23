import test from 'node:test';
import * as assert from 'node:assert/strict';

import {
	calculateEnvironmentalImpact,
	calculateOutputEquivalentTokens,
	ENVIRONMENTAL,
	getModelEnvironmentalScale,
	PAPER_REFERENCE,
} from '../../../src/environmentalImpact';
import type { ModelUsage } from '../../../src/types';
import modelPricingData from '../../../src/modelPricing.json';

const close = (actual: number, expected: number, message?: string) =>
	assert.ok(Math.abs(actual - expected) < 1e-9 * Math.max(1, Math.abs(expected)), message ?? `${actual} ≈ ${expected}`);

// --- Derivation from Jegham et al. (arXiv:2505.09598 v6) ---------------------
// These pin the constants to the paper's published inputs, so an edit to a
// factor that no longer matches its source fails here rather than shipping.

test('paper reference inputs match arXiv:2505.09598 v6 (Table 1 and Table 4)', () => {
	assert.equal(PAPER_REFERENCE.ARXIV_ID, '2505.09598');
	assert.equal(PAPER_REFERENCE.PROMPT_INPUT_TOKENS, 10_000);
	assert.equal(PAPER_REFERENCE.PROMPT_OUTPUT_TOKENS, 1_500);
	assert.equal(PAPER_REFERENCE.ENERGY_WH_PER_QUERY, 5.671);
	assert.equal(PAPER_REFERENCE.ENERGY_WH_PER_QUERY_UNCERTAINTY, 0.302);
	assert.equal(PAPER_REFERENCE.PUE, 1.14);
	assert.equal(PAPER_REFERENCE.WUE_SITE_L_PER_KWH, 0.18);
	assert.equal(PAPER_REFERENCE.WUE_SOURCE_L_PER_KWH, 5.11);
	assert.equal(PAPER_REFERENCE.CIF_KG_CO2E_PER_KWH, 0.287);
});

test('reference prompt is 2,000 output-equivalent tokens under the 1/20 input weight', () => {
	const referenceUsage: ModelUsage = {
		'claude-sonnet-4.5': { inputTokens: 10_000, outputTokens: 1_500, sessions: 1 },
	};
	close(calculateOutputEquivalentTokens(referenceUsage), 2_000);
});

test('CO2 baseline (840 g / 1M output-equivalent tokens) lies within the paper-derived range', () => {
	const gramsPerMillion = (wh: number) =>
		(wh / 1000) * PAPER_REFERENCE.CIF_KG_CO2E_PER_KWH * 1000 / 2_000 * 1_000_000;
	const central = gramsPerMillion(PAPER_REFERENCE.ENERGY_WH_PER_QUERY);
	const low = gramsPerMillion(PAPER_REFERENCE.ENERGY_WH_PER_QUERY - PAPER_REFERENCE.ENERGY_WH_PER_QUERY_UNCERTAINTY);
	const high = gramsPerMillion(PAPER_REFERENCE.ENERGY_WH_PER_QUERY + PAPER_REFERENCE.ENERGY_WH_PER_QUERY_UNCERTAINTY);

	assert.equal(Math.round(central), 814);
	assert.equal(Math.round(low), 770);
	assert.equal(Math.round(high), 857);
	const baseline = ENVIRONMENTAL.CO2_GRAMS_PER_MILLION_OUTPUT_EQUIVALENT_TOKENS;
	assert.ok(baseline >= low && baseline <= high, `${baseline} g outside ${low}–${high} g`);
});

test('water baseline is the paper equation E/PUE*WUE_site + E*WUE_source per output-equivalent token', () => {
	const kwh = PAPER_REFERENCE.ENERGY_WH_PER_QUERY / 1000;
	const litersPerQuery = kwh / PAPER_REFERENCE.PUE * PAPER_REFERENCE.WUE_SITE_L_PER_KWH
		+ kwh * PAPER_REFERENCE.WUE_SOURCE_L_PER_KWH;
	// ≈ 29.9 mL per long Sonnet query
	assert.equal(Math.round(litersPerQuery * 1000 * 1000) / 1000, 29.874);
	close(ENVIRONMENTAL.WATER_LITERS_PER_MILLION_OUTPUT_EQUIVALENT_TOKENS, litersPerQuery / 2_000 * 1_000_000);
	assert.equal(ENVIRONMENTAL.WATER_LITERS_PER_MILLION_OUTPUT_EQUIVALENT_TOKENS.toFixed(2), '14.94');
});

test('output-equivalent weights are the neuland approximations', () => {
	close(ENVIRONMENTAL.INPUT_TOKEN_OUTPUT_EQUIVALENT_WEIGHT, 0.05);
	close(ENVIRONMENTAL.CACHE_WRITE_OUTPUT_EQUIVALENT_WEIGHT, 0.0625);
	close(ENVIRONMENTAL.CACHE_READ_OUTPUT_EQUIVALENT_WEIGHT, 0.0005);
});

// --- Per-model scaling ------------------------------------------------------

test('reference output price matches the Claude Sonnet pricing entry', () => {
	const pricing = (modelPricingData as { pricing: Record<string, { outputCostPerMillion: number }> }).pricing;
	assert.equal(pricing['claude-sonnet-4.5'].outputCostPerMillion, ENVIRONMENTAL.REFERENCE_OUTPUT_COST_PER_MILLION);
});

test('Claude family factors reproduce the neuland table (sonnet 840, haiku 280, opus 1400, fable 2800)', () => {
	const factor = (model: string) =>
		getModelEnvironmentalScale(model) * ENVIRONMENTAL.CO2_GRAMS_PER_MILLION_OUTPUT_EQUIVALENT_TOKENS;
	close(factor('claude-sonnet-4.5'), 840);
	close(factor('claude-haiku-4.5'), 280);
	close(factor('claude-opus-4.8'), 1400);
	close(factor('claude-fable-5'), 2800);
});

test('model scale resolves variant ids and falls back to the Sonnet baseline for unknown or free models', () => {
	close(getModelEnvironmentalScale('claude-haiku-4-5'), 1 / 3);
	assert.equal(getModelEnvironmentalScale('some-unknown-model'), 1);
	assert.equal(getModelEnvironmentalScale('free-model', { 'free-model': { inputCostPerMillion: 0, outputCostPerMillion: 0 } as any }), 1);
});

// --- Calculation ------------------------------------------------------------

test('calculateOutputEquivalentTokens weights input, cache write, cache read, and output separately', () => {
	const modelUsage: ModelUsage = {
		'claude-sonnet-4': {
			inputTokens: 1000,
			outputTokens: 100,
			cachedReadTokens: 200,
			cacheCreationTokens: 300,
			sessions: 1,
		},
	};
	close(calculateOutputEquivalentTokens(modelUsage), 100 + (500 * 0.05) + (300 * 0.0625) + (200 * 0.0005));
});

test('calculateEnvironmentalImpact applies the per-model scale to CO2 and water', () => {
	const modelUsage: ModelUsage = {
		'claude-haiku-4.5': { inputTokens: 10_000, outputTokens: 1_500, sessions: 1 },
	};
	const impact = calculateEnvironmentalImpact(modelUsage, 11_500);
	close(impact.outputEquivalentTokens, 2_000);
	close(impact.co2, (2_000 / 1_000_000) * 280);
	close(impact.waterUsage, (2_000 / 1_000_000) * ENVIRONMENTAL.WATER_LITERS_PER_MILLION_OUTPUT_EQUIVALENT_TOKENS / 3);
	close(impact.treesEquivalent, impact.co2 / ENVIRONMENTAL.CO2_ABSORPTION_PER_TREE_PER_YEAR);
	assert.equal(impact.unattributedTokens, 0);
});

test('tokens without a model breakdown use the reference prompt mix at the Sonnet baseline', () => {
	const impact = calculateEnvironmentalImpact({}, 11_500);
	assert.equal(impact.attributedTokens, 0);
	assert.equal(impact.unattributedTokens, 11_500);
	close(impact.outputEquivalentTokens, 2_000);
	close(impact.co2, (2_000 / 1_000_000) * 840);
});

test('a period mixing attributed and unattributed sessions counts both', () => {
	const modelUsage: ModelUsage = {
		'claude-sonnet-4.5': { inputTokens: 10_000, outputTokens: 1_500, sessions: 1 },
	};
	const attributedOnly = calculateEnvironmentalImpact(modelUsage, 11_500);
	const mixed = calculateEnvironmentalImpact(modelUsage, 23_000);
	assert.equal(mixed.unattributedTokens, 11_500);
	close(mixed.co2, attributedOnly.co2 * 2);
	close(mixed.waterUsage, attributedOnly.waterUsage * 2);
});

test('totalTokens below the breakdown total does not produce a negative remainder', () => {
	const modelUsage: ModelUsage = {
		'claude-sonnet-4.5': { inputTokens: 10_000, outputTokens: 1_500, sessions: 1 },
	};
	const impact = calculateEnvironmentalImpact(modelUsage, 5_000);
	assert.equal(impact.unattributedTokens, 0);
	close(impact.co2, (2_000 / 1_000_000) * 840);
});
