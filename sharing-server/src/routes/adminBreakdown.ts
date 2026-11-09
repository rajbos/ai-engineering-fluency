import type { AdminBreakdownRow } from '../db.js';
import { computeTeamBreakdownsFromRows, MODE_KEYS, type ActivityTotals, type DimensionSlice } from '../teamBreakdowns.js';
import { agentSharePercent, escapeHtml as h } from './teamBreakdownPage.js';

/**
 * Admin-only, named breakdowns: the same model / editor / repository / activity data the
 * member page shows as team aggregates, here per GitHub login. Rendered only on `/admin`
 * behind the server-side admin check; nothing in this module is reachable by members.
 */

const exact = (n: number): string => n.toLocaleString('en-US', { maximumFractionDigits: 2 });
const percent = (n: number): string => `${n.toFixed(1)}%`;
const usd = (n: number): string => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

interface UserBreakdown {
	login: string;
	totalTokens: number;
	interactions: number;
	estimatedCostUsd: number;
	models: Map<string, number>;
	editors: Map<string, number>;
	repositories: Map<string, number>;
	activity: ActivityTotals;
	hasActivity: boolean;
	mcpServers: Set<string>;
	clientVersions: Set<string>;
}

function emptyUser(login: string): UserBreakdown {
	return {
		login, totalTokens: 0, interactions: 0, estimatedCostUsd: 0,
		models: new Map(), editors: new Map(), repositories: new Map(),
		activity: { sessions: 0, toolCalls: 0, mcpCalls: 0, uploadersWithActivity: 0, modes: { ask: 0, edit: 0, agent: 0, plan: 0, customAgent: 0, cli: 0 } },
		hasActivity: false, mcpServers: new Set(), clientVersions: new Set(),
	};
}

function bump(map: Map<string, number>, key: string, delta: number): void {
	map.set(key, (map.get(key) ?? 0) + delta);
}

/** Per-login rollup of the admin breakdown rows, sorted by tokens. Pure; exported for tests. */
export function computeUserBreakdowns(rows: AdminBreakdownRow[]): UserBreakdown[] {
	const users = new Map<string, UserBreakdown>();
	for (const row of rows) {
		let user = users.get(row.github_login);
		if (!user) {
			user = emptyUser(row.github_login);
			users.set(row.github_login, user);
		}
		const total = row.input_tokens + row.output_tokens;
		user.totalTokens += total;
		user.interactions += row.interactions;
		user.estimatedCostUsd += row.estimated_cost_usd ?? 0;
		bump(user.models, row.model, total);
		bump(user.editors, (row.editor ?? '').trim() || 'VS Code', total);
		const repository = (row.workspace_name ?? '').trim();
		if (repository) bump(user.repositories, repository, total);
		if (row.client_version) user.clientVersions.add(row.client_version);
		if (row.activity_json) {
			try {
				const activity = JSON.parse(row.activity_json) as { sessions?: number; toolCalls?: number; mcpCalls?: number; modes?: Record<string, number>; mcpByServer?: Record<string, number> };
				user.hasActivity = true;
				user.activity.sessions += activity.sessions ?? 0;
				user.activity.toolCalls += activity.toolCalls ?? 0;
				user.activity.mcpCalls += activity.mcpCalls ?? 0;
				for (const key of MODE_KEYS) user.activity.modes[key] += activity.modes?.[key] ?? 0;
				for (const server of Object.keys(activity.mcpByServer ?? {})) user.mcpServers.add(server);
			} catch { /* malformed stored activity: skip */ }
		}
	}
	return [...users.values()].sort((a, b) => b.totalTokens - a.totalTokens || a.login.localeCompare(b.login));
}

function topShares(map: Map<string, number>, total: number, limit: number): string {
	const entries = [...map.entries()].sort((a, b) => b[1] - a[1]);
	if (!entries.length) return '—';
	const shown = entries.slice(0, limit).map(([label, tokens]) =>
		`<span class="pill" title="${h(label)}: ${exact(tokens)} tokens">${h(label)} ${total ? percent(tokens / total * 100) : ''}</span>`);
	const rest = entries.length - limit;
	return `<div class="admin-pills">${shown.join(' ')}${rest > 0 ? ` <span class="team-muted">+${rest} more</span>` : ''}</div>`;
}

function names(set: Set<string>, limit: number): string {
	const list = [...set].sort();
	if (!list.length) return '—';
	const shown = list.slice(0, limit).map(name => h(name)).join(', ');
	return list.length > limit ? `${shown} <span class="team-muted">+${list.length - limit} more</span>` : shown;
}

