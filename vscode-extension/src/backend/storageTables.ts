/**
 * Azure Storage Tables client and operations.
 * Handles interactions with Azure Tables for storing and querying daily rollup data.
 */

import { AZURE_TABLES_FORBIDDEN_CHARS, SCHEMA_VERSION_NO_USER, SCHEMA_VERSION_WITH_USER, SCHEMA_VERSION_WITH_USER_AND_CONSENT, SCHEMA_VERSION_WITH_FLUENCY_METRICS } from './constants';
import type { DailyRollupKey } from './rollups';
import type { BackendUserIdentityMode } from './identity';

/**
 * Interface for Azure TableClient-like objects.
 * Used for dependency injection and testing.
 */
export interface TableClientLike {
	listEntities(options?: { queryOptions?: { filter?: string } }): AsyncIterableIterator<Partial<BackendAggDailyEntityLike>>;
	upsertEntity(entity: BackendAggDailyEntityLike, mode?: 'Merge' | 'Replace'): Promise<unknown>;
	deleteEntity(partitionKey: string, rowKey: string): Promise<unknown>;
	createTable?(): Promise<unknown>;
}

/**
 * Daily aggregate entity structure (as stored in Azure Tables).
 */
export interface BackendAggDailyEntityLike {
	partitionKey: string;
	rowKey: string;
	schemaVersion?: number;
	datasetId?: string;
	day?: string;
	model?: string;
	workspaceId?: string;
	workspaceName?: string;
	machineId?: string;
	machineName?: string;
	userId?: string;
	userKeyType?: string;
	shareWithTeam?: boolean;
	consentAt?: string;
	inputTokens?: number;
	outputTokens?: number;
	interactions?: number;
	updatedAt?: string;
	
	// Fluency metrics (schema version 4+)
	askModeCount?: number;
	editModeCount?: number;
	agentModeCount?: number;
	planModeCount?: number;
	customAgentModeCount?: number;
	cliModeCount?: number;
	toolCallsJson?: string; // Serialized ToolCallUsage: { total, byTool: {...} }
	contextRefsJson?: string; // Serialized ContextReferenceUsage
	mcpToolsJson?: string; // Serialized McpToolUsage: { total, byServer, byTool }
	modelSwitchingJson?: string; // Serialized ModelSwitchingAnalysis
	editScopeJson?: string; // Serialized EditScopeUsage: { multiFileEdits, singleFileEdits, avgFilesPerSession, totalEditedFiles }
	agentTypesJson?: string; // Serialized AgentTypeUsage: { editsAgent, workspaceAgent, etc. }
	repositoriesJson?: string; // Serialized string[] of repositories
	applyUsageJson?: string; // Serialized ApplyButtonUsage: { applyRate, totalApplied, totalCodeBlocks }
	sessionDurationJson?: string; // Serialized SessionDurationData
	repoCustomizationRate?: number; // 0-1 indicating % of repos with customization
	multiTurnSessions?: number;
	avgTurnsPerSession?: number;
	multiFileEdits?: number;
	avgFilesPerEdit?: number;
	codeBlockApplyRate?: number;
	sessionCount?: number; // Number of unique sessions for this rollup
}

/**
 * Sanitizes a string for use in Azure Tables PartitionKey or RowKey.
 * Replaces forbidden characters: / \ # ?
 * @param value - The string to sanitize
 * @returns Sanitized string safe for Azure Tables keys
 */
export function sanitizeTableKey(value: string): string {
	if (!value) {
		return value;
	}
	let result = value;
	for (const char of AZURE_TABLES_FORBIDDEN_CHARS) {
		result = result.replace(new RegExp(`\\${char}`, 'g'), '_');
	}
	// Also replace control characters (0x00-0x1F, 0x7F-0x9F)
	result = result.replace(/[\x00-\x1F\x7F-\x9F]/g, '_');
	return result;
}

