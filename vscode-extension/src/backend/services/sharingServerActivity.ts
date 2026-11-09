/**
 * Team Server extras: the validated `activity` counters, the per-row cost estimate and the
 * client version that ride along with every rollup entry uploaded to the sharing server.
 *
 * Everything here is a count or a label from a fixed vocabulary (tool names, MCP server
 * names) derived from the rollup's existing fluency metrics. Nothing is read from prompts,
 * paths or arguments. Limits mirror `sharing-server/src/validation/uploadSchema.ts` so an
 * entry is never rejected for size. See docs/sharing-server/TEAM-DATA-SCOPE.md.
 */

import { calculateEstimatedCost } from '../../../../src/tokenEstimation';
import type { ModelPricing } from '../../../../src/types';
import type { DailyRollupValue } from '../types';

export interface SharingServerActivity {
	sessions?: number;
	modes?: { ask?: number; edit?: number; agent?: number; plan?: number; customAgent?: number; cli?: number };
	toolCalls?: number;
	toolsByName?: Record<string, number>;
	mcpCalls?: number;
	mcpByServer?: Record<string, number>;
}

/** Server-side caps (uploadSchema.ts): names per map, name length, count ceiling. */
export const ACTIVITY_MAX_NAMED_KEYS = 50;
export const ACTIVITY_MAX_KEY_LENGTH = 128;
export const ACTIVITY_MAX_COUNT = 10_000_000;

type FluencyMetrics = NonNullable<DailyRollupValue['fluencyMetrics']>;

function count(value: unknown): number | undefined {
	if (typeof value !== 'number' || !Number.isFinite(value)) { return undefined; }
	const rounded = Math.round(value);
	if (rounded <= 0) { return undefined; }
	return Math.min(rounded, ACTIVITY_MAX_COUNT);
}

function parseJson(json: string | undefined): Record<string, unknown> | undefined {
	if (!json) { return undefined; }
	try {
		const parsed: unknown = JSON.parse(json);
		return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
			? parsed as Record<string, unknown> : undefined;
	} catch {
		return undefined;
	}
}

/**
 * Keep the top-N names by count, dropping empty or over-long names. Names are tool or MCP
 * server identifiers; a name is truncated rather than dropped only when it is otherwise valid.
 */
export function capNamedCounts(counts: unknown): Record<string, number> | undefined {
	if (typeof counts !== 'object' || counts === null || Array.isArray(counts)) { return undefined; }
	const entries: Array<[string, number]> = [];
	for (const [rawName, rawCount] of Object.entries(counts as Record<string, unknown>)) {
		const name = rawName.trim().slice(0, ACTIVITY_MAX_KEY_LENGTH);
		const value = count(rawCount);
		if (!name || value === undefined) { continue; }
		entries.push([name, value]);
	}
	if (entries.length === 0) { return undefined; }
	entries.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
	return Object.fromEntries(entries.slice(0, ACTIVITY_MAX_NAMED_KEYS));
}

/**
 * Project a rollup's fluency metrics into the Team Server `activity` object. Returns
 * `undefined` when there is nothing to report so the field is omitted from the upload.
 */
export function buildSharingServerActivity(metrics: FluencyMetrics | undefined): SharingServerActivity | undefined {
	if (!metrics) { return undefined; }
	const toolCalls = parseJson(metrics.toolCallsJson);
	const mcp = parseJson(metrics.mcpToolsJson);
	const activity: SharingServerActivity = {
		sessions: count(metrics.sessionCount),
		modes: buildModes(metrics),
		toolCalls: count(toolCalls?.total),
		toolsByName: capNamedCounts(toolCalls?.byTool),
		mcpCalls: count(mcp?.total),
		mcpByServer: capNamedCounts(mcp?.byServer),
	};
	return stripUndefined(activity);
}

function buildModes(metrics: FluencyMetrics): SharingServerActivity['modes'] {
	const modes = stripUndefined({
		ask: count(metrics.askModeCount), edit: count(metrics.editModeCount), agent: count(metrics.agentModeCount),
		plan: count(metrics.planModeCount), customAgent: count(metrics.customAgentModeCount), cli: count(metrics.cliModeCount),
	});
	return modes;
}

/** Drop `undefined` fields so the upload omits them; `undefined` when nothing is left. */
function stripUndefined<T extends object>(value: T): T | undefined {
	const kept = Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as T;
	return Object.keys(kept).length > 0 ? kept : undefined;
}

/**
 * Cost estimate for one rollup row from the public price list. Cache-aware token splits
 * are not available at rollup granularity, so this prices every input token at the
 * standard input rate: an upper bound for cached sessions, exact otherwise. Returns
 * `undefined` when the model has no pricing entry, so the server stores NULL rather than $0.
 */
export function estimateEntryCostUsd(
	model: string,
	inputTokens: number,
	outputTokens: number,
	pricing: Record<string, ModelPricing> | undefined,
	pricingSource: 'provider' | 'copilot' = 'provider',
): number | undefined {
	if (!pricing || (inputTokens <= 0 && outputTokens <= 0)) { return undefined; }
	const cost = calculateEstimatedCost({ [model]: { inputTokens, outputTokens, sessions: 1 } }, pricing, pricingSource);
	if (!Number.isFinite(cost) || cost <= 0) { return undefined; }
	// Six decimals keeps sub-cent rows meaningful without shipping float noise.
	return Math.round(cost * 1_000_000) / 1_000_000;
}
