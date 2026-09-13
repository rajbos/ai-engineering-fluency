import test from 'node:test';
import * as assert from 'node:assert/strict';

import * as vscode from 'vscode';
import { t } from '../../src/l10n';

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

// Usage view — the GitHub activity freshness banner shared by the Repository PRs and Cloud Agent
// tabs. These are rendered webview-side through localize()/localizeFormat(), so a missing or
// mistranslated key silently shows English to zh-CN users instead of failing anywhere.
test('l10n: GitHub activity freshness banner labels resolve in English', () => {
	const expected: Record<string, string> = {
		'usage.githubActivity.refreshNow': '🔄 Refresh now',
		'usage.githubActivity.refreshNowTooltip': 'Revalidate the cached GitHub data now instead of waiting for the next hourly refresh',
		'usage.githubActivity.notFetchedTitle': 'Not fetched yet.',
		'usage.githubActivity.notFetchedBody': 'The snapshot is refreshed hourly by whichever VS Code window takes it on — it will appear here once that first refresh completes.',
		'usage.githubActivity.revalidatingTitle': 'Revalidating.',
		'usage.githubActivity.revalidatingBody': 'Showing the cached snapshot from {0} while it is refreshed.',
		'usage.githubActivity.updated': '🕒 Updated {0} · next refresh after {1}.',
		'usage.githubActivity.unknownNextRefresh': 'unknown',
		'usage.githubActivity.cachePolicy': 'Automatically revalidated at most once an hour, by a single VS Code window, to keep GitHub API usage low — Refresh now asks for one straight away.',
		'usage.githubActivity.partialTitle': 'Partial data — the figures below are a lower bound.',
		'usage.githubActivity.retryHint': 'Use Refresh now above to retry — details are in the extension Output channel.',
		'usage.githubActivity.partialRepoPrs': 'At least one repository listing did not complete (an error, a timeout, or the page cap), so some pull requests in the window are not counted.',
		'usage.githubActivity.partialAgentTasks': 'Some tasks were not detailed this pass — the task-detail budget was exhausted, or a task listing did not complete.',
		'usage.githubActivity.tasksScannedTooltip': 'Showing {0} of {1} tasks — the rest could not be counted this pass, so these figures are a lower bound',
		'usage.githubActivity.tasksScannedLabel': '({0}/{1} tasks scanned)',
		'usage.githubActivity.lowerBoundNote': 'Note: some figures could not be counted this pass — a listing did not complete, a detail call failed, or the detail budget ran out — so these totals are lower bounds.',
		'usage.githubActivity.accountTasksIncomplete': 'The account-wide task listing stopped early ({0}) — tasks outside your workspace repositories may be missing.',
		'usage.githubActivity.accountTasksUnavailable': 'Account-wide tasks unavailable ({0}) — only workspace repositories are shown.',
		'usage.githubActivity.accountTasksUnknownReason': 'the /agents/tasks endpoint could not be read',
	};
	for (const [key, english] of Object.entries(expected)) {
		assert.equal(t(key), english, `English value for ${key}`);
	}
});

test('l10n: GitHub activity freshness banner labels resolve in zh-cn', () => {
	mock.setLanguage('zh-cn');
	try {
		const expected: Record<string, string> = {
			'usage.githubActivity.refreshNow': '🔄 立即刷新',
			'usage.githubActivity.refreshNowTooltip': '立即重新校验已缓存的 GitHub 数据，无需等待下一次每小时刷新',
			'usage.githubActivity.notFetchedTitle': '尚未获取。',
			'usage.githubActivity.notFetchedBody': '快照由取得刷新权的任一 VS Code 窗口每小时刷新一次 — 首次刷新完成后会显示在这里。',
			'usage.githubActivity.revalidatingTitle': '正在重新校验。',
			'usage.githubActivity.revalidatingBody': '刷新期间显示 {0} 的缓存快照。',
			'usage.githubActivity.updated': '🕒 更新于 {0} · 下次刷新在 {1} 之后。',
			'usage.githubActivity.unknownNextRefresh': '未知',
			'usage.githubActivity.cachePolicy': '由单个 VS Code 窗口最多每小时自动重新校验一次，以降低 GitHub API 用量 —「立即刷新」会马上请求一次。',
			'usage.githubActivity.partialTitle': '数据不完整 — 下方数字为下限值。',
			'usage.githubActivity.retryHint': '使用上方的「立即刷新」重试 — 详细信息见扩展的输出通道。',
			'usage.githubActivity.partialRepoPrs': '至少有一个仓库的列表未能完整枚举（出错、超时或达到分页上限），因此时间窗口内的部分拉取请求未被计入。',
			'usage.githubActivity.partialAgentTasks': '本次未获取全部任务的明细 — 任务明细预算已用尽，或任务列表未能完整枚举。',
			'usage.githubActivity.tasksScannedTooltip': '显示 {1} 个任务中的 {0} 个 — 其余任务本次无法统计，因此以下数字为下限',
			'usage.githubActivity.tasksScannedLabel': '(已扫描 {0}/{1} 个任务)',
			'usage.githubActivity.lowerBoundNote': '注意：本次有部分数据无法统计 — 列表未能完整枚举、明细调用失败，或明细预算已用尽 — 因此以下合计为下限值。',
			'usage.githubActivity.accountTasksIncomplete': '账户级任务列表提前中断（{0}）— 工作区仓库之外的任务可能缺失。',
			'usage.githubActivity.accountTasksUnavailable': '无法获取账户级任务（{0}）— 仅显示工作区仓库。',
			'usage.githubActivity.accountTasksUnknownReason': '无法读取 /agents/tasks 接口',
		};
		for (const [key, chinese] of Object.entries(expected)) {
			assert.equal(t(key), chinese, `zh-cn value for ${key}`);
		}
	} finally {
		mock.setLanguage('en');
	}
});

test('l10n: the banner\'s placeholder templates keep their {0}/{1} slots in both languages', () => {
	// localizeFormat() fills these webview-side; a translation that drops a slot would silently
	// swallow the snapshot age or the next-refresh time.
	for (const key of ['usage.githubActivity.revalidatingBody', 'usage.githubActivity.updated', 'usage.githubActivity.tasksScannedTooltip', 'usage.githubActivity.tasksScannedLabel', 'usage.githubActivity.accountTasksIncomplete', 'usage.githubActivity.accountTasksUnavailable']) {
		assert.match(t(key), /\{0\}/, `English ${key} keeps its {0} slot`);
	}
	for (const key of ['usage.githubActivity.updated', 'usage.githubActivity.tasksScannedTooltip', 'usage.githubActivity.tasksScannedLabel']) {
		assert.match(t(key), /\{1\}/, `English ${key} keeps its {1} slot`);
	}
	mock.setLanguage('zh-cn');
	try {
		for (const key of ['usage.githubActivity.revalidatingBody', 'usage.githubActivity.updated', 'usage.githubActivity.tasksScannedTooltip', 'usage.githubActivity.tasksScannedLabel', 'usage.githubActivity.accountTasksIncomplete', 'usage.githubActivity.accountTasksUnavailable']) {
			assert.match(t(key), /\{0\}/, `zh-cn ${key} keeps its {0} slot`);
		}
		for (const key of ['usage.githubActivity.updated', 'usage.githubActivity.tasksScannedTooltip', 'usage.githubActivity.tasksScannedLabel']) {
			assert.match(t(key), /\{1\}/, `zh-cn ${key} keeps its {1} slot`);
		}
	} finally {
		mock.setLanguage('en');
	}
});
