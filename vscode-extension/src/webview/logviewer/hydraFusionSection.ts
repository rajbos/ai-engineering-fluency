// Renders the log viewer's "HydraFusion Routing" section: the per-leg story behind a
// turn that the CLI deliberately collapses into one answer and one credit figure.
//
// Pure string builders with no CSS/DOM imports (same contract as turnsOverview.ts) so
// the markup is unit-testable directly in Node, unlike main.ts.
//
// The data comes from `analyzeHydraFusionSession` in src/hydrafusion.ts.
//
// @security every model id, pattern, verdict and phase kind originates from the session
// file and is therefore untrusted; all of them go through `escapeHtml` before rendering.

import { escapeHtml, formatCompact, formatCost, formatPercent } from '../shared/formatUtils';
import { aiuToUsd } from '../../../../src/hydrafusion';
import type {
	HydraFusionPhase,
	HydraFusionSummary,
	HydraFusionTurn,
} from '../../../../src/hydrafusion';

/** Phase kinds grouped by what they contribute, which drives their colour and icon. */
const PHASE_META: Record<string, { icon: string; cssClass: string; label: string }> = {
	primary: { icon: '🎯', cssClass: 'hydra-phase-solve', label: 'primary' },
	draft: { icon: '✏️', cssClass: 'hydra-phase-solve', label: 'draft' },
	judge: { icon: '⚖️', cssClass: 'hydra-phase-review', label: 'judge' },
	critic: { icon: '🔍', cssClass: 'hydra-phase-review', label: 'critic' },
	repair: { icon: '🛠️', cssClass: 'hydra-phase-repair', label: 'repair' },
	revision: { icon: '♻️', cssClass: 'hydra-phase-repair', label: 'revision' },
};

/** What each execution pattern means, shown as the badge's tooltip. */
const PATTERN_META: Record<string, { cssClass: string; title: string }> = {
	single: { cssClass: 'hydra-pattern-single', title: 'One model solved the task on its own' },
	cascade: { cssClass: 'hydra-pattern-cascade', title: 'An efficient model drafted, a judge accepted or rejected it, and a rejection escalated the task to a stronger model' },
	critique: { cssClass: 'hydra-pattern-critique', title: 'One model drafted, a critic from another family reviewed it, and the drafter could revise once' },
};

function phaseMeta(kind: string): { icon: string; cssClass: string; label: string } {
	return PHASE_META[kind] ?? { icon: '•', cssClass: 'hydra-phase-other', label: kind };
}

function patternClass(pattern: string): string {
	return PATTERN_META[pattern]?.cssClass ?? 'hydra-pattern-other';
}

function patternTitle(pattern: string): string {
	return PATTERN_META[pattern]?.title ?? 'Routing pattern reported by the CLI';
}

/** Formats AIU credits as the USD cost shown everywhere else in the app. */
export function formatFusionCost(aiu: number): string {
	return formatCost(aiuToUsd(aiu));
}

/**
 * Formats a wall-clock duration compactly: sub-second in ms, then seconds, then `m s`.
 * Fusion legs range from a few milliseconds to several minutes, so all three matter.
 */
export function formatFusionDuration(ms: number): string {
	if (!Number.isFinite(ms) || ms <= 0) { return '—'; }
	if (ms < 1_000) { return `${Math.round(ms)} ms`; }
	if (ms < 60_000) { return `${(ms / 1_000).toFixed(1)} s`; }
	const minutes = Math.floor(ms / 60_000);
	const seconds = Math.round((ms % 60_000) / 1_000);
	return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
}

/** Bar width as a percentage of the largest value in a set, floored so tiny values stay visible. */
export function barWidthPercent(value: number, max: number): number {
	if (!(max > 0) || !(value > 0)) { return 0; }
	return Math.max(2, Math.min(100, (value / max) * 100));
}

