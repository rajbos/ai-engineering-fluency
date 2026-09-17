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

/**
 * Reads the view registry. `configPath` overrides the skill's own
 * `views.config.json`, which is how the visual diff renders a baseline from a
 * registry merged with the base commit's (see `mergeRegistries`).
 */
function readConfig(skillDir, configPath) {
	const config = JSON.parse(fs.readFileSync(configPath || path.join(skillDir, 'views.config.json'), 'utf8'));
	return validateRegistry({ defaults: config.defaults, views: config.views });
}

/**
 * A view or state id becomes part of a file name (`<view>--<state>.<theme>.png`)
 * and of a temp path, so it is held to a strict allowlist: no separators, no
 * dots, no `--` (the view/state delimiter), and unique within its scope. A
 * registry that breaks this is refused up front rather than letting one entry
 * write over another's screenshot or outside the output directory.
 */
const ID_PATTERN = /^[A-Za-z0-9_]+(?:-[A-Za-z0-9_]+)*$/;

function validateRegistry(config) {
	const seenViews = new Set();
	for (const view of config.views || []) {
		if (typeof view.id !== 'string' || !ID_PATTERN.test(view.id)) {
			throw new Error(`views.config.json: view id ${JSON.stringify(view.id)} must match ${ID_PATTERN} (letters, digits, _ and single dashes)`);
		}
		if (seenViews.has(view.id)) {
			throw new Error(`views.config.json: duplicate view id "${view.id}"`);
		}
		seenViews.add(view.id);
		const seenStates = new Set();
		for (const state of view.states || []) {
			if (typeof state.id !== 'string' || !ID_PATTERN.test(state.id)) {
				throw new Error(`views.config.json: state id ${JSON.stringify(state.id)} on view "${view.id}" must match ${ID_PATTERN}`);
			}
			if (seenStates.has(state.id)) {
				throw new Error(`views.config.json: duplicate state id "${state.id}" on view "${view.id}"`);
			}
			seenStates.add(state.id);
		}
	}
	return config;
}

/**
 * The registry to render a *baseline* from: the current registry, plus every
 * view and state the base commit's registry declared that the current one no
 * longer does. Rendering the baseline from the current registry alone would
 * silently drop a view or tab the branch removed or renamed — nothing on the
 * baseline side, nothing on the current side, "no change". With the base's
 * entries carried over, that screenshot exists only on the baseline side and
 * the comparison reports it as **removed**.
 *
 * Base-only entries keep the base commit's own fixture directory (`fixtureDir`),
 * since the current tree may have deleted the fixture along with the view.
 */
function mergeRegistries(current, base, baseFixtureDir) {
	const views = current.views.map((v) => ({ ...v, states: (v.states || []).map((s) => ({ ...s })) }));
	const byId = new Map(views.map((v) => [v.id, v]));
	for (const baseView of base.views || []) {
		if (!ID_PATTERN.test(String(baseView.id))) { continue; }
		const currentView = byId.get(baseView.id);
		if (!currentView) {
			views.push({ ...baseView, fixtureDir: baseFixtureDir, baseOnly: true });
			continue;
		}
		const currentStates = new Set((currentView.states || []).map((s) => s.id));
		for (const baseState of baseView.states || []) {
			if (ID_PATTERN.test(String(baseState.id)) && !currentStates.has(baseState.id)) {
				currentView.states = [...(currentView.states || []), { ...baseState, baseOnly: true }];
			}
		}
	}
	return validateRegistry({ defaults: current.defaults, views });
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

module.exports = { parseArgs, readConfig, selectViews, validateRegistry, mergeRegistries, ID_PATTERN };
