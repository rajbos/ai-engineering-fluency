/**
 * The adoption × foundations matrix at the top of the AI Readiness tab.
 *
 * Places each scanned repository in one of the four states of GitHub's
 * stock-adoption matrix (see src/agenticFoundations.ts) and names the action
 * for it. It combines repository controls with the user's own session
 * activity, which is why it lives only here, locally, and is never part of
 * any export or upload.
 *
 * Pure string building plus a payload sanitizer — unit-testable without a DOM.
 */
import { escapeHtml, formatNumber, formatPercent } from '../shared/formatUtils';
import { localize, localizeFormat } from '../shared/localization';
import type { AgenticMatrix, AgenticMatrixPlacement, AgenticQuadrant, FoundationLevel } from '../../../../src/types';

const QUADRANTS: readonly AgenticQuadrant[] = ['healthy-underused', 'healthy-agent-native', 'underdeveloped', 'stretched'];
const FOUNDATIONS: readonly FoundationLevel[] = ['strong', 'partial', 'weak', 'unassessed'];

function nonNegative(value: unknown): value is number {
	return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function sanitizePlacement(raw: any): AgenticMatrixPlacement | null {
	if (!raw || typeof raw.repository !== 'string' || !FOUNDATIONS.includes(raw.foundation)) { return null; }
	if (![raw.observedControls, raw.unknownControls, raw.agenticSessions, raw.sessions].every(nonNegative)) { return null; }
	if (raw.quadrant !== undefined && !QUADRANTS.includes(raw.quadrant)) { return null; }
	const missing = Array.isArray(raw.missingControls)
		? raw.missingControls.filter((c: any) => c && typeof c.id === 'string' && typeof c.label === 'string' && nonNegative(c.stage))
			.map((c: any) => ({ id: c.id, label: c.label, stage: c.stage }))
		: [];
	return {
		repository: raw.repository,
		foundation: raw.foundation,
		foundationScore: typeof raw.foundationScore === 'number' && raw.foundationScore >= 0 && raw.foundationScore <= 1 ? raw.foundationScore : null,
		observedControls: raw.observedControls,
		unknownControls: raw.unknownControls,
		agenticSessions: raw.agenticSessions,
		sessions: raw.sessions,
		highAdoption: raw.highAdoption === true,
		quadrant: raw.quadrant,
		leaning: raw.leaning === true,
		missingControls: missing,
		unassessedReason: raw.unassessedReason === 'too-few-controls' || raw.unassessedReason === 'no-remote' ? raw.unassessedReason : undefined,
	};
}

/** Validate the matrix posted with `readinessLoaded`; null when absent or malformed. */
export function sanitizeAgenticMatrix(raw: any): AgenticMatrix | null {
	if (!raw || typeof raw !== 'object' || !Array.isArray(raw.placements) || !nonNegative(raw.windowDays)) { return null; }
	const placements = raw.placements.map(sanitizePlacement).filter((p: AgenticMatrixPlacement | null): p is AgenticMatrixPlacement => p !== null);
	const adoptionOnly = Array.isArray(raw.adoptionOnly)
		? raw.adoptionOnly.filter((r: any) => r && typeof r.repository === 'string' && nonNegative(r.agenticSessions) && nonNegative(r.sessions))
			.map((r: any) => ({ repository: r.repository, agenticSessions: r.agenticSessions, sessions: r.sessions }))
		: [];
	return { windowDays: raw.windowDays, placements, adoptionOnly };
}

function chipHtml(p: AgenticMatrixPlacement): string {
	const score = p.foundationScore === null ? '—' : formatPercent(p.foundationScore * 100, 0);
	const title = localizeFormat('agentic.matrix.chipTitle', score, p.observedControls, p.unknownControls, p.agenticSessions, p.sessions);
	const leaning = p.leaning ? ' agentic-repo-chip-leaning' : '';
	const suffix = p.leaning ? ` ${escapeHtml(localize('agentic.matrix.leaning'))}` : '';
	return `<span class="agentic-repo-chip${leaning}" title="${escapeHtml(title)}">${escapeHtml(p.repository)}${suffix}</span>`;
}

function quadrantHtml(quadrant: AgenticQuadrant, placements: readonly AgenticMatrixPlacement[]): string {
	const inQuadrant = placements.filter(p => p.quadrant === quadrant);
	const modifier = quadrant === 'stretched' && inQuadrant.length > 0
		? ' agentic-quadrant-stretched'
		: quadrant === 'healthy-agent-native' && inQuadrant.length > 0 ? ' agentic-quadrant-healthy' : '';
	const chips = inQuadrant.length > 0
		? `<div class="agentic-repo-chips">${inQuadrant.map(chipHtml).join('')}</div>`
		: `<div class="agentic-muted" style="margin-top:8px;">${escapeHtml(localize('agentic.matrix.emptyQuadrant'))}</div>`;
	// Each quadrant is its own labelled group; its title already names both axes
	// ("Healthy but underused"), so the visual axis labels are hidden from assistive technology.
	return `<div class="agentic-quadrant${modifier}" data-quadrant="${quadrant}" role="group" aria-label="${escapeHtml(localize(`agentic.matrix.quadrant.${quadrant}`))}">
		<div class="agentic-quadrant-title">${escapeHtml(localize(`agentic.matrix.quadrant.${quadrant}`))}</div>
		<div class="agentic-quadrant-action">${escapeHtml(localize(`agentic.matrix.action.${quadrant}`))}</div>
		${chips}
	</div>`;
}

function stretchedDetailHtml(placements: readonly AgenticMatrixPlacement[]): string {
	const stretched = placements.filter(p => p.quadrant === 'stretched' && p.missingControls.length > 0);
	if (stretched.length === 0) { return ''; }
	const items = stretched.map(p => {
		const controls = p.missingControls.slice(0, 4).map(c => escapeHtml(c.label)).join(', ');
		const more = p.missingControls.length > 4 ? ` ${escapeHtml(localizeFormat('agentic.matrix.more', p.missingControls.length - 4))}` : '';
		return `<li><strong>${escapeHtml(p.repository)}</strong>: ${controls}${more}</li>`;
	}).join('');
	return `<div class="agentic-note agentic-note-strong">${escapeHtml(localize('agentic.matrix.stretchedRepair'))}
		<ul class="agentic-stretched-list">${items}</ul>
	</div>`;
}

function otherReposHtml(matrix: AgenticMatrix): string {
	const unassessed = matrix.placements.filter(p => !p.quadrant);
	const parts: string[] = [];
	if (unassessed.length > 0) {
		const names = unassessed.map(p => `${escapeHtml(p.repository)} (${escapeHtml(localize(`agentic.matrix.unassessed.${p.unassessedReason ?? 'too-few-controls'}`))})`).join(', ');
		parts.push(`<div class="agentic-muted" style="margin-top:6px;">${escapeHtml(localize('agentic.matrix.unassessedTitle'))} ${names}</div>`);
	}
	if (matrix.adoptionOnly.length > 0) {
		const names = matrix.adoptionOnly
			.map(r => `${escapeHtml(r.repository)} (${escapeHtml(localizeFormat('agentic.matrix.agenticSessions', formatNumber(r.agenticSessions)))})`)
			.join(', ');
		parts.push(`<div class="agentic-muted" style="margin-top:6px;">${escapeHtml(localize('agentic.matrix.adoptionOnlyTitle'))} ${names}</div>`);
	}
	return parts.join('');
}

/** The matrix section. Empty string when there is no matrix or nothing was scanned. */
export function buildAgenticMatrixHtml(matrix: AgenticMatrix | null | undefined): string {
	if (!matrix || (matrix.placements.length === 0 && matrix.adoptionOnly.length === 0)) { return ''; }
	const placed = matrix.placements.filter(p => p.quadrant);
	return `<div class="section" id="agentic-matrix">
		<div class="section-title"><span class="codicon codicon-graph-scatter"></span><span>${escapeHtml(localize('agentic.matrix.title'))}</span></div>
		<div class="section-subtitle">${escapeHtml(localizeFormat('agentic.matrix.subtitle', matrix.windowDays))}</div>
		<div class="agentic-matrix" role="group" aria-label="${escapeHtml(localize('agentic.matrix.title'))}">
			<span aria-hidden="true"></span>
			<span class="agentic-matrix-axis" aria-hidden="true">${escapeHtml(localize('agentic.matrix.axisLowAdoption'))}</span>
			<span class="agentic-matrix-axis" aria-hidden="true">${escapeHtml(localize('agentic.matrix.axisHighAdoption'))}</span>
			<span class="agentic-matrix-axis" aria-hidden="true">${escapeHtml(localize('agentic.matrix.axisStrong'))}</span>
			${quadrantHtml('healthy-underused', placed)}
			${quadrantHtml('healthy-agent-native', placed)}
			<span class="agentic-matrix-axis" aria-hidden="true">${escapeHtml(localize('agentic.matrix.axisWeak'))}</span>
			${quadrantHtml('underdeveloped', placed)}
			${quadrantHtml('stretched', placed)}
		</div>
		${stretchedDetailHtml(placed)}
		${otherReposHtml(matrix)}
		<details class="agentic-definition"><summary>${escapeHtml(localize('agentic.matrix.howTitle'))}</summary>
			<div>${escapeHtml(localize('agentic.matrix.how'))}</div>
		</details>
	</div>`;
}
