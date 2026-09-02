import * as fs from 'fs';
import type { ChatTurn, ModelUsage } from '../types';
import type {
	CandidatePath,
	DiscoveryResult,
	IAnalyzableEcosystem,
	IDiscoverableEcosystem,
	IEcosystemAdapter,
	UsageAnalysisAdapterContext,
} from '../ecosystemAdapter';
import { KiroCliDataAccess } from '../kirocli';
import { createEmptyContextRefs } from '../tokenEstimation';
import { createEmptySessionUsageAnalysis, applyModelTierClassification } from '../usageAnalysis';

export class KiroCliAdapter implements IEcosystemAdapter, IDiscoverableEcosystem, IAnalyzableEcosystem {
	readonly id = 'kirocli';
	readonly displayName = 'Kiro CLI';

	constructor(private readonly kiroCli: KiroCliDataAccess) {}

	handles(sessionFile: string): boolean {
		return this.kiroCli.isKiroCliSessionFile(sessionFile);
	}

	getBackingPath(sessionFile: string): string {
		return sessionFile;
	}

	async stat(sessionFile: string): Promise<fs.Stats> {
		return fs.promises.stat(sessionFile);
	}

	async getTokens(sessionFile: string): Promise<{ tokens: number; thinkingTokens: number; actualTokens: number }> {
		const result = await this.kiroCli.getTokensFromKiroCliSession(sessionFile);
		return { ...result, actualTokens: result.tokens };
	}

	async countInteractions(sessionFile: string): Promise<number> {
		return await this.kiroCli.countKiroCliInteractions(sessionFile);
	}

	async getModelUsage(sessionFile: string): Promise<ModelUsage> {
		return await this.kiroCli.getKiroCliModelUsage(sessionFile);
	}

	async getMeta(sessionFile: string): Promise<{ title: string | undefined; firstInteraction: string | null; lastInteraction: string | null; workspacePath?: string }> {
		return await this.kiroCli.getKiroCliSessionMeta(sessionFile);
	}

	getEditorRoot(_sessionFile: string): string {
		return this.kiroCli.getKiroCliDataDir();
	}

	async discover(log: (msg: string) => void): Promise<DiscoveryResult> {
		const candidatePaths = this.getCandidatePaths();
		const sessionFiles: string[] = [];
		try {
			const files = await this.kiroCli.getKiroCliSessionFiles();
			if (files.length > 0) {
				log(`📄 Found ${files.length} session file(s) in Kiro CLI (~/.kiro/sessions/cli)`);
				sessionFiles.push(...files);
			}
		} catch (error) {
			log(`Could not read Kiro CLI session files: ${error}`);
		}
		return { sessionFiles, candidatePaths };
	}

	getCandidatePaths(): CandidatePath[] {
		return [{ path: this.kiroCli.getKiroCliSessionsDir(), source: 'Kiro CLI' }];
	}

	async buildTurns(sessionFile: string): Promise<{ turns: ChatTurn[]; actualTokens?: number }> {
		const kiroTurns = await this.kiroCli.buildKiroCliTurns(sessionFile);
		const emptyContextRefs = createEmptyContextRefs();
		const meta = await this.kiroCli.readSessionMetadata(sessionFile);
		const model = meta?.modelId || null;
		const turns: ChatTurn[] = kiroTurns.map((turn, index) => ({
			turnNumber: index + 1,
			timestamp: turn.timestampMs !== null ? new Date(turn.timestampMs).toISOString() : null,
			mode: 'cli',
			userMessage: turn.userText,
			assistantResponse: turn.assistantText,
			model,
			toolCalls: turn.toolCalls,
			contextReferences: emptyContextRefs,
			mcpTools: [],
			inputTokensEstimate: turn.inputTokens,
			outputTokensEstimate: turn.outputTokens,
			thinkingTokensEstimate: 0,
		}));
		return { turns };
	}

	async getDailyFractions(sessionFile: string): Promise<Record<string, number>> {
		return await this.kiroCli.getKiroCliDailyFractions(sessionFile);
	}

	async analyzeUsage(sessionFile: string, ctx: UsageAnalysisAdapterContext): Promise<import('../types').SessionUsageAnalysis> {
		const analysis = createEmptySessionUsageAnalysis();
		const turns = await this.kiroCli.buildKiroCliTurns(sessionFile);
		const meta = await this.kiroCli.readSessionMetadata(sessionFile);
		const model = meta?.modelId || 'unknown';
		const models: string[] = [];
		for (const turn of turns) {
			analysis.modeUsage.cli++;
			models.push(model);
			for (const toolCall of turn.toolCalls) {
				analysis.toolCalls.total++;
				analysis.toolCalls.byTool[toolCall.toolName] = (analysis.toolCalls.byTool[toolCall.toolName] || 0) + 1;
			}
		}
		const uniqueModels = [...new Set(models)];
		analysis.modelSwitching.uniqueModels = uniqueModels;
		analysis.modelSwitching.modelCount = uniqueModels.length;
		analysis.modelSwitching.totalRequests = models.length;
		analysis.modelSwitching.switchCount = 0;
		applyModelTierClassification(ctx.modelPricing, uniqueModels, models, analysis);
		return analysis;
	}
}
