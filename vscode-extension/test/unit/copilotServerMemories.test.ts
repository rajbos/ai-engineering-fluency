import test from 'node:test';
import * as assert from 'node:assert/strict';

import {
	buildMemoryApiUrl,
	parseRepoFromRemoteUrl,
	citationFilePath,
	isInstructionCitation,
	fetchRepoMemories,
	analyzeServerMemories,
	toServerMemoriesAnalysisView,
	renderPromotionMarkdown,
	VIEW_PROMOTION_GROUP_LIMIT,
	MEMORY_INTEGRATION_ID,
} from '../../../src/copilotServerMemories';
import type { ServerMemory } from '../../../src/types';

// ---------------------------------------------------------------------------
// Helpers. Every test here is offline: `fetchRepoMemories` takes its `fetch` as a
// dependency and the analysis takes its `fileExists` as one, so nothing in this
// suite touches the network or the real working tree.
// ---------------------------------------------------------------------------

function memory(overrides: Partial<ServerMemory> & { id: string }): ServerMemory {
	return {
		subject: 'testing',
		fact: 'A fact.',
		citations: ['src/thing.ts:10'],
		...overrides,
	};
}

/** A `fetch` stand-in that answers `enabled` and `recent` from canned responses. */
function stubFetch(responses: { enabled?: Partial<Response> & { json?: () => Promise<unknown> }; recent: Partial<Response> & { json?: () => Promise<unknown>; text?: () => Promise<string> } }): typeof fetch {
	return (async (input: RequestInfo | URL) => {
		const url = String(input);
		const canned = url.includes('/enabled') ? responses.enabled : responses.recent;
		if (!canned) { throw new Error(`no stub for ${url}`); }
		return {
			ok: canned.ok ?? true,
			status: canned.status ?? 200,
			json: canned.json ?? (async () => ({})),
			text: canned.text ?? (async () => ''),
		} as Response;
	}) as unknown as typeof fetch;
}

const alwaysExists = { fileExists: () => true };

// ---------------------------------------------------------------------------
// URL and citation parsing
// ---------------------------------------------------------------------------

test('buildMemoryApiUrl builds the v0 memory routes, with limit only when given', () => {
	assert.equal(
		buildMemoryApiUrl('owner/name', 'enabled'),
		'https://api.githubcopilot.com/agents/swe/internal/memory/v0/owner/name/enabled',
	);
	assert.equal(
		buildMemoryApiUrl('owner/name', 'recent', 500),
		'https://api.githubcopilot.com/agents/swe/internal/memory/v0/owner/name/recent?limit=500',
	);
});

test('buildMemoryApiUrl honours an overridden API base for proxy/enterprise hosts', () => {
	assert.equal(
		buildMemoryApiUrl('o/n', 'recent', 5, 'https://copilot.example.com'),
		'https://copilot.example.com/agents/swe/internal/memory/v0/o/n/recent?limit=5',
	);
});

test('parseRepoFromRemoteUrl accepts SSH and HTTPS remotes and rejects non-GitHub ones', () => {
	assert.equal(parseRepoFromRemoteUrl('git@github.com:rajbos/ai-engineering-fluency.git'), 'rajbos/ai-engineering-fluency');
	assert.equal(parseRepoFromRemoteUrl('https://github.com/rajbos/ai-engineering-fluency'), 'rajbos/ai-engineering-fluency');
	assert.equal(parseRepoFromRemoteUrl('https://github.com/rajbos/ai-engineering-fluency.git/'), 'rajbos/ai-engineering-fluency');
	assert.equal(parseRepoFromRemoteUrl('ssh://git@github.com/rajbos/ai-engineering-fluency.git'), 'rajbos/ai-engineering-fluency');
	assert.equal(parseRepoFromRemoteUrl('https://user@github.com/rajbos/thing'), 'rajbos/thing');
	assert.equal(parseRepoFromRemoteUrl('https://gitlab.com/rajbos/thing.git'), undefined);
	assert.equal(parseRepoFromRemoteUrl(''), undefined);
});

test('parseRepoFromRemoteUrl matches the host exactly, not as a substring', () => {
	// A substring match would accept all of these, and the caller would then send the user's
	// token to the Copilot API asking for an unrelated repository's memories — surfacing
	// another repo's facts as if they belonged to this checkout.
	assert.equal(parseRepoFromRemoteUrl('https://notgithub.com/owner/repo'), undefined);
	assert.equal(parseRepoFromRemoteUrl('https://github.com.evil.test/owner/repo'), undefined);
	assert.equal(parseRepoFromRemoteUrl('git@evil.test:github.com/owner/repo.git'), undefined);
	// A URL pointing *into* a repository is not a repository remote either.
	assert.equal(parseRepoFromRemoteUrl('https://github.com/owner/repo/blob/main/x.ts'), undefined);
});

