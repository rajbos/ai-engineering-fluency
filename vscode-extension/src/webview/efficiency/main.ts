// Efficiency webview — "am I working more efficiently over time, and why?"
// Renders weekly ratio trends, month-over-month delta cards, a cost-change
// decomposition (volume vs. efficiency vs. model mix), value signals, and a
// combined indexed chart that overlays the ratio series with output.
import { navButtonsHtml } from '../shared/buttonConfig';
import { setHtml } from '../shared/domUtils';
import { escapeHtml, formatCompact, setCompactNumbers } from '../shared/formatUtils';
import { wireExtensionPointButtons } from '../shared/extensionPoints';
import themeStyles from '../shared/theme.css';
import styles from './styles.css';
import { getWindowData } from '../../../../src/webview/shared/dataLoader';
import type {
	CostAttribution,
	EfficiencyDelta,
	EfficiencyViewData,
	ModelComparison,
	ModelComparisonMetricId,
	ModelComparisonRow,
	ModelCompareWindowId,
	ModelPeriodMetrics,
	SkillImpact,
} from '../../../../src/efficiencyAnalysis';
import {
	buildModelWeeklySeries,
	compareModels,
	computeModelPeriodMetrics,
	listComparableModels,
	resolveModelCompareWindow,
	selectDaysInWindow,
} from '../../../../src/efficiencyAnalysis';
import { initializeWebviewLocalization, setCurrentLanguage } from '../shared/localization';

// Minimal structural types for the dynamically imported Chart.js bundle —
// a `typeof import('chart.js/auto')` type-import trips TS1542 under CJS resolution.
type ChartInstance = { destroy(): void };
type ChartConstructor = new (canvas: HTMLCanvasElement, config: unknown) => ChartInstance;

declare function acquireVsCodeApi<TState = unknown>(): {
	postMessage: (message: unknown) => void;
	setState: (newState: TState) => void;
	getState: () => TState | undefined;
};

const vscode = acquireVsCodeApi();
const data = getWindowData<EfficiencyViewData & { localization?: Record<string, string> }>('__INITIAL_EFFICIENCY__');

// Initialize localization for webview
if (data?.localization) {
	initializeWebviewLocalization(data.localization);
	const language = data.localization['__language__'] || 'en';
	setCurrentLanguage(language);
}

let Chart: ChartConstructor | undefined;
const liveCharts: ChartInstance[] = [];

async function loadChartModule(): Promise<void> {
	if (Chart) { return; }
	const mod = await import('chart.js/auto') as { default: unknown };
	Chart = mod.default as ChartConstructor;
}

type TabId = 'trends' | 'skills' | 'deltas' | 'attribution' | 'models' | 'value' | 'combined';
let activeTab: TabId = 'trends';

const TABS: { id: TabId; label: string }[] = [
	{ id: 'trends', label: '📈 Trends' },
	{ id: 'skills', label: '🛠️ Tools & Skills' },
	{ id: 'deltas', label: '🗓️ Month vs Month' },
	{ id: 'attribution', label: '💸 Cost Attribution' },
	{ id: 'models', label: '🤖 Models' },
	{ id: 'value', label: '🎁 Value' },
	{ id: 'combined', label: '🧩 Combined' },
];

// ── Formatting ─────────────────────────────────────────────────────────

function cssVar(name: string, fallback: string): string {
	const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
	return v || fallback;
}

function fmtValue(v: number | null, unit: EfficiencyDelta['unit']): string {
	if (v === null) { return '—'; }
	switch (unit) {
		case 'percent': return `${(v * 100).toFixed(1)}%`;
		case 'minutes': return `${v.toFixed(1)} min`;
		case 'tokens': return formatCompact(Math.round(v));
		case 'currency': return `$${v.toFixed(2)}`;
		case 'ratio': return v.toFixed(1);
	}
}

function fmtMoney(v: number): string {
	const sign = v < 0 ? '−' : '+';
	return `${sign}$${Math.abs(v).toFixed(2)}`;
}

/** Uppercases the first letter only — for window labels that read lowercase mid-sentence. */
function capitalizeFirst(s: string): string {
	return s.length > 0 ? s[0].toUpperCase() + s.slice(1) : s;
}

// ── Trend maths ────────────────────────────────────────────────────────

/**
 * Direction of a series over the window: compares the average of the first
 * and second halves (ignoring nulls) — more robust than endpoint deltas on
 * noisy weekly data. Returns percent change, or null with too little data.
 */
function halfOverHalfChange(values: (number | null)[]): number | null {
	const present = values.map((v, i) => ({ v, i })).filter((x): x is { v: number; i: number } => x.v !== null);
	if (present.length < 4) { return null; }
	const mid = Math.floor(present.length / 2);
	const avg = (xs: { v: number }[]) => xs.reduce((s, x) => s + x.v, 0) / xs.length;
	const first = avg(present.slice(0, mid));
	const second = avg(present.slice(mid));
	if (first === 0) { return null; }
	return ((second - first) / Math.abs(first)) * 100;
}

function trendBadge(values: (number | null)[], goodDirection: 'up' | 'down'): string {
	const change = halfOverHalfChange(values);
	if (change === null) { return ''; }
	if (Math.abs(change) < 5) { return `<span class="trend-badge flat">→ steady</span>`; }
	const arrow = change > 0 ? '↑' : '↓';
	const good = (change < 0) === (goodDirection === 'down');
	return `<span class="trend-badge ${good ? 'good' : 'bad'}">${arrow} ${Math.abs(change).toFixed(0)}%</span>`;
}

// ── Verdict ────────────────────────────────────────────────────────────

function computeVerdict(d: EfficiencyViewData): { cls: string; icon: string; text: string } {
	const scored = d.deltas.filter(x => x.improved !== null);
	if (scored.length === 0) {
		return { cls: 'unknown', icon: '🔍', text: 'Not enough data yet to judge an efficiency trend — keep using AI-assisted sessions and check back after a few weeks.' };
	}
	const improved = scored.filter(x => x.improved).length;
	const share = improved / scored.length;
	const detail = `${improved} of ${scored.length} efficiency metrics improved vs. ${escapeHtml(d.deltaWindows.prev)}`;
	if (share >= 0.6) { return { cls: 'improving', icon: '🚀', text: `You are trending more efficient: ${detail}.` }; }
	if (share >= 0.4) { return { cls: 'mixed', icon: '⚖️', text: `Mixed picture: ${detail}. Check the tabs below to see which levers moved.` }; }
	return { cls: 'declining', icon: '🧭', text: `Efficiency dipped: only ${detail}. The Cost Attribution tab shows where the change came from.` };
}

// ── Section renderers ──────────────────────────────────────────────────

type TrendSpec = {
	id: string;
	title: string;
	desc: string;
	goodDirection: 'up' | 'down';
	values: (number | null)[];
	format: (v: number) => string;
	available: boolean;
	unavailableHint: string;
};

