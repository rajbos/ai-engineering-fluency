/**
 * Task classification — buckets a session into a single dominant task category
 * using keyword + tool-usage heuristics (issue #1650).
 *
 * Design notes:
 * - `classifySessionTask()` is a pure function operating on a small, adapter-agnostic
 *   input shape (`TaskClassificationInput`) so it can run over data already produced
 *   by the existing parsing/enrichment pipeline (`usageAnalysis.ts`'s `toolCalls.byTool`,
 *   or the log viewer's `ChatTurn[]`) without re-parsing session files.
 * - Two builder helpers adapt the existing shared types to that input:
 *   - `buildClassificationInputFromUsageAnalysis()` — lightweight path used during
 *     session caching (`getSessionFileDataCached`). Only tool names + the session
 *     title (already extracted for free during metadata parsing) are available, so
 *     terminal command text isn't inspected here.
 *   - `buildClassificationInputFromChatTurns()` — richer path used by the log viewer,
 *     where full per-turn user text and tool-call arguments (e.g. terminal commands)
 *     are already reconstructed.
 * - Priority order (most specific → least specific) is intentionally pragmatic:
 *   terminal-command keyword matches (Git Ops / Build-Deploy / Testing) win over
 *   generic tool-based categories because they're stronger, less ambiguous signals.
 *   Keyword-based categories (Debugging / Refactoring / Feature Dev) only apply when
 *   there IS tool activity (so plain chit-chat mentioning "fix" isn't miscategorized).
 *   Conversation is the fallback only when there are zero tool calls and no strong
 *   keyword match fired.
 */

import type { SessionUsageAnalysis, ChatTurn } from './types';

export type TaskCategory =
	| 'Coding'
	| 'Debugging'
	| 'Feature Dev'
	| 'Refactoring'
	| 'Testing'
	| 'Exploration'
	| 'Planning'
	| 'Delegation'
	| 'Git Ops'
	| 'Build/Deploy'
	| 'Brainstorming'
	| 'Conversation';

/** Adapter-agnostic input for `classifySessionTask()`. */
export interface TaskClassificationInput {
	/** Tool names invoked during the session (e.g. `toolCalls.byTool` keys, or per-turn tool names). */
	toolNames: string[];
	/** Raw command/argument text passed to terminal-style tool calls, when available. */
	terminalCommands?: string[];
	/** Free-form text to scan for intent keywords — session title, first user message, or concatenated user messages. */
	userText?: string;
}

const EDIT_TOOL_PATTERN = /edit|write|create_?file|replace_?string|str_replace|apply_?patch|patch/i;
const READ_TOOL_PATTERN = /read_?file|grep_?search|file_?search|search|glob|list_dir|websearch|fetch/i;
const TERMINAL_TOOL_PATTERN = /terminal|bash|shell|run_?command/i;
const PLANNING_TOOL_PATTERN = /todo|task[-_]?create|enterplanmode|\bplan\b/i;
/** Exported so other modules (e.g. `maturityScoring.ts`) can detect delegation/sub-agent tool
 *  calls without duplicating the pattern. Matches the sub-agent/delegate tools across adapters:
 *  Copilot CLI's `task` + background-agent tools (`read_agent`/`write_agent`/`list_agents`),
 *  the Copilot App's session-spawning tools (`create_session`/`open_pr_session`/`open_issue_session`/`fork_session`),
 *  Claude Code/Desktop's `Task`/`Agent` tools, MCP `spawn_task`/`spawn_agent` tools (e.g.
 *  `mcp__ccd_session__spawn_task`), VS Code Chat's `runSubagent`, and similar delegate tools. */
export const DELEGATION_TOOL_PATTERN = /^(task|agent|read_agent|write_agent|list_agents|create_session|open_pr_session|open_issue_session|fork_session)$|subagent|sub[-_]?agent|agent[-_]?spawn|spawn[-_]?(task|agent)|delegate/i;

/** Sums tool-call counts for tools matching `DELEGATION_TOOL_PATTERN` (e.g. `toolCalls.byTool`
 *  or `mcpTools.byTool` from a `UsageAnalysisPeriod` — MCP `spawn_task`/`spawn_agent` tools are
 *  delegation too). Used as an adapter-agnostic signal for sub-agent delegation
 *  volume, independent of the per-session `Delegation` task-category classification above. */
