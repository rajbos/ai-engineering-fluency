import type { ModelUsage } from './types';

/**
 * Shared environmental-impact factors and helpers.
 *
 * CO₂ methodology:
 * - Baseline from Jegham et al., "How Hungry is AI? Benchmarking Energy, Water,
 *   and Carbon Footprint of LLM Inference"
 * - Simplified as 840 g CO₂e per million output-equivalent tokens
 * - Input, cache-write, and cache-read tokens are discounted relative to output
 *   tokens using pragmatic weights inspired by the Tokendashboard backend
 *   methodology described in https://github.com/neuland/tokendashboard-backend
 */

export const ENVIRONMENTAL = {
	/** Order-of-magnitude fallback used only when no per-category model usage exists. */
	LEGACY_FALLBACK_CO2_PER_1K_TOKENS: 0.2,
	/** Jegham et al. long-context Claude benchmark, rounded conservatively. */
	CO2_GRAMS_PER_MILLION_OUTPUT_EQUIVALENT_TOKENS: 840,
	/** One input token counts as 1/20th of an output token. */
	INPUT_TOKEN_OUTPUT_EQUIVALENT_WEIGHT: 1 / 20,
	/** Cache-write tokens are treated as 1.25x the input-token weight. */
	CACHE_WRITE_OUTPUT_EQUIVALENT_WEIGHT: (1 / 20) * 1.25,
	/** Cache-read tokens are treated as 1% of the input-token weight. */
	CACHE_READ_OUTPUT_EQUIVALENT_WEIGHT: (1 / 20) * 0.01,
	WATER_USAGE_PER_1K_TOKENS: 0.3,
	CO2_ABSORPTION_PER_TREE_PER_YEAR: 21000,
} as const;

export interface EnvironmentalImpact {
	co2: number;
	waterUsage: number;
	treesEquivalent: number;
	outputEquivalentTokens: number;
	methodology: 'weighted-token-categories' | 'flat-token-fallback';
}

export function calculateOutputEquivalentTokens(modelUsage: ModelUsage): number {
	let total = 0;
	for (const usage of Object.values(modelUsage)) {
		const cachedReadTokens = Math.max(0, usage.cachedReadTokens ?? 0);
		const cacheWriteTokens = Math.max(0, usage.cacheCreationTokens ?? 0);
		const uncachedInputTokens = Math.max(0, usage.inputTokens - cachedReadTokens - cacheWriteTokens);
		const outputTokens = Math.max(0, usage.outputTokens);
		total += outputTokens;
		total += uncachedInputTokens * ENVIRONMENTAL.INPUT_TOKEN_OUTPUT_EQUIVALENT_WEIGHT;
		total += cacheWriteTokens * ENVIRONMENTAL.CACHE_WRITE_OUTPUT_EQUIVALENT_WEIGHT;
		total += cachedReadTokens * ENVIRONMENTAL.CACHE_READ_OUTPUT_EQUIVALENT_WEIGHT;
	}
	return total;
}

export function getTotalTokensFromModelUsage(modelUsage: ModelUsage): number {
	let total = 0;
	for (const usage of Object.values(modelUsage)) {
		total += Math.max(0, usage.inputTokens) + Math.max(0, usage.outputTokens);
	}
	return total;
}

export function calculateEnvironmentalImpact(modelUsage: ModelUsage, totalTokens?: number): EnvironmentalImpact {
	const effectiveTotalTokens = totalTokens ?? getTotalTokensFromModelUsage(modelUsage);
	const outputEquivalentTokens = calculateOutputEquivalentTokens(modelUsage);
	const co2 = outputEquivalentTokens > 0
		? (outputEquivalentTokens / 1_000_000) * ENVIRONMENTAL.CO2_GRAMS_PER_MILLION_OUTPUT_EQUIVALENT_TOKENS
		: (effectiveTotalTokens / 1000) * ENVIRONMENTAL.LEGACY_FALLBACK_CO2_PER_1K_TOKENS;
	return {
		co2,
		waterUsage: (effectiveTotalTokens / 1000) * ENVIRONMENTAL.WATER_USAGE_PER_1K_TOKENS,
		treesEquivalent: co2 / ENVIRONMENTAL.CO2_ABSORPTION_PER_TREE_PER_YEAR,
		outputEquivalentTokens,
		methodology: outputEquivalentTokens > 0 ? 'weighted-token-categories' : 'flat-token-fallback',
	};
}
