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
import { KiroDataAccess } from '../kiro';
import { createEmptyContextRefs } from '../tokenEstimation';
import { createEmptySessionUsageAnalysis, applyModelTierClassification } from '../usageAnalysis';

export class KiroAdapter implements IEcosystemAdapter, IDiscoverableEcosystem, IAnalyzableEcosystem {
	readonly id = 'kiro';
	readonly displayName = 'Kiro';

	constructor(private readonly kiro: KiroDataAccess) {}

	handles(sessionFile: string): boolean {
		return this.kiro.isKiroSessionFile(sessionFile);
	}

	getBackingPath(sessionFile: string): string {
		return sessionFile;
	}

	async stat(sessionFile: string): Promise<fs.Stats> {
		return fs.promises.stat(sessionFile);
	}

	async getTokens(sessionFile: string): Promise<{ tokens: number; thinkingTokens: number; actualTokens: number }> {
		const result = await this.kiro.getTokensFromKiroSession(sessionFile);
		return { ...result, actualTokens: result.tokens };
	}

	async countInteractions(sessionFile: string): Promise<number> {
		return await this.kiro.countKiroInteractions(sessionFile);
	}

	async getModelUsage(sessionFile: string): Promise<ModelUsage> {
		return await this.kiro.getKiroModelUsage(sessionFile);
	}

	async getMeta(sessionFile: string): Promise<{ title: string | undefined; firstInteraction: string | null; lastInteraction: string | null; workspacePath?: string }> {
		return await this.kiro.getKiroSessionMeta(sessionFile);
	}

	getEditorRoot(_sessionFile: string): string {
		return this.kiro.getKiroAppDataDir();
	}

	async discover(log: (msg: string) => void): Promise<DiscoveryResult> {
		const candidatePaths = this.getCandidatePaths();
		const sessionFiles: string[] = [];
		try {
			const files = await this.kiro.getKiroSessionFiles();
			if (files.length > 0) {
				log(`📄 Found ${files.length} session file(s) in Kiro (kiro.kiroagent/workspace-sessions)`);
				sessionFiles.push(...files);
			}
		} catch (error) {
			log(`Could not read Kiro session files: ${error}`);
		}
		return { sessionFiles, candidatePaths };
	}

	getCandidatePaths(): CandidatePath[] {
		return [{ path: this.kiro.getKiroWorkspaceSessionsDir(), source: 'Kiro' }];
	}

	async buildTurns(sessionFile: string): Promise<{ turns: ChatTurn[]; actualTokens?: number }> {
		const kiroTurns = await this.kiro.buildKiroTurns(sessionFile);
		const emptyContextRefs = createEmptyContextRefs();
		const turns: ChatTurn[] = kiroTurns.map((turn, index) => ({
			turnNumber: index + 1,
			timestamp: turn.timestampMs !== null ? new Date(turn.timestampMs).toISOString() : null,
			mode: 'agent',
			userMessage: turn.userText,
			assistantResponse: turn.assistantText,
			model: turn.model,
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
		return await this.kiro.getKiroDailyFractions(sessionFile);
	}

	async analyzeUsage(sessionFile: string, ctx: UsageAnalysisAdapterContext): Promise<import('../types').SessionUsageAnalysis> {
		const analysis = createEmptySessionUsageAnalysis();
		const turns = await this.kiro.buildKiroTurns(sessionFile);
		const models: string[] = [];
		for (const turn of turns) {
			// Kiro's chat panel is agentic by default (Autopilot/Supervised).
			analysis.modeUsage.agent++;
			if (turn.model) { models.push(turn.model); }
			for (const toolCall of turn.toolCalls) {
				analysis.toolCalls.total++;
				analysis.toolCalls.byTool[toolCall.toolName] = (analysis.toolCalls.byTool[toolCall.toolName] || 0) + 1;
			}
		}
		const uniqueModels = [...new Set(models)];
		analysis.modelSwitching.uniqueModels = uniqueModels;
		analysis.modelSwitching.modelCount = uniqueModels.length;
		analysis.modelSwitching.totalRequests = models.length;
		let switchCount = 0;
		for (let i = 1; i < models.length; i++) {
			if (models[i] !== models[i - 1]) { switchCount++; }
		}
		analysis.modelSwitching.switchCount = switchCount;
		applyModelTierClassification(ctx.modelPricing, uniqueModels, models, analysis);
		return analysis;
	}
}