/**
 * Builds the partition key for aggregate daily entities.
 * Format: ds:{datasetId}|d:{YYYY-MM-DD}
 * @param datasetId - The dataset identifier
 * @param dayKey - The day in YYYY-MM-DD format
 * @returns Sanitized partition key
 */
export function buildAggPartitionKey(datasetId: string, dayKey: string): string {
	const raw = `ds:${datasetId}|d:${dayKey}`;
	return sanitizeTableKey(raw);
}

/**
 * Builds the row key for aggregate daily entities.
 * This is a stable hash of the rollup dimensions.
 * @param key - The daily rollup key (model, workspace, machine, userId)
 * @returns Sanitized row key
 */
export function stableDailyRollupRowKey(key: DailyRollupKey): string {
	// Create a stable, readable row key from dimensions
	const userId = (key.userId ?? '').trim();
	const parts = [
		`m:${key.model}`,
		`w:${key.workspaceId}`,
		`mc:${key.machineId}`
	];
	if (userId) {
		parts.push(`u:${userId}`);
	}
	const raw = parts.join('|');
	return sanitizeTableKey(raw);
}

const ALLOWED_FIELDS = ['PartitionKey', 'RowKey', 'model', 'workspaceId', 'machineId', 'userId'];

/**
 * Builds an OData filter expression for Azure Tables queries.
 * @param field - The field name
 * @param value - The value to filter by
 * @returns OData filter string
 */
