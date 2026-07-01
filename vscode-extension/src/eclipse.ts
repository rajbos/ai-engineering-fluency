/**
 * Eclipse IDE GitHub Copilot data access layer.
 *
 * The GitHub Copilot plugin for Eclipse (`com.microsoft.copilot.eclipse.*`)
 * stores each conversation as a single JSON file under the workspace metadata:
 *
 *   <eclipse-workspace>/.metadata/.plugins/com.microsoft.copilot.eclipse.core/
 *     conversations/<username>/<conversationId>.json
 *     conversations/<username>/conversation_index.xml
 *
 * Because the Eclipse workspace location is user-configurable, the conversations
 * can live under any workspace root. We discover candidate roots from:
 *   1. The default `~/eclipse-workspace`.
 *   2. `RECENT_WORKSPACES` entries in any
 *      `~/eclipse/<package>/eclipse/configuration/.settings/org.eclipse.ui.ide.prefs`.
 *
 * The JSON does NOT carry actual API token counts, so token figures are
 * best-effort estimates from message text (same approach as JetBrains and
 * Continue). A model identifier IS present per turn
 * (`message.model` / `reply.modelName`).
 *
 * Schema (one conversation file):
 *   {
 *     conversationId, title, requesterUsername, responderUsername,
 *     creationDate, lastMessageDate,
 *     turns: [
 *       // user record
 *       { role: "user", turnId, timestamp, message: { text },
 *         currentDocument: { uri }, references: [], model, chatMode,
 *         customChatModeId, source, userLanguage },
 *       // copilot record (same turnId as the preceding user record)
 *       { role: "copilot", turnId, timestamp, suggestedTitle,
 *         reply: { editAgentRounds: [ { roundId, reply, toolCalls: [] } ],
 *                  modelName, billingMultiplier, reasoningEffort } }
 *     ]
 *   }
 */
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { ModelUsage } from './types';
import { normalizePathForComparison } from './workspaceHelpers';
import { estimateTokensFromText } from './tokenEstimation';

/** Path fragment that unambiguously identifies an Eclipse Copilot session file. */
const ECLIPSE_MARKER = 'com.microsoft.copilot.eclipse';

/** Relative path from a workspace root to the Copilot conversations directory. */
const CONVERSATIONS_REL = path.join(
	'.metadata', '.plugins', 'com.microsoft.copilot.eclipse.core', 'conversations'
);

export interface EclipseTurn {
	userText: string;
	assistantText: string;
	model: string | null;
	/** Eclipse chat mode for the user record (e.g. "agent", "ask", "edit"). */
	mode: string | null;
	/** Reasoning effort reported on the copilot reply (e.g. "medium"), when present. */
	reasoningEffort: string | null;
	/** ISO-8601 timestamp of the user record. */
	timestamp: string | null;
	/** Active document URI captured with the user record, when present. */
	currentDocumentUri: string | null;
	toolCalls: Array<{ toolName: string; arguments?: string; result?: string }>;
	inputTokens: number;
	outputTokens: number;
}

export class EclipseDataAccess {
	/**
	 * Default Eclipse workspace directory (`~/eclipse-workspace`).
	 */
	getDefaultWorkspaceRoot(): string {
		return path.join(os.homedir(), 'eclipse-workspace');
	}

	/**
	 * Directory that holds Eclipse installations (`~/eclipse`), each of which
	 * carries a `configuration/.settings/org.eclipse.ui.ide.prefs` listing the
	 * recently opened workspaces.
	 */
	getEclipseInstallsRoot(): string {
		return path.join(os.homedir(), 'eclipse');
	}

	/**
	 * Returns true for any path that belongs to the Eclipse Copilot plugin.
	 * Normalises backslashes before checking so it works on Windows.
	 */
	isEclipseSessionFile(filePath: string): boolean {
		const normalized = normalizePathForComparison(filePath);
		return normalized.includes(ECLIPSE_MARKER) && normalized.endsWith('.json');
	}

