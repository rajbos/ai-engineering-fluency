/**
 * Dark Factory readiness scoring (research feature).
 *
 * Scores a single repository against the software-development "dark factory"
 * maturity ladder — the staged model in which humans specify intent,
 * constraints, risk and evidence of success while agents implement and
 * validate. Two rules from that model shape everything in this file:
 *
 * 1. **Measure controls, never claim autonomy.** The report says which
 *    governance and evidence controls a repository actually has, and which
 *    specific ones block the next stage. It never says a team is ready to run
 *    without humans. Stage 5 (a bounded dark factory) is deliberately not
 *    assessable here: its defining evidence — hidden holdouts, digital twins,
 *    automated rollback, explicit legal accountability — is not detectable by
 *    any scan.
 * 2. **Per product line, never per person.** The unit is the repository. No
 *    part of this module takes, derives or reports anything about an
 *    individual developer.
 *
 * Honest handling of missing evidence is the other design point. The GitHub
 * API tier is expected to be unavailable or partially denied — a token may be
 * absent, fine-grained, or refused on a private repository — so a control
 * whose state could not be determined resolves to `unknown` and is never
 * silently counted as a pass or a fail. That is expressed as a band rather
 * than a single number:
 *
 * - `confirmedStage` — the highest stage whose controls are *all* observed
 *   present. Unknowns never lift it, so it is a lower bound.
 * - `ceilingStage`   — the highest stage nothing observed rules out. Unknowns
 *   are treated optimistically here, so it is an upper bound, not a claim.
 *
 * When the two differ, the gap is exactly the evidence the scan could not
 * reach, and the report names it.
 *
 * This module is intentionally pure (no VS Code API, no filesystem access) so
 * it can be unit-tested with mocked data and reused by the CLI and the
 * webview. Filesystem collection lives in `darkFactorySignals.ts`.
 */
import type {
	DarkFactoryControlDefinition,
	DarkFactoryControlResult,
	DarkFactoryControlState,
	DarkFactoryFinding,
	DarkFactoryRepoReport,
	DarkFactoryReport,
	DarkFactoryStageDefinition,
	DarkFactoryStageResult,
	DarkFactoryStageVerdict,
} from './types';
import catalogueRaw from './darkFactoryControls.json';

// ---------------------------------------------------------------------------
// Catalogue
// ---------------------------------------------------------------------------

interface DarkFactoryCatalogue {
	maxAssessableStage: number;
	stages: DarkFactoryStageDefinition[];
	controls: DarkFactoryControlDefinition[];
}

const CATALOGUE = catalogueRaw as DarkFactoryCatalogue;

/** Every control the scan knows about, in catalogue order. */
export const DARK_FACTORY_CONTROLS: readonly DarkFactoryControlDefinition[] = CATALOGUE.controls;

/** Ladder stage descriptions, including the stage 5 the scan never awards. */
export const DARK_FACTORY_STAGES: readonly DarkFactoryStageDefinition[] = CATALOGUE.stages;

/** Highest stage this scan is willing to assess. Stage 5 is out of reach by design. */
export const MAX_ASSESSABLE_STAGE = CATALOGUE.maxAssessableStage;

/**
 * Shown wherever a stage is reported. The ladder measures readiness controls;
 * it is not a certification and it is not about individuals.
 */
export const DARK_FACTORY_DISCLAIMER =
	'This scan reports the controls a repository has, per repository and never per person. ' +
	'It does not certify that anything is ready to run without human review.';

/** Reason text used when a control could not be observed at all. */
const UNKNOWN_REASONS: Record<DarkFactoryControlDefinition['tier'], string> = {
	filesystem: 'Not checked by this scan.',
	api: 'Needs a GitHub token with access to this repository — not checked.',
	hybrid: 'Not observable from the checked-out files alone.',
	governance: 'A written policy or decision — not machine-detectable.',
};

// ---------------------------------------------------------------------------
// Input shape
// ---------------------------------------------------------------------------

