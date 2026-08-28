'use strict';

/**
 * Resolves Playwright's `chromium` without adding it to any package.json.
 *
 * The extension does not depend on Playwright, and it should not have to: this
 * harness is developer/CI tooling, not shipped code. So we look for an existing
 * install rather than pulling one into the extension's dependency tree —
 * agent environments and CI images generally already provide one.
 */

const { execFileSync } = require('child_process');

const INSTALL_HINT = [
	'Playwright is required to render the webviews but was not found.',
	'',
	'Install it globally (it is intentionally not a dependency of the extension):',
	'  npm install -g playwright && npx playwright install chromium',
	'',
	'If a browser is already present elsewhere, point PLAYWRIGHT_BROWSERS_PATH at it.',
].join('\n');

/** Candidate module paths, cheapest first. */
function candidatePaths() {
	const paths = ['playwright', '@playwright/test', 'playwright-core'];
	try {
		// Global installs are not on a local script's resolution path, so ask npm
		// where its global root is and look there too.
		const globalRoot = execFileSync('npm', ['root', '-g'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
		if (globalRoot) {
			paths.push(`${globalRoot}/playwright`, `${globalRoot}/@playwright/test`, `${globalRoot}/playwright-core`);
		}
	} catch {
		// npm not available — the local candidates above are still worth trying.
	}
	return paths;
}

function loadChromium() {
	for (const candidate of candidatePaths()) {
		try {
			const mod = require(candidate);
			if (mod && mod.chromium) {
				return mod.chromium;
			}
		} catch {
			// Try the next candidate.
		}
	}
	throw new Error(INSTALL_HINT);
}

module.exports = { loadChromium, INSTALL_HINT };
