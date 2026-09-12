#!/usr/bin/env node
/**
 * Hardcoded UI string detector for the VS Code extension's webviews.
 *
 * Neither `validate-localization.js` nor `validate-l10n.mjs` can catch a plain
 * string literal written directly into UI-rendering code that never goes
 * through `localize(`/`t(`/`vscode.l10n.t(` at all — e.g.
 * `button.textContent = 'Refresh'` or `<h2>Usage Analysis</h2>` baked
 * straight into an HTML template literal. Both of those scripts only check
 * *consistency* of strings already wired through the localization system.
 * This script uses the TypeScript compiler API (not a blind regex scan) to
 * find literals sitting in a UI-rendering position instead.
 *
 * Scope:
 *   - vscode-extension/src/webview/**\/*.ts (all webview UI code)
 *   - vscode-extension/src/extension.ts, but only inside the `getXxxHtml`-style
 *     methods that build webview HTML (`^get[A-Za-z0-9_]*Html$`) — the rest of
 *     that 13k-line file is extension-host code with its own l10n conventions
 *     already covered by the other two scripts.
 *
 * What counts as a UI-rendering position:
 *   - `expr.textContent = '...'` / `.innerText` / `.innerHTML` / `.title` /
 *     `.placeholder` (string or template-literal RHS)
 *   - `{ textContent: '...' }`-style object literal properties with the same names
 *   - `aria-label="..."` / `title="..."` / `placeholder="..."` attributes and
 *     text content between HTML tags (`<button>`, `<h1>`-`<h6>`, `<p>`, ...)
 *     embedded in template literals
 *
 * Explicitly not flagged: console.log/warn/error/info/debug/trace arguments,
 * anything already an argument to `localize(`, `localizeFormat(`, `t(`,
 * `l10n.t(`, or `vscode.l10n.t(`, comments, import paths, and CSS/URL/class/
 * id/data-* values (those attribute names are never scanned).
 *
 * Escape hatches for a legitimate new literal:
 *   1. An inline `// i18n-exempt: <reason>` comment on the same line or the
 *      line immediately above the literal.
 *   2. An exact-match entry in `hardcoded-strings-allowlist.json` (this
 *      folder), for literals that are hard to annotate inline.
 *
 * Baseline / ratchet:
 *   This check does not try to fix today's existing violations — it only
 *   stops new ones. `hardcoded-strings-baseline.json` records every violation
 *   that already existed when the check was introduced, keyed by file path +
 *   a hash of the *offending source line's trimmed content* (not the line
 *   number, so the baseline survives unrelated line-number drift). The check
 *   fails only when it finds a violation whose file+hash isn't in the
 *   baseline — i.e. a genuinely new hardcoded string.
 *
 * Usage:
 *   node scripts/check-hardcoded-strings.mjs                 # check mode (CI)
 *   node scripts/check-hardcoded-strings.mjs --update-baseline # regenerate baseline
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import ts from 'typescript';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const extRoot = path.resolve(scriptDir, '..');
const repoRoot = path.resolve(extRoot, '..');
const webviewDir = path.join(extRoot, 'src', 'webview');
const extensionTsPath = path.join(extRoot, 'src', 'extension.ts');
const baselinePath = path.join(scriptDir, 'hardcoded-strings-baseline.json');
const allowlistPath = path.join(scriptDir, 'hardcoded-strings-allowlist.json');

const HTML_METHOD_NAME_RE = /^get[A-Za-z0-9_]*Html$/;
const TARGET_PROPS = new Set(['textContent', 'innerText', 'innerHTML', 'title', 'placeholder']);
const TAGS = [
	'button', 'label', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span',
	'td', 'th', 'option', 'summary', 'caption', 'div', 'a', 'li', 'legend',
	'strong', 'em', 'small', 'dt', 'dd', 'figcaption', 'title'
];
const TAG_TEXT_RE = new RegExp(`<(${TAGS.join('|')})(?:\\s[^>]*)?>([^<]+)</\\1>`, 'gi');
const ATTR_NAMES = ['aria-label', 'title', 'placeholder'];
const ATTR_RE = new RegExp(`(?<![\\w-])(?:${ATTR_NAMES.join('|')})\\s*=\\s*(["'])((?:(?!\\1)[\\s\\S])*)\\1`, 'gi');

const LETTER_RUN_RE = /[A-Za-z]{2,}/;
const URL_SCHEME_RE = /^(?:[a-z][a-z0-9+.-]*:)?\/\//i;
const URL_PROTOCOL_RE = /^(https?|mailto|data|vscode-resource|vscode-webview|command):/i;
const CSS_UNIT_VALUE_RE = /^-?\d+(\.\d+)?(px|em|rem|ex|ch|vh|vw|vmin|vmax|pt|pc|in|cm|mm|deg|rad|grad|turn|s|ms|fr|%)$/i;
const HEX_COLOR_RE = /^#[0-9a-f]{3,8}$/i;
const CSS_FUNC_RE = /^(rgba?|hsla?|var|url|linear-gradient|radial-gradient|calc|cubic-bezier)\(/i;
const KEBAB_IDENTIFIER_RE = /^[a-z][a-z0-9]*(-[a-z0-9]+)+$/;
const CAMEL_IDENTIFIER_RE = /^[a-z]+(?:[A-Z][a-z0-9]*)+$/;

/** True if `text` looks like translatable prose rather than a number, CSS value, URL, or bare identifier/class token. */
export function looksProse(text) {
	if (!text) { return false; }
	if (!LETTER_RUN_RE.test(text)) { return false; }
	if (URL_SCHEME_RE.test(text) || URL_PROTOCOL_RE.test(text)) { return false; }
	if (CSS_UNIT_VALUE_RE.test(text) || HEX_COLOR_RE.test(text) || CSS_FUNC_RE.test(text)) { return false; }
	if (KEBAB_IDENTIFIER_RE.test(text)) { return false; }
	if (CAMEL_IDENTIFIER_RE.test(text) && !text.includes(' ')) { return false; }
	return true;
}

