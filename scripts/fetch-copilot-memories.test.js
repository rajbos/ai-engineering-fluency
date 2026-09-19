#!/usr/bin/env node
'use strict';

/**
 * Unit tests for the credential-safety and remote-parsing helpers in
 * scripts/fetch-copilot-memories.js.
 *
 * Run with:  node --test scripts/fetch-copilot-memories.test.js
 *
 * The script promises in its header that it never prints a token or a credential. That
 * promise is only as good as `redactRemoteUrl()`, and a git remote is exactly the place an
 * embedded credential hides, so the redaction is pinned here rather than trusted. Requiring
 * the script is safe: it guards `main()` behind `require.main === module`, so importing it
 * performs no network request.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const { redactRemoteUrl, memoryUrl, parseArgs } = require('./fetch-copilot-memories.js');

test('redactRemoteUrl strips an embedded password from an https remote', () => {
	// The reported case: a non-GitHub remote carrying real credentials, quoted back in an
	// error message. The secret must not survive into anything printable.
	const redacted = redactRemoteUrl('https://user:secret@example.com/owner/repo');
	assert.ok(!redacted.includes('secret'), `password leaked: ${redacted}`);
	assert.ok(!redacted.includes('user:'), `username leaked: ${redacted}`);
	assert.equal(redacted, 'https://***@example.com/owner/repo');
});

test('redactRemoteUrl strips a token used as the username', () => {
	// `https://<token>@github.com/...` is how a PAT is usually embedded, with no password half.
	const redacted = redactRemoteUrl('https://ghp_exampletoken@github.com/o/r.git');
	assert.ok(!redacted.includes('ghp_exampletoken'), `token leaked: ${redacted}`);
	assert.equal(redacted, 'https://***@github.com/o/r.git');
});

test('redactRemoteUrl masks the scp-style user without mangling the path', () => {
	assert.equal(redactRemoteUrl('git@github.com:o/r.git'), '***@github.com:o/r.git');
});

test('redactRemoteUrl strips a credential carried in the query or fragment', () => {
	// Userinfo is not the only hiding place: a token in `?token=` or `#` leaks just as badly,
	// and a remote needs neither for the host/owner/repo an error message is about.
	const query = redactRemoteUrl('https://gitlab.com/o/r?token=secret');
	assert.ok(!query.includes('secret'), `query credential leaked: ${query}`);
	assert.equal(query, 'https://gitlab.com/o/r');

	const fragment = redactRemoteUrl('https://gitlab.com/o/r#secret');
	assert.ok(!fragment.includes('secret'), `fragment credential leaked: ${fragment}`);

	// And on the scp-style branch, which does not go through the URL parser.
	const scp = redactRemoteUrl('git@host.test:o/r.git?token=secret');
	assert.ok(!scp.includes('secret'), `scp query credential leaked: ${scp}`);
});

test('redactRemoteUrl leaves a credential-free remote readable', () => {
	// Redaction must not cost diagnosability in the ordinary case.
	assert.equal(redactRemoteUrl('https://github.com/o/r'), 'https://github.com/o/r');
});

test('redactRemoteUrl drops a remote it cannot parse rather than guessing', () => {
	// An unparseable string cannot be redacted with confidence, so none of it is shown.
	assert.equal(redactRemoteUrl('not a url at all'), '<unparseable remote URL>');
});

test('memoryUrl builds the v0 routes and adds limit only when given', () => {
	assert.equal(
		memoryUrl('o/n', 'enabled'),
		'https://api.githubcopilot.com/agents/swe/internal/memory/v0/o/n/enabled',
	);
	assert.equal(
		memoryUrl('o/n', 'recent', 20),
		'https://api.githubcopilot.com/agents/swe/internal/memory/v0/o/n/recent?limit=20',
	);
});

test('parseArgs rejects a non-positive or non-integer limit', () => {
	assert.deepEqual(parseArgs(['--repo', 'o/n', '--json']), { repo: 'o/n', limit: 20, json: true });
	assert.throws(() => parseArgs(['--limit', '0']), /positive integer/);
	assert.throws(() => parseArgs(['--limit', 'abc']), /positive integer/);
	assert.throws(() => parseArgs(['--nope']), /Unknown argument/);
});
