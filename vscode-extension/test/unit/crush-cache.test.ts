import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { CrushDataAccess } from '../../src/crush';

const SESSION_ID = 'ses-001';

type HarnessOptions = {
	delayInit?: boolean;
	failOpenAttempts?: Set<number>;
	mutateOnOpen?: { attempt: number; content: string };
};

function createHarness(options: HarnessOptions = {}) {
	const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'crush-cache-'));
	const crushDir = path.join(tmpDir, '.crush');
	fs.mkdirSync(crushDir, { recursive: true });
	const dbPath = path.join(crushDir, 'crush.db');
	const virtualPath = `${dbPath}#${SESSION_ID}`;

	const opened: Array<{ content: string; closed: boolean }> = [];
	let openAttempts = 0;
	let initCalls = 0;
	let touchCounter = 0;

	const setDbContent = (content: string) => {
		fs.writeFileSync(dbPath, content);
		const touchedAt = new Date(Date.UTC(2026, 0, 1, 0, 0, touchCounter++));
		fs.utimesSync(dbPath, touchedAt, touchedAt);
	};
	setDbContent('v1');

	class FakeDatabase {
		readonly content: string;
		closed = false;

		constructor(buffer: Uint8Array) {
			openAttempts++;
			if (options.failOpenAttempts?.has(openAttempts)) {
				throw new Error('open failed');
			}
			this.content = Buffer.from(buffer).toString('utf8');
			opened.push(this);
			if (options.mutateOnOpen?.attempt === openAttempts) {
				setDbContent(options.mutateOnOpen.content);
			}
		}

		exec(_query: string, _params?: unknown[]): Array<{ columns: string[]; values: unknown[][] }> {
			if (_query.includes('FROM messages')) {
				return [{
					columns: ['id', 'session_id', 'role', 'parts', 'model', 'provider', 'created_at', 'updated_at', 'finished_at'],
					values: [[
						`msg-${this.content}`,
						SESSION_ID,
						'assistant',
						JSON.stringify([{ type: 'text', text: this.content }]),
						'gpt-4',
						'openai',
						100,
						200,
						300,
					]],
				}];
			}
			if (_query.includes('FROM sessions') && _query.includes('WHERE id')) {
				return [{
					columns: ['id', 'title', 'message_count', 'prompt_tokens', 'completion_tokens', 'created_at', 'updated_at'],
					values: [[SESSION_ID, `title-${this.content}`, 1, 50, 50, 100, 200]],
				}];
			}
			if (_query.includes('FROM sessions')) {
				return [{
					columns: ['id'],
					values: [[SESSION_ID]],
				}];
			}
			return [];
		}

		close(): void {
			this.closed = true;
		}
	}

	const access = new CrushDataAccess({ fsPath: '', path: '', scheme: 'file' });
	(access as any).initSqlJs = async () => {
		initCalls++;
		if (options.delayInit) {
			await new Promise(resolve => setTimeout(resolve, 10));
		}
		return { Database: FakeDatabase };
	};

	return {
		access,
		dbPath,
		virtualPath,
		opened,
		setDbContent,
		get openAttempts() { return openAttempts; },
		get initCalls() { return initCalls; },
		cleanup: () => {
			access.dispose();
			fs.rmSync(tmpDir, { recursive: true, force: true });
		},
	};
}

test('Crush DB cache reuses the same Database for unchanged files', async () => {
	const harness = createHarness();
	try {
		const first = await harness.access.getCrushMessages(harness.virtualPath);
		const second = await harness.access.getCrushMessages(harness.virtualPath);

		assert.equal(first[0].parts[0].text, 'v1');
		assert.equal(second[0].parts[0].text, 'v1');
		assert.equal(harness.openAttempts, 1);
		assert.equal(harness.initCalls, 1);
		assert.equal(harness.opened[0].closed, false);
	} finally {
		harness.cleanup();
	}
});

test('Crush DB cache single-flights concurrent opens for the same file version', async () => {
	const harness = createHarness({ delayInit: true });
	try {
		const results = await Promise.all([
			harness.access.getCrushMessages(harness.virtualPath),
			harness.access.getCrushMessages(harness.virtualPath),
			harness.access.getCrushMessages(harness.virtualPath),
		]);

		assert.deepEqual(results.map(r => r[0].parts[0].text), ['v1', 'v1', 'v1']);
		assert.equal(harness.openAttempts, 1);
		assert.equal(harness.initCalls, 1);
	} finally {
		harness.cleanup();
	}
});

