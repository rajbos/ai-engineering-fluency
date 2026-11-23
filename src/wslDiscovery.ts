/**
 * Discovery of coding-agent session files that live inside WSL distros, for a CLI / extension
 * running on Windows (the reverse of the WSL -> Windows lookup the Copilot adapters already do).
 *
 * SAFETY RULE: reading a `\\wsl.localhost\<distro>\...` UNC path STARTS a stopped distro. Fluency must
 * never do that just to read something, so:
 *   - the set of running distros comes from `wsl.exe --list --running --quiet` (UTF-16LE output);
 *   - every UNC access goes through {@link WslScanner.unc}, which throws for a distro that was not in
 *     that list, so no code path can build a UNC path of a stopped distro;
 *   - `docker-desktop` / `docker-desktop-data` are never scanned.
 * The `HKCU\Software\Microsoft\Windows\CurrentVersion\Lxss` registry key has no running flag, so it is
 * deliberately not used as the source of truth for state.
 *
 * Adapters already take file paths, so this module only produces paths: Claude Code, Codex CLI,
 * Copilot CLI and Mistral Vibe (including Agent of Empires sandbox stores) homes are scanned.
 */
import * as fs from 'fs';
import * as path from 'path';
import { execFile } from 'child_process';
import { discoverVibeSessionsInRoot, findVibeSandboxRoots } from './mistralvibe';

/** Distros that are WSL infrastructure, never user environments. */
const EXCLUDED_DISTROS = new Set(['docker-desktop', 'docker-desktop-data']);

/** Environment variable that disables WSL scanning when set to 0 / false / off / no. */
export const WSL_SCAN_ENV_VAR = 'AI_ENGINEERING_FLUENCY_WSL';

let wslScanDisabledOverride = false;

/** Disable WSL scanning for this process (the CLI's `--no-wsl` option). */
export function setWslScanDisabled(disabled: boolean): void {
	wslScanDisabledOverride = disabled;
}

/** Whether WSL scanning is allowed by the CLI flag / environment variable (hosts add their own setting). */
export function isWslScanAllowedByEnvironment(env: NodeJS.ProcessEnv = process.env): boolean {
	if (wslScanDisabledOverride) { return false; }
	const v = (env[WSL_SCAN_ENV_VAR] ?? '').trim().toLowerCase();
	return !['0', 'false', 'off', 'no'].includes(v);
}

/**
 * Decode `wsl.exe` console output. wsl.exe writes UTF-16LE (with or without BOM) when its stdout is a
 * pipe; fall back to UTF-8 when the bytes do not look like UTF-16 so a future change cannot garble names.
 */
export function decodeWslOutput(raw: Buffer | string): string {
	if (typeof raw === 'string') { return raw.replace(/\0/g, ''); }
	if (raw.length >= 2 && raw[0] === 0xff && raw[1] === 0xfe) { return raw.subarray(2).toString('utf16le'); }
	let nulsAtOdd = 0;
	for (let i = 1; i < raw.length; i += 2) { if (raw[i] === 0) { nulsAtOdd++; } }
	const looksUtf16 = raw.length >= 2 && nulsAtOdd >= Math.floor(raw.length / 2) * 0.5;
	return looksUtf16 ? raw.toString('utf16le') : raw.toString('utf8');
}

/** Valid distro names: no path separators or control characters, so a name can never alter a UNC path. */
function isSafeDistroName(name: string): boolean {
	return name.length > 0 && name.length <= 128 && /^[A-Za-z0-9][A-Za-z0-9._ -]*$/.test(name);
}

/** Parse the decoded `wsl.exe --list --running --quiet` output into scannable distro names. */
export function parseRunningDistros(text: string): string[] {
	const names: string[] = [];
	for (const line of text.replace(/^﻿/, '').split(/\r?\n/)) {
		const name = line.trim();
		if (!isSafeDistroName(name)) { continue; }
		if (EXCLUDED_DISTROS.has(name.toLowerCase())) { continue; }
		if (!names.includes(name)) { names.push(name); }
	}
	return names;
}

/** A user home found in a distro's /etc/passwd. */
export interface WslUserHome { user: string; home: string }

