#!/usr/bin/env node
/**
 * The one command.
 *
 *   npm run video -- build
 *
 * runs every stage in order and leaves an MP4 in `output/`. Each stage is also
 * a subcommand, because the expensive and the cheap parts of this pipeline are
 * very unevenly matched: re-rendering after a wording change should not
 * re-capture screenshots, and re-capturing after a UI change should not
 * regenerate narration. Every stage is individually resumable, and its output
 * is a file on disk you can read and edit.
 *
 * The manifest is the seam. `plan` writes it, everything after reads it, and
 * you are expected to edit it by hand between the two.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { createInterface } from 'node:readline/promises';

import { loadConfig, paths, type Config, type VoiceEngine } from './config';
import { doctor } from './doctor';
import { loadManifest, type Manifest } from './manifest';
import { plan } from './plan';
import { polishNarration } from './llm';
import { readCatalog, selectRelease } from './catalog';
import { countWords, estimateSeconds } from './speech';
import { qa } from './qa';
import { render } from './render';
import { captureShots } from './shots';
import { generateSubtitles, subtitleFileFor } from './subtitles';
import { buildTimeline } from './timeline';
import { formatClock, generateVoice, speakOnce } from './voice';
import { log, PROJECT_ROOT, resolveInProject, run, writeJson } from './util';

const STAGES = ['plan', 'shots', 'voice', 'subs', 'render', 'qa'] as const;
const VOICE_ENGINES: readonly VoiceEngine[] = ['mistral', 'voicebox', 'sapi', 'command', 'silence'];
type Stage = (typeof STAGES)[number];

interface Args {
	readonly command: string;
	readonly version?: string;
	readonly since?: string;
	readonly voice?: VoiceEngine;
	readonly output?: string;
	readonly maxFeatures?: number;
	readonly text?: string;
	readonly textFile?: string;
	readonly force: boolean;
	readonly keepNarration: boolean;
	readonly llm?: boolean;
	readonly from?: Stage;
}

function parseArgs(argv: readonly string[]): Args {
	const positional: string[] = [];
	const flags: Record<string, string | boolean> = {};

	for (let i = 0; i < argv.length; i++) {
		const token = argv[i];
		if (token === undefined) { continue; }
		if (!token.startsWith('--')) { positional.push(token); continue; }
		const key = token.slice(2);
		const next = argv[i + 1];
		if (next === undefined || next.startsWith('--')) {
			flags[key] = true;
		} else {
			flags[key] = next;
			i++;
		}
	}

	const asString = (key: string): string | undefined =>
		typeof flags[key] === 'string' ? (flags[key] as string) : undefined;

	const from = asString('from');
	if (from !== undefined && !STAGES.includes(from as Stage)) {
		throw new Error(`--from must be one of ${STAGES.join(', ')}`);
	}

	const voice = asString('voice');
	if (voice !== undefined && !VOICE_ENGINES.includes(voice as VoiceEngine)) {
		throw new Error(`--voice must be one of ${VOICE_ENGINES.join(', ')}`);
	}

	return {
		command: positional[0] ?? 'build',
		...(voice !== undefined ? { voice: voice as VoiceEngine } : {}),
		...(asString('version') !== undefined ? { version: asString('version') } : {}),
		...(asString('since') !== undefined ? { since: asString('since') } : {}),
		...(asString('output') !== undefined ? { output: asString('output') } : {}),
		...(asString('max-features') !== undefined ? { maxFeatures: Number(asString('max-features')) } : {}),
		...(asString('text') !== undefined ? { text: asString('text') } : {}),
		...(asString('text-file') !== undefined ? { textFile: asString('text-file') } : {}),
		force: flags.force === true,
		keepNarration: flags['keep-narration'] === true,
		...(flags.llm !== undefined ? { llm: flags.llm !== 'false' && flags.llm !== false } : {}),
		...(from !== undefined ? { from: from as Stage } : {}),
	};
}

const USAGE = `
Local release-video generator.

  npm run video -- <command> [options]

Commands
  build              Run every stage: plan, shots, voice, subs, render, qa
  plan               Release catalog -> content/manifest.json
  shots              Capture the screenshots the manifest points at
  voice              Generate narration WAVs and measure them
  subs               Build the ASS captions and title bands
  render             Render scenes and assemble the MP4
  qa                 Probe the rendered file against the plan
  doctor             Check ffmpeg, the harness, the voice engine and the model
  releases           List the catalogued releases, to choose --since
  voices            List the installed Windows SAPI voices
  say                Speak --text or --text-file with the configured voice engine
  script             Print the narration script (add --llm to preview a polish)
  timeline           Print the planned running order without rendering

Options
  --version <x.y.z>  Release to make a video about (default: newest with features)
  --since <x.y.z>    Also cover every release after this one: the last version
                     an earlier video covered. "none" = only --version. When
                     omitted in a terminal, plan asks; otherwise it is "none"
  --voice <engine>   Voice engine for this run, overriding config.json:
                     mistral (your cloned voice, billed), command (Piper),
                     voicebox, sapi or silence
  --max-features <n> Only cover the first n features
  --keep-narration   Re-plan but keep narration you have already edited
  --llm              Polish narration with the local model (overrides config)
  --output <file>    Where to write the MP4, or the WAV for "say"
  --text <words>     Text for "say"
  --text-file <path> File of text for "say"
  --from <stage>     With "build", start at this stage and run the rest
  --force            Ignore caches: re-capture, re-narrate, re-render

Examples
  npm run video -- doctor
  npm run video -- build
  npm run video -- releases
  npm run video -- build --since 0.17.2 --voice mistral
  npm run video -- build --version 0.18.0 --llm
  npm run video -- build --from render --force
`;

async function main(): Promise<number> {
	const args = parseArgs(process.argv.slice(2));
	const config = withVoiceOverride(loadConfig(), args.voice);

	switch (args.command) {
		case 'help':
		case '--help':
			process.stdout.write(`${USAGE}\n`);
			return 0;

		case 'doctor':
			return (await doctor(config)) ? 0 : 1;

		case 'releases':
			printReleases();
			return 0;

		case 'voices': {
			const script = path.join(PROJECT_ROOT, 'scripts', 'sapi-speak.ps1');
			const { stdout } = await run('powershell.exe', [
				'-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass',
				'-File', script, '-ListVoices',
			], { check: false, timeoutMs: 60000 });
			process.stdout.write(stdout);
			return 0;
		}

		case 'script': {
			// Prints narration and writes nothing, so it is safe to run while a
			// render is in flight — and it is the cheap way to judge wording
			// before spending a few minutes of TTS and encoding on it.
			const manifest = requireManifest();
			const polished = args.llm
				? await polishNarration(manifest, config, selectRelease(manifest.project.version))
				: manifest;
			for (const scene of polished.scenes) {
				process.stdout.write(`
[${scene.id}]
${scene.narration}
`);
			}
			const words = polished.scenes.reduce((sum, scene) => sum + countWords(scene.narration), 0);
			const spoken = polished.scenes.reduce((sum, scene) => sum + estimateSeconds(scene.narration), 0);
			process.stdout.write(`
${polished.scenes.length} scenes, ${words} words, roughly ${formatClock(spoken)} of speech
`);
			return 0;
		}

		case 'say': {
			// Audition the configured engine on arbitrary text.
			const text = args.text ?? (args.textFile ? fs.readFileSync(resolveInProject(args.textFile, '--text-file'), 'utf8') : '');
			if (!text.trim()) {
				throw new Error('say needs --text "..." or --text-file <path>');
			}
			const outFile = resolveInProject(args.output ?? 'output/say.wav', '--output');
			log.group(`Speaking ${countWords(text)} words with the "${config.voice.engine}" engine`);
			const seconds = await speakOnce(text.trim(), outFile, config);
			log.info(`${seconds.toFixed(2)}s → ${path.relative(process.cwd(), outFile)}`);
			log.groupEnd();
			return 0;
		}

		case 'timeline': {
			printTimeline(requireManifest(), config);
			return 0;
		}

		case 'plan':
			await plan(config, await planOptions(args));
			return 0;

		case 'shots': {
			const manifest = await captureShots(requireManifest(), config, { force: args.force });
			writeJson(paths.manifest, manifest);
			return 0;
		}

		case 'voice': {
			const manifest = await generateVoice(requireManifest(), config, { force: args.force });
			writeJson(paths.manifest, manifest);
			return 0;
		}

		case 'subs':
			await generateSubtitles(requireManifest({ requireAssets: true }), config);
			return 0;

		case 'render': {
			const manifest = requireManifest({ requireAssets: true });
			const subtitleFile = existingSubtitleFile(manifest);
			await render(manifest, config, {
				...(args.output !== undefined ? { output: args.output } : {}),
				subtitleFile,
				force: args.force,
			});
			return 0;
		}

		case 'qa': {
			const manifest = requireManifest({ requireAssets: true });
			// Through the allowlist, like every other path this CLI accepts.
			// `render --output` was already contained and this was not, which
			// made the same flag mean two different things depending on the
			// subcommand.
			const file = args.output
				? resolveInProject(args.output, '--output')
				: defaultOutputFor(manifest);
			const report = await qa(file, manifest, config);
			return report.passed ? 0 : 1;
		}

		case 'build':
			return await build(args, config);

		default:
			// `npm run video --since 0.17.2` (no `--`) makes npm eat the flag and
			// pass only its value, which then arrives here as the command.
			if (/^\d+(\.\d+){0,2}$/.test(args.command)) {
				process.stderr.write(
					`"${args.command}" looks like a version, not a command: npm kept the flag before it.\n` +
					`Put "--" after "video" and name the command, e.g.\n` +
					`  npm run video -- build --since ${args.command}\n`,
				);
				return 2;
			}
			process.stderr.write(`Unknown command "${args.command}".\n${USAGE}\n`);
			return 2;
	}
}

/** The whole pipeline, resumable with `--from`. */
async function build(args: Args, config: ReturnType<typeof loadConfig>): Promise<number> {
	const startAt = STAGES.indexOf(args.from ?? 'plan');
	const shouldRun = (stage: Stage) => STAGES.indexOf(stage) >= startAt;

	let manifest: Manifest;

	if (shouldRun('plan')) {
		manifest = await plan(config, await planOptions(args));
	} else {
		manifest = requireManifest();
	}

	if (shouldRun('shots')) {
		manifest = await captureShots(manifest, config, { force: args.force });
		writeJson(paths.manifest, manifest);
	}

	if (shouldRun('voice')) {
		manifest = await generateVoice(manifest, config, { force: args.force });
		writeJson(paths.manifest, manifest);
	}

	let subtitleFile: string | null = null;
	if (shouldRun('subs')) {
		subtitleFile = await generateSubtitles(manifest, config);
	} else {
		subtitleFile = existingSubtitleFile(manifest);
	}

	let output = args.output ?? defaultOutputFor(manifest);
	if (shouldRun('render')) {
		output = await render(manifest, config, {
			...(args.output !== undefined ? { output: args.output } : {}),
			subtitleFile,
			force: args.force,
		});
	}

	if (shouldRun('qa')) {
		const report = await qa(output, manifest, config);
		if (!report.passed) { return 1; }
	}

	const timeline = buildTimeline(manifest, config);
	log.step(`Done — ${formatClock(timeline.totalSeconds)}, ${manifest.scenes.length} scenes`);
	log.info(path.resolve(output));
	return 0;
}

