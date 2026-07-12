import * as fs from 'fs';
import * as path from 'path';
import type { ModelUsage, ChatTurn } from '../types';
import type { IEcosystemAdapter, IDiscoverableEcosystem, IAnalyzableEcosystem, DiscoveryResult, CandidatePath, UsageAnalysisAdapterContext } from '../ecosystemAdapter';
import { CursorDataAccess } from '../cursor';
import { createEmptyContextRefs } from '../tokenEstimation';
import { createEmptySessionUsageAnalysis, applyModelTierClassification } from '../usageAnalysis';

export class CursorAdapter implements IEcosystemAdapter, IDiscoverableEcosystem, IAnalyzableEcosystem {
	readonly id = 'cursor';
	readonly displayName = 'Cursor';

	constructor(private readonly cursor: CursorDataAccess) {}

	handles(sessionFile: string): boolean {
		return this.cursor.isCursorSessionFile(sessionFile);
	}

	getBackingPath(sessionFile: string): string {
		return this.cursor.getDbPathFromVirtual(sessionFile);
	}

	async stat(sessionFile: string): Promise<fs.Stats> {
		return this.cursor.statSessionFile(sessionFile);
	}

	async getTokens(sessionFile: string): Promise<{ tokens: number; thinkingTokens: number; actualTokens: number }> {
		const result = await this.cursor.getTokens(sessionFile);
		return { ...result, actualTokens: result.tokens };
	}

	async countInteractions(sessionFile: string): Promise<number> {
		return this.cursor.countInteractions(sessionFile);
	}

	async getModelUsage(sessionFile: string): Promise<ModelUsage> {
		return this.cursor.getModelUsage(sessionFile);
	}

	async getMeta(sessionFile: string): Promise<{ title: string | undefined; firstInteraction: string | null; lastInteraction: string | null; workspacePath?: string }> {
		return this.cursor.getSessionMeta(sessionFile);
	}

	getEditorRoot(sessionFile: string): string {
		return path.dirname(this.cursor.getDbPathFromVirtual(sessionFile));
	}

	async discover(log: (msg: string) => void): Promise<DiscoveryResult> {
		const candidatePaths = this.getCandidatePaths();
		const dbPath = this.cursor.getCursorDbPath();
		log(`📁 Checking Cursor DB path: ${dbPath}`);
		let sessionFiles: string[] = [];
		try {
			await fs.promises.access(dbPath);
			sessionFiles = await this.cursor.discoverSessions();
			if (sessionFiles.length > 0) {
				log(`📄 Found ${sessionFiles.length} Cursor session(s)`);
			}
		} catch {
			log(`📁 Cursor DB not found: ${dbPath}`);
		}
		return { sessionFiles, candidatePaths };
	}

	getCandidatePaths(): CandidatePath[] {
		return [{ path: this.cursor.getCursorDbPath(), source: 'Cursor (state.vscdb)' }];
	}

	private collectAssistantText(
		headers: Array<{ type?: number; bubbleId?: string }>,
		startIndex: number,
		bubbleMap: Map<string, import('../cursor').CursorBubble>
	): string {
		const texts: string[] = [];
		let j = startIndex;
		while (j < headers.length && headers[j].type !== 1) {
			const bid = headers[j].bubbleId;
			const ab = bid ? bubbleMap.get(bid) : undefined;
			if (ab?.text) { texts.push(ab.text); }
			j++;
		}
		return texts.join('\n\n');
	}

	async buildTurns(sessionFile: string): Promise<{ turns: ChatTurn[]; actualTokens?: number }> {
		const data = await this.cursor.readComposerData(sessionFile);
		if (!data?.fullConversationHeadersOnly) { return { turns: [] }; }

		const headers = data.fullConversationHeadersOnly;
		const contextTokens = typeof data.contextTokensUsed === 'number' ? data.contextTokensUsed : 0;
		const model = data.modelConfig?.modelName || null;

		const allBubbleIds = headers.map(h => h.bubbleId).filter((id): id is string => !!id);
		const bubbleMap = await this.cursor.readBubbles(sessionFile, allBubbleIds);

		const turns: ChatTurn[] = [];
		let turnNumber = 0;
		for (let i = 0; i < headers.length; i++) {
			const h = headers[i];
			if (h.type !== 1) { continue; }
			turnNumber++;

			const userBubble = h.bubbleId ? bubbleMap.get(h.bubbleId) : undefined;
			turns.push({
				turnNumber,
				timestamp: userBubble?.createdAt ?? null,
				mode: 'agent' as const,
				userMessage: userBubble?.text ?? '',
				assistantResponse: this.collectAssistantText(headers, i + 1, bubbleMap),
				model,
				toolCalls: [],
				contextReferences: createEmptyContextRefs(),
				mcpTools: [],
				inputTokensEstimate: 0,
				outputTokensEstimate: 0,
				thinkingTokensEstimate: 0,
			});
		}

		return { turns, actualTokens: contextTokens };
	}

	async getSyncData(sessionFile: string): Promise<{ tokens: number; interactions: number; modelUsage: ModelUsage; timestamp: number }> {
		return this.cursor.getSessionData(sessionFile);
	}

	async analyzeUsage(sessionFile: string, ctx: UsageAnalysisAdapterContext): Promise<import('../types').SessionUsageAnalysis> {
		const analysis = createEmptySessionUsageAnalysis();
		const data = await this.cursor.readComposerData(sessionFile);
		if (!data?.fullConversationHeadersOnly) { return analysis; }

		const model = data.modelConfig?.modelName || 'unknown';
		const headers = data.fullConversationHeadersOnly;
		const userCount = headers.filter(h => h.type === 1).length;
		const assistantCount = headers.filter(h => h.type === 2).length;

		analysis.modeUsage.agent += userCount;

		if (assistantCount > 0) {
			analysis.modelSwitching.uniqueModels = [model];
			analysis.modelSwitching.modelCount = 1;
			analysis.modelSwitching.totalRequests = assistantCount;
			analysis.modelSwitching.switchCount = 0;
		}

		const models = Array(assistantCount).fill(model) as string[];
		applyModelTierClassification(ctx.modelPricing, [model], models, analysis);
		return analysis;
	}
}