/** Recursively collect files under `dir` matching `extensions`. */
function collectFiles(dir, extensions) {
	const results = [];
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			results.push(...collectFiles(full, extensions));
		} else if (extensions.some((ext) => entry.name.endsWith(ext)) && !entry.name.endsWith('.test.ts')) {
			results.push(full);
		}
	}
	return results;
}

/** Builds the dotted callee name (e.g. "l10n.t", "vscode.l10n.t") for a simple identifier/property-access chain, or null if it's not a simple chain (computed access, call result, etc). */
function getCalleeChainText(expr) {
	if (ts.isIdentifier(expr)) { return expr.text; }
	if (ts.isPropertyAccessExpression(expr)) {
		const left = getCalleeChainText(expr.expression);
		return left === null ? null : `${left}.${expr.name.text}`;
	}
	return null;
}

const LOCALIZATION_CALLS = new Set(['localize', 'localizeFormat', 't', 'l10n.t', 'vscode.l10n.t']);
export function isLocalizationCall(chain) {
	return chain !== null && LOCALIZATION_CALLS.has(chain);
}

const CONSOLE_CALL_RE = /^console\.(log|warn|error|info|debug|trace)$/;
export function isConsoleCall(chain) {
	return chain !== null && CONSOLE_CALL_RE.test(chain);
}

function unwrapParens(node) {
	let n = node;
	while (n && ts.isParenthesizedExpression(n)) { n = n.expression; }
	return n;
}

/** Extracts the static prose text of a string/template literal RHS, or null if it isn't one. */
function extractLiteralText(node) {
	const n = unwrapParens(node);
	if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) {
		return { text: n.text, node: n };
	}
	if (ts.isTemplateExpression(n)) {
		let text = n.head.text;
		for (const span of n.templateSpans) { text += span.literal.text; }
		return { text, node: n };
	}
	return null;
}

/** Splits a template literal into its raw static text chunks (skipping `${...}` holes), each tagged with its absolute source offset. */
function getTemplateChunks(node, sourceFile) {
	const raw = sourceFile.text;
	const chunks = [];
	function push(literalNode, prefixLen, suffixLen) {
		const start = literalNode.getStart(sourceFile);
		const end = literalNode.getEnd();
		chunks.push({ text: raw.slice(start + prefixLen, end - suffixLen), offset: start + prefixLen });
	}
	if (ts.isNoSubstitutionTemplateLiteral(node)) {
		push(node, 1, 1); // `...`
	} else if (ts.isTemplateExpression(node)) {
		push(node.head, 1, 2); // `...${
		for (const span of node.templateSpans) {
			if (ts.isTemplateTail(span.literal)) {
				push(span.literal, 1, 1); // }...`
			} else {
				push(span.literal, 1, 2); // }...${
			}
		}
	}
	return chunks;
}

/** True if the source line at `line` (1-based), or the line before it, carries an `i18n-exempt` comment. */
function isExemptByInlineComment(fileLines, line) {
	const current = fileLines[line - 1] || '';
	const previous = fileLines[line - 2] || '';
	return /i18n-exempt\b/i.test(current) || /i18n-exempt\b/i.test(previous);
}

function loadAllowlist() {
	if (!fs.existsSync(allowlistPath)) { return new Set(); }
	const data = JSON.parse(fs.readFileSync(allowlistPath, 'utf8'));
	const list = Array.isArray(data) ? data : (Array.isArray(data.allow) ? data.allow : []);
	return new Set(list);
}

