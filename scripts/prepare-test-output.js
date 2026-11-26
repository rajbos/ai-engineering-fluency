const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const extensionRoot = path.join(repoRoot, 'vscode-extension');
// Shared sources live in <repo>/src, so tests compile with rootDir at the repo
// root: extension code lands in out/vscode-extension/** and shared code in out/src/**.
const outDir = path.join(extensionRoot, 'out');
const outExtDir = path.join(outDir, 'vscode-extension');
const outTestDir = path.join(outExtDir, 'test');
const packageJsonPath = path.join(extensionRoot, 'package.json');

// tsc never deletes the output of a source that was moved or removed, and both test runners
// pick up every *.test.js in these folders by listing them. Without this, a reused checkout
// keeps running stale copies of moved tests against current code and fails.
const compiledTestDirs = [
	{ outDir: path.join(outTestDir, 'unit'), srcDir: path.join(extensionRoot, 'test', 'unit') },
	{ outDir: path.join(outDir, 'src', 'test'), srcDir: path.join(repoRoot, 'src', 'test') },
];

for (const { outDir: compiledDir, srcDir } of compiledTestDirs) {
	if (!fs.existsSync(compiledDir)) {
		continue;
	}
	for (const name of fs.readdirSync(compiledDir)) {
		const match = /^(.*\.test)\.js(\.map)?$/.exec(name);
		if (match && !fs.existsSync(path.join(srcDir, `${match[1]}.ts`))) {
			fs.rmSync(path.join(compiledDir, name), { force: true });
		}
	}
}

fs.mkdirSync(outTestDir, { recursive: true });
fs.cpSync(packageJsonPath, path.join(outDir, 'package.json'), { force: true });
fs.cpSync(packageJsonPath, path.join(outExtDir, 'package.json'), { force: true });
fs.cpSync(packageJsonPath, path.join(outTestDir, 'package.json'), { force: true });
