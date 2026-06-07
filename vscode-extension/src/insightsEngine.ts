/**
 * Insights engine — evaluates personalized, data-driven nudges from usage stats.
 *
 * This module is intentionally pure (no VS Code API dependencies) so it can be
 * unit-tested with mocked data following the same pattern as onboarding.ts.
 */
import type {
	UsageAnalysisPeriod,
	MissedPotentialWorkspace,
	WorkspaceCustomizationMatrix,
	TodaySessionSummary,
} from './types';
import toolNamesData from './toolNames.json';
import { resolveGuidMcpToolName } from './utils/toolUtils';

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

const TOOL_NAME_MAP: Record<string, string> = toolNamesData as Record<string, string>;

/**
 * Returns a human-friendly display name for an MCP tool ID.
 * 1. Exact match in toolNames.json
 * 2. GUID-keyed MCP pattern (e.g. M365 Connector)
 * 3. Parse mcp__<server>__<tool> → "Server: Tool Name"
 * 4. Fall back to the raw ID
 */
function friendlyToolName(id: string): string {
	if (TOOL_NAME_MAP[id]) { return TOOL_NAME_MAP[id]; }
	const guid = resolveGuidMcpToolName(id);
	if (guid) { return guid; }
	// Parse mcp__ServerName__tool_name → "Server Name: Tool Name"
	const mcpMatch = /^mcp__([^_][^_]*)__(.+)$/.exec(id);
	if (mcpMatch) {
		const server = mcpMatch[1].replace(/_/g, ' ').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
		const tool = mcpMatch[2].replace(/_/g, ' ').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
		return `${server}: ${tool}`;
	}
	return id;
}

/** Sums all meaningful context reference counts for a period. */
function totalContextRefs(p: UsageAnalysisPeriod): number {
	const r = p.contextReferences;
	return (r.file ?? 0) + (r.codebase ?? 0) + (r.workspace ?? 0) + (r.selection ?? 0)
		+ (r.symbol ?? 0) + (r.terminal ?? 0) + (r.clipboard ?? 0) + (r.changes ?? 0)
		+ (r.pullRequest ?? 0);
}

// ── Session-hygiene helpers ────────────────────────────────────────────────
/** A single today-session is considered a "marathon" once it grows this long. */
const MARATHON_TURNS = 50;
/** ...or once it has processed this many cumulative tokens. */
const MARATHON_TOKENS = 750_000;

function isMarathonSession(s: TodaySessionSummary): boolean {
	return s.interactions >= MARATHON_TURNS || s.totalTokens >= MARATHON_TOKENS;
}

function hasMarathonSessionToday(ctx: InsightContext): boolean {
	return (ctx.todaySessions ?? []).some(isMarathonSession);
}

/** The largest today-session by turns, tie-broken by tokens. */
function biggestSessionToday(ctx: InsightContext): TodaySessionSummary | undefined {
	return (ctx.todaySessions ?? [])
		.slice()
		.sort((a, b) => (b.interactions - a.interactions) || (b.totalTokens - a.totalTokens))[0];
}

/** Short human-readable token count, e.g. 1_200_000 → "1.2M", 750_000 → "750K". */
function formatTokensShort(n: number): string {
	if (n >= 1_000_000) { return `${(n / 1_000_000).toFixed(1)}M`; }
	if (n >= 1_000) { return `${Math.round(n / 1_000)}K`; }
	return String(n);
}

/** Count of manual /compact commands in a period (Claude Code / Desktop only). */
function manualCompactCount(p: UsageAnalysisPeriod): number {
	return p.toolCalls.byTool['__slash__compact'] ?? 0;
}

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type InsightCategory = 'context' | 'agentic' | 'customization' | 'consistency' | 'tools' | 'trend';
export type InsightSeverity = 'tip' | 'opportunity' | 'celebration';
export type InsightStatus = 'new' | 'seen' | 'dismissed' | 'snoozed' | 'done';

export interface InsightContext {
	today: UsageAnalysisPeriod;
	last30Days: UsageAnalysisPeriod;
	missedPotential: MissedPotentialWorkspace[];
	customizationMatrix?: WorkspaceCustomizationMatrix | null;
	todaySessions?: TodaySessionSummary[];
}

export interface InsightState {
	status: InsightStatus;
	firstSurfacedAt: string;   // ISO timestamp
	lastSurfacedAt: string;    // ISO timestamp
	snoozeUntil?: string;      // ISO timestamp; present when status === 'snoozed'
}

/** Persisted bag of per-insight state keyed by insight id. */
export type InsightStateBag = Record<string, InsightState>;

/** A fully evaluated, display-ready insight card. */
export interface EvaluatedInsight {
	id: string;
	category: InsightCategory;
	severity: InsightSeverity;
	title: string;
	body: string;
	actionLabel?: string;
	actionCommand?: string;
	status: InsightStatus;
	/** When true, this insight may also be surfaced as a VS Code toast notification. */
	allowToast?: boolean;
}

// ---------------------------------------------------------------------------
// Internal definition shape (not exported — consumers only see EvaluatedInsight)
// ---------------------------------------------------------------------------

