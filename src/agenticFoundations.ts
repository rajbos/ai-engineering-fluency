/**
 * Adoption × foundations: GitHub's stock-adoption matrix, per repository.
 *
 * GitHub's Agentic Engineering System sorts a system into four states by
 * setting agent adoption against the strength of its foundations (governance
 * and shared knowledge):
 *
 * |                     | low adoption       | high adoption          |
 * |---------------------|--------------------|------------------------|
 * | strong foundations  | healthy, underused | healthy, agent-native  |
 * | weak foundations    | underdeveloped     | **stretched**          |
 *
 * "Stretched" — adoption that has outrun its foundations — is the one to act
 * on. Foundations come from the AI Readiness scan; adoption from the user's
 * own sessions in that repository (src/repoAgentActivity.ts).
 *
 * Why not the readiness scan's `confirmedStage`: stage 2 requires `ai-policy`,
 * a governance control the scan always reports as `unknown`, so a confirmed
 * stage can never pass 1 and every repository would sit in the weak row.
 * Instead the foundation score is present ÷ (present + absent) over the
 * stage 1–3 controls, with unknown controls left out of both sides and
 * reported alongside. Too few observed controls means `unassessed`, never
 * `weak`.
 *
 * Local only: this combines a repository's controls with the user's *own*
 * usage on their own machine. It is never uploaded or shared — published, it
 * would become per-person scoring. Pure — no VS Code API, no filesystem.
 */
import type {
	AgenticMatrix,
	AgenticMatrixPlacement,
	AgenticQuadrant,
	DarkFactoryControlResult,
	DarkFactoryRepoReport,
	DarkFactoryReport,
	FoundationLevel,
	RepoAgentActivity,
	RepoAgentActivityReport,
} from './types';
import { repoKeyFromSlug } from './repoKey';

/** Controls at or below this stage count toward foundations for delegated work. */
export const FOUNDATION_MAX_STAGE = 3;
/** Fewer observed (present or absent) foundation controls than this means `unassessed`. Tunable. */
export const MIN_OBSERVED_CONTROLS = 6;
/**
 * Score at or above which foundations are strong. Deliberately not tied to the
 * readiness stage band: one missing stage-1 control (a library with no IaC or
 * devcontainer) would otherwise rule out "strong" for an otherwise solid
 * repository. Tunable.
 */
export const STRONG_FOUNDATION_SCORE = 0.7;
/** Score at or below which foundations are weak. Tunable. */
export const WEAK_FOUNDATION_SCORE = 0.4;
/** A `partial` repository leans to the strong side at or above this score. Tunable. */
export const LEANING_STRONG_SCORE = 0.55;
/** Agentic sessions needed before adoption counts as high… Tunable. */
export const MIN_AGENTIC_SESSIONS = 5;
/** …and the share of the repository's sessions they must make up. Tunable. */
export const HIGH_ADOPTION_SHARE = 0.3;

/**
 * Controls whose absence alone makes foundations weak: without tests running
 * in CI nothing an agent does is checked, and without any instruction file an
 * agent works without shared context.
 */
const REQUIRED_CONTROL_GROUPS: readonly (readonly string[])[] = [
	['ci-test-execution'],
	['agent-instructions', 'copilot-instructions'],
];

export interface FoundationAssessment {
	level: FoundationLevel;
	score: number | null;
	observed: number;
	unknown: number;
	missing: AgenticMatrixPlacement['missingControls'];
}

function foundationControls(report: DarkFactoryRepoReport): DarkFactoryControlResult[] {
	return report.controls.filter(c => c.stage >= 1 && c.stage <= FOUNDATION_MAX_STAGE);
}

function requiredGroupAbsent(controls: readonly DarkFactoryControlResult[]): boolean {
	return REQUIRED_CONTROL_GROUPS.some(group => {
		const members = controls.filter(c => group.includes(c.id));
		return members.length > 0 && members.every(c => c.state === 'absent');
	});
}

/** How well a repository's stage 1–3 controls support delegated agent work. */
export function assessFoundations(report: DarkFactoryRepoReport): FoundationAssessment {
	const controls = foundationControls(report);
	const present = controls.filter(c => c.state === 'present').length;
	const absentControls = controls.filter(c => c.state === 'absent');
	const observed = present + absentControls.length;
	const unknown = controls.length - observed;
	const missing = absentControls
		.map(c => ({ id: c.id, label: c.label, stage: c.stage }))
		.sort((a, b) => a.stage - b.stage);
	if (observed < MIN_OBSERVED_CONTROLS) {
		return { level: 'unassessed', score: observed > 0 ? present / observed : null, observed, unknown, missing };
	}
	const score = present / observed;
	let level: FoundationLevel;
	if (score <= WEAK_FOUNDATION_SCORE || requiredGroupAbsent(controls)) {
		level = 'weak';
	} else if (score >= STRONG_FOUNDATION_SCORE) {
		level = 'strong';
	} else {
		level = 'partial';
	}
	return { level, score, observed, unknown, missing };
}

