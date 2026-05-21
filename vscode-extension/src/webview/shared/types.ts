/**
 * Shared type definitions used across multiple webview panels.
 */

/** Token usage breakdown by model. */
export type ModelUsage = Record<string, { inputTokens: number; outputTokens: number }>;

/** Individual level descriptor used in fluency/maturity category level data. */
export type LevelInfo = {
	stage: number;
	label: string;
	description: string;
	thresholds: string[];
	tips: string[];
};

/** Category level data used in fluency level viewer and maturity webviews. */
export type CategoryLevelData = {
	category: string;
	icon: string;
	levels: LevelInfo[];
};

export type ModeUsage = { ask: number; edit: number; agent: number; plan: number; customAgent: number; cli: number };
export type ToolCallUsage = { total: number; byTool: { [key: string]: number } };
export type McpToolUsage = { total: number; byServer: { [key: string]: number }; byTool: { [key: string]: number } };

/** Common fields shared across all webviews that display model-switching data. */
export type ModelSwitchingAnalysis = {
	modelsPerSession: number[];
	totalSessions: number;
	averageModelsPerSession: number;
	maxModelsPerSession: number;
	switchingFrequency: number;
	standardModels: string[];
	premiumModels: string[];
	unknownModels: string[];
	mixedTierSessions: number;
};
