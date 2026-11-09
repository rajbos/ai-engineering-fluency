import type { Context, MiddlewareHandler } from 'hono';
import { secureHeaders, NONCE } from 'hono/secure-headers';

/** Context key Hono's `NONCE` helper stores the per-request CSP nonce under. */
const NONCE_KEY = 'secureHeadersNonce';

/**
 * Security headers for the built-in HTML pages (dashboard, team, admin, sign-in, errors).
 *
 * The Content-Security-Policy allows only scripts and `<style>` blocks that carry this
 * request's nonce, so markup that slips past escaping cannot run script. Every inline
 * `<script>` and `<style>` the pages emit adds `nonce="${cspNonce(c)}"`. Inline `style="…"`
 * attributes stay allowed (`style-src-attr`): they cannot run script and the pages use them
 * for layout. Images are limited to this origin plus GitHub avatars.
 *
 * Mounted on the dashboard router rather than globally, so routes a downstream server adds
 * through `createApp({ extend })` keep their own headers and inline scripts working.
 */
export function htmlSecurityHeaders(): MiddlewareHandler {
	return secureHeaders({
		contentSecurityPolicy: {
			defaultSrc: ["'self'"],
			scriptSrc: [NONCE],
			styleSrc: ["'self'", NONCE],
			styleSrcAttr: ["'unsafe-inline'"],
			imgSrc: ["'self'", 'data:', 'https://avatars.githubusercontent.com'],
			connectSrc: ["'self'"],
			fontSrc: ["'self'"],
			objectSrc: ["'none'"],
			baseUri: ["'none'"],
			formAction: ["'self'"],
			frameAncestors: ["'none'"],
		},
		xFrameOptions: 'DENY',
	});
}

/**
 * The CSP nonce for this request, for a `nonce="…"` attribute. Empty when the page is
 * rendered without `htmlSecurityHeaders` (no CSP header, so nothing to match).
 */
export function cspNonce(c: Context): string {
	return (c.get(NONCE_KEY as never) as string | undefined) ?? '';
}
