import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as vscode from 'vscode';
import { deriveGitHubApiEndpoints, getGitHubAuthProviderId } from '../../src/githubApiConfig';

/** Temporarily stub `github-enterprise.uri` for the duration of the callback. */
function withEnterpriseUri<T>(uri: string | undefined, fn: () => T): T {
	const original = vscode.workspace.getConfiguration;
	(vscode.workspace as any).getConfiguration = () => ({
		get: (key: string) => (key === 'github-enterprise.uri' ? uri : undefined),
	});
	try {
		return fn();
	} finally {
		vscode.workspace.getConfiguration = original;
	}
}

// ---------------------------------------------------------------------------
// deriveGitHubApiEndpoints — pure function, no I/O or VS Code dependency
// ---------------------------------------------------------------------------

test('deriveGitHubApiEndpoints: returns github.com defaults when no enterprise URI is configured', () => {
	const endpoints = deriveGitHubApiEndpoints(undefined);
	assert.deepEqual(endpoints, { hostname: 'api.github.com', restPathPrefix: '', graphQlPath: '/graphql' });
});

test('deriveGitHubApiEndpoints: returns github.com defaults for an empty string', () => {
	const endpoints = deriveGitHubApiEndpoints('');
	assert.deepEqual(endpoints, { hostname: 'api.github.com', restPathPrefix: '', graphQlPath: '/graphql' });
});

test('deriveGitHubApiEndpoints: returns github.com defaults for an unparseable URI', () => {
	const endpoints = deriveGitHubApiEndpoints('not a url');
	assert.deepEqual(endpoints, { hostname: 'api.github.com', restPathPrefix: '', graphQlPath: '/graphql' });
});

test('deriveGitHubApiEndpoints: returns github.com defaults for a github.com URI', () => {
	assert.deepEqual(deriveGitHubApiEndpoints('https://github.com'), { hostname: 'api.github.com', restPathPrefix: '', graphQlPath: '/graphql' });
	assert.deepEqual(deriveGitHubApiEndpoints('https://www.github.com'), { hostname: 'api.github.com', restPathPrefix: '', graphQlPath: '/graphql' });
	assert.deepEqual(deriveGitHubApiEndpoints('https://api.github.com'), { hostname: 'api.github.com', restPathPrefix: '', graphQlPath: '/graphql' });
});

test('deriveGitHubApiEndpoints: derives api.<tenant> subdomain for GHE.com (data residency)', () => {
	const endpoints = deriveGitHubApiEndpoints('https://customer.ghe.com');
	assert.deepEqual(endpoints, { hostname: 'api.customer.ghe.com', restPathPrefix: '', graphQlPath: '/graphql' });
});

test('deriveGitHubApiEndpoints: derives /api/v3 and /api/graphql for on-prem GitHub Enterprise Server', () => {
	const endpoints = deriveGitHubApiEndpoints('https://github.acme-corp.com');
	assert.deepEqual(endpoints, { hostname: 'github.acme-corp.com', restPathPrefix: '/api/v3', graphQlPath: '/api/graphql' });
});

// ---------------------------------------------------------------------------
// getGitHubAuthProviderId — decides which vscode.authentication provider to use
// ---------------------------------------------------------------------------

test('getGitHubAuthProviderId: returns "github" when no enterprise URI is configured', () => {
	withEnterpriseUri(undefined, () => {
		assert.equal(getGitHubAuthProviderId(), 'github');
	});
});

test('getGitHubAuthProviderId: returns "github" for a github.com URI', () => {
	withEnterpriseUri('https://github.com', () => {
		assert.equal(getGitHubAuthProviderId(), 'github');
	});
});

test('getGitHubAuthProviderId: returns "github-enterprise" for a GHE.com tenant URI', () => {
	withEnterpriseUri('https://customer.ghe.com', () => {
		assert.equal(getGitHubAuthProviderId(), 'github-enterprise');
	});
});

test('getGitHubAuthProviderId: returns "github-enterprise" for an on-prem GitHub Enterprise Server URI', () => {
	withEnterpriseUri('https://github.acme-corp.com', () => {
		assert.equal(getGitHubAuthProviderId(), 'github-enterprise');
	});
});
