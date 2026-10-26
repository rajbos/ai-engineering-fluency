import * as fs from 'fs';
import * as path from 'path';
import type { CommandRunner } from './badgeSyncService';

export type BadgeInstallOutcome =
	| { status: 'copied'; target: string }
	| { status: 'noDrive' }
	| { status: 'sourceMissing' }
	| { status: 'failed'; message: string };

/** Volume label the badge's USB disk mode shows. */
const BADGE_VOLUME_LABEL = 'BADGER';
const APP_FOLDER_NAME = 'fluency';
const VOLUME_LOOKUP_TIMEOUT_MS = 10_000;
/** A folder every badge volume has. A volume without it is not treated as a badge, whatever its label. */
const BADGE_MARKER_FOLDER = 'apps';

export interface BadgeDriveLookup {
	platform: NodeJS.Platform;
	run: CommandRunner;
	userName: string;
	exists: (candidate: string) => boolean;
}

/** A fixed program and arguments (no user input) that prints the drive letter of the volume labelled BADGER. */
interface DriveLetterLookup { command: string; args: string[] }

/**
 * Tried in order on Windows: PowerShell 7 (`pwsh`), Windows PowerShell, then bash (Git Bash or WSL) asking
 * `cmd.exe` for each drive's volume label. The next one is only tried when the previous is not installed,
 * fails or times out.
 */
const WINDOWS_DRIVE_LOOKUPS: DriveLetterLookup[] = [
	...['pwsh', 'powershell.exe'].map((command) => ({
		command,
		args: ['-NoProfile', '-NonInteractive', '-Command', `(Get-Volume -FileSystemLabel '${BADGE_VOLUME_LABEL}' -ErrorAction SilentlyContinue).DriveLetter`],
	})),
	{
		command: 'bash',
		args: ['-c', `export MSYS2_ARG_CONV_EXCL='*'; for l in {a..z}; do cmd.exe /c "vol $l:" 2>/dev/null | tr -d '\\r' | grep -qi "is ${BADGE_VOLUME_LABEL}$" && echo $l; done; exit 0`],
	},
];

async function windowsBadgeRoots(run: CommandRunner): Promise<string[]> {
	for (const { command, args } of WINDOWS_DRIVE_LOOKUPS) {
		const result = await run(command, args, VOLUME_LOOKUP_TIMEOUT_MS);
		if (result.spawnError || result.code !== 0) { continue; }
		return result.stdout.split(/\r?\n/).map((line) => line.trim()).filter((line) => /^[A-Za-z]$/.test(line)).map((letter) => `${letter.toUpperCase()}:\\`);
	}
	// None of the shells worked: there is no way to tell which drive is the badge, so report no drive.
	return [];
}

/** Where a mounted BADGER volume can be on each platform. */
async function candidateRoots(lookup: BadgeDriveLookup): Promise<string[]> {
	if (lookup.platform === 'win32') {
		return windowsBadgeRoots(lookup.run);
	}
	if (lookup.platform === 'darwin') {
		return [`/Volumes/${BADGE_VOLUME_LABEL}`];
	}
	return [
		`/media/${lookup.userName}/${BADGE_VOLUME_LABEL}`,
		`/run/media/${lookup.userName}/${BADGE_VOLUME_LABEL}`,
		`/media/${BADGE_VOLUME_LABEL}`,
		`/mnt/${BADGE_VOLUME_LABEL}`,
	];
}

/** The root of the first mounted BADGER volume that also holds the badge's `apps` folder, if any. */
export async function findBadgeDrive(lookup: BadgeDriveLookup): Promise<string | undefined> {
	const pathApi = lookup.platform === 'win32' ? path.win32 : path.posix;
	let roots: string[];
	try {
		roots = await candidateRoots(lookup);
	} catch {
		return undefined;
	}
	return roots.find((root) => lookup.exists(root) && lookup.exists(pathApi.join(root, BADGE_MARKER_FOLDER)));
}

async function hasMarkerFolder(root: string): Promise<boolean> {
	try {
		return (await fs.promises.stat(path.join(root, BADGE_MARKER_FOLDER))).isDirectory();
	} catch {
		return false;
	}
}

/**
 * Copies the app folder to `<BADGER>/apps/fluency`, replacing a previous copy so no stale file stays
 * behind. The destination is always inside the detected badge volume, and nothing is deleted unless
 * that volume holds the badge's `apps` folder, even when the caller supplied the drive.
 */
export async function installBadgeApp(options: { sourceDir: string; findDrive?: () => Promise<string | undefined> } & BadgeDriveLookup): Promise<BadgeInstallOutcome> {
	if (!options.exists(options.sourceDir)) { return { status: 'sourceMissing' }; }
	try {
		const root = await (options.findDrive ?? (() => findBadgeDrive(options)))();
		if (!root || !(await hasMarkerFolder(root))) { return { status: 'noDrive' }; }
		const target = path.join(root, BADGE_MARKER_FOLDER, APP_FOLDER_NAME);
		await fs.promises.rm(target, { recursive: true, force: true });
		await fs.promises.cp(options.sourceDir, target, { recursive: true });
		return { status: 'copied', target };
	} catch (error) {
		return { status: 'failed', message: error instanceof Error ? error.message : String(error) };
	}
}
