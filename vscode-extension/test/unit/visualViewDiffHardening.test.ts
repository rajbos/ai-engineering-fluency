import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { createRequire } from 'node:module';

// The visual-view-diff skill builds and renders the code under review, so the
// paths its registry and fixtures name, the environment the build sees and the
// directories it clears are all pinned down here (issue #2310).
const requireFromHere = createRequire(__filename);

function findRepoRoot(): string {
	let dir = __dirname;
	for (let i = 0; i < 10; i++) {
		if (fs.existsSync(path.join(dir, '.github', 'skills', 'visual-view-diff', 'lib', 'harness.js'))) {
			return dir;
		}
		dir = path.dirname(dir);
	}
	throw new Error(`Could not locate the repo root from ${__dirname}`);
}

const SKILL_DIR = path.join(findRepoRoot(), '.github', 'skills', 'visual-view-diff');

const harness = requireFromHere(path.join(SKILL_DIR, 'lib', 'harness.js')) as {
	resolveInside: (root: string, relativePath: unknown, label: string) => string;
	loadFixture: (fixturePath: string, repoRoot: string) => unknown;
};

const visualDiff = requireFromHere(path.join(SKILL_DIR, 'visual-diff.js')) as {
	buildEnv: (source: Record<string, string | undefined>) => Record<string, string>;
	prepareOutRoot: (outRoot: string, defaultOutRoot: string) => void;
	requireOptionValues: (args: Record<string, string | boolean>) => Record<string, string | boolean>;
	resolveBaseRef: (requested?: unknown) => { ref: string; sha: string };
};

function tempDir(): string {
	return fs.mkdtempSync(path.join(os.tmpdir(), 'vvd-hardening-'));
}

/** A fake repo root with one in-root JSON file and a secret beside it. */
function fakeRepo(): { root: string; parent: string } {
	const parent = tempDir();
	const root = path.join(parent, 'repo');
	fs.mkdirSync(path.join(root, 'src'), { recursive: true });
	fs.writeFileSync(path.join(root, 'src', 'data.json'), JSON.stringify({ ok: true }));
	fs.writeFileSync(path.join(parent, 'secret.json'), JSON.stringify({ token: 'SENTINEL-SECRET' }));
	return { root, parent };
}

function writeFixture(dir: string, ref: string): string {
	const file = path.join(dir, 'fixture.json');
	fs.writeFileSync(file, JSON.stringify({ data: { $fromRepoJson: ref } }));
	return file;
}

test('resolveInside accepts paths under the root', () => {
	const { root, parent } = fakeRepo();
	try {
		assert.equal(harness.resolveInside(root, 'src/data.json', 'x'), path.join(root, 'src', 'data.json'));
		assert.equal(harness.resolveInside(root, 'src/../src/data.json', 'x'), path.join(root, 'src', 'data.json'));
		assert.equal(harness.resolveInside(root, 'not-there-yet.json', 'x'), path.join(root, 'not-there-yet.json'));
	} finally {
		fs.rmSync(parent, { recursive: true, force: true });
	}
});

test('resolveInside rejects traversal, absolute paths, the root itself and non-strings', () => {
	const { root, parent } = fakeRepo();
	try {
		const bad: unknown[] = [
			'../secret.json',
			'src/../../secret.json',
			'..',
			'.',
			'',
			path.join(parent, 'secret.json'),
			'/etc/passwd',
			undefined,
			42,
		];
		for (const value of bad) {
			assert.throws(() => harness.resolveInside(root, value, '$fromRepoJson'), /\$fromRepoJson/, JSON.stringify(value));
		}
	} finally {
		fs.rmSync(parent, { recursive: true, force: true });
	}
});

test('resolveInside rejects a symlink inside the root that points outside it', (t) => {
	const { root, parent } = fakeRepo();
	try {
		try {
			fs.symlinkSync(path.join(parent, 'secret.json'), path.join(root, 'src', 'link.json'), 'file');
		} catch {
			t.skip('symlinks are not permitted on this machine');
			return;
		}
		assert.throws(() => harness.resolveInside(root, 'src/link.json', 'x'), /resolves outside/);
	} finally {
		fs.rmSync(parent, { recursive: true, force: true });
	}
});

test('loadFixture resolves $fromRepoJson inside the repo and refuses to embed files outside it', () => {
	const { root, parent } = fakeRepo();
	const fixtures = tempDir();
	try {
		assert.deepEqual(harness.loadFixture(writeFixture(fixtures, 'src/data.json'), root), { data: { ok: true } });
		for (const ref of ['../secret.json', path.join(parent, 'secret.json')]) {
			assert.throws(() => harness.loadFixture(writeFixture(fixtures, ref), root), /resolves outside|must be a relative path/, ref);
		}
	} finally {
		fs.rmSync(parent, { recursive: true, force: true });
		fs.rmSync(fixtures, { recursive: true, force: true });
	}
});

test('the bundle build sees an allowlisted environment, never the caller\'s tokens', () => {
	const env = visualDiff.buildEnv({
		PATH: '/bin',
		Path: 'C:\\bin',
		SystemRoot: 'C:\\Windows',
		HOME: '/home/u',
		GITHUB_TOKEN: 'ghs_secret',
		GH_PAT: 'pat',
		NODE_OPTIONS: '--require /evil.js',
		AZURE_STORAGE_KEY: 'k',
		UNSET: undefined,
	});
	assert.deepEqual(Object.keys(env).sort(), ['HOME', 'PATH', 'Path', 'SystemRoot']);
});