export function countDelegationToolCalls(byTool: Record<string, number>): number {
	let total = 0;
	for (const [tool, count] of Object.entries(byTool)) {
		if (DELEGATION_TOOL_PATTERN.test(tool)) { total += count; }
	}
	return total;
}
const TEST_TOOL_PATTERN = /run_?tests?|pytest|vitest|jest/i;

const GIT_KEYWORD_PATTERN = /\bgit\s+(push|commit|merge|pull|rebase|checkout|clone)\b/i;
const BUILD_KEYWORD_PATTERN = /\b(npm\s+run\s+build|docker\s+(build|run|compose)|pm2|webpack|esbuild|make\s+build|deploy(ment)?)\b/i;
const TEST_KEYWORD_PATTERN = /\b(pytest|vitest|jest|npm\s+(run\s+)?test|go\s+test|dotnet\s+test|mocha)\b/i;
const DEBUG_KEYWORD_PATTERN = /\b(fix(ing|ed)?|bug|error|debug(ging)?|broken|crash(ing|ed)?|fail(ing|ed|ure)?|issue)\b/i;
const REFACTOR_KEYWORD_PATTERN = /\b(refactor(ing)?|rename|simplify|restructure|clean\s?up)\b/i;
const FEATURE_KEYWORD_PATTERN = /\b(add|create|implement|build|new feature)\b/i;
const PLANNING_KEYWORD_PATTERN = /\b(plan|roadmap|outline|todo list|task list)\b/i;
const BRAINSTORM_KEYWORD_PATTERN = /\b(brainstorm|what if|design|explore ideas?|thinking about)\b/i;

/** Derived boolean/text signals used by the priority checks below. Kept in one place so each check function stays small. */
interface ClassificationSignals {
	hasToolCalls: boolean;
	hasEditTools: boolean;
	hasReadTools: boolean;
	hasTerminalTools: boolean;
	hasPlanningTools: boolean;
	hasDelegationTools: boolean;
	hasTestTools: boolean;
	terminalText: string;
	userText: string;
}

function deriveSignals(input: TaskClassificationInput): ClassificationSignals {
	const toolNames = (input.toolNames ?? []).map(t => t.toLowerCase());
	return {
		hasToolCalls: toolNames.length > 0,
		hasEditTools: toolNames.some(t => EDIT_TOOL_PATTERN.test(t)),
		hasReadTools: toolNames.some(t => READ_TOOL_PATTERN.test(t)),
		hasTerminalTools: toolNames.some(t => TERMINAL_TOOL_PATTERN.test(t)),
		hasPlanningTools: toolNames.some(t => PLANNING_TOOL_PATTERN.test(t)),
		hasDelegationTools: toolNames.some(t => DELEGATION_TOOL_PATTERN.test(t)),
		hasTestTools: toolNames.some(t => TEST_TOOL_PATTERN.test(t)),
		terminalText: (input.terminalCommands ?? []).join(' ').toLowerCase(),
		userText: (input.userText ?? '').toLowerCase(),
	};
}

/** Priority 1-5: strong, unambiguous terminal-command and dedicated-tool signals. */
function classifyByToolAndTerminalSignals(s: ClassificationSignals): TaskCategory | null {
	if (GIT_KEYWORD_PATTERN.test(s.terminalText)) { return 'Git Ops'; }
	if (BUILD_KEYWORD_PATTERN.test(s.terminalText)) { return 'Build/Deploy'; }
	if (TEST_KEYWORD_PATTERN.test(s.terminalText) || s.hasTestTools) { return 'Testing'; }
	if (s.hasDelegationTools) { return 'Delegation'; }
	if (s.hasPlanningTools) { return 'Planning'; }
	return null;
}