function renderCard(icon: string, label: string, value: string, sub: string, title?: string): string {
	return `<div class="hydra-card"${title ? ` title="${escapeHtml(title)}"` : ''}>
<div class="hydra-card-label">${icon} ${escapeHtml(label)}</div>
<div class="hydra-card-value">${escapeHtml(value)}</div>
<div class="hydra-card-sub">${escapeHtml(sub)}</div>
</div>`;
}

/**
 * The headline numbers: how often the router compounded models, how the quality gate
 * ruled, what share of the bill bought review, and what the whole thing cost.
 */
function renderHeadlineCards(summary: HydraFusionSummary): string {
	const cards: string[] = [];

	cards.push(renderCard(
		'🧬', 'Compound turns', formatPercent(summary.compoundRatePercent),
		`${summary.compoundTurns} of ${summary.totalTurns} turns used more than one model`,
		'A compound turn is one where the router ran more than one leg, so more than one model contributed to the answer you saw.',
	));

	if (summary.judgeRejectionRatePercent !== null) {
		cards.push(renderCard(
			'⚖️', 'Judge rejections', formatPercent(summary.judgeRejectionRatePercent),
			`${summary.judgeRejects} rejected · ${summary.judgeAccepts} accepted`,
			'A rejection is the quality gate doing its job: the draft did not clear the bar, so the turn escalated to a stronger model.',
		));
	}

	cards.push(renderCard(
		'🔍', 'Review share', formatPercent(summary.reviewSharePercent),
		`${formatFusionCost(summary.reviewAiu)} of ${formatFusionCost(summary.totalAiu)}`,
		'Share of the bill spent on legs that did not supply the final answer — reviews and superseded drafts. Those legs still sit in the final leg\'s context, so this is the cost of review rather than waste.',
	));

	cards.push(renderCard(
		'💳', 'Cost', formatFusionCost(summary.totalAiu),
		`${summary.totalLegs} legs · ${summary.totalRequestCount} inference calls`,
		'Cost of the AI credits the CLI itself reported (1 credit = $0.01), summed from each turn\'s rollup. Legs are router hops; inference calls are model round trips across all of them.',
	));

	cards.push(renderCard(
		'📥', 'Tokens', formatCompact(summary.totalInputTokens + summary.totalOutputTokens),
		`${formatCompact(summary.totalInputTokens)} in (${formatCompact(summary.totalCachedTokens)} cached) · ${formatCompact(summary.totalOutputTokens)} out`,
		'Input dwarfs output on routed turns, and much of that input is served from cache — so visible output length is a poor proxy for what a turn costs.',
	));

	if (summary.avgRoutingLatencyMs !== null) {
		const turn = summary.turns.find(t => t.routeSource || t.policy);
		const sub = [turn?.routeSource, turn?.policy ? `policy ${turn.policy}` : null].filter(Boolean).join(' · ');
		cards.push(renderCard(
			'🧭', 'Routing decision', formatFusionDuration(summary.avgRoutingLatencyMs),
			sub || 'mean time to pick a pattern',
			'Mean time the router took to choose a pattern. `capi_plan` means the decision is served remotely, so the routing mix can change without a CLI update.',
		));
	}

	if (summary.degradedTurns > 0) {
		cards.push(renderCard(
			'⚠️', 'Degraded turns', String(summary.degradedTurns),
			'router fell back off its plan',
			'Turns that reported a degradedReason — the router could not follow its intended plan and took a fallback path.',
		));
	}

	return `<div class="hydra-cards">${cards.join('')}</div>`;
}

/** The pattern mix as pills — which execution shapes the router chose, and what each cost. */
function renderPatternPills(summary: HydraFusionSummary): string {
	const pills = summary.patternCounts.map(p => `<span class="hydra-pattern-pill ${patternClass(p.pattern)}" title="${escapeHtml(patternTitle(p.pattern))}">
${escapeHtml(p.pattern)} <strong>${p.turns}</strong> <span class="hydra-pattern-pill-aiu">${escapeHtml(formatFusionCost(p.aiu))}</span>
</span>`).join('');
	return `<div class="hydra-pattern-row"><span class="hydra-pattern-row-label">Patterns chosen</span>${pills}</div>`;
}

