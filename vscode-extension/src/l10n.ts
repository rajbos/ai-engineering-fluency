/**
 * Key-based localization for the extension's runtime strings.
 *
 * Why not call `vscode.l10n.t()` directly? That API only resolves through
 * `l10n/bundle.l10n.<lang>.json` files (enabled via the `l10n` field in
 * package.json). This extension keeps its strings in `package.nls.json`,
 * which VS Code only consults for static `%key%` references in
 * package.json — never for the runtime API. On an English (default
 * language) VS Code, `l10n.t(key)` returns the message argument unchanged,
 * so key-based calls like `l10n.t('statusBar.loadingText')` surface the raw
 * key in the UI.
 *
 * This module makes the existing `package.nls*.json` files the single source
 * of truth for runtime strings too: esbuild inlines them into the bundle and
 * `t()` resolves keys from the bundle matching `vscode.env.language`,
 * falling back to English and finally to the key itself.
 *
 * `vscode.l10n.t()` is still consulted first, so if proper l10n bundles are
 * ever shipped, real VS Code-provided translations take precedence.
 *
 * The bundle lookup itself lives in `l10nCore.ts`, which imports no `vscode`
 * — this file adds only the two things that genuinely need the API: the
 * `vscode.l10n.t()` precedence check and `vscode.env.language`. Modules that
 * must stay VS Code-free (see `insightsEngine.ts`) take a `Translate` from
 * there instead of importing this file.
 */
import * as vscode from 'vscode';
import { resolveLocaleId, translate } from './l10nCore';

export type { Translate } from './l10nCore';

/**
 * The locale the runtime strings are actually rendered in.
 *
 * Not the same question as "what is VS Code's display language": t() falls back to the English
 * bundle for every language this extension has no `package.nls.<locale>.json` for, so on a French
 * or Brazilian-Portuguese install the strings on screen are English. Anything that has to *declare*
 * the language of rendered text — a webview's `<html lang>` above all — must ask this rather than
 * `vscode.env.language`, or it labels English text as French and sends assistive technology down
 * the wrong pronunciation rules, which is the very mismatch declaring the language is meant to fix.
 *
 * The result is always either an id from LOCALE_BUNDLES or `en`, so it is safe to interpolate.
 */
export function resolvedLocale(language: string): string {
	return resolveLocaleId(language) ?? 'en';
}

/**
 * Look up a localized string by its package.nls.json key. Resolution order:
 * VS Code's own l10n bundle (if one is ever provided), the inlined bundle for
 * the current VS Code display language, the inlined English bundle, and
 * finally the key itself for genuinely unknown keys (logged once per key).
 */
export function t(key: string, ...args: Array<string | number | boolean>): string {
	const value = args.length > 0 ? vscode.l10n.t(key, ...args) : vscode.l10n.t(key);
	if (value !== key) {
		return value;
	}
	return translate(vscode.env.language, key, ...args);
}
