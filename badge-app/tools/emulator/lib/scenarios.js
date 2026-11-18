'use strict';

/**
 * Scripted walks through each badge app, one screenshot per `shot` step.
 *
 * Steps:
 *   { shot: '<name>' }                    save the screen as <view>--<name>.dark.png
 *   { press: 'right' }                    press and release one button
 *   { hold: 'select', press: 'left', times: 3 }   press a button while holding another
 *   { wait: 500 }                         let the app's virtual clock run on that many milliseconds
 *
 * The app runs on a virtual clock (see emulator.js): it stands still while
 * buttons are pressed, and every shot first lets it run on long enough for the
 * screen's intro animations to finish, so a shot needs no wait before it and
 * looks the same on every run. `wait` is only for catching a moment between
 * two inputs, such as pressing a button partway through an animation.
 *
 * Shot names become part of the file name and the PR comment, so they are kept
 * to lowercase letters, digits and dashes. `data` is the fluency.json the run
 * starts with (a path relative to the app folder), or null for a fresh badge.
 * `settings` are the secrets.py values the run starts with (the simulator's
 * read-only /secrets.py loads them from /state/editor-settings.json), or
 * omitted for none.
 */

// Input bits the simulator worker reads (badger/home's badge-simulator extension.mjs).
const BUTTONS = {
	down: 1, up: 2, select: 4, right: 8, left: 16, home: 32, back: 8192, menu: 16384,
};

const SCENARIOS = {
	fluency: [
		{
			id: 'data',
			data: 'assets/sample.json',
			settings: { CONTACT_NAME: 'Rob Bos', CONTACT_LINKEDIN: 'https://linkedin.com/in/bosrob' },
			steps: [
				{ shot: '1-score' },
				// UP on the score screen flips to the spider chart (and DOWN back).
				{ press: 'up' },
				{ shot: '1a-score-chart' },
				{ press: 'down' },
				{ press: 'right' },
				{ shot: '2-history' },
				// SELECT + LEFT is the scrub control when there is no IMU.
				{ hold: 'select', press: 'left', times: 5 },
				{ shot: '2a-history-scrub' },
				{ press: 'up' },
				{ shot: '2b-history-sessions' },
				{ press: 'right' },
				{ shot: '3-qr-repo' },
				{ press: 'right' },
				{ shot: '4-qr-linkedin' },
				{ press: 'menu' },
				{ shot: '5-sync' },
			],
		},
		{
			id: 'no-data',
			data: null,
			steps: [
				{ shot: '0-no-data' },
			],
		},
	],
};

function validateScenarios(scenarios = SCENARIOS) {
	for (const [app, runs] of Object.entries(scenarios)) {
		const shots = new Set();
		for (const run of runs) {
			for (const step of run.steps) {
				const buttons = [step.press, step.hold].filter(Boolean);
				for (const b of buttons) {
					if (!(b in BUTTONS)) { throw new Error(`${app}/${run.id}: unknown button "${b}"`); }
				}
				if (step.shot !== undefined) {
					if (!/^[a-z0-9][a-z0-9-]*$/.test(step.shot)) { throw new Error(`${app}/${run.id}: bad shot name "${step.shot}"`); }
					if (shots.has(step.shot)) { throw new Error(`${app}: shot "${step.shot}" is used twice`); }
					shots.add(step.shot);
				} else if (step.wait !== undefined) {
					if (!Number.isInteger(step.wait) || step.wait < 1 || step.wait > 60000) { throw new Error(`${app}/${run.id}: wait must be 1..60000 ms`); }
				} else if (buttons.length === 0) {
					throw new Error(`${app}/${run.id}: a step needs shot, press, hold or wait`);
				}
			}
		}
	}
	return scenarios;
}

module.exports = { BUTTONS, SCENARIOS, validateScenarios };
