import * as fs from 'fs';
import * as path from 'path';
import type { ModelUsage, ChatTurn } from '../types';
import type { IEcosystemAdapter, IDiscoverableEcosystem, IAnalyzableEcosystem, DiscoveryResult, CandidatePath, UsageAnalysisAdapterContext } from '../ecosystemAdapter';
import { DevinCliDataAccess } from '../devinCli';
import { createEmptyContextRefs } from '../tokenEstimation';
import { createEmptySessionUsageAnalysis, applyModelTierClassification } from '../usageAnalysis';

/**
 * Adapter for Devin CLI (Cognition Labs' separate ACP-based CLI agent tool — NOT the
 * Devin desktop app, which is a Windsurf fork handled as a legacy special case in
 * windsurf.ts). See src/devinCli.ts and docs/logFilesSchema/devin-cli-session-format.md
 * for the schema, virtual path scheme, and known data-availability limitations.
 */
export class DevinCliAdapter implements IEcosystemAdapter, IDiscoverableEcosystem, IAnalyzableEcosystem {
	readonly id = 'devincli';
	readonly displayName = 'Devin CLI';

	constructor(private readonly devinCli: DevinCliDataAccess) {}

	handles(sessionFile: string): boolean {
		return this.devinCli.isDevinCliSessionFile(sessionFile);
	}

	getBackingPath(sessionFile: string): string {
		return this.devinCli.getDbPathFromVirtual(sessionFile);
	}

	async stat(sessionFile: string): Promise<fs.Stats> {
		return this.devinCli.statSessionFile(sessionFile);
	}

	async getTokens(sessionFile: string): Promise<{ tokens: number; thinkingTokens: number; actualTokens: number }> {
		const result = await this.devinCli.getTokens(sessionFile);
		return { ...result, actualTokens: result.tokens };
	}

	async countInteractions(sessionFile: string): Promise<number> {
		return this.devinCli.countInteractions(sessionFile);
	}

	async getModelUsage(sessionFile: string): Promise<ModelUsage> {
		return this.devinCli.getModelUsage(sessionFile);
	}

	async getMeta(sessionFile: string): Promise<{ title: string | undefined; firstInteraction: string | null; lastInteraction: string | null; workspacePath?: string }> {
		const session = await this.devinCli.readSession(sessionFile);
		const nodes = await this.devinCli.getMessageNodes(sessionFile);
		const timestamps: number[] = [];
		if (session?.created_at) { timestamps.push(session.created_at * 1000); }
		if (session?.last_activity_at) { timestamps.push(session.last_activity_at * 1000); }
		for (const node of nodes) {
			if (node.created_at) { timestamps.push(node.created_at * 1000); }
		}
		timestamps.sort((a, b) => a - b);
		return {
			title: session?.title || undefined,
			firstInteraction: timestamps.length > 0 ? new Date(timestamps[0]).toISOString() : null,
			lastInteraction: timestamps.length > 0 ? new Date(timestamps[timestamps.length - 1]).toISOString() : null,
			workspacePath: session?.working_directory || undefined,
		};
	}

	getEditorRoot(sessionFile: string): string {
		return path.dirname(this.devinCli.getDbPathFromVirtual(sessionFile));
	}

	async discover(log: (msg: string) => void): Promise<DiscoveryResult> {
		const candidatePaths = this.getCandidatePaths();
		const sessionFiles: string[] = [];
		const dbPath = this.devinCli.getDbPath();
		log(`📁 Checking Devin CLI DB path: ${dbPath}`);
		try {
			await fs.promises.access(dbPath);
			const sessionIds = await this.devinCli.discoverSessionIds();
			if (sessionIds.length > 0) {
				log(`📄 Found ${sessionIds.length} session(s) in Devin CLI database`);
			}
			sessionFiles.push(...sessionIds.map(id => this.devinCli.virtualPath(id)));
		} catch (e) {
			log(`Could not read Devin CLI database: ${e}`);
		}
		return { sessionFiles, candidatePaths };
	}

	getCandidatePaths(): CandidatePath[] {
		return [{ path: this.devinCli.getDbPath(), source: 'Devin CLI (sessions.db)' }];
	}

