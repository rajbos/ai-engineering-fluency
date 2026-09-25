/**
 * Renders the AES workflow assessment section of the Fluency Score view.
 *
 * This is a third, deliberately separate lens from the other two sections on
 * this page: the personal fluency cards above score an *individual's* tool
 * usage, and the Dark Factory Readiness section scores what a *repository
 * scan* can observe. This section reports a team's own self-assessment of
 * one *named workflow* — which may span several repositories — against
 * GitHub's Agentic Engineering System (AES) framework. It contributes
 * nothing to the personal radar or the Dark Factory ladder, and it never
 * turns a Dark Factory `present` / `absent` / `unknown` observation into an
 * AES conclusion on its own; it only ever displays it as supporting evidence.
 *
 * There is no in-product authoring flow yet, so the report rendered here is
 * always the same FableCart fixture used by the CLI, clearly labelled as an
 * example. See `docs/features/AES-WORKFLOW-ASSESSMENT.md`.
 *
 * Pure string building — no DOM access, no messaging — so it can be unit
 * tested directly, mirroring `darkFactorySection.ts`.
 */
import { escapeHtml } from '../shared/formatUtils';
import { ACTIVITIES, AES_ASSESSMENT_DISCLAIMER, MODES, STOCKS } from '../../../../src/aesWorkflowAssessment';
import {
	ACTIVITY_LABELS,
	DELEGATION_LABELS,
	EVIDENCE_STATE_ICON,
	MODE_LABELS,
	POSTURE_LABELS,
	RATING_LABELS,
	STOCK_LABELS,
} from '../../../../src/aesLabels';
import type {
	AesActivity,
	AesPosture,
	AesStock,
	AesSupportingEvidence,
	AesWorkflowReport,
} from '../../../../src/types';

const POSTURE_CSS_CLASS: Record<AesPosture, string> = {
	'healthy-agent-native': 'aes-posture-healthy-native',
	'healthy-but-underused': 'aes-posture-underused',
	'underdeveloped-foundations': 'aes-posture-underdeveloped',
	'stretched-agent-native': 'aes-posture-stretched',
	unclear: 'aes-posture-unclear',
};

function buildEvidenceListHtml(evidence: readonly AesSupportingEvidence[], informs: AesActivity | AesStock): string {
	const matches = evidence.filter(item => item.informs === informs);
	if (matches.length === 0) { return ''; }
	const items = matches.map(item => {
		const icon = EVIDENCE_STATE_ICON[item.state];
		const detail = item.detail ? ` &mdash; ${escapeHtml(item.detail)}` : '';
		return `<li class="aes-evidence aes-evidence-${item.state}">[${icon}] <strong>${escapeHtml(item.repo)}</strong>: ${escapeHtml(item.controlLabel)}${detail}</li>`;
	}).join('');
	return `<ul class="aes-evidence-list">${items}</ul>`;
}

function buildStocksHtml(report: AesWorkflowReport): string {
	const evidence = report.assessment.supportingEvidence ?? [];
	const cards = STOCKS.map(stock => {
		const s = report.assessment.stocks[stock];
		return `<div class="aes-card">
			<div class="aes-card-title">
				<span>${escapeHtml(STOCK_LABELS[stock])}</span>
				<span class="aes-badge aes-rating-${s.rating}">${escapeHtml(RATING_LABELS[s.rating])}</span>
			</div>
			<div class="aes-card-body">${escapeHtml(s.evidence)}</div>
			${buildEvidenceListHtml(evidence, stock)}
		</div>`;
	}).join('');
	return `<div class="aes-grid">${cards}</div>`;
}

function buildActivitiesHtml(report: AesWorkflowReport): string {
	const evidence = report.assessment.supportingEvidence ?? [];
	const cards = ACTIVITIES.map(activity => {
		const a = report.assessment.activities[activity];
		return `<div class="aes-card">
			<div class="aes-card-title">
				<span>${escapeHtml(ACTIVITY_LABELS[activity])}</span>
				<span class="aes-badge aes-delegation">${escapeHtml(DELEGATION_LABELS[a.delegation])}</span>
			</div>
			<div class="aes-card-body">${escapeHtml(a.description)}</div>
			<div class="aes-card-signal">Signal: ${escapeHtml(a.signal)}</div>
			${buildEvidenceListHtml(evidence, activity)}
		</div>`;
	}).join('');
	return `<div class="aes-grid">${cards}</div>`;
}