test('citationFilePath strips the line range and ignores "User input" citations', () => {
	assert.equal(citationFilePath('vscode-extension/src/cacheManager.ts:1017-1049'), 'vscode-extension/src/cacheManager.ts');
	assert.equal(citationFilePath('src/a.ts:12'), 'src/a.ts');
	assert.equal(citationFilePath('src/a.ts'), 'src/a.ts');
	// A fact learned from a person names no file — treating "User input" as a path would
	// make every such memory look permanently stale.
	assert.equal(citationFilePath('User input: prefer tabs over spaces'), undefined);
	assert.equal(citationFilePath('   '), undefined);
});

test('citationFilePath keeps a Windows drive letter intact', () => {
	assert.equal(citationFilePath('C:/repo/src/a.ts:12'), 'C:/repo/src/a.ts');
});

test('isInstructionCitation recognizes the files agents already read as instructions', () => {
	assert.equal(isInstructionCitation('AGENTS.md:120'), true);
	assert.equal(isInstructionCitation('sharing-server/AGENTS.md:10'), true);
	assert.equal(isInstructionCitation('.github/instructions/cli.instructions.md:4'), true);
	assert.equal(isInstructionCitation('.github/skills/visual-view-diff/SKILL.md:125-139'), true);
	assert.equal(isInstructionCitation('docs/features/WHATS-NEW.md:82'), true);
	assert.equal(isInstructionCitation('vscode-extension/src/cacheManager.ts:10'), false);
	// A source file that merely mentions the word must not count as documentation.
	assert.equal(isInstructionCitation('src/agentsMdParser.ts:10'), false);
});

// ---------------------------------------------------------------------------
// fetchRepoMemories — the failure modes that look like "no memories"
// ---------------------------------------------------------------------------

test('fetchRepoMemories sends Bearer auth and a recognized integration id', async () => {
	const seen: { url: string; headers: Record<string, string> }[] = [];
	const fetchFn = (async (input: RequestInfo | URL, init?: RequestInit) => {
		seen.push({ url: String(input), headers: (init?.headers ?? {}) as Record<string, string> });
		return { ok: true, status: 200, json: async () => [], text: async () => '' } as Response;
	}) as unknown as typeof fetch;

	await fetchRepoMemories('o/n', { getToken: async () => 'tok', fetchFn });

	assert.equal(seen.length, 2, 'reads both the enabled flag and the recent list');
	for (const request of seen) {
		// The `token` scheme and an unrecognized integration id are exactly what make these
		// routes answer 401/403, so both headers are asserted rather than assumed.
		assert.equal(request.headers.Authorization, 'Bearer tok');
		assert.equal(request.headers['Copilot-Integration-Id'], MEMORY_INTEGRATION_ID);
	}
});

test('fetchRepoMemories treats 204 as an empty store, not an error', async () => {
	const result = await fetchRepoMemories('o/n', {
		getToken: async () => 'tok',
		fetchFn: stubFetch({ enabled: { json: async () => ({ enabled: true }) }, recent: { status: 204 } }),
	});
	assert.deepEqual(result.memories, []);
	assert.equal(result.error, undefined);
	assert.equal(result.enabled, true);
});

test('fetchRepoMemories reports a 403 body so a rejected client is distinguishable from an empty store', async () => {
	const result = await fetchRepoMemories('o/n', {
		getToken: async () => 'tok',
		fetchFn: stubFetch({ recent: { ok: false, status: 403, text: async () => 'memory is disabled for this client' } }),
	});
	assert.equal(result.memories.length, 0);
	assert.match(result.error ?? '', /403/);
	assert.match(result.error ?? '', /disabled for this client/);
});

test('fetchRepoMemories leaves enabled undefined when the enablement check itself fails', async () => {
	// "We could not ask" must not be reported as "the repository has memory switched off".
	const result = await fetchRepoMemories('o/n', {
		getToken: async () => 'tok',
		fetchFn: stubFetch({ enabled: { ok: false, status: 500 }, recent: { json: async () => [] } }),
	});
	assert.equal(result.enabled, undefined);
	assert.equal(result.error, undefined);
});

