/**
 * Correction-moment detection (research feature).
 *
 * Scans a session's turns for moments where the conversation had to be
 * corrected — either the agent correcting itself after an error, or the user
 * correcting the agent:
 *
 * - `user-correction`       — heuristic patterns on the user message text
 *                             ("no, ...", "that's wrong", "not what I asked",
 *                             "undo/revert", "why did you", ...).
 * - `edit-retry`            — repeat edit to a file whose immediately preceding
 *                             tool call was an edit to the same file. Same
 *                             definition as modelEfficiency's "retry".
 * - `edit-self-correction`  — repeat edit to a file already edited earlier in
 *                             the same turn with other tool calls in between.
 *                             Same definition as modelEfficiency's
 *                             "self-correction".
 * - `tool-error`            — a tool call flagged as failed (`isError`), where
 *                             the session format records success/failure
 *                             (Copilot CLI JSONL). `retried` is set when the
 *                             same tool is called again later in the session.
 * - `agent-self-correction` — heuristic patterns on the assistant response text
 *                             ("my mistake", "let me fix", "you're right", ...),
 *                             only counted when corroborated by a tool-error,
 *                             edit-retry, or user-correction nearby (see
 *                             `corroboratedBy`) — the bare phrase alone is far
 *                             too common in ordinary task narration.
 *
 * The pattern-based detectors are heuristics and intentionally cheap — they
 * produce candidates, not verdicts. The edit-based detectors share their
 * definitions with modelEfficiency.ts so counts stay comparable.
 *
 * No editor's session logs carry an actual sentiment/feedback score, so two
 * cheap proxies are layered on top of `user-correction` instead: `intensity`
 * (shouting/punctuation/intensifier cues on the message itself) and
 * `escalated` (this correction lands within a few turns of the previous one,
 * i.e. corrections are clustering rather than one-off).
 *
 * Auto-injected editor/tool notifications (e.g. VS Code's background-terminal
 * "done" ping, which lands in the same field as a typed user message) are
 * excluded from `user-correction` matching — see `isHumanAuthored`.
 *
 * This module is intentionally pure (no VS Code API, no filesystem access) so
 * it can be unit-tested with mocked data and reused by the CLI and the webview.
 */
import type { CorrectionCounts, CorrectionMoment, CorrectionMomentType, CorrectionRepoGroup } from './types';
import { extractEditFilePath, isEditToolName } from './modelEfficiency';

// ---------------------------------------------------------------------------
// Input shape
// ---------------------------------------------------------------------------

/**
 * Minimal structural view of a chat turn needed for correction detection.
 * `ChatTurn` (types.ts) and the extended `EfficiencyTurn` (modelEfficiency.ts)
 * both satisfy this shape.
 */
export interface CorrectionTurn {
	userMessage?: string;
	assistantResponse?: string;
	timestamp?: string | null;
	toolCalls?: { toolName: string; arguments?: string; result?: string; isError?: boolean }[];
}

// ---------------------------------------------------------------------------
// Heuristic patterns
// ---------------------------------------------------------------------------

interface CorrectionPattern {
	re: RegExp;
	label: string;
}

