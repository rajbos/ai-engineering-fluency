import type { ChatTurn } from '../types';
import { createEmptyContextRefs } from '../tokenEstimation';

/**
 * Turn building shared by the OpenCode-family adapters (OpenCode and Kilo Code),
 * whose session stores use the same message/part shape: user and assistant
 * messages linked by `parentID`, text and tool parts per message, and a cumulative
 * `tokens.total` on assistant messages.
 */

type ToolCall = { toolName: string; arguments?: string; result?: string };

/** The message fields the turn builder reads. */
interface OpenCodeFamilyMessage {
	id: string;
	role?: string;
	parentID?: string;
	modelID?: string;
	model?: { modelID?: string };
	time?: { created?: number };
	tokens?: { total?: number; output?: number; reasoning?: number };
}

/** The part fields the turn builder reads. */
interface OpenCodeFamilyPart {
	type?: string;
	text?: string;
	tool?: string;
	state?: { input?: unknown; output?: string };
}

/** Loads the parts of one message from the editor's session store. */
export type OpenCodeFamilyPartsLoader = (messageId: string) => Promise<OpenCodeFamilyPart[]>;

/** Builds the chat turns for a session from its ordered messages. */
export async function buildOpenCodeFamilyTurns(messages: OpenCodeFamilyMessage[], getParts: OpenCodeFamilyPartsLoader): Promise<ChatTurn[]> {
	const turns: ChatTurn[] = [];
	let prevCumulativeTotal = 0;
	let turnNumber = 0;
	for (let i = 0; i < messages.length; i++) {
		const msg = messages[i];
		if (msg.role !== 'user') { continue; }
		turnNumber++;
		const turnAssistantMsgs = messages.filter((m, idx) => idx > i && m.role === 'assistant' && m.parentID === msg.id);
		const userParts = await getParts(msg.id);
		const userText = userParts.filter(p => p.type === 'text').map(p => p.text || '').join('\n');
		const turnData = await processAssistantMessages(turnAssistantMsgs, prevCumulativeTotal, getParts);
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
	return turns;
}

async function processAssistantMessages(turnAssistantMsgs: OpenCodeFamilyMessage[], prevCumulativeTotal: number, getParts: OpenCodeFamilyPartsLoader): Promise<{
	assistantText: string; toolCalls: ToolCall[];
	model: string | null; thinkingTokens: number; turnCumulativeTotal: number; turnOutputAndThinking: number;
}> {
	let assistantText = '';
	const toolCalls: ToolCall[] = [];
	let model: string | null = null;
	let thinkingTokens = 0;
	let turnCumulativeTotal = prevCumulativeTotal;
	for (const assistantMsg of turnAssistantMsgs) {
		if (!model) { model = assistantMsg.modelID || assistantMsg.model?.modelID || null; }
		thinkingTokens += assistantMsg.tokens?.reasoning || 0;
		if (typeof assistantMsg.tokens?.total === 'number') {
			turnCumulativeTotal = Math.max(turnCumulativeTotal, assistantMsg.tokens.total);
		}
		const assistantParts = await getParts(assistantMsg.id);
		for (const part of assistantParts) {
			assistantText += processPart(part, toolCalls);
		}
	}
	const turnOutputAndThinking = turnAssistantMsgs.reduce((sum, m) => sum + (m.tokens?.output || 0) + (m.tokens?.reasoning || 0), 0);
	return { assistantText, toolCalls, model, thinkingTokens, turnCumulativeTotal, turnOutputAndThinking };
}

function processPart(part: OpenCodeFamilyPart, toolCalls: ToolCall[]): string {
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
