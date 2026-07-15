import { MAX_STRING_LENGTHS, MAX_TOKEN_VALUE } from '../config.js';
import type { UploadEntry } from '../db.js';

// Re-export the canonical upload entry type for consumers of this module.
export type { UploadEntry };

/** Maximum allowed value for the interactions field per upload entry. */
export const MAX_INTERACTIONS = 100_000;

/** Maximum JSON payload size (bytes) for the fluencyMetrics field per entry. */
export const MAX_FLUENCY_METRICS_JSON_BYTES = 10_000; // 10 KB per entry

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
	if (e.fluencyMetrics !== undefined && e.fluencyMetrics !== null) {
		if (typeof e.fluencyMetrics !== 'object' || Array.isArray(e.fluencyMetrics)) {
			return '"fluencyMetrics" must be an object';
		}
		if (Buffer.byteLength(JSON.stringify(e.fluencyMetrics), 'utf8') > MAX_FLUENCY_METRICS_JSON_BYTES) {
			return `"fluencyMetrics" too large (max ${MAX_FLUENCY_METRICS_JSON_BYTES} bytes)`;
		}
	}

	return null;
}

function isNonNegativeInt(value: unknown): boolean {
	return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}
