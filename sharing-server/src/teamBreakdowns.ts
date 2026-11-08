import { getTeamBreakdownRows, type TeamBreakdownRow, type UploadActivity } from './db.js';

/**
 * Identity-free team breakdowns by work-context dimension (model, editor, repository)
 * plus team activity counters, with the viewer's own share alongside.
 *
 * Every label here is product vocabulary (a model id, an editor name, a tool or MCP
 * server name) or a repository folder name the team already shares. Per-peer detail is
 * never produced: a slice carries team totals, a distinct-uploader count and the
 * authenticated viewer's own numbers, nothing else. See sharing-server/AGENTS.md.
 */

/** Team totals for one label of a dimension, with the viewer's own numbers alongside. */
export interface DimensionSlice {
	label: string;
	inputTokens: number;
	outputTokens: number;
	totalTokens: number;
	interactions: number;
	/** Sum of uploaded cost estimates; 0 when no row carried one. */
	estimatedCostUsd: number;
	/** Distinct active uploaders with tokens or interactions under this label. */
	activeUsers: number;
	/** 100 × this label's share of team tokens in the period. */
	sharePercent: number;
	ownTokens: number;
	ownInteractions: number;
	ownCostUsd: number;
	/** 100 × this label's share of the viewer's own tokens in the period. */
	ownSharePercent: number;
}

/** Daily stacked series for a dimension: team tokens and own tokens per label. */
export interface DimensionTrend {
	/** Top labels by team tokens; anything beyond the cap is folded into `Other`. */
	labels: string[];
	daily: Array<{ day: string; team: number[]; own: number[] }>;
}

export type ActivityModeKey = 'ask' | 'edit' | 'agent' | 'plan' | 'customAgent' | 'cli';

export interface ActivityTotals {
	sessions: number;
	modes: Record<ActivityModeKey, number>;
	toolCalls: number;
	mcpCalls: number;
	/** Distinct active uploaders whose rows carried any activity counters (team only; 0 or 1 for self). */
	uploadersWithActivity: number;
}

export interface NamedActivitySlice {
	name: string;
	calls: number;
	activeUsers: number;
	ownCalls: number;
}

export interface TeamActivity {
	team: ActivityTotals;
	self: ActivityTotals;
	/** Most-used MCP servers across the team, by calls. */
	mcpServers: NamedActivitySlice[];
	/** Most-used tools across the team, by calls. */
	tools: NamedActivitySlice[];
}

export interface TeamBreakdowns {
	dimensions: {
		models: DimensionSlice[];
		editors: DimensionSlice[];
		/** Named workspaces (repository folders). Rows uploaded without a readable name are summarised in `unnamedRepositories`. */
		repositories: DimensionSlice[];
	};
	/** Tokens uploaded under hashed workspace IDs without a readable name, so the repository table can say what it does not cover. */
	unnamedRepositories: { totalTokens: number; ownTokens: number };
	trends: { models: DimensionTrend; editors: DimensionTrend };
	activity: TeamActivity;
	cost: { totalCostUsd: number; ownCostUsd: number; activeUsersWithCost: number };
}

export const MODE_KEYS: ActivityModeKey[] = ['ask', 'edit', 'agent', 'plan', 'customAgent', 'cli'];
const TREND_LABEL_CAP = 8;
const NAMED_ACTIVITY_CAP = 15;

function emptyTotals(): ActivityTotals {
	return {
		sessions: 0, toolCalls: 0, mcpCalls: 0, uploadersWithActivity: 0,
		modes: { ask: 0, edit: 0, agent: 0, plan: 0, customAgent: 0, cli: 0 },
	};
}

interface SliceAccumulator extends Omit<DimensionSlice, 'sharePercent' | 'ownSharePercent'> {
	users: Set<number>;
	daily: Map<string, { team: number; own: number }>;
}

