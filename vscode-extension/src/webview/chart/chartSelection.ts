/**
 * Pure metric/split selection rules for the Chart view: which split each metric supports,
 * which split survives a metric switch, and how the selection is restored from the host's
 * initial preferences or from saved webview state. No DOM or VS Code API, so it is unit-testable.
 */
import type { ChartTimeWindow } from '../../../../src/types';
import type { ChartPeriod } from './projectionUtils';

export type ChartMetric = 'tokens' | 'output' | 'cost' | 'sessions';
export type ChartSplit = 'total' | 'model' | 'editor' | 'repository' | 'language' | 'provider' | 'task' | 'taskCategory';
/** Legacy single-key view names, from before the view was split into metric + split. */
export type LegacyChartView = 'total' | 'model' | 'editor' | 'repository' | 'cost' | 'task' | 'taskCategory';

export type MetricSplit = { metric: ChartMetric; split: ChartSplit };

/** The period, time window, metric and split the Chart view shows. */
export type ChartSelection = MetricSplit & { period: ChartPeriod; timeWindow: ChartTimeWindow };

/** Splits the sessions and cost metrics can be broken down by. */
const SESSIONS_COST_SPLITS: ReadonlySet<string> = new Set(['total', 'model', 'editor', 'provider', 'task']);
/** Splits the output (lines of code) metric cannot be broken down by. */
const OUTPUT_UNSUPPORTED_SPLITS: ReadonlySet<string> = new Set(['model', 'provider', 'task', 'taskCategory']);
/** Splits the tokens metric (and any other metric) cannot be broken down by. */
const TOKENS_UNSUPPORTED_SPLITS: ReadonlySet<string> = new Set(['language', 'provider']);
/** Splits the cost metric keeps when switching to it; any other split falls back to 'total'. */
const COST_PREFERRED_SPLITS: ReadonlySet<string> = new Set(['editor', 'provider', 'task']);

/**
 * Per metric, whether a (normalized) split is kept when switching to that metric.
 * A split that is not kept falls back to 'total'; metrics without an entry keep every split.
 */
const PREFERRED_SPLIT_KEEPS: Partial<Record<ChartMetric, (split: ChartSplit) => boolean>> = {
	cost: split => COST_PREFERRED_SPLITS.has(split),
	output: split => !OUTPUT_UNSUPPORTED_SPLITS.has(split),
	tokens: split => split !== 'language',
	sessions: split => SESSIONS_COST_SPLITS.has(split),
};

/** Maps the legacy 'taskCategory' split onto 'task'. */
export function normalizeSplit(split: ChartSplit): ChartSplit {
	return split === 'taskCategory' ? 'task' : split;
}

/** Whether `metric` supports `split`, ignoring the editor filter. `split` is compared as given (not normalized). */
export function isSplitAllowedForMetric(metric: string, split: string): boolean {
	if (metric === 'sessions' || metric === 'cost') { return SESSIONS_COST_SPLITS.has(split); }
	if (metric === 'output') { return !OUTPUT_UNSUPPORTED_SPLITS.has(split); }
	return !TOKENS_UNSUPPORTED_SPLITS.has(split);
}

/** The split to show after switching to `metric`: the current (normalized) split if it fits, else 'total'. */
export function getPreferredSplitForMetric(metric: ChartMetric, split: ChartSplit): ChartSplit {
	const normalized = normalizeSplit(split);
	const keeps = PREFERRED_SPLIT_KEEPS[metric];
	return !keeps || keeps(normalized) ? normalized : 'total';
}

export function migrateViewKey(view: string): MetricSplit {
	const map: Record<string, MetricSplit> = {
		total: { metric: 'tokens', split: 'total' },
		model: { metric: 'tokens', split: 'model' },
		editor: { metric: 'tokens', split: 'editor' },
		repository: { metric: 'tokens', split: 'repository' },
		cost: { metric: 'cost', split: 'total' },
		task: { metric: 'tokens', split: 'task' },
		taskCategory: { metric: 'tokens', split: 'task' },
	};
	return map[view] ?? { metric: 'tokens', split: 'total' };
}

/** The host's initial preferences, used to seed a brand-new panel. */
export type HostInitialSelection = {
	initialPeriod?: ChartPeriod;
	initialTimeWindow?: ChartTimeWindow;
	initialView?: LegacyChartView;
	initialMetric?: ChartMetric;
	initialSplit?: ChartSplit;
};

/** Seeds a brand-new panel (no webview state yet): each host preference that is set overrides `current`. */
export function resolveHostInitialSelection(initial: HostInitialSelection, current: ChartSelection): ChartSelection {
	const next: ChartSelection = { ...current };
	if (initial.initialPeriod) { next.period = initial.initialPeriod; }
	if (initial.initialTimeWindow) { next.timeWindow = initial.initialTimeWindow; }
	if (initial.initialMetric) { next.metric = initial.initialMetric; }
	if (initial.initialSplit) {
		next.split = normalizeSplit(initial.initialSplit);
	} else if (initial.initialView) {
		const m = migrateViewKey(initial.initialView);
		next.metric = m.metric; next.split = m.split;
	}
	return next;
}

/** The selection fields of an existing panel's saved webview state. */
export type SavedChartSelection = {
	period?: ChartPeriod;
	timeWindow?: ChartTimeWindow;
	metric?: ChartMetric;
	split?: ChartSplit;
	/** @deprecated Use metric + split instead. Kept for migration of old saved state. */
	view?: LegacyChartView;
};

/** Restores an existing panel's selection from its saved webview state, migrating the legacy `view` key. */
export function resolveSavedSelection(saved: SavedChartSelection): ChartSelection {
	const base = { period: saved.period ?? 'day', timeWindow: saved.timeWindow ?? 'last30' } as const;
	if (saved.view && !saved.metric) {
		return { ...base, ...migrateViewKey(saved.view) };
	}
	return { ...base, metric: saved.metric ?? 'tokens', split: saved.split === 'taskCategory' ? 'task' : (saved.split ?? 'total') };
}
