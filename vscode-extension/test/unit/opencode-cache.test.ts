import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { OpenCodeDataAccess } from '../../src/opencode';

type HarnessOptions = {
	delayInit?: boolean;
	failOpenAttempts?: Set<number>;
	mutateOnOpen?: { attempt: number; content: string };
};

function createHarness(options: HarnessOptions = {}) {
	const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opencode-cache-'));
	const dbPath = path.join(tmpDir, 'opencode.db');
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

		exec(query: string): Array<{ columns: string[]; values: unknown[][] }> {
			if (query.includes('FROM message')) {
				return [{
					columns: ['id', 'data', 'time_created'],
					values: [[
						`msg-${this.content}`,
						JSON.stringify({ role: 'assistant', dbContent: this.content, tokens: { total: 10 } }),
						123,
					]],
				}];
			}
			if (query.includes('FROM part')) {
				return [{
					columns: ['id', 'data', 'time_created'],
					values: [[
						`part-${this.content}`,
						JSON.stringify({ type: 'text', text: this.content }),
						123,
					]],
				}];
			}
			if (query.includes('FROM session')) {
				return [{
					columns: ['id', 'slug', 'title', 'time_created', 'time_updated', 'project_id', 'directory'],
					values: [['ses_1', 'slug', 'title', 100, 200, 'project', tmpDir]],
				}];
			}
			return [];
		}

		close(): void {
			this.closed = true;
		}
	}

	const access = new OpenCodeDataAccess({ fsPath: '', path: '', scheme: 'file' });
	(access as any).getOpenCodeDataDir = () => tmpDir;
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

test('OpenCode DB cache reuses the same Database for unchanged files', async () => {
	const harness = createHarness();
	try {
		const first = await harness.access.readOpenCodeDbMessages('ses_1');
		const second = await harness.access.readOpenCodeDbMessages('ses_1');

		assert.equal(first[0].dbContent, 'v1');
		assert.equal(second[0].dbContent, 'v1');
		assert.equal(harness.openAttempts, 1);
		assert.equal(harness.initCalls, 1);
		assert.equal(harness.opened[0].closed, false);
	} finally {
		harness.cleanup();
	}
});

test('OpenCode DB cache single-flights concurrent opens for the same file version', async () => {
	const harness = createHarness({ delayInit: true });
	try {
		const results = await Promise.all([
			harness.access.readOpenCodeDbMessages('ses_1'),
			harness.access.readOpenCodeDbMessages('ses_1'),
			harness.access.readOpenCodeDbMessages('ses_1'),
		]);

		assert.deepEqual(results.map(result => result[0].dbContent), ['v1', 'v1', 'v1']);
		assert.equal(harness.openAttempts, 1);
		assert.equal(harness.initCalls, 1);
	} finally {
		harness.cleanup();
	}
});

test('OpenCode DB cache falls back to stale cached DB when refresh open fails', async () => {
	const harness = createHarness({ failOpenAttempts: new Set([2]) });
	try {
		const first = await harness.access.readOpenCodeDbMessages('ses_1');
		harness.setDbContent('v2');
		const afterFailedRefresh = await harness.access.readOpenCodeDbMessages('ses_1');

		assert.equal(first[0].dbContent, 'v1');
		assert.equal(afterFailedRefresh[0].dbContent, 'v1');
		assert.equal(harness.openAttempts, 2);
		assert.equal(harness.opened.length, 1);
		assert.equal(harness.opened[0].closed, false);
	} finally {
		harness.cleanup();
	}
});

test('OpenCode DB cache closes cached DB when the backing file disappears', async () => {
	const harness = createHarness();
	try {
		await harness.access.readOpenCodeDbMessages('ses_1');
		fs.unlinkSync(harness.dbPath);
		const afterDelete = await harness.access.readOpenCodeDbMessages('ses_1');

		assert.deepEqual(afterDelete, []);
		assert.equal(harness.opened[0].closed, true);
		assert.equal((harness.access as any)._dbCache, null);
	} finally {
		harness.cleanup();
	}
});

test('OpenCode DB cache closes cached DB on dispose', async () => {
	const harness = createHarness();
	try {
		await harness.access.readOpenCodeDbMessages('ses_1');
		harness.access.dispose();

		assert.equal(harness.opened[0].closed, true);
		assert.equal((harness.access as any)._dbCache, null);
	} finally {
		harness.cleanup();
	}
});

test('OpenCode DB cache does not install a DB if the file changes during refresh', async () => {
	const harness = createHarness({ mutateOnOpen: { attempt: 2, content: 'v3' } });
	try {
		await harness.access.readOpenCodeDbMessages('ses_1');
		harness.setDbContent('v2');

		const duringChangingRefresh = await harness.access.readOpenCodeDbMessages('ses_1');
		const afterSettledRefresh = await harness.access.readOpenCodeDbMessages('ses_1');

		assert.equal(duringChangingRefresh[0].dbContent, 'v1');
		assert.equal(afterSettledRefresh[0].dbContent, 'v3');
		assert.equal(harness.opened[1].content, 'v2');
		assert.equal(harness.opened[1].closed, true);
		assert.equal(harness.opened[0].closed, true);
		assert.equal(harness.opened[2].closed, false);
	} finally {
		harness.cleanup();
	}
});