interface InsightDefinition {
	id: string;
	category: InsightCategory;
	severity: InsightSeverity;
	title: string;
	buildBody: (ctx: InsightContext) => string;
	actionLabel?: string;
	actionCommand?: string;
	/** Returns true when this insight is applicable given the current context. */
	appliesTo: (ctx: InsightContext) => boolean;
	/** Higher weight → surfaced earlier when multiple insights apply. */
	weight: number;
	allowToast?: boolean;
}

// ---------------------------------------------------------------------------
/** Count of auto-compaction events in a period (Claude Code / Desktop only). */
function autoCompactCount(p: UsageAnalysisPeriod): number {
	return p.toolCalls.byTool['__auto_compact__'] ?? 0;
}

// Starter catalog
// Sub-session agents will add entries here for trend data, context quality,
// focus times, streaks, and MCP/tool adoption insights.
// ---------------------------------------------------------------------------

export const INSIGHT_CATALOG: InsightDefinition[] = [
	// ── Customization ──────────────────────────────────────────────────────
	{
		id: 'missing-instructions',
		category: 'customization',
		severity: 'opportunity',
		title: '🗒️ Add copilot-instructions.md to your repos',
		buildBody: (ctx) => {
			const count = ctx.missedPotential.length;
			const names = ctx.missedPotential
				.slice(0, 3)
				.map(w => w.workspaceName)
				.join(', ');
			const suffix = count > 3 ? ` (+${count - 3} more)` : '';
			return `${count} active workspace${count > 1 ? 's' : ''} (${names}${suffix}) ${count > 1 ? 'don\'t have' : 'doesn\'t have'} a \`copilot-instructions.md\` file. ` +
				`Adding one gives Copilot project-specific context, reducing back-and-forth and improving response quality.`;
		},
		actionLabel: 'View Workspace Health',
		actionCommand: 'aiEngineeringFluency.showUsageAnalysis',
		appliesTo: (ctx) => ctx.missedPotential.length > 0,
		weight: 90,
		allowToast: true,
	},

	// ── Context ─────────────────────────────────────────────────────────────
	{
		id: 'no-context-refs',
		category: 'context',
		severity: 'tip',
		title: '📎 Try anchoring Copilot with context references',
		buildBody: (ctx) => {
			const sessions = ctx.last30Days.sessions;
			const total = (ctx.last30Days.contextReferences.file ?? 0)
				+ (ctx.last30Days.contextReferences.codebase ?? 0)
				+ (ctx.last30Days.contextReferences.selection ?? 0)
				+ (ctx.last30Days.contextReferences.symbol ?? 0);
			return `Across your ${sessions} sessions in the last 30 days you used only ${total} context ` +
				`reference${total !== 1 ? 's' : ''} (#file, #codebase, @workspace, etc.). ` +
				`Attaching relevant files or symbols helps Copilot give more accurate, targeted answers and reduces follow-up turns.`;
		},
		appliesTo: (ctx) => {
			if (ctx.last30Days.sessions < 10) { return false; }
			const refs = ctx.last30Days.contextReferences;
			const total = (refs.file ?? 0) + (refs.codebase ?? 0)
				+ (refs.selection ?? 0) + (refs.symbol ?? 0);
			return total < 5;
		},
		weight: 70,
	},

	// ── Agentic ─────────────────────────────────────────────────────────────
	{
		id: 'try-agent-mode',
		category: 'agentic',
		severity: 'tip',
		title: '🤖 Try Agent mode for multi-file tasks',
		buildBody: (ctx) => {
			const editCount = ctx.last30Days.modeUsage.edit ?? 0;
			return `You ran ${editCount} edit-mode interaction${editCount !== 1 ? 's' : ''} in the last 30 days but haven't used Agent mode yet. ` +
				`Agent mode lets Copilot autonomously traverse, edit, and test across multiple files — ` +
				`great for refactors, feature additions, or bug hunts that touch more than one file.`;
		},
		appliesTo: (ctx) => {
			if (ctx.last30Days.sessions < 5) { return false; }
			const m = ctx.last30Days.modeUsage;
			return (m.agent ?? 0) === 0 && (m.edit ?? 0) > 3;
		},
		weight: 60,
	},

	// ── Context quality ──────────────────────────────────────────────────────
	{
		id: 'low-context-diversity',
		category: 'context',
		severity: 'opportunity',
		title: '🔍 Most of your sessions have no context attached',
		buildBody: (ctx) => {
			const sessions = ctx.last30Days.sessions;
			const total = totalContextRefs(ctx.last30Days);
			const noContextPct = Math.round(Math.max(0, 1 - total / sessions) * 100);
			return `About ${noContextPct}% of your ${sessions} sessions in the last 30 days had no context references. ` +
				`Try using \`#file\` to attach relevant files, \`@workspace\` to search your codebase, ` +
				`or select code before asking — Copilot's answers improve significantly with relevant context.`;
		},
		appliesTo: (ctx) => {
			if (ctx.last30Days.sessions < 10) { return false; }
			const total = totalContextRefs(ctx.last30Days);
			return total < ctx.last30Days.sessions * 0.3;
		},
		weight: 65,
	},
	{
		id: 'only-using-file-refs',
		category: 'context',
		severity: 'tip',
		title: '📂 Broaden your context beyond file references',
		buildBody: (_ctx) => {
			return `You attach files frequently, but there's more context available. ` +
				`Try \`#codebase\` or \`@workspace\` to let Copilot search across your entire project for relevant code, ` +
				`or select a specific code block before asking for precision on a particular snippet.`;
		},
		appliesTo: (ctx) => {
			const refs = ctx.last30Days.contextReferences;
			return (refs.file ?? 0) > 20 && (refs.codebase ?? 0) < 5 && (refs.selection ?? 0) < 5;
		},
		weight: 45,
	},
	{
		id: 'good-context-variety',
		category: 'context',
		severity: 'celebration',
		title: '🌟 Great job using diverse context references',
		buildBody: (ctx) => {
			const refs = ctx.last30Days.contextReferences;
			const activeTypes = [
				refs.file,
				(refs.codebase ?? 0) + (refs.workspace ?? 0),
				refs.selection,
				refs.symbol,
				refs.terminal,
				refs.clipboard,
				refs.changes,
			].filter(v => (v ?? 0) > 3).length;
			return `You're using ${activeTypes} different types of context references in the last 30 days — ` +
				`\`#file\`, \`#selection\`, \`@workspace\`, and more. ` +
				`Diverse context helps Copilot understand exactly what you're working with and deliver more precise answers.`;
		},
		appliesTo: (ctx) => {
			const refs = ctx.last30Days.contextReferences;
			const countAboveThreshold = [
				refs.file,
				(refs.codebase ?? 0) + (refs.workspace ?? 0),
				refs.selection,
				refs.symbol,
				refs.terminal,
				refs.clipboard,
				refs.changes,
			].filter(v => (v ?? 0) > 3).length;
			return countAboveThreshold >= 4;
		},
		weight: 30,
	},
	{
		id: 'conversation-depth-low',
		category: 'consistency',
		severity: 'tip',
		title: '💬 Try refining answers within the same conversation',
		buildBody: (ctx) => {
			const avg = ctx.last30Days.conversationPatterns.avgTurnsPerSession.toFixed(1);
			return `Your conversations average ${avg} turns per session in the last 30 days. ` +
				`When Copilot's first answer isn't quite right, follow up in the same conversation — ` +
				`it retains context across turns and often converges to the right answer faster than starting fresh.`;
		},
		appliesTo: (ctx) => {
			if (ctx.last30Days.sessions < 10) { return false; }
			return ctx.last30Days.conversationPatterns.avgTurnsPerSession < 1.5;
		},
		weight: 50,
	},

	// ── Streaks / Consistency ───────────────────────────────────────────────
	{
		id: 'consistent-daily-user',
		category: 'consistency',
		severity: 'celebration',
		title: '🔥 You\'re a consistent Copilot user!',
		buildBody: (ctx) => {
			const n = ctx.last30Days.sessions;
			return `You've been consistently using Copilot — ${n} sessions over the last 30 days. ` +
				`Consistent AI use builds stronger intuition over time.`;
		},
		appliesTo: (ctx) => ctx.last30Days.sessions >= 25,
		weight: 45,
		allowToast: true,
	},
	{
		id: 'irregular-usage',
		category: 'consistency',
		severity: 'opportunity',
		title: '📅 Build a Copilot habit with daily use',
		buildBody: (ctx) => {
			const n = ctx.last30Days.sessions;
			return `You've used Copilot ${n} time${n !== 1 ? 's' : ''} in the last 30 days. ` +
				`Regular daily use (even for small tasks) helps you build intuition and flow with AI-assisted coding.`;
		},
		appliesTo: (ctx) => ctx.last30Days.sessions > 0 && ctx.last30Days.sessions < 10,
		weight: 60,
	},
	{
		id: 'mode-diversity-low',
		category: 'consistency',
		severity: 'tip',
		title: '🔀 Explore more Copilot modes',
		buildBody: (ctx) => {
			const sessions = ctx.last30Days.sessions;
			const m = ctx.last30Days.modeUsage;
			if ((m.ask ?? 0) > 0.85 * sessions) {
				return 'You mostly use Ask mode. Try Edit mode for making code changes directly.';
			}
			if ((m.edit ?? 0) > 0.85 * sessions) {
				return 'You mostly use Edit mode. Ask mode is great for questions and exploration.';
			}
			return 'You haven\'t tried Agent mode yet. It handles multi-step tasks autonomously — great for refactoring, adding tests, or implementing features.';
		},
		appliesTo: (ctx) => {
			const sessions = ctx.last30Days.sessions;
			if (sessions < 10) { return false; }
			const m = ctx.last30Days.modeUsage;
			return (m.ask ?? 0) > 0.85 * sessions
				|| (m.edit ?? 0) > 0.85 * sessions
				|| ((m.agent ?? 0) === 0 && sessions >= 15);
		},
		weight: 50,
	},

	// ── Tools / MCP ─────────────────────────────────────────────────────────
	{
		id: 'no-mcp-in-agent-mode',
		category: 'tools',
		severity: 'tip',
		title: '🔌 Extend Agent mode with MCP servers',
		buildBody: (_ctx) => {
			return `You use Agent mode regularly — MCP (Model Context Protocol) servers can extend what Copilot can do in agent sessions, ` +
				`like reading databases, calling APIs, or browsing docs. Search for 'MCP servers VS Code' to explore options.`;
		},
		appliesTo: (ctx) => {
			const m = ctx.last30Days.modeUsage;
			return (m.agent ?? 0) >= 5 && ctx.last30Days.mcpTools.total === 0;
		},
		weight: 55,
	},
	{
		id: 'mcp-tools-active',
		category: 'tools',
		severity: 'celebration',
		title: '🛠️ You\'re actively using MCP tools',
		buildBody: (ctx) => {
			const byTool = ctx.last30Days.mcpTools.byTool;
			const total = ctx.last30Days.mcpTools.total;
			let topTool: string | null = null;
			let topCount = 0;
			for (const [tool, count] of Object.entries(byTool)) {
				if (count > topCount) {
					topCount = count;
					topTool = tool;
				}
			}
			if (topTool) {
				return `You're actively using MCP tools in your Copilot sessions — great! Your most-used tool: ${friendlyToolName(topTool)} (${topCount} calls).`;
			}
			return `You're using ${total} MCP tool calls — great adoption of extended Copilot capabilities!`;
		},
		appliesTo: (ctx) => ctx.last30Days.mcpTools.total >= 10,
		weight: 35,
		allowToast: false,
	},
	{
		id: 'install-extensions',
		category: 'tools',
		severity: 'tip',
		title: '🧩 Discover Agent mode and MCP extensions',
		buildBody: (_ctx) => {
			return `If you haven't explored Agent mode yet, it's worth trying for complex multi-file tasks. ` +
				`Agent mode can use tools — including MCP servers you install — to complete tasks more autonomously.`;
		},
		appliesTo: (ctx) => {
			if (ctx.last30Days.sessions < 10) { return false; }
			const m = ctx.last30Days.modeUsage;
			// Only show when try-agent-mode wouldn't fire (edit <= 3)
			return (m.agent ?? 0) === 0 && (m.edit ?? 0) <= 3 && ctx.last30Days.mcpTools.total === 0;
		},
		weight: 40,
	},

	// ── Conversation patterns ────────────────────────────────────────────────
	{
		id: 'mostly-single-turn',
		category: 'consistency',
		severity: 'tip',
		title: '🔄 Iterate with Copilot instead of starting fresh',
		buildBody: (ctx) => {
			const { singleTurnSessions, multiTurnSessions } = ctx.last30Days.conversationPatterns;
			const total = singleTurnSessions + multiTurnSessions;
			const pct = total > 0 ? Math.round((singleTurnSessions / total) * 100) : 0;
			return `${pct}% of your last-30-day sessions ended after a single message (${singleTurnSessions} of ${total}). ` +
				`When Copilot's first answer isn't quite right, follow up in the same conversation rather than ` +
				`starting over — it retains context and typically converges faster.`;
		},
		appliesTo: (ctx) => {
			const { singleTurnSessions, multiTurnSessions } = ctx.last30Days.conversationPatterns;
			const total = singleTurnSessions + multiTurnSessions;
			if (total < 10) { return false; }
			return singleTurnSessions / total > 0.80;
		},
		weight: 50,
	},

	// ── Trend ────────────────────────────────────────────────────────────────
	{
		id: 'sessions-trending-up',
		category: 'trend',
		severity: 'celebration',
		title: '🚀 Your Copilot usage is on the rise!',
		buildBody: (ctx) => {
			const dailyAvg = ctx.last30Days.sessions / 30;
			const pct = Math.round((ctx.today.sessions / dailyAvg - 1) * 100);
			return `You've had ${ctx.today.sessions} session${ctx.today.sessions !== 1 ? 's' : ''} today — ` +
				`${pct}% above your daily average of ${dailyAvg.toFixed(1)} over the last 30 days. ` +
				`Great momentum! Keep the streak going.`;
		},
		appliesTo: (ctx) => {
			if (ctx.last30Days.sessions <= 0) { return false; }
			const dailyAvg = ctx.last30Days.sessions / 30;
			return ctx.today.sessions > dailyAvg * 1.3;
		},
		weight: 40,
		allowToast: true,
	},
	{
		id: 'sessions-trending-down',
		category: 'trend',
		severity: 'opportunity',
		title: '💡 No Copilot session yet today',
		buildBody: (_ctx) => {
			return `You haven't started a Copilot session yet today — open a project and let Copilot help.`;
		},
		appliesTo: (ctx) => {
			return ctx.last30Days.sessions > 10 && ctx.today.sessions === 0;
		},
		weight: 55,
	},
	{
		id: 'agent-mode-growth',
		category: 'trend',
		severity: 'celebration',
		title: '🤖 You\'re using Agent mode more — nice!',
		buildBody: (ctx) => {
			const todayTotal = ctx.today.modeUsage.ask + ctx.today.modeUsage.edit + ctx.today.modeUsage.agent;
			const last30Total = ctx.last30Days.modeUsage.ask + ctx.last30Days.modeUsage.edit + ctx.last30Days.modeUsage.agent;
			const todayPct = Math.round((ctx.today.modeUsage.agent / todayTotal) * 100);
			const last30Pct = Math.round((ctx.last30Days.modeUsage.agent / last30Total) * 100);
			return `Agent mode made up ${todayPct}% of your interactions today, up from ${last30Pct}% over the last 30 days. ` +
				`Leaning into Agent mode for complex, multi-file tasks is a sign of growing AI engineering fluency!`;
		},
		appliesTo: (ctx) => {
			if (ctx.last30Days.modeUsage.agent <= 0 || ctx.today.modeUsage.agent <= 0) { return false; }
			const todayTotal = ctx.today.modeUsage.ask + ctx.today.modeUsage.edit + ctx.today.modeUsage.agent;
			const last30Total = ctx.last30Days.modeUsage.ask + ctx.last30Days.modeUsage.edit + ctx.last30Days.modeUsage.agent;
			if (todayTotal <= 0 || last30Total <= 0) { return false; }
			const todayShare = ctx.today.modeUsage.agent / todayTotal;
			const last30Share = ctx.last30Days.modeUsage.agent / last30Total;
			return (todayShare - last30Share) > 0.10;
		},
		weight: 45,
		allowToast: true,
	},
	{
		id: 'context-refs-trending-up',
		category: 'trend',
		severity: 'celebration',
		title: '📎 Your context usage is improving!',
		buildBody: (ctx) => {
			const todayRefs = ctx.today.contextReferences.file + ctx.today.contextReferences.codebase
				+ ctx.today.contextReferences.selection + ctx.today.contextReferences.symbol
				+ ctx.today.contextReferences.workspace + ctx.today.contextReferences.terminal
				+ ctx.today.contextReferences.vscode + ctx.today.contextReferences.implicitSelection;
			const last30Total = ctx.last30Days.contextReferences.file + ctx.last30Days.contextReferences.codebase
				+ ctx.last30Days.contextReferences.selection + ctx.last30Days.contextReferences.symbol
				+ ctx.last30Days.contextReferences.workspace + ctx.last30Days.contextReferences.terminal
				+ ctx.last30Days.contextReferences.vscode + ctx.last30Days.contextReferences.implicitSelection;
			const dailyAvg = last30Total / 30;
			const pct = Math.round((todayRefs / dailyAvg - 1) * 100);
			return `You used ${todayRefs} context reference${todayRefs !== 1 ? 's' : ''} today — ` +
				`${pct}% above your 30-day daily average of ${dailyAvg.toFixed(1)}. ` +
				`Rich context (files, symbols, codebase) helps Copilot give more precise, targeted answers.`;
		},
		appliesTo: (ctx) => {
			const last30Total = ctx.last30Days.contextReferences.file + ctx.last30Days.contextReferences.codebase
				+ ctx.last30Days.contextReferences.selection + ctx.last30Days.contextReferences.symbol
				+ ctx.last30Days.contextReferences.workspace + ctx.last30Days.contextReferences.terminal
				+ ctx.last30Days.contextReferences.vscode + ctx.last30Days.contextReferences.implicitSelection;
			if (last30Total <= 0) { return false; }
			const dailyAvg = last30Total / 30;
			const todayTotal = ctx.today.contextReferences.file + ctx.today.contextReferences.codebase
				+ ctx.today.contextReferences.selection + ctx.today.contextReferences.symbol
				+ ctx.today.contextReferences.workspace + ctx.today.contextReferences.terminal
				+ ctx.today.contextReferences.vscode + ctx.today.contextReferences.implicitSelection;
			return todayTotal > dailyAvg * 1.4;
		},
		weight: 35,
	},

	// ── Focus & Productivity ─────────────────────────────────────────────────
	{
		id: 'productive-session-today',
		category: 'consistency',
		severity: 'celebration',
		title: '🏆 Great deep-work session today!',
		buildBody: (ctx) => {
			const best = (ctx.todaySessions ?? [])
				.filter(s => s.interactions > 20)
				.sort((a, b) => b.interactions - a.interactions)[0];
			return `Your session in ${best.editor} had ${best.interactions} interactions — a sign of great deep work!`;
		},
		appliesTo: (ctx) => {
			if (!ctx.todaySessions || ctx.todaySessions.length === 0) { return false; }
			return ctx.todaySessions.some(s => s.interactions > 20);
		},
		weight: 40,
		allowToast: true,
	},
	{
		id: 'morning-sessions-pattern',
		category: 'consistency',
		severity: 'tip',
		title: '🌅 You code with AI best in the morning',
		buildBody: () => {
			return `You tend to start coding with AI early — your morning sessions show good focus habits.`;
		},
		appliesTo: (ctx) => {
			const sessions = ctx.todaySessions ?? [];
			if (sessions.length < 3) { return false; }
			const morningSessions = sessions.filter(s => {
				if (!s.lastActivity) { return false; }
				return new Date(s.lastActivity).getHours() < 10;
			});
			return morningSessions.length >= 2;
		},
		weight: 35,
	},
	{
		id: 'short-scattered-sessions',
		category: 'consistency',
		severity: 'opportunity',
		title: '⚡ Consolidate short sessions for deeper focus',
		buildBody: (ctx) => {
			const sessions = ctx.todaySessions ?? [];
			const avg = Math.round(sessions.reduce((sum, s) => sum + s.interactions, 0) / sessions.length);
			return `You had ${sessions.length} short sessions today (avg ${avg} interactions each). ` +
				`Fewer, deeper sessions often produce better results — try keeping context within one session.`;
		},
		appliesTo: (ctx) => {
			const sessions = ctx.todaySessions ?? [];
			if (sessions.length < 5) { return false; }
			const avg = sessions.reduce((sum, s) => sum + s.interactions, 0) / sessions.length;
			return avg < 5;
		},
		weight: 55,
	},

	// ── Session hygiene & compaction ─────────────────────────────────────────
	{
		id: 'marathon-session-today',
		category: 'consistency',
		severity: 'opportunity',
		title: '🧵 A very long chat session today',
		buildBody: (ctx) => {
			const s = biggestSessionToday(ctx);
			if (!s) { return ''; }
			const where = s.editor ? ` in ${s.editor}` : '';
			const turns = `${s.interactions} turn${s.interactions === 1 ? '' : 's'}`;
			const tokens = s.totalTokens > 0 ? ` (~${formatTokensShort(s.totalTokens)} tokens)` : '';
			return `Your longest chat today${where} reached ${turns}${tokens}. Deep work in one chat is great — but once a session gets this long, earlier context is more likely to be summarized, compressed, or dropped, so replies can drift and slow down. ` +
				`When the goal changes, start a fresh chat (New Chat / \`/new\`) and paste a short handoff summary. A handy rule: one chat per bug, feature, or refactor.`;
		},
		appliesTo: (ctx) => hasMarathonSessionToday(ctx),
		weight: 58,
		allowToast: true,
	},
	{
		id: 'very-long-sessions-pattern',
		category: 'consistency',
		severity: 'tip',
		title: '📏 Your chats tend to run long',
		buildBody: (ctx) => {
			const maxTurns = ctx.last30Days.conversationPatterns.maxTurnsInSession;
			const avg = ctx.last30Days.conversationPatterns.avgTurnsPerSession.toFixed(1);
			return `Over the last 30 days your longest conversation reached ${maxTurns} prompts, and your sessions average ${avg} prompts each. ` +
				`Very long chats make earlier context less reliable — the assistant may compress or ignore it as the window fills. ` +
				`Keeping one focused chat per task (and starting fresh when the topic shifts) usually produces sharper, faster answers.`;
		},
		appliesTo: (ctx) => {
			// Pattern-level insight: don't double up with the "today" marathon nudge.
			if (hasMarathonSessionToday(ctx)) { return false; }
			const cp = ctx.last30Days.conversationPatterns;
			return ctx.last30Days.sessions >= 10
				&& cp.maxTurnsInSession >= 80
				&& cp.avgTurnsPerSession >= 12;
		},
		weight: 45,
	},
	{
		id: 'frequent-manual-compaction',
		category: 'consistency',
		severity: 'celebration',
		title: '🎉 You\'re managing context like a pro',
		buildBody: (ctx) => {
			const n = manualCompactCount(ctx.last30Days);
			return `You've used \`/compact\` ${n} times in the last 30 days — that shows deliberate context management, which is a real power-user habit. ` +
				`One refinement: \`/compact\` is best for continuing the *same task* when a chat gets long. ` +
				`When you're switching to a *new subtask*, a fresh chat (\`/new\`) with a short handoff summary usually produces sharper answers, since compaction already condenses earlier detail. ` +
				`Rule of thumb: \`/compact\` = same task, \`/new\` = new goal.`;
		},
		appliesTo: (ctx) => manualCompactCount(ctx.last30Days) >= 5,
		weight: 50,
		allowToast: true,
	},
	{
		id: 'auto-compaction-pattern',
		category: 'consistency',
		severity: 'opportunity',
		title: '⚠️ Claude Code is auto-compacting your sessions',
		buildBody: (ctx) => {
			const n = autoCompactCount(ctx.last30Days);
			return `Claude Code hit the context window limit and auto-compacted ${n} session${n !== 1 ? 's' : ''} in the last 30 days. ` +
				`Auto-compaction means earlier context was lost without your control — you may have noticed replies suddenly lacking earlier detail. ` +
				`To avoid this: start a fresh chat (\`/new\`) when switching tasks, and use \`/compact\` yourself before the window fills.`;
		},
		appliesTo: (ctx) => autoCompactCount(ctx.last30Days) >= 2,
		weight: 65,
		allowToast: true,
	},

	// ── Model cost & efficiency ───────────────────────────────────────────────
	{
		id: 'high-cost-model-usage',
		category: 'agentic',
		severity: 'tip',
		title: '💰 Most of your requests use cost-intensive models',
		buildBody: (ctx) => {
			const ms = ctx.last30Days.modelSwitching;
			const pct = ms.totalRequests > 0 ? Math.round((ms.highCostRequests / ms.totalRequests) * 100) : 0;
			const models = ms.highCostModels.slice(0, 3).join(', ');
			return `${pct}% of your ${ms.totalRequests.toLocaleString()} requests over the last 30 days used higher-cost models${models ? ` (${models})` : ''}. ` +
				`For routine tasks like quick questions, summaries, or boilerplate, lighter models often perform just as well at a fraction of the cost. ` +
				`Reserve the heavier models for complex multi-step reasoning, architecture decisions, or subtle bugs.`;
		},
		appliesTo: (ctx) => {
			const ms = ctx.last30Days.modelSwitching;
			return ms.totalRequests >= 20
				&& (ms.highCostRequests / ms.totalRequests) > 0.70;
		},
		weight: 45,
	},

	// ── Code application habits ───────────────────────────────────────────────
	{
		id: 'low-apply-rate',
		category: 'agentic',
		severity: 'opportunity',
		title: '📋 You\'re not applying many suggested code blocks',
		buildBody: (ctx) => {
			const a = ctx.last30Days.applyUsage;
			const pct = Math.round(a.applyRate);
			return `You've applied ${pct}% of the ${a.totalCodeBlocks} code blocks Copilot suggested over the last 30 days. ` +
				`A low apply rate often means the suggestions are off-target. Try: ` +
				`attaching the specific file or selection (#file / select-then-ask), being more precise about what you need changed, or asking Copilot to explain its approach first so you can redirect it early.`;
		},
		appliesTo: (ctx) => {
			const a = ctx.last30Days.applyUsage;
			return a.totalCodeBlocks >= 20 && a.applyRate < 40;
		},
		weight: 52,
	},

	// ── Reasoning effort ─────────────────────────────────────────────────────
	{
		id: 'reasoning-effort-never-tuned',
		category: 'agentic',
		severity: 'tip',
		title: '🧠 Try tuning reasoning effort for complex tasks',
		buildBody: (ctx) => {
			const eu = ctx.last30Days.thinkingEffortUsage;
			const sessions = eu?.sessionCount ?? 0;
			return `You've had ${sessions} sessions where reasoning effort data was tracked, but you haven't switched effort levels yet. ` +
				`Raising effort to "high" gives the model more thinking budget for complex problems like architecture decisions, tricky bugs, or multi-step refactors — and you can keep it on "low" for quick questions to stay responsive.`;
		},
		appliesTo: (ctx) => {
			const eu = ctx.last30Days.thinkingEffortUsage;
			if (!eu) { return false; }
			return eu.sessionCount >= 5 && eu.switchCount === 0;
		},
		weight: 40,
	},
	{
		id: 'reasoning-effort-switcher',
		category: 'agentic',
		severity: 'celebration',
		title: '🎯 You\'re tuning reasoning effort — nice!',
		buildBody: (ctx) => {
			const eu = ctx.last30Days.thinkingEffortUsage!;
			return `You switched reasoning effort ${eu.switchCount} times across ${eu.sessionCount} sessions. ` +
				`Adapting effort to task complexity is one of the clearest signs of AI-engineering fluency — you're getting more out of Copilot without wasting compute on simple asks.`;
		},
		appliesTo: (ctx) => {
			const eu = ctx.last30Days.thinkingEffortUsage;
			return !!eu && eu.sessionCount >= 3 && eu.switchCount >= 3;
		},
		weight: 30,
		allowToast: false,
	},

	// ── Multi-agent orchestration ─────────────────────────────────────────────
	{
		id: 'multi-agent-orchestration',
		category: 'agentic',
		severity: 'celebration',
		title: '🤖 You\'re orchestrating multi-agent sessions!',
		buildBody: (ctx) => {
			const n = ctx.last30Days.multiAgentParentSessions!;
			return `You've run ${n} sessions that spawned parallel sub-agents over the last 30 days. ` +
				`Multi-agent orchestration is advanced AI engineering — you're splitting complex tasks across focused agents running in parallel, which significantly increases throughput for large changes.`;
		},
		appliesTo: (ctx) => (ctx.last30Days.multiAgentParentSessions ?? 0) >= 3,
		weight: 35,
		allowToast: true,
	},

	// ── Edit scope ───────────────────────────────────────────────────────────
	{
		id: 'single-file-edits-only',
		category: 'agentic',
		severity: 'tip',
		title: '📁 Try multi-file edits for larger refactors',
		buildBody: (ctx) => {
			const es = ctx.last30Days.editScope;
			return `You've made ${es.singleFileEdits} edit-mode sessions over the last 30 days, all touching a single file. ` +
				`For refactors that span multiple files — renaming a type, extracting a module, updating API contracts — switch to Agent mode (or Edit mode with multiple files selected). ` +
				`It can make changes consistently across your whole codebase without you opening each file manually.`;
		},
		appliesTo: (ctx) => {
			const es = ctx.last30Days.editScope;
			return es.singleFileEdits >= 10
				&& es.multiFileEdits === 0;
		},
		weight: 42,
	},

	// ── Context-window health ─────────────────────────────────────────────────
	{
		id: 'session-context-truncated',
		category: 'context',
		severity: 'opportunity',
		title: '⚠️ Context window was truncated in a session today',
		buildBody: (ctx) => {
			const truncated = (ctx.todaySessions ?? []).filter(s => (s.truncationCount ?? 0) > 0);
			const count = truncated.length;
			const totalRemoved = truncated.reduce((sum, s) => sum + (s.truncationCount ?? 0), 0);
			const sessionWord = count === 1 ? 'session' : 'sessions';
			const truncationWord = totalRemoved === 1 ? 'truncation event' : 'truncation events';
			return `${count} of your ${sessionWord} today had ${totalRemoved} ${truncationWord} where the AI dropped earlier messages to fit within the context window. ` +
				`This breaks the prompt cache (increasing latency and cost) and may have caused responses to lose track of earlier context. ` +
				`To avoid truncation: start a new session when switching tasks, use /compact before the context fills, or break large tasks into smaller focused sessions.`;
		},
		appliesTo: (ctx) => {
			return (ctx.todaySessions ?? []).some(s => (s.truncationCount ?? 0) > 0);
		},
		weight: 75,
		allowToast: true,
	},
];

