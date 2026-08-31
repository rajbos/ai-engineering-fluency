export const TASK_CATEGORIES = [
	'Coding',
	'Debugging',
	'Feature Dev',
	'Refactoring',
	'Testing',
	'Exploration',
	'Planning',
	'Delegation',
	'Git Ops',
	'Build/Deploy',
	'Brainstorming',
	'Conversation',
] as const;

export type TaskCategory = typeof TASK_CATEGORIES[number];
export type TaskCategoryBreakdown = Record<TaskCategory, number>;

export interface TaskTurnSignal {
	messageText?: string;
	toolNames?: string[];
	shellCommands?: string[];
}

export interface TaskClassificationResult {
	primaryCategory: TaskCategory;
	categoryShares: TaskCategoryBreakdown;
	turnCategories: TaskCategory[];
	turnCount: number;
}

const CATEGORY_PRIORITY: TaskCategory[] = [
	'Delegation',
	'Git Ops',
	'Build/Deploy',
	'Debugging',
	'Testing',
	'Refactoring',
	'Feature Dev',
	'Planning',
	'Exploration',
	'Coding',
	'Brainstorming',
	'Conversation',
];

const TOOL_PATTERNS: Record<TaskCategory, RegExp[]> = {
	'Coding': [/^(edit|create|write|apply_patch|replace|insert|multi_edit|str_replace)$/i],
	'Debugging': [/^(read|view|grep|rg|diagnostics?|log|trace)$/i],
	'Feature Dev': [],
	'Refactoring': [/^(refactor|rename|move|restructure)$/i],
	'Testing': [/^(test|jest|vitest|pytest|mocha|playwright|cypress)$/i],
	'Exploration': [/^(read|view|grep|rg|glob|search|web_fetch|web_search|ls|list)$/i],
	'Planning': [/^(plan|todo|checklist)$/i],
	'Delegation': [/^(task|agent|subagent|delegate|handoff|write_agent|read_agent)$/i],
	'Git Ops': [/^(git|commit|push|pull|merge|rebase|cherry-pick|branch|pr)$/i],
	'Build/Deploy': [/^(build|deploy|release|docker|k8s|helm|terraform|npm|yarn|pnpm)$/i],
	'Brainstorming': [],
	'Conversation': [],
};

const KEYWORD_PATTERNS: Record<TaskCategory, RegExp[]> = {
	'Coding': [/\b(code|implement|write code|function|class|module|api)\b/i],
	'Debugging': [/\b(debug|bug|fix|error|failing|stack ?trace|investigate|root cause|broken)\b/i],
	'Feature Dev': [/\b(add|create|implement|introduce|support|new feature|build feature)\b/i],
	'Refactoring': [/\b(refactor|rename|simplify|cleanup|clean up|extract|restructure)\b/i],
	'Testing': [/\b(test|tests|unit test|integration test|e2e|pytest|vitest|jest|mocha|cypress)\b/i],
	'Exploration': [/\b(explore|inspect|analyze|understand|investigate|read|search|find where)\b/i],
	'Planning': [/\b(plan|approach|roadmap|steps|outline|strategy)\b/i],
	'Delegation': [/\b(delegate|sub-?agent|spawn agent|handoff|hand off|ask agent)\b/i],
	'Git Ops': [/\b(git|commit|push|pull request|merge|rebase|branch|cherry-pick|tag)\b/i],
	'Build/Deploy': [/\b(build|compile|bundle|deploy|release|publish|docker|kubernetes|ci|cd)\b/i],
	'Brainstorming': [/\b(brainstorm|what if|ideas?|alternatives?|trade-?offs?|design options?)\b/i],
	'Conversation': [],
};

function createEmptyBreakdown(): TaskCategoryBreakdown {
	return TASK_CATEGORIES.reduce((acc, cat) => {
		acc[cat] = 0;
		return acc;
	}, {} as TaskCategoryBreakdown);
}