/** Parse /etc/passwd, keeping only entries whose home is `/home/<user>` (no nested or system homes). */
export function parsePasswdHomes(passwd: string): WslUserHome[] {
	const homes: WslUserHome[] = [];
	for (const line of passwd.split(/\r?\n/)) {
		if (!line || line.startsWith('#')) { continue; }
		const fields = line.split(':');
		if (fields.length < 6) { continue; }
		const m = /^\/home\/([^/\0]+)$/.exec(fields[5].trim());
		if (!m || m[1] === '.' || m[1] === '..') { continue; }
		if (!homes.some(h => h.home === fields[5].trim())) { homes.push({ user: fields[0], home: fields[5].trim() }); }
	}
	return homes;
}

/** The filesystem calls the scanner makes; injectable so tests can record every path touched. */
export interface WslScanFs {
	readFile(p: string, encoding: 'utf8'): Promise<string>;
	readdir(p: string, options: { withFileTypes: true }): Promise<{ name: string; isDirectory(): boolean; isFile(): boolean }[]>;
	access(p: string): Promise<void>;
}

export interface WslScanDeps {
	platform?: NodeJS.Platform;
	/** Raw output of `wsl.exe --list --running --quiet`, or undefined when wsl.exe is missing / failed. */
	runWslList?: () => Promise<Buffer | string | undefined>;
	fs?: WslScanFs;
	log?: (msg: string) => void;
}

/** Run `wsl.exe --list --running --quiet`; resolves undefined (silently) when it is missing, slow or fails. */
export function runWslListRunning(timeoutMs = 4000): Promise<Buffer | undefined> {
	return new Promise(resolve => {
		try {
			execFile('wsl.exe', ['--list', '--running', '--quiet'], { timeout: timeoutMs, windowsHide: true, encoding: 'buffer' },
				(err, stdout) => resolve(err ? undefined : stdout));
		} catch {
			resolve(undefined);
		}
	});
}

/** Names of the currently RUNNING, scannable distros. Empty off Windows or when wsl.exe is unavailable. */
export async function listRunningDistros(deps: WslScanDeps = {}): Promise<string[]> {
	if ((deps.platform ?? process.platform) !== 'win32') { return []; }
	try {
		const raw = await (deps.runWslList ?? (() => runWslListRunning()))();
		return raw === undefined ? [] : parseRunningDistros(decodeWslOutput(raw));
	} catch {
		return [];
	}
}

/** Where a discovered session file came from. */
export interface WslSessionSource {
	distro: string;
	user?: string;
	/** The AoE session id for sessions stored in an Agent of Empires sandbox store. */
	aoeSessionId?: string;
	/** Short human-readable label, e.g. `WSL:Ubuntu · AoE:3f9a2c1b`. */
	label: string;
}

/** Describe the WSL origin of a session path (`\\wsl.localhost\<distro>\home\<user>\...`), or undefined. */
export function describeWslSessionPath(filePath: string): WslSessionSource | undefined {
	const norm = filePath.replace(/\\/g, '/');
	const m = /^\/\/wsl(?:\.localhost|\$)\/([^/]+)\/home\/([^/]+)\//i.exec(norm);
	if (!m) { return undefined; }
	const aoe = /\/\.vibe\/sandbox-v2\/([^/]+)\//.exec(norm);
	const label = `WSL:${m[1]}` + (aoe ? ` · AoE:${aoe[1].slice(0, 8)}` : '');
	return { distro: m[1], user: m[2], aoeSessionId: aoe?.[1], label };
}

/** Whether a path is inside a WSL distro's filesystem as seen from Windows. */
export function isWslUncPath(filePath: string): boolean {
	return /^\/\/wsl(?:\.localhost|\$)\//i.test(filePath.replace(/\\/g, '/'));
}

const MAX_WALK_DEPTH = 6;

export class WslScanner {
	private readonly running: ReadonlySet<string>;
	private readonly fsApi: WslScanFs;

	constructor(runningDistros: string[], private readonly deps: WslScanDeps = {}) {
		// Re-filter defensively: a caller-supplied list must not smuggle in an excluded or unsafe name.
		this.running = new Set(runningDistros.filter(d => isSafeDistroName(d) && !EXCLUDED_DISTROS.has(d.toLowerCase())));
		this.fsApi = deps.fs ?? fs.promises;
	}