test('fetchRepoMemories never throws when the token lookup or the request fails', async () => {
	const noToken = await fetchRepoMemories('o/n', { getToken: async () => { throw new Error('gh missing'); } });
	assert.match(noToken.error ?? '', /gh missing/);

	const networkDown = await fetchRepoMemories('o/n', {
		getToken: async () => 'tok',
		fetchFn: (async () => { throw new Error('ENOTFOUND'); }) as unknown as typeof fetch,
	});
	assert.match(networkDown.error ?? '', /ENOTFOUND/);
});

test('fetchRepoMemories drops malformed records instead of failing the whole read', async () => {
	const result = await fetchRepoMemories('o/n', {
		getToken: async () => 'tok',
		fetchFn: stubFetch({
			recent: {
				json: async () => [
					{ id: 'a', subject: 's', fact: 'f', citations: [] },
					{ id: 'b', subject: 's' },       // missing fact/citations
					null,
					{ id: 'c', subject: 's', fact: 'f', citations: ['x.ts:1'], somethingNew: 42 },
				],
			},
		}),
	});
	assert.deepEqual(result.memories.map(m => m.id), ['a', 'c']);
	// An added server field rides along rather than being stripped by the guard.
	assert.equal((result.memories[1] as unknown as { somethingNew: number }).somethingNew, 42);
});

test('fetchRepoMemories rejects a record whose citations are not all strings', async () => {
	// `Array.isArray` alone is not enough: the analysis calls `.trim()` on every citation, so
	// one `null` element would throw out of analyzeServerMemories() and take the entire
	// report with it rather than costing a single record.
	const result = await fetchRepoMemories('o/n', {
		getToken: async () => 'tok',
		fetchFn: stubFetch({
			recent: {
				json: async () => [
					{ id: 'bad', subject: 's', fact: 'f', citations: [null] },
					{ id: 'alsobad', subject: 's', fact: 'f', citations: ['ok.ts:1', 42] },
					{ id: 'good', subject: 's', fact: 'f', citations: ['ok.ts:1'] },
				],
			},
		}),
	});
	assert.deepEqual(result.memories.map(m => m.id), ['good']);
	// And the surviving set analyzes without throwing.
	assert.doesNotThrow(() => analyzeServerMemories(result, alwaysExists));
});

test('subject grouping is Unicode-aware', () => {
	// An ASCII-only normalizer maps every non-Latin subject to the empty string, merging
	// unrelated memories into one bogus group and corrupting both distinctSubjects and the
	// promotion ranking.
	const analysis = analyzeServerMemories({
		repo: 'o/n',
		enabled: true,
		memories: [
			memory({ id: '1', subject: '缓存策略' }),
			memory({ id: '2', subject: '缓存策略' }),
			memory({ id: '3', subject: 'テスト規約' }),
			memory({ id: '4', subject: 'café conventions' }),
		],
	}, alwaysExists);

	assert.equal(analysis.distinctSubjects, 3, 'three genuinely different subjects');
	const byCount = Object.fromEntries(analysis.promotionGroups.map(g => [g.displaySubject, g.repeatCount]));
	assert.equal(byCount['缓存策略'], 2);
	assert.equal(byCount['テスト規約'], 1);
	// The accented subject keeps its character rather than being silently truncated.
	assert.ok(analysis.promotionGroups.some(g => g.subject === 'café conventions'));
});

// ---------------------------------------------------------------------------
// analyzeServerMemories — the promotion ranking
// ---------------------------------------------------------------------------

test('analyzeServerMemories groups subjects case- and punctuation-insensitively', () => {
	const analysis = analyzeServerMemories({
		repo: 'o/n',
		enabled: true,
		memories: [
			memory({ id: '1', subject: 'Usage tab groups' }),
			memory({ id: '2', subject: 'usage tab groups' }),
			memory({ id: '3', subject: 'usage-tab-groups' }),
		],
	}, alwaysExists);

	assert.equal(analysis.distinctSubjects, 1);
	assert.equal(analysis.promotionGroups.length, 1);
	assert.equal(analysis.promotionGroups[0].repeatCount, 3);
	assert.equal(analysis.promotionGroups[0].displaySubject, 'Usage tab groups');
});

