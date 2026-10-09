import test from 'node:test';
import * as assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

import type { ServerMemoriesAnalysisView } from '../../../src/types';
import { setFormatLocale } from '../../src/webview/shared/formatUtils';
import { initializeWebviewLocalization } from '../../src/webview/shared/localization';
import {
	buildServerMemoriesSectionHtml,
	sanitizeServerMemoriesAnalysis,
	serverMemoriesMessageForClick,
} from '../../src/webview/usage/serverMemories';

setFormatLocale('en-US');
initializeWebviewLocalization({});

function view(overrides: Partial<ServerMemoriesAnalysisView> = {}): ServerMemoriesAnalysisView {
	return {
		repo: 'owner/name',
		enabled: true,
		truncated: false,
		totalMemories: 30,
		distinctSubjects: 12,
		documentedCount: 3,
		promotionCandidateCount: 5,
		repeatedGroupCount: 1,
		fullyStaleCount: 0,
		topPromotionGroups: [
			{ displaySubject: 'caching', repeatCount: 3, representativeFact: 'Cache via snapshots.', citationCount: 2, prompt: 'Move "caching" <now> & verify' },
			{ displaySubject: 'no prompt', repeatCount: 1, representativeFact: 'Legacy payload row.', citationCount: 1 },
		],
		repoRoot: 'C:\\code\\<repo>',
		workspaceFolderCount: 1,
		promotionTarget: { path: 'AGENTS.md', exists: true },
		documentedMemories: [
			{ subject: 'build', fact: 'Use build.ps1.', files: [{ path: 'AGENTS.md', absolutePath: 'C:\\code\\repo\\AGENTS.md' }, { path: 'docs/gone.md' }] },
		],
		...overrides,
	};
}

function render(analysis: ServerMemoriesAnalysisView): Document {
	return new JSDOM(`<body>${buildServerMemoriesSectionHtml(analysis)}</body>`).window.document;
}

test('serverMemories section: names the repository and its checkout, HTML-escaped', () => {
	const html = buildServerMemoriesSectionHtml(view({ repo: 'o/<b>n</b>' }));
	assert.match(html, /<strong>o\/&lt;b&gt;n&lt;\/b&gt;<\/strong>/);
	assert.match(html, /<code>C:\\code\\&lt;repo&gt;<\/code>/);
	assert.match(html, /not specific to this VS Code workspace/);
	assert.match(html, /local notes, per machine and workspace/);
	assert.ok(!html.includes('<repo>'));
});

test('serverMemories section: falls back to the slug alone without a checkout path', () => {
	const html = buildServerMemoriesSectionHtml(view({ repoRoot: undefined }));
	assert.match(html, /Memories GitHub stores for <strong>owner\/name<\/strong>\. Shared by everyone/);
});

test('serverMemories section: multi-root note only when more than one folder is open', () => {
	assert.ok(!buildServerMemoriesSectionHtml(view()).includes('only the first folder'));
	assert.match(buildServerMemoriesSectionHtml(view({ workspaceFolderCount: 3 })), /This workspace has 3 folders; only the first folder backed by a GitHub repository is shown\./);
});

test('serverMemories section: the Ask Copilot button appears only on rows with a prompt', () => {
	const doc = render(view());
	const buttons = doc.querySelectorAll('.server-memory-draft-btn');
	assert.equal(buttons.length, 1);
	assert.equal(buttons[0].getAttribute('data-prompt'), 'Move "caching" <now> & verify');
	assert.match(buttons[0].getAttribute('title') ?? '', /AGENTS\.md\. Nothing is sent until you press Enter/);
	assert.match(doc.body.innerHTML, /Suggested file: <code>AGENTS\.md<\/code>\./);
});

test('serverMemories section: an older payload with no prompts gets no action column', () => {
	const html = buildServerMemoriesSectionHtml(view({
		topPromotionGroups: [{ displaySubject: 's', repeatCount: 1, representativeFact: 'f', citationCount: 1 }],
		promotionTarget: undefined,
		documentedMemories: undefined,
		repoRoot: undefined,
	}));
	assert.ok(!html.includes('server-memory-draft-btn'));
	assert.ok(!html.includes('>Action<'));
	assert.ok(!html.includes('Already documented'));
});

test('serverMemories section: a missing target file is labelled as one Copilot will create', () => {
	assert.match(buildServerMemoriesSectionHtml(view({ promotionTarget: { path: 'AGENTS.md', exists: false } })), /does not exist yet/);
});

test('serverMemories section: documented table lists files with Open file only for resolvable ones', () => {
	const doc = render(view());
	const table = doc.querySelector('table.server-memories-documented');
	assert.ok(table);
	assert.match(table.textContent ?? '', /Use build\.ps1\./);
	assert.match(table.textContent ?? '', /docs\/gone\.md/);
	const open = doc.querySelectorAll('.server-memory-open-btn');
	assert.equal(open.length, 1);
	assert.equal(open[0].getAttribute('data-path'), 'C:\\code\\repo\\AGENTS.md');
	assert.match(doc.body.textContent ?? '', /Already documented \(showing 1 of 3\)/);
});

test('serverMemories section: clicks map to draft and open messages', () => {
	const doc = render(view());
	assert.deepEqual(serverMemoriesMessageForClick(doc.querySelector('.server-memory-draft-btn')),
		{ command: 'draftCopilotChatWithPrompt', prompt: 'Move "caching" <now> & verify' });
	assert.deepEqual(serverMemoriesMessageForClick(doc.querySelector('.server-memory-open-btn')),
		{ command: 'openFile', path: 'C:\\code\\repo\\AGENTS.md' });
	assert.equal(serverMemoriesMessageForClick(doc.querySelector('table')), null);
	assert.equal(serverMemoriesMessageForClick(null), null);
});

test('serverMemories section: error and disabled states are unchanged', () => {
	const errorHtml = buildServerMemoriesSectionHtml(view({ error: 'HTTP 403' }));
	assert.match(errorHtml, /could not be read: HTTP 403/);
	assert.ok(!errorHtml.includes('server-memory-draft-btn'));
	const disabledHtml = buildServerMemoriesSectionHtml(view({ enabled: false }));
	assert.match(disabledHtml, /Memory is turned off/);
	assert.ok(!disabledHtml.includes('Already documented'));
	assert.equal(buildServerMemoriesSectionHtml(null), '');
});

test('sanitizeServerMemoriesAnalysis keeps the new fields and drops malformed ones', () => {
	const sanitized = sanitizeServerMemoriesAnalysis({
		...view(),
		promotionTarget: { path: '../evil.md', exists: true },
		workspaceFolderCount: 'two',
		topPromotionGroups: [{ displaySubject: 's', representativeFact: 'f', prompt: 42 }],
		documentedMemories: [{ subject: 's', fact: 'f', files: [{ path: 'AGENTS.md', absolutePath: 7 }, { nope: true }] }, { subject: 1 }],
	});
	assert.ok(sanitized);
	assert.equal(sanitized.promotionTarget, undefined);
	assert.equal(sanitized.workspaceFolderCount, 0);
	assert.equal(sanitized.topPromotionGroups[0].prompt, undefined);
	assert.deepEqual(sanitized.documentedMemories, [{ subject: 's', fact: 'f', files: [{ path: 'AGENTS.md' }] }]);
	assert.equal(sanitized.repoRoot, 'C:\\code\\<repo>');
});