/** Records a candidate violation at an absolute source offset, applying the looksProse filter and both escape hatches. */
function reportAt(rawText, offset, ctx, reason) {
	const trimmed = rawText.trim();
	if (!looksProse(trimmed)) { return; }
	if (ctx.allowlist.has(trimmed)) { return; }
	const line = ts.getLineAndCharacterOfPosition(ctx.sourceFile, offset).line + 1;
	if (isExemptByInlineComment(ctx.fileLines, line)) { return; }
	ctx.violations.push({ file: ctx.relFile, line, text: trimmed, reason });
}

function checkAssignmentTarget(propName, valueNode, ctx, reasonPrefix) {
	if (!propName || !TARGET_PROPS.has(propName)) { return; }
	const literal = extractLiteralText(valueNode);
	if (!literal) { return; }
	reportAt(literal.text, literal.node.getStart(ctx.sourceFile), ctx, `${reasonPrefix}${propName}`);
}

function scanChunkForAttributes(chunk, ctx) {
	ATTR_RE.lastIndex = 0;
	let m;
	while ((m = ATTR_RE.exec(chunk.text)) !== null) {
		const value = m[2];
		const valueOffsetInMatch = m[0].length - 1 - value.length;
		reportAt(value, chunk.offset + m.index + valueOffsetInMatch, ctx, 'HTML attribute (aria-label/title/placeholder)');
	}
}

function scanChunkForTagText(chunk, ctx) {
	TAG_TEXT_RE.lastIndex = 0;
	let m;
	while ((m = TAG_TEXT_RE.exec(chunk.text)) !== null) {
		const openTagEnd = m[0].indexOf('>') + 1;
		reportAt(m[2], chunk.offset + m.index + openTagEnd, ctx, `<${m[1].toLowerCase()}> text content`);
	}
}

function scanTemplateForHtml(node, ctx) {
	for (const chunk of getTemplateChunks(node, ctx.sourceFile)) {
		scanChunkForAttributes(chunk, ctx);
		scanChunkForTagText(chunk, ctx);
	}
}

function walk(node, ctx) {
	if (!node) { return; }

	if (ts.isCallExpression(node)) {
		const chain = getCalleeChainText(node.expression);
		if (isConsoleCall(chain) || isLocalizationCall(chain)) {
			return; // exempt: don't descend into console.*/localize()/t()/l10n.t() arguments
		}
	}

	if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken
		&& ts.isPropertyAccessExpression(node.left)) {
		checkAssignmentTarget(node.left.name.text, node.right, ctx, 'assignment to .');
	}

	if (ts.isPropertyAssignment(node) && ts.isIdentifier(node.name)) {
		checkAssignmentTarget(node.name.text, node.initializer, ctx, 'object literal property .');
	}

	if (ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateExpression(node)) {
		scanTemplateForHtml(node, ctx);
	}

	ts.forEachChild(node, (child) => walk(child, ctx));
}

/** Finds every `getXxxHtml`-style method/function body in `sourceFile` (used to scope extension.ts scanning). */
function findHtmlMethodBodies(sourceFile) {
	const bodies = [];
	function visit(node) {
		const isNamedMatch = (name) => name && ts.isIdentifier(name) && HTML_METHOD_NAME_RE.test(name.text);
		if ((ts.isMethodDeclaration(node) || ts.isFunctionDeclaration(node)) && isNamedMatch(node.name) && node.body) {
			bodies.push(node.body);
		} else if (ts.isPropertyDeclaration(node) && isNamedMatch(node.name) && node.initializer
			&& (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer))) {
			bodies.push(node.initializer.body);
		}
		ts.forEachChild(node, visit);
	}
	visit(sourceFile);
	return bodies;
}

export function scanFile(filePath, allowlist, violations, rootSelector) {
	const sourceText = fs.readFileSync(filePath, 'utf8');
	const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
	const ctx = {
		sourceFile,
		fileLines: sourceText.split('\n'),
		relFile: path.relative(repoRoot, filePath).replace(/\\/g, '/'),
		allowlist,
		violations
	};
	const roots = rootSelector ? rootSelector(sourceFile) : [sourceFile];
	for (const root of roots) { walk(root, ctx); }
}

function collectAllViolations() {
	const allowlist = loadAllowlist();
	const violations = [];

	for (const file of collectFiles(webviewDir, ['.ts'])) {
		scanFile(file, allowlist, violations);
	}
	scanFile(extensionTsPath, allowlist, violations, findHtmlMethodBodies);

	// De-duplicate exact (file, line, text) hits — the assignment-based and
	// HTML-template-based passes can both match the same literal.
	const seen = new Set();
	return violations.filter((v) => {
		const key = `${v.file}:${v.line}:${v.text}`;
		if (seen.has(key)) { return false; }
		seen.add(key);
		return true;
	});
}

