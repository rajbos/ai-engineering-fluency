import { canonicalizeToolId } from '../../src/utils/toolUtils';

export const UNKNOWN_TOOL_RESHOW_THRESHOLD = 3;

export type UnknownToolNotificationDecision = {
	actionableTools: string[];
	newTools: string[];
	shouldShow: boolean;
};

export function sanitizeToolList(tools: Iterable<unknown>): string[] {
	const unique = new Map<string, string>();
	for (const tool of tools) {
		if (typeof tool !== 'string') { continue; }
		const trimmed = tool.trim();
		if (!trimmed) { continue; }
		const canonical = canonicalizeToolId(trimmed);
		if (!canonical || unique.has(canonical)) { continue; }
		unique.set(canonical, trimmed);
	}
	return Array.from(unique.values()).sort((a, b) => a.localeCompare(b));
}

export function mergeToolLists(existing: readonly string[], incoming: Iterable<unknown>): string[] {
	return sanitizeToolList([...existing, ...incoming]);
}

export function excludeTrackedTools(tools: readonly string[], tracked: readonly string[]): string[] {
	const trackedCanonical = new Set(sanitizeToolList(tracked).map(tool => canonicalizeToolId(tool)));
	return sanitizeToolList(tools).filter(tool => !trackedCanonical.has(canonicalizeToolId(tool)));
}

export function evaluateUnknownToolNotification(
	unknownTools: readonly string[],
	dismissedTools: readonly string[],
	reportedTools: readonly string[],
	threshold = UNKNOWN_TOOL_RESHOW_THRESHOLD,
): UnknownToolNotificationDecision {
	const actionableTools = excludeTrackedTools(unknownTools, reportedTools);
	const newTools = excludeTrackedTools(actionableTools, dismissedTools);
	return {
		actionableTools,
		newTools,
		shouldShow: actionableTools.length > 0 && (dismissedTools.length === 0 || newTools.length >= threshold),
	};
}
