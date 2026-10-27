/**
 * Builds the `/state/fluency.json` payload the GitHub Universe badge app reads
 * (see badge-app/fluency/fluency_data.py for the reading side and
 * docs/features/BADGE-SETUP-PLAN.md for the format).
 *
 * Editor-neutral on purpose: no `vscode` imports, so every host can call it.
 * The payload holds counts, a stage, short labels and colours only — never
 * prompts, paths, repository names or session titles.
 */
import { addDaysUtc, toLocalDayKey } from './utils/dayKeys';

export const BADGE_PAYLOAD_VERSION = 1;
export const BADGE_DAYS = 30;
/** The longest history the badge can show; the sync picks 30 or 90 days of it. */
export const BADGE_MAX_DAYS = 90;
/** The chart ranges a sync can push to the badge, in days. */
export const BADGE_RANGES = [30, 90] as const;
export type BadgeRange = typeof BADGE_RANGES[number];
export const DEFAULT_BADGE_RANGE: BadgeRange = 30;

export function normalizeBadgeRange(value: unknown): BadgeRange {
	return BADGE_RANGES.find((range) => range === value) ?? DEFAULT_BADGE_RANGE;
}
/** The badge's data partition is small; the plan keeps the file under about 4 KB. */
export const BADGE_MAX_PAYLOAD_BYTES = 4096;

/** Colour roles the badge takes from the chosen palette. */
export type BadgeThemeKey = 'accent' | 'link' | 'good' | 'warn';
export type BadgeTheme = Partial<Record<BadgeThemeKey, string>>;

/** Where the badge colours come from: the GitHub Universe palette or the active editor theme. */
export type BadgeThemeSource = 'universe' | 'editor';
export const DEFAULT_BADGE_THEME_SOURCE: BadgeThemeSource = 'universe';

/**
 * The GitHub Universe 2026 palette: its bright green as the accent, the
 * GitHub green of its buttons for positive values, plus its lavender and orange.
 */
export const UNIVERSE_BADGE_THEME: Readonly<Required<BadgeTheme>> = {
	accent: '#5fed83',
	link: '#b18cff',
	good: '#08872b',
	warn: '#c65400',
};

export function normalizeBadgeThemeSource(value: unknown): BadgeThemeSource {
	return value === 'editor' ? 'editor' : DEFAULT_BADGE_THEME_SOURCE;
}

/** The colours to send: the Universe palette, or the editor theme colours the host cached. */
export function resolveBadgeTheme(source: BadgeThemeSource, editorTheme: BadgeTheme): BadgeTheme {
	return source === 'editor' ? normalizeBadgeTheme(editorTheme) : { ...UNIVERSE_BADGE_THEME };
}

export interface BadgeMaturityInput {
	overallStage: number;
	overallLabel: string;
	categories: ReadonlyArray<{ category: string; stage: number }>;
}

export interface BadgeDayInput {
	/** Local YYYY-MM-DD. */
	date: string;
	tokens: number;
	sessions: number;
}

export interface BadgePayload {
	v: number;
	updated: string;
	stage: number;
	label: string;
	categories: Array<[string, number]>;
	/** The last 30 or 90 days (see {@link BadgeRange}); the badge reads the range from the length. */
	days: Array<[string, number, number]>;
	/** Totals over `days`. The names are historical: with a 90-day range they cover 90 days. */
	tokens30: number;
	sessions30: number;
	today: [number, number];
	theme: BadgeTheme;
}

const THEME_KEYS: readonly BadgeThemeKey[] = ['accent', 'link', 'good', 'warn'];
const MAX_STAGE = 4;
const MAX_LABEL = 24;
const MAX_CATEGORY_NAME = 16;

/** One word per category so the names fit the 320x240 screen. */
const SHORT_CATEGORY_NAMES: Record<string, string> = {
	'Prompt Engineering': 'Prompt',
	'Context Engineering': 'Context',
	'Agentic': 'Agentic',
	'Tool Usage': 'Tools',
	'Customization': 'Custom',
	'Workflow Integration': 'Workflow',
};

function clampStage(value: number, min: number): number {
	if (!Number.isFinite(value)) { return min; }
	return Math.min(MAX_STAGE, Math.max(min, Math.round(value)));
}

function wholeCount(value: number): number {
	return Number.isFinite(value) && value > 0 ? Math.round(value) : 0;
}

