/**
 * Repeated-task detection (research feature).
 *
 * Clusters the first user prompt of each session to find tasks the user
 * keeps prompting for manually — candidates that would be better served by a
 * reusable skill, prompt file, or custom agent. Example: "run the tests and
 * fix the failures" typed at the start of five different sessions.
 *
 * Approach (deliberately cheap, no embeddings or LLM calls):
 * - Normalize each prompt: lowercase, strip punctuation, drop stopwords and
 *   very short tokens. Prompts that are already a slash command ("/fix ...")
 *   or too short to describe a task are excluded.
 * - Greedy clustering by Jaccard similarity on token sets (>= THRESHOLD).
 *   O(n²) over the analysis window's sessions, which is small in practice.
 * - A cluster with sessions in at least MIN_CLUSTER_SIZE distinct sessions is
 *   a repeated-task candidate.
 *
 * This module is intentionally pure (no VS Code API, no filesystem access) so
 * it can be unit-tested with mocked data and reused by the CLI and the webview.
 */
import type { RepeatedTaskCluster, RepeatedTaskSessionRef } from './types';

// ---------------------------------------------------------------------------
// Tunables
// ---------------------------------------------------------------------------

/** Minimum token-set Jaccard similarity for two prompts to cluster together. */
export const PROMPT_SIMILARITY_THRESHOLD = 0.5;

/** Minimum number of sessions in a cluster before it is reported. */
export const MIN_CLUSTER_SIZE = 2;

/** Prompts shorter than this (after trimming) carry no task signal. */
const MIN_PROMPT_LENGTH = 15;

/** Prompts are stored/compared truncated to this length. */
export const MAX_PROMPT_LENGTH = 500;

/** Representative prompt shown in the UI is truncated to this length. */
const REPRESENTATIVE_LENGTH = 200;

/** Common English words that carry no task identity. */
const STOPWORDS = new Set([
	'the', 'a', 'an', 'and', 'or', 'but', 'if', 'then', 'else', 'for', 'to', 'of', 'in', 'on', 'at',
	'by', 'with', 'from', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'it', 'this',
	'that', 'these', 'those', 'i', 'me', 'my', 'we', 'you', 'your', 'they', 'them', 'their', 'he',
	'she', 'his', 'her', 'do', 'does', 'did', 'done', 'can', 'could', 'should', 'would', 'will',
	'shall', 'may', 'might', 'must', 'not', 'no', 'yes', 'please', 'also', 'just', 'so', 'than',
	'then', 'there', 'here', 'when', 'where', 'which', 'who', 'what', 'how', 'why', 'all', 'any',
	'some', 'into', 'out', 'up', 'down', 'over', 'under', 'again', 'once', 'now', 'still', 'make',
	'sure', 'let', 'us', 'go', 'ahead', 'ok', 'okay', 'thanks', 'thank', 'hi', 'hello', 'hey',
]);

// ---------------------------------------------------------------------------
// Normalization
// ---------------------------------------------------------------------------

/** A session's prompt plus the display context needed for the report. */
export interface RepeatedTaskInput {
	prompt: string;
	session: RepeatedTaskSessionRef;
}

/**
 * Normalize a raw prompt into a set of content tokens.
 * Returns null when the prompt should be excluded entirely (slash commands —
 * already a reusable invocation — and prompts too short to describe a task).
 */
export function normalizePromptTokens(prompt: string): Set<string> | null {
	const trimmed = prompt.trim();
	if (trimmed.length < MIN_PROMPT_LENGTH || trimmed.startsWith('/')) { return null; }
	const tokens = trimmed
		.slice(0, MAX_PROMPT_LENGTH)
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, ' ')
		.split(/\s+/)
		.filter(t => t.length >= 3 && !STOPWORDS.has(t));
	if (tokens.length === 0) { return null; }
	return new Set(tokens);
}

/** Jaccard similarity of two token sets: |intersection| / |union|. */
export function tokenSimilarity(a: Set<string>, b: Set<string>): number {
	let intersection = 0;
	for (const t of a) { if (b.has(t)) { intersection++; } }
	const union = a.size + b.size - intersection;
	return union === 0 ? 0 : intersection / union;
}

// ---------------------------------------------------------------------------
// Clustering
// ---------------------------------------------------------------------------

/** Tokens shared by every member of the cluster, capped for display. */
function sharedKeywords(membersTokens: Set<string>[]): string[] {
	if (membersTokens.length === 0) { return []; }
	const counts = new Map<string, number>();
	for (const tokens of membersTokens) {
		for (const t of tokens) { counts.set(t, (counts.get(t) ?? 0) + 1); }
	}
	return [...counts.entries()]
		.filter(([, n]) => n === membersTokens.length)
		.sort((a, b) => b[0].length - a[0].length)
		.slice(0, 8)
		.map(([t]) => t);
}

/**
 * Cluster session prompts into repeated-task candidates.
 * Returns clusters largest-first; each cluster's sessions are most-recent-first.
 */
export function detectRepeatedTasks(inputs: RepeatedTaskInput[]): RepeatedTaskCluster[] {
	interface Member { input: RepeatedTaskInput; tokens: Set<string>; }
	const clusters: { members: Member[]; centroid: Set<string> }[] = [];

	for (const input of inputs) {
		const tokens = normalizePromptTokens(input.prompt);
		if (!tokens) { continue; }
		// Greedy: join the first cluster whose centroid is similar enough.
		const target = clusters.find(c => tokenSimilarity(c.centroid, tokens) >= PROMPT_SIMILARITY_THRESHOLD);
		if (target) {
			target.members.push({ input, tokens });
			// Centroid = tokens appearing in a strict majority of members keeps the
			// cluster stable as it grows instead of drifting toward new members.
			const counts = new Map<string, number>();
			for (const m of target.members) { for (const t of m.tokens) { counts.set(t, (counts.get(t) ?? 0) + 1); } }
			const majority = Math.floor(target.members.length / 2) + 1;
			target.centroid = new Set([...counts.entries()].filter(([, n]) => n >= majority).map(([t]) => t));
		} else {
			clusters.push({ members: [{ input, tokens }], centroid: tokens });
		}
	}

	return clusters
		.filter(c => c.members.length >= MIN_CLUSTER_SIZE)
		.map(c => {
			const sessions = c.members
				.map(m => m.input.session)
				.sort((a, b) => (b.lastInteraction ?? '').localeCompare(a.lastInteraction ?? ''));
			const repositories = [...new Set(sessions.map(s => s.repository).filter((r): r is string => !!r))].sort();
			const representative = sessions[0];
			const representativeInput = c.members.find(m => m.input.session === representative)!.input.prompt.trim();
			return {
				representativePrompt: representativeInput.length > REPRESENTATIVE_LENGTH
					? representativeInput.slice(0, REPRESENTATIVE_LENGTH).replace(/\s+\S*$/, '') + '…'
					: representativeInput,
				sessionCount: c.members.length,
				repositories,
				sessions,
				sharedKeywords: sharedKeywords(c.members.map(m => m.tokens)),
			};
		})
		.sort((a, b) => b.sessionCount - a.sessionCount);
}