function buildTrendSpecs(d: EfficiencyViewData): TrendSpec[] {
	const w = d.weekly;
	return [
		{
			id: 'cost-per-kloc', title: '💰 Cost per 1K lines changed', goodDirection: 'down',
			desc: 'Estimated cost divided by lines of code added + removed. The headline "value per dollar" ratio.',
			values: w.map(x => x.costPerKloc), format: v => `$${v.toFixed(2)}`,
			available: d.hasLoc, unavailableHint: 'No lines-of-code data found in your sessions yet.',
		},
		{
			id: 'tokens-per-session', title: '🎟️ Tokens per session', goodDirection: 'down',
			desc: 'Total tokens divided by sessions. Falling values mean leaner sessions for the same work.',
			values: w.map(x => x.tokensPerSession), format: v => formatCompact(Math.round(v)),
			available: true, unavailableHint: '',
		},
		{
			id: 'turns-per-session', title: '🔄 Turns per session', goodDirection: 'down',
			desc: 'User requests per session. Less back-and-forth to reach a usable result.',
			values: w.map(x => x.turnsPerSession), format: v => v.toFixed(1),
			available: true, unavailableHint: '',
		},
		{
			id: 'active-minutes', title: '⏱️ Active minutes per session', goodDirection: 'down',
			desc: 'Net working time per session, excluding idle gaps. Session length going down.',
			values: w.map(x => x.activeMinutesPerSession), format: v => `${v.toFixed(0)} min`,
			available: d.hasDuration, unavailableHint: 'No session-duration data available for these weeks.',
		},
		{
			id: 'retry-rate', title: '🔁 Edit retry rate', goodDirection: 'down',
			desc: 'Share of edit turns needing a retry. Lower = edits land first time (quality going up).',
			values: w.map(x => x.retryRate === null ? null : x.retryRate * 100), format: v => `${v.toFixed(0)}%`,
			available: d.hasRetry, unavailableHint: 'Not enough edit turns per week to compute retry rates.',
		},
		{
			id: 'apply-rate', title: '✅ Apply rate', goodDirection: 'up',
			desc: 'Share of suggested code blocks you applied. Higher = more directly usable output.',
			values: w.map(x => x.applyRate === null ? null : x.applyRate * 100), format: v => `${v.toFixed(0)}%`,
			available: d.hasApply, unavailableHint: 'No apply-button data in these sessions (agent/CLI sessions apply edits directly).',
		},
		{
			id: 'loc-per-dollar', title: '📦 Lines changed per dollar', goodDirection: 'up',
			desc: 'Output per unit of spend — the inverse view of cost per 1K lines.',
			values: w.map(x => x.locPerDollar), format: v => v.toFixed(0),
			available: d.hasLoc, unavailableHint: 'No lines-of-code data found in your sessions yet.',
		},
	];
}

function renderTrendsTab(d: EfficiencyViewData): string {
	const cards = buildTrendSpecs(d).map(spec => {
		const body = spec.available
			? `<div class="chart-wrap"><canvas id="trend-${spec.id}"></canvas></div>`
			: `<div class="trend-empty">${escapeHtml(spec.unavailableHint)}</div>`;
		return `
			<div class="trend-card">
				<h3><span>${spec.title}</span>${spec.available ? trendBadge(spec.values, spec.goodDirection) : ''}</h3>
				<p class="trend-desc">${escapeHtml(spec.desc)}</p>
				${body}
			</div>`;
	}).join('');
	return `
		<p class="eff-section-note">Weekly ratios over the last ${d.weekly.length} weeks. Badges compare the recent half of the window against the earlier half; green means the ratio moved in the efficient direction. The current week is partial.</p>
		<div class="trend-grid">${cards}</div>`;
}

function renderDeltasTab(d: EfficiencyViewData): string {
	const cards = d.deltas.map(delta => {
		let change = '<span class="delta-na">not enough data</span>';
		if (delta.deltaPct !== null) {
			const cls = delta.improved === null ? 'flat' : delta.improved ? 'good' : 'bad';
			const arrow = delta.deltaPct > 0 ? '↑' : delta.deltaPct < 0 ? '↓' : '→';
			change = `<span class="delta-change ${cls}">${arrow} ${Math.abs(delta.deltaPct).toFixed(0)}%</span>`;
		}
		return `
			<div class="delta-card">
				<h3>${escapeHtml(delta.label)}</h3>
				<div class="delta-values">
					<span class="delta-cur">${fmtValue(delta.cur, delta.unit)}</span>
					${change}
				</div>
				<div class="delta-prev">was ${fmtValue(delta.prev, delta.unit)} in ${escapeHtml(d.deltaWindows.prev)}</div>
				<p class="delta-desc">${escapeHtml(delta.description)}</p>
			</div>`;
	}).join('');
	return `
		<p class="eff-section-note">${escapeHtml(d.deltaWindows.cur)} compared with ${escapeHtml(d.deltaWindows.prev)}. All metrics are per-session ratios or shares, so a partial month compares fairly against a full one.</p>
		<div class="delta-grid">${cards}</div>`;
}

function attrBar(label: string, detail: string, value: number, maxAbs: number, explain: string): string {
	const widthPct = maxAbs > 0 ? Math.min(50, (Math.abs(value) / maxAbs) * 50) : 0;
	const side = value >= 0 ? `left: 50%; width: ${widthPct}%;` : `right: 50%; width: ${widthPct}%;`;
	const cls = value >= 0 ? 'pos' : 'neg';
	return `
		<div class="attr-bar-row" title="${escapeHtml(explain)}">
			<div class="attr-bar-label">${escapeHtml(label)}<div class="attr-bar-detail">${escapeHtml(detail)}</div></div>
			<div class="attr-bar-track"><div class="attr-bar-mid"></div><div class="attr-bar-fill ${cls}" style="${side}"></div></div>
			<div class="attr-bar-value">${fmtMoney(value)}<div class="attr-bar-effect">estimated cost effect</div></div>
		</div>`;
}