test('--base refuses a value git would read as an option', () => {
	for (const bad of ['-h', '--output=/tmp/x', '', true]) {
		assert.throws(() => visualDiff.resolveBaseRef(bad), /--base must name a commit/, String(bad));
	}
});

test('a value option given without a value is an error, not a silent default', () => {
	for (const name of ['base', 'out', 'theme', 'view']) {
		assert.throws(() => visualDiff.requireOptionValues({ [name]: true }), new RegExp(`--${name} needs a value`));
	}
	assert.deepEqual(visualDiff.requireOptionValues({ base: 'main', 'allow-missing': true }), { base: 'main', 'allow-missing': true });
});

test('--out refuses a symlinked output root, even the default one', (t) => {
	const dir = tempDir();
	try {
		const target = path.join(dir, 'target');
		fs.mkdirSync(path.join(target, 'current'), { recursive: true });
		const link = path.join(dir, 'visual-output');
		try {
			fs.symlinkSync(target, link, 'junction');
		} catch {
			t.skip('symlinks are not permitted on this machine');
			return;
		}
		fs.writeFileSync(path.join(target, '.visual-view-diff-output'), '');
		assert.throws(() => visualDiff.prepareOutRoot(link, link), /symbolic link/);
		assert.ok(fs.existsSync(path.join(target, 'current')), 'the symlink target is left untouched');
	} finally {
		fs.rmSync(dir, { recursive: true, force: true });
	}
});

test('--out is only cleared when the skill owns it', () => {
	const dir = tempDir();
	try {
		const fresh = path.join(dir, 'fresh');
		visualDiff.prepareOutRoot(fresh, path.join(dir, 'default'));
		assert.ok(fs.existsSync(path.join(fresh, '.visual-view-diff-output')), 'a new directory is marked as ours');

		const foreign = path.join(dir, 'foreign');
		fs.mkdirSync(path.join(foreign, 'current'), { recursive: true });
		assert.throws(() => visualDiff.prepareOutRoot(foreign, path.join(dir, 'default')), /refusing to delete/);
		assert.ok(!fs.existsSync(path.join(foreign, '.visual-view-diff-output')), 'a refused directory is left untouched');

		const fallback = path.join(dir, 'default');
		fs.mkdirSync(path.join(fallback, 'diff'), { recursive: true });
		assert.doesNotThrow(() => visualDiff.prepareOutRoot(fallback, fallback), 'the default visual-output/ is always ours');

		fs.mkdirSync(path.join(fresh, 'baseline'));
		assert.doesNotThrow(() => visualDiff.prepareOutRoot(fresh, path.join(dir, 'default')), 'a marked directory can be reused');
	} finally {
		fs.rmSync(dir, { recursive: true, force: true });
	}
});

test('--out never follows a symlinked marker or entry', (t) => {
	const dir = tempDir();
	try {
		const outside = path.join(dir, 'outside.txt');
		fs.writeFileSync(outside, 'KEEP');
		const out = path.join(dir, 'out');
		fs.mkdirSync(path.join(out, 'current'), { recursive: true });
		const marker = path.join(out, '.visual-view-diff-output');
		try {
			fs.symlinkSync(outside, marker, 'file');
		} catch {
			t.skip('symlinks are not permitted on this machine');
			return;
		}
		// A marker that is a link does not make the directory ours, and is not written through.
		assert.throws(() => visualDiff.prepareOutRoot(out, path.join(dir, 'default')), /not a regular file/);
		assert.equal(fs.readFileSync(outside, 'utf8'), 'KEEP');
		assert.ok(fs.existsSync(path.join(out, 'current')), 'nothing is deleted when the marker is refused');

		// The same holds for the default root, and for a dangling link.
		fs.rmSync(marker);
		fs.symlinkSync(path.join(dir, 'missing.txt'), marker, 'file');
		assert.throws(() => visualDiff.prepareOutRoot(out, out), /not a regular file/);
		assert.ok(!fs.existsSync(path.join(dir, 'missing.txt')), 'a dangling marker link is not created through');

		// An entry the run overwrites later is removed as a link, never through it.
		fs.rmSync(marker);
		fs.writeFileSync(marker, '');
		fs.symlinkSync(outside, path.join(out, '.baseline-registry.json'), 'file');
		fs.symlinkSync(outside, path.join(out, 'timings.md'), 'file');
		visualDiff.prepareOutRoot(out, path.join(dir, 'default'));
		assert.equal(fs.readFileSync(outside, 'utf8'), 'KEEP');
		for (const name of ['.baseline-registry.json', 'timings.md', 'current']) {
			assert.equal(fs.lstatSync(path.join(out, name), { throwIfNoEntry: false }), undefined, `${name} is cleared`);
		}
	} finally {
		fs.rmSync(dir, { recursive: true, force: true });
	}
});

test('--out refuses a marker that is not a regular file', () => {
	const dir = tempDir();
	try {
		const out = path.join(dir, 'out');
		fs.mkdirSync(path.join(out, '.visual-view-diff-output'), { recursive: true });
		assert.throws(() => visualDiff.prepareOutRoot(out, path.join(dir, 'default')), /not a regular file/);
	} finally {
		fs.rmSync(dir, { recursive: true, force: true });
	}
});
