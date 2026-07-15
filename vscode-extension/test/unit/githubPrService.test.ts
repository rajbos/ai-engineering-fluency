import test from 'node:test';
import * as assert from 'node:assert/strict';
import { detectAiType, fetchRepoPrs, fetchCopilotPlanInfo, fetchCopilotTokenEndpointInfo, fetchUserEnterprises, fetchEnterprisePremiumBudgets, type CopilotPlanInfo, type CopilotTokenEndpointInfo, type EnterpriseInfo, type EnterpriseBudgetEntry } from '../../src/githubPrService';

// ---------------------------------------------------------------------------
// detectAiType — pure function, no I/O
// ---------------------------------------------------------------------------

test('detectAiType: returns copilot for login containing "copilot"', () => {
	assert.equal(detectAiType('copilot-swe-agent'), 'copilot');
	assert.equal(detectAiType('github-copilot-bot'), 'copilot');
	assert.equal(detectAiType('COPILOT-agent'), 'copilot');
});

test('detectAiType: returns claude for login containing "claude" or "anthropic"', () => {
	assert.equal(detectAiType('claude-code-action'), 'claude');
	assert.equal(detectAiType('anthropic-bot'), 'claude');
	assert.equal(detectAiType('Claude-Agent'), 'claude');
});

test('detectAiType: returns openai for login containing "openai" or "codex"', () => {
	assert.equal(detectAiType('openai-code-agent'), 'openai');
	assert.equal(detectAiType('codex-bot'), 'openai');
	assert.equal(detectAiType('OPENAI-agent'), 'openai');
});

test('detectAiType: returns null for a regular human login', () => {
	assert.equal(detectAiType('octocat'), null);
	assert.equal(detectAiType('jane-doe'), null);
	assert.equal(detectAiType(''), null);
});

test('detectAiType: copilot match takes priority over other patterns', () => {
	// A login that technically contains both; copilot check comes first
	assert.equal(detectAiType('copilot-openai-test'), 'copilot');
});

// ---------------------------------------------------------------------------
// fetchRepoPrs — pagination logic with mock fetchPage
// ---------------------------------------------------------------------------

function makePr(createdAt: string, number = 1) {
	return {
		number,
		title: 'test PR',
		html_url: `https://github.com/owner/repo/pull/${number}`,
		user: { login: 'octocat' },
		requested_reviewers: [],
		created_at: createdAt,
	};
}

test('fetchRepoPrs: returns empty array when first page is empty', async () => {
	const mockFetchPage = async () => ({ prs: [] });
	const since = new Date('2024-01-01T00:00:00Z');
	const { prs, error } = await fetchRepoPrs('owner', 'repo', 'token', since, mockFetchPage);
	assert.equal(prs.length, 0);
	assert.equal(error, undefined);
});

test('fetchRepoPrs: returns prs created after since date', async () => {
	const since = new Date('2024-01-15T00:00:00Z');
	const recentPr = makePr('2024-01-20T00:00:00Z');
	const oldPr = makePr('2024-01-10T00:00:00Z');

	const mockFetchPage = async () => ({ prs: [recentPr, oldPr] });
	const { prs, error } = await fetchRepoPrs('owner', 'repo', 'token', since, mockFetchPage);
	assert.equal(prs.length, 1);
	assert.equal(prs[0].created_at, '2024-01-20T00:00:00Z');
	assert.equal(error, undefined);
});

test('fetchRepoPrs: stops paginating when oldest PR on page is before since', async () => {
	const since = new Date('2024-01-15T00:00:00Z');
	let callCount = 0;

	// Page 1: 100 PRs, but the oldest is before since
	const page1 = Array.from({ length: 100 }, (_, i) =>
		makePr(i < 50 ? '2024-01-20T00:00:00Z' : '2024-01-10T00:00:00Z', i + 1)
	);

	const mockFetchPage = async (_owner: string, _repo: string, _token: string, _page: number) => {
		callCount++;
		return { prs: page1 };
	};

	const { prs } = await fetchRepoPrs('owner', 'repo', 'token', since, mockFetchPage);
	assert.equal(callCount, 1); // Should not request page 2
	assert.equal(prs.length, 50); // Only the 50 PRs after since
});

