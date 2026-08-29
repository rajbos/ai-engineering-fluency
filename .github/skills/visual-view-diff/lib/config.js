'use strict';

const fs = require('fs');
const path = require('path');

/** Parses `--key value` and `--flag` arguments into a plain object. */
function parseArgs(argv) {
	const args = {};
	for (let i = 0; i < argv.length; i++) {
		const token = argv[i];
		if (!token.startsWith('--')) { continue; }
		const key = token.slice(2);
		const next = argv[i + 1];
		if (next === undefined || next.startsWith('--')) {
			args[key] = true;
		} else {
			args[key] = next;
			i++;
		}
	}
	return args;
}

function readConfig(skillDir) {
	const config = JSON.parse(fs.readFileSync(path.join(skillDir, 'views.config.json'), 'utf8'));
	return { defaults: config.defaults, views: config.views };
}

/**
 * Picks the views to render.
 *
 * `filter` may be a single id or a comma-separated list. Views marked
 * `enabled: false` are skipped unless named explicitly, so `--view dashboard`
 * still works for someone debugging it.
 */
function selectViews(config, filter) {
	if (typeof filter === 'string' && filter.length > 0) {
		const wanted = new Set(filter.split(',').map((s) => s.trim()).filter(Boolean));
		return config.views.filter((v) => wanted.has(v.id));
	}
	return config.views.filter((v) => v.enabled !== false);
}

module.exports = { parseArgs, readConfig, selectViews };