	/**
	 * The ONLY place a `\\wsl.localhost\...` path is built. Throws for a distro that is not running, so a
	 * stopped distro can never be started by a read.
	 */
	unc(distro: string, posixPath: string): string {
		if (!this.running.has(distro)) {
			throw new Error(`Refusing to access WSL distro "${distro}": it is not running`);
		}
		const rel = posixPath.split('/').filter(Boolean);
		if (rel.some(seg => seg === '..' || seg === '.')) { throw new Error('Invalid WSL path'); }
		return `\\\\wsl.localhost\\${distro}\\${rel.join('\\')}`;
	}

	async homes(distro: string): Promise<WslUserHome[]> {
		try {
			return parsePasswdHomes(await this.fsApi.readFile(this.unc(distro, '/etc/passwd'), 'utf8'));
		} catch {
			return [];
		}
	}

	private async walk(dir: string, match: (name: string) => boolean, depth = 0): Promise<string[]> {
		if (depth > MAX_WALK_DEPTH) { return []; }
		let entries;
		try { entries = await this.fsApi.readdir(dir, { withFileTypes: true }); } catch { return []; }
		const out: string[] = [];
		for (const e of entries) {
			const full = path.win32.join(dir, e.name);
			if (e.isDirectory()) { out.push(...await this.walk(full, match, depth + 1)); }
			else if (e.isFile() && match(e.name)) { out.push(full); }
		}
		return out;
	}

	private async scanHome(distro: string, home: WslUserHome): Promise<string[]> {
		const at = (rel: string): string => this.unc(distro, `${home.home}/${rel}`);
		const files: string[] = [];
		files.push(...await this.walk(at('.claude/projects'), n => n.endsWith('.jsonl')));
		for (const sub of ['sessions', 'archived_sessions']) {
			files.push(...await this.walk(at(`.codex/${sub}`), n => /^rollout-.*\.jsonl$/i.test(n)));
		}
		files.push(...await this.walk(at('.copilot/session-state'), n => n === 'events.jsonl'));
		// Mistral Vibe: the home itself plus every AoE sandbox store (~/.vibe/sandbox-v2/<aoe-session-id>/).
		const vibeHome = at('.vibe');
		const vibeFs = this.fsApi;
		const roots = [vibeHome, ...await findVibeSandboxRoots(vibeHome, vibeFs)];
		for (const root of roots) { files.push(...await discoverVibeSessionsInRoot(root, vibeFs)); }
		return files;
	}

	async scanDistro(distro: string): Promise<string[]> {
		const files: string[] = [];
		for (const home of await this.homes(distro)) {
			try { files.push(...await this.scanHome(distro, home)); } catch (e) { this.deps.log?.(`WSL ${distro}/${home.user}: ${e}`); }
		}
		return files;
	}
}

/**
 * Find session files of coding agents inside every RUNNING WSL distro. Never starts a distro; returns [] off
 * Windows, when wsl.exe is unavailable, or when no distro is running.
 */
export async function discoverWslSessionFiles(deps: WslScanDeps = {}): Promise<string[]> {
	const distros = await listRunningDistros(deps);
	if (distros.length === 0) { return []; }
	const scanner = new WslScanner(distros, deps);
	const perDistro = await Promise.all(distros.map(d => scanner.scanDistro(d)));
	const files = perDistro.flat();
	deps.log?.(`🐧 Found ${files.length} session file(s) in ${distros.length} running WSL distro(s): ${distros.join(', ')}`);
	return files;
}

/**
 * Diagnostics rows for the running WSL distros: one per distro with the number of session files found
 * (and per AoE sandbox store). Does a fresh scan of running distros only; empty off Windows / when none run.
 */
export async function getWslDiagnosticRows(deps: WslScanDeps = {}): Promise<{ path: string; exists: boolean; source: string }[]> {
	const distros = await listRunningDistros(deps);
	if (distros.length === 0) { return []; }
	const scanner = new WslScanner(distros, deps);
	const rows: { path: string; exists: boolean; source: string }[] = [];
	for (const distro of distros) {
		const files = await scanner.scanDistro(distro);
		const sandboxes = new Set(files.map(f => describeWslSessionPath(f)?.aoeSessionId).filter(Boolean));
		const extra = sandboxes.size > 0 ? `, ${sandboxes.size} AoE sandbox store(s)` : '';
		rows.push({ path: `\\\\wsl.localhost\\${distro}`, exists: true, source: `WSL:${distro} (running, ${files.length} session file(s)${extra})` });
	}
	return rows;
}
