/**
 * The fluency-score body POSTed to a team server's `/api/fluency-score`, shared by every host so
 * the server dashboard shows exactly the score the host's own Fluency Score view shows.
 *
 * Only stage numbers, labels, category names/icons and tips are sent: never the per-category
 * `evidence` strings, which can quote local usage details.
 */

/** The part of `calculateMaturityScores()`'s result the upload reads. */
export interface FluencyScoreSource {
	overallStage: number;
	overallLabel: string;
	categories: ReadonlyArray<{ category: string; icon: string; stage: number; tips: string[] }>;
}

export interface FluencyScorePayload {
	overallStage: number;
	overallLabel: string;
	categories: Array<{ category: string; icon: string; stage: number; tips: string[] }>;
	computedAt: string;
	[key: string]: unknown;
}

export function buildFluencyScorePayload(score: FluencyScoreSource, now: Date = new Date()): FluencyScorePayload {
	return {
		overallStage: score.overallStage,
		overallLabel: score.overallLabel,
		categories: score.categories.map(c => ({ category: c.category, icon: c.icon, stage: c.stage, tips: c.tips })),
		computedAt: now.toISOString(),
	};
}
