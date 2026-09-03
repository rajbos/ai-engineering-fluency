import test from 'node:test';
import * as assert from 'node:assert/strict';
import type * as http from 'node:http';
import { EventEmitter } from 'node:events';
import {
	collectAgentSessions,
	detectSessionSource,
	fetchAgentSessionsForRepo,
	readSessionUsage,
	requestGitHubJson,
	requestGitHubJsonTransport,
	resolveTaskRepo,
	type AgentRepoSummary,
	type FetchAccountTaskPageFn,
	type FetchTaskPageFn,
	type FetchTaskDetailFn,
} from '../../src/agentSessionsService';

/**
 * Minimal stand-in for `http.ClientRequest`, exercising exactly the surface
 * `attachRequestFailureHandling` (see `src/githubApiConfig.ts`) touches. Lets a test drive the
 * real request-creation code path in `agentSessionsService.ts` end-to-end without a live network
 * call. `requestGitHubJsonTransport` accepts an injectable `requestFn` (defaulting to the real
 * `https.request`) for exactly this purpose — Node's built-in module exports are non-configurable
 * in current versions, so monkey-patching `https.request` directly is not viable here.
 */
class FakeClientRequest extends EventEmitter {
	private timeoutCallback?: () => void;
	setTimeout(_ms: number, cb: () => void): this {
		this.timeoutCallback = cb;
		return this;
	}
	destroy(err?: Error): this {
		if (err) { this.emit('error', err); }
		return this;
	}
	end(): this { return this; }
	fireTimeout(): void { this.timeoutCallback?.(); }
}

// ---------------------------------------------------------------------------
// detectSessionSource — pure function, no I/O
// ---------------------------------------------------------------------------

test('detectSessionSource: cloud-agent when model is non-empty', () => {
	assert.equal(detectSessionSource({ model: 'sweagent-capi:claude-sonnet-4' }), 'cloud-agent');
	assert.equal(detectSessionSource({ model: 'gpt-4o' }), 'cloud-agent');
});

test('detectSessionSource: cloud-agent when usage field is present (even with empty model)', () => {
	assert.equal(detectSessionSource({ model: '', usage: { credits: 10, type: 'ai-credits' } }), 'cloud-agent');
	assert.equal(detectSessionSource({ usage: { credits: 5 } }), 'cloud-agent');
});

test('detectSessionSource: cli-remote when model field is present but empty, no usage', () => {
	assert.equal(detectSessionSource({ model: '' }), 'cli-remote');
});

test('detectSessionSource: unknown when model field is entirely absent', () => {
	assert.equal(detectSessionSource({}), 'unknown');
	assert.equal(detectSessionSource({ usage: null }), 'unknown');
});

// ---------------------------------------------------------------------------
// fetchAgentSessionsForRepo — pagination, source filtering, credit aggregation
// ---------------------------------------------------------------------------

function makeTask(id: string): any {
	return { id, name: `Task ${id}`, state: 'completed', created_at: new Date().toISOString() };
}

/** GitHub's agents API reports usage.credits in nano-credits (1 credit = 1_000_000_000 nano-credits). */
const NANO_CREDITS_PER_CREDIT = 1_000_000_000;

function makeSession(model: string, credits?: number): any {
	const s: any = { id: `s-${Math.random()}`, state: 'completed', model, created_at: new Date().toISOString() };
	if (credits !== undefined) { s.usage = { credits: credits * NANO_CREDITS_PER_CREDIT, type: 'ai_credits' }; }
	return s;
}

const SINCE = new Date('2024-01-01T00:00:00Z');

test('requestGitHubJson: stops waiting when the transport never settles', async () => {
	const hangingTransport = async (): Promise<never> => new Promise(() => {});
	const result = await requestGitHubJson('/agents/tasks', 'token', hangingTransport, 5);
	assert.match(result.error ?? '', /GitHub API request \/agents\/tasks timed out/);
});

// ---------------------------------------------------------------------------
// requestGitHubJson (default transport) — end-to-end through the real
// `https.request` wiring, verifying it reports a genuine transport failure
// distinctly from a socket-inactivity timeout (PR #1919 follow-up item 1: the
// mislabelled GitHub request timeout).
// ---------------------------------------------------------------------------

