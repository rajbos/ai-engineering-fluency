import * as fs from 'fs';
import type { ModelUsage, ChatTurn, ActualUsage } from '../types';
import type { IEcosystemAdapter, IDiscoverableEcosystem, IAnalyzableEcosystem, DiscoveryResult, CandidatePath, UsageAnalysisAdapterContext } from '../ecosystemAdapter';
import { ClaudeDesktopCoworkDataAccess } from '../claudedesktop';
import { createEmptyContextRefs } from '../tokenEstimation';
import { readClaudeCodeEventsForAnalysis, createEmptySessionUsageAnalysis, applyModelTierClassification } from '../usageAnalysis';
import { normalizeClaudeModelId } from '../claudecode';
import { extractClaudeSlashCommand } from './claudeCodeAdapter';

export class ClaudeDesktopAdapter implements IEcosystemAdapter, IDiscoverableEcosystem, IAnalyzableEcosystem {
	readonly id = 'claudedesktop';
	readonly displayName = 'Claude Desktop Cowork';

	constructor(
		private readonly claudeDesktopCowork: ClaudeDesktopCoworkDataAccess,
		private readonly isMcpToolFn: (toolName: string) => boolean,
		private readonly extractMcpServerNameFn: (toolName: string) => string,
		private readonly estimateTokensFn: (text: string, model?: string) => number
	) {}

	handles(sessionFile: string): boolean {
		return this.claudeDesktopCowork.isCoworkSessionFile(sessionFile);
	}

	getBackingPath(sessionFile: string): string {
		return sessionFile;
	}

	async stat(sessionFile: string): Promise<fs.Stats> {
		return fs.promises.stat(sessionFile);
	}

	async getTokens(sessionFile: string): Promise<{ tokens: number; thinkingTokens: number; actualTokens: number }> {
		const result = await this.claudeDesktopCowork.getTokensFromCoworkSession(sessionFile);
		return { ...result, actualTokens: result.tokens };
	}

	async countInteractions(sessionFile: string): Promise<number> {
		return await this.claudeDesktopCowork.countCoworkInteractions(sessionFile);
	}

	async getModelUsage(sessionFile: string): Promise<ModelUsage> {
		return await this.claudeDesktopCowork.getCoworkModelUsage(sessionFile);
	}

	async getMeta(sessionFile: string): Promise<{ title: string | undefined; firstInteraction: string | null; lastInteraction: string | null; workspacePath?: string }> {
		const meta = await this.claudeDesktopCowork.getCoworkSessionMeta(sessionFile);
		return {
			title: meta?.title,
			firstInteraction: meta?.firstInteraction || null,
			lastInteraction: meta?.lastInteraction || null,
			workspacePath: meta?.cwd,
		};
	}

	getEditorRoot(_sessionFile: string): string {
		return this.claudeDesktopCowork.getCoworkBaseDir();
	}

	async discover(log: (msg: string) => void): Promise<DiscoveryResult> {
		const candidatePaths = this.getCandidatePaths();
		const sessionFiles: string[] = [];
		try {
			const files = await this.claudeDesktopCowork.getCoworkSessionFiles();
			if (files.length > 0) {
				log(`📄 Found ${files.length} session file(s) in Claude Desktop Cowork`);
				sessionFiles.push(...files);
			}
		} catch (e) {
			log(`Could not read Claude Desktop Cowork session files: ${e}`);
		}
		return { sessionFiles, candidatePaths };
	}

	getCandidatePaths(): CandidatePath[] {
		const baseDir = this.claudeDesktopCowork.getCoworkBaseDir();
		return baseDir ? [{ path: baseDir, source: 'Claude Desktop (Cowork)' }] : [];
	}

	async buildTurns(sessionFile: string): Promise<{ turns: ChatTurn[]; actualTokens?: number }> {
		const turns: ChatTurn[] = [];
		const events = await this.claudeDesktopCowork.readCoworkEvents(sessionFile);
		let currentUserEvent: any = null;
		const pendingAssistantEvents: any[] = [];

		for (const event of events) {
			if (event.type === 'user' && !event.isSidechain && event.message?.role === 'user' && this.isRealUserMessage(event)) {
				const turn = this.buildTurnFromEvents(currentUserEvent, pendingAssistantEvents, turns.length + 1);
				if (turn) { turns.push(turn); }
				currentUserEvent = event;
				pendingAssistantEvents.length = 0;
			} else if (event.type === 'assistant' && event.message?.stop_reason && event.message?.role === 'assistant') {
				pendingAssistantEvents.push(event);
			}
		}
		const finalTurn = this.buildTurnFromEvents(currentUserEvent, pendingAssistantEvents, turns.length + 1);
		if (finalTurn) { turns.push(finalTurn); }

		return { turns };
	}

	private isRealUserMessage(event: any): boolean {
		const content = event.message?.content;
		if (typeof content === 'string') { return !!content.trim(); }
		if (!Array.isArray(content)) { return false; }
		const hasText = content.some((c: any) => c.type === 'text');
		const hasToolResult = content.some((c: any) => c.type === 'tool_result');
		return hasText && !hasToolResult;
	}

