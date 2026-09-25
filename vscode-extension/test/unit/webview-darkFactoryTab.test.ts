/// <reference path="../../src/types/jsdom.d.ts" />
import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

import { DarkFactoryTab } from '../../src/webview/usage/darkFactoryTab';
import type { DarkFactoryReport } from '../../../src/types';

const emptyReport: DarkFactoryReport = {
	scannedAt: '2026-03-14T09:30:00.000Z',
	apiSignalsIncluded: false,
	maxAssessableStage: 4,
	repos: [],
	skippedRepoCount: 0,
};

test('AI Readiness is a host-gated Usage Analysis tab with a lazy, refreshable scan', () => {
	const dom = new JSDOM('<div id="root"></div>');
	const previousDocument = globalThis.document;
	(globalThis as typeof globalThis & { document: Document }).document = dom.window.document;
	try {
		const messages: Array<{ command: string; requestId: number }> = [];
		const traces: string[] = [];
		const tab = new DarkFactoryTab(message => messages.push(message), stage => traces.push(stage));
		assert.equal(tab.button('activity'), '');
		assert.equal(tab.panel('readiness'), '');
		tab.startIfNeeded();
		assert.equal(messages.length, 0);

		tab.setAvailable(true);
		assert.match(tab.button('readiness'), /class="tab-button active" data-tab="readiness"/);
		dom.window.document.getElementById('root')!.innerHTML = tab.panel('readiness');
		tab.attach();
		assert.match(dom.window.document.getElementById('readiness-content')!.textContent!, /Scanning repository controls/);
		tab.startIfNeeded();
		tab.startIfNeeded();
		assert.deepEqual(messages, [{ command: 'loadReadiness', requestId: 1 }]);
		assert.equal(tab.handleMessage({ command: 'readinessLoaded', requestId: 1, report: emptyReport }), true);
		assert.match(dom.window.document.getElementById('readiness-content')!.textContent!, /No git repositories were found/);

		dom.window.document.getElementById('root')!.innerHTML = tab.panel('readiness');
		tab.attach();
		assert.match(dom.window.document.getElementById('readiness-content')!.textContent!, /No git repositories were found/);
		dom.window.document.getElementById('btn-refresh-readiness')!.click();
		assert.equal(messages.at(-1)?.requestId, 2);
		tab.handleMessage({ command: 'readinessLoaded', requestId: 1, report: emptyReport });
		assert.match(dom.window.document.getElementById('readiness-content')!.textContent!, /Scanning repository controls/);
		tab.handleMessage({ command: 'readinessScanFailed', requestId: 2 });
		assert.match(dom.window.document.querySelector('[role="alert"]')!.textContent!, /Could not scan repository readiness/);

		dom.window.document.getElementById('btn-refresh-readiness')!.click();
		assert.equal(messages.at(-1)?.requestId, 3);
		tab.handleMessage({ command: 'readinessLoaded', requestId: 3, report: {} });
		assert.deepEqual(traces, ['readinessLoaded.invalidReport']);
		assert.ok(dom.window.document.querySelector('[role="alert"]'));
		tab.invalidate();
		tab.startIfNeeded();
		assert.equal(messages.at(-1)?.requestId, 5);
		assert.equal(tab.handleMessage({ command: 'unrelated' }), false);
	} finally {
		(globalThis as typeof globalThis & { document: Document }).document = previousDocument;
		dom.window.close();
	}
});

test('AI Readiness renders the adoption × foundations matrix above the report, and drops a malformed one', () => {
	const dom = new JSDOM('<div id="root"></div>');
	const previousDocument = globalThis.document;
	(globalThis as typeof globalThis & { document: Document }).document = dom.window.document;
	try {
		const messages: Array<{ command: string; requestId: number }> = [];
		const tab = new DarkFactoryTab(message => messages.push(message), () => undefined);
		tab.setAvailable(true);
		dom.window.document.getElementById('root')!.innerHTML = tab.panel('readiness');
		tab.attach();
		tab.startIfNeeded();
		const matrix = {
			windowDays: 30,
			placements: [{
				repository: 'o/r', foundation: 'weak', foundationScore: 0.2, observedControls: 10, unknownControls: 5,
				agenticSessions: 8, sessions: 10, highAdoption: true, quadrant: 'stretched', leaning: false, missingControls: [],
			}],
			adoptionOnly: [],
		};
		tab.handleMessage({ command: 'readinessLoaded', requestId: 1, report: emptyReport, matrix });
		const content = dom.window.document.getElementById('readiness-content')!;
		assert.ok(content.querySelector('#agentic-matrix [data-quadrant="stretched"]'));
		assert.match(content.textContent!, /No git repositories were found/);

		tab.requestScan();
		tab.handleMessage({ command: 'readinessLoaded', requestId: 2, report: emptyReport, matrix: { placements: 'nope' } });
		assert.equal(content.querySelector('#agentic-matrix'), null);
		assert.match(content.textContent!, /No git repositories were found/);
	} finally {
		(globalThis as typeof globalThis & { document: Document }).document = previousDocument;
		dom.window.close();
	}
});
