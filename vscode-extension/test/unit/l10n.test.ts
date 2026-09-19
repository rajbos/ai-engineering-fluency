import test from 'node:test';
import * as assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import * as vscode from 'vscode';
import { t } from '../../src/l10n';
import { ENGLISH_BUNDLE, resolvedLocale } from '../../src/l10nCore';
import { INSIGHT_CATALOG, evaluateInsights } from '../../src/insightsEngine';
import { insightFixtureContexts } from './fixtures/insightContexts';
import { WHATS_NEW_RELEASES } from '../../src/whatsNew/catalog';

const mock = (vscode as any).__mock;

// The shim's default l10n.t returns the raw key — exactly what real VS Code
// does for key-based calls on the default (English) display language.

test('l10n: VS Code-provided bundle translation takes precedence', () => {
	mock.setL10nBundle({ 'statusBar.loadingText': 'Chargement…' });
	assert.equal(t('statusBar.loadingText'), 'Chargement…');
	mock.setL10nBundle(null);
});

test('l10n: VS Code bundle args are passed through', () => {
	mock.setL10nBundle({ 'statusBar.analyzingLogs': 'Analyse: {0}%' });
	assert.equal(t('statusBar.analyzingLogs', '42'), 'Analyse: 42%');
	mock.setL10nBundle(null);
});

test('l10n: resolves English from the inlined package.nls.json when VS Code returns the raw key', () => {
	const value = t('statusBar.loadingText');
	assert.notEqual(value, 'statusBar.loadingText');
	assert.ok(value.includes('AI Fluency'), `expected English text, got: ${value}`);
});

test('l10n: inlined fallback formats {0} placeholders', () => {
	assert.equal(t('statusBar.analyzingLogs', '42'), '$(loading~spin) Analyzing Logs: 42%');
});

test('l10n: resolves zh-cn strings when the display language is zh-cn', () => {
	mock.setLanguage('zh-cn');
	assert.equal(t('nav.btnRefresh'), '刷新');
	mock.setLanguage('en');
});

test('l10n: bare language tag zh matches the zh-cn bundle', () => {
	mock.setLanguage('zh');
	assert.equal(t('nav.btnRefresh'), '刷新');
	mock.setLanguage('en');
});

test('l10n: zh-tw does not get the Simplified Chinese bundle', () => {
	mock.setLanguage('zh-tw');
	assert.equal(t('nav.btnRefresh'), 'Refresh');
	mock.setLanguage('en');
});

test('l10n: unknown key returns the key itself and warns once', () => {
	const warnings: string[] = [];
	const originalWarn = console.warn;
	console.warn = (msg: unknown) => { warnings.push(String(msg)); };
	try {
		assert.equal(t('no.such.key.exists'), 'no.such.key.exists');
		t('no.such.key.exists');
	} finally {
		console.warn = originalWarn;
	}
	assert.equal(warnings.length, 1);
	assert.ok(warnings[0].includes('No localization found for key "no.such.key.exists"'));
});

// Keys added for the dialog/toast buttons and insights status bar name
// (PR #1876 follow-up) — guards against raw keys resurfacing in the UI.
test('l10n: dialog button and insights status bar keys resolve in English', () => {
	const expected: Record<string, string> = {
		'statusBar.nameInsights': 'AI Engineering Fluency — Insights',
		'button.openSettings': 'Open Settings',
		'button.openUsageAnalysis': 'Open Usage Analysis',
		'button.openInsightsTab': 'Open Insights tab',
		'button.removeOldExtension': 'Remove Old Extension',
		'button.dismiss': 'Dismiss',
	};
	for (const [key, english] of Object.entries(expected)) {
		assert.equal(t(key), english, `English value for ${key}`);
	}
});

test('l10n: dialog button and insights status bar keys resolve in zh-cn', () => {
	mock.setLanguage('zh-cn');
	try {
		const expected: Record<string, string> = {
			'statusBar.nameInsights': 'AI 工程熟练度 —— 洞察',
			'button.openSettings': '打开设置',
			'button.openUsageAnalysis': '打开使用分析',
			'button.openInsightsTab': '打开洞察标签页',
			'button.removeOldExtension': '删除旧扩展',
			'button.dismiss': '忽略',
		};
		for (const [key, chinese] of Object.entries(expected)) {
			assert.equal(t(key), chinese, `zh-cn value for ${key}`);
		}
	} finally {
		mock.setLanguage('en');
	}
});

test('l10n: clipboard-failure keys resolve in English', () => {
	// Added with the `copyFailed` handler: before it existed the webview posted
	// this and nothing on the extension side listened, so a failed copy was
	// completely silent.
	const expected: Record<string, string> = {
		'usage.copyFailed': 'Could not copy the path to the clipboard.',
		'usage.copyFailed.retry': 'Copy Again',
	};
	for (const [key, english] of Object.entries(expected)) {
		assert.equal(t(key), english, `English value for ${key}`);
	}
});

test('l10n: clipboard-failure keys resolve in zh-cn', () => {
	mock.setLanguage('zh-cn');
	try {
		const expected: Record<string, string> = {
			'usage.copyFailed': '无法将路径复制到剪贴板。',
			'usage.copyFailed.retry': '重新复制',
		};
		for (const [key, chinese] of Object.entries(expected)) {
			assert.equal(t(key), chinese, `zh-cn value for ${key}`);
		}
	} finally {
		mock.setLanguage('en');
	}
});

// Keys rendered into the share-card PNG export (PR #2035) — guards against raw
// keys resurfacing in the exported image for every locale.
test('l10n: share-card export keys resolve in English', () => {
	const expected: Record<string, string> = {
		'share.exportTitle': 'AI Engineering Fluency Score',
		'share.exportReportLabel': 'Report',
	};
	for (const [key, english] of Object.entries(expected)) {
		assert.equal(t(key), english, `English value for ${key}`);
	}
});

test('l10n: share-card export keys resolve in zh-cn', () => {
	mock.setLanguage('zh-cn');
	try {
		const expected: Record<string, string> = {
			'share.exportTitle': 'AI 工程熟练度评分',
			'share.exportReportLabel': '报告',
		};
		for (const [key, chinese] of Object.entries(expected)) {
			assert.equal(t(key), chinese, `zh-cn value for ${key}`);
		}
	} finally {
		mock.setLanguage('en');
	}
});

test('l10n: usage context-pressure keys resolve in English', () => {
	// These back the two context-pressure rows in the Usage view's Context
	// Window section. A missing key would render a raw
	// `usage.contextPressure.compactedLabel` as the row label.
	const expected: Record<string, string> = {
		'usage.contextPressure.compactedLabel': '🗜️ Sessions compacted',
		'usage.contextPressure.noneCompacted': 'No session ran out of context window in this period',
		'usage.contextPressure.nearLimitLabel': '⚠️ Sessions near the limit',
	};
	for (const [key, english] of Object.entries(expected)) {
		assert.equal(t(key), english, `English value for ${key}`);
	}
	assert.equal(t('usage.contextPressure.ofCount', '3', '12'), '3 of 12');
	assert.equal(t('usage.contextPressure.worstFill', '94'), 'Fullest session reached 94% of its window');
	assert.equal(
		t('usage.contextPressure.compactedShare', '25'),
		'25% of sessions with context data lost earlier turns to automatic compaction',
	);
	assert.match(t('usage.contextPressure.nearLimitTooltip', '80'), /at least 80% of their context window/);
	assert.match(t('usage.contextPressure.compactedTooltip'), /counted per session rather than per compaction event/);
});

