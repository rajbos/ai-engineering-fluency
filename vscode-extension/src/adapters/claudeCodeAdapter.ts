import * as fs from 'fs';
import type { ModelUsage, ChatTurn, ActualUsage } from '../types';
import type { IEcosystemAdapter, IDiscoverableEcosystem, IAnalyzableEcosystem, DiscoveryResult, CandidatePath, UsageAnalysisAdapterContext } from '../ecosystemAdapter';
import { ClaudeCodeDataAccess, normalizeClaudeModelId } from '../claudecode';
import { readClaudeCodeEventsForAnalysis, createEmptySessionUsageAnalysis, applyModelTierClassification } from '../usageAnalysis';
import { isMcpTool, extractMcpServerName } from '../workspaceHelpers';
import { createEmptyContextRefs } from '../tokenEstimation';

/**
 * Claude Code slash commands that map to Prompt Engineering fluency.
 * These are stored in toolCalls.byTool with a __slash__ prefix so they
 * are tracked without inflating tool call counts or agentic metrics.
 */
const CLAUDE_SLASH_ALLOWLIST = new Set(['review', 'bug', 'think', 'compact', 'pr_comments']);

/**
 * Extract a Claude slash command from the first non-empty text line of a user message.
 * Returns the command name (without leading '/') if found and in the allowlist, else null.
 * Only matches at the very start of the message to avoid false-positives from pasted code.
 * Exported for reuse by other Claude-family adapters.
 */
export function extractClaudeSlashCommand(content: unknown): string | null {
	let text = '';
	if (typeof content === 'string') {
		text = content;
	} else if (Array.isArray(content)) {
		for (const block of content) {
			if (block?.type === 'text' && typeof block.text === 'string') {
				text = block.text;
				break;
			}
		}
	}
	const firstLine = text.trimStart().split('\n')[0].trim();
	const m = firstLine.match(/^\/([a-z_]+)(?:\s|$)/i);
	if (!m) { return null; }
	const cmd = m[1].toLowerCase();
	return CLAUDE_SLASH_ALLOWLIST.has(cmd) ? cmd : null;
}

export class ClaudeCodeAdapter implements IEcosystemAdapter, IDiscoverableEcosystem, IAnalyzableEcosystem {
	readonly id = 'claudecode';
	readonly displayName = 'Claude Code';

	constructor(
		private readonly claudeCode: ClaudeCodeDataAccess,
		private readonly isMcpToolFn: (toolName: string) => boolean = isMcpTool,
		private readonly extractMcpServerNameFn: (toolName: string, toolNameMap?: Record<string, string>) => string = extractMcpServerName,
		private readonly estimateTokensFn: (text: string, model?: string) => number = () => 0
	) {}

	handles(sessionFile: string): boolean {
		return this.claudeCode.isClaudeCodeSessionFile(sessionFile);
	}

	getBackingPath(sessionFile: string): string {
		return sessionFile;
	}

	async stat(sessionFile: string): Promise<fs.Stats> {
		return fs.promises.stat(sessionFile);
	}

	async getTokens(sessionFile: string): Promise<{ tokens: number; thinkingTokens: number; actualTokens: number }> {
		const result = await this.claudeCode.getTokensFromClaudeCodeSession(sessionFile);
		return { ...result, actualTokens: result.tokens };
	}

	async countInteractions(sessionFile: string): Promise<number> {
		return await this.claudeCode.countClaudeCodeInteractions(sessionFile);
	}

	async getModelUsage(sessionFile: string): Promise<ModelUsage> {
		return await this.claudeCode.getClaudeCodeModelUsage(sessionFile);
	}

	async getMeta(sessionFile: string): Promise<{ title: string | undefined; firstInteraction: string | null; lastInteraction: string | null; workspacePath?: string }> {
		const meta = await this.claudeCode.getClaudeCodeSessionMeta(sessionFile);
		return {
			title: meta?.title,
			firstInteraction: meta?.firstInteraction || null,
			lastInteraction: meta?.lastInteraction || null,
			workspacePath: meta?.cwd,
		};
	}

	getEditorRoot(_sessionFile: string): string {
		return this.claudeCode.getClaudeCodeProjectsDir();
	}

	async discover(log: (msg: string) => void): Promise<DiscoveryResult> {
		const candidatePaths = this.getCandidatePaths();
		const sessionFiles: string[] = [];
		try {
			const files = await this.claudeCode.getClaudeCodeSessionFiles();
			if (files.length > 0) {
				log(`📄 Found ${files.length} session file(s) in Claude Code (~/.claude/projects)`);
				sessionFiles.push(...files);
			}
		} catch (e) {
			log(`Could not read Claude Code session files: ${e}`);
		}
		return { sessionFiles, candidatePaths };
	}

