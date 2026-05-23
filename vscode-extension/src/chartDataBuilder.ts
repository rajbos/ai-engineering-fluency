import type { DailyTokenStats, ChartDataPayload, ModelUsage, LanguageUsage } from './types';
import { addModelUsage } from './statsHelpers';
import { getModelDisplayName } from './webview/shared/modelUtils';

/** Chart.js-compatible colour palette for dataset series. */
export const MODEL_COLORS = [
	{ bg: "rgba(54, 162, 235, 0.6)", border: "rgba(54, 162, 235, 1)" },
	{ bg: "rgba(255, 99, 132, 0.6)", border: "rgba(255, 99, 132, 1)" },
	{ bg: "rgba(75, 192, 192, 0.6)", border: "rgba(75, 192, 192, 1)" },
	{ bg: "rgba(153, 102, 255, 0.6)", border: "rgba(153, 102, 255, 1)" },
	{ bg: "rgba(255, 159, 64, 0.6)", border: "rgba(255, 159, 64, 1)" },
	{ bg: "rgba(255, 205, 86, 0.6)", border: "rgba(255, 205, 86, 1)" },
	{ bg: "rgba(201, 203, 207, 0.6)", border: "rgba(201, 203, 207, 1)" },
	{ bg: "rgba(100, 181, 246, 0.6)", border: "rgba(100, 181, 246, 1)" },
];

/** Returns the colour entry for the given series index, wrapping around the palette. */
export function getModelColor(index: number): { bg: string; border: string } {
	return MODEL_COLORS[index % MODEL_COLORS.length];
}

/** Dependencies injected into buildChartData to decouple it from extension state. */
export interface ChartDataBuilderDeps {
	/** Format a raw repository URL into a short display name (e.g. "owner/repo"). */
	getRepoDisplayName: (url: string) => string;
	/** Estimate USD cost for the given model usage. */
	calculateEstimatedCost: (modelUsage: ModelUsage, pricingSource: 'provider' | 'copilot') => number;
	/** Whether a backend (Azure Storage or team server) is currently configured. */
	backendConfigured: boolean;
	/** Whether compact number formatting is enabled in extension settings. */
	compactNumbers: boolean;
	/** Current date/time. Defaults to `new Date()` when omitted; injectable for testing. */
	now?: Date;
}

type BucketEntry = { label: string; key: string; stats: DailyTokenStats };