/** "Who did the work": every model that served a leg, ranked by credits spent. */
function renderModelTable(summary: HydraFusionSummary): string {
	const maxAiu = Math.max(...summary.byModel.map(m => m.aiu), 0);
	const rows = summary.byModel.map(m => `<tr>
<td class="hydra-model-cell"><span class="hydra-model-name">${escapeHtml(m.model)}</span></td>
<td class="hydra-num">${m.legs}</td>
<td class="hydra-num" title="Turns where this model supplied the answer you saw">${m.finalAnswers}</td>
<td class="hydra-num"><strong>${escapeHtml(formatFusionCost(m.aiu))}</strong></td>
<td class="hydra-bar-cell"><span class="hydra-bar" style="width:${barWidthPercent(m.aiu, maxAiu).toFixed(1)}%"></span></td>
<td class="hydra-num">${formatCompact(m.inputTokens)}</td>
<td class="hydra-num">${formatCompact(m.outputTokens)}</td>
</tr>`).join('');

	return `<div class="hydra-panel">
<div class="hydra-panel-title">🤝 Who did the work</div>
<div class="hydra-panel-sub">Every leg the router ran, grouped by the model that served it.</div>
<table class="hydra-table">
<thead><tr>
<th scope="col">Model</th>
<th scope="col" title="Router hops this model served">Legs</th>
<th scope="col" title="Turns where this model produced the final answer">Answers</th>
<th scope="col">Cost</th>
<th scope="col"><span class="hydra-sr-only">Share of credits</span></th>
<th scope="col">Input</th>
<th scope="col">Output</th>
</tr></thead>
<tbody>${rows}</tbody>
</table>
</div>`;
}

/** "Where the credits went": the phase ledger, by what each leg was for. */
function renderPhaseLedger(summary: HydraFusionSummary): string {
	const maxAiu = Math.max(...summary.byPhaseKind.map(p => p.aiu), 0);
	const rows = summary.byPhaseKind.map(p => {
		const meta = phaseMeta(p.kind);
		return `<tr>
<td><span class="hydra-phase-badge ${meta.cssClass}">${meta.icon} ${escapeHtml(p.kind)}</span></td>
<td class="hydra-num">${p.legs}</td>
<td class="hydra-num"><strong>${escapeHtml(formatFusionCost(p.aiu))}</strong></td>
<td class="hydra-bar-cell"><span class="hydra-bar ${meta.cssClass}" style="width:${barWidthPercent(p.aiu, maxAiu).toFixed(1)}%"></span></td>
</tr>`;
	}).join('');

	return `<div class="hydra-panel">
<div class="hydra-panel-title">💰 Where the credits went</div>
<div class="hydra-panel-sub">Solving, reviewing and repairing, priced separately.</div>
<table class="hydra-table">
<thead><tr>
<th scope="col">Phase</th>
<th scope="col">Legs</th>
<th scope="col">Cost</th>
<th scope="col"><span class="hydra-sr-only">Share of credits</span></th>
</tr></thead>
<tbody>${rows}</tbody>
</table>
</div>`;
}

/** The model chain for one turn, e.g. `mai-code-1.1-flash → gpt-5.6-sol ✗ → gpt-5.6-sol`. */
function renderModelChain(turn: HydraFusionTurn): string {
	return turn.phases.map(p => {
		const verdictMark = p.verdict === 'reject' ? '<span class="hydra-verdict-reject" title="Judge rejected this draft">✗</span>'
			: p.verdict === 'accept' ? '<span class="hydra-verdict-accept" title="Judge accepted this draft">✓</span>'
			: '';
		const finalMark = p.isFinalSource ? '<span class="hydra-final-dot" title="This leg produced the answer you saw">●</span>' : '';
		return `<span class="hydra-chain-item ${phaseMeta(p.kind).cssClass}" title="${escapeHtml(`${p.kind} · ${p.model} · ${formatFusionCost(p.usage.aiu)}`)}">${escapeHtml(p.model)}${verdictMark}${finalMark}</span>`;
	}).join('<span class="hydra-chain-arrow">→</span>');
}