	private buildTurnFromEvents(userEvent: any, pendingAssistantEvents: any[], turnNumber: number): ChatTurn | null {
		if (!userEvent) { return null; }
		const content = userEvent.message?.content;
		const userMessage = typeof content === 'string' ? content
			: Array.isArray(content) ? content.filter((c: any) => c.type === 'text').map((c: any) => c.text || '').join('\n')
			: '';
		const { assistantText, model, actualInputTokens, actualOutputTokens, toolCalls, mcpTools } =
			this.processAssistantEventsForTurn(pendingAssistantEvents);
		const usedModel = model || 'claude-sonnet-4-6';
		const actualUsage: ActualUsage | undefined = (actualInputTokens > 0 || actualOutputTokens > 0) ? {
			promptTokens: actualInputTokens,
			completionTokens: actualOutputTokens
		} : undefined;
		return {
			turnNumber,
			timestamp: userEvent.timestamp ? new Date(userEvent.timestamp).toISOString() : null,
			mode: 'agent',
			userMessage,
			assistantResponse: assistantText,
			model: usedModel,
			toolCalls,
			contextReferences: createEmptyContextRefs(),
			mcpTools,
			inputTokensEstimate: actualInputTokens || this.estimateTokensFn(userMessage, usedModel),
			outputTokensEstimate: actualOutputTokens || this.estimateTokensFn(assistantText, usedModel),
			thinkingTokensEstimate: 0,
			actualUsage
		};
	}

	private processAssistantEventsForTurn(pendingAssistantEvents: any[]): {
		assistantText: string; model: string | null; actualInputTokens: number;
		actualOutputTokens: number; toolCalls: { toolName: string; arguments?: string }[];
		mcpTools: { server: string; tool: string }[];
	} {
		let assistantText = '';
		let actualInputTokens = 0;
		let actualOutputTokens = 0;
		let model: string | null = null;
		const toolCalls: { toolName: string; arguments?: string }[] = [];
		const mcpTools: { server: string; tool: string }[] = [];
		// The Cowork JSONL writes one event per content block for each API call,
		// so multiple events may share the same requestId with identical usage counts.
		// Deduplicate by requestId to avoid counting tokens multiple times per API call.
		const seenRequestIds = new Set<string>();
		for (const ae of pendingAssistantEvents) {
			const msg = ae.message;
			if (!model && msg?.model) { model = msg.model; }
			const reqId = ae.requestId as string | undefined;
			const isFirstOccurrence = !reqId || !seenRequestIds.has(reqId);
			if (reqId) { seenRequestIds.add(reqId); }
			const usage = msg?.usage;
			if (usage && isFirstOccurrence) {
				const tokens = this.extractUsageTokens(usage);
				actualInputTokens += tokens.input;
				actualOutputTokens += tokens.output;
			}
			for (const block of (Array.isArray(msg?.content) ? msg.content : [])) {
				assistantText += this.processEventContentBlock(block, toolCalls, mcpTools);
			}
		}
		return { assistantText, model, actualInputTokens, actualOutputTokens, toolCalls, mcpTools };
	}

	private extractUsageTokens(usage: any): { input: number; output: number } {
		return {
			input: (usage.input_tokens || 0) + (usage.cache_creation_input_tokens || 0) + (usage.cache_read_input_tokens || 0),
			output: usage.output_tokens || 0
		};
	}

	private processEventContentBlock(
		block: any,
		toolCalls: { toolName: string; arguments?: string }[],
		mcpTools: { server: string; tool: string }[]
	): string {
		if (block.type === 'text') { return block.text || ''; }
		if (block.type === 'tool_use') {
			const toolName: string = block.name || 'unknown';
			if (this.isMcpToolFn(toolName)) {
				mcpTools.push({ server: this.extractMcpServerNameFn(toolName), tool: toolName });
			} else {
				toolCalls.push({ toolName, arguments: block.input ? JSON.stringify(block.input) : undefined });
			}
		}
		return '';
	}

	async analyzeUsage(sessionFile: string, ctx: UsageAnalysisAdapterContext): Promise<import('../types').SessionUsageAnalysis> {
		const analysis = createEmptySessionUsageAnalysis();
		const events = await readClaudeCodeEventsForAnalysis(sessionFile);
		const models: string[] = [];
		for (const event of events) {
			if (event.type === 'user' && event.message?.role === 'user' && !event.isSidechain) {
				this.processDesktopUserEvent(event, analysis);
			} else if (event.type === 'assistant') {
				this.processDesktopAssistantEvent(event, analysis, models);
			}
		}
		this.applyDesktopModelSwitchingStats(models, analysis);
		applyModelTierClassification(ctx.modelPricing, analysis.modelSwitching.uniqueModels, models, analysis);
		return analysis;
	}

	private processDesktopUserEvent(event: any, analysis: import('../types').SessionUsageAnalysis): void {
		analysis.modeUsage.ask++;
		const cmd = extractClaudeSlashCommand(event.message?.content);
		if (cmd) {
			const key = `__slash__${cmd}`;
			// Note: do NOT increment analysis.toolCalls.total — slash commands are not tool calls
			analysis.toolCalls.byTool[key] = (analysis.toolCalls.byTool[key] || 0) + 1;
		}
	}

	private processDesktopAssistantEvent(event: any, analysis: import('../types').SessionUsageAnalysis, models: string[]): void {
		const model = normalizeClaudeModelId(event.message?.model || 'unknown');
		models.push(model);
		const content: any[] = Array.isArray(event.message?.content) ? event.message.content : [];
		for (const c of content) {
			if (c?.type !== 'tool_use') { continue; }
			analysis.toolCalls.total++;
			const toolName = String(c.name || 'tool');
			analysis.toolCalls.byTool[toolName] = (analysis.toolCalls.byTool[toolName] || 0) + 1;
		}
	}

	private applyDesktopModelSwitchingStats(models: string[], analysis: import('../types').SessionUsageAnalysis): void {
		const uniqueModels = [...new Set(models)];
		analysis.modelSwitching.uniqueModels = uniqueModels;
		analysis.modelSwitching.modelCount = uniqueModels.length;
		analysis.modelSwitching.totalRequests = models.length;
		let switchCount = 0;
		for (let i = 1; i < models.length; i++) {
			if (models[i] !== models[i - 1]) { switchCount++; }
		}
		analysis.modelSwitching.switchCount = switchCount;
	}
}
