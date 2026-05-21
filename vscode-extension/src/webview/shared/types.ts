/**
 * Shared type definitions used across multiple webview panels.
 */

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
