/**
 * Shared primitives: process spawning, path containment, hashing and logging.
 *
 * Two rules here are load-bearing for the whole pipeline and are the reason
 * this is a module rather than inline calls:
 *
 *   1. **No shell, ever.** Every external program is spawned with an argv
 *      array. Narration text, file names and model output therefore can never
 *      be re-parsed as commands, no matter what a local model emits.
 *   2. **Every path is contained.** Anything that came from the catalog, a
 *      manifest or a model is resolved and then checked to be inside the
 *      project root before it is opened, written or handed to FFmpeg.
 */

import { spawn, type SpawnOptions } from 'node:child_process';
import { createHash } from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';

/** The `release-video/` directory — the root every generated path must sit inside. */
export const PROJECT_ROOT = path.resolve(__dirname, '..');

/** The repository root, one level up. */
export const REPO_ROOT = path.resolve(PROJECT_ROOT, '..');

export interface RunResult {
	readonly code: number;
	readonly stdout: string;
	readonly stderr: string;
}

export interface RunOptions {
	readonly cwd?: string;
	readonly stdin?: string;
	/** Fail the call when the process exits non-zero. Default true. */
	readonly check?: boolean;
	readonly timeoutMs?: number;
	/** Stream child output to this process's stderr as it arrives. */
	readonly stream?: boolean;
	readonly env?: NodeJS.ProcessEnv;
}

/**
 * Runs a program with an explicit argument vector.
 *
 * Deliberately never uses `shell: true`. On Windows that also means a bare
 * command name is resolved by the OS rather than by cmd.exe, so `.cmd` shims
 * (npm, npx) must be passed with their extension by the caller.
 */
export async function run(command: string, args: readonly string[], options: RunOptions = {}): Promise<RunResult> {
	const { cwd, stdin, check = true, timeoutMs, stream = false, env } = options;

	const spawnOptions: SpawnOptions = {
		cwd: cwd ?? PROJECT_ROOT,
		shell: false,
		windowsHide: true,
		env: env ?? process.env,
		stdio: [stdin === undefined ? 'ignore' : 'pipe', 'pipe', 'pipe'],
	};

	return await new Promise<RunResult>((resolve, reject) => {
		const child = spawn(command, [...args], spawnOptions);
		let stdout = '';
		let stderr = '';
		let timer: NodeJS.Timeout | undefined;
		let timedOut = false;

		if (timeoutMs !== undefined) {
			timer = setTimeout(() => {
				timedOut = true;
				child.kill('SIGKILL');
			}, timeoutMs);
		}

		child.stdout?.on('data', (chunk: Buffer) => {
			stdout += chunk.toString('utf8');
		});
		child.stderr?.on('data', (chunk: Buffer) => {
			const text = chunk.toString('utf8');
			stderr += text;
			if (stream) {
				process.stderr.write(text);
			}
		});

		if (stdin !== undefined) {
			child.stdin?.end(stdin, 'utf8');
		}

		child.on('error', (error) => {
			if (timer) { clearTimeout(timer); }
			reject(new Error(`could not start "${command}": ${error.message}`));
		});

		child.on('close', (code) => {
			if (timer) { clearTimeout(timer); }
			const result: RunResult = { code: code ?? -1, stdout, stderr };
			if (timedOut) {
				reject(new Error(`"${command}" timed out after ${timeoutMs}ms`));
				return;
			}
			if (check && result.code !== 0) {
				const detail = (stderr.trim() || stdout.trim()).split('\n').slice(-20).join('\n');
				reject(new Error(`"${command}" exited ${result.code}\n${detail}`));
				return;
			}
			resolve(result);
		});
	});
}

/** True when `command` can be started at all. Used by `doctor`. */
export async function isRunnable(command: string, args: readonly string[] = ['-version']): Promise<boolean> {
	try {
		await run(command, args, { check: false, timeoutMs: 20000 });
		return true;
	} catch {
		return false;
	}
}