	/**
	 * Discover candidate Eclipse workspace roots.
	 *
	 * Always includes the default `~/eclipse-workspace`, then augments with any
	 * `RECENT_WORKSPACES` entries parsed from Eclipse install preferences.
	 */
	async getWorkspaceRoots(): Promise<string[]> {
		const roots = new Set<string>();
		roots.add(this.getDefaultWorkspaceRoot());
		for (const ws of await this.readRecentWorkspaces()) {
			roots.add(ws);
		}
		return [...roots];
	}

	/**
	 * Parse `RECENT_WORKSPACES` from every
	 * `~/eclipse/<package>/eclipse/configuration/.settings/org.eclipse.ui.ide.prefs`.
	 * Java properties escape backslashes and colons; we unescape them here.
	 */
	private async readRecentWorkspaces(): Promise<string[]> {
		const installsRoot = this.getEclipseInstallsRoot();
		let packages: string[];
		try {
			packages = await fs.promises.readdir(installsRoot);
		} catch {
			return [];
		}
		const results: string[] = [];
		for (const pkg of packages) {
			const prefsPath = path.join(
				installsRoot, pkg, 'eclipse', 'configuration', '.settings', 'org.eclipse.ui.ide.prefs'
			);
			results.push(...await this.parseRecentWorkspacesFromPrefs(prefsPath));
		}
		return results;
	}

	/** Parse the `RECENT_WORKSPACES` entries out of a single prefs file. */
	private async parseRecentWorkspacesFromPrefs(prefsPath: string): Promise<string[]> {
		let content: string;
		try {
			content = await fs.promises.readFile(prefsPath, 'utf8');
		} catch {
			return [];
		}
		const match = /^RECENT_WORKSPACES=(.*)$/m.exec(content);
		if (!match) { return []; }
		// Multiple workspaces are separated by an escaped newline ("\\n").
		return match[1]
			.split('\\n')
			.map(entry => this.unescapeJavaPropertyValue(entry))
			.filter(Boolean);
	}

	/** Unescape a Java `.properties` value (handles `\\`, `\:`, `\=`). */
	private unescapeJavaPropertyValue(value: string): string {
		return value
			.replace(/\\:/g, ':')
			.replace(/\\=/g, '=')
			.replace(/\\\\/g, '\\')
			.trim();
	}

	/**
	 * Discover all Eclipse Copilot conversation files across every known
	 * workspace root. Returns absolute `.json` file paths (the
	 * `conversation_index.xml` files are skipped).
	 */
	async discoverEclipseSessions(): Promise<string[]> {
		const sessions: string[] = [];
		for (const root of await this.getWorkspaceRoots()) {
			const conversationsDir = path.join(root, CONVERSATIONS_REL);
			sessions.push(...await this.discoverSessionsInDir(conversationsDir));
		}
		return sessions;
	}

	/** Enumerate `<conversations>/<user>/*.json` files under one conversations directory. */
	private async discoverSessionsInDir(conversationsDir: string): Promise<string[]> {
		let userDirs: fs.Dirent[];
		try {
			userDirs = await fs.promises.readdir(conversationsDir, { withFileTypes: true });
		} catch {
			return [];
		}
		const sessions: string[] = [];
		for (const userDir of userDirs) {
			if (!userDir.isDirectory()) { continue; }
			const userPath = path.join(conversationsDir, userDir.name);
			let files: string[];
			try {
				files = await fs.promises.readdir(userPath);
			} catch {
				continue;
			}
			for (const file of files) {
				if (file.endsWith('.json')) {
					sessions.push(path.join(userPath, file));
				}
			}
		}
		return sessions;
	}

	/**
	 * Diagnostic candidate paths (the conversations directory under each known
	 * workspace root). Surfaced in the Diagnostics panel's "Scanned Paths" table.
	 */
	async getDiagnosticCandidatePaths(): Promise<string[]> {
		const roots = await this.getWorkspaceRoots();
		return roots.map(root => path.join(root, CONVERSATIONS_REL));
	}