function renderAttributionTab(d: EfficiencyViewData): string {
	const a: CostAttribution | null = d.attribution;
	if (!a) {
		return `<p class="eff-section-note">Not enough data to decompose the cost change — both compared windows need at least one session with token data.</p>`;
	}
	const maxAbs = Math.max(Math.abs(a.volumeEffect), Math.abs(a.efficiencyEffect), Math.abs(a.mixEffect), 0.01);
	const afterVolume = a.prev.cost + a.volumeEffect;
	const afterEfficiency = afterVolume + a.efficiencyEffect;
	const shifts = a.modelShifts.length === 0 ? '' : `
		<h3>Model mix movement</h3>
		<table class="attr-shift-table">
			<thead><tr><th>Model</th><th class="num">${escapeHtml(d.attributionWindows.prevRange)}</th><th class="num">${escapeHtml(d.attributionWindows.curRange)}</th><th class="num">Shift</th></tr></thead>
			<tbody>
				${a.modelShifts.map(s => `
					<tr>
						<td>${escapeHtml(s.displayName)}</td>
						<td class="num">${(s.prevShare * 100).toFixed(1)}%</td>
						<td class="num">${(s.curShare * 100).toFixed(1)}%</td>
						<td class="num ${s.deltaShare > 0 ? 'share-up' : 'share-down'}">${s.deltaShare > 0 ? '+' : ''}${(s.deltaShare * 100).toFixed(1)} pt</td>
					</tr>`).join('')}
			</tbody>
		</table>`;
	return `
		<p class="eff-section-note">The periods are adjacent, not overlapping: ${escapeHtml(capitalizeFirst(d.attributionWindows.prev))} is <b>${escapeHtml(d.attributionWindows.prevRange)}</b>; ${escapeHtml(d.attributionWindows.cur)} is <b>${escapeHtml(d.attributionWindows.curRange)}</b>. Each bar is a <b>what-if dollar amount</b>, not a session count: starting from the earlier cost, the factors are applied in order. Green reduces estimated cost; red increases it.</p>
		<div class="attr-summary">
			<div class="attr-stat"><div class="stat-label">${escapeHtml(capitalizeFirst(d.attributionWindows.prev))}</div><div class="stat-value">$${a.prev.cost.toFixed(2)}</div><div class="stat-sub">${escapeHtml(d.attributionWindows.prevRange)} · ${a.prev.sessions} sessions · ${formatCompact(a.prev.tokens)} tokens</div></div>
			<div class="attr-stat"><div class="stat-label">${escapeHtml(capitalizeFirst(d.attributionWindows.cur))}</div><div class="stat-value">$${a.cur.cost.toFixed(2)}</div><div class="stat-sub">${escapeHtml(d.attributionWindows.curRange)} · ${a.cur.sessions} sessions · ${formatCompact(a.cur.tokens)} tokens</div></div>
			<div class="attr-stat"><div class="stat-label">Change</div><div class="stat-value">${fmtMoney(a.deltaCost)}</div><div class="stat-sub">blended rate ${a.prev.dollarsPerMTokens.toFixed(2)} → ${a.cur.dollarsPerMTokens.toFixed(2)} $/M tokens</div></div>
		</div>
		<div class="attr-waterfall"><span>Starting cost <b>$${a.prev.cost.toFixed(2)}</b></span><span>After session count <b>$${afterVolume.toFixed(2)}</b></span><span>After session size <b>$${afterEfficiency.toFixed(2)}</b></span><span>After model mix <b>$${a.cur.cost.toFixed(2)}</b></span></div>
		<div class="attr-bars">
			${attrBar('Volume (session count)', `${a.prev.sessions.toLocaleString()} → ${a.cur.sessions.toLocaleString()} sessions`, a.volumeEffect, maxAbs, `Session count went from ${a.prev.sessions} to ${a.cur.sessions}.`)}
			${attrBar('Session size (tokens/session)', `${formatCompact(a.prev.tokensPerSession)} → ${formatCompact(a.cur.tokensPerSession)} tokens/session`, a.efficiencyEffect, maxAbs, `Tokens per session went from ${Math.round(a.prev.tokensPerSession)} to ${Math.round(a.cur.tokensPerSession)}.`)}
			${attrBar('Model mix ($/token)', `$${a.prev.dollarsPerMTokens.toFixed(2)} → $${a.cur.dollarsPerMTokens.toFixed(2)} /M tokens`, a.mixEffect, maxAbs, `Blended price went from ${a.prev.dollarsPerMTokens.toFixed(2)} to ${a.cur.dollarsPerMTokens.toFixed(2)} $/M tokens.`)}
		</div>
		${shifts}`;
}

function skillImpactCard(impact: SkillImpact): string {
	const rows = impact.metrics.map(m => {
		const fmt = (v: number | null): string => {
			if (v === null) { return '—'; }
			if (m.id === 'retry-rate') { return `${(v * 100).toFixed(0)}%`; }
			if (m.id === 'tokens') { return formatCompact(Math.round(v)); }
			if (m.id === 'active-minutes') { return `${v.toFixed(0)} min`; }
			return v.toFixed(1);
		};
		let delta = '<span class="delta-na">—</span>';
		if (m.deltaPct !== null) {
			const cls = m.favorable === null ? 'flat' : m.favorable ? 'good' : 'bad';
			const arrow = m.deltaPct > 0 ? '↑' : m.deltaPct < 0 ? '↓' : '→';
			delta = `<span class="delta-change ${cls}">${arrow} ${Math.abs(m.deltaPct).toFixed(0)}%</span>`;
		}
		return `
			<tr>
				<td>${escapeHtml(m.label)}</td>
				<td class="num">${fmt(m.withSkill)}</td>
				<td class="num">${fmt(m.withoutSkill)}</td>
				<td class="num">${delta}</td>
			</tr>`;
	}).join('');
	return `
		<div class="skill-impact-card">
			<h3>🛠️ ${escapeHtml(impact.skill)}</h3>
			<div class="skill-impact-sub">${impact.withSkill.sessions} sessions with · ${impact.withoutSkill.sessions} without · ${impact.totalCalls} invocations</div>
			<table class="attr-shift-table">
				<thead><tr><th>Metric</th><th class="num">With</th><th class="num">Without</th><th class="num">Difference</th></tr></thead>
				<tbody>${rows}</tbody>
			</table>
		</div>`;
}

function renderSkillsTab(d: EfficiencyViewData): string {
	if (!d.hasSkills) {
		return `
			<p class="eff-section-note">No agent-skill invocations detected in the last ${d.skillTrends.weeks.length} weeks. Skills are custom slash-commands and packaged instructions (e.g. <code>/graphify</code>) detected in Claude Code, Claude Desktop, and Copilot CLI session logs. Once you use them, this tab shows usage over time and whether skill-assisted sessions run leaner than the rest.</p>`;
	}
	const impactSection = d.skillImpact.length > 0
		? `<h3 class="skill-section-heading">Do skill-assisted sessions run differently?</h3>
			<p class="eff-section-note">Sessions that invoked each skill compared with all sessions that did not, over the same window. Green means the skill cohort looks leaner. ⚠️ This is correlation, not causation — sessions where you reach for a skill may simply be different kinds of work.</p>
			<div class="skill-impact-grid">${d.skillImpact.map(skillImpactCard).join('')}</div>`
		: `<p class="eff-section-note">No skill has enough sessions yet for a with/without comparison (needs at least 5 sessions on each side).</p>`;
	return `
		<p class="eff-section-note">${d.skillTrends.totalCalls} skill invocations across ${d.skillTrends.topSkills.length} skill${d.skillTrends.topSkills.length === 1 ? '' : 's'} in the last ${d.skillTrends.weeks.length} weeks. Bars stack invocations per skill; the line is the share of sessions that used any skill.</p>
		<div class="combined-wrap"><canvas id="skills-chart"></canvas></div>
		${impactSection}`;
}

