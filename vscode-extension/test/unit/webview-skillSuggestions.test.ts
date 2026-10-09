import test from 'node:test';
import * as assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

import { initializeWebviewLocalization } from '../../src/webview/shared/localization';
import { setPagedTablePage } from '../../src/webview/usage/pagedTable';
import {
	SKILL_SUGGESTIONS_LIST_ID,
	SKILL_SUGGESTIONS_PAGE_SIZE,
	buildSkillSuggestionsSectionHtml,
	getSkillSuggestionsPage,
	isRepositoryOpen,
	resolveSkillCreateAction,
	sanitizeRepeatedTaskReport,
	sessionsTableId,
	wireSkillSuggestions,
	type RepeatedTaskCluster,
	type RepeatedTaskReport,
	type SkillSuggestionsMessage,
} from '../../src/webview/usage/skillSuggestions';

initializeWebviewLocalization({});

function makeCluster(index: number, sessionCount = 2, repositories = ['octo/app']): RepeatedTaskCluster {
	return {
		representativePrompt: `task number ${index}`,
		sessionCount,
		repositories,
		sessions: Array.from({ length: sessionCount }, (_, s) => ({
			file: `C:\\logs\\cluster-${index}-session-${s}.jsonl`,
			title: `Session ${index}.${s}`,
			lastInteraction: `2026-01-${String(28 - s).padStart(2, '0')}T10:00:00Z`,
			repository: repositories[0],
		})),
		sharedKeywords: ['task'],
		examplePrompts: [],
	};
}

function makeReport(clusterCount: number): RepeatedTaskReport {
	return {
		minClusterSize: 2,
		sessionsScanned: 99,
		clusters: Array.from({ length: clusterCount }, (_, i) => makeCluster(i)),
	};
}

function render(report: RepeatedTaskReport | null): Document {
	return new JSDOM(`<div id="root">${buildSkillSuggestionsSectionHtml(report)}</div>`).window.document;
}

function resetPages(): void {
	setPagedTablePage(SKILL_SUGGESTIONS_LIST_ID, 1);
}

test('skillSuggestions: no report or no clusters renders nothing', () => {
	assert.equal(buildSkillSuggestionsSectionHtml(null), '');
	assert.equal(buildSkillSuggestionsSectionHtml({ minClusterSize: 2, sessionsScanned: 3, clusters: [] }), '');
});

test('skillSuggestions: title carries the total count and the subtitle the scanned sessions', () => {
	resetPages();
	const doc = render(makeReport(7));
	assert.match(doc.querySelector('.section-title')!.textContent!, /Skill Suggestions \(7\)/);
	assert.match(doc.querySelector('.section-subtitle')!.textContent!, /99 sessions scanned/);
});

for (const [count, expectedCards, pagerShown] of [[1, 1, false], [5, 5, false], [6, 5, true], [12, 5, true]] as const) {
	test(`skillSuggestions: ${count} suggestions → ${expectedCards} cards on page 1, pager ${pagerShown ? 'shown' : 'hidden'}`, () => {
		resetPages();
		const doc = render(makeReport(count));
		assert.equal(doc.querySelectorAll('.skill-suggestion-card').length, expectedCards);
		const pager = Array.from(doc.querySelectorAll('[data-paged-table]'))
			.filter(el => el.getAttribute('data-paged-table') === SKILL_SUGGESTIONS_LIST_ID);
		assert.equal(pager.length > 0, pagerShown);
	});
}

test('skillSuggestions: page slicing keeps global cluster indexes and the last page is partial', () => {
	resetPages();
	const clusters = makeReport(12).clusters;
	setPagedTablePage(SKILL_SUGGESTIONS_LIST_ID, 3);
	const page = getSkillSuggestionsPage(clusters);
	assert.equal(SKILL_SUGGESTIONS_PAGE_SIZE, 5);
	assert.deepEqual([page.page, page.pageCount, page.firstRow, page.lastRow], [3, 3, 11, 12]);
	const doc = render({ minClusterSize: 2, sessionsScanned: 1, clusters });
	const indexes = Array.from(doc.querySelectorAll('.skill-suggestion-card')).map(c => c.getAttribute('data-cluster-index'));
	assert.deepEqual(indexes, ['10', '11']);
	assert.match(doc.querySelector('.paged-table-pager')!.textContent!, /Page 3 of 3/);
});