test('requestGitHubJsonTransport: a genuine connection error is reported with its real code, not as a timeout', async () => {
	const req = new FakeClientRequest();
	const fakeRequestFn = (() => req) as unknown as typeof http.request;
	const promise = requestGitHubJsonTransport('/agents/tasks', 'token', fakeRequestFn);
	req.emit('error', Object.assign(new Error('read ECONNRESET'), { code: 'ECONNRESET' }));
	const result = await promise;
	assert.match(result.error ?? '', /^Connection failed after \d+(\.\d+)?s \(ECONNRESET\): read ECONNRESET$/);
	assert.doesNotMatch(result.error ?? '', /timed out|inactivity/i);
});

test('requestGitHubJsonTransport: a socket-inactivity timeout is reported with the real elapsed time, not the configured limit', async () => {
	const req = new FakeClientRequest();
	const fakeRequestFn = (() => req) as unknown as typeof http.request;
	const promise = requestGitHubJsonTransport('/agents/tasks', 'token', fakeRequestFn);
	await new Promise((resolve) => setTimeout(resolve, 5));
	req.fireTimeout();
	const result = await promise;
	assert.match(result.error ?? '', /^No response for \d+(\.\d+)?s \(socket inactivity limit 15s\)$/);
});

test('fetchAgentSessionsForRepo: returns empty result when task list is empty', async () => {
	const fetchPage: FetchTaskPageFn = async () => ({ tasks: [] });
	const fetchDetail: FetchTaskDetailFn = async () => ({ sessions: [] });
	const result = await fetchAgentSessionsForRepo('owner', 'repo', 'token', SINCE, fetchPage, fetchDetail);
	assert.equal(result.totalTasks, 0);
	assert.equal(result.totalSessions, 0);
	assert.equal(result.totalCredits, 0);
	assert.equal(result.tasksTotal, 0);
	assert.equal(result.partial, false);
	assert.equal(result.error, undefined);
});

test('fetchAgentSessionsForRepo: counts only cloud-agent sessions', async () => {
	const tasks = [makeTask('t1')];
	const fetchPage: FetchTaskPageFn = async ({ page }) =>
		page === 1 ? { tasks } : { tasks: [] };
	const fetchDetail: FetchTaskDetailFn = async () => ({
		sessions: [
			makeSession('sweagent-capi:claude', 5),  // cloud-agent
			makeSession('', undefined),               // cli-remote (excluded)
			makeSession('gpt-4o', 3),                 // cloud-agent
		],
	});
	const result = await fetchAgentSessionsForRepo('owner', 'repo', 'token', SINCE, fetchPage, fetchDetail);
	assert.equal(result.totalTasks, 1);
	assert.equal(result.totalSessions, 2);   // only cloud-agent sessions
	assert.equal(result.totalCredits, 8);    // 5 + 3
	assert.equal(result.error, undefined);
});

test('fetchAgentSessionsForRepo: task with no cloud-agent sessions does not count toward totalTasks', async () => {
	const tasks = [makeTask('t1')];
	const fetchPage: FetchTaskPageFn = async ({ page }) =>
		page === 1 ? { tasks } : { tasks: [] };
	const fetchDetail: FetchTaskDetailFn = async () => ({
		sessions: [makeSession('', undefined)],  // cli-remote only
	});
	const result = await fetchAgentSessionsForRepo('owner', 'repo', 'token', SINCE, fetchPage, fetchDetail);
	assert.equal(result.totalTasks, 0);
	assert.equal(result.totalSessions, 0);
});

test('fetchAgentSessionsForRepo: converts real-world nano-credit values to whole AI credits (issue #1554)', async () => {
	const tasks = [makeTask('t1')];
	const fetchPage: FetchTaskPageFn = async ({ page }) =>
		page === 1 ? { tasks } : { tasks: [] };
	const fetchDetail: FetchTaskDetailFn = async () => ({
		sessions: [
			// Raw value as observed from the live GitHub agents API (nano-credits).
			{ id: 's1', state: 'completed', model: 'sweagent-capi:gpt-5.4', created_at: new Date().toISOString(), usage: { credits: 43380350000, type: 'ai_credits' } },
		],
	});
	const result = await fetchAgentSessionsForRepo('owner', 'repo', 'token', SINCE, fetchPage, fetchDetail);
	assert.equal(result.totalSessions, 1);
	assert.ok(Math.abs(result.totalCredits - 43.38035) < 1e-9, `expected ~43.38 credits, got ${result.totalCredits}`);
});