	async buildTurns(sessionFile: string): Promise<{ turns: ChatTurn[]; actualTokens?: number }> {
		const turns: ChatTurn[] = [];
		const session = await this.devinCli.readSession(sessionFile);
		const nodes = await this.devinCli.getMessageNodes(sessionFile);
		const chain = this.devinCli.buildMainChain(nodes, session?.main_chain_id ?? null);
		let turnNumber = 0;
		for (let i = 0; i < chain.length; i++) {
			const parsed = this.devinCli.parseChatMessage(chain[i].chat_message);
			if (parsed.role !== 'user') { continue; }
			turnNumber++;
			turns.push(this.buildDevinCliTurn(chain, i, parsed.text, session, turnNumber));
		}
		return { turns };
	}

	/** Per-turn token estimates are derived directly from message text length (~4 chars/token),
	 * since no confirmed per-turn cost/usage data exists in cogs_json (see class doc comment). */
	private buildDevinCliTurn(
		chain: ReturnType<DevinCliDataAccess['buildMainChain']>,
		userIndex: number,
		userText: string,
		session: Awaited<ReturnType<DevinCliDataAccess['readSession']>>,
		turnNumber: number
	): ChatTurn {
		let assistantText = '';
		for (let j = userIndex + 1; j < chain.length; j++) {
			const next = this.devinCli.parseChatMessage(chain[j].chat_message);
			if (next.role === 'user') { break; }
			if (next.role === 'assistant') { assistantText += (assistantText ? '\n' : '') + next.text; }
		}
		const node = chain[userIndex];
		return {
			turnNumber,
			timestamp: node.created_at ? new Date(node.created_at * 1000).toISOString() : null,
			mode: 'cli',
			userMessage: userText,
			assistantResponse: assistantText,
			model: session?.model || null,
			toolCalls: [],
			contextReferences: createEmptyContextRefs(),
			mcpTools: [],
			inputTokensEstimate: Math.ceil(userText.length / 4),
			outputTokensEstimate: Math.ceil(assistantText.length / 4),
			thinkingTokensEstimate: 0
		};
	}

	async getDailyFractions(sessionFile: string): Promise<Record<string, number>> {
		return this.devinCli.getDailyFractions(sessionFile);
	}

	async analyzeUsage(sessionFile: string, ctx: UsageAnalysisAdapterContext): Promise<import('../types').SessionUsageAnalysis> {
		const analysis = createEmptySessionUsageAnalysis();
		const session = await this.devinCli.readSession(sessionFile);
		const nodes = await this.devinCli.getMessageNodes(sessionFile);
		const chain = this.devinCli.buildMainChain(nodes, session?.main_chain_id ?? null);
		const toolCalls = await this.devinCli.getToolCalls(sessionFile);
		const model = session?.model || 'unknown';
		const models: string[] = [];
		for (const node of chain) {
			const parsed = this.devinCli.parseChatMessage(node.chat_message);
			if (parsed.role === 'user') { analysis.modeUsage.cli++; models.push(model); }
		}
		analysis.toolCalls.total = toolCalls.length;
		for (const tc of toolCalls) {
			const toolName = this.extractToolName(tc.tool_call_json);
			analysis.toolCalls.byTool[toolName] = (analysis.toolCalls.byTool[toolName] || 0) + 1;
		}
		const uniqueModels = [...new Set(models)];
		analysis.modelSwitching.uniqueModels = uniqueModels;
		analysis.modelSwitching.modelCount = uniqueModels.length;
		analysis.modelSwitching.totalRequests = models.length;
		applyModelTierClassification(ctx.modelPricing, uniqueModels, models, analysis);
		return analysis;
	}

	private extractToolName(toolCallJson: string | null): string {
		if (!toolCallJson) { return 'unknown'; }
		try {
			const parsed = JSON.parse(toolCallJson) as Record<string, unknown>;
			const title = parsed['title'] ?? parsed['name'] ?? parsed['kind'];
			return typeof title === 'string' && title ? title : 'unknown';
		} catch {
			return 'unknown';
		}
	}
}