	getCandidatePaths(): CandidatePath[] {
		return [{ path: this.claudeCode.getClaudeCodeProjectsDir(), source: 'Claude Code' }];
	}

	async buildTurns(sessionFile: string): Promise<{ turns: ChatTurn[]; actualTokens?: number }> {
		const turns: ChatTurn[] = [];
		const events = await readClaudeCodeEventsForAnalysis(sessionFile);
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
		// Claude Code writes multiple JSONL entries per API request (streaming fragments + final).
		// Deduplicate by message.id (last-wins) — same logic as ClaudeCodeDataAccess.deduplicateAssistantEvents.
		const seenMessageIds = new Set<string>();
		for (const ae of pendingAssistantEvents) {
			const msg = ae.message;
			if (!model && msg?.model) { model = normalizeClaudeModelId(msg.model); }
			const msgId = msg?.id as string | undefined;
			const isFirstOccurrence = !msgId || !seenMessageIds.has(msgId);
			if (msgId) { seenMessageIds.add(msgId); }
			if (msg?.usage && isFirstOccurrence) {
				actualInputTokens += this.extractInputTokens(msg.usage);
				actualOutputTokens += msg.usage.output_tokens || 0;
			}
			for (const block of (Array.isArray(msg?.content) ? msg.content : [])) {
				assistantText += this.processContentBlock(block, toolCalls, mcpTools);
			}
		}
		return { assistantText, model, actualInputTokens, actualOutputTokens, toolCalls, mcpTools };
	}

	private extractInputTokens(usage: any): number {
		return (usage.input_tokens || 0)
			+ (usage.cache_creation_input_tokens || 0)
			+ (usage.cache_read_input_tokens || 0);
	}

	private processContentBlock(
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
				this.processUserEvent(event, analysis);
			} else if (event.type === 'assistant') {
				this.processAssistantEvent(event, analysis, ctx, models);
			} else if (event.type === 'system' && event.subtype === 'compact_boundary') {
				this.processCompactBoundaryEvent(event, analysis);
			}
		}
		this.applyModelSwitchingStats(models, analysis);
		applyModelTierClassification(ctx.modelPricing, analysis.modelSwitching.uniqueModels, models, analysis);
		return analysis;
	}

	private processCompactBoundaryEvent(event: any, analysis: import('../types').SessionUsageAnalysis): void {
		if (event.compactMetadata?.trigger === 'auto') {
			// Auto-compaction means the context window was exhausted without user action — negative signal.
			// Stored with a double-underscore prefix so it doesn't inflate toolCalls.total.
			analysis.toolCalls.byTool['__auto_compact__'] = (analysis.toolCalls.byTool['__auto_compact__'] || 0) + 1;
		}
	}

	private processUserEvent(event: any, analysis: import('../types').SessionUsageAnalysis): void {
		analysis.modeUsage.cli++;
		const cmd = extractClaudeSlashCommand(event.message?.content);
		if (cmd) {
			const key = `__slash__${cmd}`;
			// Note: do NOT increment analysis.toolCalls.total — slash commands are not tool calls
			analysis.toolCalls.byTool[key] = (analysis.toolCalls.byTool[key] || 0) + 1;
		}
	}

	private processAssistantEvent(event: any, analysis: import('../types').SessionUsageAnalysis, ctx: UsageAnalysisAdapterContext, models: string[]): void {
		const model = normalizeClaudeModelId(event.message?.model || 'unknown');
		models.push(model);
		const content: any[] = Array.isArray(event.message?.content) ? event.message.content : [];
		for (const c of content) {
			if (c?.type !== 'tool_use') { continue; }
			const toolName = String(c.name || 'tool');
			if (isMcpTool(toolName)) {
				const server = extractMcpServerName(toolName, ctx.toolNameMap);
				analysis.mcpTools.total++;
				analysis.mcpTools.byServer[server] = (analysis.mcpTools.byServer[server] || 0) + 1;
				analysis.mcpTools.byTool[toolName] = (analysis.mcpTools.byTool[toolName] || 0) + 1;
			} else {
				analysis.toolCalls.total++;
				analysis.toolCalls.byTool[toolName] = (analysis.toolCalls.byTool[toolName] || 0) + 1;
			}
		}
	}

	private applyModelSwitchingStats(models: string[], analysis: import('../types').SessionUsageAnalysis): void {
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