// ---------------------------------------------------------------------------
// Core evaluation functions (all pure)
// ---------------------------------------------------------------------------

/** Returns all applicable, non-dismissed insights, sorted by weight descending. */
export function evaluateInsights(
	ctx: InsightContext,
	stateBag: InsightStateBag,
	cadenceDays: number,
	lastNudgeAt: string | null,
): EvaluatedInsight[] {
	const now = new Date().toISOString();
	return INSIGHT_CATALOG
		.filter(def => def.appliesTo(ctx))
		.sort((a, b) => b.weight - a.weight)
		.map(def => {
			const existing = stateBag[def.id];
			const status = resolveStatus(existing, cadenceDays, lastNudgeAt, now);
			return {
				id: def.id,
				category: def.category,
				severity: def.severity,
				title: def.title,
				body: def.buildBody(ctx),
				actionLabel: def.actionLabel,
				actionCommand: def.actionCommand,
				status,
				allowToast: def.allowToast,
			};
		})
		.filter(i => i.status !== 'dismissed');
}

/**
 * Merges newly evaluated insights into the state bag.
 * - Applicable, unseen insights get status 'new'.
 * - Existing states are preserved (seen/snoozed/done/dismissed).
 * - Insights that no longer apply are left in the bag untouched.
 * Returns the updated (mutated) bag.
 */
