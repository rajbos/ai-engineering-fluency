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
const fs = require('fs');
const path = require('path');

/**
 * Global npm root without spawning the `npm` shim: Node refuses to spawn .cmd
 * shims without a shell on Windows (CVE-2024-27980), and we deliberately keep
 * `shell` disabled, so run npm's CLI entrypoint with the current Node binary.
 * Falls back to npm's default Windows prefix when the CLI can't be located.
 */
function globalNpmRoot() {
	const nodeDir = path.dirname(process.execPath);
	const cliCandidates = [
		path.join(nodeDir, 'node_modules', 'npm', 'bin', 'npm-cli.js'), // Windows layout
		path.join(nodeDir, '..', 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js'), // POSIX layout
	];
	const cli = cliCandidates.find(p => fs.existsSync(p));
	if (cli) {
		try {
			return execFileSync(process.execPath, [cli, 'root', '-g'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
		} catch {
			// Fall through to the platform default below.
		}
	}
	if (process.platform === 'win32' && process.env.APPDATA) {
		return path.join(process.env.APPDATA, 'npm', 'node_modules');
	}
	return null;
}

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
	// Global installs are not on a local script's resolution path, so ask npm
	// where its global root is and look there too.
	const globalRoot = globalNpmRoot();
	if (globalRoot) {
		paths.push(`${globalRoot}/playwright`, `${globalRoot}/@playwright/test`, `${globalRoot}/playwright-core`);
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
