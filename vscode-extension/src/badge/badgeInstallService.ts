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

export interface BadgeDriveLookup {
	platform: NodeJS.Platform;
	run: CommandRunner;
	userName: string;
	exists: (candidate: string) => boolean;
}

/** Where a mounted BADGER volume can be on each platform. */
async function candidateRoots(lookup: BadgeDriveLookup): Promise<string[]> {
	if (lookup.platform === 'win32') {
		// Fixed command, no user input: the drive letter of the volume labelled BADGER.
		const result = await lookup.run('powershell.exe', [
			'-NoProfile', '-NonInteractive', '-Command',
			`(Get-Volume -FileSystemLabel '${BADGE_VOLUME_LABEL}' -ErrorAction SilentlyContinue).DriveLetter`,
		], VOLUME_LOOKUP_TIMEOUT_MS);
		return result.stdout.split(/\r?\n/).map((line) => line.trim()).filter((line) => /^[A-Za-z]$/.test(line)).map((letter) => `${letter.toUpperCase()}:\\`);
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

/** The root of the first mounted BADGER volume, if any. */
export async function findBadgeDrive(lookup: BadgeDriveLookup): Promise<string | undefined> {
	const roots = await candidateRoots(lookup);
	return roots.find((root) => lookup.exists(root));
}

/**
 * Copies the app folder to `<BADGER>/apps/fluency`, replacing a previous copy so no stale file stays
 * behind. The destination is always inside the detected badge volume.
 */
export async function installBadgeApp(options: { sourceDir: string; findDrive?: () => Promise<string | undefined> } & BadgeDriveLookup): Promise<BadgeInstallOutcome> {
	if (!options.exists(options.sourceDir)) { return { status: 'sourceMissing' }; }
	try {
		const root = await (options.findDrive ?? (() => findBadgeDrive(options)))();
		if (!root) { return { status: 'noDrive' }; }
		const target = path.join(root, 'apps', APP_FOLDER_NAME);
		await fs.promises.mkdir(path.dirname(target), { recursive: true });
		await fs.promises.rm(target, { recursive: true, force: true });
		await fs.promises.cp(options.sourceDir, target, { recursive: true });
		return { status: 'copied', target };
	} catch (error) {
		return { status: 'failed', message: error instanceof Error ? error.message : String(error) };
	}
}