/** High adoption: enough agentic sessions, and a real share of the repository's work. */
export function isHighAdoption(activity: Pick<RepoAgentActivity, 'agenticSessions' | 'sessions'> | undefined): boolean {
	if (!activity || activity.sessions === 0) { return false; }
	return activity.agenticSessions >= MIN_AGENTIC_SESSIONS
		&& activity.agenticSessions / activity.sessions >= HIGH_ADOPTION_SHARE;
}

/** The quadrant for a foundation level and adoption; `partial` takes the nearer side. */
export function quadrantFor(foundation: FoundationAssessment, highAdoption: boolean): { quadrant?: AgenticQuadrant; leaning: boolean } {
	if (foundation.level === 'unassessed') { return { leaning: false }; }
	const leaning = foundation.level === 'partial';
	const strong = foundation.level === 'strong' || (leaning && (foundation.score ?? 0) >= LEANING_STRONG_SCORE);
	const quadrant: AgenticQuadrant = strong
		? (highAdoption ? 'healthy-agent-native' : 'healthy-underused')
		: (highAdoption ? 'stretched' : 'underdeveloped');
	return { quadrant, leaning };
}

/** Place one scanned repository. */
export function placeRepository(report: DarkFactoryRepoReport, activity: RepoAgentActivity | undefined): AgenticMatrixPlacement {
	const foundation = assessFoundations(report);
	const base = {
		repository: report.nameWithOwner ?? report.name,
		foundation: foundation.level,
		foundationScore: foundation.score,
		observedControls: foundation.observed,
		unknownControls: foundation.unknown,
		agenticSessions: activity?.agenticSessions ?? 0,
		sessions: activity?.sessions ?? 0,
		missingControls: foundation.missing,
	};
	// Without an owner/repo the scan cannot be matched to session activity: adoption is unknown,
	// not zero, so the repository is not placed.
	if (!repoKeyFromSlug(report.nameWithOwner)) {
		return { ...base, foundation: 'unassessed', highAdoption: false, leaning: false, unassessedReason: 'no-remote' };
	}
	const highAdoption = isHighAdoption(activity);
	const { quadrant, leaning } = quadrantFor(foundation, highAdoption);
	return {
		...base,
		highAdoption,
		quadrant,
		leaning,
		unassessedReason: foundation.level === 'unassessed' ? 'too-few-controls' : undefined,
	};
}

/**
 * Build the matrix for every scanned repository. Repositories with agent
 * activity but no scan (not open in the workspace) are listed as
 * adoption-only rather than guessed.
 */
export function buildAgenticMatrix(readiness: DarkFactoryReport, activity: RepoAgentActivityReport | null | undefined): AgenticMatrix {
	const activityByKey = new Map((activity?.repos ?? []).map(r => [r.key, r]));
	const scannedKeys = new Set<string>();
	const placements = readiness.repos.map(report => {
		const key = repoKeyFromSlug(report.nameWithOwner);
		if (key) { scannedKeys.add(key); }
		return placeRepository(report, key ? activityByKey.get(key) : undefined);
	});
	const adoptionOnly = (activity?.repos ?? [])
		.filter(r => !scannedKeys.has(r.key) && r.agenticSessions > 0)
		.sort((a, b) => b.agenticSessions - a.agenticSessions)
		.slice(0, 10)
		.map(r => ({ repository: r.repository, agenticSessions: r.agenticSessions, sessions: r.sessions }));
	return { windowDays: activity?.windowDays ?? 30, placements, adoptionOnly };
}

/**
 * Firmly stretched placements (weak foundations, not merely leaning), most
 * agentic first. Used for the insight, which should not fire on a boundary call.
 */
export function stretchedPlacements(matrix: AgenticMatrix | null | undefined): AgenticMatrixPlacement[] {
	return (matrix?.placements ?? [])
		.filter(p => p.quadrant === 'stretched' && !p.leaning)
		.sort((a, b) => b.agenticSessions - a.agenticSessions);
}