/** One observed control state, as produced by a signal collector. */
export interface DarkFactoryObservation {
	state: DarkFactoryControlState;
	/** Short justification — the path that matched, or why the state is unknown. */
	detail?: string;
}

/**
 * Raw repository facts used to detect anti-patterns. These are deliberately
 * separate from control observations: an anti-pattern is a finding about how
 * the controls fit together, not a control in its own right.
 */
export interface DarkFactoryRepoFacts {
	/** Basenames of the agent definitions found under `.github/agents/`. */
	agentFileNames?: string[];
	/** Workflow files declaring `permissions: write-all`. */
	writeAllWorkflows?: string[];
	/**
	 * Workflow files referencing long-lived cloud credentials without requesting
	 * an OIDC token in the same file.
	 */
	longLivedCredentialWorkflows?: string[];
}

/** Everything the scorer needs about one repository. */
export interface DarkFactoryRepoSignals {
	/** Display name — normally the repository folder name. */
	name: string;
	repoRoot: string;
	/** `owner/repo`, when the origin remote could be resolved. */
	nameWithOwner?: string;
	/** Observed control states, keyed by control id. Missing entries are `unknown`. */
	observations: Record<string, DarkFactoryObservation>;
	facts?: DarkFactoryRepoFacts;
}

// ---------------------------------------------------------------------------
// Control resolution
// ---------------------------------------------------------------------------

/**
 * Resolve one control's reported state from its observation, applying the
 * catalogue's honesty policy:
 *
 * - a control with no observation is `unknown`, never `absent`;
 * - a `governance` / `not-scannable` control is always `unknown`, even if a
 *   collector claims otherwise — nothing can observe a written decision;
 * - a control marked `unknownWhenAbsent` (present is observable, absent is
 *   not) reports `unknown` instead of `absent`.
 */
export function resolveControl(
	def: DarkFactoryControlDefinition,
	observation: DarkFactoryObservation | undefined,
): DarkFactoryControlResult {
	if (def.evidence === 'not-scannable' || def.tier === 'governance') {
		return { ...def, state: 'unknown', detail: def.unknownReason ?? UNKNOWN_REASONS.governance };
	}
	if (!observation) {
		return { ...def, state: 'unknown', detail: UNKNOWN_REASONS[def.tier] };
	}
	if (observation.state === 'unknown') {
		return { ...def, state: 'unknown', detail: observation.detail ?? UNKNOWN_REASONS[def.tier] };
	}
	if (observation.state === 'absent' && def.unknownWhenAbsent) {
		return { ...def, state: 'unknown', detail: def.unknownReason ?? UNKNOWN_REASONS.hybrid };
	}
	return { ...def, state: observation.state, detail: observation.detail };
}

// ---------------------------------------------------------------------------
// Stage assessment
// ---------------------------------------------------------------------------

/** A stage is blocked by any absent control, and indeterminate while any control is unknown. */
function verdictFor(missing: string[], unknown: string[]): DarkFactoryStageVerdict {
	if (missing.length > 0) { return 'blocked'; }
	if (unknown.length > 0) { return 'indeterminate'; }
	return 'attained';
}

function assessStage(def: DarkFactoryStageDefinition, controls: DarkFactoryControlResult[]): DarkFactoryStageResult {
	const forStage = controls.filter(c => c.stage === def.stage);
	const present = forStage.filter(c => c.state === 'present').map(c => c.id);
	const missing = forStage.filter(c => c.state === 'absent').map(c => c.id);
	const unknown = forStage.filter(c => c.state === 'unknown').map(c => c.id);
	return { stage: def.stage, name: def.name, summary: def.summary, verdict: verdictFor(missing, unknown), present, missing, unknown };
}