export function shortCategoryName(name: string): string {
	const known = SHORT_CATEGORY_NAMES[name];
	if (known) { return known; }
	const firstWord = name.trim().split(/\s+/)[0] ?? '';
	return firstWord.slice(0, MAX_CATEGORY_NAME);
}

function hex2(value: number): string {
	return Math.min(255, Math.max(0, Math.round(value))).toString(16).padStart(2, '0');
}

/**
 * Turns a CSS colour as VS Code injects it (`#rgb`, `#rrggbb`, `#rrggbbaa`,
 * `rgb()` or `rgba()`) into `#rrggbb`. Returns undefined for anything else, so
 * a named colour or `var(...)` never reaches the badge.
 */
export function normalizeHexColor(value: unknown): string | undefined {
	if (typeof value !== 'string') { return undefined; }
	const text = value.trim().toLowerCase();

	const hex = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(text);
	if (hex) {
		const digits = hex[1];
		if (digits.length <= 4) {
			return '#' + digits.slice(0, 3).split('').map((c) => c + c).join('');
		}
		return '#' + digits.slice(0, 6);
	}

	const rgb = /^rgba?\(\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*(?:[,/]\s*[\d.]+%?\s*)?\)$/.exec(text);
	if (rgb) {
		return '#' + hex2(Number(rgb[1])) + hex2(Number(rgb[2])) + hex2(Number(rgb[3]));
	}
	return undefined;
}

/** Keeps only the known colour roles, each normalised to `#rrggbb`. */
export function normalizeBadgeTheme(theme: Record<string, unknown> | undefined | null): BadgeTheme {
	const result: BadgeTheme = {};
	if (!theme) { return result; }
	for (const key of THEME_KEYS) {
		const colour = normalizeHexColor(theme[key]);
		if (colour) { result[key] = colour; }
	}
	return result;
}

function buildDays(dailyStats: readonly BadgeDayInput[], now: Date, range: BadgeRange): Array<[string, number, number]> {
	const byDate = new Map<string, { tokens: number; sessions: number }>();
	for (const day of dailyStats) {
		const existing = byDate.get(day.date) ?? { tokens: 0, sessions: 0 };
		existing.tokens += wholeCount(day.tokens);
		existing.sessions += wholeCount(day.sessions);
		byDate.set(day.date, existing);
	}
	// Keys are generated from the local calendar day; addDaysUtc only does day arithmetic on that key.
	const todayKey = toLocalDayKey(now);
	const days: Array<[string, number, number]> = [];
	for (let offset = range - 1; offset >= 0; offset--) {
		const key = addDaysUtc(todayKey, -offset);
		const entry = byDate.get(key);
		days.push([key, entry?.tokens ?? 0, entry?.sessions ?? 0]);
	}
	return days;
}

/**
 * Builds the badge payload. Days are always exactly the last 30 (or 90) local
 * days, ending today, with missing days padded with zeros.
 */
export function buildBadgePayload(input: {
	maturity: BadgeMaturityInput;
	dailyStats: readonly BadgeDayInput[];
	theme?: Record<string, unknown> | null;
	now: Date;
	range?: BadgeRange;
}): BadgePayload {
	const days = buildDays(input.dailyStats, input.now, input.range ?? DEFAULT_BADGE_RANGE);
	const stage = clampStage(input.maturity.overallStage, 1);
	const last = days[days.length - 1];
	return {
		v: BADGE_PAYLOAD_VERSION,
		updated: input.now.toISOString().replace(/\.\d{3}Z$/, 'Z'),
		stage,
		label: input.maturity.overallLabel.slice(0, MAX_LABEL),
		categories: input.maturity.categories.map((c): [string, number] => [shortCategoryName(c.category), clampStage(c.stage, 0)]),
		days,
		tokens30: days.reduce((sum, d) => sum + d[1], 0),
		sessions30: days.reduce((sum, d) => sum + d[2], 0),
		today: [last[1], last[2]],
		theme: normalizeBadgeTheme(input.theme),
	};
}

/** Compact JSON the badge stores; its size is checked against {@link BADGE_MAX_PAYLOAD_BYTES}. */
export function serializeBadgePayload(payload: BadgePayload): string {
	const text = JSON.stringify(payload);
	if (Buffer.byteLength(text, 'utf8') > BADGE_MAX_PAYLOAD_BYTES) {
		throw new Error('Badge payload is larger than the badge can store');
	}
	return text;
}