export function buildOdataEqFilter(field: string, value: string): string {
	if (!ALLOWED_FIELDS.includes(field)) {
		throw new Error(`Invalid filter field: ${field}`);
	}
	// Escape single quotes in value
	const escaped = value.replace(/'/g, "''");
	return `${field} eq '${escaped}'`;
}

/**
 * Normalizes fluency metric fields from a source object into a partial entity suitable for spreading.
 * Handles optional numeric and JSON string fields, coercing string values where necessary.
 * Shared by both listAggDailyEntitiesFromTableClient and createDailyAggEntity.
 * @param source - Object containing optional fluency metric fields
 * @returns Partial entity with only the present, normalized fluency metrics
 */
export function normalizeFluencyMetrics(source: Partial<BackendAggDailyEntityLike>): Partial<BackendAggDailyEntityLike> {
	return {
		...normalizeNumericFluencyMetrics(source),
		...normalizeStringFluencyMetrics(source),
	};
}

function normalizeNumericFluencyMetrics(source: Partial<BackendAggDailyEntityLike>): Partial<BackendAggDailyEntityLike> {
	return {
		...(typeof source.askModeCount === 'number' ? { askModeCount: source.askModeCount } : {}),
		...(typeof source.editModeCount === 'number' ? { editModeCount: source.editModeCount } : {}),
		...(typeof source.agentModeCount === 'number' ? { agentModeCount: source.agentModeCount } : {}),
		...(typeof source.planModeCount === 'number' ? { planModeCount: source.planModeCount } : {}),
		...(typeof source.customAgentModeCount === 'number' ? { customAgentModeCount: source.customAgentModeCount } : {}),
		...(typeof source.repoCustomizationRate === 'number' ? { repoCustomizationRate: source.repoCustomizationRate } : {}),
		...(typeof source.multiTurnSessions === 'number' ? { multiTurnSessions: source.multiTurnSessions } : {}),
		...(typeof source.avgTurnsPerSession === 'number' ? { avgTurnsPerSession: source.avgTurnsPerSession } : {}),
		...(typeof source.multiFileEdits === 'number' ? { multiFileEdits: source.multiFileEdits } : {}),
		...(typeof source.avgFilesPerEdit === 'number' ? { avgFilesPerEdit: source.avgFilesPerEdit } : {}),
		...(typeof source.codeBlockApplyRate === 'number' ? { codeBlockApplyRate: source.codeBlockApplyRate } : {}),
		...(typeof source.sessionCount === 'number' ? { sessionCount: source.sessionCount } : {}),
	};
}

function normalizeStringFluencyMetrics(source: Partial<BackendAggDailyEntityLike>): Partial<BackendAggDailyEntityLike> {
	return {
		...(source.toolCallsJson ? { toolCallsJson: String(source.toolCallsJson) } : {}),
		...(source.contextRefsJson ? { contextRefsJson: String(source.contextRefsJson) } : {}),
		...(source.mcpToolsJson ? { mcpToolsJson: String(source.mcpToolsJson) } : {}),
		...(source.modelSwitchingJson ? { modelSwitchingJson: String(source.modelSwitchingJson) } : {}),
		...(source.editScopeJson ? { editScopeJson: String(source.editScopeJson) } : {}),
		...(source.agentTypesJson ? { agentTypesJson: String(source.agentTypesJson) } : {}),
		...(source.repositoriesJson ? { repositoriesJson: String(source.repositoriesJson) } : {}),
		...(source.applyUsageJson ? { applyUsageJson: String(source.applyUsageJson) } : {}),
		...(source.sessionDurationJson ? { sessionDurationJson: String(source.sessionDurationJson) } : {}),
	};
}

/**
 * Lists all daily aggregate entities from a table partition.
 * @param args - Arguments including tableClient, partitionKey, and defaultDayKey
 * @returns Array of entities
 */
export async function listAggDailyEntitiesFromTableClient(args: {
	tableClient: TableClientLike;
	partitionKey: string;
	defaultDayKey: string;
	logger?: Pick<Console, 'error'>;
}): Promise<BackendAggDailyEntityLike[]> {
	const { tableClient, partitionKey, defaultDayKey } = args;
	const logger = args.logger ?? console;
	const results: BackendAggDailyEntityLike[] = [];

	try {
		const queryOptions = {
			queryOptions: {
				filter: buildOdataEqFilter('PartitionKey', partitionKey)
			}
		};

		for await (const entity of tableClient.listEntities(queryOptions)) {
			if (!entity.model || !entity.workspaceId || !entity.machineId) {
				logger.error(`Skipping entity with missing required fields: ${entity.rowKey}`);
				continue;
			}
			results.push(normalizeTableEntity(entity, partitionKey, defaultDayKey));
		}
	} catch (error) {
		// Log error but don't throw - return empty array for graceful degradation
		logger.error(`Failed to list entities for partition ${partitionKey}:`, error);
	}

	return results;
}

function normalizeTableEntity(
	entity: Partial<BackendAggDailyEntityLike>,
	partitionKey: string,
	defaultDayKey: string,
): BackendAggDailyEntityLike {
	const dayString = entity.day?.toString() || defaultDayKey;
	return {
		day: dayString,
		...normalizeEntityIds(entity, partitionKey),
		...normalizeEntityParticipants(entity),
		...normalizeEntityMetrics(entity),
	} as BackendAggDailyEntityLike;
}

function normalizeEntityIds(entity: Partial<BackendAggDailyEntityLike>, partitionKey: string): Partial<BackendAggDailyEntityLike> {
	return {
		partitionKey: entity.partitionKey?.toString() || partitionKey,
		rowKey: entity.rowKey?.toString() || '',
		schemaVersion: typeof entity.schemaVersion === 'number' ? entity.schemaVersion : undefined,
		datasetId: entity.datasetId?.toString() || '',
	};
}

function normalizeEntityParticipants(entity: Partial<BackendAggDailyEntityLike>): Partial<BackendAggDailyEntityLike> {
	return {
		model: entity.model!.toString(),
		workspaceId: entity.workspaceId!.toString(),
		workspaceName: typeof entity.workspaceName === 'string' && entity.workspaceName.trim() ? entity.workspaceName.trim() : undefined,
		machineId: entity.machineId!.toString(),
		machineName: typeof entity.machineName === 'string' && entity.machineName.trim() ? entity.machineName.trim() : undefined,
		userId: entity.userId?.toString()?.trim() || undefined,
		userKeyType: entity.userKeyType?.toString() || undefined,
		shareWithTeam: typeof entity.shareWithTeam === 'boolean' ? entity.shareWithTeam : undefined,
		consentAt: entity.consentAt?.toString() || undefined,
	};
}

function normalizeEntityMetrics(entity: Partial<BackendAggDailyEntityLike>): Partial<BackendAggDailyEntityLike> {
	return {
		inputTokens: typeof entity.inputTokens === 'number' ? Math.max(0, entity.inputTokens) : 0,
		outputTokens: typeof entity.outputTokens === 'number' ? Math.max(0, entity.outputTokens) : 0,
		interactions: typeof entity.interactions === 'number' ? Math.max(0, entity.interactions) : 0,
		updatedAt: entity.updatedAt?.toString() || new Date().toISOString(),
		...normalizeFluencyMetrics(entity),
	};
}

function resolveSchemaVersion(effectiveUserId: string, shareWithTeam: boolean | undefined, fluencyMetrics: object | undefined): number {
	const hasFluencyMetrics = fluencyMetrics && Object.keys(fluencyMetrics).length > 0;
	if (hasFluencyMetrics) { return SCHEMA_VERSION_WITH_FLUENCY_METRICS; }
	if (effectiveUserId && shareWithTeam) { return SCHEMA_VERSION_WITH_USER_AND_CONSENT; }
	if (effectiveUserId) { return SCHEMA_VERSION_WITH_USER; }
	return SCHEMA_VERSION_NO_USER;
}

/**
 * Creates a daily aggregate entity for upsert to Azure Tables.
 * @param args - Entity creation arguments
 * @returns Entity object ready for TableClient.upsertEntity()
 */
export function createDailyAggEntity(args: {
	datasetId: string;
	day: string;
	model: string;
	workspaceId: string;
	workspaceName?: string;
	machineId: string;
	machineName?: string;
	userId?: string;
	userKeyType?: BackendUserIdentityMode;
	shareWithTeam?: boolean;
	consentAt?: string;
	inputTokens: number;
	outputTokens: number;
	interactions: number;
	// Fluency metrics (optional)
	fluencyMetrics?: {
		askModeCount?: number;
		editModeCount?: number;
		agentModeCount?: number;
		planModeCount?: number;
		customAgentModeCount?: number;
		toolCallsJson?: string;
		contextRefsJson?: string;
		mcpToolsJson?: string;
		modelSwitchingJson?: string;
		editScopeJson?: string;
		agentTypesJson?: string;
		repositoriesJson?: string;
		applyUsageJson?: string;
		sessionDurationJson?: string;
		repoCustomizationRate?: number;
		multiTurnSessions?: number;
		avgTurnsPerSession?: number;
		multiFileEdits?: number;
		avgFilesPerEdit?: number;
		codeBlockApplyRate?: number;
		sessionCount?: number;
	};
}): BackendAggDailyEntityLike {
	const { datasetId, day, model, workspaceId, workspaceName, machineId, machineName, userId, userKeyType, shareWithTeam, consentAt, inputTokens, outputTokens, interactions, fluencyMetrics } = args;
	
	const effectiveUserId = (userId ?? '').trim();
	const key: DailyRollupKey = {
		day,
		model,
		workspaceId,
		machineId,
		userId: effectiveUserId || undefined
	};

	const partitionKey = buildAggPartitionKey(datasetId, day);
	const rowKey = stableDailyRollupRowKey(key);
	const schemaVersion = resolveSchemaVersion(effectiveUserId, shareWithTeam, fluencyMetrics);

	return {
		partitionKey,
		rowKey,
		schemaVersion,
		datasetId,
		day,
		model,
		workspaceId,
		...(workspaceName ? { workspaceName } : {}),
		machineId,
		...(machineName ? { machineName } : {}),
		...(effectiveUserId ? { userId: effectiveUserId } : {}),
		...(effectiveUserId && shareWithTeam ? { userKeyType, shareWithTeam: true, consentAt } : {}),
		inputTokens,
		outputTokens,
		interactions,
		updatedAt: new Date().toISOString(),
		// Add fluency metrics if provided
		...normalizeFluencyMetrics(fluencyMetrics ?? {}),
	};
}