test('fetchAgentSessionsForRepo: handles missing usage.credits gracefully', async () => {
	const tasks = [makeTask('t1')];
	const fetchPage: FetchTaskPageFn = async ({ page }) =>
		page === 1 ? { tasks } : { tasks: [] };
	const fetchDetail: FetchTaskDetailFn = async () => ({
		sessions: [makeSession('cloud-model')],  // no usage field
	});
	const result = await fetchAgentSessionsForRepo('owner', 'repo', 'token', SINCE, fetchPage, fetchDetail);
	assert.equal(result.totalTasks, 1);
	assert.equal(result.totalSessions, 1);
	assert.equal(result.totalCredits, 0);
});

test('fetchAgentSessionsForRepo: returns error result when API returns 404', async () => {
	const fetchPage: FetchTaskPageFn = async () => ({ tasks: [], statusCode: 404, error: 'HTTP 404' });
	const fetchDetail: FetchTaskDetailFn = async () => ({ sessions: [] });
	const result = await fetchAgentSessionsForRepo('owner', 'repo', 'token', SINCE, fetchPage, fetchDetail);
	assert.equal(result.totalTasks, 0);
	assert.ok(result.error?.includes('not enabled') || result.error?.includes('not accessible'));
});

test('fetchAgentSessionsForRepo: returns error result when API returns 403', async () => {
	const fetchPage: FetchTaskPageFn = async () => ({ tasks: [], statusCode: 403, error: 'HTTP 403' });
	const fetchDetail: FetchTaskDetailFn = async () => ({ sessions: [] });
	const result = await fetchAgentSessionsForRepo('owner', 'repo', 'token', SINCE, fetchPage, fetchDetail);
	assert.equal(result.totalTasks, 0);
	assert.ok(result.error?.includes('Access denied') || result.error?.includes('token'));
});

test('fetchAgentSessionsForRepo: deduplicates tasks that appear in both active and archived lists', async () => {
	const task = makeTask('shared-id');
	let activePageCalled = false;
	const fetchPage: FetchTaskPageFn = async ({ page, archived }) => {
		if (!archived && page === 1) { activePageCalled = true; return { tasks: [task] }; }
		if (archived && page === 1) { return { tasks: [task] }; } // same task in archived
		return { tasks: [] };
	};
	let detailCallCount = 0;
	const fetchDetail: FetchTaskDetailFn = async () => {
		detailCallCount++;
		return { sessions: [makeSession('cloud-model', 2)] };
	};
	const result = await fetchAgentSessionsForRepo('owner', 'repo', 'token', SINCE, fetchPage, fetchDetail);
	assert.ok(activePageCalled);
	assert.equal(detailCallCount, 1, 'duplicate task id should be fetched only once');
	assert.equal(result.totalTasks, 1);
	assert.equal(result.totalSessions, 1);
	assert.equal(result.totalCredits, 2);
});

test('fetchAgentSessionsForRepo: marks partial=true when tasksTotal > cap', async () => {
	// Create 51 tasks (one over the MAX_TASKS_DETAIL_PER_REPO cap of 50)
	const tasks = Array.from({ length: 51 }, (_, i) => makeTask(`t${i}`));
	const fetchPage: FetchTaskPageFn = async ({ page }) =>
		page === 1 ? { tasks } : { tasks: [] };
	const fetchDetail: FetchTaskDetailFn = async () => ({
		sessions: [makeSession('cloud-model', 1)],
	});
	const result = await fetchAgentSessionsForRepo('owner', 'repo', 'token', SINCE, fetchPage, fetchDetail);
	assert.equal(result.partial, true);
	assert.equal(result.tasksTotal, 51);
	assert.equal(result.tasksScanned, 50);
	assert.equal(result.totalSessions, 50); // only 50 task details fetched
});

test('fetchAgentSessionsForRepo: partial=false when tasksTotal <= cap', async () => {
	const tasks = [makeTask('t1'), makeTask('t2')];
	const fetchPage: FetchTaskPageFn = async ({ page }) =>
		page === 1 ? { tasks } : { tasks: [] };
	const fetchDetail: FetchTaskDetailFn = async () => ({
		sessions: [makeSession('cloud-model', 1)],
	});
	const result = await fetchAgentSessionsForRepo('owner', 'repo', 'token', SINCE, fetchPage, fetchDetail);
	assert.equal(result.partial, false);
	assert.equal(result.tasksScanned, 2);
});

