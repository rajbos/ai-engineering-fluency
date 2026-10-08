/**
 * Host-driven "take me to this section" navigation, shared by every panel that
 * has no navigation protocol of its own (the usage panel has `switchTab`).
 *
 * The host posts `{ command: 'revealSurface', tab?, subtab?, anchor?, selector? }`.
 * The panel then does what a user would: clicks the tab's group button (when the
 * tab sits in a grouped leaf bar), clicks the tab, clicks the sub-tab, and
 * scrolls the section into view. Clicking rather than flipping classes is
 * deliberate — a tab's click handler is where lazy loaders and the
 * `viewTabOpened` bookkeeping live, so a programmatic switch that skipped it
 * would land on an empty tab.
 *
 * A freshly created panel cannot receive the request before its script has run,
 * so {@link installSurfaceNavigation} reports `surfaceNavReady` once the listener
 * is in place and the host replays anything it was holding for that view.
 */
import { registerMessageHandler } from './messageHandler';

export type SurfaceRevealRequest = {
	command: 'revealSurface';
	/** `data-tab` value of the tab to open. */
	tab?: string;
	/** `data-subtab` value of a sub-tab inside that tab. */
	subtab?: string;
	/** Element id to scroll to. Preferred over `selector`. */
	anchor?: string;
	/** CSS selector to scroll to, for sections that have no id. First match wins. */
	selector?: string;
};

// Method syntax on purpose: parameters stay bivariant, so a panel whose API takes its own message union still fits.
type PostMessageApi = { postMessage(message: unknown): void };

/** The tab-button classes the panels use. A `data-tab` on anything else (e.g. a panel) is not a button. */
const TAB_BUTTON_SELECTORS = ['.tab-button', '.tab', '.eff-tab', '.tab-btn', '.wn-tab'];

/** How long to wait for a tab or section to appear: panels render after their data arrives. */
const WAIT_TIMEOUT_MS = 15000;
const POLL_INTERVAL_MS = 100;

function cssString(value: string): string {
	return typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
		? CSS.escape(value)
		: value.replace(/["\\]/g, '\\$&');
}

/** Resolves with the first element `find` returns, polling until it appears or the timeout passes. */
export function waitForElement<T extends Element>(find: () => T | null, timeoutMs = WAIT_TIMEOUT_MS): Promise<T | null> {
	const first = find();
	if (first) { return Promise.resolve(first); }
	return new Promise((resolve) => {
		const started = Date.now();
		const timer = setInterval(() => {
			const found = find();
			if (found || Date.now() - started >= timeoutMs) {
				clearInterval(timer);
				resolve(found);
			}
		}, POLL_INTERVAL_MS);
	});
}

function findTabButton(tab: string): HTMLElement | null {
	const value = cssString(tab);
	const selector = TAB_BUTTON_SELECTORS.map((cls) => `${cls}[data-tab="${value}"]`).join(', ');
	return document.querySelector<HTMLElement>(selector);
}

/**
 * Grouped panels (usage, diagnostics) hide every leaf bar but the active
 * group's. Open the group the tab lives in first, so the user sees the tab bar
 * they landed on.
 */
function openGroupOf(tabButton: HTMLElement): void {
	const group = tabButton.closest<HTMLElement>('[data-group]')?.dataset.group;
	if (!group || tabButton.classList.contains('group-tab')) { return; }
	const groupButton = document.querySelector<HTMLElement>(`.group-tab[data-group="${cssString(group)}"]`);
	if (groupButton && !groupButton.classList.contains('active')) { groupButton.click(); }
}

/** In-flight flashes: the inline styles to restore, and the timer that restores them. */
const activeFlashes = new WeakMap<HTMLElement, { boxShadow: string; transition: string; timer: ReturnType<typeof setTimeout> }>();

/**
 * Briefly outlines the section that was scrolled to, so the eye finds it. A
 * second flash on the same element restarts the timer but keeps the styles
 * captured by the first, so the outline can never become the "original".
 */
export function flashSection(target: HTMLElement): void {
	const inFlight = activeFlashes.get(target);
	if (inFlight) { clearTimeout(inFlight.timer); }
	const original = inFlight ?? { boxShadow: target.style.boxShadow, transition: target.style.transition };
	target.style.transition = 'box-shadow 0.3s ease';
	target.style.boxShadow = '0 0 0 2px var(--vscode-focusBorder, #3794ff)';
	const timer = setTimeout(() => {
		target.style.boxShadow = original.boxShadow;
		target.style.transition = original.transition;
		activeFlashes.delete(target);
	}, 2000);
	activeFlashes.set(target, { boxShadow: original.boxShadow, transition: original.transition, timer });
}

export async function revealSurface(request: SurfaceRevealRequest): Promise<void> {
	if (request.tab) {
		const tabButton = await waitForElement(() => findTabButton(request.tab as string));
		if (tabButton) {
			openGroupOf(tabButton);
			tabButton.click();
		}
	}
	if (request.subtab) {
		const subtab = await waitForElement(() =>
			document.querySelector<HTMLElement>(`.subtab[data-subtab="${cssString(request.subtab as string)}"]`));
		subtab?.click();
	}
	const find = request.anchor
		? () => document.getElementById(request.anchor as string)
		: request.selector
			? () => document.querySelector<HTMLElement>(request.selector as string)
			: null;
	if (!find) { return; }
	const target = await waitForElement(find);
	if (!target) { return; }
	// Let the tab switch paint before scrolling, or the scroll measures the old layout.
	setTimeout(() => {
		target.scrollIntoView({ behavior: 'smooth', block: 'start' });
		flashSection(target);
	}, 50);
}

/**
 * Wires a panel up for host-driven navigation. Call once at module load, with
 * the panel's view id as the host knows it.
 */
export function installSurfaceNavigation(vscode: PostMessageApi, view: string): void {
	registerMessageHandler<{ command?: string } & Partial<SurfaceRevealRequest>>((message) => {
		if (message?.command === 'revealSurface') {
			// Acknowledge first, so the host stops holding the request for a replay.
			vscode.postMessage({ command: 'surfaceRevealHandled', view });
			void revealSurface(message as SurfaceRevealRequest);
		}
	});
	vscode.postMessage({ command: 'surfaceNavReady', view });
}
