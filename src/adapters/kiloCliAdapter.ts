import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { ModelUsage, ChatTurn } from '../types';
import type { IEcosystemAdapter, IDiscoverableEcosystem, IAnalyzableEcosystem, DiscoveryResult, CandidatePath, UsageAnalysisAdapterContext } from '../ecosystemAdapter';
import { createEmptyContextRefs } from '../tokenEstimation';
import { createEmptySessionUsageAnalysis, applyModelTierClassification } from '../usageAnalysis';
import type { SessionUsageAnalysis } from '../types';
import { KiloDataAccess } from '../kilo';
import { normalizePathForComparison } from '../workspaceHelpers';

export class KiloCliAdapter implements IEcosystemAdapter, IDiscoverableEcosystem, IAnalyzableEcosystem {
	readonly id = 'kilocli';
	readonly displayName = 'Kilo CLI';

	private readonly kiloDataAccess: KiloDataAccess;

	constructor() {
		// Create a KiloDataAccess instance to access the SQLite database
		this.kiloDataAccess = new KiloDataAccess({ fsPath: '', path: '', scheme: 'file' });
	}

	handles(sessionFile: string): boolean {
		const normalized = normalizePathForComparison(sessionFile);
		return normalized.includes('/kilo/storage/session_diff/ses_') && normalized.endsWith('.json');
	}

	getBackingPath(sessionFile: string): string {
		return sessionFile;
	}

	async stat(sessionFile: string): Promise<fs.Stats> {
		return fs.promises.stat(sessionFile);
	}

	async getTokens(sessionFile: string): Promise<{ tokens: number; thinkingTokens: number; actualTokens: number }> {
		const sessionId = this.getKiloCliSessionId(sessionFile);
		if (!sessionId) {
			return { tokens: 0, thinkingTokens: 0, actualTokens: 0 };
		}
		const result = await this.kiloDataAccess.getTokensFromKiloSession(`kilo.db#${sessionId}`);
		return { ...result, actualTokens: result.tokens };
	}

	/**
	 * Extract the session ID from a Kilo CLI session file path.
	 * - ".../storage/session_diff/ses_abc123.json" -> "ses_abc123"
	 */
	private getKiloCliSessionId(sessionFilePath: string): string | null {
		const filename = path.basename(sessionFilePath, '.json');
		if (filename.startsWith('ses_')) {
			return filename;
		}
		return null;
	}

	async countInteractions(sessionFile: string): Promise<number> {
		const sessionId = this.getKiloCliSessionId(sessionFile);
		if (!sessionId) {
			return 0;
		}
		return this.kiloDataAccess.countKiloInteractions(`kilo.db#${sessionId}`);
	}

	async getModelUsage(sessionFile: string): Promise<ModelUsage> {
		const sessionId = this.getKiloCliSessionId(sessionFile);
		if (!sessionId) {
			return {};
		}
		return this.kiloDataAccess.getKiloModelUsage(`kilo.db#${sessionId}`);
	}

	async getMeta(sessionFile: string): Promise<{ title: string | undefined; firstInteraction: string | null; lastInteraction: string | null; workspacePath?: string }> {
		const sessionId = this.getKiloCliSessionId(sessionFile);
		if (!sessionId) {
			return { title: undefined, firstInteraction: null, lastInteraction: null, workspacePath: undefined };
		}
		
		const timestamps: number[] = [];
		let title: string | undefined;
		let workspacePath: string | undefined;

		const session = await this.kiloDataAccess.readKiloDbSession(sessionId);
		if (session) {
			title = session.title || session.slug;
			workspacePath = session.directory || undefined;
			if (session.time?.created) { timestamps.push(session.time.created); }
			if (session.time?.updated) { timestamps.push(session.time.updated); }
		}

		const messages = await this.kiloDataAccess.getKiloMessagesForSession(`kilo.db#${sessionId}`);
		for (const msg of messages) {
			if (msg.time?.created) { timestamps.push(msg.time.created); }
			if (msg.time?.completed) { timestamps.push(msg.time.completed); }
		}

		timestamps.sort((a, b) => a - b);
		return {
			title,
			firstInteraction: timestamps.length > 0 ? new Date(timestamps[0]).toISOString() : null,
			lastInteraction: timestamps.length > 0 ? new Date(timestamps[timestamps.length - 1]).toISOString() : null,
			workspacePath,
		};
	}

	getEditorRoot(_sessionFile: string): string {
		const platform = os.platform();
		const homedir = os.homedir();
		if (platform === 'win32') {
			return path.join(homedir, '.local', 'share', 'kilo');
		}
		const xdgDataHome = process.env.XDG_DATA_HOME || path.join(homedir, '.local', 'share');
		return path.join(xdgDataHome, 'kilo');
	}

	async discover(log: (msg: string) => void): Promise<DiscoveryResult> {
		const candidatePaths = this.getCandidatePaths();
		const sessionFiles: string[] = [];
		const sessionsDir = this.getKiloCliSessionsDir();

		log(`Checking Kilo CLI sessions directory: ${sessionsDir}`);
		
		try {
			const files = await this.discoverKiloCliSessions();
			if (files.length > 0) {
				log(`Found ${files.length} session file(s) in Kilo CLI (storage/session_diff)`);
				sessionFiles.push(...files);
			}
		} catch (err) {
			log(`Kilo CLI sessions directory could not be read: ${err}`);
		}

		return { sessionFiles, candidatePaths };
	}

	/**
	 * Get the Kilo CLI session files directory path.
	 */
	private getKiloCliSessionsDir(): string {
		return path.join(this.getEditorRoot(''), 'storage', 'session_diff');
	}

