/**
 * Renders the Dark Factory readiness section of the Fluency Score view.
 *
 * The rest of that view scores a *person's* fluency from their own session
 * logs. This section scores *repositories*, so it is deliberately rendered as
 * its own block with its own ladder and its own labelling, and it contributes
 * nothing to the personal radar or overall stage. Conflating the two is
 * exactly the individual-performance scoring the underlying research warns
 * against.
 *
 * Pure string building — no DOM access, no messaging — so it can be unit
 * tested directly.
 */
import { escapeHtml } from '../shared/formatUtils';
import { DARK_FACTORY_DISCLAIMER, nextStageToClose } from '../../../../src/darkFactoryReadiness';
import type {
	DarkFactoryControlResult,
	DarkFactoryFinding,
	DarkFactoryRepoReport,
	DarkFactoryReport,
	DarkFactoryStageResult,
} from '../../../../src/types';

/** Chip label and CSS modifier for each stage verdict. */
const VERDICT_PRESENTATION: Record<DarkFactoryStageResult['verdict'], { label: string; modifier: string }> = {
	attained: { label: 'Attained', modifier: 'df-verdict-attained' },
	blocked: { label: 'Blocked', modifier: 'df-verdict-blocked' },
	indeterminate: { label: 'Unverified', modifier: 'df-verdict-unverified' },
};

const SEVERITY_ICONS: Record<DarkFactoryFinding['severity'], string> = {
	high: '🔴',
	medium: '🟡',
	low: '🟢',
};

/** Look up controls by id, preserving the catalogue order of `ids`. */
function controlsById(controls: readonly DarkFactoryControlResult[], ids: readonly string[]): DarkFactoryControlResult[] {
	return ids
		.map(id => controls.find(control => control.id === id))
		.filter((control): control is DarkFactoryControlResult => control !== undefined);
}

/**
 * The headline band. `confirmedStage` is a lower bound and `ceilingStage` an
 * upper one, so the two are always shown together when they differ — a single
 * number would imply evidence the scan does not have.
 */
function buildBandHtml(repo: DarkFactoryRepoReport): string {
	if (repo.fullyEvidenced) {
		return `<div class="df-band df-band-complete">
			<span class="df-band-stage">Stage ${repo.confirmedStage}</span>
			<span class="df-band-note">every control observed</span>
		</div>`;
	}
	const ceiling = repo.ceilingStage > repo.confirmedStage
		? `<span class="df-band-note">up to Stage ${repo.ceilingStage} unverified &middot; ${repo.unknownCount} control(s) not checked</span>`
		: `<span class="df-band-note">${repo.unknownCount} control(s) not checked</span>`;
	return `<div class="df-band">
		<span class="df-band-stage">Stage ${repo.confirmedStage} confirmed</span>
		${ceiling}
	</div>`;
}

/** One control rendered as its label plus why it matters or what to do about it. */
function buildControlItemHtml(control: DarkFactoryControlResult, secondLine: string): string {
	const heuristic = control.evidence === 'heuristic'
		? ' <span class="df-heuristic" title="Detected by pattern matching — a candidate, not a verdict">heuristic</span>'
		: '';
	return `<li>
		<span class="df-control-label">${escapeHtml(control.label)}</span>${heuristic}
		<span class="df-control-detail">${escapeHtml(secondLine)}</span>
	</li>`;
}

/** The controls blocking the next stage, with the concrete remediation for each. */
function buildBlockersHtml(stage: DarkFactoryStageResult, controls: readonly DarkFactoryControlResult[]): string {
	if (stage.missing.length === 0) { return ''; }
	const items = controlsById(controls, stage.missing)
		.map(control => buildControlItemHtml(control, control.remediation))
		.join('');
	return `<div class="df-block">
		<div class="df-block-title">Missing for Stage ${stage.stage} &mdash; ${escapeHtml(stage.name)}</div>
		<ul class="df-control-list">${items}</ul>
	</div>`;
}

/** The controls the scan could not determine, each with the reason it could not. */
function buildUnknownsHtml(stage: DarkFactoryStageResult, controls: readonly DarkFactoryControlResult[]): string {
	if (stage.unknown.length === 0) { return ''; }
	const items = controlsById(controls, stage.unknown)
		.map(control => buildControlItemHtml(control, control.detail ?? 'State could not be determined.'))
		.join('');
	return `<div class="df-block df-block-unknown">
		<div class="df-block-title">Could not check for Stage ${stage.stage}</div>
		<ul class="df-control-list">${items}</ul>
	</div>`;
}

