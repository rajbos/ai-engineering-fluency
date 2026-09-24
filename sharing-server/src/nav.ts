/**
 * Extra navigation links contributed by a downstream server.
 *
 * The built-in page headers only know about the pages this package ships. A downstream
 * server that mounts its own page via `createApp({ extend })` has no way to surface it
 * in the header, which leaves the page reachable by URL only. Registering a nav link
 * closes that gap without forking the dashboard markup.
 */

/** A single header link contributed by a downstream server. */
export interface NavLink {
	/** Same-origin path, e.g. `/vendor`. Must start with a single `/`. */
	href: string;
	/** Visible link text. */
	label: string;
	/** Optional `title` attribute for a tooltip. */
	title?: string;
}

let navExtraFn: (() => NavLink[]) | undefined;

/**
 * Replace the registered nav-link provider. Called by `createApp`; exported for tests.
 * Pass `undefined` to clear it.
 */
export function setNavExtra(fn: (() => NavLink[]) | undefined): void {
	navExtraFn = fn;
}

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

/**
 * A downstream link is same-origin only. Anything else — an absolute URL, a
 * protocol-relative `//host`, or a `javascript:` scheme — is rejected rather than
 * escaped, so a header link can never navigate off the server or execute script.
 */
function isSafeHref(href: string): boolean {
	try {
		const url = new URL(href, 'http://same-origin.invalid');
		return href.startsWith('/') && !href.startsWith('//') && url.origin === 'http://same-origin.invalid';
	} catch {
		return false;
	}
}

/**
 * Render the registered downstream links as header anchors.
 *
 * Returns an empty string when nothing is registered, so the built-in headers can
 * interpolate it unconditionally. A provider that throws is treated as contributing
 * nothing: a broken downstream hook must not take the whole dashboard down.
 *
 * @param currentPath Path of the page being rendered, used to mark the active link.
 */
export function renderNavExtra(currentPath?: string): string {
	let links: NavLink[];
	try {
		links = navExtraFn?.() ?? [];
	} catch (err) {
		console.error('[nav] navExtra provider threw, skipping downstream links:', err);
		return '';
	}

	return links
		.filter((link) => {
			if (!link || typeof link.href !== 'string' || typeof link.label !== 'string') return false;
			if (!isSafeHref(link.href)) {
				console.warn(`[nav] ignoring nav link with unsupported href: ${String(link.href)}`);
				return false;
			}
			return true;
		})
		.map((link) => {
			const title = link.title ? ` title="${escapeHtml(link.title)}"` : '';
			const current = link.href === currentPath ? ' aria-current="page"' : '';
			return `<a href="${escapeHtml(link.href)}"${title}${current}>${escapeHtml(link.label)}</a>`;
		})
		.join('');
}