	/**
	 * Discover all Kilo CLI session files.
	 */
	private async discoverKiloCliSessions(): Promise<string[]> {
		const sessionsDir = this.getKiloCliSessionsDir();
		
		if (!fs.existsSync(sessionsDir)) {
			return [];
		}

		try {
			const files = await fs.promises.readdir(sessionsDir);
			return files
				.filter(file => file.startsWith('ses_') && file.endsWith('.json'))
				.map(file => path.join(sessionsDir, file));
		} catch {
			return [];
		}
	}

	getCandidatePaths(): CandidatePath[] {
		return [
			{ path: this.getKiloCliSessionsDir(), source: 'Kilo CLI' },
		];
	}

	async buildTurns(sessionFile: string): Promise<{ turns: ChatTurn[]; actualTokens?: number }> {
		const sessionId = this.getKiloCliSessionId(sessionFile);
		if (!sessionId) {
			return { turns: [] };
		}
		
		const turns: ChatTurn[] = [];
		const messages = await this.kiloDataAccess.getKiloMessagesForSession(`kilo.db#${sessionId}`);
		let prevCumulativeTotal = 0;
		let turnNumber = 0;
		
		for (let i = 0; i < messages.length; i++) {
			const msg = messages[i];
			if (msg.role !== 'user') { continue; }
			turnNumber++;
			const turnAssistantMsgs = messages.filter((m, idx) => idx > i && m.role === 'assistant' && m.parentID === msg.id);
			const userParts = await this.kiloDataAccess.getKiloPartsForMessage(msg.id);
			const userText = userParts.filter(p => p.type === 'text').map(p => p.text || '').join('\n');
			const turnData = await this.processKiloAssistantMessages(turnAssistantMsgs, prevCumulativeTotal);
			const turnInputTokens = Math.max(0, (turnData.turnCumulativeTotal - prevCumulativeTotal) - turnData.turnOutputAndThinking);
			
			turns.push({
				turnNumber,
				timestamp: msg.time?.created ? new Date(msg.time.created).toISOString() : null,
				mode: 'cli',
				userMessage: userText,
				assistantResponse: turnData.assistantText,
				model: turnData.model,
				toolCalls: turnData.toolCalls,
				contextReferences: createEmptyContextRefs(),
				mcpTools: [],
				inputTokensEstimate: turnInputTokens,
				outputTokensEstimate: turnData.turnOutputAndThinking - turnData.thinkingTokens,
				thinkingTokensEstimate: turnData.thinkingTokens
			});
			
			prevCumulativeTotal = turnData.turnCumulativeTotal;
		}
		
		return { turns };
	}

	private async processKiloAssistantMessages(turnAssistantMsgs: any[], prevCumulativeTotal: number): Promise<{
		assistantText: string; toolCalls: { toolName: string; arguments?: string; result?: string }[];
		model: string | null; thinkingTokens: number; turnCumulativeTotal: number; turnOutputAndThinking: number;
	}> {
		let assistantText = '';
		const toolCalls: { toolName: string; arguments?: string; result?: string }[] = [];
		let model: string | null = null;
		let thinkingTokens = 0;
		let turnCumulativeTotal = prevCumulativeTotal;
		
		for (const assistantMsg of turnAssistantMsgs) {
			if (!model) { model = assistantMsg.modelID || assistantMsg.model?.modelID || null; }
			thinkingTokens += assistantMsg.tokens?.reasoning || 0;
			if (typeof assistantMsg.tokens?.total === 'number') {
				turnCumulativeTotal = Math.max(turnCumulativeTotal, assistantMsg.tokens.total);
			}
			const assistantParts = await this.kiloDataAccess.getKiloPartsForMessage(assistantMsg.id);
			for (const part of assistantParts) {
				assistantText += this.processKiloPart(part, toolCalls);
			}
		}
		
		const turnOutputAndThinking = turnAssistantMsgs.reduce((sum, m) => sum + (m.tokens?.output || 0) + (m.tokens?.reasoning || 0), 0);
		return { assistantText, toolCalls, model, thinkingTokens, turnCumulativeTotal, turnOutputAndThinking };
	}

	private processKiloPart(
		part: any,
		toolCalls: { toolName: string; arguments?: string; result?: string }[]
	): string {
		if (part.type === 'text' && part.text) { return part.text as string; }
		if (part.type === 'tool' && part.tool) {
			toolCalls.push({
				toolName: part.tool,
				arguments: part.state?.input ? JSON.stringify(part.state.input) : undefined,
				result: part.state?.output || undefined
			});
		}
		return '';
	}

	async getDailyFractions(sessionFile: string): Promise<Record<string, number>> {
		// For now, use the file modification date as a fallback
		// The actual implementation would need to extract timestamps from the database
		try {
			const stats = await fs.promises.stat(sessionFile);
			const date = stats.mtime;
			const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
			return { [dateKey]: 1.0 };
		} catch {
			return {};
		}
	}

	async analyzeUsage(sessionFile: string, ctx: UsageAnalysisAdapterContext): Promise<SessionUsageAnalysis> {
		const analysis = createEmptySessionUsageAnalysis();
		
		// Count interactions from the database
		const interactions = await this.countInteractions(sessionFile);
		analysis.modeUsage.cli = interactions;
		
		// Since we don't have model info in the diff files, we can't do model analysis
		return analysis;
	}

	async getSyncData(sessionFile: string): Promise<{ tokens: number; interactions: number; modelUsage: ModelUsage; timestamp: number }> {
		const sessionId = this.getKiloCliSessionId(sessionFile);
		if (!sessionId) {
			return { tokens: 0, interactions: 0, modelUsage: {}, timestamp: Date.now() };
		}
		return this.kiloDataAccess.getKiloSessionData(`kilo.db#${sessionId}`);
	}
}