/** One leg's row inside an expanded turn, with a duration bar scaled to the turn's slowest leg. */
function renderLegRow(phase: HydraFusionPhase, maxDurationMs: number): string {
	const meta = phaseMeta(phase.kind);
	const verdict = phase.verdict
		? `<span class="hydra-verdict hydra-verdict-${escapeHtml(phase.verdict)}">${escapeHtml(phase.verdict)}</span>`
		: '<span class="hydra-muted">—</span>';
	return `<tr class="${phase.isFinalSource ? 'hydra-leg-final' : ''}">
<td><span class="hydra-phase-badge ${meta.cssClass}">${meta.icon} ${escapeHtml(phase.kind)}</span></td>
<td class="hydra-model-cell">${escapeHtml(phase.model)}${phase.isFinalSource ? ' <span class="hydra-final-tag" title="This leg produced the answer you saw">answer</span>' : ''}</td>
<td>${verdict}</td>
<td class="hydra-num">${escapeHtml(formatFusionDuration(phase.durationMs))}</td>
<td class="hydra-bar-cell"><span class="hydra-bar ${meta.cssClass}" style="width:${barWidthPercent(phase.durationMs, maxDurationMs).toFixed(1)}%"></span></td>
<td class="hydra-num">${phase.usage.requestCount}</td>
<td class="hydra-num">${formatCompact(phase.usage.inputTokens)}</td>
<td class="hydra-num">${formatCompact(phase.usage.outputTokens)}</td>
<td class="hydra-num"><strong>${escapeHtml(formatFusionCost(phase.usage.aiu))}</strong></td>
</tr>`;
}

/**
 * The leg-by-leg waterfall for one turn: phase, model, verdict, duration and cost.
 * Exported so the Session Steps Overview table (main.ts) can embed the exact same
 * table under a matching turn's row instead of re-deriving its own — see
 * `matchHydraFusionTurnsToChatTurns` in src/hydrafusion.ts for how rows are matched.
 */
export function renderLegsTable(phases: HydraFusionPhase[]): string {
	const maxDurationMs = Math.max(...phases.map(p => p.durationMs), 0);
	const legs = phases.map(p => renderLegRow(p, maxDurationMs)).join('');
	return `<table class="hydra-table hydra-legs-table">
<thead><tr>
<th scope="col">Phase</th>
<th scope="col">Model</th>
<th scope="col">Verdict</th>
<th scope="col">Duration</th>
<th scope="col"><span class="hydra-sr-only">Relative duration</span></th>
<th scope="col" title="Inference calls this leg made">Calls</th>
<th scope="col">Input</th>
<th scope="col">Output</th>
<th scope="col">Cost</th>
</tr></thead>
<tbody>${legs}</tbody>
</table>`;
}

/**
 * One collapsed turn row that expands into its leg-by-leg waterfall.
 *
 * @param chatTurnNumber The matching row in the Session Steps Overview table below,
 *   when `matchHydraFusionTurnsToChatTurns` could place this turn — renders a link
 *   that scrolls to and expands that row so the same leg detail can be reached from
 *   either place. `null` when no match was found (e.g. the chat turn carries no
 *   timestamp), in which case the link is simply omitted — as it also is when the
 *   turn has no completed phases yet (an in-flight turn): the overview row has
 *   nothing to expand, so a link there would promise detail it can't deliver.
 */