test('l10n: usage context-pressure keys resolve in zh-cn', () => {
	mock.setLanguage('zh-cn');
	try {
		const expected: Record<string, string> = {
			'usage.contextPressure.compactedLabel': '🗜️ 已压缩的会话',
			'usage.contextPressure.noneCompacted': '本期间没有会话耗尽上下文窗口',
			'usage.contextPressure.nearLimitLabel': '⚠️ 接近上限的会话',
		};
		for (const [key, chinese] of Object.entries(expected)) {
			assert.equal(t(key), chinese, `zh-cn value for ${key}`);
		}
		// The Chinese phrasing reorders the two counts, so the placeholders are
		// not positional in the same way as English — a plain concatenation
		// would silently produce "3 个中的 12 个".
		assert.equal(t('usage.contextPressure.ofCount', '3', '12'), '12 个中的 3 个');
		assert.equal(t('usage.contextPressure.worstFill', '94'), '最满的会话达到了其窗口的 94%');
	} finally {
		mock.setLanguage('en');
	}
});

test('l10n: efficiency Value empty-state keys resolve in English', () => {
	// These back the Value tab's empty state: the explanation and the "Open Repository PRs"
	// button beside it. A missing key would render a raw `efficiency.value.*` in the panel.
	assert.equal(t('efficiency.value.openRepositoryPrs'), 'Open Repository PRs');
	assert.equal(t('efficiency.value.prsHintDestination'), 'Usage Analysis → Repository PRs');
	assert.equal(
		t('efficiency.value.prsHint', '<b>Usage Analysis → Repository PRs</b>'),
		'💡 Connect GitHub and open <b>Usage Analysis → Repository PRs</b> once to add pull-request metrics here — merged PRs are a far better value signal than lines of code.',
	);
});

test('l10n: efficiency Value empty-state keys resolve in zh-cn', () => {
	mock.setLanguage('zh-cn');
	try {
		assert.equal(t('efficiency.value.openRepositoryPrs'), '打开仓库 PR');
		assert.equal(t('efficiency.value.prsHintDestination'), '使用分析 → 仓库 PR');
		// The Chinese phrasing puts the destination after the verb rather than before "once",
		// so the placeholder is not positional in the same way as English.
		assert.equal(
			t('efficiency.value.prsHint', '<b>使用分析 → 仓库 PR</b>'),
			'💡 连接 GitHub 并打开一次 <b>使用分析 → 仓库 PR</b>，即可在此处添加拉取请求指标——已合并的 PR 是比代码行数更好的价值信号。',
		);
	} finally {
		mock.setLanguage('en');
	}
});

test('l10n: Recent Sessions context-fill keys resolve in English', () => {
	// These back the Recent Sessions "Context" column and the "near context
	// limit" filter pill the context-pressure insight links to. A missing key
	// would put a raw `usage.sessions.contextFill.nearLimitFilter` on the pill.
	assert.equal(t('usage.sessions.contextFill.columnLabel'), 'Context');
	assert.equal(t('usage.sessions.contextFill.nearLimitFilter'), '🧠 Near context limit');
	assert.equal(
		t('usage.sessions.contextFill.nearLimitFilterTooltip', '80'),
		'Show only sessions that reached at least 80% of their context window without compacting',
	);
	assert.equal(t('usage.sessions.contextFill.used', '120,000', '200,000'), '120,000 of 200,000 context tokens used');
	assert.equal(
		t('usage.sessions.contextFill.usedNearLimit', '190,000', '200,000', '80'),
		'190,000 of 200,000 context tokens used — at or past 80% of the window',
	);
	assert.match(t('usage.sessions.contextFill.noData'), /only GitHub Copilot CLI sessions report one/);
});

test('l10n: Recent Sessions context-fill keys resolve in zh-cn', () => {
	mock.setLanguage('zh-cn');
	try {
		assert.equal(t('usage.sessions.contextFill.columnLabel'), '上下文');
		assert.equal(t('usage.sessions.contextFill.nearLimitFilter'), '🧠 接近上下文上限');
		// The Chinese phrasing reorders the reached/limit counts, so a plain
		// concatenation would report the two numbers the wrong way round.
		assert.equal(t('usage.sessions.contextFill.used', '120,000', '200,000'), '已使用 200,000 个上下文 token 中的 120,000 个');
		assert.equal(
			t('usage.sessions.contextFill.usedNearLimit', '190,000', '200,000', '80'),
			'已使用 200,000 个上下文 token 中的 190,000 个——达到或超过窗口的 80%',
		);
		assert.match(t('usage.sessions.contextFill.nearLimitFilterTooltip', '80'), /至少 80%/);
	} finally {
		mock.setLanguage('en');
	}
});

test("l10n: what's-new notification keys resolve in English", () => {
	// The two buttons on the one-a-day new-feature notification. A missing key
	// here would put a raw `whatsNew.takeMeThere` on the button, which is the
	// kind of thing nobody notices until a user reports it.
	const expected: Record<string, string> = {
		'whatsNew.takeMeThere': 'Take me there',
		'whatsNew.seeAll': 'See what else is new',
	};
	for (const [key, english] of Object.entries(expected)) {
		assert.equal(t(key), english, `English value for ${key}`);
	}
});

test("l10n: what's-new notification keys resolve in zh-cn", () => {
	mock.setLanguage('zh-cn');
	try {
		const expected: Record<string, string> = {
			'whatsNew.takeMeThere': '带我去看看',
			'whatsNew.seeAll': '查看其他新增内容',
		};
		for (const [key, chinese] of Object.entries(expected)) {
			assert.equal(t(key), chinese, `zh-cn value for ${key}`);
		}
	} finally {
		mock.setLanguage('en');
	}
});

// Log viewer summary card labels (PR #2045 follow-up) — guards against raw
// keys resurfacing in the log viewer summary cards for every locale.
test('l10n: log viewer summary card labels resolve in English', () => {
	const expected: Record<string, string> = {
		'logviewer.summary.interactions': 'Interactions',
		'logviewer.summary.editorMode': 'Editor Mode',
		'logviewer.summary.estimatedTokens': 'Estimated Tokens',
		'logviewer.summary.actualTokens': 'Actual Tokens',
		'logviewer.summary.modelTurns': 'Model Turns',
		'logviewer.summary.inputTokens': 'Input Tokens',
		'logviewer.summary.outputTokens': 'Output Tokens',
		'logviewer.summary.cachedInput': 'Cached Input',
		'logviewer.summary.thinkingTokens': 'Thinking Tokens',
		'logviewer.summary.thinkingEffort': 'Thinking Effort',
		'logviewer.summary.subAgents': 'Sub-Agents',
		'logviewer.summary.contextTruncated': 'Context Truncated',
		'logviewer.summary.sessionHierarchy': 'Session Hierarchy',
		'logviewer.summary.toolCalls': 'Tool Calls',
		'logviewer.summary.mcpTools': 'MCP Tools',
		'logviewer.summary.contextRefs': 'Context Refs',
		'logviewer.summary.fileName': 'File Name',
		'logviewer.summary.editor': 'Editor',
		'logviewer.summary.editorSource': 'Source',
		'logviewer.summary.mcpAndContextRefs': 'MCP Tools & Context Refs',
		'logviewer.summary.noModeData': 'No mode data',
		'logviewer.summary.noneShort': 'None',
		'logviewer.summary.otherCount': 'Other: {0}',
		'logviewer.summary.contextRefsBreakdown': 'implicit {0}, explicit {1}',
		'logviewer.summary.fileSize': 'File Size',
		'logviewer.summary.modified': 'Modified',
		'logviewer.summary.timeline': 'Timeline',
		'logviewer.summary.started': 'Started',
		'logviewer.summary.lastActivity': 'Last activity',
	};
	for (const [key, english] of Object.entries(expected)) {
		assert.equal(t(key), english, `English value for ${key}`);
	}
});

