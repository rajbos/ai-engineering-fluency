/**
 * Team Server upload payload: turns daily rollups into the rows POSTed to `/api/upload`.
 *
 * Shared by the VS Code extension and the desktop app so every host applies the same sharing
 * policy (hashed vs raw IDs, names on/off) and the same team-safe extras.
 */

import { getPricingSourceForEditor } from '../chartDataBuilder';
import type { ModelPricing } from '../types';
import type { DailyRollupMap } from './dailyRollupBuilder';
import { computeBackendSharingPolicy, hashMachineIdForTeam, hashWorkspaceIdForTeam } from './sharingProfile';
import { buildSharingServerActivity, estimateEntryCostUsd } from './sharingServerActivity';
import type { SharingServerEntry } from './sharingServerUploadService';

/**
 * Canonical form of a Team Server endpoint URL: lower-cased origin plus path without trailing
 * slashes. The upload service strips a trailing slash before posting, so `https://x` and
 * `https://x/` hit the same endpoint and must share one cross-process lock.
 */
export function canonicalTeamServerUrl(url: string): string {
	const trimmed = url.trim();
	try {
		const parsed = new URL(trimmed);
		return `${parsed.origin}${parsed.pathname.replace(/\/+$/, '')}`;
	} catch {
		return trimmed.replace(/\/+$/, '');
	}
}

/**
 * The workspace/machine IDs to upload for a rollup key under a sharing policy: HMAC-hashed per
 * dataset for team profiles, raw for soloFull. Every upload target (Azure rows, backfill, Team
 * Server entries) must go through this so no profile leaks raw IDs to one target but not another.
 */
export function applyIdStrategies(
	key: { workspaceId: string; machineId: string },
	datasetId: string,
	policy: Pick<ReturnType<typeof computeBackendSharingPolicy>, 'workspaceIdStrategy' | 'machineIdStrategy'>,
): { workspaceId: string; machineId: string } {
	return {
		workspaceId: policy.workspaceIdStrategy === 'hashed' ? hashWorkspaceIdForTeam({ datasetId, workspaceId: key.workspaceId }) : key.workspaceId,
		machineId: policy.machineIdStrategy === 'hashed' ? hashMachineIdForTeam({ datasetId, machineId: key.machineId }) : key.machineId,
	};
}

/** Inputs for {@link buildTeamServerEntries}. */
export interface TeamServerEntryOptions {
	datasetId: string;
	sharingPolicy: Pick<ReturnType<typeof computeBackendSharingPolicy>, 'workspaceIdStrategy' | 'machineIdStrategy' | 'includeNames'>;
	workspaceNamesById: Record<string, string>;
	machineNamesById: Record<string, string>;
	pricing: Record<string, ModelPricing>;
	/** Uploading client version; omitted from rows when undefined. */
	clientVersion?: string;
	/** Editor label for rollups whose key carries none (the host's own name). Only called when needed. */
	getDefaultEditor: () => string;
}

/**
 * Build the Team Server upload payload for a set of daily rollups.
 *
 * Must stay in lockstep with the Azure entity builder so no sharing profile leaks raw
 * workspace/machine IDs to one target while hashing them for the other.
 */
export function buildTeamServerEntries(rollups: DailyRollupMap, options: TeamServerEntryOptions): SharingServerEntry[] {
	const includeNames = options.sharingPolicy.includeNames;
	const entries: SharingServerEntry[] = [];
	for (const { key, value } of rollups.values()) {
		// Team profiles upload hashed workspace/machine IDs, only soloFull uploads raw ones.
		// Names are still looked up by the raw ID.
		const ids = applyIdStrategies(key, options.datasetId, options.sharingPolicy);
		const editor = key.editor ?? options.getDefaultEditor();
		// Team-safe extras (docs/sharing-server/TEAM-DATA-SCOPE.md): a cost estimate so the
		// team can compare models, validated activity counters (modes, tool and MCP calls)
		// and the client version. All counts, no content.
		const estimatedCostUsd = estimateEntryCostUsd(key.model, value.inputTokens, value.outputTokens, options.pricing, getPricingSourceForEditor(editor));
		const activity = buildSharingServerActivity(value.fluencyMetrics);
		entries.push({
			day: key.day,
			model: key.model,
			workspaceId: ids.workspaceId,
			workspaceName: includeNames ? options.workspaceNamesById[key.workspaceId] : undefined,
			machineId: ids.machineId,
			machineName: includeNames ? options.machineNamesById[key.machineId] : undefined,
			inputTokens: value.inputTokens,
			outputTokens: value.outputTokens,
			interactions: value.interactions,
			datasetId: options.datasetId,
			editor,
			fluencyMetrics: value.fluencyMetrics as Record<string, unknown> | undefined,
			...(estimatedCostUsd !== undefined ? { estimatedCostUsd } : {}),
			...(options.clientVersion ? { clientVersion: options.clientVersion } : {}),
			...(activity ? { activity } : {}),
		});
	}
	return entries;
}