test('skillSuggestions: a stale page is clamped when the list shrinks after a refresh', () => {
	resetPages();
	setPagedTablePage(SKILL_SUGGESTIONS_LIST_ID, 3);
	const page = getSkillSuggestionsPage(makeReport(6).clusters);
	assert.equal(page.page, 2);
	assert.deepEqual(page.rows.map(c => c.representativePrompt), ['task number 5']);
	assert.equal(getSkillSuggestionsPage(makeReport(2).clusters).page, 1);
});

test('skillSuggestions: sessions table has one open button per session with the escaped file path', () => {
	resetPages();
	const report = makeReport(1);
	report.clusters[0].sessions[0].file = 'C:\\logs\\"evil"<b>.jsonl';
	report.clusters[0].sessions[0].title = '<img src=x onerror=alert(1)>';
	const html = buildSkillSuggestionsSectionHtml(report);
	assert.ok(!html.includes('<img src=x'), 'session title must be escaped');
	const doc = render(report);
	const buttons = Array.from(doc.querySelectorAll('button.skill-suggestion-open-session'));
	assert.equal(buttons.length, 2);
	assert.equal(buttons[0].getAttribute('data-file'), 'C:\\logs\\"evil"<b>.jsonl');
	assert.equal(buttons[1].getAttribute('data-file'), 'C:\\logs\\cluster-0-session-1.jsonl');
	const headers = Array.from(doc.querySelectorAll('.paged-table th')).map(th => th.textContent!.trim());
	assert.deepEqual(headers, ['Session', 'Date', 'Repository', 'Actions']);
	assert.match(doc.querySelector('.paged-table tbody tr')!.textContent!, /<img src=x onerror=alert\(1\)>/);
});

test('skillSuggestions: representative prompt and keywords are HTML-escaped', () => {
	resetPages();
	const report = makeReport(1);
	report.clusters[0].representativePrompt = '<script>alert(1)</script>';
	report.clusters[0].sharedKeywords = ['<b>kw</b>'];
	const html = buildSkillSuggestionsSectionHtml(report);
	assert.ok(!html.includes('<script>'));
	assert.ok(!html.includes('<b>kw</b>'));
});

test('skillSuggestions: a sessions table pages only above 10 sessions', () => {
	resetPages();
	const small = render({ minClusterSize: 2, sessionsScanned: 10, clusters: [makeCluster(0, 10)] });
	assert.equal(small.querySelectorAll('.skill-suggestion-open-session').length, 10);
	assert.equal(small.querySelector('.paged-table-pager'), null);

	const large = render({ minClusterSize: 2, sessionsScanned: 12, clusters: [makeCluster(0, 12)] });
	assert.equal(large.querySelectorAll('.skill-suggestion-open-session').length, 10);
	const pagerButtons = Array.from(large.querySelectorAll('.paged-table-pager button'));
	assert.ok(pagerButtons.every(b => b.getAttribute('data-paged-table') === sessionsTableId(0)));
});

test('isRepositoryOpen: matches the repository name against open workspace folder names', () => {
	assert.equal(isRepositoryOpen('octo/app', ['C:\\code\\App']), true);
	assert.equal(isRepositoryOpen('octo/app', ['/home/me/src/app/']), true);
	assert.equal(isRepositoryOpen('octo/app', ['/home/me/src/api']), false);
	assert.equal(isRepositoryOpen('octo/app', []), false);
});