test('fetchRepoPrs: paginates when page is full and oldest is after since', async () => {
	const since = new Date('2024-01-01T00:00:00Z');
	let callCount = 0;

	const mockFetchPage = async (_owner: string, _repo: string, _token: string, page: number) => {
		callCount++;
		if (page === 1) {
			// Full page, all PRs after since
			return { prs: Array.from({ length: 100 }, (_, i) => makePr('2024-01-20T00:00:00Z', i + 1)) };
		}
		// Second page is empty — stop
		return { prs: [] };
	};

	const { prs } = await fetchRepoPrs('owner', 'repo', 'token', since, mockFetchPage);
	assert.equal(callCount, 2);
	assert.equal(prs.length, 100);
});

test('fetchRepoPrs: caps at 5 pages maximum', async () => {
	const since = new Date('2024-01-01T00:00:00Z');
	let callCount = 0;

	// Every page returns 100 PRs all after since — would be infinite without the cap
	const mockFetchPage = async (_owner: string, _repo: string, _token: string, page: number) => {
		callCount++;
		return { prs: Array.from({ length: 100 }, (_, i) => makePr('2024-01-20T00:00:00Z', (page - 1) * 100 + i + 1)) };
	};

	await fetchRepoPrs('owner', 'repo', 'token', since, mockFetchPage);
	assert.equal(callCount, 5);
});

test('fetchRepoPrs: propagates error from fetchPage with 404 status', async () => {
	const mockFetchPage = async () => ({ prs: [], statusCode: 404, error: 'Not Found' });
	const since = new Date('2024-01-01T00:00:00Z');
	const { prs, error } = await fetchRepoPrs('owner', 'repo', 'token', since, mockFetchPage);
	assert.equal(prs.length, 0);
	assert.equal(error, 'Repo not found or not accessible with current token');
});

test('fetchRepoPrs: propagates error from fetchPage with 403 status', async () => {
	const mockFetchPage = async () => ({ prs: [], statusCode: 403, error: 'Forbidden' });
	const since = new Date('2024-01-01T00:00:00Z');
	const { prs, error } = await fetchRepoPrs('owner', 'repo', 'token', since, mockFetchPage);
	assert.equal(prs.length, 0);
	assert.equal(error, 'Forbidden');
});

test('fetchRepoPrs: propagates generic error from fetchPage', async () => {
	const mockFetchPage = async () => ({ prs: [], error: 'Network error' });
	const since = new Date('2024-01-01T00:00:00Z');
	const { prs, error } = await fetchRepoPrs('owner', 'repo', 'token', since, mockFetchPage);
	assert.equal(prs.length, 0);
	assert.equal(error, 'Network error');
});

// ---------------------------------------------------------------------------
// fetchCopilotPlanInfo — uses injectable fetcher
// ---------------------------------------------------------------------------

test('fetchCopilotPlanInfo: returns plan info on success', async () => {
	const planData: CopilotPlanInfo = {
		copilot_plan: 'copilot_individual',
		ide_chat: 'enabled',
		copilot_ide_agent: 'enabled',
		public_code_suggestions: 'block',
		unlimited_pr_summaries: true,
	};
	const mockFetcher = async () => ({ planInfo: planData, statusCode: 200 });
	const { planInfo, statusCode, error } = await fetchCopilotPlanInfo('token', mockFetcher);
	assert.equal(error, undefined);
	assert.equal(statusCode, 200);
	assert.deepEqual(planInfo, planData);
});

test('fetchCopilotPlanInfo: returns error on non-2xx response', async () => {
	const mockFetcher = async () => ({ statusCode: 401, error: 'HTTP 401' });
	const { planInfo, statusCode, error } = await fetchCopilotPlanInfo('token', mockFetcher);
	assert.equal(planInfo, undefined);
	assert.equal(statusCode, 401);
	assert.equal(error, 'HTTP 401');
});

