/**
 * Factory for the empty/zero-state chart payload returned when no session files are found.
 */

export function createEmptyChartPayload(now: Date = new Date()): object {
	return {
		labels: [],
		tokensData: [],
		sessionsData: [],
		modelDatasets: [],
		editorDatasets: [],
		editorTotalsMap: {},
		repositoryDatasets: [],
		repositoryTotalsMap: {},
		dailyCount: 0,
		totalTokens: 0,
		avgTokensPerDay: 0,
		totalSessions: 0,
		lastUpdated: now.toISOString(),
		backendConfigured: false,
	};
}
