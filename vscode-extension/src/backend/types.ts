/**
 * TypeScript type definitions for the backend module.
 */

// Import shared cache/model types from the root types module so all consumers
// stay in sync with a single source of truth.
import type { ModelUsage } from '../../../src/types';
export type { SessionFileCache, DailyRollupEntry, ModelUsage } from '../../../src/types';
export type { DailyRollupValue, ChatRequest } from '../../../src/teamServer/types';


/**
 * Query result from the backend.
 */
export interface BackendQueryResult {
	stats: SessionStats;
	availableModels: string[];
	availableWorkspaces: string[];
	availableMachines: string[];
	availableUsers: string[];
	workspaceNamesById?: Record<string, string>;
	machineNamesById?: Record<string, string>;
	workspaceTokenTotals: Array<{ workspaceId: string; tokens: number }>;
	machineTokenTotals: Array<{ machineId: string; tokens: number }>;
}

/**
 * Session statistics.
 */
export interface SessionStats {
	today: StatsForPeriod;
	month: StatsForPeriod;
	lastUpdated: Date;
}

/**
 * Stats for a specific time period.
 */
export interface StatsForPeriod {
	tokens: number;
	sessions: number;
	avgInteractionsPerSession: number;
	avgTokensPerSession: number;
	modelUsage: ModelUsage;
	editorUsage: EditorUsage;
	co2: number;
	treesEquivalent: number;
	waterUsage: number;
	estimatedCost: number;
}

/**
 * Editor usage statistics.
 */
export interface EditorUsage {
	[editorType: string]: {
		tokens: number;
		sessions: number;
	};
}


/**
 * Backend facade interface (for dependency injection).
 */
export interface BackendFacadeInterface {
	getSettings(): unknown;
	isConfigured(settings: unknown): boolean;
	getStatsForDetailsPanel(): Promise<SessionStats | undefined>;
	tryGetBackendDetailedStatsForStatusBar(settings: unknown): Promise<SessionStats | undefined>;
	setFilters(filters: unknown): void;
	getFilters(): unknown;
	getLastQueryResult(): BackendQueryResult | undefined;
	syncToBackendStore(force: boolean): Promise<SyncResult | void>;
	startTimerIfEnabled(): void;
	stopTimer(): void;
	dispose(): void;
	configureBackendWizard(): Promise<void>;
	setBackendSharedKey(): Promise<void>;
	rotateBackendSharedKey(): Promise<void>;
	clearBackendSharedKey(): Promise<void>;
	clearAzureSettingsCommand(): Promise<void>;
	toggleBackendWorkspaceMachineNameSync(): Promise<void>;
	setSharingProfileCommand(): Promise<void>;
}

/** What happened to one sync target during a sync pass. */
export type SyncTargetOutcome = 'synced' | 'failed' | 'skipped';

/**
 * Per-target result of a sync pass. A target is absent when it was not attempted (disabled,
 * unconfigured, or the whole pass was skipped); `skipped` means it was attempted but nothing was
 * sent (another window holds its lock, or the Team Server has no GitHub token).
 */
export interface SyncResult {
	azure?: SyncTargetOutcome;
	sharingServer?: SyncTargetOutcome;
}