async function drawSkillsChart(d: EfficiencyViewData): Promise<void> {
	await loadChartModule();
	if (!Chart) { return; }
	const canvas = document.getElementById('skills-chart') as HTMLCanvasElement | null;
	if (!canvas) { return; }
	const weeks = d.skillTrends.weeks;
	const labels = weeks.map(w => w.label);
	const fg = cssVar('--vscode-descriptionForeground', '#999');
	const grid = cssVar('--vscode-widget-border', 'rgba(128,128,128,0.2)');
	const palette = [
		cssVar('--vscode-charts-blue', '#60a5fa'),
		cssVar('--vscode-charts-purple', '#c37bff'),
		cssVar('--vscode-charts-green', '#4ade80'),
		cssVar('--vscode-charts-yellow', '#fbbf24'),
		cssVar('--vscode-charts-orange', '#ff9f40'),
		cssVar('--vscode-charts-red', '#fb7185'),
	];
	const topSkills = d.skillTrends.topSkills.slice(0, 6);
	const otherSkills = d.skillTrends.topSkills.slice(6);
	const datasets: object[] = topSkills.map((skill, idx) => ({
		type: 'bar' as const,
		label: skill,
		data: weeks.map(w => w.byName[skill] ?? 0),
		backgroundColor: palette[idx % palette.length],
		stack: 'skills',
		yAxisID: 'y',
	}));
	if (otherSkills.length > 0) {
		datasets.push({
			type: 'bar' as const,
			label: 'Other skills',
			data: weeks.map(w => otherSkills.reduce((s, name) => s + (w.byName[name] ?? 0), 0)),
			backgroundColor: 'rgba(150,150,150,0.5)',
			stack: 'skills',
			yAxisID: 'y',
		});
	}
	datasets.push({
		type: 'line' as const,
		label: '% of sessions using a skill',
		data: weeks.map(w => w.skillShare === null ? null : w.skillShare * 100),
		borderColor: fg,
		backgroundColor: fg,
		spanGaps: true,
		tension: 0.25,
		pointRadius: 2,
		yAxisID: 'yShare',
	});
	liveCharts.push(new Chart(canvas, {
		data: { labels, datasets } as never,
		options: {
			responsive: true,
			maintainAspectRatio: false,
			plugins: { legend: { position: 'bottom', labels: { color: fg, boxWidth: 14 } } },
			scales: {
				x: { stacked: true, ticks: { color: fg, maxRotation: 45, autoSkip: true }, grid: { display: false } },
				y: { stacked: true, beginAtZero: true, title: { display: true, text: 'Skill invocations', color: fg }, ticks: { color: fg }, grid: { color: grid } },
				yShare: { position: 'right' as const, beginAtZero: true, max: 100, title: { display: true, text: '% of sessions', color: fg }, ticks: { color: fg }, grid: { display: false } },
			},
		},
	} as never));
}

function renderValueTab(d: EfficiencyViewData): string {
	const v = d.value;
	const cards: string[] = [];
	const since = v.prsSince ? escapeHtml(new Date(v.prsSince).toLocaleDateString()) : '—';
	if (v.userPrs !== null) {
		cards.push(`
			<div class="value-card"><h3>🚢 Merged PRs</h3>
				<div class="value-big">${v.mergedPrs ?? '—'}</div>
				<div class="value-sub">of ${v.userPrs} you opened since ${since}${v.prsPerWeek !== null ? ` · ${v.prsPerWeek.toFixed(1)}/week merged` : ''}</div>
			</div>`);
		cards.push(`
			<div class="value-card"><h3>💵 Cost per merged PR</h3>
				<div class="value-big">${v.costPerMergedPr !== null ? `$${v.costPerMergedPr.toFixed(2)}` : '—'}</div>
				<div class="value-sub">estimated 30-day AI cost divided by the PRs you actually shipped — the most outcome-shaped efficiency metric available</div>
			</div>`);
	}
	cards.push(`
		<div class="value-card"><h3>✅ Apply rate</h3>
			<div class="value-big">${v.applyRate !== null ? `${(v.applyRate * 100).toFixed(0)}%` : '—'}</div>
			<div class="value-sub">${v.applyRate !== null ? `${v.appliedBlocks} of ${v.totalBlocks} suggested code blocks applied in the last 30 days` : 'No apply-button data (agent and CLI sessions apply edits directly)'}</div>
		</div>`);
	cards.push(`
		<div class="value-card"><h3>📦 Lines changed per dollar</h3>
			<div class="value-big">${v.locPerDollar !== null ? v.locPerDollar.toFixed(0) : '—'}</div>
			<div class="value-sub">${v.locPerDollar !== null ? `${formatCompact(v.linesChanged)} lines over ~$${v.periodCost.toFixed(2)} in the last 30 days` : 'Needs lines-of-code data and non-zero estimated cost'}</div>
		</div>`);
	if (v.aiPrs !== null) {
		cards.push(`
			<div class="value-card"><h3>🤖 Delegated to AI agents</h3>
				<div class="value-big">${v.aiPrs}</div>
				<div class="value-sub">PRs opened by an AI bot account (Copilot coding agent, Claude, Codex). ${v.aiPrs === 0 ? 'Zero is expected when you drive AI locally and open PRs yourself — your work is counted under Merged PRs.' : 'These ran autonomously in the cloud rather than in your editor.'}</div>
			</div>`);
	}
	const hint = v.userPrs === null
		? `<div class="value-hint">💡 Connect GitHub and open <b>Usage Analysis → Repository PRs</b> once to add pull-request metrics here — merged PRs are a far better value signal than lines of code.</div>`
		: '';
	return `
		<p class="eff-section-note">Efficiency only counts when output holds up. These metrics measure what your AI usage produced, not what it consumed.</p>
		<div class="value-grid">${cards.join('')}</div>
		${hint}`;
}

function renderCombinedTab(d: EfficiencyViewData): string {
	return `
		<p class="eff-section-note">Everything on one chart. Ratio lines are <b>indexed to 100</b> at their first measured week so different units share one axis — a line falling below 100 means that ratio improved (except apply rate, where up is good). Bars show raw lines-of-code output per week: efficiency gains only count if the bars hold up.</p>
		<div class="combined-wrap"><canvas id="combined-chart"></canvas></div>`;
}

// ── Models tab ─────────────────────────────────────────────────────────

/** Metric accessors for the per-model weekly trend chart. */
const MODEL_TREND_METRICS: { id: ModelComparisonMetricId; label: string; unit: EfficiencyDelta['unit']; goodDirection: 'up' | 'down'; pick: (m: ModelPeriodMetrics) => number | null }[] = [
	{ id: 'cost-per-edit-turn', label: 'Cost per edit turn', unit: 'currency', goodDirection: 'down', pick: m => m.costPerEditTurn },
	{ id: 'cost-per-session', label: 'Cost per session', unit: 'currency', goodDirection: 'down', pick: m => m.costPerSession },
	{ id: 'cost-per-kloc', label: 'Cost per 1000 lines', unit: 'currency', goodDirection: 'down', pick: m => m.costPerKloc },
	{ id: 'one-shot-rate', label: 'One-shot edit rate', unit: 'percent', goodDirection: 'up', pick: m => m.oneShotRate },
	{ id: 'retry-rate', label: 'Edit retry rate', unit: 'ratio', goodDirection: 'down', pick: m => m.retryRate },
	{ id: 'tokens-per-edit-turn', label: 'Tokens per edit turn', unit: 'tokens', goodDirection: 'down', pick: m => m.tokensPerEditTurn },
	{ id: 'active-minutes-per-session', label: 'Active minutes per session', unit: 'minutes', goodDirection: 'down', pick: m => m.activeMinutesPerSession },
];

