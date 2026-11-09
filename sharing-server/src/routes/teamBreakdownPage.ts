import type { TeamInsights } from '../teamInsights.js';
import type { ActivityTotals, DimensionSlice, NamedActivitySlice } from '../teamBreakdowns.js';
import { MODE_KEYS } from '../teamBreakdowns.js';

/**
 * Member-facing HTML for the work-context breakdowns on Team Insights: models, editors,
 * repositories and team activity, each as a team aggregate with the viewer's own share.
 *
 * Labels rendered here are model ids, editor names, repository folder names and tool /
 * MCP server names from uploads, so every one is HTML-escaped. No peer rows exist in this
 * data; see sharing-server/AGENTS.md for why team aggregates may carry these labels.
 */

const exact = (n: number): string => n.toLocaleString('en-US', { maximumFractionDigits: 2 });
const percent = (n: number): string => `${n.toFixed(1)}%`;
const usd = (n: number): string => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function escapeHtml(text: unknown): string {
	return String(text)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

export const MODE_LABELS: Record<(typeof MODE_KEYS)[number], string> = {
	ask: 'Ask', edit: 'Edit', agent: 'Agent', plan: 'Plan', customAgent: 'Custom agent', cli: 'CLI / desktop agent',
};

function modeTotal(totals: ActivityTotals): number {
	return MODE_KEYS.reduce((sum, key) => sum + totals.modes[key], 0);
}

/** 100 × agent-style interactions (agent, plan, custom agent, CLI) over all mode-tagged interactions. */
export function agentSharePercent(totals: ActivityTotals): number | null {
	const all = modeTotal(totals);
	if (!all) return null;
	return (totals.modes.agent + totals.modes.plan + totals.modes.customAgent + totals.modes.cli) / all * 100;
}

function stat(label: string, value: string, note?: string): string {
	return `<div class="stat-card"><div class="label">${label}</div><div class="value team-value">${value}</div>${note ? `<p class="team-muted">${note}</p>` : ''}</div>`;
}

function dimensionRows(slices: DimensionSlice[], showCost: boolean): string {
	return slices.map(slice => `<tr${slice.ownTokens > 0 ? ' class="team-own-label"' : ''}>
  <th scope="row">${escapeHtml(slice.label)}</th>
  <td>${exact(slice.totalTokens)}</td><td>${percent(slice.sharePercent)}</td><td>${slice.activeUsers}</td>
  <td>${exact(slice.interactions)}</td>${showCost ? `<td>${usd(slice.estimatedCostUsd)}</td>` : ''}
  <td>${exact(slice.ownTokens)}</td><td>${percent(slice.ownSharePercent)}</td>${showCost ? `<td>${usd(slice.ownCostUsd)}</td>` : ''}
</tr>`).join('');
}

function dimensionTable(id: string, noun: string, slices: DimensionSlice[], showCost: boolean): string {
	if (!slices.length) return `<p>No ${noun} usage uploaded in this period.</p>`;
	return `<div class="table-scroll"><table id="${id}" class="sticky-first">
  <caption>Team totals per ${noun}, sorted by team tokens. "Your share" is the part of <em>your own</em> tokens that went to this ${noun}; "Team share" is the part of the team's tokens.</caption>
  <thead><tr><th scope="col">${noun[0].toUpperCase()}${noun.slice(1)}</th><th scope="col">Team tokens</th><th scope="col">Team share</th><th scope="col">Uploaders</th><th scope="col">Interactions</th>${showCost ? '<th scope="col">Team est. cost</th>' : ''}<th scope="col">Your tokens</th><th scope="col">Your share</th>${showCost ? '<th scope="col">Your est. cost</th>' : ''}</tr></thead>
  <tbody>${dimensionRows(slices, showCost)}</tbody>
</table></div>`;
}

function dimensionCard(args: { id: string; noun: string; title: string; slices: DimensionSlice[]; hasTrend: boolean; showCost: boolean; blurb: string }): string {
	const { id, noun, title, slices, hasTrend, showCost, blurb } = args;
	return `<section class="card" aria-labelledby="team-${id}">
    <div class="card-header"><h3 id="team-${id}">${title}</h3>
      ${hasTrend ? `<div class="tabs" aria-label="${title} trend scope">
        <button type="button" class="tab active" data-team-dimension="${id}" data-team-scope="team" aria-pressed="true">Team</button>
        <button type="button" class="tab" data-team-dimension="${id}" data-team-scope="own" aria-pressed="false">You</button>
      </div>` : ''}
    </div>
    <p class="team-muted">${blurb}</p>
    ${hasTrend ? `<div class="chart-wrap"><canvas id="team-${id}-chart" role="img" aria-label="Daily tokens per ${noun}, team or your own. Exact values are in the table below."></canvas></div>` : ''}
    ${dimensionTable(`team-${id}-table`, noun, slices, showCost)}
  </section>`;
}

function namedTable(id: string, noun: string, slices: NamedActivitySlice[]): string {
	if (!slices.length) return `<p class="team-muted">No ${noun} calls were reported in this period.</p>`;
	return `<div class="table-scroll"><table id="${id}" class="sticky-first">
  <thead><tr><th scope="col">${noun[0].toUpperCase()}${noun.slice(1)}</th><th scope="col">Team calls</th><th scope="col">Uploaders</th><th scope="col">Your calls</th></tr></thead>
  <tbody>${slices.map(slice => `<tr${slice.ownCalls > 0 ? ' class="team-own-label"' : ''}><th scope="row">${escapeHtml(slice.name)}</th><td>${exact(slice.calls)}</td><td>${slice.activeUsers}</td><td>${exact(slice.ownCalls)}</td></tr>`).join('')}</tbody>
</table></div>`;
}

function modeBars(team: ActivityTotals, self: ActivityTotals): string {
	const teamAll = modeTotal(team);
	const ownAll = modeTotal(self);
	if (!teamAll) return '<p class="team-muted">No interaction modes were reported in this period.</p>';
	return `<div class="table-scroll"><table id="team-mode-table" class="sticky-first">
  <caption>Share of mode-tagged interactions. Agent-style modes (agent, plan, custom agent, CLI) are what the agent-mode share above counts.</caption>
  <thead><tr><th scope="col">Mode</th><th scope="col">Team interactions</th><th scope="col">Team share</th><th scope="col">Your interactions</th><th scope="col">Your share</th></tr></thead>
  <tbody>${MODE_KEYS.map(key => `<tr>
    <th scope="row">${MODE_LABELS[key]}</th>
    <td>${exact(team.modes[key])}</td>
    <td><meter min="0" max="100" value="${(team.modes[key] / teamAll * 100).toFixed(1)}" aria-label="${MODE_LABELS[key]} team share"></meter> ${percent(team.modes[key] / teamAll * 100)}</td>
    <td>${exact(self.modes[key])}</td>
    <td>${ownAll ? percent(self.modes[key] / ownAll * 100) : '-'}</td>
  </tr>`).join('')}</tbody>
</table></div>`;
}

function activityCard(data: TeamInsights): string {
	const { team, self, mcpServers, tools } = data.activity;
	if (!team.uploadersWithActivity) {
		return `<section class="card" aria-labelledby="team-activity">
    <div class="card-header"><h3 id="team-activity">How the team works</h3></div>
    <p>No activity counters were uploaded in this period. Sessions, interaction modes, tool calls and MCP servers appear here once teammates run an extension version that sends them.</p>
  </section>`;
	}
	const teamAgent = agentSharePercent(team);
	const ownAgent = agentSharePercent(self);
	return `<section class="card" aria-labelledby="team-activity">
    <div class="card-header"><h3 id="team-activity">How the team works</h3></div>
    <p class="team-muted">Counts of sessions, interaction modes, tool calls and MCP server calls across uploaders who report them, next to your own. Tool and server names are product vocabulary; no arguments, prompts or results are uploaded.</p>
    <div class="stat-grid">
      ${stat('Sessions', exact(team.sessions), `You: ${exact(self.sessions)}`)}
      ${stat('Agent-mode share', teamAgent === null ? '-' : percent(teamAgent), `You: ${ownAgent === null ? '-' : percent(ownAgent)}`)}
      ${stat('Tool calls', exact(team.toolCalls), `You: ${exact(self.toolCalls)}`)}
      ${stat('MCP calls', exact(team.mcpCalls), `You: ${exact(self.mcpCalls)}`)}
      ${stat('Uploaders reporting activity', exact(team.uploadersWithActivity), self.uploadersWithActivity ? 'Including you' : 'Not including you yet')}
    </div>
    <h4>Interaction modes</h4>
    ${modeBars(team, self)}
    <h4>MCP servers</h4>
    ${namedTable('team-mcp-table', 'MCP server', mcpServers)}
    <h4>Tools</h4>
    ${namedTable('team-tool-table', 'tool', tools)}
  </section>`;
}

function repositoriesCard(data: TeamInsights): string {
	const { repositories } = data.dimensions;
	const unnamed = data.unnamedRepositories;
	const unnamedNote = unnamed.totalTokens > 0
		? `<p class="team-muted">${exact(unnamed.totalTokens)} team tokens (${exact(unnamed.ownTokens)} of yours) were uploaded under hashed workspace IDs without a readable name and are not listed. Readable names are sent when <em>share readable workspace/machine names</em> is enabled in the extension.</p>`
		: '';
	return `<section class="card" aria-labelledby="team-repositories">
    <div class="card-header"><h3 id="team-repositories">Repositories</h3></div>
    <p class="team-muted">Where the team's AI usage lands, by workspace folder name, with how many uploaders worked in each. Names are team-shared context; which teammate worked where is not shown.</p>
    ${repositories.length ? dimensionTable('team-repository-table', 'repository', repositories, false) : '<p>No named repositories in this period.</p>'}
    ${unnamedNote}
  </section>`;
}

export interface TeamBreakdownHtml {
	/** Cards to place inside the Team Insights page. */
	sections: string;
	/** Chart code; expects `Chart` to be loaded already and tolerates its absence. */
	script: string;
	/** Extra stat cards for the overview and self-position grids. */
	overviewStats: string;
	selfStats: string;
}

export function renderTeamBreakdowns(data: TeamInsights): TeamBreakdownHtml {
	const { models, editors } = data.dimensions;
	const showCost = data.cost.totalCostUsd > 0;
	const sections = [
		dimensionCard({
			id: 'models', noun: 'model', title: 'Models', slices: models, hasTrend: models.length > 0, showCost,
			blurb: 'Which models the team runs its tokens through, how that changes over time, and how your own mix compares. Cost is the uploaders’ own estimate from the public price list, not an invoice.',
		}),
		dimensionCard({
			id: 'editors', noun: 'editor', title: 'Editors', slices: editors, hasTrend: editors.length > 0, showCost,
			blurb: 'Which editors and agents the team works in (VS Code chat, Copilot CLI, Claude Code, ...) and whether usage is shifting between them.',
		}),
		repositoriesCard(data),
		activityCard(data),
	].join('\n');
	const trendData = JSON.stringify({ models: data.trends.models, editors: data.trends.editors }).replace(/</g, '\\u003c');
	const script = `
(function () {
  var trends = ${trendData};
  var palette = ['#58a6ff', '#3fb950', '#bc8cff', '#f0883e', '#e3b341', '#f778ba', '#79c0ff', '#56d364', '#8b949e'];
  var buttons = document.querySelectorAll('[data-team-dimension]');
  if (typeof Chart === 'undefined') {
    buttons.forEach(function(button) { button.disabled = true; });
    return;
  }
  var style = getComputedStyle(document.querySelector('.team-page'));
  var muted = style.getPropertyValue('--team-muted').trim();
  var grid = style.getPropertyValue('--team-grid').trim();
  var narrow = window.matchMedia('(max-width: 720px)').matches;
  function datasets(trend, scope) {
    return trend.labels.map(function(label, index) {
      var color = palette[index % palette.length];
      return {
        label: label,
        data: trend.daily.map(function(day) { return day[scope][index]; }),
        backgroundColor: color + 'bb', borderColor: color, borderWidth: 1, borderRadius: 2
      };
    });
  }
  var charts = {};
  ['models', 'editors'].forEach(function(id) {
    var canvas = document.getElementById('team-' + id + '-chart');
    if (!canvas || !trends[id] || !trends[id].labels.length) return;
    charts[id] = new Chart(canvas, {
      type: 'bar',
      data: { labels: trends[id].daily.map(function(day) { return day.day; }), datasets: datasets(trends[id], 'team') },
      options: {
        responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
        scales: {
          x: { stacked: true, ticks: { color: muted, maxTicksLimit: narrow ? 6 : 12 }, grid: { color: grid } },
          y: { stacked: true, beginAtZero: true, ticks: { color: muted }, grid: { color: grid }, title: { display: !narrow, text: 'Tokens', color: muted } }
        },
        plugins: {
          legend: { position: 'bottom', labels: { color: muted, boxWidth: 11 } },
          tooltip: { callbacks: { label: function(context) { return context.dataset.label + ': ' + context.parsed.y.toLocaleString('en-US') + ' tokens'; } } }
        }
      }
    });
  });
  buttons.forEach(function(button) {
    button.addEventListener('click', function() {
      var id = button.getAttribute('data-team-dimension');
      var scope = button.getAttribute('data-team-scope');
      document.querySelectorAll('[data-team-dimension="' + id + '"]').forEach(function(item) {
        item.classList.toggle('active', item === button);
        item.setAttribute('aria-pressed', String(item === button));
      });
      var chart = charts[id];
      if (!chart) return;
      chart.data.datasets = datasets(trends[id], scope);
      chart.update();
    });
  });
})();`;
	const overviewStats = showCost
		? stat('Estimated cost', usd(data.cost.totalCostUsd), `${data.cost.activeUsersWithCost} uploader${data.cost.activeUsersWithCost === 1 ? '' : 's'} with a cost estimate`)
		: '';
	const selfStats = showCost ? stat('Your estimated cost', usd(data.cost.ownCostUsd)) : '';
	return { sections, script, overviewStats, selfStats };
}