test('l10n: efficiency Cost Attribution labels resolve in English', () => {
	const expected: Record<string, string> = {
		'efficiency.attribution.costEffect': 'Estimated cost effect',
		'efficiency.attribution.costEffectLine': 'Estimated cost effect: {0}',
		'efficiency.attribution.change': 'Change',
		'efficiency.attribution.periodSub': '{0} · {1} sessions · {2} tokens',
		'efficiency.attribution.blendedRate': 'blended rate {0} → {1} per M tokens',
		'efficiency.attribution.tooltip.volume': 'Session count: {0} → {1} sessions',
		'efficiency.attribution.tooltip.size': 'Tokens per session: {0} → {1} tokens/session',
		'efficiency.attribution.tooltip.mix': 'Blended price: {0} → {1} per M tokens',
	};
	for (const [key, english] of Object.entries(expected)) {
		assert.equal(t(key), english, `English value for ${key}`);
	}
});

test('l10n: efficiency Cost Attribution labels resolve in zh-cn', () => {
	mock.setLanguage('zh-cn');
	try {
		const expected: Record<string, string> = {
			'efficiency.attribution.costEffect': '预计成本影响',
			'efficiency.attribution.costEffectLine': '预计成本影响：{0}',
			'efficiency.attribution.change': '变化',
			'efficiency.attribution.periodSub': '{0} · {1} 个会话 · {2} 个令牌',
			'efficiency.attribution.blendedRate': '混合费率 {0} → {1} 每百万令牌',
			'efficiency.attribution.tooltip.volume': '会话数：{0} → {1} 个会话',
			'efficiency.attribution.tooltip.size': '每会话令牌数：{0} → {1} 令牌/会话',
			'efficiency.attribution.tooltip.mix': '混合单价：{0} → {1} 每百万令牌',
		};
		for (const [key, chinese] of Object.entries(expected)) {
			assert.equal(t(key), chinese, `zh-cn value for ${key}`);
		}
	} finally {
		mock.setLanguage('en');
	}
});

test('l10n: log viewer summary card labels resolve in zh-cn', () => {
	mock.setLanguage('zh-cn');
	try {
		const expected: Record<string, string> = {
			'logviewer.summary.interactions': '交互次数',
			'logviewer.summary.editorMode': '编辑器模式',
			'logviewer.summary.estimatedTokens': '预计令牌数',
			'logviewer.summary.actualTokens': '实际令牌数',
			'logviewer.summary.modelTurns': '模型轮次',
			'logviewer.summary.inputTokens': '输入令牌',
			'logviewer.summary.outputTokens': '输出令牌',
			'logviewer.summary.cachedInput': '缓存输入',
			'logviewer.summary.thinkingTokens': '思考令牌',
			'logviewer.summary.thinkingEffort': '思考强度',
			'logviewer.summary.subAgents': '子代理',
			'logviewer.summary.contextTruncated': '上下文截断',
			'logviewer.summary.sessionHierarchy': '会话层级',
			'logviewer.summary.toolCalls': '工具调用',
			'logviewer.summary.mcpTools': 'MCP 工具',
			'logviewer.summary.contextRefs': '上下文引用',
			'logviewer.summary.fileName': '文件名',
			'logviewer.summary.editor': '编辑器',
			'logviewer.summary.editorSource': '来源',
			'logviewer.summary.mcpAndContextRefs': 'MCP 工具与上下文引用',
			'logviewer.summary.noModeData': '无模式数据',
			'logviewer.summary.noneShort': '无',
			'logviewer.summary.otherCount': '其他：{0}',
			'logviewer.summary.contextRefsBreakdown': '隐式 {0}，显式 {1}',
			'logviewer.summary.fileSize': '文件大小',
			'logviewer.summary.modified': '修改时间',
			'logviewer.summary.timeline': '时间线',
			'logviewer.summary.started': '开始',
			'logviewer.summary.lastActivity': '最后活动',
		};
		for (const [key, chinese] of Object.entries(expected)) {
			assert.equal(t(key), chinese, `zh-cn value for ${key}`);
		}
	} finally {
		mock.setLanguage('en');
	}
});

test('l10n: efficiency loading step labels resolve in English', () => {
	const expected: Record<string, string> = {
		'loading.efficiency.dailyActivity': 'Aggregating daily activity…',
		'loading.efficiency.usageAnalysis': 'Analysing usage patterns…',
		'loading.efficiency.sessionSignals': 'Reading session signals…',
		'loading.efficiency.buildingTrends': 'Building efficiency trends…',
		'efficiency.error.title': 'Could not build the Efficiency view',
		'efficiency.error.retry': 'Try again',
		'efficiency.error.staleAfterClear': 'The cached data was cleared while this view was being built.',
	};
	for (const [key, english] of Object.entries(expected)) {
		assert.equal(t(key), english, `English value for ${key}`);
	}
});

test('l10n: main refresh loading step labels resolve in English', () => {
	const expected: Record<string, string> = {
		'loading.refresh.calculatingStats': 'Calculating usage statistics…',
		'loading.refresh.analyzingUsage': 'Analysing usage patterns…',
		'loading.refresh.scoringFluency': 'Scoring AI fluency…',
	};
	for (const [key, english] of Object.entries(expected)) {
		assert.equal(t(key), english, `English value for ${key}`);
	}
});