/** Metrics shown on the normalized radar — one axis per dimension of "efficient". */
const RADAR_METRICS: ModelComparisonMetricId[] = [
	'cost-per-edit-turn', 'one-shot-rate', 'retry-rate', 'tokens-per-edit-turn', 'active-minutes-per-session', 'apply-rate',
];

const WINDOW_OPTIONS: { id: ModelCompareWindowId; label: string }[] = [
	{ id: 'last30', label: 'Last 30 days' },
	{ id: 'prev30', label: 'Previous 30 days' },
	{ id: 'last90', label: 'Last 90 days' },
	{ id: 'thisMonth', label: 'This month' },
	{ id: 'lastMonth', label: 'Last month' },
];

type CompareMode = 'models' | 'periods';

const modelState: {
	mode: CompareMode;
	modelA: string;
	modelB: string;
	window: ModelCompareWindowId;
	windowA: ModelCompareWindowId;
	windowB: ModelCompareWindowId;
	trendMetric: ModelComparisonMetricId;
	initialized: boolean;
} = {
	mode: 'models', modelA: '', modelB: '',
	window: 'last30', windowA: 'lastMonth', windowB: 'thisMonth',
	trendMetric: 'cost-per-edit-turn', initialized: false,
};

/** The reference "now" for window maths — the moment the extension built this payload. */
function payloadNow(d: EfficiencyViewData): Date {
	const parsed = new Date(d.lastUpdated);
	return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

/** Picks sensible defaults on first render: the two most-used comparable models. */
function initModelState(d: EfficiencyViewData): void {
	if (modelState.initialized) { return; }
	modelState.initialized = true;
	const models = listComparableModels(d.modelDaily);
	const preferred = models.filter(m => m.sampleSufficient);
	const pool = preferred.length >= 2 ? preferred : models;
	modelState.modelA = pool[0]?.model ?? '';
	modelState.modelB = pool[1]?.model ?? pool[0]?.model ?? '';
}

/** Resolves the current selection into a comparison, or null when a side has no data. */
function buildModelComparison(d: EfficiencyViewData): ModelComparison | null {
	const now = payloadNow(d);
	if (modelState.mode === 'periods') {
		const wA = resolveModelCompareWindow(modelState.windowA, now);
		const wB = resolveModelCompareWindow(modelState.windowB, now);
		const a = computeModelPeriodMetrics(selectDaysInWindow(d.modelDaily, wA), modelState.modelA, wA.label);
		const b = computeModelPeriodMetrics(selectDaysInWindow(d.modelDaily, wB), modelState.modelA, wB.label);
		return a && b ? compareModels(a, b) : null;
	}
	const w = resolveModelCompareWindow(modelState.window, now);
	const days = selectDaysInWindow(d.modelDaily, w);
	const a = computeModelPeriodMetrics(days, modelState.modelA, w.label);
	const b = computeModelPeriodMetrics(days, modelState.modelB, w.label);
	return a && b ? compareModels(a, b) : null;
}

function selectHtml(id: string, options: { value: string; label: string; disabled?: boolean }[], selected: string): string {
	const opts = options.map(o =>
		`<option value="${escapeHtml(o.value)}"${o.value === selected ? ' selected' : ''}${o.disabled ? ' disabled' : ''}>${escapeHtml(o.label)}</option>`
	).join('');
	return `<select id="${id}" class="model-select">${opts}</select>`;
}

function modelOptions(d: EfficiencyViewData): { value: string; label: string }[] {
	return listComparableModels(d.modelDaily).map(m => ({
		value: m.model,
		label: `${m.displayName} (${m.sessions} sessions${m.sampleSufficient ? '' : ', low sample'})`,
	}));
}

function windowOptions(): { value: string; label: string }[] {
	return WINDOW_OPTIONS.map(w => ({ value: w.id, label: w.label }));
}

function renderModelControls(d: EfficiencyViewData): string {
	const models = modelOptions(d);
	const windows = windowOptions();
	const modeSelect = selectHtml('model-mode', [
		{ value: 'models', label: 'Compare two models' },
		{ value: 'periods', label: 'One model, two periods' },
	], modelState.mode);
	const body = modelState.mode === 'periods'
		? `
			<label>Model ${selectHtml('model-a', models, modelState.modelA)}</label>
			<label>Baseline ${selectHtml('window-a', windows, modelState.windowA)}</label>
			<label>Compared with ${selectHtml('window-b', windows, modelState.windowB)}</label>`
		: `
			<label>Model A ${selectHtml('model-a', models, modelState.modelA)}</label>
			<label>Model B ${selectHtml('model-b', models, modelState.modelB)}</label>
			<label>Window ${selectHtml('window', windows, modelState.window)}</label>`;
	return `<div class="model-controls"><label>Mode ${modeSelect}</label>${body}</div>`;
}

/** Renders a side's headline volume so the reader can judge the sample for themselves. */
function sideSummary(m: ModelPeriodMetrics, side: 'A' | 'B'): string {
	return `
		<div class="model-side model-side-${side.toLowerCase()}">
			<div class="model-side-tag">${side}</div>
			<div class="model-side-name">${escapeHtml(m.displayName)}</div>
			<div class="model-side-period">${escapeHtml(m.periodLabel)}</div>
			<div class="model-side-stats">${m.sessions} sessions · ${m.editTurns} edit turns · ${formatCompact(m.tokens)} tokens · $${m.cost.toFixed(2)}</div>
		</div>`;
}

/** The "B vs A" cell: percentage change coloured by which side it favours. */
function comparisonDeltaCell(r: ModelComparisonRow): string {
	if (r.deltaPct === null) { return '<span class="delta-na">—</span>'; }
	const cls = r.winner === 'b' ? 'good' : r.winner === 'a' ? 'bad' : 'flat';
	const arrow = r.deltaPct > 0 ? '↑' : r.deltaPct < 0 ? '↓' : '→';
	return `<span class="delta-change ${cls}">${arrow} ${Math.abs(r.deltaPct).toFixed(0)}%</span>`;
}

/** The "Better" cell — only decisive wins get a chip, so ties read as ties. */
function comparisonWinnerCell(r: ModelComparisonRow): string {
	if (r.significant && (r.winner === 'a' || r.winner === 'b')) {
		return `<span class="model-win-chip">${r.winner.toUpperCase()}</span>`;
	}
	return r.winner === 'tie' ? '<span class="model-win-chip tie">tie</span>' : '';
}

function comparisonRowHtml(r: ModelComparisonRow): string {
	const unavailable = r.a === null || r.b === null ? ' class="model-row-muted"' : '';
	return `
			<tr${unavailable}>
				<td title="${escapeHtml(r.description)}">${escapeHtml(r.label)}</td>
				<td class="num">${fmtValue(r.a, r.unit)}</td>
				<td class="num">${fmtValue(r.b, r.unit)}</td>
				<td class="num">${comparisonDeltaCell(r)}</td>
				<td class="num">${comparisonWinnerCell(r)}</td>
			</tr>`;
}

function comparisonTableHtml(cmp: ModelComparison): string {
	const rows = cmp.rows.map(comparisonRowHtml).join('');
	return `
		<table class="attr-shift-table model-compare-table">
			<thead><tr>
				<th>Metric</th>
				<th class="num">A · ${escapeHtml(cmp.a.displayName)}<br><span class="th-sub">${escapeHtml(cmp.a.periodLabel)}</span></th>
				<th class="num">B · ${escapeHtml(cmp.b.displayName)}<br><span class="th-sub">${escapeHtml(cmp.b.periodLabel)}</span></th>
				<th class="num">B vs A</th>
				<th class="num">Better</th>
			</tr></thead>
			<tbody>${rows}</tbody>
		</table>`;
}

function verdictHtml(cmp: ModelComparison): string {
	if (!cmp.verdict) {
		return `<div class="model-verdict tie">⚖️ No metric differs by more than 10% — on this evidence the two sides perform the same.</div>`;
	}
	const { winner, wins } = cmp.verdict;
	if (winner === 'tie') {
		return `<div class="model-verdict tie">⚖️ Honours even: ${wins.a} metrics favour ${escapeHtml(cmp.a.displayName)} (${escapeHtml(cmp.a.periodLabel)}) and ${wins.b} favour ${escapeHtml(cmp.b.displayName)} (${escapeHtml(cmp.b.periodLabel)}).</div>`;
	}
	const side = winner === 'a' ? cmp.a : cmp.b;
	const count = winner === 'a' ? wins.a : wins.b;
	const other = winner === 'a' ? wins.b : wins.a;
	return `<div class="model-verdict ${winner === 'b' ? 'improving' : 'declining'}">🏆 ${escapeHtml(side.displayName)} (${escapeHtml(side.periodLabel)}) wins ${count} of ${count + other} decisive metrics.</div>`;
}

function caveatsHtml(cmp: ModelComparison): string {
	if (cmp.caveats.length === 0) { return ''; }
	return `
		<div class="model-caveats">
			<h3>⚠️ Read with care</h3>
			<ul>${cmp.caveats.map(c => `<li>${escapeHtml(c)}</li>`).join('')}</ul>
		</div>`;
}

/** Stacked task-mix bar, so a reader can see whether the two sides did comparable work. */
function taskMixHtml(cmp: ModelComparison): string {
	const categories = [...new Set([...Object.keys(cmp.a.taskMix), ...Object.keys(cmp.b.taskMix)])].sort();
	if (categories.length === 0) { return ''; }
	const palette = ['--vscode-charts-blue', '--vscode-charts-green', '--vscode-charts-orange', '--vscode-charts-purple', '--vscode-charts-red', '--vscode-charts-yellow'];
	const bar = (m: ModelPeriodMetrics): string => {
		const segments = categories.map((c, i) => {
			const share = m.taskMix[c] ?? 0;
			if (share <= 0) { return ''; }
			return `<div class="task-seg" style="width:${(share * 100).toFixed(1)}%; background:${cssVar(palette[i % palette.length], '#60a5fa')}" title="${escapeHtml(c)}: ${(share * 100).toFixed(0)}%"></div>`;
		}).join('');
		return `<div class="task-mix-row"><div class="task-mix-label">${escapeHtml(m.displayName)} · ${escapeHtml(m.periodLabel)}</div><div class="task-mix-bar">${segments}</div></div>`;
	};
	const legend = categories.map((c, i) =>
		`<span class="task-legend-item"><span class="task-legend-dot" style="background:${cssVar(palette[i % palette.length], '#60a5fa')}"></span>${escapeHtml(c)}</span>`
	).join('');
	return `
		<h3>What kind of work each side did</h3>
		<p class="eff-section-note">Task categories are classified per session and split across that session's models by token share, so this is context, not a score. Very different mixes mean part of any gap belongs to the work, not the model.</p>
		<div class="task-mix">${bar(cmp.a)}${bar(cmp.b)}</div>
		<div class="task-legend">${legend}</div>`;
}

function renderModelsTab(d: EfficiencyViewData): string {
	initModelState(d);
	if (d.modelDaily.length === 0) {
		return `<p class="eff-section-note">No per-model efficiency data yet. This tab needs sessions whose logs carry per-turn tool-call detail (Copilot CLI, Claude Code, Copilot Chat and similar). Keep working and check back in a few days.</p>`;
	}
	const controls = renderModelControls(d);
	const cmp = buildModelComparison(d);
	if (!cmp) {
		return `
			${controls}
			<p class="eff-section-note">No data for one of the two sides in the selected window. Pick a different model or a wider window.</p>`;
	}
	const metricOptions = MODEL_TREND_METRICS.map(m => ({ value: m.id, label: m.label }));
	return `
		<p class="eff-section-note">Head-to-head efficiency. Costs use <b>provider/API rates</b>, so this measures the models themselves rather than a billing plan. Metrics whose sample was too small show as “—”. Session-level signals (duration, lines changed) are split across a session's models by token share.</p>
		${controls}
		<div class="model-sides">${sideSummary(cmp.a, 'A')}${sideSummary(cmp.b, 'B')}</div>
		${verdictHtml(cmp)}
		${comparisonTableHtml(cmp)}
		${caveatsHtml(cmp)}
		${taskMixHtml(cmp)}
		<h3>Shape of each side</h3>
		<p class="eff-section-note">Each axis is indexed so the better side scores 100. A larger shape is a better all-round profile; a spiky shape means the side wins on some dimensions and loses on others.</p>
		<div class="model-radar-wrap"><canvas id="model-radar"></canvas></div>
		<h3>Drift over time</h3>
		<p class="eff-section-note">Weekly values for each side's model, so a model getting better — or quietly getting worse — is visible. Gaps are weeks where the model was not used.</p>
		<div class="model-trend-controls"><label>Metric ${selectHtml('model-trend-metric', metricOptions, modelState.trendMetric)}</label></div>
		<div class="model-trend-wrap"><canvas id="model-trend"></canvas></div>`;
}



// ── Chart drawing ──────────────────────────────────────────────────────

/**
 * Normalizes one metric onto a 0–100 radar axis where the better side scores
 * 100. Returns null when either side lacks the metric, so the axis is dropped.
 */
function radarScores(row: ModelComparisonRow): { a: number; b: number } | null {
	if (row.a === null || row.b === null) { return null; }
	const max = Math.max(row.a, row.b);
	const min = Math.min(row.a, row.b);
	if (max === 0) { return { a: 100, b: 100 }; }
	if (row.goodDirection === 'up') {
		return { a: (row.a / max) * 100, b: (row.b / max) * 100 };
	}
	if (row.a === 0 || row.b === 0) { return { a: row.a === min ? 100 : 0, b: row.b === min ? 100 : 0 }; }
	return { a: (min / row.a) * 100, b: (min / row.b) * 100 };
}

function radarAxes(cmp: ModelComparison): { row: ModelComparisonRow; scores: { a: number; b: number } }[] {
	const axes: { row: ModelComparisonRow; scores: { a: number; b: number } }[] = [];
	for (const id of RADAR_METRICS) {
		const row = cmp.rows.find(r => r.id === id);
		if (!row) { continue; }
		const scores = radarScores(row);
		if (scores) { axes.push({ row, scores }); }
	}
	return axes;
}

async function drawModelRadar(cmp: ModelComparison): Promise<void> {
	await loadChartModule();
	const canvas = document.getElementById('model-radar') as HTMLCanvasElement | null;
	if (!Chart || !canvas) { return; }
	const axes = radarAxes(cmp);
	if (axes.length < 3) {
		setHtml(canvas.parentElement as HTMLElement, `<p class="eff-section-note">Not enough shared metrics between the two sides to draw a shape.</p>`);
		return;
	}
	const fg = cssVar('--vscode-descriptionForeground', '#999');
	const grid = cssVar('--vscode-widget-border', 'rgba(128,128,128,0.2)');
	const colorA = cssVar('--vscode-charts-blue', '#60a5fa');
	const colorB = cssVar('--vscode-charts-orange', '#ff9f40');
	liveCharts.push(new Chart(canvas, {
		type: 'radar',
		data: {
			labels: axes.map(x => x.row.label),
			datasets: [
				{ label: `${cmp.a.displayName} · ${cmp.a.periodLabel}`, data: axes.map(x => x.scores.a), borderColor: colorA, backgroundColor: 'rgba(96,165,250,0.20)', pointBackgroundColor: colorA },
				{ label: `${cmp.b.displayName} · ${cmp.b.periodLabel}`, data: axes.map(x => x.scores.b), borderColor: colorB, backgroundColor: 'rgba(255,159,64,0.20)', pointBackgroundColor: colorB },
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: { position: 'bottom', labels: { color: fg, boxWidth: 14 } },
				tooltip: {
					callbacks: {
						label: (ctx: { datasetIndex: number; dataIndex: number; parsed: { r: number } }) => {
							const axis = axes[ctx.dataIndex];
							const raw = ctx.datasetIndex === 0 ? axis.row.a : axis.row.b;
							return `${fmtValue(raw, axis.row.unit)} (score ${Math.round(ctx.parsed.r)})`;
						},
					},
				},
			},
			scales: {
				r: {
					suggestedMin: 0, suggestedMax: 100,
					angleLines: { color: grid }, grid: { color: grid },
					pointLabels: { color: fg }, ticks: { display: false },
				},
			},
		},
	} as never));
}

/** The models whose weekly series belong on the trend chart for the current mode. */
function trendModels(): string[] {
	const wanted = modelState.mode === 'periods'
		? [modelState.modelA]
		: [modelState.modelA, modelState.modelB];
	return wanted.filter((m, i, arr) => m !== '' && arr.indexOf(m) === i);
}

async function drawModelTrend(d: EfficiencyViewData): Promise<void> {
	await loadChartModule();
	const canvas = document.getElementById('model-trend') as HTMLCanvasElement | null;
	if (!Chart || !canvas) { return; }
	const spec = MODEL_TREND_METRICS.find(m => m.id === modelState.trendMetric) ?? MODEL_TREND_METRICS[0];
	const now = payloadNow(d);
	const models = trendModels();
	const colors = [cssVar('--vscode-charts-blue', '#60a5fa'), cssVar('--vscode-charts-orange', '#ff9f40')];
	const seriesList = models.map(m => buildModelWeeklySeries(d.modelDaily, m, now));
	const labels = seriesList[0]?.map(p => p.label) ?? [];
	const fg = cssVar('--vscode-descriptionForeground', '#999');
	const grid = cssVar('--vscode-widget-border', 'rgba(128,128,128,0.2)');
	liveCharts.push(new Chart(canvas, {
		type: 'line',
		data: {
			labels,
			datasets: seriesList.map((series, i) => ({
				label: series.find(p => p.metrics)?.metrics?.displayName ?? models[i],
				data: series.map(p => (p.metrics ? spec.pick(p.metrics) : null)),
				borderColor: colors[i % colors.length],
				backgroundColor: colors[i % colors.length],
				spanGaps: true,
				tension: 0.25,
				pointRadius: 2.5,
			})),
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: { position: 'bottom', labels: { color: fg, boxWidth: 14 } },
				tooltip: { callbacks: { label: (ctx: { parsed: { y: number | null } }) => ctx.parsed.y === null ? 'no data' : fmtValue(ctx.parsed.y, spec.unit) } },
			},
			scales: {
				x: { ticks: { color: fg, maxRotation: 45, autoSkip: true, maxTicksLimit: 8 }, grid: { display: false } },
				y: { beginAtZero: true, ticks: { color: fg, maxTicksLimit: 5 }, grid: { color: grid } },
			},
		},
	} as never));
}

