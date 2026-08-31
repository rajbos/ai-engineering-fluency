See [.github/copilot-instructions.md](.github/copilot-instructions.md).

## Localization changes require test coverage

When adding or changing runtime localization keys (entries in `vscode-extension/package.nls.json` / `package.nls.zh-cn.json` consumed via the `l10n.t()` helper in `vscode-extension/src/l10n.ts`), add unit tests in `vscode-extension/test/unit/l10n.test.ts` asserting the new keys resolve to their expected English text (and zh-CN translation where one exists). PR review flags localization changes that ship without this coverage.