/** Count the stages from 1 upwards whose verdict passes `accept`, stopping at the first that does not. */
function countLeadingStages(stages: DarkFactoryStageResult[], accept: (v: DarkFactoryStageVerdict) => boolean): number {
	let reached = 0;
	for (let stage = 1; stage <= MAX_ASSESSABLE_STAGE; stage++) {
		const result = stages.find(s => s.stage === stage);
		if (!result || !accept(result.verdict)) { break; }
		reached = stage;
	}
	return reached;
}

// ---------------------------------------------------------------------------
// Anti-pattern findings
// ---------------------------------------------------------------------------

/** Agent definitions whose name suggests an evaluator role rather than an implementer one. */
const EVALUATOR_AGENT_PATTERN = /review|test|security|audit|\bqa\b|quality|verif/i;

/**
 * The agent definitions that read as independent evaluators — the review, test
 * and security agents that must exist separately from the implementation agent
 * so it cannot rewrite the acceptance oracle it is judged by.
 */
export function evaluatorAgentNames(agentFileNames: readonly string[]): string[] {
	return agentFileNames.filter(name => EVALUATOR_AGENT_PATTERN.test(name));
}

/** True when at least one of the repository's agent definitions reads as an independent evaluator. */
export function hasEvaluatorAgent(agentFileNames: readonly string[]): boolean {
	return evaluatorAgentNames(agentFileNames).length > 0;
}

function stateOf(controls: DarkFactoryControlResult[], id: string): DarkFactoryControlState {
	return controls.find(c => c.id === id)?.state ?? 'unknown';
}

/**
 * Detect the anti-patterns the paper names that are actually observable from a
 * repository: buying agents before reliable delivery exists, letting the
 * implementation agent own its own acceptance oracle, and handing automation
 * unbounded permissions or long-lived production credentials.
 */
export function detectFindings(controls: DarkFactoryControlResult[], facts: DarkFactoryRepoFacts = {}): DarkFactoryFinding[] {
	const findings: DarkFactoryFinding[] = [];

	const deliveryGaps = ['ci-workflows', 'ci-test-execution'].filter(id => stateOf(controls, id) === 'absent');
	const aiControlsPresent = controls
		.filter(c => c.stage >= 2 && c.state === 'present')
		.map(c => c.label);
	if (deliveryGaps.length > 0 && aiControlsPresent.length > 0) {
		findings.push({
			id: 'agents-before-delivery',
			severity: 'high',
			title: 'AI customization is ahead of the delivery foundation',
			detail: `${aiControlsPresent.length} AI/agent control(s) are configured (${aiControlsPresent.join(', ')}) while stage 1 delivery is still missing ${deliveryGaps.join(' and ')}. A green build from an unbounded agent is weak evidence when the build itself is not reliable.`,
		});
	}

	const agentFileNames = facts.agentFileNames ?? [];
	if (agentFileNames.length > 0 && !hasEvaluatorAgent(agentFileNames)) {
		findings.push({
			id: 'no-independent-evaluator',
			severity: 'medium',
			title: 'No independent evaluator agent',
			detail: `${agentFileNames.length} custom agent(s) are defined but none reads as a review, test or security agent. The agent that implements a change must not also own the acceptance oracle it is judged by.`,
		});
	}

	const writeAll = facts.writeAllWorkflows ?? [];
	if (writeAll.length > 0) {
		findings.push({
			id: 'unbounded-workflow-permissions',
			severity: 'medium',
			title: 'Workflows run with unbounded permissions',
			detail: `${writeAll.join(', ')} declare(s) \`permissions: write-all\`. Autonomy is only safe inside a pre-approved envelope — grant the least privilege each job needs.`,
		});
	}

	const longLived = facts.longLivedCredentialWorkflows ?? [];
	if (longLived.length > 0) {
		findings.push({
			id: 'long-lived-cloud-credentials',
			severity: 'medium',
			title: 'Long-lived cloud credentials in workflows',
			detail: `${longLived.join(', ')} reference(s) static cloud credentials without requesting an OIDC token. Short-lived federated credentials keep the blast radius of an automated run bounded.`,
		});
	}

	return findings;
}

