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
 */
import * as vscode from 'vscode';
import englishBundleData from '../package.nls.json';
import zhCnBundleData from '../package.nls.zh-cn.json';

const ENGLISH_BUNDLE = englishBundleData as Record<string, string>;

/** Locale id (lowercase, from the package.nls.<locale>.json filename) → bundle. */
const LOCALE_BUNDLES: Record<string, Record<string, string>> = {
	'zh-cn': zhCnBundleData as Record<string, string>
};

const missingKeyWarnings = new Set<string>();

/** Replace {0}, {1}, ... placeholders, mirroring vscode.l10n.t() formatting. */
function formatMessage(template: string, args: Array<string | number | boolean>): string {
	return template.replace(/\{(\d+)\}/g, (match, index) => {
		const i = Number(index);
		return i < args.length ? String(args[i]) : match;
	});
}

/** The id of the inlined bundle that serves `language`, or undefined when none does. */
function resolveLocaleId(language: string): string | undefined {
	const lang = (language || '').toLowerCase();
	// Own-property check, not a bare lookup: LOCALE_BUNDLES is a plain object, so a lowercase
	// prototype key ('constructor', '__proto__') reads back truthy and would be reported as a
	// shipped locale — which for `<html lang>` means emitting lang="constructor".
	if (Object.prototype.hasOwnProperty.call(LOCALE_BUNDLES, lang)) {
		return lang;
	}
	// A bare language tag ('zh') may match a more specific bundle ('zh-cn'),
	// but never the other way around ('zh-tw' must not get Simplified Chinese).
	for (const locale of Object.keys(LOCALE_BUNDLES)) {
		if (lang === locale.split('-')[0]) {
			return locale;
		}
	}
	return undefined;
}

function resolveLocaleBundle(language: string): Record<string, string> | undefined {
	const id = resolveLocaleId(language);
	return id === undefined ? undefined : LOCALE_BUNDLES[id];
}

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
	const template = resolveLocaleBundle(vscode.env.language)?.[key] ?? ENGLISH_BUNDLE[key];
	if (template === undefined) {
		if (!missingKeyWarnings.has(key)) {
			missingKeyWarnings.add(key);
			console.warn(`[ai-engineering-fluency] No localization found for key "${key}" — add it to package.nls.json.`);
		}
		return key;
	}
	return formatMessage(template, args);
}