	private async readSession(filePath: string): Promise<any | null> {
		try {
			const content = await fs.promises.readFile(filePath, 'utf8');
			return JSON.parse(content);
		} catch {
			return null;
		}
	}

	/** Session id (the conversation UUID = file basename without extension). */
	getEclipseSessionId(filePath: string): string {
		return path.basename(filePath, '.json');
	}

	private estimate(text: string): number {
		if (!text) { return 0; }
		return estimateTokensFromText(text);
	}

	/** Extract the user prompt text from a user-role turn record. */
	private userText(turn: any): string {
		const text = turn?.message?.text;
		return typeof text === 'string' ? text : '';
	}

	/** Concatenate the assistant reply text from a copilot-role turn record. */
	private assistantText(turn: any): string {
		const rounds = turn?.reply?.editAgentRounds;
		if (!Array.isArray(rounds)) { return ''; }
		return rounds
			.map((r: any) => (typeof r?.reply === 'string' ? r.reply : ''))
			.filter(Boolean)
			.join('\n');
	}

	/** Collect tool calls from a copilot-role turn's edit-agent rounds. */
	private toolCallsFromTurn(turn: any): Array<{ toolName: string; arguments?: string; result?: string }> {
		const rounds = turn?.reply?.editAgentRounds;
		if (!Array.isArray(rounds)) { return []; }
		const calls: Array<{ toolName: string; arguments?: string; result?: string }> = [];
		for (const round of rounds) {
			if (!Array.isArray(round?.toolCalls)) { continue; }
			for (const tc of round.toolCalls) {
				calls.push(this.normalizeToolCall(tc));
			}
		}
		return calls;
	}

	/** Normalise a raw Eclipse tool-call object into the shared toolCall shape. */
	private normalizeToolCall(tc: any): { toolName: string; arguments?: string; result?: string } {
		const fn = tc?.function ?? {};
		const toolName: string = tc?.name || tc?.toolName || fn.name || 'unknown';
		return {
			toolName,
			arguments: this.stringifyArgs(tc?.arguments ?? fn.arguments),
			result: this.strOrNull(tc?.result) ?? undefined,
		};
	}

	/** Coerce a tool-call arguments value to a string (JSON-stringifying objects). */
	private stringifyArgs(rawArgs: unknown): string | undefined {
		if (typeof rawArgs === 'string') { return rawArgs; }
		if (rawArgs) { return JSON.stringify(rawArgs); }
		return undefined;
	}

	/** Return the value when it is a string, otherwise null. */
	private strOrNull(value: unknown): string | null {
		return typeof value === 'string' ? value : null;
	}

	/**
	 * Estimated token counts for a session (input + output text). Eclipse files
	 * carry no actual API token counts, so thinkingTokens is always 0.
	 */
	async getTokensFromEclipseSession(filePath: string): Promise<{ tokens: number; thinkingTokens: number }> {
		const session = await this.readSession(filePath);
		if (!session || !Array.isArray(session.turns)) {
			return { tokens: 0, thinkingTokens: 0 };
		}
		let total = 0;
		for (const turn of session.turns) {
			if (turn?.role === 'user') {
				total += this.estimate(this.userText(turn));
			} else if (turn?.role === 'copilot') {
				total += this.estimate(this.assistantText(turn));
			}
		}
		return { tokens: total, thinkingTokens: 0 };
	}

	/** Count user interactions (one per `role: "user"` turn record). */
	async countEclipseInteractions(filePath: string): Promise<number> {
		const session = await this.readSession(filePath);
		if (!session || !Array.isArray(session.turns)) { return 0; }
		return session.turns.filter((t: any) => t?.role === 'user').length;
	}

