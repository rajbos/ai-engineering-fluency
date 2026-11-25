import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

import { ClaudeDesktopDataAccess, claudeDesktopConfigDirs } from '../claudedesktop';

/**
 * Where the Claude desktop app keeps Cowork sessions. Current Windows installs moved their data
 * from the MSIX package's `LocalCache\Roaming\Claude` folder into `%LOCALAPPDATA%\Claude-Data\
 * claude_<package>`, leaving only a `.user-data-left.*` marker behind. Every test builds a
 * temporary fixture and injects it, so no real user data is read.
 */

interface Fixture {
	root: string;
	/** %LOCALAPPDATA%\Claude-Data\claude_<package> */
	newConfig: string;
	/** %LOCALAPPDATA%\Packages\Claude_<package>\LocalCache\Roaming\Claude */
	oldConfig: string;
	cleanup: () => void;
}

function makeFixture(): Fixture {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ctt-desktop-locations-'));
	const newConfig = path.join(root, 'Local', 'Claude-Data', 'claude_pzs8sxrjxfjjc');
	const oldConfig = path.join(root, 'Local', 'Packages', 'Claude_pzs8sxrjxfjjc', 'LocalCache', 'Roaming', 'Claude');
	fs.mkdirSync(newConfig, { recursive: true });
	fs.mkdirSync(oldConfig, { recursive: true });
	return { root, newConfig, oldConfig, cleanup: () => fs.rmSync(root, { recursive: true, force: true }) };
}

/** Writes `<config>/<dirName>/app/machine/local_<id>.json` and its legacy transcript folder. */
function writeSession(configDir: string, id: string, dirName = 'claude-code-sessions'): string {
	const machineDir = path.join(configDir, dirName, 'app-uuid', 'machine-uuid');
	const projectDir = path.join(machineDir, `local_${id}`, '.claude', 'projects', 'hash');
	fs.mkdirSync(projectDir, { recursive: true });
	fs.writeFileSync(path.join(machineDir, `local_${id}.json`), JSON.stringify({ sessionId: id }));
	const transcript = path.join(projectDir, `${id}.jsonl`);
	fs.writeFileSync(transcript, '{"type":"user"}\n');
	return transcript;
}

test('getDesktopSessionFiles: finds sessions in the Claude-Data location when the packaged folder holds only the marker', async () => {
	const fx = makeFixture();
	try {
		fs.writeFileSync(path.join(fx.oldConfig, '.user-data-left.claude_pzs8sxrjxfjjc'), '');
		const transcript = writeSession(fx.newConfig, 'a');
		const desktop = new ClaudeDesktopDataAccess(() => [fx.newConfig, fx.oldConfig]);

		assert.deepEqual(desktop.getDesktopSessionDirs(), [path.join(fx.newConfig, 'claude-code-sessions')]);
		assert.deepEqual(await desktop.getDesktopSessionFiles(), [transcript]);
		assert.equal(desktop.getSessionDirForFile(transcript), path.join(fx.newConfig, 'claude-code-sessions'));
	} finally {
		fx.cleanup();
	}
});

test('getDesktopSessionDirs: lists every existing location, newest location first', () => {
	const fx = makeFixture();
	try {
		writeSession(fx.oldConfig, 'old', 'local-agent-mode-sessions');
		writeSession(fx.oldConfig, 'old2');
		writeSession(fx.newConfig, 'new');
		const desktop = new ClaudeDesktopDataAccess(() => [fx.newConfig, fx.oldConfig]);

		assert.deepEqual(desktop.getDesktopSessionDirs(), [
			path.join(fx.newConfig, 'claude-code-sessions'),
			path.join(fx.oldConfig, 'claude-code-sessions'),
			path.join(fx.oldConfig, 'local-agent-mode-sessions'),
		]);
	} finally {
		fx.cleanup();
	}
});

test('getDesktopSessionDirs: falls back to the preferred location\'s candidates when nothing exists yet', () => {
	const fx = makeFixture();
	try {
		const desktop = new ClaudeDesktopDataAccess(() => [fx.newConfig, fx.oldConfig]);
		assert.deepEqual(desktop.getDesktopSessionDirs(), [
			path.join(fx.newConfig, 'claude-code-sessions'),
			path.join(fx.newConfig, 'local-agent-mode-sessions'),
		]);
		assert.deepEqual(new ClaudeDesktopDataAccess(() => []).getDesktopSessionDirs(), []);
	} finally {
		fx.cleanup();
	}
});

test('getDesktopSessionFiles: a session in both locations counts once, from the newest location', async () => {
	const fx = makeFixture();
	try {
		const newShared = writeSession(fx.newConfig, 'shared');
		writeSession(fx.oldConfig, 'shared');
		const oldOnly = writeSession(fx.oldConfig, 'old-only');
		const desktop = new ClaudeDesktopDataAccess(() => [fx.newConfig, fx.oldConfig]);

		const files = await desktop.getDesktopSessionFiles();
		assert.deepEqual([...files].sort(), [newShared, oldOnly].sort());
	} finally {
		fx.cleanup();
	}
});

test('getDesktopLocalCoverage: a metadata record in both locations counts once', async () => {
	const fx = makeFixture();
	try {
		writeSession(fx.newConfig, 'shared');
		writeSession(fx.oldConfig, 'shared');
		writeSession(fx.oldConfig, 'old-only');
		const desktop = new ClaudeDesktopDataAccess(() => [fx.newConfig, fx.oldConfig]);

		const coverage = await desktop.getDesktopLocalCoverage(path.join(fx.root, 'no-projects'));
		assert.deepEqual(coverage, { knownSessions: 2, withTranscript: 2, missingTranscript: 0 });
	} finally {
		fx.cleanup();
	}
});

test('claudeDesktopConfigDirs (Windows): Claude-Data folders come before the packaged and roaming folders', { skip: process.platform !== 'win32' }, () => {
	const fx = makeFixture();
	const saved = { LOCALAPPDATA: process.env.LOCALAPPDATA, APPDATA: process.env.APPDATA };
	try {
		const localAppData = path.join(fx.root, 'Local');
		const appData = path.join(fx.root, 'Roaming');
		process.env.LOCALAPPDATA = localAppData;
		process.env.APPDATA = appData;
		fs.writeFileSync(path.join(localAppData, 'Claude-Data', 'README.txt'), 'moved');

		assert.deepEqual(claudeDesktopConfigDirs(), [
			fx.newConfig,
			fx.oldConfig,
			path.join(appData, 'Claude'),
		]);
	} finally {
		for (const [key, value] of Object.entries(saved)) {
			if (value === undefined) { delete process.env[key]; } else { process.env[key] = value; }
		}
		fx.cleanup();
	}
});
