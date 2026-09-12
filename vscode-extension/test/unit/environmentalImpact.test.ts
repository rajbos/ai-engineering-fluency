import test from 'node:test';
import * as assert from 'node:assert/strict';

import {
	calculateEnvironmentalImpact,
	calculateOutputEquivalentTokens,
	ENVIRONMENTAL,
} from '../../../src/environmentalImpact';
import type { ModelUsage } from '../../../src/types';

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
	const result = calculateOutputEquivalentTokens(modelUsage);
	assert.equal(result, 100 + (500 * 0.05) + (300 * 0.0625) + (200 * 0.0005));
});

test('calculateEnvironmentalImpact derives CO2 from output-equivalent tokens when model usage exists', () => {
	const modelUsage: ModelUsage = {
		'gpt-5-mini': {
			inputTokens: 10_000,
			outputTokens: 1_500,
			sessions: 1,
		},
	};
	const impact = calculateEnvironmentalImpact(modelUsage, 11_500);
	assert.equal(impact.methodology, 'weighted-token-categories');
	assert.equal(impact.outputEquivalentTokens, 2_000);
	assert.equal(impact.co2, (2_000 / 1_000_000) * ENVIRONMENTAL.CO2_GRAMS_PER_MILLION_OUTPUT_EQUIVALENT_TOKENS);
	assert.equal(impact.waterUsage, (11_500 / 1000) * ENVIRONMENTAL.WATER_USAGE_PER_1K_TOKENS);
});

test('calculateEnvironmentalImpact falls back to the legacy flat estimate when model usage is unavailable', () => {
	const impact = calculateEnvironmentalImpact({}, 5_000);
	assert.equal(impact.methodology, 'flat-token-fallback');
	assert.equal(impact.outputEquivalentTokens, 0);
	assert.equal(impact.co2, (5_000 / 1000) * ENVIRONMENTAL.LEGACY_FALLBACK_CO2_PER_1K_TOKENS);
	assert.equal(impact.waterUsage, (5_000 / 1000) * ENVIRONMENTAL.WATER_USAGE_PER_1K_TOKENS);
});
