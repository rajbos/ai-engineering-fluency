import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import tokenEstimatorsData from '../../../src/tokenEstimators.json';
import modelPricingData from '../../../src/modelPricing.json';
import toolNamesData from '../../../src/toolNames.json';
import type { ModelPricing, TokenEstimator } from '../../../src/types';
import { analyzeSessionFile, type SessionAnalyzerDeps } from '../../src/analysis/sessionFileAnalyzer';

// The normal (worker) analysis resolves a session's git remote, so workspace grouping has its
// strongest signal on a cold cache too — not only after the Details view populated the cache.

const deps: SessionAnalyzerDeps = {
	warn: () => undefined,
	ecosystems: [],
	tokenEstimators: tokenEstimatorsData.estimators as Record<string, TokenEstimator>,
	modelPricing: modelPricingData.pricing as { [key: string]: ModelPricing },
	toolNameMap: toolNamesData as { [key: string]: string },
};

function session(refs: string[]): string {
	return JSON.stringify({
		version: 3,
		requests: [{
			requestId: 'r1', timestamp: Date.now(), message: { text: 'hello' }, response: [{ value: 'hi' }],
			contentReferences: refs.map(fsPath => ({ kind: 'reference', reference: { fsPath } })),
		}],
	});
}

async function analyze(file: string, existing?: { repository?: string }) {
	const stat = fs.statSync(file);
	return analyzeSessionFile(deps, file, stat.mtimeMs, stat.size, existing);
}

test('analyzeSessionFile records the remote of the files a VS Code session referenced', async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'analyze-repo-'));
	try {
		const repo = path.join(root, 'widget');
		fs.mkdirSync(path.join(repo, '.git'), { recursive: true });
		fs.writeFileSync(path.join(repo, '.git', 'config'), '[remote "origin"]\n\turl = https://github.com/acme/widget.git\n');
		const touched = path.join(repo, 'index.ts');
		fs.writeFileSync(touched, '');

		const withRef = path.join(root, 'with-ref.json');
		fs.writeFileSync(withRef, session([touched]));
		assert.equal((await analyze(withRef)).repository, 'https://github.com/acme/widget.git');

		// None found is remembered as '' so it is not looked up again …
		const withoutRef = path.join(root, 'without-ref.json');
		fs.writeFileSync(withoutRef, session([]));
		assert.equal((await analyze(withoutRef)).repository, '');

		// … and a previously known value (including '') is carried forward, not recomputed.
		assert.equal((await analyze(withRef, { repository: 'https://github.com/kept/as-is' })).repository, 'https://github.com/kept/as-is');
		assert.equal((await analyze(withRef, { repository: '' })).repository, '');
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
});
