import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { execFile } from 'child_process';
import type { BadgeSyncResult } from './badgeSetupTypes';

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
const SAFE_PORT = /^[A-Za-z0-9/][A-Za-z0-9_./:\\-]*$/;

export const runCommand: CommandRunner = (command, args, timeoutMs) =>
	new Promise((resolve) => {
		execFile(command, args, { timeout: timeoutMs, windowsHide: true }, (error, stdout, stderr) => {
			const errorCode = (error as NodeJS.ErrnoException | null)?.code;
			if (errorCode === 'ENOENT') {
				resolve({ code: -1, stdout: '', stderr: '', spawnError: 'ENOENT' });
				return;
			}
			// A non-zero exit status arrives as a numeric `code`; a timeout or signal has none.
			const code = !error ? 0 : typeof errorCode === 'number' ? errorCode : 1;
			resolve({ code, stdout: String(stdout), stderr: String(stderr) });
		});
	});

/** A USB `vid:pid` column as mpremote prints it (`2e8a:1101`). */
const USB_ID = /^[0-9a-f]{4}:[0-9a-f]{4}$/i;

/**
 * Reads the ports out of `mpremote devs`. Each line is `<port> <serial> <vid:pid> <maker> <product>`
 * (the serial can be `None`). The `vid:pid` column is found by shape rather than position so a
 * change in column order does not silently drop the filter. Ports with the Raspberry Pi vendor id
 * are preferred, and every port is kept when none match.
 */
export function parseDeviceList(output: string): string[] {
	const all: string[] = [];
	const badge: string[] = [];
	for (const line of output.split(/\r?\n/)) {
		const parts = line.trim().split(/\s+/);
		const port = parts[0];
		if (!port || !SAFE_PORT.test(port)) { continue; }
		all.push(port);
		const usbId = parts.slice(1).find((part) => USB_ID.test(part));
		if (usbId?.toLowerCase().startsWith(`${BADGE_VENDOR_ID}:`)) { badge.push(port); }
	}
	return badge.length > 0 ? badge : all;
}

/**
 * The part of mpremote's output worth showing: a Python traceback ends with the exception line,
 * so the last non-empty line is kept rather than the first 300 characters of the stack.
 */
export function describeFailure(result: CommandResult): string {
	const lines = (result.stderr || result.stdout).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
	const last = lines[lines.length - 1] ?? '';
	return last.replace(/^[\w.]*Error:\s*/, '').slice(0, 300) || `mpremote exited with code ${result.code}`;
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
			return { status: 'failed', message: describeFailure(copy) };
		}
		return { status: 'ok', port: found.port, bytes: Buffer.byteLength(payloadJson, 'utf8') };
	} finally {
		await fs.promises.rm(tempDir, { recursive: true, force: true });
	}
}

/** Builds the payload, copies it to the badge and, when several devices are plugged in, asks which one. */
export async function syncBadge(options: {
	run: CommandRunner;
	buildPayload: () => Promise<string>;
	pickPort: (ports: string[]) => Promise<string | undefined>;
	now?: () => Date;
	tempRoot?: string;
}): Promise<BadgeSyncResult> {
	let payloadJson: string;
	try {
		payloadJson = await options.buildPayload();
	} catch (error) {
		return { status: 'failed', message: error instanceof Error ? error.message : String(error) };
	}

	try {
		const base = { run: options.run, payloadJson, tempRoot: options.tempRoot };
		let outcome = await syncOverUsb(base);
		if (outcome.status === 'multipleBadges') {
			const port = await options.pickPort(outcome.ports);
			if (!port) { return { status: 'cancelled' }; }
			outcome = await syncOverUsb({ ...base, port });
		}
		if (outcome.status === 'ok') {
			return { status: 'ok', port: outcome.port, bytes: outcome.bytes, at: (options.now?.() ?? new Date()).toISOString() };
		}
		// Only the multiple-devices case is left after the retry above, which a chosen port cannot trigger.
		return outcome.status === 'multipleBadges' ? { status: 'noBadge' } : outcome;
	} catch (error) {
		return { status: 'failed', message: error instanceof Error ? error.message : String(error) };
	}
}
