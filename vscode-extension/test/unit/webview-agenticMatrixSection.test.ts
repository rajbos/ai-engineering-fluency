import test from 'node:test';
import * as assert from 'node:assert/strict';
import { buildAgenticMatrixHtml, sanitizeAgenticMatrix } from '../../src/webview/usage/agenticMatrixSection';
import type { AgenticMatrix, AgenticMatrixPlacement } from '../../../src/types';

function placement(overrides: Partial<AgenticMatrixPlacement>): AgenticMatrixPlacement {
	return {
		repository: 'o/r', foundation: 'weak', foundationScore: 0.2, observedControls: 10, unknownControls: 5,
		agenticSessions: 8, sessions: 10, highAdoption: true, quadrant: 'stretched', leaning: false,
		missingControls: [{ id: 'ci-test-execution', label: 'Tests run in CI', stage: 1 }],
		...overrides,
	};
}

const matrix: AgenticMatrix = {
	windowDays: 30,
	placements: [
		placement({}),
		placement({ repository: 'o/good', foundation: 'strong', foundationScore: 0.9, quadrant: 'healthy-agent-native', missingControls: [] }),
		placement({ repository: 'o/lean', foundation: 'partial', foundationScore: 0.6, quadrant: 'healthy-underused', leaning: true, highAdoption: false }),
		placement({ repository: 'o/unknown', foundation: 'unassessed', quadrant: undefined, unassessedReason: 'no-remote' }),
	],
	adoptionOnly: [{ repository: 'else/where', agenticSessions: 4, sessions: 6 }],
};

test('buildAgenticMatrixHtml: places repositories in their quadrants with actions and repair list', () => {
	const html = buildAgenticMatrixHtml(matrix);
	assert.match(html, /id="agentic-matrix"/);
	const stretched = html.split('data-quadrant="stretched"')[1];
	assert.match(stretched, /o\/r/);
	assert.match(html, /agentic-quadrant-stretched/);
	assert.match(html, /narrow scope and repair the missing controls/);
	assert.match(html, /Tests run in CI/);
	assert.match(html, /agentic-repo-chip-leaning[^>]*>o\/lean \(leaning\)/);
	assert.match(html, /o\/unknown \(no GitHub remote to match sessions to\)/);
	assert.match(html, /else\/where \(4 agent sessions\)/);
	assert.match(html, /never uploaded or shared/);
});

test('buildAgenticMatrixHtml: empty when there is nothing to place', () => {
	assert.equal(buildAgenticMatrixHtml(null), '');
	assert.equal(buildAgenticMatrixHtml({ windowDays: 30, placements: [], adoptionOnly: [] }), '');
});

test('buildAgenticMatrixHtml: escapes repository and control names', () => {
	const html = buildAgenticMatrixHtml({ windowDays: 30, adoptionOnly: [], placements: [placement({ repository: '<img src=x>', missingControls: [{ id: 'x', label: '<b>', stage: 1 }] })] });
	assert.ok(!html.includes('<img src=x>'), 'raw repository name must not reach the HTML');
	assert.ok(!html.includes('<b>'), 'raw control label must not reach the HTML');
	assert.ok(html.includes('&lt;img src=x&gt;') && html.includes('&lt;b&gt;'), 'both are escaped instead');
});

test('sanitizeAgenticMatrix: keeps valid placements and drops malformed ones', () => {
	const raw = JSON.parse(JSON.stringify(matrix));
	raw.placements.push({ repository: 'bad', foundation: 'excellent' }, { ...raw.placements[0], quadrant: 'somewhere' }, { ...raw.placements[0], sessions: -1 });
	raw.adoptionOnly.push({ repository: 3 });
	const result = sanitizeAgenticMatrix(raw);
	assert.ok(result);
	assert.equal(result.placements.length, 4);
	assert.equal(result.adoptionOnly.length, 1);
	assert.equal(sanitizeAgenticMatrix(null), null);
	assert.equal(sanitizeAgenticMatrix({ placements: [] }), null);
});