function newSlice(label: string): SliceAccumulator {
	return {
		label, inputTokens: 0, outputTokens: 0, totalTokens: 0, interactions: 0, estimatedCostUsd: 0,
		activeUsers: 0, ownTokens: 0, ownInteractions: 0, ownCostUsd: 0, users: new Set(), daily: new Map(),
	};
}

function addRow(slices: Map<string, SliceAccumulator>, label: string, row: TeamBreakdownRow, isSelf: boolean): void {
	let slice = slices.get(label);
	if (!slice) {
		slice = newSlice(label);
		slices.set(label, slice);
	}
	const total = row.input_tokens + row.output_tokens;
	const cost = row.estimated_cost_usd ?? 0;
	slice.inputTokens += row.input_tokens;
	slice.outputTokens += row.output_tokens;
	slice.totalTokens += total;
	slice.interactions += row.interactions;
	slice.estimatedCostUsd += cost;
	if (total > 0 || row.interactions > 0) slice.users.add(row.user_id);
	const day = slice.daily.get(row.day) ?? { team: 0, own: 0 };
	day.team += total;
	if (isSelf) {
		slice.ownTokens += total;
		slice.ownInteractions += row.interactions;
		slice.ownCostUsd += cost;
		day.own += total;
	}
	slice.daily.set(row.day, day);
}

function finishSlices(slices: Map<string, SliceAccumulator>, teamTokens: number, ownTokens: number): DimensionSlice[] {
	return [...slices.values()]
		.sort((a, b) => b.totalTokens - a.totalTokens || a.label.localeCompare(b.label))
		.map(({ users, daily: _daily, ...slice }) => ({
			...slice,
			activeUsers: users.size,
			sharePercent: teamTokens ? slice.totalTokens / teamTokens * 100 : 0,
			ownSharePercent: ownTokens ? slice.ownTokens / ownTokens * 100 : 0,
		}));
}

function buildTrend(slices: Map<string, SliceAccumulator>, days: string[]): DimensionTrend {
	const ordered = [...slices.values()].sort((a, b) => b.totalTokens - a.totalTokens || a.label.localeCompare(b.label));
	const top = ordered.slice(0, TREND_LABEL_CAP);
	const rest = ordered.slice(TREND_LABEL_CAP);
	const labels = top.map(slice => slice.label);
	if (rest.length) labels.push('Other');
	const daily = days.map(day => {
		const team = top.map(slice => slice.daily.get(day)?.team ?? 0);
		const own = top.map(slice => slice.daily.get(day)?.own ?? 0);
		if (rest.length) {
			team.push(rest.reduce((sum, slice) => sum + (slice.daily.get(day)?.team ?? 0), 0));
			own.push(rest.reduce((sum, slice) => sum + (slice.daily.get(day)?.own ?? 0), 0));
		}
		return { day, team, own };
	});
	return { labels, daily };
}

function parseActivity(json: string | null): UploadActivity | undefined {
	if (!json) return undefined;
	try {
		const parsed: unknown = JSON.parse(json);
		return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed) ? parsed as UploadActivity : undefined;
	} catch {
		return undefined;
	}
}

function addActivity(totals: ActivityTotals, activity: UploadActivity): void {
	totals.sessions += activity.sessions ?? 0;
	totals.toolCalls += activity.toolCalls ?? 0;
	totals.mcpCalls += activity.mcpCalls ?? 0;
	for (const key of MODE_KEYS) totals.modes[key] += activity.modes?.[key] ?? 0;
}

interface NamedAccumulator { calls: number; ownCalls: number; users: Set<number> }

function addNamed(map: Map<string, NamedAccumulator>, counts: Record<string, number> | undefined, userId: number, isSelf: boolean): void {
	for (const [name, calls] of Object.entries(counts ?? {})) {
		if (typeof calls !== 'number' || !(calls > 0)) continue;
		const entry = map.get(name) ?? { calls: 0, ownCalls: 0, users: new Set<number>() };
		entry.calls += calls;
		entry.users.add(userId);
		if (isSelf) entry.ownCalls += calls;
		map.set(name, entry);
	}
}

