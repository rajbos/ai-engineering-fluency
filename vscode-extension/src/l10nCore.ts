/**
 * Bundle resolution for the extension's runtime strings — the vscode-free half
 * of the localization stack.
 *
 * Why this is a separate module from `l10n.ts`: the only thing `t()` needs the
 * VS Code API for is *which language to render in* (`vscode.env.language`) and
 * the `vscode.l10n.t()` precedence check. Looking a key up in the inlined
 * `package.nls*.json` bundles and substituting `{0}`/`{1}` placeholders needs
 * neither. Splitting them lets modules that are deliberately pure — no `vscode`
 * import, so they stay unit-testable with plain mocked data — still resolve
 * real localized strings by being handed a translator, rather than being forced
 * to either import `vscode` or ship hardcoded English.
 *
 * `insightsEngine.ts` is the motivating case (see issue #2081): its 50+ insight
 * definitions are user-facing prose, but the module's own header comment
 * commits it to staying VS Code-free. It receives `InsightContext.translate`,
 * which `extension.ts` fills with the real `t()` and tests fill with
 * `createTranslator('en')` / `createTranslator('zh-cn')` from this module — so
 * unit tests assert against the real shipped bundles rather than a stub.
 *
 * This module is the single source of truth for bundle lookup; `l10n.ts` is a
 * thin VS Code-aware wrapper over it and must not duplicate the logic here.
 */
import englishBundleData from '../package.nls.json';
import zhCnBundleData from '../package.nls.zh-cn.json';

/** The English bundle — also the final fallback for every other locale. */
export const ENGLISH_BUNDLE = englishBundleData as Record<string, string>;

/** Locale id (lowercase, from the package.nls.<locale>.json filename) → bundle. */
const LOCALE_BUNDLES: Record<string, Record<string, string>> = {
	'zh-cn': zhCnBundleData as Record<string, string>
};

const missingKeyWarnings = new Set<string>();

/** A key-based translation function: the shape pure modules are handed. */
export type Translate = (key: string, ...args: Array<string | number | boolean>) => string;

/** Replace {0}, {1}, ... placeholders, mirroring vscode.l10n.t() formatting. */
export function formatMessage(template: string, args: Array<string | number | boolean>): string {
	return template.replace(/\{(\d+)\}/g, (match, index) => {
		const i = Number(index);
		return i < args.length ? String(args[i]) : match;
	});
}

/** The id of the inlined bundle that serves `language`, or undefined when none does. */
export function resolveLocaleId(language: string): string | undefined {
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

export function resolveLocaleBundle(language: string): Record<string, string> | undefined {
	const id = resolveLocaleId(language);
	return id === undefined ? undefined : LOCALE_BUNDLES[id];
}

/**
 * Resolve `key` against the bundle serving `language`, falling back to English
 * and finally to the key itself for genuinely unknown keys (logged once per key).
 *
 * This is the whole of the lookup; `l10n.ts`'s `t()` adds only the VS Code
 * `l10n.t()` precedence check and the `vscode.env.language` argument.
 */
export function translate(language: string, key: string, ...args: Array<string | number | boolean>): string {
	const template = resolveLocaleBundle(language)?.[key] ?? ENGLISH_BUNDLE[key];
	if (template === undefined) {
		if (!missingKeyWarnings.has(key)) {
			missingKeyWarnings.add(key);
			console.warn(`[ai-engineering-fluency] No localization found for key "${key}" — add it to package.nls.json.`);
		}
		return key;
	}
	return formatMessage(template, args);
}

/**
 * A {@link Translate} bound to one language — what pure modules are injected with.
 *
 * Note this skips the `vscode.l10n.t()` precedence check that `t()` performs,
 * because consulting it requires the VS Code API. That check only ever matters
 * if real `l10n/bundle.l10n.<lang>.json` files are shipped one day (none are
 * today); until then `t()` and a translator bound to `vscode.env.language`
 * resolve identically. `extension.ts` injects the real `t()` rather than a
 * translator from here, so production keeps the full resolution order and only
 * tests use this.
 */
export function createTranslator(language: string): Translate {
	return (key, ...args) => translate(language, key, ...args);
}
