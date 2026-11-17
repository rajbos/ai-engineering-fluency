/** Types shared by every host that builds team-server daily rollups. */

/**
 * Daily rollup value (aggregated stats for a day).
 */
export interface DailyRollupValue {
	inputTokens: number;
	outputTokens: number;
	interactions: number;
	// Fluency metrics (optional, aggregated from session analysis)
	fluencyMetrics?: {
		askModeCount?: number;
		editModeCount?: number;
		agentModeCount?: number;
		planModeCount?: number;
		customAgentModeCount?: number;
		cliModeCount?: number;
		toolCallsJson?: string;
		contextRefsJson?: string;
		mcpToolsJson?: string;
		modelSwitchingJson?: string;
		editScopeJson?: string; // NEW: Edit scope metrics
		agentTypesJson?: string; // NEW: Agent type distribution
		repositoriesJson?: string; // NEW: Repository lists
		applyUsageJson?: string; // NEW: Apply usage metrics
		sessionDurationJson?: string; // NEW: Session duration data
		repoCustomizationRate?: number;
		multiTurnSessions?: number;
		avgTurnsPerSession?: number;
		multiFileEdits?: number;
		avgFilesPerEdit?: number;
		codeBlockApplyRate?: number;
		sessionCount?: number;
	};
}

/**
 * Chat request interface for Copilot session files.
 */
export interface ChatRequest {
	timestamp?: number | string;
	message?: {
		parts?: Array<{ text?: string }>;
	};
	response?: Array<{ value?: string }>;
	model?: string;
	[key: string]: unknown;
}
