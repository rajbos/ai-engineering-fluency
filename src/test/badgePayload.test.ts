import test from 'node:test';
import * as assert from 'node:assert/strict';

import {
	BADGE_DAYS,
	BADGE_MAX_PAYLOAD_BYTES,
	buildBadgePayload,
	normalizeBadgeTheme,
	normalizeBadgeThemeSource,
	resolveBadgeTheme,
	UNIVERSE_BADGE_THEME,
	normalizeHexColor,
	serializeBadgePayload,
	shortCategoryName,
} from '../badgePayload';

const NOW = new Date(2026, 9, 23, 19, 14, 0); // local 2026-10-23

const MATURITY = {
	overallStage: 3,
	overallLabel: 'AI Collaborator',
	categories: [
		{ category: 'Prompt Engineering', stage: 3 },
		{ category: 'Context Engineering', stage: 3 },
		{ category: 'Agentic', stage: 4 },
		{ category: 'Tool Usage', stage: 3 },
		{ category: 'Customization', stage: 2 },
		{ category: 'Workflow Integration', stage: 3 },
	],
};

test('buildBadgePayload: maps stage, label and shortened categories', () => {
	const payload = buildBadgePayload({ maturity: MATURITY, dailyStats: [], now: NOW });
	assert.equal(payload.v, 1);
	assert.equal(payload.stage, 3);
	assert.equal(payload.label, 'AI Collaborator');
	assert.deepEqual(payload.categories, [
		['Prompt', 3], ['Context', 3], ['Agentic', 4], ['Tools', 3], ['Custom', 2], ['Workflow', 3],
	]);
});

test('buildBadgePayload: always returns exactly 30 days ending today, padding missing days with zeros', () => {
	const payload = buildBadgePayload({
		maturity: MATURITY,
		dailyStats: [
			{ date: '2026-10-23', tokens: 52000, sessions: 6 },
			{ date: '2026-10-20', tokens: 1000, sessions: 1 },
		],
		now: NOW,
	});
	assert.equal(payload.days.length, BADGE_DAYS);
	assert.deepEqual(payload.days[BADGE_DAYS - 1], ['2026-10-23', 52000, 6]);
	assert.deepEqual(payload.days[BADGE_DAYS - 4], ['2026-10-20', 1000, 1]);
	assert.deepEqual(payload.days[BADGE_DAYS - 2], ['2026-10-22', 0, 0]);
	assert.equal(payload.days[0][0], '2026-09-24');
	assert.deepEqual(payload.today, [52000, 6]);
	assert.equal(payload.tokens30, 53000);
	assert.equal(payload.sessions30, 7);
});

test('buildBadgePayload: ignores days outside the 30-day window and sums duplicate dates', () => {
	const payload = buildBadgePayload({
		maturity: MATURITY,
		dailyStats: [
			{ date: '2026-01-01', tokens: 999999, sessions: 99 },
			{ date: '2026-10-23', tokens: 10, sessions: 1 },
			{ date: '2026-10-23', tokens: 5, sessions: 2 },
		],
		now: NOW,
	});
	assert.equal(payload.tokens30, 15);
	assert.deepEqual(payload.today, [15, 3]);
});

test('buildBadgePayload: spans a month boundary without skipping or repeating a day', () => {
	const payload = buildBadgePayload({ maturity: MATURITY, dailyStats: [], now: new Date(2026, 2, 2, 12) });
	const keys = payload.days.map((d) => d[0]);
	assert.equal(new Set(keys).size, BADGE_DAYS);
	assert.equal(keys[BADGE_DAYS - 1], '2026-03-02');
	assert.ok(keys.includes('2026-02-28'));
});

test('buildBadgePayload: clamps stages and treats bad counts as zero', () => {
	const payload = buildBadgePayload({
		maturity: { overallStage: 9, overallLabel: 'x'.repeat(40), categories: [{ category: 'Agentic', stage: -2 }] },
		dailyStats: [{ date: '2026-10-23', tokens: Number.NaN, sessions: -4 }],
		now: NOW,
	});
	assert.equal(payload.stage, 4);
	assert.equal(payload.label.length, 24);
	assert.deepEqual(payload.categories, [['Agentic', 0]]);
	assert.deepEqual(payload.today, [0, 0]);
});