/**
 * Resolves `candidate` against the project root and refuses anything that
 * escapes it.
 *
 * This is the allowlist the whole pipeline leans on: an image path from a
 * manifest, a cache key derived from a feature id, or a filename a local model
 * suggested all pass through here before any I/O happens.
 */
export function resolveInProject(candidate: string, label = 'path'): string {
	const resolved = path.resolve(PROJECT_ROOT, candidate);
	const relative = path.relative(PROJECT_ROOT, resolved);
	if (relative.startsWith('..') || path.isAbsolute(relative)) {
		throw new Error(`${label} "${candidate}" resolves outside the project root (${resolved})`);
	}
	return resolved;
}

/**
 * Resolves a path that may live anywhere in the repository, not just in this
 * project.
 *
 * Branding assets — the product logo, the marketplace logos — belong to the
 * repository as a whole and are read-only inputs here, so they are addressed
 * relative to the repo root. Containment still applies: a path that escapes
 * the repository is refused exactly as one escaping the project would be.
 */
export function resolveInRepo(candidate: string, label = 'path'): string {
	const resolved = path.resolve(REPO_ROOT, candidate);
	const relative = path.relative(REPO_ROOT, resolved);
	if (relative.startsWith('..') || path.isAbsolute(relative)) {
		throw new Error(`${label} "${candidate}" resolves outside the repository (${resolved})`);
	}
	return resolved;
}

/**
 * A filename-safe slug. Used for cache keys and scene ids, which become real
 * file names, so the character set is an allowlist rather than a blocklist.
 */
export function slug(value: string): string {
	const cleaned = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
	return cleaned || 'scene';
}

/** Short stable digest, for content-addressed caching. */
export function digest(...parts: readonly unknown[]): string {
	const hash = createHash('sha256');
	for (const part of parts) {
		hash.update(typeof part === 'string' ? part : JSON.stringify(part));
		hash.update('\u0000');
	}
	return hash.digest('hex').slice(0, 16);
}

export function ensureDir(dir: string): string {
	fs.mkdirSync(dir, { recursive: true });
	return dir;
}

export function readJson<T>(file: string): T {
	return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
}

export function writeJson(file: string, value: unknown): void {
	ensureDir(path.dirname(file));
	fs.writeFileSync(file, `${JSON.stringify(value, null, '\t')}\n`, 'utf8');
}

/**
 * Removes `$comment` keys recursively, so config files can document themselves
 * inline and still be plain JSON that any tool can edit.
 */
export function stripComments<T>(value: T): T {
	if (Array.isArray(value)) {
		return value.map((item) => stripComments(item)) as unknown as T;
	}
	if (value && typeof value === 'object') {
		const out: Record<string, unknown> = {};
		for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
			if (key === '$comment') { continue; }
			out[key] = stripComments(item);
		}
		return out as T;
	}
	return value;
}

let indent = 0;

export const log = {
	step(message: string): void {
		process.stderr.write(`${'  '.repeat(indent)}▸ ${message}\n`);
	},
	info(message: string): void {
		process.stderr.write(`${'  '.repeat(indent)}  ${message}\n`);
	},
	warn(message: string): void {
		process.stderr.write(`${'  '.repeat(indent)}! ${message}\n`);
	},
	group(message: string): void {
		log.step(message);
		indent += 1;
	},
	groupEnd(): void {
		indent = Math.max(0, indent - 1);
	},
};

/** Formats seconds as `H:MM:SS.cc`, the form ASS timestamps take. */
export function assTime(seconds: number): string {
	const clamped = Math.max(0, seconds);
	const hours = Math.floor(clamped / 3600);
	const minutes = Math.floor((clamped % 3600) / 60);
	const secs = Math.floor(clamped % 60);
	const centis = Math.round((clamped - Math.floor(clamped)) * 100);
	const pad = (n: number, width: number) => String(n).padStart(width, '0');
	return `${hours}:${pad(minutes, 2)}:${pad(secs, 2)}.${pad(Math.min(centis, 99), 2)}`;
}
