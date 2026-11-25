import './vscode-shim-register';
import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { makeTmpFixtureDir } from './tmpFixtureDirs';

import { UsageHistoryStore } from '../../src/usageHistoryStore';
import { CacheManager } from '../../src/cacheManager';
import type { SessionFileCache } from '../../../src/types';
import { createMockMemento } from './vscode-test-helpers';

const SESSION_A = '11111111-aaaa-4bbb-8ccc-000000000001';
const SESSION_B = '22222222-aaaa-4bbb-8ccc-000000000002';
const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.parse('2026-11-25T12:00:00Z');

function entry(mtime: number, tokens = 100, extra: Partial<SessionFileCache> = {}): SessionFileCache {
	return { tokens, interactions: 2, modelUsage: {}, mtime, size: 10, lastInteraction: new Date(mtime).toISOString(), ...extra } as SessionFileCache;
}

function makeStore(dir: string, id = 'w1', clock = () => NOW): UsageHistoryStore {
	return new UsageHistoryStore(path.join(dir, 'usage-history_prod.json'), {
		log: () => {}, warn: () => {}, lockOwner: () => ({ id, pid: process.pid }), now: clock,
	});
}

function makeManager(dir: string, editorTypeOf?: (p: string) => string): CacheManager {
	const context: any = { extensionMode: 1, globalStorageUri: { fsPath: dir }, globalState: createMockMemento() };
	return new CacheManager(context, { log: () => {}, warn: () => {}, error: () => {}, lockOwnerId: 'w1', editorTypeOf }, 1);
}

const editorOf = () => 'Fallback Editor';

test('retain() keeps real usage and ignores placeholders and sessions without interactions', () => {
	const store = makeStore(makeTmpFixtureDir('ctt-usage-history-'));
	assert.equal(store.retain('/p/placeholder.jsonl', entry(NOW, 5, { detailsOnly: true })), false);
	assert.equal(store.retain('/p/empty.jsonl', entry(NOW, 5, { interactions: 0 })), false);
	assert.equal(store.retain(`/p/${SESSION_A}.jsonl`, entry(NOW, 5, { usageAnalysis: { toolCalls: { total: 1, byTool: {} } } as any }), 'Claude Code'), true);
	assert.equal(store.size, 1);
	const [input] = store.toAggregateInputs([], editorOf, 0);
	assert.equal(input.editorType, 'Claude Code', 'the editor resolved while the file existed is kept');
	assert.equal(input.sessionData.tokens, 5);
	assert.equal(input.sessionData.usageAnalysis, undefined, 'per-session analysis detail is not kept');
});

test('retain() keeps the newer version of a path', () => {
	const store = makeStore(makeTmpFixtureDir('ctt-usage-history-'));
	store.retain('/p/a.jsonl', entry(NOW, 200));
	assert.equal(store.retain('/p/a.jsonl', entry(NOW - DAY, 100)), false, 'an older version must not replace a newer one');
	assert.equal(store.toAggregateInputs([], editorOf, 0)[0].sessionData.tokens, 200);
});

test('toAggregateInputs() never counts a session that is live again, by path or by session id', () => {
	const store = makeStore(makeTmpFixtureDir('ctt-usage-history-'));
	const oldPathA = path.join('/claude', 'projects', 'old-project', `${SESSION_A}.jsonl`);
	const pathB = path.join('/claude', 'projects', 'p', `${SESSION_B}.jsonl`);
	store.retain(oldPathA, entry(NOW));
	store.retain(pathB, entry(NOW));
	store.retain('/copilot/main.jsonl', entry(NOW));

	const relocatedA = path.join('/claude', 'projects', 'new-project', `${SESSION_A}.jsonl`);
	const inputs = store.toAggregateInputs([relocatedA, pathB, '/other/main.jsonl'], editorOf, 0);
	assert.equal(inputs.length, 1,
		'A moved to another project folder (same session id) and B came back (same path): only the generic-named file, which matches neither, still counts');
});

test('toAggregateInputs() skips entries older than the cutoff unless their last interaction is newer', () => {
	const store = makeStore(makeTmpFixtureDir('ctt-usage-history-'));
	store.retain('/p/old.jsonl', entry(NOW - 90 * DAY));
	store.retain('/p/touched.jsonl', entry(NOW - 90 * DAY, 100, { lastInteraction: new Date(NOW - DAY).toISOString() }));
	store.retain('/p/recent.jsonl', entry(NOW - DAY));
	const cutoff = NOW - 40 * DAY;
	assert.equal(store.toAggregateInputs([], editorOf, cutoff).length, 2);
});

