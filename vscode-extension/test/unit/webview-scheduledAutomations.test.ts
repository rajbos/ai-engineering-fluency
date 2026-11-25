import test from 'node:test';
import * as assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

import { initializeWebviewLocalization } from '../../src/webview/shared/localization';
import {
	FAILED_RUNS_TABLE_ID,
	SCHEDULED_AUTOMATIONS_SECTION_ID,
	failedRunRows,
	wireScheduledAutomations,
	buildScheduledAutomationsSectionHtml,
	sanitizeScheduledTask,
	sanitizeScheduledTasks,
} from '../../src/webview/usage/scheduledAutomations';
import { sanitizeRepeatedTaskReport } from '../../src/webview/usage/skillSuggestions';
import type { RepeatedTaskReport, ScheduledTaskSummary } from '../../../src/types';

initializeWebviewLocalization({});

function task(overrides: Partial<ScheduledTaskSummary> = {}): ScheduledTaskSummary {
	return {
		name: 'repo-health-scan-daily', platform: 'claude', runCount: 10, activeDays: 10, lastRun: '2026-11-24T07:07:00.000Z',
		schedule: '0 8 * * *', enabled: true, folder: 'C:\\code\\app', repository: 'octo/app', totalRuns: 46, failedRuns: 2,
		recentRuns: [{ at: '2026-11-24T07:07:00.000Z', ok: true }, { at: '2026-11-23T07:07:00.000Z', ok: false }], health: 'healthy',
		...overrides,
	};
}

function render(tasks: ScheduledTaskSummary[]): Document {
	const report: RepeatedTaskReport = { minClusterSize: 2, sessionsScanned: 0, clusters: [], scheduledTasks: tasks };
	return new JSDOM(`<div>${buildScheduledAutomationsSectionHtml(report)}</div>`).window.document;
}

test('scheduledAutomations: renders nothing without scheduled tasks', () => {
	assert.equal(buildScheduledAutomationsSectionHtml(null), '');
	assert.equal(buildScheduledAutomationsSectionHtml({ minClusterSize: 2, sessionsScanned: 0, clusters: [] }), '');
});

test('scheduledAutomations: one row per task with repository, schedule, recent success and status; at-risk first and counted', () => {
	const doc = render([
		task(),
		task({ name: 'stopped', platform: 'copilot', health: 'stale', repository: null, folder: 'C:\\code\\devops-actions', recentRuns: [] }),
		task({ name: '<img src=x>', health: 'disabled', enabled: false }),
	]);
	const section = doc.getElementById(SCHEDULED_AUTOMATIONS_SECTION_ID)!;
	assert.match(section.querySelector('.section-title')!.textContent!, /Scheduled automations \(3, 1 at risk\)/);
	assert.match(section.querySelector('.section-subtitle')!.textContent!, /30 days/);
	const rows = Array.from(section.querySelectorAll('tbody tr'));
	assert.equal(rows.length, 3);
	const cells = (row: Element) => Array.from(row.querySelectorAll('td')).map(td => td.textContent!.trim());
	assert.equal(cells(rows[0])[0], 'stopped', 'at-risk tasks sort first');
	assert.equal(cells(rows[0])[1], 'GitHub Copilot');
	assert.equal(cells(rows[0])[2], 'devops-actions', 'folder name when there is no owner/repo');
	assert.equal(cells(rows[0])[5], '—');
	assert.equal(rows[0].querySelector('.scheduled-automation-health')!.getAttribute('data-health'), 'stale');
	const healthy = rows.find(r => cells(r)[0] === 'repo-health-scan-daily')!;
	assert.deepEqual(cells(healthy).slice(1, 4), ['Claude Code', 'octo/app', '0 8 * * *']);
	assert.equal(cells(healthy)[5], '1/2 runs');
	assert.match(cells(healthy)[6], /Healthy/);
	assert.ok(!section.innerHTML.includes('<img src=x>'), 'task names are escaped');
});

test('scheduledAutomations: title has no risk count when nothing is at risk', () => {
	const doc = render([task()]);
	assert.match(doc.querySelector('.section-title')!.textContent!, /Scheduled automations \(1\)$/);
});

test('sanitizeScheduledTask: keeps known fields, drops bad ones, rejects unknown platforms', () => {
	const t = sanitizeScheduledTask({ ...task(), health: 'exploded', recentRuns: [{ at: 'x', ok: true }, { at: 1, ok: true }, 'bad'], totalRuns: -4, extra: 'ignored' })!;
	assert.equal(t.health, undefined);
	assert.deepEqual(t.recentRuns, [{ at: 'x', ok: true }]);
	assert.equal(t.totalRuns, 0);
	assert.equal('extra' in t, false);
	assert.equal(sanitizeScheduledTask({ name: 'x', platform: 'cron' }), null);
	assert.deepEqual(sanitizeScheduledTask({ name: 'x', platform: 'claude' }), { name: 'x', platform: 'claude', runCount: 0, activeDays: 0, lastRun: null });
	assert.deepEqual(sanitizeScheduledTasks('nope'), []);
});