export function mergeInsightStates(
	evaluated: EvaluatedInsight[],
	stateBag: InsightStateBag,
	now: string,
): InsightStateBag {
	for (const insight of evaluated) {
		const existing = stateBag[insight.id];
		if (!existing) {
			stateBag[insight.id] = {
				status: 'new',
				firstSurfacedAt: now,
				lastSurfacedAt: now,
			};
		} else if (existing.status === 'new' || existing.status === 'seen') {
			// Refresh the lastSurfacedAt timestamp
			existing.lastSurfacedAt = now;
		}
	}
	return stateBag;
}

/** Counts insights with status 'new' (not snoozed, not dismissed). */
export function countNewInsights(stateBag: InsightStateBag, now: string): number {
	return Object.values(stateBag).filter(s => {
		if (s.status !== 'new') { return false; }
		if (s.snoozeUntil && s.snoozeUntil > now) { return false; }
		return true;
	}).length;
}

/**
 * Returns true when a toast notification is allowed.
 * Toast cadence: at most one per cadenceDays days.
 */
export function isToastAllowed(cadenceDays: number, lastNudgeAt: string | null, now: string): boolean {
	if (!lastNudgeAt) { return true; }
	const msSinceLastNudge = new Date(now).getTime() - new Date(lastNudgeAt).getTime();
	const msPerDay = 24 * 60 * 60 * 1000;
	return msSinceLastNudge >= cadenceDays * msPerDay;
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

function resolveStatus(
	existing: InsightState | undefined,
	cadenceDays: number,
	lastNudgeAt: string | null,
	now: string,
): InsightStatus {
	if (!existing) {
		return 'new';
	}
	// Respect terminal states
	if (existing.status === 'dismissed' || existing.status === 'done') {
		return existing.status;
	}
	// Check snooze expiry
	if (existing.status === 'snoozed') {
		if (existing.snoozeUntil && existing.snoozeUntil <= now) {
			// Snooze expired — resurface
			if (isToastAllowed(cadenceDays, lastNudgeAt, now)) {
				return 'new';
			}
			return 'seen';
		}
		return 'snoozed';
	}
	return existing.status;
}
