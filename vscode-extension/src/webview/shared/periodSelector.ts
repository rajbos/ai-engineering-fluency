import { el } from './domUtils';

/** Time-window periods supported by the shared period selector. */
export type Period = 'today' | 'last7' | 'last30' | 'currentMonth' | 'lastMonth' | 'thisWeek' | 'allTime';

/** Human-readable labels for each period, matching the Chart time-window dropdown. */
export const PERIOD_LABELS: Record<Period, string> = {
	today: 'Today',
	last7: 'Last 7 days',
	last30: 'Last 30 days',
	currentMonth: 'Current month',
	lastMonth: 'Previous month',
	thisWeek: 'This week',
	allTime: 'All time',
};

/** Ordered list of the canonical periods used by default. */
export const CANONICAL_PERIODS: Period[] = ['today', 'last7', 'last30', 'currentMonth', 'allTime'];

/** Ordered list of every known period, including extras such as Previous month / This week. */
export const ALL_PERIODS: Period[] = ['today', 'last7', 'last30', 'currentMonth', 'lastMonth', 'thisWeek', 'allTime'];

export type PeriodSelectorExtraOption = {
	value: string;
	label: string;
	/** When true the option is visible but cannot be selected. */
	disabled?: boolean;
	/** Optional tooltip for this option. */
	title?: string;
};

export type PeriodSelectorOptions = {
	/** Value currently selected. */
	selected: string;
	/** Which known periods to show and in which order. Defaults to the canonical 5. */
	periods?: Period[];
	/** Extra ad-hoc options appended after the known periods (e.g. "Yesterday"). */
	extraOptions?: PeriodSelectorExtraOption[];
	/** Known periods that should be visible but unselectable. */
	disabled?: Period[] | Set<Period>;
	/** Optional tooltip shown on disabled known periods. */
	disabledTitle?: string;
	/** Label shown before the dropdown. Pass an empty string to omit the label. */
	label?: string;
	/** `id` for the underlying `<select>`. */
	id?: string;
	/** Called whenever the user selects a new value. */
	onChange: (value: string) => void;
};

export type PeriodSelectorResult = {
	/** Wrapper containing the optional label and the `<select>`. */
	wrapper: HTMLDivElement;
	/** The dropdown element. */
	select: HTMLSelectElement;
};

function setOptionSelected(option: HTMLOptionElement, value: string, selected: string): void {
	if (value === selected) {
		option.selected = true;
	}
}

/**
 * Creates a reusable period dropdown styled consistently across webviews.
 *
 * By default the dropdown shows the canonical Chart time-window periods.
 * Consumers can supply a custom period list, disable periods (e.g. "All time"
 * when historical data is still loading), and append extra options.
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
	const periods = options.periods ?? CANONICAL_PERIODS;
	for (const period of periods) {
		const option = document.createElement('option');
		option.value = period;
		option.textContent = PERIOD_LABELS[period];
		setOptionSelected(option, period, options.selected);
		if (disabledSet.has(period)) {
			option.disabled = true;
			if (options.disabledTitle) {
				option.title = options.disabledTitle;
			}
		}
		select.append(option);
	}

	for (const extra of options.extraOptions ?? []) {
		const option = document.createElement('option');
		option.value = extra.value;
		option.textContent = extra.label;
		if (extra.title) {
			option.title = extra.title;
		}
		setOptionSelected(option, extra.value, options.selected);
		if (extra.disabled) {
			option.disabled = true;
		}
		select.append(option);
	}

	select.addEventListener('change', () => {
		options.onChange(select.value);
	});

	wrapper.append(select);
	return { wrapper, select };
}