test('fetchAgentSessionsForRepo: handles detail fetch failure gracefully (skips task)', async () => {
	const tasks = [makeTask('t1'), makeTask('t2')];
	const fetchPage: FetchTaskPageFn = async ({ page }) =>
		page === 1 ? { tasks } : { tasks: [] };
	let callNum = 0;
	const fetchDetail: FetchTaskDetailFn = async () => {
		callNum++;
		if (callNum === 1) { return { error: 'network error' }; }
		return { sessions: [makeSession('cloud-model', 3)] };
	};
	const result = await fetchAgentSessionsForRepo('owner', 'repo', 'token', SINCE, fetchPage, fetchDetail);
	assert.equal(result.totalTasks, 1);   // only t2 succeeded
	assert.equal(result.totalSessions, 1);
	assert.equal(result.totalCredits, 3);
	assert.equal(result.error, undefined);
});

// ---------------------------------------------------------------------------
// readSessionUsage — both API spellings of the billing units
// ---------------------------------------------------------------------------

test('readSessionUsage: reads the documented usage.amount in nano-credits', () => {
	assert.deepEqual(
		readSessionUsage({ usage: { type: 'ai_credits', amount: 43380350000 } }),
		{ credits: 43.38035, premiumRequests: 0 },
	);
});

test('readSessionUsage: reads the usage.credits spelling the live API has returned', () => {
	assert.deepEqual(
		readSessionUsage({ usage: { type: 'ai_credits', credits: 2_000_000_000 } }),
		{ credits: 2, premiumRequests: 0 },
	);
});

test('readSessionUsage: premium requests are counted as-is, never scaled like nano-credits', () => {
	assert.deepEqual(
		readSessionUsage({ usage: { type: 'premium_requests', amount: 1.5 } }),
		{ credits: 0, premiumRequests: 1.5 },
	);
});

test('readSessionUsage: missing, empty or non-numeric usage yields zero', () => {
	assert.deepEqual(readSessionUsage({}), { credits: 0, premiumRequests: 0 });
	assert.deepEqual(readSessionUsage({ usage: null }), { credits: 0, premiumRequests: 0 });
	assert.deepEqual(readSessionUsage({ usage: { type: 'ai_credits' } }), { credits: 0, premiumRequests: 0 });
	assert.deepEqual(readSessionUsage({ usage: { amount: 'lots' } }), { credits: 0, premiumRequests: 0 });
});

test('fetchAgentSessionsForRepo: keeps premium-request sessions out of the credit total', async () => {
	const fetchPage: FetchTaskPageFn = async ({ page }) => (page === 1 ? { tasks: [makeTask('t1')] } : { tasks: [] });
	const fetchDetail: FetchTaskDetailFn = async () => ({
		sessions: [{ id: 's1', model: 'sweagent-capi:gpt-5.4', usage: { type: 'premium_requests', amount: 1.5 } }],
	});
	const result = await fetchAgentSessionsForRepo('owner', 'repo', 'token', SINCE, fetchPage, fetchDetail);
	assert.equal(result.totalCredits, 0);
	assert.equal(result.totalPremiumRequests, 1.5);
});

// ---------------------------------------------------------------------------
// resolveTaskRepo — the repository a task is attributed to
// ---------------------------------------------------------------------------

test('resolveTaskRepo: reads full_name, nwo, owner+name, and repository html_url', () => {
	assert.deepEqual(resolveTaskRepo({ repository: { full_name: 'octo/demo' } }), { owner: 'octo', repo: 'demo' });
	assert.deepEqual(resolveTaskRepo({ repository: { nwo: 'octo/demo' } }), { owner: 'octo', repo: 'demo' });
	assert.deepEqual(
		resolveTaskRepo({ repository: { name: 'demo', owner: { login: 'octo' } } }),
		{ owner: 'octo', repo: 'demo' },
	);
	assert.deepEqual(
		resolveTaskRepo({ repository: { id: 1, html_url: 'https://github.com/octo/demo' } }),
		{ owner: 'octo', repo: 'demo' },
	);
});

test('resolveTaskRepo: falls back to the task html_url, and ignores agents-page URLs', () => {
	assert.deepEqual(
		resolveTaskRepo({ html_url: 'https://github.com/octo/demo/pull/7' }),
		{ owner: 'octo', repo: 'demo' },
	);
	assert.equal(resolveTaskRepo({ html_url: 'https://github.com/copilot/agents/abc123' }), undefined);
});

test('resolveTaskRepo: returns undefined for a task with no resolvable repository', () => {
	assert.equal(resolveTaskRepo({ id: 't1' }), undefined);
	assert.equal(resolveTaskRepo({ repository: { id: 42 } }), undefined);
	assert.equal(resolveTaskRepo(undefined), undefined);
});