test('fetchCopilotPlanInfo: returns error on 403 response', async () => {
	const mockFetcher = async () => ({ statusCode: 403, error: 'HTTP 403' });
	const { planInfo, statusCode, error } = await fetchCopilotPlanInfo('token', mockFetcher);
	assert.equal(planInfo, undefined);
	assert.equal(statusCode, 403);
});

test('fetchCopilotPlanInfo: returns error on network failure', async () => {
	const mockFetcher = async () => ({ error: 'socket hang up' });
	const { planInfo, error } = await fetchCopilotPlanInfo('token', mockFetcher);
	assert.equal(planInfo, undefined);
	assert.equal(error, 'socket hang up');
});

test('fetchCopilotPlanInfo: returns error on unexpected response format', async () => {
	const mockFetcher = async () => ({ statusCode: 200, error: 'Unexpected response format' });
	const { planInfo, error } = await fetchCopilotPlanInfo('token', mockFetcher);
	assert.equal(planInfo, undefined);
	assert.ok(error?.includes('Unexpected response format'));
});

test('fetchCopilotPlanInfo: handles partial plan data gracefully', async () => {
	// Not all fields may be present — only copilot_plan returned
	const mockFetcher = async () => ({ planInfo: { copilot_plan: 'copilot_free' } as CopilotPlanInfo, statusCode: 200 });
	const { planInfo, error } = await fetchCopilotPlanInfo('token', mockFetcher);
	assert.equal(error, undefined);
	assert.equal(planInfo?.copilot_plan, 'copilot_free');
	assert.equal(planInfo?.ide_chat, undefined);
});

// ---------------------------------------------------------------------------
// fetchCopilotTokenEndpointInfo — uses injectable fetcher
// ---------------------------------------------------------------------------

test('fetchCopilotTokenEndpointInfo: returns endpoint info on success', async () => {
	const endpointData: CopilotTokenEndpointInfo = {
		endpoints: { api: 'https://api.individual.githubcopilot.com' },
		expires_at: 1730000000,
		refresh_in: 1500,
		sku: 'copilot_individual',
	};
	const mockFetcher = async () => ({ info: endpointData, statusCode: 200 });
	const { info, statusCode, error } = await fetchCopilotTokenEndpointInfo('token', mockFetcher);
	assert.equal(error, undefined);
	assert.equal(statusCode, 200);
	assert.deepEqual(info, endpointData);
});

test('fetchCopilotTokenEndpointInfo: returns error on non-2xx response', async () => {
	const mockFetcher = async () => ({ statusCode: 401, error: 'HTTP 401' });
	const { info, statusCode, error } = await fetchCopilotTokenEndpointInfo('token', mockFetcher);
	assert.equal(info, undefined);
	assert.equal(statusCode, 401);
	assert.equal(error, 'HTTP 401');
});

test('fetchCopilotTokenEndpointInfo: returns error on network failure', async () => {
	const mockFetcher = async () => ({ error: 'socket hang up' });
	const { info, error } = await fetchCopilotTokenEndpointInfo('token', mockFetcher);
	assert.equal(info, undefined);
	assert.equal(error, 'socket hang up');
});

test('fetchCopilotTokenEndpointInfo: handles partial response gracefully', async () => {
	// Only endpoints returned, no expiry info
	const mockFetcher = async () => ({ info: { endpoints: { api: 'https://api.business.githubcopilot.com' } } as CopilotTokenEndpointInfo, statusCode: 200 });
	const { info, error } = await fetchCopilotTokenEndpointInfo('token', mockFetcher);
	assert.equal(error, undefined);
	assert.equal(info?.endpoints?.api, 'https://api.business.githubcopilot.com');
	assert.equal(info?.expires_at, undefined);
});