test('analyzeServerMemories excludes a subject where any member cites an instruction file', () => {
	// The point of the feature is to suggest facts that are NOT written down yet. One
	// member citing AGENTS.md means the whole subject is already covered there, so the
	// group must drop out even though its other members cite only code.
	const analysis = analyzeServerMemories({
		repo: 'o/n',
		enabled: true,
		memories: [
			memory({ id: '1', subject: 'graphify setup', citations: ['AGENTS.md:200'] }),
			memory({ id: '2', subject: 'graphify setup', citations: ['scripts/x.js:5'] }),
			memory({ id: '3', subject: 'cache snapshots', citations: ['src/cacheManager.ts:5'] }),
		],
	}, alwaysExists);

	assert.deepEqual(analysis.promotionGroups.map(g => g.subject), ['cache snapshots']);
	assert.equal(analysis.documentedCount, 1);
	assert.equal(analysis.promotionCandidateCount, 1);
});

test('analyzeServerMemories ranks by repeat count and reports how many are repeats', () => {
	const analysis = analyzeServerMemories({
		repo: 'o/n',
		enabled: true,
		memories: [
			memory({ id: '1', subject: 'once' }),
			memory({ id: '2', subject: 'twice' }),
			memory({ id: '3', subject: 'twice' }),
			memory({ id: '4', subject: 'thrice' }),
			memory({ id: '5', subject: 'thrice' }),
			memory({ id: '6', subject: 'thrice' }),
		],
	}, alwaysExists);

	assert.deepEqual(analysis.promotionGroups.map(g => g.subject), ['thrice', 'twice', 'once']);
	assert.equal(analysis.repeatedGroupCount, 2);
	assert.equal(analysis.promotionCandidateCount, 6);
});

test('analyzeServerMemories picks the longest wording as the representative fact', () => {
	const analysis = analyzeServerMemories({
		repo: 'o/n',
		enabled: true,
		memories: [
			memory({ id: '1', subject: 'caching', fact: 'Short.' }),
			memory({ id: '2', subject: 'caching', fact: 'A considerably fuller statement of the same rule.' }),
		],
	}, alwaysExists);
	assert.equal(analysis.promotionGroups[0].representativeFact, 'A considerably fuller statement of the same rule.');
});

test('analyzeServerMemories deduplicates and sorts a group\'s citations', () => {
	const analysis = analyzeServerMemories({
		repo: 'o/n',
		enabled: true,
		memories: [
			memory({ id: '1', subject: 'caching', citations: ['b.ts:1', 'a.ts:1'] }),
			memory({ id: '2', subject: 'caching', citations: ['a.ts:1'] }),
		],
	}, alwaysExists);
	assert.deepEqual(analysis.promotionGroups[0].citations, ['a.ts:1', 'b.ts:1']);
});

// ---------------------------------------------------------------------------
// analyzeServerMemories — stale citations
// ---------------------------------------------------------------------------

test('analyzeServerMemories flags missing citation paths and marks fully-stale memories', () => {
	const gone = new Set(['deleted.ts']);
	const analysis = analyzeServerMemories({
		repo: 'o/n',
		enabled: true,
		memories: [
			memory({ id: 'partial', subject: 'a', citations: ['deleted.ts:1', 'kept.ts:2'] }),
			memory({ id: 'gone', subject: 'b', citations: ['deleted.ts:1'] }),
			memory({ id: 'fine', subject: 'c', citations: ['kept.ts:1'] }),
		],
	}, { fileExists: (p) => !gone.has(p) });

	assert.deepEqual(analysis.staleCitations.map(c => c.id), ['partial', 'gone']);
	assert.equal(analysis.staleCitations[0].fullyStale, false);
	assert.equal(analysis.staleCitations[1].fullyStale, true);
	assert.equal(analysis.fullyStaleCount, 1);
});

test('a memory citing only user input is never reported as stale', () => {
	// It has no checkable path at all; a `fileExists` that says "no" to everything must
	// still leave it alone rather than declaring it fully stale.
	const analysis = analyzeServerMemories({
		repo: 'o/n',
		enabled: true,
		memories: [memory({ id: '1', citations: ['User input: use tabs'] })],
	}, { fileExists: () => false });

	assert.deepEqual(analysis.staleCitations, []);
	assert.equal(analysis.fullyStaleCount, 0);
});

test('analyzeServerMemories counts by agent and model, skipping records without a source', () => {
	const analysis = analyzeServerMemories({
		repo: 'o/n',
		enabled: true,
		memories: [
			memory({ id: '1', source: { agent: 'copilot-code-review', baseModel: 'gpt-5.6-luna' } }),
			memory({ id: '2', source: { agent: 'copilot-code-review', baseModel: 'gpt-5.6-luna' } }),
			memory({ id: '3', source: { agent: 'sweagent' } }),
			memory({ id: '4' }),
		],
	}, alwaysExists);

	assert.deepEqual(analysis.byAgent, { 'copilot-code-review': 2, sweagent: 1 });
	assert.deepEqual(analysis.byModel, { 'gpt-5.6-luna': 2 });
});