// Diagnostics — Mistral Cloud (Beta) tab (PR #2057 follow-up) — guards against
// raw English literals resurfacing in the new tab for non-English locales.
test('l10n: Mistral Cloud tab labels resolve in English', () => {
	const expected: Record<string, string> = {
		'mistral.tabCaption': '🔥 Mistral Cloud (Beta)',
		'mistral.tabTitle': '🔥 Mistral Vibe Cloud Sessions',
		'mistral.betaBadge': 'Beta',
		'mistral.description.intro': 'Lists conversations from your Mistral account via the beta {0} API on {1}.',
		'mistral.description.scope': 'This is the closest available surface to Vibe Code Web (cloud) sessions; it is {0} and may not include all cloud sessions.',
		'mistral.description.undocumented': 'undocumented for Vibe Code Web specifically',
		'mistral.description.keyStorage': 'Requires a Mistral API key stored locally; it is sent only to {0} over HTTPS.',
		'mistral.status.label': 'Status',
		'mistral.status.configured': 'API key configured',
		'mistral.status.notConfigured': 'No API key configured',
		'mistral.status.checking': 'Checking…',
		'mistral.status.checkFailed': "Couldn't check whether an API key is configured.",
		'mistral.summary.conversations': 'Conversations',
		'mistral.summary.ofCount': '{0} of {1}',
		'mistral.summary.atLeastCount': '{0}+',
		'mistral.summary.lastFetched': 'Last fetched',
		'mistral.error.label': 'Error:',
		'mistral.error.storeFailed': 'Failed to store the Mistral API key.',
		'mistral.error.keyCheckFailed': "Couldn't verify the Mistral API key is still current; try Refresh again.",
		'mistral.error.removeFailed': 'Failed to remove the Mistral API key.',
		'mistral.button.refresh': 'Refresh',
		'mistral.button.retry': 'Retry',
		'mistral.button.removeApiKey': 'Remove API key',
		'mistral.button.connectApiKey': 'Connect Mistral API key',
		'mistral.prompt.title': 'Mistral API Key',
		'mistral.prompt.enterApiKey': 'Enter your Mistral API key (stored in VS Code SecretStorage, used to call api.mistral.ai):',
		'mistral.prompt.required': 'API key is required',
		'mistral.table.id': 'ID',
		'mistral.table.name': 'Name',
		'mistral.table.agentId': 'Agent ID',
		'mistral.table.version': 'Version',
		'mistral.table.created': 'Created',
		'mistral.table.updated': 'Updated',
		'mistral.table.description': 'Description',
		'mistral.table.untitled': '(untitled)',
	};
	for (const [key, english] of Object.entries(expected)) {
		assert.equal(t(key), english, `English value for ${key}`);
	}
});

test('l10n: Cost Attribution model-mix table labels resolve in English', () => {
	const expected: Record<string, string> = {
		'efficiency.modelMix.heading': 'Model mix movement',
		'efficiency.modelMix.caption': 'Token share per model, {0} compared with {1}',
		'efficiency.modelMix.model': 'Model',
		'efficiency.modelMix.previous': 'Previous',
		'efficiency.modelMix.current': 'Current',
		'efficiency.modelMix.shift': 'Shift',
		'efficiency.modelMix.shiftPoints': '{0} pt',
		'efficiency.modelMix.canonicalId': 'Model ID: {0}',
	};
	for (const [key, english] of Object.entries(expected)) {
		assert.equal(t(key), english, `English value for ${key}`);
	}
});

test('l10n: Cost Attribution model-mix table labels resolve in zh-cn', () => {
	mock.setLanguage('zh-cn');
	try {
		const expected: Record<string, string> = {
			'efficiency.modelMix.heading': '模型组合变化',
			'efficiency.modelMix.caption': '各模型的令牌占比，{0} 与 {1} 对比',
			'efficiency.modelMix.model': '模型',
			'efficiency.modelMix.previous': '上一期',
			'efficiency.modelMix.current': '本期',
			'efficiency.modelMix.shift': '变化',
			'efficiency.modelMix.shiftPoints': '{0} 个百分点',
			'efficiency.modelMix.canonicalId': '模型 ID：{0}',
		};
		for (const [key, chinese] of Object.entries(expected)) {
			assert.equal(t(key), chinese, `zh-cn value for ${key}`);
		}
	} finally {
		mock.setLanguage('en');
	}
});

// HydraFusion Routing section + Session Steps Overview leg toggle (PR #2059
// follow-up) — guards against raw keys resurfacing in the new cost/leg UI.
test('l10n: HydraFusion routing keys resolve in English', () => {
	const expected: Record<string, string> = {
		'logviewer.hydrafusion.cost': 'Cost',
		'logviewer.hydrafusion.costForTurn': 'Cost for this turn',
		'logviewer.hydrafusion.jumpToStepTitle': 'Jump to step #{0} in the Session Steps Overview below',
		'logviewer.hydrafusion.jumpToStepLabel': 'step #{0}',
		'logviewer.hydrafusion.turnDetailIntro': 'Expand a turn to see each leg, what it decided, and what it cost. ● marks the leg whose output you actually received; ✗ marks a leg a judge rejected. The same legs also appear under their step in the Session Steps Overview below.',
		'logviewer.hydrafusion.toggleLegsAriaLabel': 'Toggle HydraFusion legs for step #{0}',
		'logviewer.hydrafusion.showLegsTitle': 'Show the HydraFusion legs behind this step',
		'logviewer.hydrafusion.legsCaptionTotal': '⚡ HydraFusion legs for step #{0} — total',
		'logviewer.hydrafusion.modelChangedTitle': 'Model changed from the previous step',
		'logviewer.hydrafusion.expandStepNote': '⚡ expand a step to see the HydraFusion legs behind it',
	};
	for (const [key, english] of Object.entries(expected)) {
		assert.equal(t(key), english, `English value for ${key}`);
	}
});

test('l10n: efficiency loading step labels resolve in zh-cn', () => {
	mock.setLanguage('zh-cn');
	try {
		const expected: Record<string, string> = {
			'loading.efficiency.dailyActivity': '正在汇总每日活动…',
			'loading.efficiency.usageAnalysis': '正在分析使用模式…',
			'loading.efficiency.sessionSignals': '正在读取会话信号…',
			'loading.efficiency.buildingTrends': '正在构建效率趋势…',
			'efficiency.error.title': '无法构建效率视图',
			'efficiency.error.retry': '重试',
			'efficiency.error.staleAfterClear': '构建此视图时缓存数据已被清除。',
		};
		for (const [key, chinese] of Object.entries(expected)) {
			assert.equal(t(key), chinese, `zh-cn value for ${key}`);
		}
	} finally {
		mock.setLanguage('en');
	}
});

test('l10n: cache-clear epoch-not-persisted warning resolves in English and zh-cn', () => {
	assert.equal(t('cacheClear.epochNotPersistedWarning'),
		'Cache cleared, but could not confirm the clear to other open windows — they may still show stale data until you clear the cache again. Reloading statistics...');

	mock.setLanguage('zh-cn');
	try {
		assert.equal(t('cacheClear.epochNotPersistedWarning'),
			'缓存已清除，但无法确认其他打开的窗口已收到清除通知——在再次清除缓存之前，它们可能仍显示旧数据。正在重新加载统计数据……');
	} finally {
		mock.setLanguage('en');
	}
});

test('l10n: main refresh loading step labels resolve in zh-cn', () => {
	mock.setLanguage('zh-cn');
	try {
		const expected: Record<string, string> = {
			'loading.refresh.calculatingStats': '正在计算使用统计…',
			'loading.refresh.analyzingUsage': '正在分析使用模式…',
			'loading.refresh.scoringFluency': '正在评估 AI 熟练度…',
		};
		for (const [key, chinese] of Object.entries(expected)) {
			assert.equal(t(key), chinese, `zh-cn value for ${key}`);
		}
	} finally {
		mock.setLanguage('en');
	}
});

