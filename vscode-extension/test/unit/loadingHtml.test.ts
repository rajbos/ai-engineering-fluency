import test from 'node:test';
import * as assert from 'node:assert/strict';

import { getLoadingHtmlBody, getLoadingHtmlScript } from '../../src/loadingHtml';

test('loading timer starts from the supplied analysis start time', () => {
	const startedAtMs = 1_725_000_123_456;

	assert.match(getLoadingHtmlScript(startedAtMs), /var t0 = 1725000123456;/);
	assert.match(getLoadingHtmlScript(startedAtMs), /updateElapsed\(\);\s+setInterval\(updateElapsed, 1000\);/);
	assert.match(getLoadingHtmlBody('nonce', undefined, startedAtMs), /var t0 = 1725000123456;/);
});

/**
 * Runs the generated loading script against a stub DOM and returns a handle for
 * posting the messages the extension host sends, plus a reader for what the user
 * would see. The script is plain ES5 against `document`/`window`, so a handful of
 * stubs are enough to exercise the real behaviour rather than its source text.
 */
function runLoadingScript(): {
	post: (msg: Record<string, unknown>) => void;
	pct: () => string;
	barWidth: () => string;
	subtitle: () => string;
} {
	const makeEl = () => ({
		textContent: '',
		innerHTML: '',
		style: {} as Record<string, string>,
		className: '',
		classList: { add() { /* unused */ }, remove() { /* unused */ } },
		querySelector: () => makeEl(),
		appendChild() { /* unused */ },
	});
	const els = new Map<string, ReturnType<typeof makeEl>>();
	const listeners: ((ev: { data: unknown }) => void)[] = [];

	const sandbox = {
		document: {
			getElementById(id: string) {
				if (!els.has(id)) { els.set(id, makeEl()); }
				return els.get(id);
			},
			createElement: () => makeEl(),
		},
		window: { addEventListener: (_: string, fn: (ev: { data: unknown }) => void) => listeners.push(fn) },
		setInterval: () => 0,
		Date,
	};

	// eslint-disable-next-line no-new-func
	new Function(...Object.keys(sandbox), getLoadingHtmlScript())(...Object.values(sandbox));

	const read = (id: string, field: 'textContent') => els.get(id)?.[field] ?? '';
	return {
		post: (msg) => listeners.forEach(fn => fn({ data: msg })),
		pct: () => read('pct', 'textContent'),
		barWidth: () => els.get('prog-fill')?.style.width ?? '',
		subtitle: () => read('subtitle', 'textContent'),
	};
}

test('computing step parks at 96% when the caller reports no sub-step progress', () => {
	const ui = runLoadingScript();

	ui.post({ command: 'loadingStep', step: 'computing' });

	assert.equal(ui.pct(), '96%');
	assert.equal(ui.barWidth(), '96%');
	assert.equal(ui.subtitle(), 'Computing statistics...');
});

test('computing step follows a caller-driven percentage and label', () => {
	const ui = runLoadingScript();

	ui.post({ command: 'loadingStep', step: 'computing', percentage: 88, label: 'Aggregating daily activity…' });
	assert.equal(ui.pct(), '88%');
	assert.equal(ui.barWidth(), '88%');
	assert.equal(ui.subtitle(), 'Aggregating daily activity…');

	ui.post({ command: 'loadingStep', step: 'computing', percentage: 96, label: 'Reading session signals…' });
	assert.equal(ui.pct(), '96%');
	assert.equal(ui.subtitle(), 'Reading session signals…');
});

test('computing percentage never walks backwards on an out-of-order sub-step', () => {
	const ui = runLoadingScript();

	ui.post({ command: 'loadingStep', step: 'computing', percentage: 96, label: 'Reading session signals…' });
	ui.post({ command: 'loadingStep', step: 'computing', percentage: 88, label: 'Aggregating daily activity…' });

	assert.equal(ui.pct(), '96%', 'bar must not retreat');
	assert.equal(ui.barWidth(), '96%');
});

test('parsing progress drives the bar before the compute phase starts', () => {
	const ui = runLoadingScript();

	ui.post({ command: 'loadingProgress', completed: 120, total: 400, percentage: 30 });

	assert.equal(ui.pct(), '30%');
	assert.equal(ui.barWidth(), '30%');
	assert.match(ui.subtitle(), /^Parsing session 120/);
});
