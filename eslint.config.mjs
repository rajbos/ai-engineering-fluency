// Root ESLint config so the shared sources in <repo>/src are linted with the
// same rules as the VS Code extension (which owns the ESLint dependencies).
// ESLint resolves the config for each linted file by walking up from that file,
// so files under src/ find this config while vscode-extension/** keeps using
// vscode-extension/eslint.config.mjs.
export { default } from './vscode-extension/eslint.config.mjs';