test('sanitizeRepeatedTaskReport: a report with only scheduled tasks is kept', () => {
	const report = sanitizeRepeatedTaskReport({ minClusterSize: 2, sessionsScanned: 0, clusters: [], scheduledTasks: [task()] })!;
	assert.equal(report.clusters.length, 0);
	assert.equal(report.scheduledTasks!.length, 1);
	assert.equal(sanitizeRepeatedTaskReport({ clusters: [], scheduledTasks: [] }), null);
});

test('scheduledAutomations: failed runs list their sessions with tokens and cost, newest first, with a total', () => {
	const doc = render([
		task({ name: 'nightly', recentRuns: [
			{ at: '2026-11-20T08:00:00.000Z', ok: false, sessionFile: 'C:\\logs\\"a"<b>.jsonl', tokens: 1500000, costUsd: 3.25 },
			{ at: '2026-11-19T08:00:00.000Z', ok: true, sessionFile: 'C:\\logs\\ok.jsonl', tokens: 10, costUsd: 0.01 },
			{ at: '2026-11-18T08:00:00.000Z', ok: false },
		] }),
		task({ name: 'weekly', recentRuns: [{ at: '2026-11-21T08:00:00.000Z', ok: false, sessionFile: 'C:\\logs\\w.jsonl' }] }),
	]);
	const block = doc.querySelector('.scheduled-automation-failed-runs')!;
	// Compact numbers are on by default.
	assert.match(block.textContent!, /Failed runs \(2\) — 1\.5M tokens, \$3\.25/);
	const rows = Array.from(doc.querySelectorAll('#data-table-root-' + FAILED_RUNS_TABLE_ID + ' tbody tr'));
	const cells = (row: Element) => Array.from(row.querySelectorAll('td')).map(td => td.textContent!.trim());
	assert.deepEqual(rows.map(r => cells(r)[0]), ['weekly', 'nightly'], 'newest first');
	assert.deepEqual(cells(rows[0]).slice(2, 4), ['—', '—'], 'unknown tokens and cost');
	assert.deepEqual(cells(rows[1]).slice(2, 4), ['1.5M', '$3.25']);
	const open = rows[1].querySelector('button.scheduled-automation-open-session')!;
	assert.equal(open.getAttribute('data-file'), 'C:\\logs\\"a"<b>.jsonl');
});

test('scheduledAutomations: no failed run with a session means no failed-runs block', () => {
	const doc = render([task({ recentRuns: [{ at: '2026-11-20T08:00:00.000Z', ok: false }, { at: '2026-11-19T08:00:00.000Z', ok: true, sessionFile: 'x' }] })]);
	assert.equal(doc.querySelector('.scheduled-automation-failed-runs'), null);
	assert.deepEqual(failedRunRows([]), []);
});

test('wireScheduledAutomations: an Open button posts openSessionFile, wired once across re-renders', () => {
	const dom = new JSDOM('<div id="root"></div>');
	const globals = globalThis as unknown as Record<string, unknown>;
	const previous = { document: globals.document, Element: globals.Element };
	Object.assign(globals, { document: dom.window.document, Element: dom.window.Element });
	try {
		const report: RepeatedTaskReport = { minClusterSize: 2, sessionsScanned: 0, clusters: [], scheduledTasks: [task({ recentRuns: [{ at: '2026-11-20T08:00:00.000Z', ok: false, sessionFile: 'C:\\logs\\run.jsonl' }] })] };
		dom.window.document.getElementById('root')!.innerHTML = buildScheduledAutomationsSectionHtml(report);
		const posted: unknown[] = [];
		wireScheduledAutomations(m => posted.push(m));
		wireScheduledAutomations(m => posted.push(m));
		(dom.window.document.querySelector('button.scheduled-automation-open-session') as HTMLElement).click();
		assert.deepEqual(posted, [{ command: 'openSessionFile', file: 'C:\\logs\\run.jsonl' }]);
		assert.equal(dom.window.document.getElementById(SCHEDULED_AUTOMATIONS_SECTION_ID)!.dataset.scheduledAutomationsWired, 'true');
	} finally {
		Object.assign(globals, previous);
	}
});

test('sanitizeScheduledTask: keeps a run\'s session link, tokens and cost; drops malformed ones', () => {
	const t = sanitizeScheduledTask({ ...task(), recentRuns: [
		{ at: 'x', ok: false, sessionId: 's', sessionFile: 'f', tokens: 12, costUsd: 0.5 },
		{ at: 'y', ok: false, sessionFile: 3, tokens: -1, costUsd: Number.NaN },
	] })!;
	assert.deepEqual(t.recentRuns, [{ at: 'x', ok: false, sessionId: 's', sessionFile: 'f', tokens: 12, costUsd: 0.5 }, { at: 'y', ok: false }]);
});
