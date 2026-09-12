import test from 'node:test';
import * as assert from 'node:assert/strict';

import { hasVisitedSince, recordVisit, sanitizeVisits, surfaceKey } from '../../src/whatsNew/visits';

test('surfaceKey', async (t) => {
	await t.test('a view without a tab keys on the view alone', () => {
		assert.equal(surfaceKey({ view: 'efficiency' }), 'efficiency');
	});

	await t.test('a tab keys on view#tab', () => {
		assert.equal(surfaceKey({ view: 'usage', tab: 'corrections' }), 'usage#corrections');
	});
});

test('recordVisit', async (t) => {
	await t.test('stamps both the tab and its parent view', () => {
		const visits = recordVisit({}, { view: 'usage', tab: 'corrections' }, '2026-09-07T10:00:00.000Z');
		assert.equal(visits['usage'], '2026-09-07T10:00:00.000Z');
		assert.equal(visits['usage#corrections'], '2026-09-07T10:00:00.000Z');
	});

	await t.test('does not mutate the input map', () => {
		const before = { usage: '2026-01-01T00:00:00.000Z' };
		const after = recordVisit(before, { view: 'usage' }, '2026-09-07T10:00:00.000Z');
		assert.equal(before.usage, '2026-01-01T00:00:00.000Z');
		assert.equal(after.usage, '2026-09-07T10:00:00.000Z');
	});

	await t.test('returns the input untouched for an unusable surface', () => {
		const before = { usage: '2026-01-01T00:00:00.000Z' };
		assert.equal(recordVisit(before, { view: '' as any }, '2026-09-07T10:00:00.000Z'), before);
	});

	await t.test('keeps the newest entries once the map grows past the cap', () => {
		// Only reachable via renamed/removed tabs across upgrades; the live
		// extension ships well under 100 view/tab combinations.
		let visits: Record<string, string> = {};
		for (let i = 0; i < 260; i++) {
			visits = recordVisit(visits, { view: 'usage', tab: `tab-${i}` }, `2026-09-07T${String(i % 24).padStart(2, '0')}:00:00.000Z`);
		}
		assert.ok(Object.keys(visits).length <= 200, `expected pruning, got ${Object.keys(visits).length}`);
	});
});

test('hasVisitedSince', async (t) => {
	const visits = {
		usage: '2026-09-05T10:00:00.000Z',
		'usage#corrections': '2026-09-05T10:00:00.000Z',
	};

	await t.test('true when the exact surface was opened at or after the cutoff', () => {
		assert.equal(hasVisitedSince(visits, { view: 'usage', tab: 'corrections' }, '2026-09-01T00:00:00.000Z'), true);
		assert.equal(hasVisitedSince(visits, { view: 'usage', tab: 'corrections' }, '2026-09-05T10:00:00.000Z'), true);
	});

	await t.test('false when the only visit predates the cutoff', () => {
		assert.equal(hasVisitedSince(visits, { view: 'usage', tab: 'corrections' }, '2026-09-06T00:00:00.000Z'), false);
	});

	await t.test('opening the panel is not visiting a tab inside it', () => {
		// The whole point of tab-level keys: landing on Usage Analysis says
		// nothing about whether the user ever saw the Worktrees tab.
		assert.equal(hasVisitedSince(visits, { view: 'usage', tab: 'worktrees' }, '2026-09-01T00:00:00.000Z'), false);
	});

	await t.test('false with no cutoff, so a null versionSeenAt never suppresses an announcement', () => {
		assert.equal(hasVisitedSince(visits, { view: 'usage' }, null), false);
	});
});

test('sanitizeVisits', async (t) => {
	await t.test('drops non-string values and non-object input', () => {
		assert.deepEqual(sanitizeVisits({ usage: '2026-09-05T10:00:00.000Z', bad: 42, empty: '' }), {
			usage: '2026-09-05T10:00:00.000Z',
		});
		assert.deepEqual(sanitizeVisits(null), {});
		assert.deepEqual(sanitizeVisits(['usage']), {});
		assert.deepEqual(sanitizeVisits('nonsense'), {});
	});
});
