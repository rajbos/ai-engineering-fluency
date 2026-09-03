import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as vscode from 'vscode';
import { EventEmitter } from 'node:events';
import type * as http from 'node:http';
import { deriveGitHubApiEndpoints, getGitHubAuthProviderId, attachRequestFailureHandling } from '../../src/githubApiConfig';

/**
 * Minimal stand-in for `http.ClientRequest`, exercising exactly the surface
 * `attachRequestFailureHandling` touches: `.on('error', ...)`, `.setTimeout(ms, cb)`, and
 * `.destroy(err)`. Mirrors real Node behavior where `req.destroy(err)` re-emits `err` on the
 * request's own `'error'` event — that's how the timeout path and the transport-error path both
 * end up in the same listener.
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
	/** Simulates Node firing the socket's idle-timeout callback. */
	fireTimeout(): void {
		this.timeoutCallback?.();
	}
}

function asClientRequest(req: FakeClientRequest): http.ClientRequest {
	return req as unknown as http.ClientRequest;
}

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

// ---------------------------------------------------------------------------
// attachRequestFailureHandling — distinguishes socket-inactivity timeouts from
// genuine transport failures, and reports real elapsed time rather than the
// configured limit (PR #1919 follow-up item 1 — the mislabelled GitHub
// request timeout).
// ---------------------------------------------------------------------------

test('attachRequestFailureHandling: reports a genuine connection error with its real code and message, not as a timeout', () => {
	const req = new FakeClientRequest();
	const failures: string[] = [];
	attachRequestFailureHandling(asClientRequest(req), 15000, (message) => failures.push(message));

	const connErr = Object.assign(new Error('read ECONNRESET'), { code: 'ECONNRESET' });
	req.emit('error', connErr);

	assert.equal(failures.length, 1);
	assert.match(failures[0], /^Connection failed after \d+(\.\d+)?s \(ECONNRESET\): read ECONNRESET$/);
	assert.doesNotMatch(failures[0], /timed out|inactivity/i);
});

test('attachRequestFailureHandling: reports a DNS failure with its code, distinct from a timeout', () => {
	const req = new FakeClientRequest();
	const failures: string[] = [];
	attachRequestFailureHandling(asClientRequest(req), 15000, (message) => failures.push(message));

	const dnsErr = Object.assign(new Error('getaddrinfo ENOTFOUND api.github.com'), { code: 'ENOTFOUND' });
	req.emit('error', dnsErr);

	assert.equal(failures.length, 1);
	assert.match(failures[0], /^Connection failed after \d+(\.\d+)?s \(ENOTFOUND\): getaddrinfo ENOTFOUND api\.github\.com$/);
});

test('attachRequestFailureHandling: reports socket inactivity with the real elapsed time, not the configured limit', async () => {
	const req = new FakeClientRequest();
	const failures: string[] = [];
	attachRequestFailureHandling(asClientRequest(req), 15000, (message) => failures.push(message));

	// Real elapsed time since attach is a few ms here — far below the configured 15s limit. A
	// message that hardcodes "15 s" regardless of how little time actually passed is exactly the
	// bug this guards against: it sends whoever reads it chasing a slow network that isn't there.
	await new Promise((resolve) => setTimeout(resolve, 10));
	req.fireTimeout();

	assert.equal(failures.length, 1);
	assert.match(failures[0], /^No response for \d+(\.\d+)?s \(socket inactivity limit 15s\)$/);
	const [, elapsedStr] = /^No response for (\d+(?:\.\d+)?)s/.exec(failures[0]) ?? [];
	assert.ok(elapsedStr !== undefined && Number(elapsedStr) < 15, `expected reported elapsed time to be far below the 15s limit, got: ${failures[0]}`);
});

test('attachRequestFailureHandling: only reports the first failure', () => {
	const req = new FakeClientRequest();
	const failures: string[] = [];
	attachRequestFailureHandling(asClientRequest(req), 15000, (message) => failures.push(message));

	req.emit('error', Object.assign(new Error('first'), { code: 'ECONNRESET' }));
	req.emit('error', Object.assign(new Error('second'), { code: 'ECONNRESET' }));
	req.fireTimeout();

	assert.equal(failures.length, 1);
	assert.match(failures[0], /first/);
});