export function renderTurnRow(turn: HydraFusionTurn, index: number, chatTurnNumber: number | null = null): string {
	const plan = turn.plannedPhases.length > 0 ? turn.plannedPhases.join(' › ') : null;
	const skipped = plan && turn.plannedPhases.length > turn.phases.length
		? ` (${turn.plannedPhases.length - turn.phases.length} planned leg${turn.plannedPhases.length - turn.phases.length === 1 ? '' : 's'} never ran)`
		: '';
	const canJumpToStep = chatTurnNumber !== null && turn.phases.length > 0;

	return `<details class="hydra-turn">
<summary class="hydra-turn-summary">
<span class="hydra-turn-num">#${index + 1}</span>
<span class="hydra-pattern-badge ${patternClass(turn.pattern)}" title="${escapeHtml(patternTitle(turn.pattern))}">${escapeHtml(turn.pattern)}</span>
<span class="hydra-turn-chain">${renderModelChain(turn)}</span>
<span class="hydra-turn-metrics">
<span title="Cost for this turn"><strong>${escapeHtml(formatFusionCost(turn.aiu))}</strong></span>
<span title="Wall-clock time for the whole turn">${escapeHtml(formatFusionDuration(turn.durationMs))}</span>
<span title="Router hops in this turn">${turn.phases.length} leg${turn.phases.length === 1 ? '' : 's'}</span>
${canJumpToStep ? `<span class="hydra-jump-to-step" data-turn="${chatTurnNumber}" title="Jump to step #${chatTurnNumber} in the Session Steps Overview below" role="button" tabindex="0">⤵ step #${chatTurnNumber}</span>` : ''}
</span>
</summary>
<div class="hydra-turn-body">
${plan ? `<div class="hydra-turn-plan">Planned: <code>${escapeHtml(plan)}</code>${escapeHtml(skipped)}</div>` : ''}
${turn.degradedReason ? `<div class="hydra-turn-degraded">⚠️ Degraded: ${escapeHtml(turn.degradedReason)}</div>` : ''}
${renderLegsTable(turn.phases)}
</div>
</details>`;
}

/**
 * Renders the whole HydraFusion section, or an empty string when the session never
 * routed through it — which is the case for every session except HydraFusion CLI ones.
 *
 * @param chatTurnMatches Fusion turn index → matching `ChatTurn.turnNumber`, from
 *   `matchHydraFusionTurnsToChatTurns`. Optional so direct callers (and existing
 *   tests) can render the section on its own; omitting it just drops the
 *   "jump to step" links from each turn row.
 */
export function renderHydraFusionSection(summary: HydraFusionSummary | undefined, chatTurnMatches?: Map<number, number>): string {
	if (!summary || summary.totalTurns === 0) { return ''; }

	const modelCount = summary.models.length;
	return `<div class="hydra-section" id="section-hydrafusion-routing">
<div class="hydra-header">
<span class="hydra-header-title">⚡ HydraFusion Routing</span>
<span class="hydra-header-sub">${summary.totalTurns} turn${summary.totalTurns === 1 ? '' : 's'} · ${summary.totalLegs} legs · ${modelCount} model${modelCount === 1 ? '' : 's'}</span>
</div>
<div class="hydra-intro">
HydraFusion answers one prompt with several models — drafting, reviewing and escalating — then hands back a single answer and a single credit figure. The chat above shows that answer; this section shows the legs behind it, reconstructed from the routing decisions the CLI records for its own resume and rewind.
</div>
${renderHeadlineCards(summary)}
${renderPatternPills(summary)}
<div class="hydra-split">
${renderModelTable(summary)}
${renderPhaseLedger(summary)}
</div>
<div class="hydra-panel hydra-turns-panel">
<div class="hydra-panel-title">🧩 One turn in detail</div>
<div class="hydra-panel-sub">Expand a turn to see each leg, what it decided, and what it cost. ● marks the leg whose output you actually received; ✗ marks a leg a judge rejected. The same legs also appear under their step in the Session Steps Overview below.</div>
<div class="hydra-turns">${summary.turns.map((t, i) => renderTurnRow(t, i, chatTurnMatches?.get(i) ?? null)).join('')}</div>
</div>
</div>`;
}