test('l10n: Mistral Cloud tab labels resolve in zh-cn', () => {
	mock.setLanguage('zh-cn');
	try {
		const expected: Record<string, string> = {
			'mistral.tabCaption': '🔥 Mistral 云(测试版)',
			'mistral.tabTitle': '🔥 Mistral Vibe 云会话',
			'mistral.betaBadge': '测试版',
			'mistral.description.intro': '通过测试版 {0} API（位于 {1}）列出你的 Mistral 账户中的对话。',
			'mistral.description.scope': '这是最接近 Vibe Code Web(云端)会话的可用的途径，{0}，且可能无法包含所有云端会话。',
			'mistral.description.undocumented': '未针对 Vibe Code Web 专门提供文档',
			'mistral.description.keyStorage': '需要在本地存储的 Mistral API 密钥;它仅通过 HTTPS 发送到 {0}。',
			'mistral.status.label': '状态',
			'mistral.status.configured': '已配置 API 密钥',
			'mistral.status.notConfigured': '未配置 API 密钥',
			'mistral.status.checking': '检查中…',
			'mistral.status.checkFailed': '无法检查是否已配置 API 密钥。',
			'mistral.summary.conversations': '对话数',
			'mistral.summary.ofCount': '{1} 个中的 {0} 个',
			'mistral.summary.atLeastCount': '{0}+',
			'mistral.summary.lastFetched': '最后获取时间',
			'mistral.error.label': '错误:',
			'mistral.error.storeFailed': '存储 Mistral API 密钥失败。',
			'mistral.error.keyCheckFailed': '无法确认 Mistral API 密钥是否仍然有效，请重新点击刷新。',
			'mistral.error.removeFailed': '无法移除 Mistral API 密钥。',
			'mistral.prompt.title': 'Mistral API 密钥',
			'mistral.prompt.enterApiKey': '输入你的 Mistral API 密钥(存储在 VS Code SecretStorage 中,用于调用 api.mistral.ai):',
			'mistral.prompt.required': '需要输入 API 密钥',
			'mistral.button.refresh': '刷新',
			'mistral.button.retry': '重试',
			'mistral.button.removeApiKey': '移除 API 密钥',
			'mistral.button.connectApiKey': '连接 Mistral API 密钥',
			'mistral.table.id': 'ID',
			'mistral.table.name': '名称',
			'mistral.table.agentId': '代理 ID',
			'mistral.table.version': '版本',
			'mistral.table.created': '创建时间',
			'mistral.table.updated': '更新时间',
			'mistral.table.description': '描述',
			'mistral.table.untitled': '(未命名)',
		};
		for (const [key, chinese] of Object.entries(expected)) {
			assert.equal(t(key), chinese, `zh-cn value for ${key}`);
		}
	} finally {
		mock.setLanguage('en');
	}
});

test('l10n: HydraFusion routing keys resolve in zh-cn', () => {
	mock.setLanguage('zh-cn');
	try {
		const expected: Record<string, string> = {
			'logviewer.hydrafusion.cost': '费用',
			'logviewer.hydrafusion.costForTurn': '本轮费用',
			'logviewer.hydrafusion.jumpToStepTitle': '跳转到下方会话步骤概览中的第 {0} 步',
			'logviewer.hydrafusion.jumpToStepLabel': '第 {0} 步',
			'logviewer.hydrafusion.turnDetailIntro': '展开一轮以查看每个环节、它做出的决定以及它的花费。● 标记你实际收到输出的环节；✗ 标记被评审拒绝的环节。相同的环节也会出现在下方会话步骤概览中对应的步骤下。',
			'logviewer.hydrafusion.toggleLegsAriaLabel': '切换第 {0} 步的 HydraFusion 环节',
			'logviewer.hydrafusion.showLegsTitle': '显示此步骤背后的 HydraFusion 环节',
			'logviewer.hydrafusion.legsCaptionTotal': '⚡ 第 {0} 步的 HydraFusion 环节 — 总计',
			'logviewer.hydrafusion.modelChangedTitle': '模型较上一步已更改',
			'logviewer.hydrafusion.expandStepNote': '⚡ 展开某一步以查看其背后的 HydraFusion 环节',
		};
		for (const [key, chinese] of Object.entries(expected)) {
			assert.equal(t(key), chinese, `zh-cn value for ${key}`);
		}
	} finally {
		mock.setLanguage('en');
	}
});

test('l10n: Mistral Cloud description templates format {0}/{1} placeholders', () => {
	assert.equal(
		t('mistral.description.intro', '<code>GET /v1/conversations</code>', '<code>api.mistral.ai</code>'),
		'Lists conversations from your Mistral account via the beta <code>GET /v1/conversations</code> API on <code>api.mistral.ai</code>.',
	);
	assert.equal(
		t('mistral.description.keyStorage', '<code>api.mistral.ai</code>'),
		'Requires a Mistral API key stored locally; it is sent only to <code>api.mistral.ai</code> over HTTPS.',
	);
	assert.equal(t('mistral.summary.ofCount', '3', '12'), '3 of 12');
	assert.equal(t('mistral.summary.atLeastCount', '2000'), '2000+');
});

test('l10n: Mistral Cloud ofCount reorders placeholders in zh-cn', () => {
	mock.setLanguage('zh-cn');
	try {
		// Mirrors usage.contextPressure.ofCount: the Chinese phrasing puts the total
		// before the count, so a plain concatenation would silently misorder it.
		assert.equal(t('mistral.summary.ofCount', '3', '12'), '12 个中的 3 个');
	} finally {
		mock.setLanguage('en');
	}
});

// Efficiency view — Models tab empty states. These explain why a window cannot
// form a comparison, so they must not surface in English for zh-CN users.
test('l10n: Efficiency Models tab empty states resolve in English', () => {
	mock.setLanguage('en');
	const expected: Record<string, string> = {
		'efficiency.models.noPairInWindow': 'Only one model was used in {0} ({1}), so there is no pair to compare. Pick a wider window, or switch to \u201cOne model, two periods\u201d.',
		'efficiency.models.noModelsInWindow': 'No model was used in {0} ({1}). Pick a wider window.',
		'efficiency.models.noSharedModel': 'No model was used in both {0} ({1}) and {2} ({3}), so there is no model to follow across those periods. Pick different periods, or switch to \u201cCompare two models\u201d.',
		'efficiency.models.noSecondModel': '\u2014 no second model in this window \u2014',
	};
	for (const [key, english] of Object.entries(expected)) {
		assert.equal(t(key), english, `English value for ${key}`);
	}
});

