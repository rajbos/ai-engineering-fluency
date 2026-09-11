// Pure helpers for the log viewer's "Session Steps Overview" table (see main.ts).
// Deliberately dependency-free (no CSS/DOM/vscode imports) so this logic is
// unit-testable directly in Node, unlike main.ts itself which can only be
// exercised through the headless webview interaction/visual-diff harnesses.

export type TurnOverviewPromptDetail = {
	category: string;
	label: string;
	percentageOfPrompt: number;
};

export type TurnOverviewActualUsage = {
	promptTokens: number;
	completionTokens: number;
	promptTokenDetails?: TurnOverviewPromptDetail[];
};

export type TurnOverviewSourceTurn = {
	turnNumber: number;
	model: string | null;
	mode: string;
	inputTokensEstimate: number;
	outputTokensEstimate: number;
	thinkingTokensEstimate: number;
	actualUsage?: TurnOverviewActualUsage;
};

export type TurnOverviewRow = {
	turnNumber: number;
	model: string | null;
	mode: string;
	input: number;
	cached: number | null;
	output: number;
	total: number;
	isActual: boolean;
};

/**
 * Deduces per-turn cache-read tokens from `actualUsage.promptTokenDetails`,
 * when the adapter reported a breakdown entry whose category/label mentions
 * "cache" (e.g. Gemini CLI's `{ category: 'cached', label: 'Cache reads' }`).
 * Returns `null` when no such entry exists — most adapters don't split cache
 * reads out per turn, so the Cached column is only shown when at least one
 * turn actually has this data (see `renderTurnsOverviewTable` in main.ts).
 */
export function getTurnCachedTokens(turn: TurnOverviewSourceTurn): number | null {
	const au = turn.actualUsage;
	if (!au?.promptTokenDetails?.length) { return null; }
	const cachedPct = au.promptTokenDetails
		.filter(d => /cache/i.test(d.category) || /cache/i.test(d.label))
		.reduce((sum, d) => sum + d.percentageOfPrompt, 0);
	if (cachedPct <= 0) { return null; }
	return Math.round(au.promptTokens * cachedPct / 100);
}

/** Builds one overview row per turn, preferring actual API usage over the text-based estimate when available. */
export function buildTurnOverviewRows(turns: TurnOverviewSourceTurn[]): TurnOverviewRow[] {
	return turns.map(turn => {
		const au = turn.actualUsage;
		const isActual = !!au;
		const input = isActual ? au!.promptTokens : turn.inputTokensEstimate;
		const output = isActual ? au!.completionTokens : turn.outputTokensEstimate;
		const total = isActual
			? (au!.promptTokens + au!.completionTokens)
			: (turn.inputTokensEstimate + turn.outputTokensEstimate + turn.thinkingTokensEstimate);
		return { turnNumber: turn.turnNumber, model: turn.model, mode: turn.mode, input, cached: getTurnCachedTokens(turn), output, total, isActual };
	});
}

/** Stable string hash → hue (0-359), so each distinct model gets a consistent badge color across the overview table. */
export function hashModelToHue(model: string): number {
	let hash = 0;
	for (let i = 0; i < model.length; i++) {
		hash = (hash * 31 + model.charCodeAt(i)) >>> 0;
	}
	return hash % 360;
}