test('buildBadgePayload: updated is an ISO timestamp without milliseconds', () => {
	const payload = buildBadgePayload({ maturity: MATURITY, dailyStats: [], now: NOW });
	assert.match(payload.updated, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
});

test('serializeBadgePayload: a realistic payload stays well under the size limit', () => {
	const dailyStats = Array.from({ length: 30 }, (_, i) => ({ date: `2026-10-${String(i % 28 + 1).padStart(2, '0')}`, tokens: 1234567, sessions: 99 }));
	const text = serializeBadgePayload(buildBadgePayload({
		maturity: MATURITY,
		dailyStats,
		theme: { accent: '#0078d4', link: '#4daafc', good: '#2ea043', warn: '#f0883e' },
		now: NOW,
	}));
	assert.ok(Buffer.byteLength(text, 'utf8') < BADGE_MAX_PAYLOAD_BYTES / 2);
});

test('serializeBadgePayload: refuses a payload the badge cannot store', () => {
	const payload = buildBadgePayload({ maturity: MATURITY, dailyStats: [], now: NOW });
	payload.categories = Array.from({ length: 400 }, (_, i) => [`Category ${i}`, 1] as [string, number]);
	assert.throws(() => serializeBadgePayload(payload), /larger than the badge can store/);
});

test('normalizeHexColor: accepts the forms VS Code injects and rejects everything else', () => {
	assert.equal(normalizeHexColor('#0078D4'), '#0078d4');
	assert.equal(normalizeHexColor('#0078d4cc'), '#0078d4');
	assert.equal(normalizeHexColor('#abc'), '#aabbcc');
	assert.equal(normalizeHexColor(' rgb(0, 120, 212) '), '#0078d4');
	assert.equal(normalizeHexColor('rgba(0 120 212 / 0.5)'), '#0078d4');
	assert.equal(normalizeHexColor('rgb(300, 0, 0)'), '#ff0000');
	assert.equal(normalizeHexColor('red'), undefined);
	assert.equal(normalizeHexColor('var(--x)'), undefined);
	assert.equal(normalizeHexColor('#12345'), undefined);
	assert.equal(normalizeHexColor(''), undefined);
	assert.equal(normalizeHexColor(42), undefined);
});

test('normalizeBadgeTheme: keeps only known roles and drops unusable values', () => {
	assert.deepEqual(
		normalizeBadgeTheme({ accent: 'rgb(0, 120, 212)', link: 'blue', good: '#2EA043', extra: '#ffffff', warn: undefined }),
		{ accent: '#0078d4', good: '#2ea043' },
	);
	assert.deepEqual(normalizeBadgeTheme(undefined), {});
});

test('normalizeBadgeThemeSource: defaults to the Universe palette for anything but editor', () => {
	assert.equal(normalizeBadgeThemeSource('editor'), 'editor');
	assert.equal(normalizeBadgeThemeSource('universe'), 'universe');
	assert.equal(normalizeBadgeThemeSource(undefined), 'universe');
	assert.equal(normalizeBadgeThemeSource('vscode'), 'universe');
});

test('resolveBadgeTheme: Universe ignores the editor colours, editor keeps only usable ones', () => {
	const editor = { accent: '#0078d4', link: 'blue' };
	assert.deepEqual(resolveBadgeTheme('universe', editor), UNIVERSE_BADGE_THEME);
	assert.deepEqual(resolveBadgeTheme('editor', editor), { accent: '#0078d4' });
	// A copy, so a caller cannot change the shared palette.
	const universe = resolveBadgeTheme('universe', {});
	universe.accent = '#000000';
	assert.equal(UNIVERSE_BADGE_THEME.accent, '#5fed83');
});

test('buildBadgePayload: carries the Universe palette when it is the chosen theme', () => {
	const payload = buildBadgePayload({
		maturity: { overallStage: 2, overallLabel: 'AI Explorer', categories: [] },
		dailyStats: [],
		theme: resolveBadgeTheme('universe', { accent: '#0078d4' }),
		now: new Date(2026, 9, 27, 12, 0, 0),
	});
	assert.deepEqual(payload.theme, { accent: '#5fed83', link: '#b18cff', good: '#08872b', warn: '#c65400' });
});

test('shortCategoryName: falls back to a truncated first word for unknown categories', () => {
	assert.equal(shortCategoryName('Tool Usage'), 'Tools');
	assert.equal(shortCategoryName('Brand New Category'), 'Brand');
	assert.equal(shortCategoryName('Supercalifragilisticexpialidocious'), 'Supercalifragili');
});
