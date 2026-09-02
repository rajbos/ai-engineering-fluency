import test from 'node:test';
import * as assert from 'node:assert/strict';
import { sanitizeAgentSessionsData } from '../../src/webview/usage/agentSessionsSanitizer';

// The cloud-agent snapshot crosses the extension-host → webview trust boundary: repo names come
// from the GitHub API and end up interpolated into HTML, so every string is escaped here and every
// number is coerced. These tests cover the fields added for the account-wide task listing.

test('sanitizeAgentSessionsData: carries the snapshot freshness and account-listing status through', () => {
	const result = sanitizeAgentSessionsData({
		repos: [],
		totalTasks: 3,
		totalSessions: 4,
		totalCredits: 12.5,
		totalPremiumRequests: 1.5,
		authenticated: true,
		since: '2026-07-30T00:00:00Z',
		fetchedAt: '2026-08-29T10:00:00Z',
		accountTasksAvailable: true,
		partial: true,
	});

	assert.equal(result.fetchedAt, '2026-08-29T10:00:00Z');
	assert.equal(result.totalPremiumRequests, 1.5);
	assert.equal(result.accountTasksAvailable, true);
	assert.equal(result.partial, true);
	assert.equal(result.accountTasksError, undefined);
});

test('sanitizeAgentSessionsData: defaults a never-fetched snapshot to an empty fetchedAt', () => {
	const result = sanitizeAgentSessionsData({ authenticated: true });
	assert.equal(result.fetchedAt, '');
	assert.equal(result.accountTasksAvailable, false);
	assert.equal(result.totalPremiumRequests, 0);
	assert.deepEqual(result.repos, []);
});

test('sanitizeAgentSessionsData: escapes the account-listing error message', () => {
	const result = sanitizeAgentSessionsData({
		authenticated: true,
		accountTasksError: '<img src=x onerror=alert(1)>',
	});
	assert.ok(!result.accountTasksError?.includes('<img'));
	assert.ok(result.accountTasksError?.includes('&lt;img'));
});

test('sanitizeAgentSessionsData: keeps the discovery source, defaulting unknown values to workspace', () => {
	const result = sanitizeAgentSessionsData({
		authenticated: true,
		repos: [
			{ owner: 'octo', repo: 'a', discovery: 'account' },
			{ owner: 'octo', repo: 'b', discovery: 'both' },
			{ owner: 'octo', repo: 'c', discovery: 'something-else' },
			{ owner: 'octo', repo: 'd' },
		],
	});

	assert.deepEqual(result.repos.map(r => r.discovery), ['account', 'both', 'workspace', 'workspace']);
});

test('sanitizeAgentSessionsData: the repo-less bucket is marked unassigned and gets no repo link', () => {
	const result = sanitizeAgentSessionsData({
		authenticated: true,
		repos: [
			{ owner: '', repo: '', unassigned: true, totalCredits: 2 },
			{ owner: 'octo', repo: 'demo', totalCredits: 1 },
		],
	});

	assert.equal(result.repos[0].unassigned, true);
	assert.equal(result.repos[0].repoUrl, '#');
	assert.equal(result.repos[1].unassigned, false);
	assert.equal(result.repos[1].repoUrl, 'https://github.com/octo/demo');
});

test('sanitizeAgentSessionsData: a repo row missing its name is treated as unassigned, not linked', () => {
	const result = sanitizeAgentSessionsData({
		authenticated: true,
		repos: [{ owner: 'octo', repo: '' }],
	});

	assert.equal(result.repos[0].unassigned, true);
	assert.equal(result.repos[0].repoUrl, '#');
});

test('sanitizeAgentSessionsData: escapes hostile repo names and coerces hostile numbers', () => {
	const result = sanitizeAgentSessionsData({
		authenticated: true,
		repos: [{
			owner: '<script>alert(1)</script>',
			repo: '"onload="x',
			totalCredits: -5,
			totalPremiumRequests: 'lots',
			tasksTotal: Number.NaN,
		}],
	});

	const row = result.repos[0];
	assert.ok(!row.owner.includes('<script>'));
	assert.ok(!row.repo.includes('"'));
	assert.equal(row.totalCredits, 0);
	assert.equal(row.totalPremiumRequests, 0);
	assert.equal(row.tasksTotal, 0);
});