function pickCategory(scores: TaskCategoryBreakdown): TaskCategory {
	let best = 0;
	let selected: TaskCategory = 'Conversation';
	for (const category of CATEGORY_PRIORITY) {
		const score = scores[category];
		if (score > best) {
			best = score;
			selected = category;
		}
	}
	return best > 0 ? selected : 'Conversation';
}

function scoreTurn(turn: TaskTurnSignal): TaskCategoryBreakdown {
	const scores = createEmptyBreakdown();
	const message = (turn.messageText ?? '').trim();
	const tools = (turn.toolNames ?? []).map(t => t.trim()).filter(Boolean);
	const shellCommands = (turn.shellCommands ?? []).join('\n');
	applyKeywordScores(scores, message);
	applyToolScores(scores, tools);
	applyShellScores(scores, shellCommands);
	applyConversationFallback(scores, message, tools);
	return scores;
}

function applyKeywordScores(scores: TaskCategoryBreakdown, message: string): void {
	for (const [category, patterns] of Object.entries(KEYWORD_PATTERNS) as Array<[TaskCategory, RegExp[]]>) {
		for (const pattern of patterns) {
			if (pattern.test(message)) { scores[category] += 2; }
		}
	}
}

function applyToolScores(scores: TaskCategoryBreakdown, tools: string[]): void {
	for (const tool of tools) {
		for (const [category, patterns] of Object.entries(TOOL_PATTERNS) as Array<[TaskCategory, RegExp[]]>) {
			if (patterns.some(p => p.test(tool))) { scores[category] += 1; }
		}
	}
}

function applyShellScores(scores: TaskCategoryBreakdown, shellCommands: string): void {
	if (/\b(git (commit|push|pull|merge|rebase|checkout|cherry-pick|tag|branch)|gh pr)\b/i.test(shellCommands)) { scores['Git Ops'] += 3; }
	if (/\b(npm (run )?(test|lint|build)|pnpm (test|build)|yarn (test|build)|pytest|vitest|jest|mocha|cypress)\b/i.test(shellCommands)) { scores['Testing'] += 2; }
	if (/\b(npm (run )?build|pnpm build|yarn build|docker (build|push|run)|kubectl|helm|terraform|vercel|netlify)\b/i.test(shellCommands)) { scores['Build/Deploy'] += 2; }
}

function applyConversationFallback(scores: TaskCategoryBreakdown, message: string, tools: string[]): void {
	if (tools.length === 0 && !message) { scores['Conversation'] += 1; }
	if (tools.length === 0 && message && Object.values(scores).every(v => v === 0)) { scores['Conversation'] += 1; }
}

export function classifyTurn(turn: TaskTurnSignal): TaskCategory {
	return pickCategory(scoreTurn(turn));
}

export function classifySessionTurns(turns: TaskTurnSignal[]): TaskClassificationResult {
	const byCategory = createEmptyBreakdown();
	if (turns.length === 0) {
		byCategory['Conversation'] = 1;
		return {
			primaryCategory: 'Conversation',
			categoryShares: byCategory,
			turnCategories: [],
			turnCount: 0,
		};
	}

	const turnCategories = turns.map(classifyTurn);
	for (const category of turnCategories) {
		byCategory[category] += 1;
	}
	for (const category of TASK_CATEGORIES) {
		byCategory[category] = byCategory[category] / turns.length;
	}

	const primaryCategory = pickCategory(byCategory);
	return {
		primaryCategory,
		categoryShares: byCategory,
		turnCategories,
		turnCount: turns.length,
	};
}

export function createEmptyTaskClassificationResult(): TaskClassificationResult {
	const categoryShares = createEmptyBreakdown();
	categoryShares['Conversation'] = 1;
	return {
		primaryCategory: 'Conversation',
		categoryShares,
		turnCategories: [],
		turnCount: 0,
	};
}