test('save() + load() round-trip, and two windows merge instead of overwriting each other', async () => {
	const dir = makeTmpFixtureDir('ctt-usage-history-');
	const w1 = makeStore(dir, 'w1');
	const w2 = makeStore(dir, 'w2');
	w1.retain('/p/a.jsonl', entry(NOW));
	w2.retain('/p/b.jsonl', entry(NOW));
	await w1.save();
	await w2.save();

	const reader = makeStore(dir, 'w3');
	await reader.load();
	assert.equal(reader.size, 2, 'the second save must merge with the first, not replace it');
	assert.ok(!fs.existsSync(path.join(dir, 'usage-history_prod.json.lock')), 'the lock is released after saving');
});

test('clear() removes history on disk and stops another window from writing its stale copy back', async () => {
	const dir = makeTmpFixtureDir('ctt-usage-history-');
	let t = NOW;
	const clock = () => t;
	const w1 = makeStore(dir, 'w1', clock);
	const w2 = makeStore(dir, 'w2', clock);
	w1.retain('/p/a.jsonl', entry(NOW));
	await w1.save();
	await w2.load();
	assert.equal(w2.size, 1);

	t += 1000;
	await w1.clear();
	assert.equal(w1.size, 0);

	// w2 still holds /p/a.jsonl in memory; retaining something new and saving merges with disk.
	t += 1000;
	w2.retain('/p/c.jsonl', entry(NOW));
	await w2.save();
	const reader = makeStore(dir, 'w3', clock);
	await reader.load();
	assert.equal(reader.toAggregateInputs([], editorOf, 0).length, 1, 'only the entry retained after the clear survives');
	assert.equal(w2.size, 1, 'the merge also drops the cleared entry from the other window\'s memory');
});

test('an unreadable history file is treated as empty, not fatal', async () => {
	const dir = makeTmpFixtureDir('ctt-usage-history-');
	fs.writeFileSync(path.join(dir, 'usage-history_prod.json'), '{ not json');
	const store = makeStore(dir);
	await store.load();
	assert.equal(store.size, 0);
});

test('CacheManager.clearExpiredCache() keeps the usage of a session whose file is gone', async () => {
	const dir = makeTmpFixtureDir('ctt-usage-history-');
	const m = makeManager(dir, () => 'Claude Code');
	const gone = path.join(dir, 'projects', `${SESSION_A}.jsonl`);
	m.setCachedSessionData(gone, entry(NOW, 4321), 10);

	await m.clearExpiredCache();

	assert.ok(!m.cache.has(gone), 'the cache entry is still evicted');
	const inputs = m.usageHistory.toAggregateInputs(m.cache.keys(), editorOf, 0);
	assert.equal(inputs.length, 1);
	assert.equal(inputs[0].sessionData.tokens, 4321);
	assert.equal(inputs[0].editorType, 'Claude Code');

	const reloaded = makeManager(dir);
	await reloaded.loadCacheFromStorage();
	assert.equal(reloaded.usageHistory.size, 1, 'clearExpiredCache() persists the history, so a restart still has it');
});

test('CacheManager.evictUndiscoveredSessionData() keeps usage only when the file is really gone', () => {
	const dir = makeTmpFixtureDir('ctt-usage-history-');
	const m = makeManager(dir);
	const stillThere = path.join(dir, `${SESSION_A}.jsonl`);
	fs.writeFileSync(stillThere, '{}\n');
	const gone = path.join(dir, `${SESSION_B}.jsonl`);
	const virtual = path.join(dir, 'opencode.db#ses_1');
	m.setCachedSessionData(stillThere, entry(NOW), 10);
	m.setCachedSessionData(gone, entry(NOW), 10);
	m.setCachedSessionData(virtual, entry(NOW), 10);

	m.evictUndiscoveredSessionData(stillThere);
	m.evictUndiscoveredSessionData(gone);
	m.evictUndiscoveredSessionData(virtual);

	assert.equal(m.cache.size, 0, 'all three are evicted from the cache, as before');
	assert.equal(m.usageHistory.size, 1,
		'only the missing file is kept: an existing file no adapter claims any more is dropped on purpose, and a virtual DB path cannot be checked');
});