async function drawModelCharts(d: EfficiencyViewData): Promise<void> {
	const cmp = buildModelComparison(d);
	if (!cmp) { return; }
	await drawModelRadar(cmp);
	await drawModelTrend(d);
}

function destroyCharts(): void {
	for (const c of liveCharts.splice(0)) { c.destroy(); }
}

async function drawTrendCharts(d: EfficiencyViewData): Promise<void> {
	await loadChartModule();
	if (!Chart) { return; }
	const labels = d.weekly.map(w => w.label);
	const fg = cssVar('--vscode-descriptionForeground', '#999');
	const grid = cssVar('--vscode-widget-border', 'rgba(128,128,128,0.2)');
	for (const spec of buildTrendSpecs(d)) {
		const canvas = document.getElementById(`trend-${spec.id}`) as HTMLCanvasElement | null;
		if (!canvas) { continue; }
		const good = cssVar('--vscode-charts-blue', '#60a5fa');
		liveCharts.push(new Chart(canvas, {
			type: 'line',
			data: {
				labels,
				datasets: [{
					label: spec.title.replace(/^\S+\s/, ''),
					data: spec.values as number[],
					borderColor: good,
					backgroundColor: good,
					spanGaps: true,
					tension: 0.25,
					pointRadius: 2.5,
				}],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { display: false },
					tooltip: { callbacks: { label: (ctx: { parsed: { y: number | null } }) => ctx.parsed.y === null ? 'no data' : spec.format(ctx.parsed.y) } },
				},
				scales: {
					x: { ticks: { color: fg, maxRotation: 45, autoSkip: true, maxTicksLimit: 8 }, grid: { display: false } },
					y: { beginAtZero: true, ticks: { color: fg, maxTicksLimit: 5 }, grid: { color: grid } },
				},
			},
		}));
	}
}