test('resolveSkillCreateAction: drafts when the single repo is open or the cluster spans repos, else asks to open it', () => {
	assert.equal(resolveSkillCreateAction(makeCluster(0), ['/src/app']).kind, 'draft');
	assert.equal(resolveSkillCreateAction(makeCluster(0, 2, ['octo/app', 'octo/api']), []).kind, 'draft');
	const blocked = resolveSkillCreateAction(makeCluster(0), ['/src/other']);
	assert.equal(blocked.kind, 'openRepoFirst');
	assert.match(blocked.prompt, /\.github\/skills\//);
});

test('sanitizeRepeatedTaskReport: examplePrompts is optional and filtered to strings', () => {
	const legacy = sanitizeRepeatedTaskReport({ clusters: [{ representativePrompt: 'x', sessionCount: 1, sessions: [{ file: 'a' }] }] });
	assert.deepEqual(legacy!.clusters[0].examplePrompts, []);
	const mixed = sanitizeRepeatedTaskReport({ clusters: [{ representativePrompt: 'x', sessionCount: 1, sessions: [{ file: 'a' }], examplePrompts: ['ok', 3, null] }] });
	assert.deepEqual(mixed!.clusters[0].examplePrompts, ['ok']);
});

test('wireSkillSuggestions: delegated clicks post messages, page the list, and survive re-renders', () => {
	resetPages();
	const report = makeReport(7);
	report.clusters[1] = makeCluster(1, 2, ['octo/app', 'octo/api']);
	const dom = new JSDOM(`<div id="root">${buildSkillSuggestionsSectionHtml(report)}</div>`);
	const globals = globalThis as unknown as Record<string, unknown>;
	const previous = { document: globals.document, Element: globals.Element, HTMLElement: globals.HTMLElement };
	Object.assign(globals, { document: dom.window.document, Element: dom.window.Element, HTMLElement: dom.window.HTMLElement });
	const posted: SkillSuggestionsMessage[] = [];
	try {
		const wiring = { getReport: () => report, getWorkspacePaths: () => ['/src/elsewhere'], postMessage: (m: SkillSuggestionsMessage) => posted.push(m) };
		wireSkillSuggestions(wiring);
		wireSkillSuggestions(wiring); // idempotent: a second call must not double-post
		const doc = dom.window.document;
		const click = (el: Element | null) => { assert.ok(el); (el as HTMLElement).click(); };

		click(doc.querySelector('button.skill-suggestion-open-session'));
		assert.deepEqual(posted, [{ command: 'openSessionFile', file: 'C:\\logs\\cluster-0-session-0.jsonl' }]);

		// Multi-repo cluster → user-level skill, drafted (never submitted) regardless of the open workspace.
		click(doc.querySelector('button.skill-suggestion-create[data-cluster-index="1"]'));
		assert.equal(posted.length, 2);
		assert.equal(posted[1].command, 'draftCopilotChatWithPrompt');
		assert.match((posted[1] as { prompt: string }).prompt, /~\/\.copilot\/skills\//);

		// Single repo that is not open → instructions instead of a message.
		click(doc.querySelector('button.skill-suggestion-create[data-cluster-index="0"]'));
		assert.equal(posted.length, 2);
		const notice = doc.querySelector('.skill-suggestion-notice[data-cluster-index="0"]')!;
		assert.match(notice.textContent!, /Open "app" in VS Code first/);
		assert.match(notice.querySelector('pre')!.textContent!, /\.github\/skills\//);

		// Next page re-renders the section; the same listener keeps handling clicks.
		click(doc.querySelector(`[data-paged-table="${SKILL_SUGGESTIONS_LIST_ID}"][data-paged-direction="next"]`));
		const indexes = Array.from(doc.querySelectorAll('.skill-suggestion-card') as NodeListOf<Element>).map(c => c.getAttribute('data-cluster-index'));
		assert.deepEqual(indexes, ['5', '6']);
		click(doc.querySelector('button.skill-suggestion-open-session'));
		assert.deepEqual(posted[2], { command: 'openSessionFile', file: 'C:\\logs\\cluster-5-session-0.jsonl' });
	} finally {
		Object.assign(globals, previous);
		resetPages();
	}
});
