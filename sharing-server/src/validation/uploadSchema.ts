import {
	MAX_ACTIVITY_JSON_BYTES, MAX_ACTIVITY_NAMED_KEYS, MAX_ACTIVITY_COUNT,
	MAX_ESTIMATED_COST_USD, MAX_STRING_LENGTHS, MAX_TOKEN_VALUE,
} from '../config.js';
import type { UploadActivity, UploadEntry } from '../db.js';

// Re-export the canonical upload entry types for consumers of this module.
export type { UploadActivity, UploadEntry };

/** Maximum allowed value for the interactions field per upload entry. */
export const MAX_INTERACTIONS = 100_000;

/** Maximum JSON payload size (bytes) for the fluencyMetrics field per entry. */
export const MAX_FLUENCY_METRICS_JSON_BYTES = 10_000; // 10 KB per entry

/** Interaction-mode counters accepted in `activity.modes`; anything else is rejected. */
export const ACTIVITY_MODE_KEYS = ['ask', 'edit', 'agent', 'plan', 'customAgent', 'cli'] as const;

/**
 * Validates an individual upload entry from the request body.
 * Returns null when valid, or an error message describing the first failure.
 */
export function validateEntry(entry: unknown): string | null {
	if (typeof entry !== 'object' || entry === null) {
		return 'must be an object';
	}
	const e = entry as Record<string, unknown>;

	if (typeof e.day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(e.day)) {
		return '"day" must be a YYYY-MM-DD string';
	}
	if (typeof e.model !== 'string' || e.model.length === 0) {
		return '"model" must be a non-empty string';
	}
	if (e.model.length > MAX_STRING_LENGTHS.model) {
		return `"model" too long (max ${MAX_STRING_LENGTHS.model})`;
	}
	if (typeof e.workspaceId !== 'string' || e.workspaceId.length === 0) {
		return '"workspaceId" must be a non-empty string';
	}
	if (e.workspaceId.length > MAX_STRING_LENGTHS.workspaceId) {
		return `"workspaceId" too long (max ${MAX_STRING_LENGTHS.workspaceId})`;
	}
	if (typeof e.machineId !== 'string' || e.machineId.length === 0) {
		return '"machineId" must be a non-empty string';
	}
	if (e.machineId.length > MAX_STRING_LENGTHS.machineId) {
		return `"machineId" too long (max ${MAX_STRING_LENGTHS.machineId})`;
	}
	if (!isNonNegativeInt(e.inputTokens) || (e.inputTokens as number) > MAX_TOKEN_VALUE) {
		return `"inputTokens" must be a non-negative integer ≤ ${MAX_TOKEN_VALUE.toLocaleString()}`;
	}
	if (!isNonNegativeInt(e.outputTokens) || (e.outputTokens as number) > MAX_TOKEN_VALUE) {
		return `"outputTokens" must be a non-negative integer ≤ ${MAX_TOKEN_VALUE.toLocaleString()}`;
	}
	if (!isNonNegativeInt(e.interactions) || (e.interactions as number) > MAX_INTERACTIONS) {
		return `"interactions" must be a non-negative integer ≤ ${MAX_INTERACTIONS.toLocaleString()}`;
	}

	// Optional string fields — validate type and length
	if (e.workspaceName !== undefined && e.workspaceName !== null) {
		if (typeof e.workspaceName !== 'string') return '"workspaceName" must be a string';
		if (e.workspaceName.length > MAX_STRING_LENGTHS.workspaceName) return `"workspaceName" too long (max ${MAX_STRING_LENGTHS.workspaceName})`;
	}
	if (e.machineName !== undefined && e.machineName !== null) {
		if (typeof e.machineName !== 'string') return '"machineName" must be a string';
		if (e.machineName.length > MAX_STRING_LENGTHS.machineName) return `"machineName" too long (max ${MAX_STRING_LENGTHS.machineName})`;
	}
	if (e.datasetId !== undefined && e.datasetId !== null) {
		if (typeof e.datasetId !== 'string') return '"datasetId" must be a string';
		if (e.datasetId.length > MAX_STRING_LENGTHS.datasetId) {
			return `"datasetId" too long (max ${MAX_STRING_LENGTHS.datasetId})`;
		}
	}
	if (e.editor !== undefined && e.editor !== null) {
		if (typeof e.editor !== 'string') return '"editor" must be a string';
		if (e.editor.length > MAX_STRING_LENGTHS.editor) {
			return `"editor" too long (max ${MAX_STRING_LENGTHS.editor})`;
		}
	}
	if (e.clientVersion !== undefined && e.clientVersion !== null) {
		if (typeof e.clientVersion !== 'string') return '"clientVersion" must be a string';
		if (e.clientVersion.length > MAX_STRING_LENGTHS.clientVersion) {
			return `"clientVersion" too long (max ${MAX_STRING_LENGTHS.clientVersion})`;
		}
	}
	if (e.estimatedCostUsd !== undefined && e.estimatedCostUsd !== null) {
		const cost = e.estimatedCostUsd;
		if (typeof cost !== 'number' || !Number.isFinite(cost) || cost < 0 || cost > MAX_ESTIMATED_COST_USD) {
			return `"estimatedCostUsd" must be a finite number between 0 and ${MAX_ESTIMATED_COST_USD.toLocaleString()}`;
		}
	}
	if (e.fluencyMetrics !== undefined && e.fluencyMetrics !== null) {
		if (typeof e.fluencyMetrics !== 'object' || Array.isArray(e.fluencyMetrics)) {
			return '"fluencyMetrics" must be an object';
		}
		if (Buffer.byteLength(JSON.stringify(e.fluencyMetrics), 'utf8') > MAX_FLUENCY_METRICS_JSON_BYTES) {
			return `"fluencyMetrics" too large (max ${MAX_FLUENCY_METRICS_JSON_BYTES} bytes)`;
		}
	}
	if (e.activity !== undefined && e.activity !== null) {
		const activityError = validateActivity(e.activity);
		if (activityError) return activityError;
	}

	return null;
}

