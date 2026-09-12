// What's New webview — the last few releases, written for a reader rather than a reviewer.
import { el, createButton } from '../shared/domUtils';
import { getNavButtons } from '../shared/buttonConfig';
import { wireExtensionPointButtons } from '../shared/extensionPoints';
// CSS imported as text via esbuild
import themeStyles from '../shared/theme.css';
import styles from './styles.css';
import { getWindowData } from '../../../../src/webview/shared/dataLoader';
import { initializeWebviewLocalization, setCurrentLanguage } from '../shared/localization';
import { registerMessageHandler } from '../shared/messageHandler';

/** One feature as the host projects it for rendering. Mirrors `WhatsNewFeature` plus view state. */
type WhatsNewViewFeature = {
	id: string;
	title: string;
	description: string;
	kind: 'view' | 'tab' | 'section';
	/** True when the user has not opened this feature's surface since upgrading into it. */
	isUnseen: boolean;
};

type WhatsNewViewRelease = {
	version: string;
	date: string | null;
	headline: string;
	features: WhatsNewViewFeature[];
	/** True for the version the user is running right now. */
	isCurrent: boolean;
};

type WhatsNewViewData = {
	currentVersion: string;
	releases: WhatsNewViewRelease[];
	backendConfigured?: boolean;
	localization?: Record<string, string>;
};

declare function acquireVsCodeApi<TState = unknown>(): {
	postMessage: (message: any) => void;
	setState: (newState: TState) => void;
	getState: () => TState | undefined;
};

type VSCodeApi = ReturnType<typeof acquireVsCodeApi>;

const vscode: VSCodeApi = acquireVsCodeApi();
const initialData = getWindowData<WhatsNewViewData>('__INITIAL_WHATSNEW__');

if (initialData?.localization) {
	initializeWebviewLocalization(initialData.localization);
	setCurrentLanguage(initialData.localization['__language__'] || 'en');
}

/** Badge text per feature kind — what the user is being pointed at. */
const KIND_LABEL: Record<WhatsNewViewFeature['kind'], string> = {
	view: 'New view',
	tab: 'New tab',
	section: 'New section',
};

/**
 * `2026-08-17` → `17 August 2026`. Built from the parts rather than
 * `new Date(...).toLocaleDateString()` on purpose: parsing a bare date string
 * lands on UTC midnight, which renders as the previous day for anyone west of
 * Greenwich.
 */
function formatReleaseDate(date: string | null): string {
	if (!date) { return 'Unreleased'; }
	const [year, month, day] = date.split('-').map((part) => Number.parseInt(part, 10));
	if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) { return date; }
	const formatted = new Date(year, month - 1, day);
	if (Number.isNaN(formatted.getTime())) { return date; }
	return formatted.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

function buildFeature(feature: WhatsNewViewFeature): HTMLElement {
	const card = el('div', 'feature-card');

	const heading = el('div', 'feature-heading');
	heading.append(el('span', 'feature-title', feature.title));
	heading.append(el('span', 'feature-kind', KIND_LABEL[feature.kind] ?? 'New'));
	if (feature.isUnseen) {
		heading.append(el('span', 'feature-unseen', 'Not opened yet'));
	}
	card.append(heading);

	card.append(el('div', 'feature-description', feature.description));

	const open = createButton(`open-${feature.id}`, 'Take me there', 'secondary');
	open.addEventListener('click', () => {
		vscode.postMessage({ command: 'openWhatsNewFeature', featureId: feature.id });
	});
	const actions = el('div', 'feature-actions');
	actions.append(open);
	card.append(actions);

	return card;
}

function buildRelease(release: WhatsNewViewRelease): HTMLElement {
	const section = el('div', 'release');

	const header = el('div', 'release-header');
	header.append(el('span', 'release-version', `Version ${release.version}`));
	header.append(el('span', 'release-date', formatReleaseDate(release.date)));
	if (release.isCurrent) {
		header.append(el('span', 'release-current', 'You are here'));
	}
	section.append(header);

	section.append(el('p', 'release-headline', release.headline));

	if (release.features.length === 0) {
		// A release with nothing user-visible still gets a line: an unexplained gap
		// in the version list reads as a bug in this view.
		section.append(el('div', 'release-empty', 'Fixes and maintenance only — nothing new to go and look at.'));
	} else {
		const list = el('div', 'feature-list');
		release.features.forEach((feature) => list.append(buildFeature(feature)));
		section.append(list);
	}

	return section;
}

function render(data: WhatsNewViewData): void {
	const root = document.getElementById('root');
	if (!root) { return; }
	root.replaceChildren();

	const themeStyle = document.createElement('style');
	themeStyle.textContent = themeStyles;
	const style = document.createElement('style');
	style.textContent = styles;

	const container = el('div', 'container');

	const header = el('div', 'header');
	header.append(el('div', 'title', "📣 What's New"));
	const buttonRow = el('div', 'button-row');
	buttonRow.append(...getNavButtons(null, !!data.backendConfigured).map((config) => createButton(config)));
	header.append(buttonRow);
	container.append(header);

	container.append(
		el(
			'div',
			'intro',
			`The last ${data.releases.length} release${data.releases.length === 1 ? '' : 's'}, in plain English. ` +
			'The extension points out at most one new thing a day, and only until you have opened it — this page is the full list whenever you want it.',
		),
	);

	const releases = el('div', 'releases');
	data.releases.forEach((release) => releases.append(buildRelease(release)));
	container.append(releases);

	container.append(
		el('div', 'footer', `Running version ${data.currentVersion}. The full changelog, including fixes, ships with the extension.`),
	);

	root.append(themeStyle, style, container);

	wireButtons();
}

function wireButtons(): void {
	document.getElementById('btn-refresh')?.addEventListener('click', () => vscode.postMessage({ command: 'refresh' }));
	document.getElementById('btn-details')?.addEventListener('click', () => vscode.postMessage({ command: 'showDetails' }));
	document.getElementById('btn-chart')?.addEventListener('click', () => vscode.postMessage({ command: 'showChart' }));
	document.getElementById('btn-usage')?.addEventListener('click', () => vscode.postMessage({ command: 'showUsageAnalysis' }));
	document.getElementById('btn-diagnostics')?.addEventListener('click', () => vscode.postMessage({ command: 'showDiagnostics' }));
	document.getElementById('btn-maturity')?.addEventListener('click', () => vscode.postMessage({ command: 'showMaturity' }));
	document.getElementById('btn-dashboard')?.addEventListener('click', () => vscode.postMessage({ command: 'showDashboard' }));
	document.getElementById('btn-efficiency')?.addEventListener('click', () => vscode.postMessage({ command: 'showEfficiency' }));
	document.getElementById('btn-environmental')?.addEventListener('click', () => vscode.postMessage({ command: 'showEnvironmental' }));
	wireExtensionPointButtons(vscode);
}

registerMessageHandler<{ command: string; data?: WhatsNewViewData }>((message) => {
	if (message.command === 'updateWhatsNew' && message.data) {
		render(message.data);
	}
});

async function bootstrap(): Promise<void> {
	await import('@vscode-elements/elements/dist/vscode-button/index.js');

	if (initialData) {
		render(initialData);
		return;
	}
	const root = document.getElementById('root');
	if (root) {
		root.textContent = '';
		const fallback = document.createElement('div');
		fallback.style.padding = '16px';
		fallback.textContent = 'No release information available.';
		root.append(fallback);
	}
}

void bootstrap();