function dimensionTable(title: string, slices: DimensionSlice[], showCost: boolean): string {
	if (!slices.length) return `<p class="team-muted">No ${title.toLowerCase()} data.</p>`;
	return `<div class="table-scroll"><table class="sticky-first">
  <thead><tr><th scope="col">${title}</th><th scope="col">Tokens</th><th scope="col">Share</th><th scope="col">Users</th><th scope="col">Interactions</th>${showCost ? '<th scope="col">Est. cost</th>' : ''}</tr></thead>
  <tbody>${slices.map(slice => `<tr><th scope="row">${h(slice.label)}</th><td>${exact(slice.totalTokens)}</td><td>${percent(slice.sharePercent)}</td><td>${slice.activeUsers}</td><td>${exact(slice.interactions)}</td>${showCost ? `<td>${usd(slice.estimatedCostUsd)}</td>` : ''}</tr>`).join('')}</tbody>
</table></div>`;
}

export interface AdminBreakdownHtml {
	html: string;
	script: string;
}

/**
 * Render the admin breakdown cards for the last `days` days. `dayLabels` is the ordered
 * list of UTC dates the trend chart should cover. `nonce` is the request's CSP nonce for the
 * inline `<style>`; the caller tags the returned `script` with it.
 */
export function renderAdminBreakdown(rows: AdminBreakdownRow[], days: number, dayLabels: string[], nonce: string): AdminBreakdownHtml {
	// A viewer id no user can have: the admin page wants team totals only, no "own" overlay.
	const team = computeTeamBreakdownsFromRows(rows, -1, dayLabels);
	const users = computeUserBreakdowns(rows);
	const showCost = team.cost.totalCostUsd > 0;
	const teamAgent = agentSharePercent(team.activity.team);

	const dimensionsHtml = `
<style nonce="${h(nonce)}">
  .admin-two-col { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr)); gap: 16px; margin-top: 12px; }
  .admin-two-col > div { min-width: 0; }
  .admin-pills { display: flex; flex-wrap: wrap; gap: 4px; }
  .admin-activity-grid { margin-bottom: 16px; }
  .team-muted { color: #8b949e; font-size: 0.85rem; line-height: 1.5; }
  #admin-user-breakdown td, #admin-user-breakdown th { font-variant-numeric: tabular-nums; vertical-align: top; }
  #admin-user-breakdown a { color: #58a6ff; text-decoration: none; }
</style>
<div class="card">
  <div class="card-header">
    <h3>Models &amp; editors — team, last ${days} days</h3>
    <div class="tabs" id="admin-dimension-tabs">
      <button class="tab active" data-admin-dimension="models">By model</button>
      <button class="tab" data-admin-dimension="editors">By editor</button>
    </div>
  </div>
  <p class="team-muted">Team-wide token mix per model and editor over time${showCost ? `, with the uploaders\u2019 own cost estimates (team total ${usd(team.cost.totalCostUsd)})` : ''}. Per-user detail is in the table below.</p>
  ${team.trends.models.labels.length ? '<div class="chart-wrap"><canvas id="admin-dimension-chart"></canvas></div>' : '<p class="team-muted">No uploads in this period.</p>'}
  <div class="admin-two-col">
    <div>${dimensionTable('Model', team.dimensions.models, showCost)}</div>
    <div>${dimensionTable('Editor', team.dimensions.editors, showCost)}</div>
  </div>
</div>`;

	const activitySummary = team.activity.team.uploadersWithActivity
		? `<div class="stat-grid admin-activity-grid">
    <div class="stat-card"><div class="label">Sessions</div><div class="value">${exact(team.activity.team.sessions)}</div></div>
    <div class="stat-card"><div class="label">Agent-mode share</div><div class="value">${teamAgent === null ? '—' : percent(teamAgent)}</div></div>
    <div class="stat-card"><div class="label">Tool calls</div><div class="value">${exact(team.activity.team.toolCalls)}</div></div>
    <div class="stat-card"><div class="label">MCP calls</div><div class="value">${exact(team.activity.team.mcpCalls)}</div></div>
    <div class="stat-card"><div class="label">Users reporting activity</div><div class="value">${team.activity.team.uploadersWithActivity}</div></div>
  </div>`
		: '<p class="team-muted">No activity counters uploaded yet (needs an extension version that sends <code>activity</code>).</p>';

	const usersHtml = `
<div class="card">
  <div class="card-header"><h3>Per-user breakdown — last ${days} days</h3></div>
  <p class="team-muted">Named detail for administrators only. Shares are of that user\u2019s own tokens. Repositories are workspace folder names and appear only when the user shares readable names.</p>
  ${activitySummary}
  <div class="table-scroll">
  <table id="admin-user-breakdown" class="sticky-first">
    <thead>
      <tr>
        <th scope="col">Login</th><th scope="col">Tokens</th>${showCost ? '<th scope="col">Est. cost</th>' : ''}
        <th scope="col">Models</th><th scope="col">Editors</th><th scope="col">Repositories</th>
        <th scope="col">Sessions</th><th scope="col">Agent share</th><th scope="col">Tool calls</th><th scope="col">MCP servers</th><th scope="col">Client</th>
      </tr>
    </thead>
    <tbody>
      ${users.map(user => {
		const agent = user.hasActivity ? agentSharePercent(user.activity) : null;
		return `<tr>
        <th scope="row"><a href="https://github.com/${h(user.login)}" target="_blank" rel="noopener">${h(user.login)}</a></th>
        <td>${exact(user.totalTokens)}</td>${showCost ? `<td>${usd(user.estimatedCostUsd)}</td>` : ''}
        <td>${topShares(user.models, user.totalTokens, 3)}</td>
        <td>${topShares(user.editors, user.totalTokens, 3)}</td>
        <td>${topShares(user.repositories, user.totalTokens, 3)}</td>
        <td>${user.hasActivity ? exact(user.activity.sessions) : '—'}</td>
        <td>${agent === null ? '—' : percent(agent)}</td>
        <td>${user.hasActivity ? exact(user.activity.toolCalls) : '—'}</td>
        <td>${names(user.mcpServers, 4)}</td>
        <td>${names(user.clientVersions, 2)}</td>
      </tr>`;
	}).join('')}
    </tbody>
  </table>
  </div>
</div>`;

	const trendData = JSON.stringify({ models: team.trends.models, editors: team.trends.editors })
		.replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
	const script = `
(function () {
  var trends = ${trendData};
  var canvas = document.getElementById('admin-dimension-chart');
  var tabs = document.querySelectorAll('#admin-dimension-tabs .tab');
  if (!canvas || typeof Chart === 'undefined') { tabs.forEach(function(t) { t.disabled = true; }); return; }
  var palette = ['#58a6ff','#3fb950','#bc8cff','#f0883e','#e3b341','#f778ba','#79c0ff','#56d364','#8b949e'];
  var narrow = window.matchMedia('(max-width: 720px)').matches;
  function fmt(n) {
    n = Math.round(n);
    if (n >= 999950000) return (n / 1000000000).toFixed(1) + 'B';
    if (n >= 999950) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return String(n);
  }
  function datasets(trend) {
    return trend.labels.map(function(label, index) {
      var color = palette[index % palette.length];
      return { label: label, data: trend.daily.map(function(day) { return day.team[index]; }),
        backgroundColor: color + 'bb', borderColor: color, borderWidth: 1, borderRadius: 2 };
    });
  }
  var chart = new Chart(canvas, {
    type: 'bar',
    data: { labels: trends.models.daily.map(function(day) { return day.day; }), datasets: datasets(trends.models) },
    options: {
      responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
      scales: {
        x: { stacked: true, grid: { color: '#21262d' }, ticks: { color: '#8b949e', maxTicksLimit: narrow ? 6 : 20, font: { size: 11 } } },
        y: { stacked: true, grid: { color: '#21262d' }, ticks: { color: '#8b949e', font: { size: 11 }, callback: function(v) { return fmt(v); } },
          title: { display: !narrow, text: 'Tokens', color: '#8b949e', font: { size: 11 } } }
      },
      plugins: {
        legend: { position: 'bottom', labels: { color: '#c9d1d9', boxWidth: 11, padding: 14, font: { size: 11 } } },
        tooltip: { backgroundColor: '#161b22', borderColor: '#30363d', borderWidth: 1,
          callbacks: { label: function(ctx) { return '  ' + ctx.dataset.label + ': ' + fmt(ctx.parsed.y) + ' tokens'; } } }
      }
    }
  });
  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      tabs.forEach(function(t) { t.classList.toggle('active', t === tab); });
      chart.data.datasets = datasets(trends[tab.getAttribute('data-admin-dimension')]);
      chart.update();
    });
  });
})();`;

	return { html: dimensionsHtml + usersHtml, script };
}
