import * as fs from 'fs';
import * as path from 'path';
import type { ModelUsage, ChatTurn, SessionUsageAnalysis } from '../types';
import type { IEcosystemAdapter, IDiscoverableEcosystem, IAnalyzableEcosystem, DiscoveryResult, CandidatePath, UsageAnalysisAdapterContext } from '../ecosystemAdapter';
import { EclipseDataAccess } from '../eclipse';
import { createEmptyContextRefs } from '../tokenEstimation';
import { createEmptySessionUsageAnalysis, applyModelTierClassification } from '../usageAnalysis';

/** Map an Eclipse chatMode value (e.g. "Agent", "Ask", "Edit") to a ChatTurn mode. */
function mapEclipseMode(chatMode: string | null): ChatTurn['mode'] {
	switch ((chatMode || '').toLowerCase()) {
		case 'agent': return 'agent';
		case 'edit': return 'edit';
		case 'plan': return 'plan';
		case 'ask': return 'ask';
		default: return 'ask';
	}
}

/** Normalise an Eclipse ISO timestamp (nanosecond precision) to a millisecond ISO string. */
function normalizeIso(value: string | undefined): string | null {
	if (!value) { return null; }
	const ms = Date.parse(value);
	return Number.isNaN(ms) ? null : new Date(ms).toISOString();
}

export class EclipseAdapter implements IEcosystemAdapter, IDiscoverableEcosystem, IAnalyzableEcosystem {
	readonly id = 'eclipse';
	readonly displayName = 'Eclipse';

	constructor(private readonly eclipse: EclipseDataAccess) {}

	handles(sessionFile: string): boolean {
		return this.eclipse.isEclipseSessionFile(sessionFile);
	}

	getBackingPath(sessionFile: string): string {
		return sessionFile;
	}

	async stat(sessionFile: string): Promise<fs.Stats> {
		return fs.promises.stat(sessionFile);
	}

	async getTokens(sessionFile: string): Promise<{ tokens: number; thinkingTokens: number; actualTokens: number }> {
		const result = await this.eclipse.getTokensFromEclipseSession(sessionFile);
		return { ...result, actualTokens: result.tokens };
	}

	async countInteractions(sessionFile: string): Promise<number> {
		return this.eclipse.countEclipseInteractions(sessionFile);
	}

	async getModelUsage(sessionFile: string): Promise<ModelUsage> {
		return this.eclipse.getEclipseModelUsage(sessionFile);
	}

	async getMeta(sessionFile: string): Promise<{ title: string | undefined; firstInteraction: string | null; lastInteraction: string | null; workspacePath?: string }> {
		const meta = await this.eclipse.getEclipseSessionMeta(sessionFile);
		return {
			title: meta?.title,
			firstInteraction: normalizeIso(meta?.creationDate),
			lastInteraction: normalizeIso(meta?.lastMessageDate),
		};
	}

	getEditorRoot(sessionFile: string): string {
		// e.g. <ws>/.metadata/.plugins/com.microsoft.copilot.eclipse.core/conversations/<user>
		// Keep the marker segment so getEditorNameFromRoot resolves to 'Eclipse'.
		return path.dirname(sessionFile);
	}

	async discover(log: (msg: string) => void): Promise<DiscoveryResult> {
		const candidatePaths = this.getCandidatePaths();
		const sessionFiles: string[] = [];
		try {
			const files = await this.eclipse.discoverEclipseSessions();
			if (files.length > 0) {
				log(`📄 Found ${files.length} session file(s) in Eclipse (Copilot conversations)`);
				sessionFiles.push(...files);
			}
		} catch (e) {
			log(`Could not read Eclipse session files: ${e}`);
		}
		return { sessionFiles, candidatePaths };
	}

	getCandidatePaths(): CandidatePath[] {
		// Synchronous variant: report the default workspace conversations dir.
		// discover() additionally enumerates workspaces from RECENT_WORKSPACES.
		const conversationsDir = path.join(
			this.eclipse.getDefaultWorkspaceRoot(),
			'.metadata', '.plugins', 'com.microsoft.copilot.eclipse.core', 'conversations'
		);
		return [{ path: conversationsDir, source: 'Eclipse' }];
	}

	async buildTurns(sessionFile: string): Promise<{ turns: ChatTurn[]; actualTokens?: number }> {
		const turns: ChatTurn[] = [];
		const eclipseTurns = await this.eclipse.buildEclipseTurns(sessionFile);
		const emptyContextRefs = createEmptyContextRefs();
		for (const et of eclipseTurns) {
			turns.push({
				turnNumber: turns.length + 1,
				timestamp: et.timestamp,
				mode: mapEclipseMode(et.mode),
				userMessage: et.userText,
				assistantResponse: et.assistantText,
				model: et.model,
				toolCalls: et.toolCalls,
				contextReferences: emptyContextRefs,
				mcpTools: [],
				inputTokensEstimate: et.inputTokens,
				outputTokensEstimate: et.outputTokens,
				thinkingTokensEstimate: et.thinkingTokens,
				thinkingEffort: et.reasoningEffort ?? undefined,
			});
		}
		return { turns };
	}

	async analyzeUsage(sessionFile: string, ctx: UsageAnalysisAdapterContext): Promise<SessionUsageAnalysis> {
		const analysis = createEmptySessionUsageAnalysis();
		const turns = await this.eclipse.buildEclipseTurns(sessionFile);
		const models: string[] = [];
		for (const turn of turns) {
			this.tallyMode(analysis, turn.mode);
			if (turn.model) { models.push(turn.model); }
			for (const tc of turn.toolCalls) {
				analysis.toolCalls.total++;
				analysis.toolCalls.byTool[tc.toolName] = (analysis.toolCalls.byTool[tc.toolName] || 0) + 1;
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

	private tallyMode(analysis: SessionUsageAnalysis, chatMode: string | null): void {
		const mode = mapEclipseMode(chatMode);
		if (mode === 'agent') { analysis.modeUsage.agent++; }
		else if (mode === 'edit') { analysis.modeUsage.edit++; }
		else { analysis.modeUsage.ask++; }
	}
}
