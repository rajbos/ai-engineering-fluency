import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { execFile } from 'child_process';

export interface CommandResult {
	code: number;
	stdout: string;
	stderr: string;
	/** Set when the program could not be started at all (for example it is not installed). */
	spawnError?: string;
}

/** Runs a program with an argument array (never through a shell). Injected so tests never touch a device. */
export type CommandRunner = (command: string, args: string[], timeoutMs: number) => Promise<CommandResult>;

export type BadgeSyncOutcome =
	| { status: 'ok'; port: string; bytes: number }
	| { status: 'mpremoteMissing' }
	| { status: 'noBadge' }
	| { status: 'multipleBadges'; ports: string[] }
	| { status: 'failed'; message: string };

export const MPREMOTE = 'mpremote';
const DEVICE_LIST_TIMEOUT_MS = 10_000;
const COPY_TIMEOUT_MS = 30_000;
const STATE_DIR = ':/state';
const DATA_FILE = ':/state/fluency.json';
/** USB vendor id of Raspberry Pi, which the badge's RP2350 reports. */
const BADGE_VENDOR_ID = '2e8a';
/** A serial port name as mpremote lists it: COM5, /dev/ttyACM0, /dev/cu.usbmodem1101. */
const SAFE_PORT = /^[A-Za-z0-9][A-Za-z0-9_./:\\-]*$/;

export const runCommand: CommandRunner = (command, args, timeoutMs) =>
	new Promise((resolve) => {
		execFile(command, args, { timeout: timeoutMs, windowsHide: true }, (error, stdout, stderr) => {
			if (error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
				resolve({ code: -1, stdout: '', stderr: '', spawnError: 'ENOENT' });
				return;
			}
			const code = error ? (typeof (error as NodeJS.ErrnoException).code === 'number' ? Number((error as NodeJS.ErrnoException).code) : 1) : 0;
			resolve({ code, stdout: String(stdout), stderr: String(stderr) });
		});
	});

/**
 * Reads the ports out of `mpremote devs`. Each line is `<port> <vid:pid> <serial> <maker> <product>`;
 * ports with the Raspberry Pi vendor id are preferred, and every port is kept when none match.
 */
export function parseDeviceList(output: string): string[] {
	const all: string[] = [];
	const badge: string[] = [];
	for (const line of output.split(/\r?\n/)) {
		const parts = line.trim().split(/\s+/);
		const port = parts[0];
		if (!port || !SAFE_PORT.test(port)) { continue; }
		all.push(port);
		if (parts[1]?.toLowerCase().startsWith(`${BADGE_VENDOR_ID}:`)) { badge.push(port); }
	}
	return badge.length > 0 ? badge : all;
}

async function findPort(run: CommandRunner, preferredPort: string | undefined): Promise<BadgeSyncOutcome | { port: string }> {
	if (preferredPort) {
		return SAFE_PORT.test(preferredPort) ? { port: preferredPort } : { status: 'failed', message: 'Invalid port name' };
	}
	const devices = await run(MPREMOTE, ['devs'], DEVICE_LIST_TIMEOUT_MS);
	if (devices.spawnError) { return { status: 'mpremoteMissing' }; }
	const ports = parseDeviceList(devices.stdout);
	if (ports.length === 0) { return { status: 'noBadge' }; }
	if (ports.length > 1) { return { status: 'multipleBadges', ports }; }
	return { port: ports[0] };
}

/**
 * Copies the payload to `/state/fluency.json` on the badge over USB. The payload goes through a
 * temp file (owner-only permissions) that is removed again whatever the outcome. Expect the
 * running badge app to restart: mpremote soft-resets the board when it enters the raw REPL.
 */
export async function syncOverUsb(options: { run: CommandRunner; payloadJson: string; port?: string; tempRoot?: string }): Promise<BadgeSyncOutcome> {
	const { run, payloadJson } = options;
	const found = await findPort(run, options.port);
	if (!('port' in found)) { return found; }

	const tempDir = await fs.promises.mkdtemp(path.join(options.tempRoot ?? os.tmpdir(), 'ai-fluency-badge-'));
	try {
		const tempFile = path.join(tempDir, 'fluency.json');
		await fs.promises.writeFile(tempFile, payloadJson, { encoding: 'utf8', mode: 0o600 });
		// The folder usually exists already, so a failing mkdir is expected and ignored.
		await run(MPREMOTE, ['connect', found.port, 'fs', 'mkdir', STATE_DIR], COPY_TIMEOUT_MS);
		const copy = await run(MPREMOTE, ['connect', found.port, 'fs', 'cp', tempFile, DATA_FILE], COPY_TIMEOUT_MS);
		if (copy.spawnError) { return { status: 'mpremoteMissing' }; }
		if (copy.code !== 0) {
			return { status: 'failed', message: (copy.stderr || copy.stdout).trim().slice(0, 300) || `mpremote exited with code ${copy.code}` };
		}
		return { status: 'ok', port: found.port, bytes: Buffer.byteLength(payloadJson, 'utf8') };
	} finally {
		await fs.promises.rm(tempDir, { recursive: true, force: true });
	}
}
