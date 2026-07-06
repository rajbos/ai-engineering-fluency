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

fs.mkdirSync(outTestDir, { recursive: true });
fs.cpSync(packageJsonPath, path.join(outDir, 'package.json'), { force: true });
fs.cpSync(packageJsonPath, path.join(outExtDir, 'package.json'), { force: true });
fs.cpSync(packageJsonPath, path.join(outTestDir, 'package.json'), { force: true });
