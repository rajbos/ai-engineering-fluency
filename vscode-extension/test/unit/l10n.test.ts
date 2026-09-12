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

test('l10n: environmental methodology keys resolve in English', () => {
	const expected: Record<string, string> = {
		'environmental.intro': 'All figures are estimates. CO₂ uses a paper-backed output-equivalent token model; water and analogies use average reference values. Treat these as order-of-magnitude indicators, not precise measurements.',
		'environmental.methodology.heading': 'Calculation & Estimates',
		'environmental.methodology.co2Paper': 'Estimated CO₂ uses Jegham et al., "How Hungry is AI? Benchmarking Energy, Water, and Carbon Footprint of LLM Inference", with a baseline of 840 g CO₂e per 1M output-equivalent tokens.',
		'environmental.methodology.co2Weights': 'Output-equivalent token weights: output = 1.0, uncached input = 0.05, cache write = 0.0625, cache read = 0.0005. Cache-aware weighting is only used when per-model token breakdowns are available; otherwise the tracker falls back to the legacy flat estimate.',
		'environmental.methodology.cost': 'Cost (UBB) uses GitHub Copilot AI Credit rates (1 credit = $0.01) under Usage Based Billing.',
		'environmental.methodology.water': 'Estimated water usage remains based on ~0.3 L per 1,000 total tokens (data center cooling estimates).',
		'environmental.methodology.tree': 'Tree equivalent represents the fraction of a single mature tree\'s annual CO₂ absorption (~21 kg/year).',
		'environmental.methodology.co2Analogies': 'CO₂ analogies: petrol car ≈ 120 g/km · intercity train ≈ 41 g/km · economy flight ≈ 180 g/km (ICAO avg.) · smartphone charge ≈ 8 g · LED bulb ≈ 3 g/hr (10 W, EU grid) · kettle boil ≈ 20 g.',
		'environmental.methodology.waterAnalogies': 'Water analogies: shower ≈ 8 L/min · washing machine ≈ 50 L · standard bathtub ≈ 150 L · dishwasher ≈ 12 L · mug of tea ≈ 250 mL · daily drinking water ≈ 2 L/person.',
		'environmental.methodology.caveat': 'All analogies are order-of-magnitude estimates. Actual values depend on your region\'s energy mix, hardware, model implementation, and caching behavior.',
	};
	for (const [key, english] of Object.entries(expected)) {
		assert.equal(t(key), english, `English value for ${key}`);
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

test('l10n: environmental methodology keys resolve in zh-cn', () => {
	mock.setLanguage('zh-cn');
	try {
		const expected: Record<string, string> = {
			'environmental.intro': '所有数据均为估算值。CO₂ 使用基于论文的“输出当量令牌”模型；用水量和类比值使用平均参考值。请将其视为数量级指标，而非精确测量。',
			'environmental.methodology.heading': '计算与估算',
			'environmental.methodology.co2Paper': 'CO₂ 估算采用 Jegham 等人的论文《How Hungry is AI? Benchmarking Energy, Water, and Carbon Footprint of LLM Inference》，并以每 100 万输出当量令牌 840 g CO₂e 为基线。',
			'environmental.methodology.co2Weights': '输出当量令牌权重：输出 = 1.0，未缓存输入 = 0.05，缓存写入 = 0.0625，缓存读取 = 0.0005。只有在存在按模型拆分的令牌明细时才使用缓存感知权重；否则追踪器会回退到旧的固定估算。',
			'environmental.methodology.cost': '成本（UBB）在按量计费下使用 GitHub Copilot AI Credit 费率（1 个 credit = $0.01）。',
			'environmental.methodology.water': '用水量估算仍基于每 1,000 个总令牌约 0.3 L（数据中心冷却估算）。',
			'environmental.methodology.tree': '树木当量表示一棵成熟树一年吸收 CO₂ 的占比（约 21 kg/年）。',
			'environmental.methodology.co2Analogies': 'CO₂ 类比：汽油车 ≈ 120 g/km · 城际列车 ≈ 41 g/km · 经济舱短途航班 ≈ 180 g/km（ICAO 平均）· 智能手机充满电 ≈ 8 g · LED 灯 ≈ 3 g/小时（10 W，欧盟电网）· 烧开一壶水 ≈ 20 g。',
			'environmental.methodology.waterAnalogies': '用水类比：淋浴 ≈ 8 L/分钟 · 洗衣机 ≈ 50 L · 标准浴缸 ≈ 150 L · 洗碗机 ≈ 12 L · 一杯茶 ≈ 250 mL · 每人每日饮水 ≈ 2 L。',
			'environmental.methodology.caveat': '所有类比都只是数量级估算。实际数值取决于你所在地区的能源结构、硬件、模型实现和缓存行为。',
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
