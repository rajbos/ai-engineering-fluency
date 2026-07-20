import { el } from './domUtils';

/** Canonical time-window periods used across the extension's webviews. */
export type Period = 'today' | 'last7' | 'last30' | 'currentMonth' | 'allTime';

/** Human-readable labels for each period, matching the Chart time-window dropdown. */
export const PERIOD_LABELS: Record<Period, string> = {
	today: 'Today',
	last7: 'Last 7 days',
	last30: 'Last 30 days',
	currentMonth: 'Current month',
	allTime: 'All time',
};

/** Ordered list of all canonical periods. */
export const ALL_PERIODS: Period[] = ['today', 'last7', 'last30', 'currentMonth', 'allTime'];

export type PeriodSelectorOptions = {
	/** Value currently selected. */
	selected: Period;
	/** Periods that should be visible but unselectable. */
	disabled?: Period[] | Set<Period>;
	/** Optional tooltip shown on disabled options. */
	disabledTitle?: string;
	/** Label shown before the dropdown. Pass an empty string to omit the label. */
	label?: string;
	/** `id` for the underlying `<select>`. */
	id?: string;
	/** Called whenever the user selects a new period. */
	onChange: (value: Period) => void;
};

export type PeriodSelectorResult = {
	/** Wrapper containing the optional label and the `<select>`. */
	wrapper: HTMLDivElement;
	/** The dropdown element. */
	select: HTMLSelectElement;
};

/**
 * Creates a reusable period dropdown styled consistently across webviews.
 *
 * The dropdown always shows the canonical periods from the Chart time-window
 * selector. Consumers can disable individual periods (e.g. "All time" when
 * historical data is still loading).
 */
export function createPeriodSelector(options: PeriodSelectorOptions): PeriodSelectorResult {
	const wrapper = el('div', 'period-selector');
	wrapper.style.display = 'inline-flex';
	wrapper.style.alignItems = 'center';
	wrapper.style.gap = '4px';

	const labelText = options.label ?? 'Time window:';
	if (labelText) {
		const label = el('span', 'period-selector-label', labelText);
		label.style.fontSize = '11px';
		label.style.color = 'var(--vscode-descriptionForeground, var(--text-secondary, #9ca3af))';
		wrapper.append(label);
	}

	const select = document.createElement('select');
	select.className = 'period-selector-select';
	if (options.id) {
		select.id = options.id;
	}
	select.style.background = 'var(--vscode-dropdown-background, var(--button-secondary-bg, #2d2d2d))';
	select.style.color = 'var(--vscode-dropdown-foreground, var(--text-primary, #cccccc))';
	select.style.border = '1px solid var(--border-subtle, #555555)';
	select.style.borderRadius = '4px';
	select.style.padding = '4px 8px';
	select.style.fontSize = '13px';
	select.style.cursor = 'pointer';
	select.style.minHeight = '24px';

	const disabledSet = new Set<Period>(options.disabled ?? []);
	for (const period of ALL_PERIODS) {
		const option = document.createElement('option');
		option.value = period;
		option.textContent = PERIOD_LABELS[period];
		if (period === options.selected) {
			option.selected = true;
		}
		if (disabledSet.has(period)) {
			option.disabled = true;
			if (options.disabledTitle) {
				option.title = options.disabledTitle;
			}
		}
		select.append(option);
	}

	select.addEventListener('change', () => {
		options.onChange(select.value as Period);
	});

	wrapper.append(select);
	return { wrapper, select };
}