test('l10n: Efficiency Models tab empty states resolve in zh-cn', () => {
	mock.setLanguage('zh-cn');
	try {
		const expected: Record<string, string> = {
			'efficiency.models.noPairInWindow': '{0}\uff08{1}\uff09\u5185\u53ea\u4f7f\u7528\u4e86\u4e00\u4e2a\u6a21\u578b\uff0c\u65e0\u6cd5\u7ec4\u6210\u5bf9\u6bd4\u3002\u8bf7\u9009\u62e9\u66f4\u5927\u7684\u65f6\u95f4\u7a97\u53e3\uff0c\u6216\u5207\u6362\u5230\u201c\u5355\u4e2a\u6a21\u578b\uff0c\u4e24\u4e2a\u65f6\u6bb5\u201d\u3002',
			'efficiency.models.noModelsInWindow': '{0}\uff08{1}\uff09\u5185\u672a\u4f7f\u7528\u4efb\u4f55\u6a21\u578b\u3002\u8bf7\u9009\u62e9\u66f4\u5927\u7684\u65f6\u95f4\u7a97\u53e3\u3002',
			'efficiency.models.noSecondModel': '\u2014 \u6b64\u65f6\u95f4\u7a97\u53e3\u5185\u6ca1\u6709\u7b2c\u4e8c\u4e2a\u6a21\u578b \u2014',
		};
		for (const [key, chinese] of Object.entries(expected)) {
			assert.equal(t(key), chinese, `zh-cn value for ${key}`);
		}
		// The two-window message is the only one carrying four placeholders.
		const shared = t('efficiency.models.noSharedModel');
		assert.equal(
			shared,
			'\u6ca1\u6709\u6a21\u578b\u540c\u65f6\u5728{0}\uff08{1}\uff09\u548c{2}\uff08{3}\uff09\u5185\u4f7f\u7528\u8fc7\uff0c\u56e0\u6b64\u65e0\u6cd5\u8de8\u8fd9\u4e24\u4e2a\u65f6\u6bb5\u8ddf\u8e2a\u540c\u4e00\u4e2a\u6a21\u578b\u3002\u8bf7\u9009\u62e9\u5176\u4ed6\u65f6\u6bb5\uff0c\u6216\u5207\u6362\u5230\u201c\u5bf9\u6bd4\u4e24\u4e2a\u6a21\u578b\u201d\u3002',
			'zh-cn value for efficiency.models.noSharedModel',
		);
	} finally {
		mock.setLanguage('en');
	}
});

test('l10n: Efficiency Models tab control labels resolve in English and zh-cn', () => {
	mock.setLanguage('en');
	const english: Record<string, string> = {
		'efficiency.models.controls.mode': 'Mode',
		'efficiency.models.controls.modelA': 'Model A',
		'efficiency.models.controls.modelB': 'Model B',
		'efficiency.models.controls.model': 'Model',
		'efficiency.models.controls.baseline': 'Baseline',
		'efficiency.models.controls.comparedWith': 'Compared with',
		'efficiency.models.controls.window': 'Window',
		'efficiency.models.mode.models': 'Compare two models',
		'efficiency.models.mode.periods': 'One model, two periods',
	};
	for (const [key, value] of Object.entries(english)) {
		assert.equal(t(key), value, `English value for ${key}`);
	}

	mock.setLanguage('zh-cn');
	try {
		const chinese: Record<string, string> = {
			'efficiency.models.controls.mode': '\u6a21\u5f0f',
			'efficiency.models.controls.modelA': '\u6a21\u578b A',
			'efficiency.models.controls.modelB': '\u6a21\u578b B',
			'efficiency.models.controls.model': '\u6a21\u578b',
			'efficiency.models.controls.baseline': '\u57fa\u51c6\u65f6\u6bb5',
			'efficiency.models.controls.comparedWith': '\u5bf9\u6bd4\u65f6\u6bb5',
			'efficiency.models.controls.window': '\u65f6\u95f4\u7a97\u53e3',
			'efficiency.models.mode.models': '\u5bf9\u6bd4\u4e24\u4e2a\u6a21\u578b',
			'efficiency.models.mode.periods': '\u5355\u4e2a\u6a21\u578b\uff0c\u4e24\u4e2a\u65f6\u6bb5',
		};
		for (const [key, value] of Object.entries(chinese)) {
			assert.equal(t(key), value, `zh-cn value for ${key}`);
		}
	} finally {
		mock.setLanguage('en');
	}
});

test('l10n: Copilot Memory Files section strings resolve in English and zh-cn', () => {
	mock.setLanguage('en');
	const english: Record<string, string> = {
		'memoryFiles.sectionTitle': 'Copilot Memory Files',
		'memoryFiles.sectionSubtitle': 'Agent-written memory notes on disk (project conventions, decisions, scratch plans) \u2014 metadata only, content is never read',
		'memoryFiles.summary': '{0} files \u00b7 {1} total',
		'memoryFiles.staleSummary': '{0} stale (>{1}d)',
		'memoryFiles.largeSummary': '{0} unusually large (>{1}KB)',
		'memoryFiles.table.workspace': 'Workspace',
		'memoryFiles.table.repo': 'Repo',
		'memoryFiles.table.session': 'Session',
		'memoryFiles.table.global': 'Global',
		'memoryFiles.table.size': 'Size',
		'memoryFiles.table.stale': 'Stale',
		'memoryFiles.table.lastUpdated': 'Last updated',
		'memoryFiles.unknownWorkspace': 'Unknown workspace',
		'memoryFiles.globalWorkspaceLabel': 'User (global)',
		'memoryFiles.renderError': 'Memory files are temporarily unavailable due to a rendering error. Try Refresh.',
	};
	for (const [key, value] of Object.entries(english)) {
		assert.equal(t(key), value, `English value for ${key}`);
	}
	assert.equal(t('memoryFiles.summary', '4', '24 KB'), '4 files \u00b7 24 KB total');
	assert.equal(t('memoryFiles.staleSummary', '2', '90'), '2 stale (>90d)');
	assert.equal(t('memoryFiles.largeSummary', '1', '10'), '1 unusually large (>10KB)');

	mock.setLanguage('zh-cn');
	try {
		const chinese: Record<string, string> = {
			'memoryFiles.sectionTitle': 'Copilot \u8bb0\u5fc6\u6587\u4ef6',
			'memoryFiles.sectionSubtitle': '\u4ee3\u7406\u5199\u5165\u78c1\u76d8\u7684\u8bb0\u5fc6\u7b14\u8bb0\uff08\u9879\u76ee\u7ea6\u5b9a\u3001\u51b3\u7b56\u3001\u8349\u7a3f\u8ba1\u5212\uff09\u2014 \u4ec5\u5143\u6570\u636e\uff0c\u4ece\u4e0d\u8bfb\u53d6\u6587\u4ef6\u5185\u5bb9',
			'memoryFiles.summary': '{0} \u4e2a\u6587\u4ef6 \u00b7 \u5171 {1}',
			'memoryFiles.staleSummary': '{0} \u4e2a\u8fc7\u671f\uff08\u8d85\u8fc7 {1} \u5929\uff09',
			'memoryFiles.largeSummary': '{0} \u4e2a\u5f02\u5e38\u5927\uff08\u8d85\u8fc7 {1}KB\uff09',
			'memoryFiles.table.workspace': '\u5de5\u4f5c\u533a',
			'memoryFiles.table.repo': '\u4ed3\u5e93',
			'memoryFiles.table.session': '\u4f1a\u8bdd',
			'memoryFiles.table.global': '\u5168\u5c40',
			'memoryFiles.table.size': '\u5927\u5c0f',
			'memoryFiles.table.stale': '\u8fc7\u671f',
			'memoryFiles.table.lastUpdated': '\u6700\u8fd1\u66f4\u65b0',
			'memoryFiles.unknownWorkspace': '\u672a\u77e5\u5de5\u4f5c\u533a',
			'memoryFiles.globalWorkspaceLabel': '\u7528\u6237\uff08\u5168\u5c40\uff09',
			'memoryFiles.renderError': '\u7531\u4e8e\u6e32\u67d3\u9519\u8bef\uff0c\u8bb0\u5fc6\u6587\u4ef6\u6682\u65f6\u4e0d\u53ef\u7528\u3002\u8bf7\u5c1d\u8bd5\u5237\u65b0\u3002',
		};
		for (const [key, value] of Object.entries(chinese)) {
			assert.equal(t(key), value, `zh-cn value for ${key}`);
		}
	} finally {
		mock.setLanguage('en');
	}
});