/** Indexes a series to 100 at its first non-null value. */
function indexTo100(values: (number | null)[]): (number | null)[] {
	const base = values.find(v => v !== null && v !== 0);
	if (base === undefined || base === null) { return values.map(() => null); }
	return values.map(v => (v === null ? null : (v / base) * 100));
}

async function drawCombinedChart(d: EfficiencyViewData): Promise<void> {
	await loadChartModule();
	if (!Chart) { return; }
	const canvas = document.getElementById('combined-chart') as HTMLCanvasElement | null;
	if (!canvas) { return; }
	const labels = d.weekly.map(w => w.label);
	const fg = cssVar('--vscode-descriptionForeground', '#999');
	const grid = cssVar('--vscode-widget-border', 'rgba(128,128,128,0.2)');
	const lineDefs: { label: string; values: (number | null)[]; color: string; show: boolean }[] = [
		{ label: 'Cost per 1K lines (index)', values: indexTo100(d.weekly.map(w => w.costPerKloc)), color: cssVar('--vscode-charts-red', '#fb7185'), show: d.hasLoc },
		{ label: 'Tokens per session (index)', values: indexTo100(d.weekly.map(w => w.tokensPerSession)), color: cssVar('--vscode-charts-blue', '#60a5fa'), show: true },
		{ label: 'Turns per session (index)', values: indexTo100(d.weekly.map(w => w.turnsPerSession)), color: cssVar('--vscode-charts-purple', '#c37bff'), show: true },
		{ label: 'Active min per session (index)', values: indexTo100(d.weekly.map(w => w.activeMinutesPerSession)), color: cssVar('--vscode-charts-yellow', '#fbbf24'), show: d.hasDuration },
		{ label: 'Retry rate (index)', values: indexTo100(d.weekly.map(w => w.retryRate)), color: cssVar('--vscode-charts-orange', '#ff9f40'), show: d.hasRetry },
	];
	const datasets: object[] = lineDefs.filter(l => l.show).map(l => ({
		type: 'line' as const,
		label: l.label,
		data: l.values,
		borderColor: l.color,
		backgroundColor: l.color,
		spanGaps: true,
		tension: 0.25,
		pointRadius: 2,
		yAxisID: 'y',
	}));
	if (d.hasLoc) {
		datasets.push({
			type: 'bar' as const,
			label: 'Lines changed (output)',
			data: d.weekly.map(w => w.loc),
			backgroundColor: 'rgba(74, 222, 128, 0.35)',
			borderColor: cssVar('--vscode-charts-green', '#4ade80'),
			borderWidth: 1,
			yAxisID: 'yLoc',
		});
	}
	liveCharts.push(new Chart(canvas, {
		data: { labels, datasets } as never,
		options: {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: { position: 'bottom', labels: { color: fg, boxWidth: 14 } },
			},
			scales: {
				x: { ticks: { color: fg, maxRotation: 45, autoSkip: true }, grid: { display: false } },
				y: {
					position: 'left',
					title: { display: true, text: 'Index (first week = 100)', color: fg },
					ticks: { color: fg },
					grid: { color: grid },
				},
				...(d.hasLoc ? {
					yLoc: {
						position: 'right' as const,
						beginAtZero: true,
						title: { display: true, text: 'Lines changed', color: fg },
						ticks: { color: fg },
						grid: { display: false },
					},
				} : {}),
			},
		},
	} as never));
}

