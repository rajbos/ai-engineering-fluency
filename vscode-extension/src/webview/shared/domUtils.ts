import type { ButtonConfig } from './buttonConfig';

/**
 * Sanctioned escape hatch for writing HTML markup into the DOM in webview code.
 *
 * TRUST CONTRACT: this function performs NO sanitization itself. Every caller is responsible
 * for ensuring `html` has already had all untrusted values run through `escapeHtml()` /
 * `escapeAttr()` (from `formatUtils`) before being interpolated — session titles, tool names,
 * model names, file paths, and any other value ultimately sourced from AI-agent session log
 * files are attacker-influenceable (a malicious repo or a prompt-injected agent can shape them)
 * and must never reach here unescaped.
 *
 * This wrapper exists so that direct `.innerHTML =` / `.outerHTML =` assignment,
 * `insertAdjacentHTML()`, and `document.write()` can be banned repo-wide by the
 * `no-restricted-syntax` ESLint rule in `eslint.config.mjs`, funnelling every markup write in
 * the webviews through this single audited call site. No-ops if `el` is missing so existing
 * `if (el) { el.innerHTML = ...; }` guards can migrate to `setHtml(el, ...)` unchanged.
 */
export function setHtml(el: Element | null | undefined, html: string): void {
	if (!el) {
		return;
	}
	// eslint-disable-next-line no-restricted-syntax -- sanctioned wrapper; see trust contract in the doc comment above.
	el.innerHTML = html;
}

/**
 * Creates an HTML element with optional className and textContent.
 */
export function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
	const node = document.createElement(tag);
	if (className) { node.className = className; }
	if (text !== undefined) { node.textContent = text; }
	return node;
}

/**
 * Creates a heading element (e.g. 'h3') prefixed with a codicon icon, e.g. `<h3><span class="codicon codicon-graph"></span> Key Metrics</h3>`.
 * Uses DOM nodes rather than textContent so the icon span actually renders instead of showing as literal text.
 */
export function iconHeading<K extends keyof HTMLElementTagNameMap>(tag: K, icon: string, text: string, className?: string): HTMLElementTagNameMap[K] {
	const node = document.createElement(tag);
	if (className) { node.className = className; }
	const iconSpan = document.createElement('span');
	iconSpan.className = `codicon codicon-${icon}`;
	node.append(iconSpan, document.createTextNode(` ${text}`));
	return node;
}

/** Builds the `<span class="codicon codicon-<icon> nav-icon">` used by both createButton and buttonHtml's DOM path. */
function buildNavIconSpan(icon: string, iconColor: string | undefined): HTMLSpanElement {
	const iconSpan = document.createElement('span');
	iconSpan.className = `codicon codicon-${icon} nav-icon`;
	if (iconColor) { iconSpan.style.setProperty('--icon-accent', iconColor); }
	return iconSpan;
}

/** Applies the appearance/hidden/active attributes shared by both createButton call shapes. */
function applyButtonConfigAttributes(button: HTMLElement, config: ButtonConfig): void {
	if (config.appearance) { button.setAttribute('appearance', config.appearance); }
	if (config.hidden) { button.hidden = true; }
	if (config.active) {
		button.classList.add('nav-active');
		button.setAttribute('disabled', '');
		button.setAttribute('aria-current', 'page');
	}
}

/**
 * Creates a vscode-button element with the specified attributes.
 * Accepts either individual parameters or a ButtonConfig object.
 */
export function createButton(config: ButtonConfig): HTMLElement;
export function createButton(id: string, label: string, appearance?: 'primary' | 'secondary'): HTMLElement;
export function createButton(configOrId: ButtonConfig | string, label?: string, appearance?: 'primary' | 'secondary'): HTMLElement {
	const button = document.createElement('vscode-button');

	if (typeof configOrId === 'string') {
		// Legacy signature: createButton(id, label, appearance)
		button.id = configOrId;
		button.textContent = label || '';
		if (appearance) { button.setAttribute('appearance', appearance); }
		return button;
	}

	// New signature: createButton(config)
	const config = configOrId;
	button.id = config.id;
	if (config.icon) {
		// Build icon + label as DOM nodes (not textContent) so the codicon span actually renders.
		// No manual space here: vscode-button's own ::slotted(*) rule already adds a margin
		// after the icon span, so a literal space on top of that doubles the gap.
		button.append(buildNavIconSpan(config.icon, config.iconColor), document.createTextNode(config.label));
	} else {
		button.textContent = config.label;
	}
	applyButtonConfigAttributes(button, config);
	return button;
}