test('l10n: Copilot Budget gauge keys resolve in English', () => {
	// Back the "🎯 Copilot Budget" tooltip row, which folds untracked (other
	// devices/cloud) usage into the headline total so it agrees with the bar's
	// percentage, plus its sub-rows: the tracked/untracked split on one line each
	// and remaining budget on its own. A missing key would put a raw key like
	// `tooltip.budgetRemaining` in the hover tooltip.
	assert.equal(t('tooltip.copilotBudgetLabel'), 'Copilot Budget');
	assert.equal(t('tooltip.budgetRemaining', '$40.79'), '$40.79 left');
	assert.equal(t('tooltip.budgetOverBy', '$12.34'), '$12.34 over');
	assert.equal(t('tooltip.budgetTrackedHere', '$556.61'), '$556.61 tracked here');
	assert.equal(t('tooltip.budgetUntracked', '$202.60'), '$202.60 untracked (other devices/cloud)');
});

test('l10n: Copilot Budget gauge keys resolve in zh-cn', () => {
	mock.setLanguage('zh-cn');
	try {
		assert.equal(t('tooltip.copilotBudgetLabel'), 'Copilot 预算');
		assert.equal(t('tooltip.budgetRemaining', '$40.79'), '剩余 $40.79');
		assert.equal(t('tooltip.budgetOverBy', '$12.34'), '超出 $12.34');
		assert.equal(t('tooltip.budgetTrackedHere', '$556.61'), '本设备跟踪 $556.61');
		assert.equal(t('tooltip.budgetUntracked', '$202.60'), '未跟踪(其他设备/云端) $202.60');
	} finally {
		mock.setLanguage('en');
	}
});

test('l10n: Claude Desktop coverage keys resolve in English', () => {
	// Back the Recent Sessions banner that explains why Claude Desktop lists more
	// sessions than this machine can measure. The three summary variants exist
	// because both counts drive agreement independently.
	assert.equal(
		t('usage.claudeDesktopCoverage.summary.oneOfOne', '1', '1'),
		'1 of 1 Claude Desktop session known to this machine has no local transcript left, so it cannot be measured here',
	);
	assert.equal(
		t('usage.claudeDesktopCoverage.summary.singular', '1', '12'),
		'1 of 12 Claude Desktop sessions known to this machine has no local transcript left, so it cannot be measured here',
	);
	assert.equal(
		t('usage.claudeDesktopCoverage.summary.plural', '69', '145'),
		'69 of 145 Claude Desktop sessions known to this machine have no local transcript left, so they cannot be measured here',
	);
	assert.match(t('usage.claudeDesktopCoverage.tooltip'), /cleanupPeriodDays/);
	assert.match(t('usage.claudeDesktopCoverage.tooltip'), /never write a transcript to this machine/);
});

test('l10n: Claude Desktop coverage keys resolve in zh-cn', () => {
	mock.setLanguage('zh-cn');
	try {
		// Chinese has no verb agreement, so all three variants share one phrasing —
		// but each key must still resolve, or the banner renders a raw key.
		for (const key of ['oneOfOne', 'singular', 'plural']) {
			assert.equal(
				t(`usage.claudeDesktopCoverage.summary.${key}`, '69', '145'),
				'此计算机已知的 145 个 Claude Desktop 会话中，有 69 个已没有本地记录，因此无法在此处统计',
				`zh-cn value for summary.${key}`,
			);
		}
		assert.match(t('usage.claudeDesktopCoverage.tooltip'), /cleanupPeriodDays/);
	} finally {
		mock.setLanguage('en');
	}
});

// ---------------------------------------------------------------------------
// Personalized Insights catalog (issue #2081)
//
// insightsEngine.ts holds 50+ user-facing insights whose titles, bodies and
// action labels all resolve through injected `ctx.translate`. Per AGENTS.md's
// "Localization changes require test coverage" rule, that whole surface needs
// English + zh-CN coverage — table-driven over the catalog and the bundle
// rather than one assertion per key, because there are ~180 of them.
// ---------------------------------------------------------------------------

const INSIGHT_PREFIX = 'insight.';

/** Every `insight.*` key shipped in the English bundle. */
function insightKeys(): string[] {
	return Object.keys(ENGLISH_BUNDLE).filter(k => k.startsWith(INSIGHT_PREFIX));
}

/** The `{0}`, `{1}` … indices a template uses, as a sorted array. */
function placeholders(template: string): string[] {
	return [...new Set([...template.matchAll(/\{(\d+)\}/g)].map(m => m[1]))].sort();
}

test('insights l10n: the catalog actually has keys to cover', () => {
	// Guards the tests below against silently passing on an empty set if the
	// catalog is ever refactored to a different key prefix.
	assert.ok(insightKeys().length > 150, `expected the insight catalog's keys, got ${insightKeys().length}`);
	assert.equal(INSIGHT_CATALOG.length, 53, 'catalog size changed — update the expected count deliberately');
});

test('insights l10n: every catalog title and action label resolves in English', () => {
	for (const def of INSIGHT_CATALOG) {
		for (const key of [def.titleKey, def.actionLabelKey, def.secondaryActionLabelKey]) {
			if (key === undefined) { continue; }
			const value = t(key);
			assert.notEqual(value, key, `${def.id}: "${key}" has no entry in package.nls.json`);
			assert.ok(value.length > 0, `${def.id}: "${key}" resolved to an empty string`);
		}
	}
});

test('insights l10n: every catalog title and action label resolves in zh-cn', () => {
	mock.setLanguage('zh-cn');
	try {
		for (const def of INSIGHT_CATALOG) {
			for (const key of [def.titleKey, def.actionLabelKey, def.secondaryActionLabelKey]) {
				if (key === undefined) { continue; }
				const value = t(key);
				assert.notEqual(value, key, `${def.id}: "${key}" missing from package.nls.zh-cn.json`);
				// Not asserting the text differs from English: a few labels are
				// product names or command names that correctly stay identical.
				assert.ok(value.length > 0, `${def.id}: "${key}" resolved to an empty string in zh-cn`);
			}
		}
	} finally {
		mock.setLanguage('en');
	}
});

test('insights l10n: every insight key has a zh-cn translation', () => {
	mock.setLanguage('zh-cn');
	try {
		const untranslated = insightKeys().filter(k => t(k) === ENGLISH_BUNDLE[k]);
		// Every insight string is prose, so unlike the two known product-name keys
		// elsewhere in the bundle, none of these may fall back to English.
		assert.deepEqual(untranslated, [], 'these insight keys fall back to English on a zh-cn install');
	} finally {
		mock.setLanguage('en');
	}
});