// ---------------------------------------------------------------------------
// collectAgentSessions — workspace repos merged with the account-wide task list
// ---------------------------------------------------------------------------

/** Task as returned by the account-wide listing, carrying its repository. */
function makeAccountTask(id: string, fullName?: string, updatedAt = '2026-08-01T00:00:00Z'): any {
	return {
		id,
		name: `Task ${id}`,
		state: 'completed',
		updated_at: updatedAt,
		created_at: updatedAt,
		...(fullName ? { repository: { full_name: fullName } } : {}),
	};
}

const NO_TASKS: FetchTaskPageFn = async () => ({ tasks: [] });
const NO_ACCOUNT_TASKS: FetchAccountTaskPageFn = async () => ({ tasks: [] });

function firstPageOnly(tasks: any[]): (page: number) => { tasks: any[] } {
	return (page: number) => (page === 1 ? { tasks } : { tasks: [] });
}

test('collectAgentSessions: finds account tasks in repos that are not open in the workspace', async () => {
	const accountPage = firstPageOnly([makeAccountTask('a1', 'octo/remote-repo')]);
	const result = await collectAgentSessions({
		token: 'token',
		since: SINCE,
		workspaceRepos: [],
		fetchTaskPage: NO_TASKS,
		fetchAccountTaskPage: async ({ page, archived }) => (archived ? { tasks: [] } : accountPage(page)),
		fetchTaskDetail: async () => ({ sessions: [makeSession('cloud-model', 4)] }),
		fetchAccountTaskDetail: async () => ({ sessions: [] }),
	});

	assert.equal(result.accountTasksAvailable, true);
	assert.equal(result.repos.length, 1);
	assert.equal(result.repos[0].owner, 'octo');
	assert.equal(result.repos[0].repo, 'remote-repo');
	assert.equal(result.repos[0].discovery, 'account');
	assert.equal(result.totalCredits, 4);
});

test('collectAgentSessions: a task in both listings is detailed once and marked as seen from both', async () => {
	const shared = makeAccountTask('shared', 'octo/demo');
	let detailCalls = 0;
	const result = await collectAgentSessions({
		token: 'token',
		since: SINCE,
		workspaceRepos: [{ owner: 'octo', repo: 'demo' }],
		fetchTaskPage: async ({ page, archived }) => (!archived && page === 1 ? { tasks: [shared] } : { tasks: [] }),
		fetchAccountTaskPage: async ({ page, archived }) => (!archived && page === 1 ? { tasks: [shared] } : { tasks: [] }),
		fetchTaskDetail: async () => { detailCalls++; return { sessions: [makeSession('cloud-model', 7)] }; },
		fetchAccountTaskDetail: async () => { detailCalls++; return { sessions: [] }; },
	});

	assert.equal(detailCalls, 1, 'the same task must not be detailed twice');
	assert.equal(result.repos.length, 1);
	assert.equal(result.repos[0].discovery, 'both');
	assert.equal(result.repos[0].tasksTotal, 1);
	assert.equal(result.totalCredits, 7);
	assert.equal(result.totalTasks, 1);
});

test('collectAgentSessions: tasks with no repository land in their own bucket, detailed by ID', async () => {
	let byIdCalls = 0;
	const result = await collectAgentSessions({
		token: 'token',
		since: SINCE,
		workspaceRepos: [],
		fetchTaskPage: NO_TASKS,
		fetchAccountTaskPage: async ({ page, archived }) =>
			(!archived && page === 1 ? { tasks: [makeAccountTask('chat-1')] } : { tasks: [] }),
		fetchTaskDetail: async () => ({ sessions: [] }),
		fetchAccountTaskDetail: async () => { byIdCalls++; return { sessions: [makeSession('cloud-model', 1.5)] }; },
	});

	assert.equal(byIdCalls, 1, 'a task with no repo must be fetched through the account-wide detail endpoint');
	assert.equal(result.repos.length, 1);
	assert.equal(result.repos[0].unassigned, true);
	assert.equal(result.repos[0].owner, '');
	assert.equal(result.totalCredits, 1.5);
});

test('collectAgentSessions: workspace repos are listed even when they have no tasks', async () => {
	const result = await collectAgentSessions({
		token: 'token',
		since: SINCE,
		workspaceRepos: [{ owner: 'octo', repo: 'quiet' }],
		fetchTaskPage: NO_TASKS,
		fetchAccountTaskPage: NO_ACCOUNT_TASKS,
		fetchTaskDetail: async () => ({ sessions: [] }),
		fetchAccountTaskDetail: async () => ({ sessions: [] }),
	});

	assert.equal(result.repos.length, 1);
	assert.equal(result.repos[0].discovery, 'workspace');
	assert.equal(result.repos[0].tasksTotal, 0);
	assert.equal(result.repos[0].partial, false);
	assert.equal(result.partial, false);
});

