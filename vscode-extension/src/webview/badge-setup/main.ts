// Badge setup webview
import { buttonHtml, getNavButtons } from '../shared/buttonConfig';
import { setHtml } from '../shared/domUtils';
import { escapeHtml, formatAbsoluteDate, formatNumber } from '../shared/formatUtils';
import { localize, localizeFormat } from '../shared/localization';
import { registerMessageHandler } from '../shared/messageHandler';
import themeStyles from '../shared/theme.css';
import dataTableStyles from '../shared/dataTable.css';
import styles from './styles.css';
import { getWindowData } from '../../../../src/webview/shared/dataLoader';
import { normalizeBadgeTheme, normalizeBadgeThemeSource, normalizeHexColor, resolveBadgeTheme, type BadgeTheme, type BadgeThemeKey, type BadgeThemeSource } from '../../../../src/badgePayload';
import type { BadgeHostMessage, BadgeInstallResult, BadgeLastSync, BadgeLinkId, BadgeSetupData, BadgeSyncResult } from '../../badge/badgeSetupTypes';
import { applyWebviewLocale } from '../shared/webviewLocale';

declare function acquireVsCodeApi<TState = unknown>(): {
	postMessage: (message: unknown) => void;
	setState: (newState: TState) => void;
	getState: () => TState | undefined;
};

const vscode = acquireVsCodeApi();
const initialData = getWindowData<BadgeSetupData>('__INITIAL_BADGE_SETUP_DATA__');
applyWebviewLocale(initialData);

/** The VS Code theme variable each badge colour role is read from. */
const THEME_VARIABLES: Record<BadgeThemeKey, string> = {
	accent: '--vscode-focusBorder',
	link: '--vscode-textLink-foreground',
	good: '--vscode-charts-green',
	warn: '--vscode-charts-orange',
};

const THEME_LABEL_KEYS: Record<BadgeThemeKey, string> = {
	accent: 'badge.theme.accent',
	link: 'badge.theme.link',
	good: 'badge.theme.good',
	warn: 'badge.theme.warn',
};

const THEME_SOURCE_LABEL_KEYS: Record<BadgeThemeSource, string> = {
	universe: 'badge.theme.source.universe',
	editor: 'badge.theme.source.editor',
};

const LINK_LABEL_KEYS: Record<BadgeLinkId, string> = {
	badgerHome: 'badge.link.badgerHome',
	tufty: 'badge.link.tufty',
	badgeware: 'badge.link.badgeware',
	badgewareDocs: 'badge.link.badgewareDocs',
};

const NAV_COMMANDS: Record<string, string> = {
	'btn-details': 'showDetails',
	'btn-chart': 'showChart',
	'btn-usage': 'showUsageAnalysis',
	'btn-maturity': 'showMaturity',
	'btn-efficiency': 'showEfficiency',
	'btn-environmental': 'showEnvironmental',
	'btn-diagnostics': 'showDiagnostics',
	'btn-dashboard': 'showDashboard',
	'btn-refresh': 'refresh',
};

let lastSync: BadgeLastSync | undefined = initialData?.lastSync;
/** The editor theme colours, probed live and cached by the host. */
let theme: BadgeTheme = initialData?.theme ?? {};
let themeSource: BadgeThemeSource = normalizeBadgeThemeSource(initialData?.themeSource);
/** Sync needs the app on the badge, so it stays disabled until an install (or an earlier sync) is known. */
let appInstalled = initialData?.appInstalled === true || !!initialData?.lastSync;
let statusMessage = '';
let installMessage = '';
let syncing = false;

function readThemeFromCss(): BadgeTheme {
	const computed = getComputedStyle(document.documentElement);
	const raw: Record<string, string> = {};
	for (const key of Object.keys(THEME_VARIABLES) as BadgeThemeKey[]) {
		raw[key] = computed.getPropertyValue(THEME_VARIABLES[key]);
	}
	return normalizeBadgeTheme(raw);
}

function sameTheme(a: BadgeTheme, b: BadgeTheme): boolean {
	return (Object.keys(THEME_VARIABLES) as BadgeThemeKey[]).every((key) => a[key] === b[key]);
}

