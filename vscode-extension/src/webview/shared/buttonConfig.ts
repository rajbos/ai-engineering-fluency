/**
 * Centralized button configuration for webview navigation.
 * This ensures consistent button IDs, labels, and icons across all webviews.
 */

export type ButtonId = 'btn-refresh' | 'btn-details' | 'btn-chart' | 'btn-usage' | 'btn-diagnostics' | 'btn-maturity' | 'btn-dashboard' | 'btn-level-viewer' | 'btn-environmental';

export interface ButtonConfig {
	id: ButtonId;
	label: string;
	appearance?: 'primary' | 'secondary';
	/** When true, the button is not rendered in the UI (code is preserved for re-enabling later). */
	hidden?: boolean;
	/** When true, the button represents the currently open view and is rendered in a distinct, non-clickable state. */
	active?: boolean;
}

/**
 * Navigation button definitions used across all webview panels.
 */
export const BUTTONS: Record<ButtonId, ButtonConfig> = {
	'btn-refresh': {
		id: 'btn-refresh',
		label: '🔄 Refresh',
		appearance: 'primary'
	},
	'btn-details': {
		id: 'btn-details',
		label: '🤖 Details'
	},
	'btn-chart': {
		id: 'btn-chart',
		label: '📈 Chart'
	},
	'btn-usage': {
		id: 'btn-usage',
		label: '📊 Usage Analysis'
	},
	'btn-diagnostics': {
		id: 'btn-diagnostics',
		label: '🔍 Diagnostics'
	},
	'btn-maturity': {
		id: 'btn-maturity',
		label: '🎯 Fluency Score'
	},
	'btn-dashboard': {
		id: 'btn-dashboard',
		label: '📊 Team Dashboard'
  },  
	'btn-level-viewer': {
		id: 'btn-level-viewer',
		label: '🔍 Level Viewer'
	},
	'btn-environmental': {
		id: 'btn-environmental',
		label: '🌿 Environmental Impact'
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
	return `<vscode-button id="${config.id}"${appearance}${active}>${config.label}</vscode-button>`;
}

/**
 * Generates the HTML for the full shared navigation button row.
 * String-template counterpart of `getNavButtons` + `createButton`.
 */
export function navButtonsHtml(activeView: ButtonId | null, backendConfigured: boolean): string {
	return getNavButtons(activeView, backendConfigured).map(config => buttonHtml(config)).join('\n');
}