async function planOptions(args: Args) {
	const since = await resolveSince(args);
	return {
		...(args.version !== undefined ? { version: args.version } : {}),
		...(since !== undefined ? { since } : {}),
		...(args.maxFeatures !== undefined ? { maxFeatures: args.maxFeatures } : {}),
		keepNarration: args.keepNarration,
		...(args.llm !== undefined ? { useLlm: args.llm } : {}),
	};
}

/**
 * `--voice` picks the engine for one run without editing the committed
 * config. The engine's own settings (Mistral voiceId, Piper argv) still come
 * from `config.json`, and the narration cache key follows the engine, so
 * switching back and forth never mixes voices in one soundtrack.
 */
function withVoiceOverride(config: Config, engine: VoiceEngine | undefined): Config {
	if (engine === undefined || engine === config.voice.engine) { return config; }
	return { ...config, voice: { ...config.voice, engine } };
}

/**
 * Which releases the video spans.
 *
 * Videos are not made for every bump, so defaulting to the newest release
 * alone silently drops everything shipped since the previous video. In a
 * terminal, ask; elsewhere (an agent, a script) use only the target release
 * and say how to widen it.
 */
async function resolveSince(args: Args): Promise<string | undefined> {
	if (args.since !== undefined) {
		return args.since === 'none' ? undefined : args.since;
	}
	if (!process.stdin.isTTY) {
		log.info('Covering one release. Pass --since <version> to include everything after an earlier video');
		return undefined;
	}

	printReleases();
	const prompt = createInterface({ input: process.stdin, output: process.stdout });
	try {
		const answer = (await prompt.question(
			'Last version an earlier video already covered (Enter = only the newest release): ',
		)).trim();
		return answer === '' || answer === 'none' ? undefined : answer;
	} finally {
		prompt.close();
	}
}