test('fetchCopilotTokenEndpointInfo: handles empty info object gracefully', async () => {
	const mockFetcher = async () => ({ info: {} as CopilotTokenEndpointInfo, statusCode: 200 });
	const { info, error } = await fetchCopilotTokenEndpointInfo('token', mockFetcher);
	assert.equal(error, undefined);
	assert.deepEqual(info, {});
});

// ---------------------------------------------------------------------------
// fetchUserEnterprises — uses injectable fetcher
// ---------------------------------------------------------------------------

test('fetchUserEnterprises: returns enterprises on success', async () => {
	const enterprises: EnterpriseInfo[] = [
		{ slug: 'acme-corp', name: 'Acme Corporation' },
		{ slug: 'widgets-inc', name: 'Widgets Inc' },
	];
	const mockFetcher = async () => ({ enterprises });
	const { enterprises: result, error } = await fetchUserEnterprises('token', mockFetcher);
	assert.equal(error, undefined);
	assert.deepEqual(result, enterprises);
});

test('fetchUserEnterprises: returns empty array when user has no enterprises', async () => {
	const mockFetcher = async () => ({ enterprises: [] });
	const { enterprises, error } = await fetchUserEnterprises('token', mockFetcher);
	assert.equal(error, undefined);
	assert.deepEqual(enterprises, []);
});

test('fetchUserEnterprises: returns error on network failure', async () => {
	const mockFetcher = async () => ({ error: 'socket hang up' });
	const { enterprises, error } = await fetchUserEnterprises('token', mockFetcher);
	assert.equal(enterprises, undefined);
	assert.equal(error, 'socket hang up');
});

test('fetchUserEnterprises: returns error on GraphQL error', async () => {
	const mockFetcher = async () => ({ error: 'Must be logged in.' });
	const { enterprises, error } = await fetchUserEnterprises('token', mockFetcher);
	assert.equal(enterprises, undefined);
	assert.ok(error?.includes('Must be logged in'));
});

// ---------------------------------------------------------------------------
// fetchEnterprisePremiumBudgets — uses injectable fetcher
// ---------------------------------------------------------------------------

test('fetchEnterprisePremiumBudgets: returns budgets on success', async () => {
	const budgets: EnterpriseBudgetEntry[] = [
		{ id: 'budget-1', budget_amount: 500, prevent_further_usage: true, budget_scope: 'enterprise', budget_product_skus: ['copilot_premium_requests'] },
	];
	const mockFetcher = async () => ({ budgets, statusCode: 200 });
	const { budgets: result, error } = await fetchEnterprisePremiumBudgets('acme-corp', 'rajbos', 'token', mockFetcher);
	assert.equal(error, undefined);
	assert.deepEqual(result, budgets);
});

test('fetchEnterprisePremiumBudgets: returns error on 403 (not an admin)', async () => {
	const mockFetcher = async () => ({ statusCode: 403, error: 'HTTP 403' });
	const { budgets, statusCode, error } = await fetchEnterprisePremiumBudgets('acme-corp', 'rajbos', 'token', mockFetcher);
	assert.equal(budgets, undefined);
	assert.equal(statusCode, 403);
	assert.equal(error, 'HTTP 403');
});

test('fetchEnterprisePremiumBudgets: returns error on network failure', async () => {
	const mockFetcher = async () => ({ error: 'ECONNREFUSED' });
	const { budgets, error } = await fetchEnterprisePremiumBudgets('acme-corp', 'rajbos', 'token', mockFetcher);
	assert.equal(budgets, undefined);
	assert.equal(error, 'ECONNREFUSED');
});

test('fetchEnterprisePremiumBudgets: returns empty array when no budgets configured', async () => {
	const mockFetcher = async () => ({ budgets: [], statusCode: 200 });
	const { budgets, error } = await fetchEnterprisePremiumBudgets('acme-corp', 'rajbos', 'token', mockFetcher);
	assert.equal(error, undefined);
	assert.deepEqual(budgets, []);
});