/** Posts the live theme colours to the host (which caches them) and redraws the swatches. */
function probeTheme(): void {
	const probed = readThemeFromCss();
	// No theme variables (a headless render) keeps what the host cached.
	if (Object.keys(probed).length === 0 || sameTheme(probed, theme)) { return; }
	theme = probed;
	vscode.postMessage({ command: 'badgeTheme', theme });
	redrawSwatches();
}

function redrawSwatches(): void {
	const strip = document.getElementById('badge-theme-strip');
	if (strip) { setHtml(strip, themeSwatchesHtml()); }
}

function syncResultText(result: BadgeSyncResult): string {
	switch (result.status) {
		case 'ok': return localizeFormat('badge.sync.ok', formatNumber(result.bytes), result.port);
		case 'mpremoteMissing': return localize('badge.sync.mpremoteMissing');
		case 'noBadge': return localize('badge.sync.noBadge');
		case 'cancelled': return localize('badge.sync.cancelled');
		case 'failed': return localizeFormat('badge.sync.failed', result.message);
	}
}

function installResultText(result: BadgeInstallResult): string {
	switch (result.status) {
		case 'copied': return localizeFormat('badge.install.copied', result.target);
		case 'noDrive': return localize('badge.install.noDrive');
		case 'unavailable': return localize('badge.install.unavailable');
		case 'failed': return localizeFormat('badge.install.failed', result.message);
	}
}

/** The swatches show the colours a sync sends, so they follow the chosen palette. */
function themeSwatchesHtml(): string {
	const shown = resolveBadgeTheme(themeSource, theme);
	return (Object.keys(THEME_VARIABLES) as BadgeThemeKey[]).map((key) => {
		const colour = normalizeHexColor(shown[key]);
		const swatch = colour
			? `<span class="swatch" style="background:${colour}"></span>`
			: '<span class="swatch swatch-empty"></span>';
		return `<div class="swatch-item">${swatch}<span class="swatch-label">${escapeHtml(localize(THEME_LABEL_KEYS[key]))}</span><span class="swatch-value">${escapeHtml(colour ?? '–')}</span></div>`;
	}).join('');
}

function themeSourceHtml(): string {
	const options = (Object.keys(THEME_SOURCE_LABEL_KEYS) as BadgeThemeSource[]).map((source) => `
		<label class="theme-source-option">
			<input type="radio" name="badge-theme-source" value="${source}"${source === themeSource ? ' checked' : ''} />
			${escapeHtml(localize(THEME_SOURCE_LABEL_KEYS[source]))}
		</label>`).join('');
	return `<fieldset id="badge-theme-source" class="theme-source"><legend>${escapeHtml(localize('badge.theme.source.label'))}</legend>${options}</fieldset>`;
}

function statusLineHtml(): string {
	if (!lastSync) { return escapeHtml(localize('badge.status.never')); }
	return escapeHtml(localizeFormat('badge.status.last', formatAbsoluteDate(lastSync.at), formatNumber(lastSync.bytes), lastSync.port));
}

function linksHtml(): string {
	return (initialData?.links ?? []).map((id) =>
		`<li><a href="#" class="badge-link" data-link="${escapeHtml(id)}">${escapeHtml(localize(LINK_LABEL_KEYS[id]))}</a></li>`,
	).join('');
}