/** Priority 6-8: keyword matches that only count as a signal when there IS tool activity (not idle chatter). */
function classifyByActivityKeywords(s: ClassificationSignals): TaskCategory | null {
	if (!s.hasToolCalls) { return null; }
	if (DEBUG_KEYWORD_PATTERN.test(s.userText)) { return 'Debugging'; }
	// Checked before Feature Dev since "refactor" is the more specific term.
	if (REFACTOR_KEYWORD_PATTERN.test(s.userText)) { return 'Refactoring'; }
	if (FEATURE_KEYWORD_PATTERN.test(s.userText)) { return 'Feature Dev'; }
	return null;
}

/** Priority 9-13: remaining fallbacks — planning-by-keyword, exploration, coding, brainstorming, conversation. */
function classifyByFallback(s: ClassificationSignals): TaskCategory {
	// Planning by keyword — only when no edit tools contradict it.
	if (!s.hasEditTools && PLANNING_KEYWORD_PATTERN.test(s.userText)) { return 'Planning'; }
	// Exploration — only read/search tool calls, no edits or terminal usage.
	if (s.hasToolCalls && s.hasReadTools && !s.hasEditTools && !s.hasTerminalTools) { return 'Exploration'; }
	// Coding — edit/write tool calls present, no stronger signal matched above.
	if (s.hasEditTools) { return 'Coding'; }
	// Brainstorming — no tool calls (or only exploration) + brainstorming keywords.
	if ((!s.hasToolCalls || s.hasReadTools) && BRAINSTORM_KEYWORD_PATTERN.test(s.userText)) { return 'Brainstorming'; }
	// Conversation — fallback when there are zero tool calls and no keyword matched.
	if (!s.hasToolCalls) { return 'Conversation'; }
	// Any remaining tool-call session with no stronger signal (e.g. terminal-only, no keyword match).
	return 'Coding';
}

/** Classifies a session into a single dominant `TaskCategory` using keyword + tool-usage heuristics. */
export function classifySessionTask(input: TaskClassificationInput): TaskCategory {
	const signals = deriveSignals(input);
	return classifyByToolAndTerminalSignals(signals) ?? classifyByActivityKeywords(signals) ?? classifyByFallback(signals);
}

/**
 * Lightweight builder used during session caching (`getSessionFileDataCached`).
 * Only tool names (from `toolCalls.byTool` + `mcpTools.byTool`, the latter for MCP
 * spawn_task/spawn_agent delegation tools) and the already-extracted session title
 * are available at this stage — no raw terminal command text.
 */
export function buildClassificationInputFromUsageAnalysis(
	usageAnalysis: Pick<SessionUsageAnalysis, 'toolCalls'> & Partial<Pick<SessionUsageAnalysis, 'mcpTools'>> | undefined,
	userText?: string | null
): TaskClassificationInput {
	const toolNames = usageAnalysis ? Object.keys(usageAnalysis.toolCalls?.byTool ?? {}) : [];
	// MCP spawn_task/spawn_agent tools (e.g. Claude Desktop's mcp__ccd_session__spawn_task) are
	// delegation signals too; other MCP tools can't match the anchored delegation alternatives.
	const mcpToolNames = usageAnalysis?.mcpTools ? Object.keys(usageAnalysis.mcpTools.byTool ?? {}) : [];
	return { toolNames: [...toolNames, ...mcpToolNames], userText: userText ?? undefined };
}

/**
 * Richer builder used by the log viewer, where full per-turn user messages and
 * tool-call arguments (e.g. terminal commands) are already reconstructed as `ChatTurn[]`.
 */
export function buildClassificationInputFromChatTurns(turns: ChatTurn[]): TaskClassificationInput {
	const toolNames: string[] = [];
	const terminalCommands: string[] = [];
	const userTextParts: string[] = [];
	for (const turn of turns) {
		if (turn.userMessage) { userTextParts.push(turn.userMessage); }
		for (const tc of turn.toolCalls ?? []) {
			toolNames.push(tc.toolName);
			if (tc.arguments && TERMINAL_TOOL_PATTERN.test(tc.toolName.toLowerCase())) {
				terminalCommands.push(tc.arguments);
			}
		}
	}
	return { toolNames, terminalCommands, userText: userTextParts.join(' ') };
}

export default { classifySessionTask, buildClassificationInputFromUsageAnalysis, buildClassificationInputFromChatTurns, countDelegationToolCalls };
