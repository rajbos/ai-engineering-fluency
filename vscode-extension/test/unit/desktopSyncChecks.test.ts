import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { createRequire } from 'node:module';
import { makeTmpFixtureDir } from './tmpFixtureDirs';

// The desktop app reuses this extension's webview bundles. These checks live in
// repo-root scripts/ (plain CommonJS, loaded by path) and run here too, so a new
// webview button or theme token fails the extension's own suite until the
// desktop app decides what to do with it — not just the desktop's CI job.
const requireFromHere = createRequire(__filename);

function findRepoRoot(): string {
	let dir = __dirname;
	for (let i = 0; i < 10; i++) {
		if (fs.existsSync(path.join(dir, 'scripts', 'validate-desktop-contract.js'))) {
			return dir;
		}
		dir = path.dirname(dir);
	}
	throw new Error(`Could not locate the repo root from ${__dirname}`);
}

const REPO_ROOT = findRepoRoot();

type Finding = { kind: string; command: string; detail: string };
const desktopContract = requireFromHere(path.join(REPO_ROOT, 'scripts', 'validate-desktop-contract.js')) as {
	readDesktopViews: () => string[];
	collectViewFiles: (entry: string) => string[];
	analyse: () => { views: string[]; findings: Finding[] };
};
const webviewShell = requireFromHere(path.join(REPO_ROOT, 'scripts', 'validate-webview-shell.js')) as {
	analyse: () => { referenced: number; findings: string[] };
};

test('desktop contract: every message a desktop view posts is handled or listed as unsupported', () => {
	const { findings } = desktopContract.analyse();
	assert.deepEqual(
		findings.map(f => `${f.command}: ${f.detail}`),
		[],
		'run `npm run check:contract` in desktop/ for details',
	);
});

test('desktop contract: reads the bundled views from desktop/esbuild.js', () => {
	const views = desktopContract.readDesktopViews();
	assert.ok(views.includes('details'), `expected 'details' among ${views.join(', ')}`);
	for (const view of views) {
		assert.ok(
			fs.existsSync(path.join(REPO_ROOT, 'vscode-extension', 'src', 'webview', view, 'main.ts')),
			`desktop bundles ${view}.js but its webview entry point does not exist`,
		);
	}
});

test('desktop contract: a view only owns the files it imports', () => {
	const dir = makeTmpFixtureDir('desktop-contract-');
	fs.mkdirSync(path.join(dir, 'view'));
	fs.mkdirSync(path.join(dir, 'shared'));
	fs.writeFileSync(path.join(dir, 'view', 'main.ts'), `import { a } from '../shared/used';\nimport 'external-pkg';\n`);
	fs.writeFileSync(path.join(dir, 'shared', 'used.ts'), `export { b as a } from './nested';\n`);
	fs.writeFileSync(path.join(dir, 'shared', 'nested.ts'), `export const b = 1;\n`);
	fs.writeFileSync(path.join(dir, 'shared', 'unused.ts'), `export const c = 2;\n`);

	const files = desktopContract.collectViewFiles(path.join(dir, 'view', 'main.ts'))
		.map(f => path.relative(dir, f).split(path.sep).join('/'))
		.sort();
	assert.deepEqual(files, ['shared/nested.ts', 'shared/used.ts', 'view/main.ts']);
});

test('webview shell: every --vscode-* token the webviews use is defined for the desktop app and harness', () => {
	const { referenced, findings } = webviewShell.analyse();
	assert.ok(referenced > 0, 'found no --vscode-* references; has the webview source moved?');
	assert.deepEqual(findings, [], 'run `npm run check:shell` in desktop/ for details');
});