function buildModesHtml(report: AesWorkflowReport): string {
	const cards = MODES.map(mode => {
		const m = report.assessment.modes[mode];
		const antiPatterns = m.antiPatternsObserved?.length
			? `<ul class="aes-anti-patterns">${m.antiPatternsObserved.map(p => `<li>${escapeHtml(p)}</li>`).join('')}</ul>`
			: '';
		return `<div class="aes-card">
			<div class="aes-card-title">
				<span>${escapeHtml(MODE_LABELS[mode])}</span>
				<span class="aes-badge aes-delegation">${escapeHtml(DELEGATION_LABELS[m.delegation])}</span>
			</div>
			${m.notes ? `<div class="aes-card-body">${escapeHtml(m.notes)}</div>` : ''}
			${antiPatterns}
		</div>`;
	}).join('');
	return `<div class="aes-grid">${cards}</div>`;
}

function buildPostureBannerHtml(report: AesWorkflowReport): string {
	return `<div class="aes-posture-banner ${POSTURE_CSS_CLASS[report.posture]}">
		<div class="aes-posture-label">${escapeHtml(POSTURE_LABELS[report.posture])}</div>
		<div class="aes-posture-guidance">${escapeHtml(report.postureGuidance)}</div>
	</div>`;
}

/**
 * Build the whole section. Returns an empty string when no report is available
 * — mirroring `buildDarkFactorySectionHtml`'s rule that an absent assessment
 * says nothing rather than implying an empty one.
 */
export function buildAesSectionHtml(report: AesWorkflowReport | undefined): string {
	if (!report) { return ''; }

	const { assessment } = report;
	const repos = assessment.workflow.repositories.length > 0
		? assessment.workflow.repositories.map(escapeHtml).join(', ')
		: '(none listed)';

	return `
		<div class="aes-section">
			<div class="aes-section-head">
				<span class="aes-section-icon">🧭</span>
				<span class="aes-section-title">AES Workflow Assessment</span>
				<span class="aes-section-badge">per workflow</span>
			</div>
			<div class="info-box">
				<div class="info-box-title">📋 What this measures</div>
				<div>
					GitHub's Agentic Engineering System (AES) asks what outcome a delivery workflow serves, who directs, performs
					and assesses each step, and what a team's governance and shared-knowledge foundations look like. Unlike the
					sections above, this is <strong>team-reported</strong>, not scanned, and it can span several repositories
					instead of reporting on just one.
					<br><br>
					${escapeHtml(AES_ASSESSMENT_DISCLAIMER)}
				</div>
			</div>
			<div class="aes-notice">
				There is no in-product way to author an AES assessment yet, so this is a fictional example
				(&ldquo;FableCart&rdquo;) shown to demonstrate the report format. Run <code>aes --file &lt;path&gt;</code> in the
				CLI to render a real one.
			</div>
			<div class="aes-workflow-card">
				<div class="aes-workflow-head">
					<span class="aes-workflow-name">${escapeHtml(assessment.workflow.name)}</span>
					<span class="aes-workflow-repos">${repos}</span>
				</div>
				<div class="aes-workflow-description">${escapeHtml(assessment.workflow.description)}</div>
				<div class="aes-workflow-meta">
					Assessed ${escapeHtml(new Date(assessment.assessedAt).toLocaleString())}${assessment.assessedBy ? ` by ${escapeHtml(assessment.assessedBy)}` : ''}
				</div>
			</div>
			<div class="aes-block">
				<div class="aes-block-title">Outcome</div>
				<div class="aes-outcome"><strong>Customer value:</strong> ${escapeHtml(assessment.outcome.customerValue)}</div>
				<div class="aes-outcome"><strong>Customers:</strong> ${escapeHtml(assessment.outcome.customers)}</div>
			</div>
			<div class="aes-block-title">Posture</div>
			${buildPostureBannerHtml(report)}
			<div class="aes-block-title">Stocks</div>
			${buildStocksHtml(report)}
			<div class="aes-block-title">Activities (define &rarr; deliver &rarr; detect)</div>
			${buildActivitiesHtml(report)}
			<div class="aes-block-title">Modes (director / performer / assessor)</div>
			${buildModesHtml(report)}
			${assessment.notes ? `<div class="aes-block-title">Notes</div><div class="aes-outcome">${escapeHtml(assessment.notes)}</div>` : ''}
			<div class="aes-footer">Schema v${assessment.schemaVersion}</div>
		</div>
	`;
}