	/**
	 * Per-model token usage. The model name is read from the user record
	 * (`model`) with a fallback to the copilot reply (`reply.modelName`).
	 */
	async getEclipseModelUsage(filePath: string): Promise<ModelUsage> {
		const session = await this.readSession(filePath);
		if (!session || !Array.isArray(session.turns)) { return {}; }
		const usage: ModelUsage = {};
		const turns: any[] = session.turns;
		for (let i = 0; i < turns.length; i++) {
			const turn = turns[i];
			if (turn?.role !== 'user') { continue; }
			const reply = this.findCopilotReply(turns, i, turn?.turnId);
			const model: string = turn?.model || reply?.reply?.modelName || 'unknown';
			if (!usage[model]) { usage[model] = { inputTokens: 0, outputTokens: 0 }; }
			usage[model].inputTokens += this.estimate(this.userText(turn));
			usage[model].outputTokens += this.estimate(this.assistantText(reply));
		}
		return usage;
	}

	/**
	 * Find the copilot reply record that pairs with the user record at index
	 * `userIndex`. Pairs share the same `turnId`; falls back to the next
	 * copilot-role record when ids are missing.
	 */
	private findCopilotReply(turns: any[], userIndex: number, turnId: string | undefined): any | null {
		for (let j = userIndex + 1; j < turns.length; j++) {
			const candidate = turns[j];
			if (candidate?.role === 'user') { break; }
			if (candidate?.role === 'copilot') {
				if (!turnId || candidate?.turnId === turnId || !candidate?.turnId) {
					return candidate;
				}
			}
		}
		return null;
	}

	/** Read lightweight session metadata for list / detail views. */
	async getEclipseSessionMeta(filePath: string): Promise<{
		title?: string;
		conversationId?: string;
		requester?: string;
		creationDate?: string;
		lastMessageDate?: string;
		model?: string;
		mode?: string;
	} | null> {
		const session = await this.readSession(filePath);
		if (!session) { return null; }
		const firstUser = Array.isArray(session.turns)
			? session.turns.find((t: any) => t?.role === 'user')
			: undefined;
		return {
			title: session.title as string | undefined,
			conversationId: session.conversationId as string | undefined,
			requester: session.requesterUsername as string | undefined,
			creationDate: session.creationDate as string | undefined,
			lastMessageDate: session.lastMessageDate as string | undefined,
			model: (firstUser?.model as string | undefined),
			mode: (firstUser?.chatMode as string | undefined),
		};
	}

	/**
	 * Build paired chat turns for the log viewer. Each user record is merged
	 * with its matching copilot reply (same `turnId`) into a single turn.
	 */
	async buildEclipseTurns(filePath: string): Promise<EclipseTurn[]> {
		const session = await this.readSession(filePath);
		if (!session || !Array.isArray(session.turns)) { return []; }
		const turns: any[] = session.turns;
		const result: EclipseTurn[] = [];
		for (let i = 0; i < turns.length; i++) {
			if (turns[i]?.role !== 'user') { continue; }
			const reply = this.findCopilotReply(turns, i, turns[i]?.turnId);
			result.push(this.buildTurn(turns[i], reply));
		}
		return result;
	}

	/** Merge a user record with its paired copilot reply into one chat turn. */
	private buildTurn(turn: any, reply: any): EclipseTurn {
		const userText = this.userText(turn);
		const assistantText = this.assistantText(reply);
		return {
			userText,
			assistantText,
			model: turn?.model || reply?.reply?.modelName || null,
			mode: this.strOrNull(turn?.chatMode),
			reasoningEffort: this.strOrNull(reply?.reply?.reasoningEffort),
			timestamp: this.strOrNull(turn?.timestamp),
			currentDocumentUri: this.strOrNull(turn?.currentDocument?.uri),
			toolCalls: this.toolCallsFromTurn(reply),
			inputTokens: this.estimate(userText),
			outputTokens: this.estimate(assistantText),
		};
	}
}