function finishNamed(map: Map<string, NamedAccumulator>): NamedActivitySlice[] {
	return [...map.entries()]
		.map(([name, entry]) => ({ name, calls: entry.calls, activeUsers: entry.users.size, ownCalls: entry.ownCalls }))
		.sort((a, b) => b.calls - a.calls || a.name.localeCompare(b.name))
		.slice(0, NAMED_ACTIVITY_CAP);
}

/**
 * Build the team breakdowns for `[startDay, endDay]` (inclusive UTC dates) as seen by
 * `viewerId`. `days` is the ordered list of dates in the period, so trends have a point
 * for every day even without uploads. Rows outside `days` are ignored.
 */
export function computeTeamBreakdowns(viewerId: number, startDay: string, endDay: string, days: string[]): TeamBreakdowns {
	return computeTeamBreakdownsFromRows(getTeamBreakdownRows(startDay, endDay), viewerId, days);
}

/** Pure form of {@link computeTeamBreakdowns}; also used by the admin page on login-joined rows. */
export function computeTeamBreakdownsFromRows(rows: TeamBreakdownRow[], viewerId: number, days: string[]): TeamBreakdowns {
	const daySet = new Set(days);
	const models = new Map<string, SliceAccumulator>();
	const editors = new Map<string, SliceAccumulator>();
	const repositories = new Map<string, SliceAccumulator>();
	const unnamed = { totalTokens: 0, ownTokens: 0 };
	const team = emptyTotals();
	const self = emptyTotals();
	const teamActivityUsers = new Set<number>();
	const mcpServers = new Map<string, NamedAccumulator>();
	const tools = new Map<string, NamedAccumulator>();
	const costUsers = new Set<number>();
	let teamTokens = 0;
	let ownTokens = 0;
	let totalCostUsd = 0;
	let ownCostUsd = 0;

	for (const row of rows) {
		if (!daySet.has(row.day)) continue;
		const isSelf = row.user_id === viewerId;
		const total = row.input_tokens + row.output_tokens;
		teamTokens += total;
		if (isSelf) ownTokens += total;
		addRow(models, row.model, row, isSelf);
		addRow(editors, (row.editor ?? '').trim() || 'VS Code', row, isSelf);
		const repository = (row.workspace_name ?? '').trim();
		if (repository) {
			addRow(repositories, repository, row, isSelf);
		} else {
			unnamed.totalTokens += total;
			if (isSelf) unnamed.ownTokens += total;
		}
		if (typeof row.estimated_cost_usd === 'number' && Number.isFinite(row.estimated_cost_usd)) {
			totalCostUsd += row.estimated_cost_usd;
			if (isSelf) ownCostUsd += row.estimated_cost_usd;
			if (row.estimated_cost_usd > 0) costUsers.add(row.user_id);
		}
		const activity = parseActivity(row.activity_json);
		if (activity) {
			teamActivityUsers.add(row.user_id);
			addActivity(team, activity);
			if (isSelf) addActivity(self, activity);
			addNamed(mcpServers, activity.mcpByServer, row.user_id, isSelf);
			addNamed(tools, activity.toolsByName, row.user_id, isSelf);
		}
	}
	team.uploadersWithActivity = teamActivityUsers.size;
	self.uploadersWithActivity = teamActivityUsers.has(viewerId) ? 1 : 0;

	return {
		dimensions: {
			models: finishSlices(models, teamTokens, ownTokens),
			editors: finishSlices(editors, teamTokens, ownTokens),
			repositories: finishSlices(repositories, teamTokens, ownTokens),
		},
		unnamedRepositories: unnamed,
		trends: { models: buildTrend(models, days), editors: buildTrend(editors, days) },
		activity: { team, self, mcpServers: finishNamed(mcpServers), tools: finishNamed(tools) },
		cost: { totalCostUsd, ownCostUsd, activeUsersWithCost: costUsers.size },
	};
}