function fmtKey(d: Date): string {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function emptyEntry(date: string): DailyTokenStats {
	return { date, tokens: 0, sessions: 0, interactions: 0, modelUsage: {}, editorUsage: {}, repositoryUsage: {} };
}

function mergeInto(target: DailyTokenStats, src: DailyTokenStats): void {
	target.tokens += src.tokens;
	target.sessions += src.sessions;
	target.interactions += src.interactions;
	addModelUsage(target.modelUsage, src.modelUsage);
	for (const [e, u] of Object.entries(src.editorUsage)) {
		if (!target.editorUsage[e]) { target.editorUsage[e] = { tokens: 0, sessions: 0 }; }
		target.editorUsage[e].tokens += u.tokens;
		target.editorUsage[e].sessions += u.sessions;
		if (u.linesAdded !== undefined) { target.editorUsage[e].linesAdded = (target.editorUsage[e].linesAdded ?? 0) + u.linesAdded; }
		if (u.linesRemoved !== undefined) { target.editorUsage[e].linesRemoved = (target.editorUsage[e].linesRemoved ?? 0) + u.linesRemoved; }
	}
	for (const [r, u] of Object.entries(src.repositoryUsage)) {
		if (!target.repositoryUsage[r]) { target.repositoryUsage[r] = { tokens: 0, sessions: 0 }; }
		target.repositoryUsage[r].tokens += u.tokens;
		target.repositoryUsage[r].sessions += u.sessions;
		if (u.linesAdded !== undefined) { target.repositoryUsage[r].linesAdded = (target.repositoryUsage[r].linesAdded ?? 0) + u.linesAdded; }
		if (u.linesRemoved !== undefined) { target.repositoryUsage[r].linesRemoved = (target.repositoryUsage[r].linesRemoved ?? 0) + u.linesRemoved; }
	}
	if (src.linesAdded !== undefined) {
		target.linesAdded = (target.linesAdded ?? 0) + src.linesAdded;
	}
	if (src.linesRemoved !== undefined) {
		target.linesRemoved = (target.linesRemoved ?? 0) + src.linesRemoved;
	}
	if (src.languageUsage) {
		if (!target.languageUsage) { target.languageUsage = {}; }
		for (const [ext, usage] of Object.entries(src.languageUsage)) {
			if (!target.languageUsage[ext]) { target.languageUsage[ext] = { linesAdded: 0, linesRemoved: 0 }; }
			target.languageUsage[ext].linesAdded += usage.linesAdded;
			target.languageUsage[ext].linesRemoved += usage.linesRemoved;
		}
	}
}

function getMondayOfWeek(d: Date): Date {
	const copy = new Date(d); copy.setHours(0, 0, 0, 0);
	const day = copy.getDay();
	copy.setDate(copy.getDate() - (day === 0 ? 6 : day - 1));
	return copy;
}

function fmtWeekLabel(monday: Date): string {
	const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6);
	if (monday.getMonth() === sunday.getMonth()) {
		return `${monday.toLocaleDateString("en-US", { month: "short" })} ${monday.getDate()}–${sunday.getDate()}`;
	}
	return `${monday.toLocaleDateString("en-US", { month: "short", day: "numeric" })}–${sunday.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

function buildDailyBuckets(fullDailyStats: DailyTokenStats[], now: Date): BucketEntry[] {
	const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
	const thirtyDaysAgoStr = fmtKey(thirtyDaysAgo);
	const todayStr = fmtKey(now);
	const bucketMap = new Map<string, BucketEntry>();
	for (let cursor = new Date(thirtyDaysAgo); cursor <= now; cursor.setDate(cursor.getDate() + 1)) {
		const key = fmtKey(new Date(cursor));
		bucketMap.set(key, { key, label: key, stats: emptyEntry(key) });
	}
	for (const day of fullDailyStats) {
		if (day.date >= thirtyDaysAgoStr && day.date <= todayStr) {
			const bucket = bucketMap.get(day.date);
			if (bucket) { mergeInto(bucket.stats, day); }
		}
	}
	return Array.from(bucketMap.values()).sort((a, b) => a.key.localeCompare(b.key));
}

function buildWeeklyBuckets(fullDailyStats: DailyTokenStats[], now: Date): BucketEntry[] {
	const thisMonday = getMondayOfWeek(now);
	const bucketMap = new Map<string, BucketEntry>();
	for (let w = 5; w >= 0; w--) {
		const monday = new Date(thisMonday); monday.setDate(thisMonday.getDate() - w * 7);
		const key = fmtKey(monday);
		bucketMap.set(key, { key, label: fmtWeekLabel(monday), stats: emptyEntry(key) });
	}
	for (const day of fullDailyStats) {
		const monday = getMondayOfWeek(new Date(day.date + "T00:00:00"));
		const bucket = bucketMap.get(fmtKey(monday));
		if (bucket) { mergeInto(bucket.stats, day); }
	}
	return Array.from(bucketMap.values()).sort((a, b) => a.key.localeCompare(b.key));
}

function buildMonthlyBuckets(fullDailyStats: DailyTokenStats[], now: Date): BucketEntry[] {
	const bucketMap = new Map<string, BucketEntry>();
	for (let m = 11; m >= 0; m--) {
		const monthDate = new Date(now.getFullYear(), now.getMonth() - m, 1);
		const key = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;
		const label = monthDate.toLocaleDateString("en-US", { month: "short", year: "numeric" });
		bucketMap.set(key, { key, label, stats: emptyEntry(key) });
	}
	for (const day of fullDailyStats) {
		const monthKey = day.date.slice(0, 7);
		const bucket = bucketMap.get(monthKey);
		if (bucket) { mergeInto(bucket.stats, day); }
	}
	return Array.from(bucketMap.values()).sort((a, b) => a.key.localeCompare(b.key));
}

function buildModelDatasets(entries: DailyTokenStats[], deps: ChartDataBuilderDeps) {
	const allModels = new Set<string>();
	entries.forEach(e => Object.keys(e.modelUsage).forEach(m => allModels.add(m)));
	const modelTotals = new Map<string, number>();
	for (const model of allModels) {
		const total = entries.reduce((sum, e) => { const u = e.modelUsage[model]; return sum + (u ? u.inputTokens + u.outputTokens : 0); }, 0);
		modelTotals.set(model, total);
	}
	const sortedModels = Array.from(allModels).sort((a, b) => (modelTotals.get(b) || 0) - (modelTotals.get(a) || 0));
	const topModels = sortedModels.slice(0, 5);
	const otherModels = sortedModels.slice(5);
	const datasets = topModels.map((model, idx) => {
		const color = getModelColor(idx);
		return { label: getModelDisplayName(model), data: entries.map(e => { const u = e.modelUsage[model]; return u ? u.inputTokens + u.outputTokens : 0; }), backgroundColor: color.bg, borderColor: color.border, borderWidth: 1 };
	});
	if (otherModels.length > 0) {
		datasets.push({ label: 'Other models', data: entries.map(e => otherModels.reduce((sum, m) => { const u = e.modelUsage[m]; return sum + (u ? u.inputTokens + u.outputTokens : 0); }, 0)), backgroundColor: 'rgba(150, 150, 150, 0.5)', borderColor: 'rgba(150, 150, 150, 0.8)', borderWidth: 1 });
	}
	return datasets;
}

function buildPeriodData(buckets: BucketEntry[], deps: ChartDataBuilderDeps) {
	const entries = buckets.map(b => b.stats);
	const labels = buckets.map(b => b.label);
	const tokensData = entries.map(e => e.tokens);
	const sessionsData = entries.map(e => e.sessions);
	const modelDatasets = buildModelDatasets(entries, deps);
	const allEditors = new Set<string>();
	entries.forEach(e => Object.keys(e.editorUsage).forEach(ed => allEditors.add(ed)));
	const editorDatasets = Array.from(allEditors).map((editor, idx) => {
		const color = getModelColor(idx);
		return { label: editor, data: entries.map(e => e.editorUsage[editor]?.tokens || 0), backgroundColor: color.bg, borderColor: color.border, borderWidth: 1 };
	});
	const allRepos = new Set<string>();
	entries.forEach(e => Object.keys(e.repositoryUsage).filter(r => r !== 'Unknown').forEach(r => allRepos.add(r)));
	const repositoryDatasets = Array.from(allRepos).map((repo, idx) => {
		const color = getModelColor(idx);
		return { label: deps.getRepoDisplayName(repo), fullRepo: repo, data: entries.map(e => e.repositoryUsage[repo]?.tokens || 0), backgroundColor: color.bg, borderColor: color.border, borderWidth: 1 };
	});
	const totalTokens = tokensData.reduce((a, b) => a + b, 0);
	const totalSessions = sessionsData.reduce((a, b) => a + b, 0);
	const periodCount = buckets.length;
	const costData = entries.map(e => deps.calculateEstimatedCost(e.modelUsage, 'copilot'));
	const totalCost = costData.reduce((a, b) => a + b, 0);
	const locData = entries.map(e => (e.linesAdded ?? 0) + (e.linesRemoved ?? 0));
	const linesAddedData = entries.map(e => e.linesAdded ?? 0);
	const linesRemovedData = entries.map(e => e.linesRemoved ?? 0);
	const totalLinesAdded = entries.reduce((s, e) => s + (e.linesAdded ?? 0), 0);
	const totalLinesRemoved = entries.reduce((s, e) => s + (e.linesRemoved ?? 0), 0);
	const totalLoc = totalLinesAdded + totalLinesRemoved;
	const avgLocPerPeriod = entries.length > 0 ? totalLoc / entries.length : 0;
	const allLanguages = new Set<string>();
	entries.forEach(e => { if (e.languageUsage) { Object.keys(e.languageUsage).forEach(l => allLanguages.add(l)); } });
	const languageDatasets = Array.from(allLanguages).map((lang, idx) => {
		const color = getModelColor(idx);
		return { label: lang, data: entries.map(e => (e.languageUsage?.[lang]?.linesAdded ?? 0) + (e.languageUsage?.[lang]?.linesRemoved ?? 0)), backgroundColor: color.bg, borderColor: color.border, borderWidth: 1 };
	});
	const locEditorDatasets = Array.from(allEditors).map((editor, idx) => {
		const color = getModelColor(idx);
		return { label: editor, data: entries.map(e => (e.editorUsage[editor]?.linesAdded ?? 0) + (e.editorUsage[editor]?.linesRemoved ?? 0)), backgroundColor: color.bg, borderColor: color.border, borderWidth: 1 };
	});
	const locRepositoryDatasets = Array.from(allRepos).map((repo, idx) => {
		const color = getModelColor(idx);
		return { label: deps.getRepoDisplayName(repo), fullRepo: repo, data: entries.map(e => (e.repositoryUsage[repo]?.linesAdded ?? 0) + (e.repositoryUsage[repo]?.linesRemoved ?? 0)), backgroundColor: color.bg, borderColor: color.border, borderWidth: 1 };
	});
	return { labels, tokensData, sessionsData, modelDatasets, editorDatasets, repositoryDatasets, periodCount, totalTokens, totalSessions, avgPerPeriod: periodCount > 0 ? Math.round(totalTokens / periodCount) : 0, costData, totalCost, avgCostPerPeriod: periodCount > 0 ? totalCost / periodCount : 0, locData, linesAddedData, linesRemovedData, languageDatasets, locEditorDatasets, locRepositoryDatasets, totalLinesAdded, totalLinesRemoved, avgLocPerPeriod };
}

function computeSummaryTotals(dailyBuckets: BucketEntry[], deps: ChartDataBuilderDeps) {
	const editorTotalsMap: Record<string, number> = {};
	dailyBuckets.forEach(b => {
		Object.entries(b.stats.editorUsage).forEach(([editor, usage]) => {
			editorTotalsMap[editor] = (editorTotalsMap[editor] || 0) + usage.tokens;
		});
	});
	const repositoryTotalsMap: Record<string, number> = {};
	dailyBuckets.forEach(b => {
		Object.entries(b.stats.repositoryUsage).filter(([repo]) => repo !== 'Unknown').forEach(([repo, usage]) => {
			const displayName = deps.getRepoDisplayName(repo);
			repositoryTotalsMap[displayName] = (repositoryTotalsMap[displayName] || 0) + usage.tokens;
		});
	});
	return { editorTotalsMap, repositoryTotalsMap };
}

/**
 * Aggregate daily token stats into the chart payload used by the chart webview.
 * Produces daily (last 30 days), weekly (last 6 weeks), and monthly (last 12 months) period data.
 */
export function buildChartData(fullDailyStats: DailyTokenStats[], deps: ChartDataBuilderDeps): ChartDataPayload {
	const now = deps.now ?? new Date();
	const dailyBuckets = buildDailyBuckets(fullDailyStats, now);
	const weeklyBuckets = buildWeeklyBuckets(fullDailyStats, now);
	const monthlyBuckets = buildMonthlyBuckets(fullDailyStats, now);
	const dailyPeriod = buildPeriodData(dailyBuckets, deps);
	const weeklyPeriod = buildPeriodData(weeklyBuckets, deps);
	const monthlyPeriod = buildPeriodData(monthlyBuckets, deps);
	const { editorTotalsMap, repositoryTotalsMap } = computeSummaryTotals(dailyBuckets, deps);
	const hasLocData = dailyBuckets.some(b => (b.stats.linesAdded ?? 0) + (b.stats.linesRemoved ?? 0) > 0)
		|| fullDailyStats.some(d => (d.linesAdded ?? 0) + (d.linesRemoved ?? 0) > 0);
	return {
		labels: dailyPeriod.labels,
		tokensData: dailyPeriod.tokensData,
		sessionsData: dailyPeriod.sessionsData,
		modelDatasets: dailyPeriod.modelDatasets,
		editorDatasets: dailyPeriod.editorDatasets,
		repositoryDatasets: dailyPeriod.repositoryDatasets,
		editorTotalsMap,
		repositoryTotalsMap,
		dailyCount: dailyPeriod.periodCount,
		totalTokens: dailyPeriod.totalTokens,
		avgTokensPerDay: dailyPeriod.avgPerPeriod,
		totalSessions: dailyPeriod.totalSessions,
		lastUpdated: now.toISOString(),
		backendConfigured: deps.backendConfigured,
		compactNumbers: deps.compactNumbers,
		periods: {
			day: dailyPeriod,
			week: weeklyPeriod,
			month: monthlyPeriod,
		},
		hasLocData,
	};
}