export function hashLine(text) {
	return crypto.createHash('sha1').update(text).digest('hex').slice(0, 12);
}

/** The trimmed content of the source line a violation was found on — the baseline's stable key ingredient. */
function violationLineHash(violation) {
	const absPath = path.join(repoRoot, violation.file);
	const lines = fs.readFileSync(absPath, 'utf8').split('\n');
	return hashLine((lines[violation.line - 1] || '').trim());
}

function loadBaseline() {
	if (!fs.existsSync(baselinePath)) { return new Set(); }
	const data = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
	const entries = Array.isArray(data.violations) ? data.violations : [];
	return new Set(entries.map((e) => `${e.file}::${e.hash}`));
}

function writeBaseline(violations) {
	const entries = violations
		.map((v) => ({ file: v.file, line: v.line, hash: violationLineHash(v), sample: formatForDisplay(v.text).slice(0, 80) }))
		.sort((a, b) => (a.file === b.file ? a.line - b.line : a.file.localeCompare(b.file)));
	// One baseline row per distinct (file, hash) — matches the lookup key used at check time.
	const byKey = new Map();
	for (const e of entries) {
		const key = `${e.file}::${e.hash}`;
		if (!byKey.has(key)) { byKey.set(key, e); }
	}
	const payload = {
		'//': 'Generated by check-hardcoded-strings.mjs --update-baseline. Do not hand-edit; see the "Detecting Hardcoded Strings" section of .github/instructions/vscode-extension.instructions.md.',
		generatedAt: new Date().toISOString(),
		violations: [...byKey.values()]
	};
	fs.writeFileSync(baselinePath, `${JSON.stringify(payload, null, 2)}\n`);
	return byKey.size;
}

const inGitHubActions = process.env.GITHUB_ACTIONS === 'true';

function escapeData(value) {
	return String(value).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
}
function escapeProperty(value) {
	return escapeData(value).replace(/,/g, '%2C').replace(/:/g, '%3A');
}
/** Collapses embedded newlines/tabs and truncates a violation's text for single-line console/annotation output (the underlying `v.text` used for hashing/allowlisting is left untouched). */
function formatForDisplay(text) {
	const collapsed = text.replace(/\r\n|\r|\n/g, '\\n').replace(/\t/g, '\\t');
	return collapsed.length > 160 ? `${collapsed.slice(0, 160)}…` : collapsed;
}

function annotate(level, { file, line, message }) {
	if (!inGitHubActions) { return; }
	console.log(`::${level} file=${escapeProperty(file)},line=${line}::${escapeData(message)}`);
}

function main() {
	const updateBaseline = process.argv.includes('--update-baseline');

	console.log('🔍 Scanning webview UI code for hardcoded strings...\n');
	const violations = collectAllViolations();

	if (updateBaseline) {
		const count = writeBaseline(violations);
		console.log(`✅ Wrote ${count} baseline entr${count === 1 ? 'y' : 'ies'} to ${path.relative(extRoot, baselinePath)} (from ${violations.length} violation(s) found).\n`);
		process.exit(0);
	}

	const baseline = loadBaseline();
	const newViolations = [];
	const knownKeys = new Set();
	for (const v of violations) {
		const key = `${v.file}::${violationLineHash(v)}`;
		knownKeys.add(key);
		if (!baseline.has(key)) { newViolations.push(v); }
	}

	const staleCount = [...baseline].filter((k) => !knownKeys.has(k)).length;

	console.log(`Found ${violations.length} hardcoded-looking string(s) in scope (${violations.length - newViolations.length} already in baseline).`);
	if (staleCount > 0) {
		console.log(`ℹ️  ${staleCount} baseline entr${staleCount === 1 ? 'y is' : 'ies are'} stale (fixed since the baseline was generated) — run with --update-baseline to shrink it.`);
	}

	if (newViolations.length > 0) {
		console.error(`\n❌ ${newViolations.length} new hardcoded string(s) not covered by the baseline:`);
		for (const v of newViolations) {
			const displayText = formatForDisplay(v.text);
			console.error(`   - [${v.file}:${v.line}] ${v.reason}: "${displayText}"`);
			annotate('error', { file: v.file, line: v.line, message: `Hardcoded UI string (${v.reason}): "${displayText}". Route it through localize()/t() from src/l10n.ts, or add an "// i18n-exempt: <reason>" comment / an entry in scripts/hardcoded-strings-allowlist.json if it's intentionally not localized.` });
		}
		console.error('\nRun "npm run lint:hardcoded-strings -- --update-baseline" only if these are pre-existing and intentionally deferred — new UI code should be localized instead.\n');
		process.exit(1);
	}

	console.log('\n✅ No new hardcoded UI strings found.\n');
	process.exit(0);
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) { main(); }
