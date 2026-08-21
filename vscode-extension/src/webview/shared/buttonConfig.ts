/**
 * Centralized button configuration for webview navigation.
 * This ensures consistent button IDs, labels, and icons across all webviews.
 */

import { localize } from './localization';

export type ButtonId = 'btn-refresh' | 'btn-details' | 'btn-chart' | 'btn-usage' | 'btn-diagnostics' | 'btn-maturity' | 'btn-dashboard' | 'btn-level-viewer' | 'btn-environmental' | 'btn-efficiency';

export interface ButtonConfig {
	id: ButtonId;
	label: string;
	/** Codicon name (without the `codicon-` prefix), rendered as a `<span class="codicon codicon-<icon>">` before the label. */
	icon?: string;
	/**
	 * Accent color for the icon glyph only (label text stays the theme's normal button color).
	 * Applied via a CSS custom property so high-contrast themes can override it back to
	 * `currentColor` — see `.nav-icon` in theme.css.
	 */
	iconColor?: string;
	appearance?: 'primary' | 'secondary';
	/** When true, the button is not rendered in the UI (code is preserved for re-enabling later). */
	hidden?: boolean;
	/** When true, the button represents the currently open view and is rendered in a distinct, non-clickable state. */
	active?: boolean;
}

/**
 * Navigation button definitions used across all webview panels.
 * Every button besides Refresh renders as `appearance: 'secondary'` (outlined) so the row
 * doesn't read as a wall of identical solid pills; the active view is still picked out via
 * the `.nav-active` treatment in theme.css regardless of this base appearance.
 */
export const BUTTONS: Record<ButtonId, ButtonConfig> = {
	'btn-refresh': {
		id: 'btn-refresh',
		label: localize('nav.btnRefresh'),
		icon: 'refresh',
		appearance: 'primary'
	},
	'btn-details': {
		id: 'btn-details',
		label: localize('nav.btnDetails'),
		icon: 'robot',
		iconColor: '#c37bff',
		appearance: 'secondary'
	},
	'btn-chart': {
		id: 'btn-chart',
		label: localize('nav.btnChart'),
		icon: 'graph-line',
		iconColor: '#60a5fa',
		appearance: 'secondary'
	},
	'btn-usage': {
		id: 'btn-usage',
		label: localize('nav.btnUsage'),
		icon: 'graph',
		iconColor: '#22d3ee',
		appearance: 'secondary'
	},
	'btn-diagnostics': {
		id: 'btn-diagnostics',
		label: localize('nav.btnDiagnostics'),
		icon: 'search',
		iconColor: '#fb7185',
		appearance: 'secondary'
	},
	'btn-maturity': {
		id: 'btn-maturity',
		label: localize('nav.btnMaturity'),
		icon: 'target',
		iconColor: '#fbbf24',
		appearance: 'secondary'
	},
	'btn-dashboard': {
		id: 'btn-dashboard',
		label: localize('nav.btnDashboard'),
		icon: 'organization',
		iconColor: '#818cf8',
		appearance: 'secondary'
  },
	'btn-level-viewer': {
		id: 'btn-level-viewer',
		label: localize('nav.btnLevelViewer'),
		icon: 'list-tree',
		iconColor: '#94a3b8',
		appearance: 'secondary'
	},
	'btn-environmental': {
		id: 'btn-environmental',
		label: localize('nav.btnEnvironmental'),
		icon: 'globe',
		iconColor: '#4ade80',
		appearance: 'secondary'
	},
	'btn-efficiency': {
		id: 'btn-efficiency',
		label: localize('nav.btnEfficiency'),
		icon: 'dashboard',
		iconColor: '#f472b6',
		appearance: 'secondary'
	}
};

/**
 * Helper function to get button configuration by ID.
 */
export function getButton(id: ButtonId): ButtonConfig {
	return BUTTONS[id];
}

/**
 * Canonical order of the shared navigation button row rendered by every webview panel.
 */
const NAV_ORDER: ButtonId[] = [
	'btn-refresh',
	'btn-details',
	'btn-chart',
	'btn-usage',
	'btn-maturity',
	'btn-efficiency',
	'btn-environmental',
	'btn-diagnostics',
	'btn-dashboard'
];

/**
 * Returns the full navigation button row in the canonical order.
 * The button matching `activeView` is marked active so it renders in a
 * visually distinct, non-clickable state (the nav reads as a tab strip).
 * The Team Dashboard button is only included when a backend is configured.
 */
export function getNavButtons(activeView: ButtonId | null, backendConfigured: boolean): ButtonConfig[] {
	return NAV_ORDER
		.filter(id => id !== 'btn-dashboard' || backendConfigured)
		.map(id => ({ ...BUTTONS[id], active: id === activeView }));
}

/**
 * Generates an HTML string for a vscode-button element from a button config
 * (or a button ID). Useful for template strings where DOM manipulation isn't available.
 */
export function buttonHtml(idOrConfig: ButtonId | ButtonConfig): string {
	const config = typeof idOrConfig === 'string' ? BUTTONS[idOrConfig] : idOrConfig;
	if (config.hidden) { return ''; }
	const appearance = config.appearance ? ` appearance="${config.appearance}"` : '';
	const active = config.active ? ' class="nav-active" disabled aria-current="page"' : '';
	const iconStyle = config.iconColor ? ` style="--icon-accent:${config.iconColor}"` : '';
	// No trailing space after the icon span: vscode-button's own ::slotted(*) rule already
	// adds a margin after it, so a literal space on top of that doubles the gap.
	const icon = config.icon ? `<span class="codicon codicon-${config.icon} nav-icon"${iconStyle}></span>` : '';
	return `<vscode-button id="${config.id}"${appearance}${active}>${icon}${config.label}</vscode-button>`;
}

/**
 * Generates the HTML for the full shared navigation button row.
 * String-template counterpart of `getNavButtons` + `createButton`.
 */
export function navButtonsHtml(activeView: ButtonId | null, backendConfigured: boolean): string {
	return getNavButtons(activeView, backendConfigured).map(config => buttonHtml(config)).join('\n');
}