// ---------------------------------------------------------------------------
// Repository scoring
// ---------------------------------------------------------------------------

/**
 * Score one repository against the ladder. Returns the confirmed/ceiling band,
 * the per-stage verdicts with the specific controls that block the next stage,
 * every control's resolved state, and any detected anti-patterns.
 */
export function scoreDarkFactoryReadiness(signals: DarkFactoryRepoSignals): DarkFactoryRepoReport {
	const controls = DARK_FACTORY_CONTROLS.map(def => resolveControl(def, signals.observations[def.id]));
	const stages = DARK_FACTORY_STAGES
		.filter(s => s.stage >= 1 && s.stage <= MAX_ASSESSABLE_STAGE)
		.map(s => assessStage(s, controls));

	const confirmedStage = countLeadingStages(stages, v => v === 'attained');
	const ceilingStage = countLeadingStages(stages, v => v !== 'blocked');
	const unknownCount = controls.filter(c => c.state === 'unknown').length;

	return {
		name: signals.name,
		repoRoot: signals.repoRoot,
		nameWithOwner: signals.nameWithOwner,
		confirmedStage,
		ceilingStage,
		fullyEvidenced: unknownCount === 0,
		unknownCount,
		stages,
		controls,
		findings: detectFindings(controls, signals.facts),
	};
}

/**
 * The stage whose controls to work on next: the first stage above the
 * confirmed one that is blocked or indeterminate. Returns undefined once every
 * assessable stage is attained.
 */
export function nextStageToClose(report: DarkFactoryRepoReport): DarkFactoryStageResult | undefined {
	return report.stages.find(s => s.stage > report.confirmedStage);
}

// ---------------------------------------------------------------------------
// Pull-request derived signals
// ---------------------------------------------------------------------------

/** The slice of already-fetched pull-request statistics this scan can reuse. */
export interface DarkFactoryPrStats {
	totalPrs: number;
	aiAuthoredPrs: number;
	/** Set when the pull-request fetch itself failed for this repository. */
	error?: string;
}

/**
 * Derive the `agent-authored-pull-requests` observation from pull-request
 * statistics the extension has already fetched, so the scan costs no extra
 * API calls.
 *
 * Absence of AI-authored pull requests is only meaningful when pull requests
 * were actually seen: an empty window, a failed fetch, or no statistics at all
 * are `unknown`, not `absent`. Note that this says nothing about whether the
 * agent could approve or merge its own work — that stays a separate,
 * API-only control.
 */
export function agentPullRequestObservation(stats: DarkFactoryPrStats | undefined): DarkFactoryObservation {
	if (!stats || stats.error) {
		return { state: 'unknown', detail: stats?.error ?? 'No pull-request data available for this repository.' };
	}
	if (stats.aiAuthoredPrs > 0) {
		return { state: 'present', detail: `${stats.aiAuthoredPrs} agent-authored pull request(s) in the analysed window.` };
	}
	if (stats.totalPrs === 0) {
		return { state: 'unknown', detail: 'No pull requests in the analysed window.' };
	}
	return { state: 'absent', detail: `${stats.totalPrs} pull request(s) in the analysed window, none agent-authored.` };
}

// ---------------------------------------------------------------------------
// Report assembly
// ---------------------------------------------------------------------------

/** Combine per-repository reports into the report the UI renders. */
export function buildDarkFactoryReport(
	repos: DarkFactoryRepoReport[],
	options: { scannedAt: string; apiSignalsIncluded: boolean; skippedRepoCount?: number },
): DarkFactoryReport {
	return {
		scannedAt: options.scannedAt,
		apiSignalsIncluded: options.apiSignalsIncluded,
		maxAssessableStage: MAX_ASSESSABLE_STAGE,
		repos: [...repos].sort((a, b) => b.confirmedStage - a.confirmedStage || a.name.localeCompare(b.name)),
		skippedRepoCount: options.skippedRepoCount ?? 0,
	};
}
