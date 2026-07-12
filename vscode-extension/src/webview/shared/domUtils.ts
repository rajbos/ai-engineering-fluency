import type { ButtonConfig } from './buttonConfig';

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
	} else {
		// New signature: createButton(config)
		const config = configOrId;
		button.id = config.id;
		if (config.icon) {
			// Build icon + label as DOM nodes (not textContent) so the codicon span actually renders.
			const iconSpan = document.createElement('span');
			iconSpan.className = `codicon codicon-${config.icon}`;
			button.append(iconSpan, document.createTextNode(` ${config.label}`));
		} else {
			button.textContent = config.label;
		}
		if (config.appearance) { button.setAttribute('appearance', config.appearance); }
		if (config.hidden) { button.hidden = true; }
		if (config.active) {
			button.classList.add('nav-active');
			button.setAttribute('disabled', '');
			button.setAttribute('aria-current', 'page');
		}
	}

	return button;
}