test('Crush DB cache falls back to stale cached DB when refresh open fails', async () => {
	const harness = createHarness({ failOpenAttempts: new Set([2]) });
	try {
		const first = await harness.access.getCrushMessages(harness.virtualPath);
		harness.setDbContent('v2');
		const afterFailedRefresh = await harness.access.getCrushMessages(harness.virtualPath);

		assert.equal(first[0].parts[0].text, 'v1');
		assert.equal(afterFailedRefresh[0].parts[0].text, 'v1');
		assert.equal(harness.openAttempts, 2);
		assert.equal(harness.opened.length, 1);
		assert.equal(harness.opened[0].closed, false);
	} finally {
		harness.cleanup();
	}
});

test('Crush DB cache closes cached DB when the backing file disappears', async () => {
	const harness = createHarness();
	try {
		await harness.access.getCrushMessages(harness.virtualPath);
		fs.unlinkSync(harness.dbPath);
		const afterDelete = await harness.access.getCrushMessages(harness.virtualPath);

		assert.deepEqual(afterDelete, []);
		assert.equal(harness.opened[0].closed, true);
		assert.equal((harness.access as any)._dbCache.size, 0);
	} finally {
		harness.cleanup();
	}
});

test('Crush DB cache closes cached DB on dispose', async () => {
	const harness = createHarness();
	try {
		await harness.access.getCrushMessages(harness.virtualPath);
		harness.access.dispose();

		assert.equal(harness.opened[0].closed, true);
		assert.equal((harness.access as any)._dbCache.size, 0);
	} finally {
		harness.cleanup();
	}
});

test('Crush DB cache does not install a DB if the file changes during refresh', async () => {
	const harness = createHarness({ mutateOnOpen: { attempt: 2, content: 'v3' } });
	try {
		await harness.access.getCrushMessages(harness.virtualPath);
		harness.setDbContent('v2');

		const duringChangingRefresh = await harness.access.getCrushMessages(harness.virtualPath);
		const afterSettledRefresh = await harness.access.getCrushMessages(harness.virtualPath);

		assert.equal(duringChangingRefresh[0].parts[0].text, 'v1');
		assert.equal(afterSettledRefresh[0].parts[0].text, 'v3');
		assert.equal(harness.opened[1].content, 'v2');
		assert.equal(harness.opened[1].closed, true);
		assert.equal(harness.opened[0].closed, true);
		assert.equal(harness.opened[2].closed, false);
	} finally {
		harness.cleanup();
	}
});

test('Crush DB cache maintains independent caches for different DB paths', async () => {
	const harness = createHarness();
	// Create a second project DB
	const tmpDir2 = fs.mkdtempSync(path.join(os.tmpdir(), 'crush-cache2-'));
	try {
		const crushDir2 = path.join(tmpDir2, '.crush');
		fs.mkdirSync(crushDir2, { recursive: true });
		const dbPath2 = path.join(crushDir2, 'crush.db');
		const virtualPath2 = `${dbPath2}#ses-002`;
		fs.writeFileSync(dbPath2, 'proj2');
		const t2 = new Date(Date.UTC(2026, 0, 1, 1, 0, 0));
		fs.utimesSync(dbPath2, t2, t2);

		(harness.access as any).initSqlJs = async () => {
			return {
				Database: class {
					content: string;
					closed = false;
					constructor(buf: Uint8Array) { this.content = Buffer.from(buf).toString('utf8'); }
					exec(_q: string, _p?: unknown[]) {
						if (_q.includes('FROM messages')) {
							return [{ columns: ['id','session_id','role','parts','model','provider','created_at','updated_at','finished_at'], values: [[`msg-${this.content}`, 'ses-001', 'assistant', JSON.stringify([{type:'text',text:this.content}]), 'gpt-4', 'openai', 1, 2, 3]] }];
						}
						return [];
					}
					close() { this.closed = true; }
				}
			};
		};

		const r1 = await harness.access.getCrushMessages(harness.virtualPath);
		const r2 = await harness.access.getCrushMessages(virtualPath2);

		assert.equal(r1[0].parts[0].text, 'v1');
		assert.equal(r2[0].parts[0].text, 'proj2');
		assert.equal((harness.access as any)._dbCache.size, 2);
	} finally {
		harness.cleanup();
		fs.rmSync(tmpDir2, { recursive: true, force: true });
	}
});

test('Crush DB cache discoverSessionsInDb uses cache', async () => {
	const harness = createHarness();
	try {
		const sessions1 = await harness.access.discoverSessionsInDb(harness.dbPath);
		const sessions2 = await harness.access.discoverSessionsInDb(harness.dbPath);

		assert.deepEqual(sessions1, [SESSION_ID]);
		assert.deepEqual(sessions2, [SESSION_ID]);
		assert.equal(harness.openAttempts, 1);
	} finally {
		harness.cleanup();
	}
});