/**
 * Validates the optional `activity` object: a closed set of non-negative integer counters
 * plus two bounded name→count maps. Unknown keys are rejected so a newer client cannot
 * smuggle free text (prompts, paths) into a field the dashboards render as a label.
 */
export function validateActivity(value: unknown): string | null {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) {
		return '"activity" must be an object';
	}
	const a = value as Record<string, unknown>;
	const allowed = new Set(['sessions', 'modes', 'toolCalls', 'toolsByName', 'mcpCalls', 'mcpByServer']);
	for (const key of Object.keys(a)) {
		if (!allowed.has(key)) return `"activity.${key}" is not an accepted field`;
	}
	for (const key of ['sessions', 'toolCalls', 'mcpCalls'] as const) {
		if (a[key] !== undefined && (!isNonNegativeInt(a[key]) || (a[key] as number) > MAX_ACTIVITY_COUNT)) {
			return `"activity.${key}" must be a non-negative integer ≤ ${MAX_ACTIVITY_COUNT.toLocaleString()}`;
		}
	}
	if (a.modes !== undefined) {
		if (typeof a.modes !== 'object' || a.modes === null || Array.isArray(a.modes)) {
			return '"activity.modes" must be an object';
		}
		const modes = a.modes as Record<string, unknown>;
		for (const key of Object.keys(modes)) {
			if (!(ACTIVITY_MODE_KEYS as readonly string[]).includes(key)) {
				return `"activity.modes.${key}" is not an accepted mode`;
			}
			if (!isNonNegativeInt(modes[key]) || (modes[key] as number) > MAX_ACTIVITY_COUNT) {
				return `"activity.modes.${key}" must be a non-negative integer ≤ ${MAX_ACTIVITY_COUNT.toLocaleString()}`;
			}
		}
	}
	for (const key of ['toolsByName', 'mcpByServer'] as const) {
		const map = a[key];
		if (map === undefined) continue;
		if (typeof map !== 'object' || map === null || Array.isArray(map)) {
			return `"activity.${key}" must be an object of name → count`;
		}
		const names = Object.keys(map as object);
		if (names.length > MAX_ACTIVITY_NAMED_KEYS) {
			return `"activity.${key}" has too many names (max ${MAX_ACTIVITY_NAMED_KEYS})`;
		}
		for (const name of names) {
			if (name.length === 0 || name.length > MAX_STRING_LENGTHS.activityKey) {
				return `"activity.${key}" has a name longer than ${MAX_STRING_LENGTHS.activityKey} characters`;
			}
			const count = (map as Record<string, unknown>)[name];
			if (!isNonNegativeInt(count) || (count as number) > MAX_ACTIVITY_COUNT) {
				return `"activity.${key}" counts must be non-negative integers ≤ ${MAX_ACTIVITY_COUNT.toLocaleString()}`;
			}
		}
	}
	if (Buffer.byteLength(JSON.stringify(value), 'utf8') > MAX_ACTIVITY_JSON_BYTES) {
		return `"activity" too large (max ${MAX_ACTIVITY_JSON_BYTES} bytes)`;
	}
	return null;
}

function isNonNegativeInt(value: unknown): boolean {
	return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}
