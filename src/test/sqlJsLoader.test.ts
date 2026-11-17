import test from 'node:test';
import assert from 'node:assert/strict';
import { SqlJsLoader, type SqlJsFactory } from '../utils/sqlJsLoader';

type SqlJsStatic = Awaited<ReturnType<SqlJsFactory>>;

function stubFactory(): { factory: SqlJsFactory; calls: () => number; fail: (on: boolean) => void } {
	let calls = 0;
	let failing = false;
	const factory: SqlJsFactory = async () => {
		calls++;
		if (failing) { throw new Error('wasm failed'); }
		return { id: calls } as unknown as SqlJsStatic;
	};
	return { factory, calls: () => calls, fail: on => { failing = on; } };
}

test('SqlJsLoader shares one load between concurrent callers and caches the module', async () => {
	const s = stubFactory();
	const loader = new SqlJsLoader(s.factory);
	const [a, b] = await Promise.all([loader.load(), loader.load()]);
	assert.equal(a, b);
	assert.equal(await loader.load(), a);
	assert.equal(s.calls(), 1);
});

test('SqlJsLoader retries after a failed load', async () => {
	const s = stubFactory();
	const loader = new SqlJsLoader(s.factory);
	s.fail(true);
	await assert.rejects(loader.load(), /wasm failed/);
	s.fail(false);
	const module = await loader.load();
	assert.equal(await loader.load(), module);
	assert.equal(s.calls(), 2);
});

test('SqlJsLoader.clearPending keeps an already loaded module cached', async () => {
	const s = stubFactory();
	const loader = new SqlJsLoader(s.factory);
	const module = await loader.load();
	loader.clearPending();
	assert.equal(await loader.load(), module);
	assert.equal(s.calls(), 1);
});

test('SqlJsLoader defaults to the real sql.js module', async () => {
	const module = await new SqlJsLoader().load();
	assert.equal(typeof module.Database, 'function');
});
