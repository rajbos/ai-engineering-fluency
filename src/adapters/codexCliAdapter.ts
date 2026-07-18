import * as fs from 'fs';
import type { ChatTurn, ModelUsage, SessionUsageAnalysis } from '../types';
import type {
	CandidatePath,
	DiscoveryResult,
	IAnalyzableEcosystem,
	IDiscoverableEcosystem,
	IEcosystemAdapter,
	UsageAnalysisAdapterContext,
} from '../ecosystemAdapter';
import type { CodexCliDataAccess, CodexRolloutSummary } from '../codexcli';
import { createEmptyContextRefs } from '../tokenEstimation';
import { createEmptySessionUsageAnalysis, applyModelTierClassification } from '../usageAnalysis';

/**
 * Adapter for the OpenAI Codex CLI (terminal coding agent, https://github.com/openai/codex).
 *
 * Sessions come from two sources handled by CodexCliDataAccess (see src/codexcli.ts for the
 * full schema writeup): rollout JSONL files under ~/.codex/sessions/ (real per-event data,
 * including cumulative token_count usage events), and rows in the ~/.codex/state_<N>.sqlite
 * `threads` table exposed as virtual `<state_db>#<thread_id>` paths when the rollout file
 * referenced by `rollout_path` no longer exists on disk (those rows still carry real
 * `tokens_used` totals, model, title, cwd and timestamps).
 */
export class CodexCliAdapter implements IEcosystemAdapter, IDiscoverableEcosystem, IAnalyzableEcosystem {
	readonly id = 'codexcli';
	readonly displayName = 'Codex CLI';

	constructor(private readonly codexCli: CodexCliDataAccess) {}

	handles(sessionFile: string): boolean {
		return this.codexCli.isCodexCliSessionFile(sessionFile);
	}

	getBackingPath(sessionFile: string): string {
		return this.codexCli.getBackingPath(sessionFile);
	}

	async stat(sessionFile: string): Promise<fs.Stats> {
		return this.codexCli.statSessionFile(sessionFile);
	}

	async getTokens(sessionFile: string): Promise<{ tokens: number; thinkingTokens: number; actualTokens: number }> {
		const result = await this.codexCli.getTokens(sessionFile);
		return { ...result, actualTokens: result.tokens };
	}

	async countInteractions(sessionFile: string): Promise<number> {
		return this.codexCli.countInteractions(sessionFile);
	}

	async getModelUsage(sessionFile: string): Promise<ModelUsage> {
		return this.codexCli.getModelUsage(sessionFile);
	}

	async getMeta(sessionFile: string): Promise<{ title: string | undefined; firstInteraction: string | null; lastInteraction: string | null; workspacePath?: string }> {
		return this.codexCli.getMeta(sessionFile);
	}

	getEditorRoot(_sessionFile: string): string {
		return this.codexCli.getCodexHome();
	}

	async discover(log: (msg: string) => void): Promise<DiscoveryResult> {
		const candidatePaths = this.getCandidatePaths();
		const sessionFiles: string[] = [];
		try {
			const { files, rolloutCount, dbOnlyCount } = await this.codexCli.discoverSessions();
			if (files.length > 0) {
				log(`📄 Found ${files.length} Codex CLI session(s) (${rolloutCount} rollout file(s), ${dbOnlyCount} DB-only thread(s))`);
			}
			sessionFiles.push(...files);
		} catch (e) {
			log(`Could not read Codex CLI sessions: ${e}`);
		}
		return { sessionFiles, candidatePaths };
	}

	getCandidatePaths(): CandidatePath[] {
		return [
			{ path: this.codexCli.getSessionsDir(), source: 'Codex CLI (sessions)' },
			{ path: this.codexCli.getArchivedSessionsDir(), source: 'Codex CLI (archived sessions)' },
			{ path: this.codexCli.getStateDbPath(), source: 'Codex CLI (state db)' },
		];
	}

	async getDailyFractions(sessionFile: string): Promise<Record<string, number>> {
		return this.codexCli.getDailyFractions(sessionFile);
	}

	async buildTurns(sessionFile: string): Promise<{ turns: ChatTurn[]; actualTokens?: number }> {
		if (this.codexCli.isVirtualThreadPath(sessionFile)) {
			return this.buildDbThreadTurns(sessionFile);
		}
		const summary = await this.codexCli.getRolloutSummary(sessionFile);
		const totals = this.codexCli.computeTokenTotals(summary);
		const turns = summary.userMessages.map((user, i) => this.buildRolloutTurn(summary, i, user));
		return { turns, actualTokens: totals.totalTokens > 0 ? totals.totalTokens : undefined };
	}