function printReleases(): void {
	log.group('Catalogued releases, newest first');
	for (const release of readCatalog()) {
		log.info(
			`${release.version.padEnd(8)} ${(release.date ?? 'unreleased').padEnd(11)} ` +
			`${release.features.length} feature(s)`,
		);
	}
	log.groupEnd();
}

function requireManifest(options?: { requireAssets?: boolean }): Manifest {
	if (!fs.existsSync(paths.manifest)) {
		throw new Error(`no manifest at ${paths.manifest} — run "npm run video -- plan" first`);
	}
	return loadManifest(paths.manifest, options);
}

function existingSubtitleFile(manifest: Manifest): string | null {
	const file = subtitleFileFor(manifest);
	return fs.existsSync(file) ? file : null;
}

function defaultOutputFor(manifest: Manifest): string {
	const name = manifest.project.title.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/^-+|-+$/g, '');
	return path.join(paths.output, `${name || 'release'}.mp4`);
}

function printTimeline(manifest: Manifest, config: ReturnType<typeof loadConfig>): void {
	const timeline = buildTimeline(manifest, config);
	log.group(`${manifest.project.title} — ${formatClock(timeline.totalSeconds)}`);
	for (const entry of timeline.entries) {
		log.info(
			`${formatClock(entry.start).padStart(5)}  ${entry.scene.id.padEnd(30)} ` +
			`${entry.duration.toFixed(1).padStart(5)}s  ${entry.scene.title}`,
		);
	}
	log.groupEnd();
}

main()
	.then((code) => { process.exitCode = code; })
	.catch((error: Error) => {
		process.stderr.write(`\n✗ ${error.message}\n`);
		process.exitCode = 1;
	});
