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
 *                             ("my mistake", "let me fix", "you're right", ...).
 *
 * The pattern-based detectors are heuristics and intentionally cheap — they
 * produce candidates, not verdicts. The edit-based detectors share their
 * definitions with modelEfficiency.ts so counts stay comparable.
 *
 * This module is intentionally pure (no VS Code API, no filesystem access) so
 * it can be unit-tested with mocked data and reused by the CLI and the webview.
 */
import type { CorrectionCounts, CorrectionMoment } from './types';
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

function detectEditMoments(
	toolCalls: NonNullable<CorrectionTurn['toolCalls']>,
	turnNumber: number,
	timestamp: string | null,
	state: CorrectionDetectionState
): void {
	const editedFiles = new Set<string>();
	let lastEditFile: string | null = null;
	let unknownPathCounter = 0;

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
		}
		editedFiles.add(key);
		lastEditFile = key;
	}
}

/**
 * Detect all correction moments in a session's turns.
 * Turn numbers are 1-based array positions, matching ChatTurn.turnNumber.
 */
export function detectCorrectionAnalysis(turns: CorrectionTurn[]): CorrectionDetectionResult {
	const state: CorrectionDetectionState = {
		moments: [],
		counts: createEmptyCorrectionCounts(),
		openToolErrors: new Map(),
	};

	for (let i = 0; i < turns.length; i++) {
		const turn = turns[i];
		const turnNumber = i + 1;
		const timestamp = turn.timestamp ?? null;

		const userMatch = matchPattern(turn.userMessage, USER_CORRECTION_PATTERNS);
		if (userMatch) {
			retainMoment(state, {
				type: 'user-correction', turnNumber, timestamp,
				snippet: makeSnippet(turn.userMessage!, userMatch.index),
				matchedPattern: userMatch.label,
			});
		}

		const agentMatch = matchPattern(turn.assistantResponse, AGENT_SELF_CORRECTION_PATTERNS);
		if (agentMatch) {
			retainMoment(state, {
				type: 'agent-self-correction', turnNumber, timestamp,
				snippet: makeSnippet(turn.assistantResponse!, agentMatch.index),
				matchedPattern: agentMatch.label,
			});
		}

		const toolCalls = turn.toolCalls ?? [];
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
			}
		}

		detectEditMoments(toolCalls, turnNumber, timestamp, state);
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
	return { userCorrections: 0, editRetries: 0, editSelfCorrections: 0, toolErrors: 0, toolErrorsRetried: 0, agentSelfCorrections: 0 };
}

/** Fold one moment into the counter bucket. */
export function addMomentToCounts(counts: CorrectionCounts, moment: CorrectionMoment): void {
	switch (moment.type) {
		case 'user-correction': counts.userCorrections++; break;
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
}