test('collectAgentSessions: a failing account listing degrades to the workspace repos', async () => {
	const result = await collectAgentSessions({
		token: 'token',
		since: SINCE,
		workspaceRepos: [{ owner: 'octo', repo: 'demo' }],
		fetchTaskPage: async ({ page, archived }) =>
			(!archived && page === 1 ? { tasks: [makeTask('t1')] } : { tasks: [] }),
		fetchAccountTaskPage: async () => ({ tasks: [], statusCode: 403, error: 'HTTP 403' }),
		fetchTaskDetail: async () => ({ sessions: [makeSession('cloud-model', 2)] }),
		fetchAccountTaskDetail: async () => ({ sessions: [] }),
	});

	assert.equal(result.accountTasksAvailable, false);
	assert.ok(result.accountTasksError?.includes('Access denied'));
	assert.equal(result.repos.length, 1);
	assert.equal(result.totalCredits, 2);
});

test('collectAgentSessions: a failing repo listing shows an error row without failing the pass', async () => {
	const result = await collectAgentSessions({
		token: 'token',
		since: SINCE,
		workspaceRepos: [{ owner: 'octo', repo: 'denied' }],
		fetchTaskPage: async () => ({ tasks: [], statusCode: 404, error: 'HTTP 404' }),
		fetchAccountTaskPage: async ({ page, archived }) =>
			(!archived && page === 1 ? { tasks: [makeAccountTask('a1', 'octo/other')] } : { tasks: [] }),
		fetchTaskDetail: async () => ({ sessions: [makeSession('cloud-model', 1)] }),
		fetchAccountTaskDetail: async () => ({ sessions: [] }),
	});

	const denied = result.repos.find(r => r.repo === 'denied');
	assert.ok(denied?.error?.includes('not enabled') || denied?.error?.includes('not accessible'));
	assert.ok(result.repos.some(r => r.repo === 'other'));
});

test('collectAgentSessions: the detail budget covers the newest tasks and flags the rest as partial', async () => {
	const tasks = [
		makeAccountTask('old', 'octo/demo', '2026-08-01T00:00:00Z'),
		makeAccountTask('new', 'octo/demo', '2026-08-20T00:00:00Z'),
	];
	const detailed: string[] = [];
	const result = await collectAgentSessions({
		token: 'token',
		since: SINCE,
		workspaceRepos: [],
		maxTaskDetails: 1,
		fetchTaskPage: NO_TASKS,
		fetchAccountTaskPage: async ({ page, archived }) => (!archived && page === 1 ? { tasks } : { tasks: [] }),
		fetchTaskDetail: async (_owner, _repo, taskId) => {
			detailed.push(taskId);
			return { sessions: [makeSession('cloud-model', 1)] };
		},
		fetchAccountTaskDetail: async () => ({ sessions: [] }),
	});

	assert.deepEqual(detailed, ['new'], 'the most recently updated task is detailed first');
	assert.equal(result.partial, true);
	assert.equal(result.repos[0].partial, true);
	assert.equal(result.repos[0].tasksTotal, 2);
	assert.equal(result.repos[0].tasksScanned, 1);
});

test('collectAgentSessions: reports progress that never exceeds its own total', async () => {
	const progress: { done: number; total: number }[] = [];
	await collectAgentSessions({
		token: 'token',
		since: SINCE,
		workspaceRepos: [{ owner: 'octo', repo: 'demo' }],
		fetchTaskPage: async ({ page, archived }) =>
			(!archived && page === 1 ? { tasks: [makeTask('t1')] } : { tasks: [] }),
		fetchAccountTaskPage: NO_ACCOUNT_TASKS,
		fetchTaskDetail: async () => ({ sessions: [makeSession('cloud-model', 1)] }),
		fetchAccountTaskDetail: async () => ({ sessions: [] }),
		onProgress: (done, total) => progress.push({ done, total }),
	});

	assert.ok(progress.length >= 3, 'one unit per repo listing, the account listing, and each detail call');
	assert.ok(progress.every(p => p.done <= p.total), 'progress must never report more done than total');
	const last = progress[progress.length - 1];
	assert.equal(last.done, last.total);
});