// ── Main render ────────────────────────────────────────────────────────

function renderActiveTab(d: EfficiencyViewData): string {
	switch (activeTab) {
		case 'trends': return renderTrendsTab(d);
		case 'skills': return renderSkillsTab(d);
		case 'deltas': return renderDeltasTab(d);
		case 'attribution': return renderAttributionTab(d);
		case 'models': return renderModelsTab(d);
		case 'value': return renderValueTab(d);
		case 'combined': return renderCombinedTab(d);
	}
}

function render(): void {
	const root = document.getElementById('root');
	if (!root || !data) { return; }
	setCompactNumbers(data.compactNumbers !== false);
	destroyCharts();
	const verdict = computeVerdict(data);
	setHtml(root, `
		<style>${themeStyles}</style>
		<style>${styles}</style>
		<div class="efficiency-root">
			<div class="button-row">${navButtonsHtml('btn-efficiency', !!data.backendConfigured)}</div>
			<div class="eff-header"><h1>⚡ Efficiency</h1></div>
			<p class="eff-subtitle">Are you working more efficiently with AI over time — and is it coming from using AI differently, cheaper models, or leaner sessions? Last updated ${escapeHtml(new Date(data.lastUpdated).toLocaleString())}.</p>
			<div class="eff-verdict ${verdict.cls}"><span class="verdict-icon">${verdict.icon}</span><span class="verdict-text">${verdict.text}</span></div>
			<div class="eff-tabs">
				${TABS.map(t => `<button class="eff-tab ${t.id === activeTab ? 'active' : ''}" data-tab="${t.id}">${t.label}</button>`).join('')}
			</div>
			<div id="eff-tab-content">${renderActiveTab(data)}</div>
			<p class="caveat">⚠️ Honest caveats: costs are estimates from token counts and public rates; lines of code is a weak value proxy (refactors and generated boilerplate distort it); shorter sessions only count as efficiency when output (lines, applied blocks, PRs) holds or rises. Every trend here should be read alongside its value counterpart.</p>
		</div>
	`);
	wireEvents();
	if (activeTab === 'trends') { void drawTrendCharts(data); }
	if (activeTab === 'skills' && data.hasSkills) { void drawSkillsChart(data); }
	if (activeTab === 'combined') { void drawCombinedChart(data); }
	if (activeTab === 'models') { void drawModelCharts(data); }
}

/** Wires the Models tab selects; each change updates state and re-renders. */
function wireModelControls(): void {
	const bind = (id: string, apply: (value: string) => void): void => {
		document.getElementById(id)?.addEventListener('change', ev => {
			apply((ev.target as HTMLSelectElement).value);
			render();
		});
	};
	bind('model-mode', v => { modelState.mode = v as CompareMode; });
	bind('model-a', v => { modelState.modelA = v; });
	bind('model-b', v => { modelState.modelB = v; });
	bind('window', v => { modelState.window = v as ModelCompareWindowId; });
	bind('window-a', v => { modelState.windowA = v as ModelCompareWindowId; });
	bind('window-b', v => { modelState.windowB = v as ModelCompareWindowId; });
	bind('model-trend-metric', v => { modelState.trendMetric = v as ModelComparisonMetricId; });
}

function wireEvents(): void {
	document.querySelectorAll<HTMLButtonElement>('.eff-tab').forEach(btn => {
		btn.addEventListener('click', () => {
			activeTab = btn.dataset.tab as TabId;
			render();
		});
	});
	wireModelControls();
	document.getElementById('btn-refresh')?.addEventListener('click', () => { vscode.postMessage({ command: 'refresh' }); });
	document.getElementById('btn-details')?.addEventListener('click', () => { vscode.postMessage({ command: 'showDetails' }); });
	document.getElementById('btn-chart')?.addEventListener('click', () => { vscode.postMessage({ command: 'showChart' }); });
	document.getElementById('btn-usage')?.addEventListener('click', () => { vscode.postMessage({ command: 'showUsageAnalysis' }); });
	document.getElementById('btn-maturity')?.addEventListener('click', () => { vscode.postMessage({ command: 'showMaturity' }); });
	document.getElementById('btn-environmental')?.addEventListener('click', () => { vscode.postMessage({ command: 'showEnvironmental' }); });
	document.getElementById('btn-diagnostics')?.addEventListener('click', () => { vscode.postMessage({ command: 'showDiagnostics' }); });
	document.getElementById('btn-dashboard')?.addEventListener('click', () => { vscode.postMessage({ command: 'showDashboard' }); });
	wireExtensionPointButtons(vscode);
}

async function bootstrap(): Promise<void> {
	await import('@vscode-elements/elements/dist/vscode-button/index.js');
	if (!data) {
		const root = document.getElementById('root');
		if (root) { root.textContent = 'No data available.'; }
		return;
	}
	render();
}

void bootstrap();