function layoutHtml(): string {
	const navButtons = getNavButtons(null, false).map(buttonHtml).join('');
	return `
		<style>${themeStyles}</style><style>${dataTableStyles}</style>
		<style>${styles}</style>
		<div class="container">
			<div class="header">
				<div class="header-left">
					<span class="header-icon">🎫</span>
					<span class="header-title">${escapeHtml(localize('badge.title'))}</span>
				</div>
				<div class="button-row">${navButtons}</div>
			</div>

			${initialData?.imageUri ? `<img class="badge-photo" src="${escapeHtml(initialData.imageUri)}" alt="${escapeHtml(localize('badge.image.alt'))}" />` : ''}
			<p class="intro">${escapeHtml(localize('badge.intro'))}</p>

			<section class="card">
				<h3>${escapeHtml(localize('badge.install.title'))}</h3>
				<ol class="steps">
					<li>${escapeHtml(localize('badge.install.step1'))}</li>
					<li>${escapeHtml(localize('badge.install.step2'))}</li>
					<li>${escapeHtml(localize('badge.install.step3'))}</li>
				</ol>
				<div class="actions">
					<vscode-button id="btn-badge-install"${appInstalled ? ' appearance="secondary"' : ''}>${escapeHtml(localize('badge.action.install'))}</vscode-button>
					${appInstalled ? '' : `<vscode-button id="btn-badge-skip-install" appearance="secondary">${escapeHtml(localize('badge.action.skipInstall'))}</vscode-button>`}
				</div>
				<p id="badge-install-message" class="message" role="status">${escapeHtml(installMessage)}</p>
			</section>

			<section class="card">
				<h3>${escapeHtml(localize('badge.status.title'))}</h3>
				<p id="badge-status-line">${statusLineHtml()}</p>
				<div class="actions">
					<vscode-button id="btn-badge-sync"${syncing || !appInstalled ? ' disabled' : ''}>${escapeHtml(localize('badge.action.syncUsb'))}</vscode-button>
				</div>
				${appInstalled ? '' : `<p class="message">${escapeHtml(localize('badge.sync.needsInstall'))}</p>`}
				<p id="badge-sync-message" class="message" role="status">${escapeHtml(statusMessage)}</p>
			</section>

			<section class="card">
				<h3>${escapeHtml(localize('badge.theme.title'))}</h3>
				<p>${escapeHtml(localize('badge.theme.description'))}</p>
				${themeSourceHtml()}
				<div id="badge-theme-strip" class="swatch-strip">${themeSwatchesHtml()}</div>
			</section>

			<section class="card">
				<h3>${escapeHtml(localize('badge.links.title'))}</h3>
				<ul class="links">${linksHtml()}</ul>
			</section>

			<p class="privacy">${escapeHtml(localize('badge.privacy'))}</p>
			<p><vscode-button id="btn-badge-hide" appearance="secondary">${escapeHtml(localize('badge.action.hide'))}</vscode-button></p>
		</div>
	`;
}

function wire(): void {
	for (const [id, command] of Object.entries(NAV_COMMANDS)) {
		document.getElementById(id)?.addEventListener('click', () => { vscode.postMessage({ command }); });
	}
	document.getElementById('btn-badge-sync')?.addEventListener('click', () => {
		syncing = true;
		statusMessage = localize('badge.sync.running');
		render();
		vscode.postMessage({ command: 'badgeSyncUsb' });
	});
	document.getElementById('btn-badge-install')?.addEventListener('click', () => {
		installMessage = '';
		vscode.postMessage({ command: 'badgeInstallApp' });
	});
	document.getElementById('btn-badge-skip-install')?.addEventListener('click', () => {
		appInstalled = true;
		vscode.postMessage({ command: 'badgeMarkInstalled' });
		render();
	});
	document.querySelectorAll<HTMLInputElement>('input[name="badge-theme-source"]').forEach((input) => {
		input.addEventListener('change', () => {
			if (!input.checked) { return; }
			themeSource = normalizeBadgeThemeSource(input.value);
			vscode.postMessage({ command: 'badgeThemeSource', source: themeSource });
			redrawSwatches();
		});
	});
	document.getElementById('btn-badge-hide')?.addEventListener('click', () => {
		vscode.postMessage({ command: 'badgeHideButton' });
	});
	document.querySelectorAll<HTMLAnchorElement>('.badge-link').forEach((link) => {
		link.addEventListener('click', (event) => {
			event.preventDefault();
			vscode.postMessage({ command: 'badgeOpenLink', id: link.dataset.link });
		});
	});
}

function render(): void {
	const root = document.getElementById('root');
	if (!root) { return; }
	setHtml(root, layoutHtml());
	wire();
}

function onHostMessage(message: BadgeHostMessage): void {
	if (message?.command === 'badgeSyncResult') {
		syncing = false;
		statusMessage = syncResultText(message.result);
		if (message.result.status === 'ok') {
			lastSync = { at: message.result.at, bytes: message.result.bytes, port: message.result.port };
		}
		render();
	} else if (message?.command === 'badgeInstallResult') {
		installMessage = installResultText(message.result);
		if (message.result.status === 'copied') { appInstalled = true; }
		render();
	}
}

async function bootstrap(): Promise<void> {
	await import('@vscode-elements/elements/dist/vscode-button/index.js');
	render();
	registerMessageHandler<BadgeHostMessage>(onHostMessage);

	// Theme colours are only visible from inside a webview, so it reports them to the host.
	probeTheme();
	const observer = new MutationObserver(probeTheme);
	observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
	observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
}

void bootstrap();