/** User-message phrasings that indicate the user is correcting the agent. */
export const USER_CORRECTION_PATTERNS: CorrectionPattern[] = [
	{ re: /^\s*(no[,.!](?:\s|$)|nope\b)/i, label: "starts with 'no'" },
	{ re: /\bthat'?s (not|wrong|incorrect)/i, label: "'that's not/wrong/incorrect'" },
	{ re: /\bnot what i (asked|meant|wanted)/i, label: "'not what I asked/meant/wanted'" },
	{ re: /\byou('?re| are) wrong/i, label: "'you're wrong'" },
	{ re: /\bactually[,.]/i, label: "'actually,'" },
	{ re: /\b(undo|revert|roll ?back)\b/i, label: 'undo/revert/rollback' },
	{ re: /\bwhy did you\b/i, label: "'why did you'" },
	{ re: /\byou (broke|deleted|removed|overwrote|changed the wrong)/i, label: "'you broke/deleted/...'" },
	{ re: /\bi (already )?(said|told you|asked)\b/i, label: "'I said/told you/asked'" },
	{ re: /\bdon'?t (do that|change|touch|modify|commit)/i, label: "'don't do that/change/...'" },
	{ re: /\bstop (doing|changing|that|it)\b|^\s*stop[.!]/i, label: "'stop ...'" },
	{ re: /\bthat (doesn'?t|does not|didn'?t|did not) work/i, label: "'that didn't work'" },
	{ re: /\bwrong (file|function|approach|branch|repo|command)/i, label: "'wrong file/approach/...'" },
];

/** Assistant-message phrasings that indicate the agent admitting or fixing a mistake. */
export const AGENT_SELF_CORRECTION_PATTERNS: CorrectionPattern[] = [
	{ re: /\blet me (fix|correct|revert|redo|try (that |it )?again)/i, label: "'let me fix/correct/...'" },
	{ re: /\bmy (mistake|error|bad|apologies|fault)/i, label: "'my mistake/error/...'" },
	{ re: /\bi (was wrong|made a (mistake|error))/i, label: "'I was wrong / made a mistake'" },
	{ re: /\byou'?re (absolutely )?right/i, label: "'you're right'" },
	{ re: /\b(apologies|sorry)( for|,|\.|!)/i, label: 'apology' },
	{ re: /\bthat (failed|didn'?t work|was incorrect|was wrong)/i, label: "'that failed/didn't work/...'" },
	{ re: /\bi (incorrectly|mistakenly)\b/i, label: "'I incorrectly/mistakenly'" },
	{ re: /\bcorrecting (my|that|the above)/i, label: "'correcting ...'" },
];

/**
 * Text cues that make a `user-correction` message read as more heated than a plain
 * correction: shouting (an all-caps word), repeated `!`/`?`, or an explicit intensifier
 * ("again", "seriously", "for the last time"). Purely a proxy — no sentiment data is
 * available from any supported editor's session logs (see docs/features/CORRECTIONS.md).
 */
const INTENSITY_PATTERNS: RegExp[] = [
	/\b[A-Z]{3,}\b/, // a shouted word, e.g. "STOP" or "WHY"
	/[!?]{2,}/, // "??" / "!!" / "?!"
	/\b(again|seriously|for the (last|third|second) time)\b/i,
];

function hasIntensityCue(text: string): boolean {
	return INTENSITY_PATTERNS.some(re => re.test(text));
}

/**
 * Matches editor/tool-injected notifications that land in the `userMessage` field
 * without the user having typed anything — e.g. VS Code's background-terminal
 * "notification" message auto-sent into chat when a long-running command finishes.
 * Scanning these for correction phrases produces false positives (the boilerplate
 * "...or kill_terminal to stop it." reads as a `stop ...` correction) because the text
 * isn't authored by the human at all.
 */
const AUTO_NOTIFICATION_RE = /^\s*\[Terminal\b[^\]]*\bnotification\b/i;

function isHumanAuthored(text: string | undefined): text is string {
	return !!text && !AUTO_NOTIFICATION_RE.test(text);
}

// ---------------------------------------------------------------------------
// Detection
// ---------------------------------------------------------------------------

/** Hard cap on moments kept per session, so cached analyses stay small. */
export const MAX_MOMENTS_PER_SESSION = 50;

/** Maximum snippet length stored per moment. */
const SNIPPET_LENGTH = 240;

function makeSnippet(text: string, matchIndex = 0): string {
	const start = Math.max(0, matchIndex - 40);
	const snippet = text.slice(start, start + SNIPPET_LENGTH).replace(/\s+/g, ' ').trim();
	return (start > 0 ? '…' : '') + snippet + (start + SNIPPET_LENGTH < text.length ? '…' : '');
}

function matchPattern(text: string | undefined, patterns: CorrectionPattern[]): { label: string; index: number } | null {
	if (!text) { return null; }
	for (const p of patterns) {
		const m = p.re.exec(text);
		if (m) { return { label: p.label, index: m.index }; }
	}
	return null;
}

/**
 * Detect edit retries and edit self-corrections in one turn's ordered tool
 * calls, mirroring the definitions in modelEfficiency.analyzeTurnToolCalls.
 */
export interface CorrectionDetectionResult {
	moments: CorrectionMoment[];
	counts: CorrectionCounts;
}

interface CorrectionDetectionState extends CorrectionDetectionResult {
	openToolErrors: Map<string, CorrectionMoment>;
	/** Turn number of the most recent `user-correction` moment, for escalation clustering. */
	lastUserCorrectionTurn: number | null;
}

function retainMoment(state: CorrectionDetectionState, moment: CorrectionMoment): void {
	addMomentToCounts(state.counts, moment);
	if (state.moments.length < MAX_MOMENTS_PER_SESSION) {
		state.moments.push(moment);
		return;
	}
	if (moment.type !== 'user-correction') { return; }
	for (let i = state.moments.length - 1; i >= 0; i--) {
		if (state.moments[i].type !== 'user-correction') {
			state.moments[i] = moment;
			return;
		}
	}
}

/** Returns true when at least one edit-retry / edit-self-correction moment was recorded. */
function detectEditMoments(
	toolCalls: NonNullable<CorrectionTurn['toolCalls']>,
	turnNumber: number,
	timestamp: string | null,
	state: CorrectionDetectionState
): boolean {
	const editedFiles = new Set<string>();
	let lastEditFile: string | null = null;
	let unknownPathCounter = 0;
	let found = false;

	for (const call of toolCalls) {
		if (!isEditToolName(call.toolName)) {
			lastEditFile = null;
			continue;
		}
		const file = extractEditFilePath(call.arguments);
		// Edits without an extractable path get a unique placeholder so they never
		// produce false retry/self-correction positives (same as modelEfficiency).
		const key = file ?? `-${unknownPathCounter++}`;
		if (editedFiles.has(key)) {
			retainMoment(state, {
				type: lastEditFile === key ? 'edit-retry' : 'edit-self-correction',
				turnNumber,
				timestamp,
				snippet: file ? `Re-edited ${file}` : 'Re-edited a file (path unknown)',
				...(file ? { file } : {}),
			});
			found = true;
		}
		editedFiles.add(key);
		lastEditFile = key;
	}
	return found;
}

/**
 * Turns within this many turn-positions of an earlier `user-correction` count as the
 * same "cluster" for escalation purposes — corrections this close together read as
 * the user repeatedly pushing back rather than two unrelated one-off notes.
 */
const ESCALATION_WINDOW_TURNS = 4;

/**
 * Detect all correction moments in a session's turns.
 * Turn numbers are 1-based array positions, matching ChatTurn.turnNumber.
 */
export function detectCorrectionAnalysis(turns: CorrectionTurn[]): CorrectionDetectionResult {
	const state: CorrectionDetectionState = {
		moments: [],
		counts: createEmptyCorrectionCounts(),
		openToolErrors: new Map(),
		lastUserCorrectionTurn: null,
	};

	for (let i = 0; i < turns.length; i++) {
		const turn = turns[i];
		const turnNumber = i + 1;
		const timestamp = turn.timestamp ?? null;

		// Auto-injected editor/tool notifications (e.g. a background-terminal "done" ping)
		// aren't authored by the user — skip them so their boilerplate text can't match a
		// correction phrase.
		const userText = isHumanAuthored(turn.userMessage) ? turn.userMessage : undefined;
		const prevTurnHadUserCorrection = state.lastUserCorrectionTurn === turnNumber - 1;

		const userMatch = matchPattern(userText, USER_CORRECTION_PATTERNS);
		if (userMatch) {
			const escalated = state.lastUserCorrectionTurn !== null && turnNumber - state.lastUserCorrectionTurn <= ESCALATION_WINDOW_TURNS;
			retainMoment(state, {
				type: 'user-correction', turnNumber, timestamp,
				snippet: makeSnippet(userText!, userMatch.index),
				matchedPattern: userMatch.label,
				...(hasIntensityCue(userText!) ? { intensity: 'strong' } : {}),
				...(escalated ? { escalated: true } : {}),
			});
			state.lastUserCorrectionTurn = turnNumber;
		}

		const toolCalls = turn.toolCalls ?? [];
		let turnHasToolError = false;
		for (const call of toolCalls) {
			// A later call of the same tool marks an earlier failure as recovered.
			const openError = state.openToolErrors.get(call.toolName);
			if (openError) {
				openError.retried = true;
				state.counts.toolErrorsRetried++;
				state.openToolErrors.delete(call.toolName);
			}
			if (call.isError === true) {
				const moment: CorrectionMoment = {
					type: 'tool-error', turnNumber, timestamp,
					snippet: `Tool failed: ${call.toolName}`,
					tool: call.toolName,
					retried: false,
				};
				retainMoment(state, moment);
				state.openToolErrors.set(call.toolName, moment);
				turnHasToolError = true;
			}
		}

		const turnHasEditRetry = detectEditMoments(toolCalls, turnNumber, timestamp, state);

		// agent-self-correction phrasing ("let me fix", "you're right", ...) is extremely
		// common narration even when nothing actually went wrong, so it's only counted as a
		// correction moment when corroborated by an independent signal: a tool failure or
		// edit-retry in this turn, or a user-correction just before/in this turn.
		const agentMatch = matchPattern(turn.assistantResponse, AGENT_SELF_CORRECTION_PATTERNS);
		if (agentMatch) {
			const corroboratedBy: CorrectionMoment['corroboratedBy'] = turnHasToolError
				? 'tool-error'
				: turnHasEditRetry
					? 'edit-retry'
					: (prevTurnHadUserCorrection || userMatch !== null)
						? 'user-correction'
						: undefined;
			if (corroboratedBy) {
				retainMoment(state, {
					type: 'agent-self-correction', turnNumber, timestamp,
					snippet: makeSnippet(turn.assistantResponse!, agentMatch.index),
					matchedPattern: agentMatch.label,
					corroboratedBy,
				});
			}
		}
	}

	state.moments.sort((a, b) => a.turnNumber - b.turnNumber);
	return { moments: state.moments, counts: state.counts };
}

export function detectCorrectionMoments(turns: CorrectionTurn[]): CorrectionMoment[] {
	return detectCorrectionAnalysis(turns).moments;
}

// ---------------------------------------------------------------------------
// Counts
// ---------------------------------------------------------------------------

export function createEmptyCorrectionCounts(): CorrectionCounts {
	return { userCorrections: 0, editRetries: 0, editSelfCorrections: 0, toolErrors: 0, toolErrorsRetried: 0, agentSelfCorrections: 0, escalatedUserCorrections: 0 };
}

/** Fold one moment into the counter bucket. */
export function addMomentToCounts(counts: CorrectionCounts, moment: CorrectionMoment): void {
	switch (moment.type) {
		case 'user-correction':
			counts.userCorrections++;
			if (moment.escalated) { counts.escalatedUserCorrections++; }
			break;
		case 'edit-retry': counts.editRetries++; break;
		case 'edit-self-correction': counts.editSelfCorrections++; break;
		case 'tool-error':
			counts.toolErrors++;
			if (moment.retried) { counts.toolErrorsRetried++; }
			break;
		case 'agent-self-correction': counts.agentSelfCorrections++; break;
	}
}

/** Sum all moments of a session into counters. */
export function summarizeCorrectionMoments(moments: CorrectionMoment[]): CorrectionCounts {
	const counts = createEmptyCorrectionCounts();
	for (const m of moments) { addMomentToCounts(counts, m); }
	return counts;
}

/** Sum source counters into target (used when merging sessions into a period or repo). */
export function mergeCorrectionCounts(target: CorrectionCounts, source: CorrectionCounts | undefined): void {
	if (!source) { return; }
	target.userCorrections += source.userCorrections;
	target.editRetries += source.editRetries;
	target.editSelfCorrections += source.editSelfCorrections;
	target.toolErrors += source.toolErrors;
	target.toolErrorsRetried += source.toolErrorsRetried;
	target.agentSelfCorrections += source.agentSelfCorrections;
	target.escalatedUserCorrections += source.escalatedUserCorrections;
}

// ---------------------------------------------------------------------------
// Improvement prompt ("Ask Copilot to fix this")
// ---------------------------------------------------------------------------

/** Max number of moments included as concrete examples in a generated improvement prompt. */
export const MAX_PROMPT_EXAMPLES = 5;

/**
 * Ranks a moment for inclusion in an improvement prompt: escalated user-corrections first, then
 * "strong"-intensity ones, then any other user-correction, then everything else. User-corrections
 * are the clearest first-hand signal that something needed fixing, so they outrank heuristic
 * agent/tool signals of the same recency.
 */
function correctionPromptSeverity(moment: CorrectionMoment): number {
	if (moment.type !== 'user-correction') { return 0; }
	if (moment.escalated) { return 3; }
	if (moment.intensity === 'strong') { return 2; }
	return 1;
}

/**
 * Picks up to `limit` moments from a repo's scanned sessions to use as concrete examples in an
 * improvement prompt: highest-severity first (see `correctionPromptSeverity`), then most recent
 * — `repo.sessions` is already ordered most-recent-first (see `buildCorrectionReport`), and ties
 * within a session break by turn number, latest first.
 */
export function selectCorrectionPromptExamples(repo: CorrectionRepoGroup, limit = MAX_PROMPT_EXAMPLES): CorrectionMoment[] {
	const ranked = repo.sessions.flatMap((session, sessionIndex) =>
		session.moments.map(moment => ({ moment, sessionIndex }))
	);
	ranked.sort((a, b) =>
		correctionPromptSeverity(b.moment) - correctionPromptSeverity(a.moment)
		|| a.sessionIndex - b.sessionIndex
		|| b.moment.turnNumber - a.moment.turnNumber
	);
	return ranked.slice(0, limit).map(r => r.moment);
}

const CORRECTION_MOMENT_DESCRIPTIONS: Record<CorrectionMomentType, (m: CorrectionMoment) => string> = {
	'user-correction': m => `You corrected the agent: "${m.snippet}"`,
	'agent-self-correction': m => `The agent had to backtrack mid-task: "${m.snippet}"`,
	'tool-error': m => `A tool call failed${m.tool ? ` (${m.tool})` : ''}: "${m.snippet}"`,
	'edit-retry': m => `The agent immediately re-edited ${m.file ?? 'a file'} it had just edited: "${m.snippet}"`,
	'edit-self-correction': m => `The agent went back to re-edit ${m.file ?? 'a file'} it had already edited earlier in the same turn: "${m.snippet}"`,
};

/**
 * Builds a ready-to-paste prompt asking an AI coding assistant (GitHub Copilot Chat first) to
 * propose concrete workspace-setup improvements — instructions files, custom instructions,
 * prompt/chat-mode files — that would have prevented this repo's most notable correction moments.
 * Grounding the ask in real examples steers the assistant toward this repository's actual failure
 * modes instead of generic advice.
 */
export function buildCorrectionImprovementPrompt(repo: CorrectionRepoGroup): string {
	const examples = selectCorrectionPromptExamples(repo);
	const exampleLines = examples.map((m, i) => `${i + 1}. ${CORRECTION_MOMENT_DESCRIPTIONS[m.type](m)}`);
	return [
		`While working in this workspace ("${repo.repository}"), I or the AI had to correct course to get things done correctly. Examples from recent sessions:`,
		'',
		...exampleLines,
		'',
		"Please review this workspace's current setup — instructions files (e.g. .github/copilot-instructions.md, AGENTS.md), custom instructions, and prompt/chat-mode files — and propose specific, concrete changes that would prevent these kinds of corrections from being needed again. Base your suggestions on what is actually present in this repository rather than generic advice.",
	].join('\n');
}