	/** DB-only threads carry no message data — surface a single summary turn when possible. */
	private async buildDbThreadTurns(sessionFile: string): Promise<{ turns: ChatTurn[]; actualTokens?: number }> {
		const thread = await this.codexCli.readThread(sessionFile);
		if (!thread) { return { turns: [] }; }
		const userMessage = thread.first_user_message?.trim() || '';
		if (!userMessage) { return { turns: [], actualTokens: thread.tokens_used || undefined }; }
		const created = this.codexCli.toMillis(thread.created_at);
		return {
			turns: [{
				turnNumber: 1,
				timestamp: created ? new Date(created).toISOString() : null,
				mode: 'cli',
				userMessage,
				assistantResponse: '',
				model: thread.model || null,
				toolCalls: [],
				contextReferences: createEmptyContextRefs(),
				mcpTools: [],
				inputTokensEstimate: Math.ceil(userMessage.length / 4),
				outputTokensEstimate: 0,
				thinkingTokensEstimate: 0,
			}],
			actualTokens: thread.tokens_used || undefined,
		};
	}

	/** Build one turn: the i-th user message plus assistant/tool activity until the next user message. */
	private buildRolloutTurn(summary: CodexRolloutSummary, index: number, user: { text: string; timestamp: string | null }): ChatTurn {
		const nextUserTs = summary.userMessages[index + 1]?.timestamp ?? null;
		const inWindow = (ts: string | null): boolean => {
			if (!user.timestamp) { return index === summary.userMessages.length - 1; }
			if (!ts) { return false; }
			return ts >= user.timestamp && (nextUserTs === null || ts < nextUserTs);
		};
		const assistantInTurn = summary.assistantMessages.filter(m => inWindow(m.timestamp));
		const assistantText = assistantInTurn.map(m => m.text).join('\n');
		const model = assistantInTurn.length > 0
			? assistantInTurn[assistantInTurn.length - 1].model
			: (summary.models[summary.models.length - 1] ?? null);
		return {
			turnNumber: index + 1,
			timestamp: user.timestamp,
			mode: 'cli',
			userMessage: user.text,
			assistantResponse: assistantText,
			model: model === 'unknown' ? null : model,
			toolCalls: summary.toolCalls.filter(t => inWindow(t.timestamp)).map(t => ({ toolName: t.name })),
			contextReferences: createEmptyContextRefs(),
			mcpTools: [],
			inputTokensEstimate: Math.ceil(user.text.length / 4),
			outputTokensEstimate: Math.ceil(assistantText.length / 4),
			thinkingTokensEstimate: 0,
		};
	}

	async analyzeUsage(sessionFile: string, ctx: UsageAnalysisAdapterContext): Promise<SessionUsageAnalysis> {
		const analysis = createEmptySessionUsageAnalysis();
		if (this.codexCli.isVirtualThreadPath(sessionFile)) {
			return this.analyzeDbThread(sessionFile, ctx, analysis);
		}
		const summary = await this.codexCli.getRolloutSummary(sessionFile);
		analysis.modeUsage.cli += summary.userMessages.length;
		analysis.toolCalls.total = summary.toolCalls.length;
		for (const tc of summary.toolCalls) {
			const name = ctx.toolNameMap[tc.name] || tc.name;
			analysis.toolCalls.byTool[name] = (analysis.toolCalls.byTool[name] || 0) + 1;
		}
		// One request per assistant message, attributed to the model active at that point.
		const models = summary.assistantMessages.map(m => m.model).filter(m => m !== 'unknown');
		this.applyModelStats(models.length > 0 ? models : summary.models, analysis, ctx);
		return analysis;
	}

	private async analyzeDbThread(sessionFile: string, ctx: UsageAnalysisAdapterContext, analysis: SessionUsageAnalysis): Promise<SessionUsageAnalysis> {
		const thread = await this.codexCli.readThread(sessionFile);
		if (!thread) { return analysis; }
		const interactions = await this.codexCli.countInteractions(sessionFile);
		analysis.modeUsage.cli += interactions;
		if (thread.model) { this.applyModelStats([thread.model], analysis, ctx); }
		return analysis;
	}

	private applyModelStats(models: string[], analysis: SessionUsageAnalysis, ctx: UsageAnalysisAdapterContext): void {
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
	}
}