test('analyzeServerMemories carries a read error through to the analysis', () => {
	const analysis = analyzeServerMemories(
		{ repo: 'o/n', enabled: undefined, memories: [], error: 'HTTP 403: nope' },
		alwaysExists,
	);
	assert.equal(analysis.error, 'HTTP 403: nope');
	assert.equal(analysis.totalMemories, 0);
	assert.deepEqual(analysis.promotionGroups, []);
});

// ---------------------------------------------------------------------------
// Projections
// ---------------------------------------------------------------------------

test('toServerMemoriesAnalysisView caps the groups it ships but keeps the fact text', () => {
	const memories = Array.from({ length: VIEW_PROMOTION_GROUP_LIMIT + 5 }, (_, i) =>
		memory({ id: String(i), subject: `subject ${i}`, fact: `Fact number ${i}.` }));
	const view = toServerMemoriesAnalysisView(analyzeServerMemories({ repo: 'o/n', enabled: true, memories }, alwaysExists));

	assert.ok(view);
	assert.equal(view.topPromotionGroups.length, VIEW_PROMOTION_GROUP_LIMIT);
	// The fact is the finding for server memories, so unlike the local memory-files view
	// the text must survive the projection.
	assert.match(view.topPromotionGroups[0].representativeFact, /^Fact number/);
	assert.equal(view.totalMemories, VIEW_PROMOTION_GROUP_LIMIT + 5);
});

test('toServerMemoriesAnalysisView passes null through', () => {
	assert.equal(toServerMemoriesAnalysisView(null), null);
});

test('renderPromotionMarkdown notes repeats and says so when there is nothing to promote', () => {
	const analysis = analyzeServerMemories({
		repo: 'o/n',
		enabled: true,
		memories: [
			memory({ id: '1', subject: 'caching', fact: 'Cache via snapshots.' }),
			memory({ id: '2', subject: 'caching', fact: 'Cache via snapshots, with a sidecar.' }),
			memory({ id: '3', subject: 'linting', fact: 'Run eslint.' }),
		],
	}, alwaysExists);

	const markdown = renderPromotionMarkdown(analysis);
	assert.match(markdown, /re-learned 2x/);
	assert.match(markdown, /Cache via snapshots, with a sidecar\./);
	// A single-sighting fact is still a candidate, just not flagged as a repeat.
	assert.match(markdown, /\*\*linting\*\* — Run eslint\./);

	const empty = analyzeServerMemories({
		repo: 'o/n',
		enabled: true,
		memories: [memory({ id: '1', citations: ['AGENTS.md:1'] })],
	}, alwaysExists);
	assert.match(renderPromotionMarkdown(empty), /No promotion candidates/);
});

// ---------------------------------------------------------------------------
// Host wiring. A source-scan rather than a behavioural test, matching the idiom in
// efficiencyBuildGuards.test.ts: the invariant lives in a single argument to a VS Code
// API that cannot be exercised offline, and it regresses silently.
// ---------------------------------------------------------------------------

test('the server-memories fetch requests no broader OAuth scope than the rest of the extension', () => {
	// Compiled test output lives under out/vscode-extension/test/unit, so walk back up to the
	// package root and into src/ the way the other source-scanning tests do.
	const fs = require('node:fs') as typeof import('node:fs');
	const path = require('node:path') as typeof import('node:path');
	const extensionSrc = fs.readFileSync(path.join(__dirname, '../../../../src/extension.ts'), 'utf8');

	const scopes = Array.from(extensionSrc.matchAll(/getSession\([^,]+,\s*(\[[^\]]*\])/g)).map(m => m[1]);
	assert.ok(scopes.length > 0, 'expected to find getSession() scope arrays to check');

	// `silent: true` only returns a session that already covers the requested scopes. A scope
	// wider than the one the user has already granted therefore yields `undefined`, and the
	// Repository Memories section stays permanently empty with nothing to explain why —
	// indistinguishable from a repository that genuinely has no memories.
	const distinct = Array.from(new Set(scopes));
	assert.deepEqual(
		distinct,
		["['read:user']"],
		`every getSession() call must request the same scope; found ${distinct.join(', ')}`,
	);
});