test('insights l10n: zh-cn templates use exactly the English placeholder set', () => {
	// Order may differ — zh-CN deliberately reorders clauses in several of these
	// (e.g. lowContextDiversity puts the session count before the percentage) —
	// but a *missing* index silently drops a live number from the sentence, and
	// an *extra* one renders a literal "{3}" to the user.
	const mismatches: string[] = [];
	for (const key of insightKeys()) {
		mock.setLanguage('zh-cn');
		const zh = t(key);
		mock.setLanguage('en');
		const en = t(key);
		const a = placeholders(en).join(','), b = placeholders(zh).join(',');
		if (a !== b) { mismatches.push(`${key}: en={${a}} zh-cn={${b}}`); }
	}
	mock.setLanguage('en');
	assert.deepEqual(mismatches, []);
});

test('insights l10n: the bundle carries no orphaned insight keys', () => {
	// A key nobody references is dead weight a translator still pays for. Keys
	// are built dynamically (`plural()` appends `.one`/`.other`, and a couple of
	// insights compose `.oneSession.otherEvents`-style suffixes), so a key counts
	// as referenced when it — or the prefix it is derived from — appears in the
	// engine's source.
	// Tests run compiled out of `out/`, so __dirname does not sit next to the
	// real source tree — same hop the other source-reading tests use.
	const source = readFileSync(join(__dirname, '../../../../src/insightsEngine.ts'), 'utf8');
	const orphans = insightKeys().filter(key => {
		const parts = key.split('.');
		// Try the full key, then progressively shorter prefixes, down to the two
		// dynamic suffix segments this file actually builds.
		for (let drop = 0; drop <= 2; drop++) {
			const candidate = parts.slice(0, parts.length - drop).join('.');
			if (candidate.length <= INSIGHT_PREFIX.length) { continue; }
			// Either a plain `'insight.x.y'` literal or the fixed head of a
			// template literal whose suffix is computed (`` `insight.x.${form}` ``).
			// Anchoring on the opening quote character keeps a key from matching a
			// longer, unrelated key that merely starts with the same text.
			// Every quote style, not just the one insightsEngine.ts happens to use
			// today — matching one silently turns a style change into false orphans.
			if (["'", '\"', '`'].some((q) => source.includes(q + candidate))) { return false; }
		}
		return true;
	});
	assert.deepEqual(orphans, [], 'these insight keys are in the bundle but never referenced');
});

test('insights l10n: evaluated insights never leak a raw key into the UI', () => {
	// The end-to-end guard the per-key tests cannot give: t() falls back to
	// returning the key itself for an unknown key, so a typo inside buildBody
	// ships "insight.foo.body" as the visible body text rather than throwing.
	const seen: string[] = [];
	for (const lang of ['en', 'zh-cn']) {
		mock.setLanguage(lang);
		try {
			for (const ctx of insightFixtureContexts(t)) {
				for (const insight of evaluateInsights(ctx, {}, 7, null)) {
					for (const text of [insight.title, insight.body, insight.actionLabel, insight.secondaryActionLabel]) {
						if (text && text.includes(INSIGHT_PREFIX)) {
							seen.push(`${lang}/${insight.id}: ${text}`);
						}
					}
				}
			}
		} finally {
			mock.setLanguage('en');
		}
	}
	assert.deepEqual(seen, [], 'unresolved localization keys rendered as insight text');
});

test('insights l10n: the fixtures render every insight in the catalog', () => {
	// The guarantee the "never leak a raw key" test above depends on: it can only
	// catch a bad key inside an insight that actually fires. Without this, adding
	// an insight with no matching fixture would quietly shrink that test's reach
	// instead of failing.
	const fired = new Set<string>();
	for (const ctx of insightFixtureContexts(t)) {
		for (const insight of evaluateInsights(ctx, {}, 7, null)) { fired.add(insight.id); }
	}
	const never = INSIGHT_CATALOG.map(d => d.id).filter(id => !fired.has(id));
	assert.deepEqual(never, [], 'add a fixture context to test/unit/fixtures/insightContexts.ts for these');
});
// ---------------------------------------------------------------------------
// Locale resolution across script and region variants
//
// Raised in review on #2138: the native hosts (and resolveLocaleId itself) only
// tried the full tag and its bare language, so `zh-Hans` — Simplified Chinese
// with a script but no region — fell through to English even though a zh-cn
// bundle ships. Matching on language + script after Intl maximization fixes the
// whole family at once, while keeping Traditional Chinese out.
// ---------------------------------------------------------------------------

test('l10n: Simplified Chinese tags all resolve to the zh-cn bundle', () => {
	for (const tag of ['zh', 'zh-cn', 'zh-CN', 'zh-Hans', 'zh-Hans-CN', 'zh-SG']) {
		assert.equal(resolvedLocale(tag), 'zh-cn', `${tag} should get Simplified Chinese`);
	}
});

test('l10n: Traditional Chinese tags never get the Simplified bundle', () => {
	// The regression this guards is worse than showing English: Traditional
	// readers would be served Simplified text as if it were their language.
	for (const tag of ['zh-TW', 'zh-Hant', 'zh-Hant-TW', 'zh-HK', 'zh-MO']) {
		assert.equal(resolvedLocale(tag), 'en', `${tag} must not get Simplified Chinese`);
	}
});

test('l10n: unshipped and malformed tags fall back to English', () => {
	// `constructor`/`__proto__` also cover the prototype-pollution guard: a
	// lowercase prototype key must not read back as a shipped locale.
	for (const tag of ['fr', 'de-DE', 'pt-BR', 'constructor', '__proto__', 'not a tag', '']) {
		assert.equal(resolvedLocale(tag), 'en', `${tag || '(empty)'} should fall back to English`);
	}
});

test('l10n: zh-Hans actually renders Chinese strings, not just resolves', () => {
	mock.setLanguage('zh-Hans');
	try {
		assert.equal(t('nav.btnRefresh'), '刷新');
	} finally {
		mock.setLanguage('en');
	}
});

// ---------------------------------------------------------------------------
// What's New catalog (step 5 of the localization ADR)
//
// catalog.ts is a pure module holding nls keys rather than prose; extension.ts
// resolves them at the render boundary. These keys reach two surfaces — the
// What's New view and the one-a-day toast — so an unresolved one is doubly
// visible.
// ---------------------------------------------------------------------------

test('whats-new l10n: every catalog key resolves in English and zh-cn', () => {
	const keys: string[] = [];
	for (const release of WHATS_NEW_RELEASES) {
		keys.push(release.headlineKey);
		for (const feature of release.features) {
			keys.push(feature.titleKey, feature.descriptionKey);
		}
	}
	assert.ok(keys.length > 20, `expected the whole catalog's keys, got ${keys.length}`);

	for (const key of keys) {
		assert.notEqual(t(key), key, `${key} has no package.nls.json entry`);
	}

	mock.setLanguage('zh-cn');
	try {
		const untranslated = keys.filter(k => t(k) === ENGLISH_BUNDLE[k]);
		// Release headlines and feature copy are prose; none may fall back.
		assert.deepEqual(untranslated, [], 'these What\'s New keys fall back to English on zh-cn');
	} finally {
		mock.setLanguage('en');
	}
});