function buildStageChipsHtml(repo: DarkFactoryRepoReport): string {
	const chips = repo.stages.map(stage => {
		const presentation = VERDICT_PRESENTATION[stage.verdict];
		const title = `${stage.name} — ${stage.summary}`;
		return `<span class="df-chip ${presentation.modifier}" title="${escapeHtml(title)}">
			<span class="df-chip-stage">${stage.stage}</span>${escapeHtml(presentation.label)}
		</span>`;
	}).join('');
	return `<div class="df-chips">${chips}</div>`;
}

function buildFindingsHtml(findings: readonly DarkFactoryFinding[]): string {
	if (findings.length === 0) { return ''; }
	const items = findings.map(finding => `<li>
		<span class="df-finding-title">${SEVERITY_ICONS[finding.severity]} ${escapeHtml(finding.title)}</span>
		<span class="df-control-detail">${escapeHtml(finding.detail)}</span>
	</li>`).join('');
	return `<div class="df-block df-block-findings">
		<div class="df-block-title">Anti-patterns detected</div>
		<ul class="df-control-list">${items}</ul>
	</div>`;
}

function buildRepoCardHtml(repo: DarkFactoryRepoReport): string {
	// The first stage above the confirmed one is the only actionable target;
	// listing every unattained stage's gaps at once buries it.
	const nextStage = nextStageToClose(repo);
	const identity = repo.nameWithOwner
		? `<span class="df-repo-owner">${escapeHtml(repo.nameWithOwner)}</span>`
		: `<span class="df-repo-owner df-repo-owner-unknown">local repository &mdash; no GitHub remote resolved</span>`;

	return `<div class="df-repo-card">
		<div class="df-repo-head">
			<span class="df-repo-name">${escapeHtml(repo.name)}</span>
			${identity}
		</div>
		${buildBandHtml(repo)}
		${buildStageChipsHtml(repo)}
		${nextStage ? buildBlockersHtml(nextStage, repo.controls) : ''}
		${nextStage ? buildUnknownsHtml(nextStage, repo.controls) : ''}
		${buildFindingsHtml(repo.findings)}
	</div>`;
}

function buildEvidenceNoticeHtml(report: DarkFactoryReport): string {
	const apiNote = report.apiSignalsIncluded
		? 'Pull-request evidence from the Usage Analysis view is included.'
		: 'No GitHub API evidence was available, so rulesets, required reviews, environment protection and scanning enablement are all reported as unchecked rather than missing.';
	const skipped = report.skippedRepoCount > 0
		? ` ${report.skippedRepoCount} further repository/repositories were found but not scanned in this run.`
		: '';
	return `<div class="df-notice">${apiNote}${skipped}</div>`;
}

/**
 * Build the whole section. Returns an empty string when no report is available
 * — an absent scan is not the same as a repository with no controls, and this
 * view should say nothing rather than imply the latter.
 */
export function buildDarkFactorySectionHtml(report: DarkFactoryReport | undefined): string {
	if (!report) { return ''; }

	const body = report.repos.length === 0
		? `<div class="df-empty">No git repositories were found in this workspace, so there is nothing to assess. This scan reads repositories, never people.</div>`
		: report.repos.map(buildRepoCardHtml).join('');

	return `
		<div class="df-section">
			<div class="df-section-head">
				<span class="df-section-icon">🏭</span>
				<span class="df-section-title">Dark Factory Readiness</span>
				<span class="df-section-badge">per repository</span>
			</div>
			<div class="info-box">
				<div class="info-box-title">📋 What this measures</div>
				<div>
					A dark factory is a governed, observable production system &mdash; humans specify intent, constraints, risk and
					evidence of success while agents implement and validate. This section reports which of those governance and
					evidence controls each repository in your workspace actually has, and the specific ones blocking the next stage.
					<br><br>
					<strong>It never tells you that you are ready to go dark.</strong> A green build from an unbounded agent is weak
					evidence. ${escapeHtml(DARK_FACTORY_DISCLAIMER)} Stage 5 (a bounded dark factory) is never awarded: its
					defining evidence is not machine-detectable.
				</div>
			</div>
			${buildEvidenceNoticeHtml(report)}
			${body}
			<div class="df-footer">Scanned ${escapeHtml(new Date(report.scannedAt).toLocaleString())} &middot; Stages 1&ndash;${report.maxAssessableStage} are assessable; Stage 5 is not.</div>
		</div>
	`;
}
