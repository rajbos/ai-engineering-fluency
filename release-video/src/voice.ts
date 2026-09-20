/**
 * Stage 3 — generate one narration WAV per scene, then measure it.
 *
 * ## Caching is the point
 *
 * Every WAV is content-addressed on the exact text spoken plus the engine and
 * every parameter that affects the output. Re-running the pipeline after
 * editing one sentence regenerates one sentence. This matters for more than
 * speed: cloned-voice TTS is not deterministic, so regenerating an unchanged
 * scene would subtly change its delivery and make the video sound like it was
 * recorded in two sittings.
 *
 * ## Engines
 *
 * All four write a WAV and nothing else, so the rest of the pipeline is
 * identical whichever you use:
 *
 *   - `voicebox` — your cloned voice, over HTTP. Runs in its own process, so
 *     the TTS model never shares VRAM with FFmpeg's encoder or with Whisper.
 *     On a 6 GB card that separation is not optional.
 *   - `sapi`     — Windows' built-in synthesizer. Installed already, generic
 *     voice. The fastest route to a watchable first cut.
 *   - `command`  — any CLI that writes a WAV (piper, a Chatterbox script).
 *   - `silence`  — no speech; durations estimated. For checking motion and
 *     pacing without waiting on a model.
 *
 * Pronunciation overrides are applied here and nowhere else, so the captions
 * keep the real spelling while the voice gets the phonetic one.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

import { paths, type Config, type VoiceEngine } from './config';
import { normalizeWav, probeDuration, writeSilence } from './media';
import { validateManifest, type Manifest, type Scene } from './manifest';
import { applyPronunciation, estimateSeconds, type PronunciationMap } from './speech';
import { digest, ensureDir, log, PROJECT_ROOT, readJson, run, resolveInProject } from './util';

export interface VoiceOptions {
	/** Regenerate every WAV even when a cached one matches. */
	readonly force?: boolean;
}

/**
 * Generates (or reuses) narration for every scene and returns a manifest with
 * `audio`, `audioSeconds` and `durationSeconds` filled in.
 */
export async function generateVoice(manifest: Manifest, config: Config, options: VoiceOptions = {}): Promise<Manifest> {
	const engine = config.voice.engine;
	ensureDir(paths.narration);
	const pronunciation = loadPronunciation();

	log.group(`Narrating ${manifest.scenes.length} scene(s) with the "${engine}" engine`);
	let generated = 0;
	let reused = 0;

	const scenes: Scene[] = [];
	for (const scene of manifest.scenes) {
		const spoken = applyPronunciation(scene.narration, pronunciation);
		const key = digest(spoken, engine, engineFingerprint(config));
		const wav = path.join(paths.narration, `${scene.id}-${key}.wav`);

		if (options.force || !fs.existsSync(wav)) {
			await synthesize(engine, spoken, wav, config);
			generated += 1;
		} else {
			reused += 1;
		}

		const audioSeconds = await probeDuration(config, wav);
		const durationSeconds = Math.max(
			config.motion.minSceneSeconds,
			audioSeconds + config.motion.paddingSeconds,
		);

		scenes.push({
			...scene,
			audio: path.relative(PROJECT_ROOT, wav).split(path.sep).join('/'),
			audioSeconds: Number(audioSeconds.toFixed(3)),
			durationSeconds: Number(durationSeconds.toFixed(3)),
		});
		log.info(`${scene.id} — ${audioSeconds.toFixed(2)}s audio, ${durationSeconds.toFixed(2)}s scene`);
	}

	const total = scenes.reduce((sum, scene) => sum + (scene.durationSeconds ?? 0), 0);
	log.info(`${generated} generated, ${reused} reused from cache — ${formatClock(total)} total before transitions`);
	log.groupEnd();

	return validateManifest({ ...manifest, scenes }, { requireAssets: true });
}

/**
 * Speaks one piece of text with the configured engine, bypassing the manifest.
 *
 * This is how you audition a voice: the same engine, the same pronunciation
 * overrides and the same normalisation the real narration goes through, but on
 * a sentence you choose. Comparing two engines fairly means running both
 * through this rather than through whatever each one's own demo page does.
 *
 * Deliberately uncached — the point is to hear what it produces *now*.
 */
export async function speakOnce(text: string, outFile: string, config: Config): Promise<number> {
	ensureDir(path.dirname(outFile));
	const spoken = applyPronunciation(text, loadPronunciation());
	await synthesize(config.voice.engine, spoken, outFile, config);
	return await probeDuration(config, outFile);
}

/** Everything that changes the sound of the output, for the cache key. */
function engineFingerprint(config: Config): unknown {
	switch (config.voice.engine) {
		case 'voicebox': {
			const voicebox = config.voice.voicebox;
			const reference = resolveOptional(voicebox.referenceWav);
			return {
				model: voicebox.model,
				exaggeration: voicebox.exaggeration,
				cfgWeight: voicebox.cfgWeight,
				// The reference recording itself is part of the identity of the
				// voice: swapping it must invalidate every cached line.
				reference: reference ? digest(fs.readFileSync(reference)) : 'none',
			};
		}
		case 'mistral': {
			const mistral = config.voice.mistral;
			// The API key is deliberately absent: rotating a key must not throw
			// away a cache of audio that would come back byte-identical.
			return { model: mistral.model, voiceId: mistral.voiceId, format: mistral.responseFormat };
		}
		case 'sapi':
			return { voice: config.voice.sapi.voiceName, rate: config.voice.sapi.rate };
		case 'command':
			return { argv: config.voice.command.argv, stdinText: config.voice.command.stdinText };
		case 'silence':
			return { kind: 'silence' };
		default:
			return {};
	}
}

async function synthesize(engine: VoiceEngine, text: string, outFile: string, config: Config): Promise<void> {
	// No extension: engines return different containers (Mistral returns mp3),
	// and ffmpeg probes by content anyway. Calling it `.raw.wav` would have
	// been a lie that only mattered when someone opened it.
	const raw = `${outFile}.raw`;
	switch (engine) {
		case 'mistral':
			await synthesizeMistral(text, raw, config);
			break;
		case 'voicebox':
			await synthesizeVoicebox(text, raw, config);
			break;
		case 'sapi':
			await synthesizeSapi(text, raw, config);
			break;
		case 'command':
			await synthesizeCommand(text, raw, config);
			break;
		case 'silence':
			await writeSilence(config, outFile, Math.max(1.5, estimateSeconds(text)));
			return;
		default:
			throw new Error(`unknown voice engine "${engine as string}"`);
	}

	await normalizeWav(config, raw, outFile);
	fs.rmSync(raw, { force: true });
}

/**
 * Mistral's hosted TTS, with a voice cloned in their console.
 *
 * The one engine here that is not local: the narration text is sent to
 * Mistral and the call is billed. Everything downstream is unchanged — it
 * writes an audio file and the pipeline normalises it like any other — but the
 * privacy and cost properties of a build are not, so it is opt-in and the
 * config file says so.
 *
 * Implemented with `fetch` rather than `@mistralai/mistralai` on purpose: this
 * package has no runtime dependencies, and the SDK would add a tree of them
 * for a single POST. The request body mirrors the SDK's arguments exactly, so
 * their documented example and this adapter stay comparable.
 *
 * The API key comes from the environment, never from `config.json`, which is
 * committed. It is also never interpolated into an error message.
 */
async function synthesizeMistral(text: string, outFile: string, config: Config): Promise<void> {
	const mistral = config.voice.mistral;
	const apiKey = process.env[mistral.apiKeyEnv];
	if (!apiKey) {
		throw new Error(
			`${mistral.apiKeyEnv} is not set. Mistral TTS needs an API key in that ` +
			'environment variable; it is deliberately not read from config.json.',
		);
	}

	const url = `${mistral.endpoint.replace(/\/+$/, '')}${mistral.path}`;
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), mistral.timeoutMs);

	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify({
				model: mistral.model,
				input: text,
				voice_id: mistral.voiceId,
				response_format: mistral.responseFormat,
				stream: false,
			}),
			signal: controller.signal,
		});

		if (!response.ok) {
			const detail = await response.text().catch(() => '');
			throw new Error(`${url} returned ${response.status} ${response.statusText}. ${detail.slice(0, 400)}`);
		}

		const audio = await readAudioResponse(response);
		if (audio.length < 100) {
			throw new Error(`${url} returned ${audio.length} bytes — that is not audio`);
		}
		fs.writeFileSync(outFile, audio);
	} finally {
		clearTimeout(timer);
	}
}

/**
 * Pulls audio bytes out of a TTS response.
 *
 * Handles both shapes a speech endpoint can answer with: a JSON envelope
 * carrying base64 (what the Mistral SDK surfaces as `audioData`), or the audio
 * bytes directly. Sniffing the content type rather than assuming means this
 * keeps working if the endpoint switches to streaming raw bytes.
 */
async function readAudioResponse(response: Response): Promise<Buffer> {
	const contentType = response.headers.get('content-type') ?? '';
	if (!contentType.includes('json')) {
		return Buffer.from(await response.arrayBuffer());
	}

	const payload = await response.json() as Record<string, unknown>;
	const base64 = ['audio_data', 'audioData', 'audio', 'data']
		.map((key) => payload[key])
		.find((value): value is string => typeof value === 'string' && value.length > 0);

	if (!base64) {
		throw new Error(`no audio field in the JSON response (keys: ${Object.keys(payload).join(', ')})`);
	}
	return Buffer.from(base64, 'base64');
}

/**
 * Posts to a local Voicebox (or any OpenAI-compatible local TTS) server.
 *
 * The endpoint path and the extra body fields live in `config.json` rather
 * than in code, because local TTS servers differ on the names of the cloning
 * parameters and the build on your machine is the authority. Point a browser
 * at `<endpoint>/docs` to see the schema it actually accepts.
 */
async function synthesizeVoicebox(text: string, outFile: string, config: Config): Promise<void> {
	const voicebox = config.voice.voicebox;
	const url = `${voicebox.endpoint.replace(/\/+$/, '')}${voicebox.path}`;
	const referenceWav = resolveOptional(voicebox.referenceWav);
	const referenceText = resolveOptional(voicebox.referenceText);

	const body: Record<string, unknown> = {
		model: voicebox.model,
		input: text,
		response_format: 'wav',
		exaggeration: voicebox.exaggeration,
		cfg_weight: voicebox.cfgWeight,
		...(referenceWav ? { reference_audio: referenceWav } : {}),
		...(referenceText ? { reference_text: fs.readFileSync(referenceText, 'utf8').trim() } : {}),
		...(voicebox.extra ?? {}),
	};

	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), voicebox.timeoutMs);
	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(body),
			signal: controller.signal,
		});
		if (!response.ok) {
			const detail = await response.text().catch(() => '');
			throw new Error(
				`${url} returned ${response.status} ${response.statusText}. ${detail.slice(0, 400)}\n` +
				`Check the schema at ${voicebox.endpoint}/docs and adjust voice.voicebox in config.json.`,
			);
		}
		const buffer = Buffer.from(await response.arrayBuffer());
		if (buffer.length < 100) {
			throw new Error(`${url} returned ${buffer.length} bytes — that is not a WAV`);
		}
		fs.writeFileSync(outFile, buffer);
	} finally {
		clearTimeout(timer);
	}
}

/**
 * Windows' built-in speech synthesizer, via a script file.
 *
 * The narration is passed as a *file path*, never interpolated into a
 * PowerShell command line — so no amount of punctuation in a release note can
 * turn into a command.
 */
async function synthesizeSapi(text: string, outFile: string, config: Config): Promise<void> {
	const scriptFile = path.join(PROJECT_ROOT, 'scripts', 'sapi-speak.ps1');
	if (!fs.existsSync(scriptFile)) {
		throw new Error(`missing ${scriptFile}`);
	}
	const textFile = `${outFile}.txt`;
	ensureDir(path.dirname(textFile));
	fs.writeFileSync(textFile, text, 'utf8');

	try {
		await run('powershell.exe', [
			'-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass',
			'-File', scriptFile,
			'-TextFile', textFile,
			'-OutFile', outFile,
			'-Rate', String(config.voice.sapi.rate),
			...(config.voice.sapi.voiceName ? ['-VoiceName', config.voice.sapi.voiceName] : []),
		], { timeoutMs: 120000 });
	} finally {
		fs.rmSync(textFile, { force: true });
	}
}

/**
 * Any TTS CLI. `{{text}}`, `{{out}}`, `{{referenceWav}}` and
 * `{{referenceText}}` are substituted as whole argv entries, so the text is
 * one argument no matter what it contains.
 */
async function synthesizeCommand(text: string, outFile: string, config: Config): Promise<void> {
	const template = config.voice.command.argv;
	if (!Array.isArray(template) || template.length === 0) {
		throw new Error('voice.command.argv is empty — set the TTS command to run in config.json');
	}
	const referenceWav = resolveOptional(config.voice.voicebox.referenceWav) ?? '';
	const referenceText = resolveOptional(config.voice.voicebox.referenceText) ?? '';

	// {{textFile}} writes the text to a temp file and substitutes its path.
	// Preferred over {{text}} for anything long: it sidesteps command-line
	// length limits and any question of how the child decodes its argv, which
	// matters once narration contains curly quotes or an em dash.
	const needsTextFile = template.some((token) => token.includes('{{textFile}}'));
	const textFile = needsTextFile ? `${outFile}.txt` : null;
	if (textFile) {
		ensureDir(path.dirname(textFile));
		fs.writeFileSync(textFile, text, 'utf8');
	}

	const argv = template.map((token) => token
		.replace('{{text}}', text)
		.replace('{{textFile}}', textFile ?? '')
		.replace('{{out}}', outFile)
		.replace('{{referenceWav}}', referenceWav)
		.replace('{{referenceText}}', referenceText));

	const [rawCommand, ...args] = argv;
	if (!rawCommand) { throw new Error('voice.command.argv has no command'); }

	// A command containing a path separator is a file in this project — an
	// interpreter in a TTS virtualenv, typically. It has to be resolved to an
	// absolute path here: Windows resolves a relative executable against the
	// *parent's* working directory rather than the child's, so `.venv-tts/...`
	// would be looked up wherever npm happened to be invoked from.
	const command = /[\\/]/.test(rawCommand)
		? resolveInProject(rawCommand, 'voice.command.argv[0]')
		: rawCommand;

	try {
		await run(command, args, {
			// A cloning model on CPU is slow: a paragraph can take minutes, and
			// the first run also downloads model weights.
			timeoutMs: 1800000,
			stream: true,
			...(config.voice.command.stdinText && !needsTextFile ? { stdin: text } : {}),
		});
	} finally {
		if (textFile) { fs.rmSync(textFile, { force: true }); }
	}

	if (!fs.existsSync(outFile)) {
		throw new Error(`${command} exited cleanly but wrote no file at ${outFile}`);
	}
}

/** Resolves an optional project-relative asset, returning null when absent. */
function resolveOptional(candidate: string | undefined): string | null {
	if (!candidate) { return null; }
	const resolved = resolveInProject(candidate, 'voice reference');
	return fs.existsSync(resolved) ? resolved : null;
}

function loadPronunciation(): PronunciationMap | undefined {
	if (!fs.existsSync(paths.pronunciation)) { return undefined; }
	try {
		const parsed = readJson<PronunciationMap>(paths.pronunciation);
		const count = Object.keys(parsed.replacements ?? {}).length;
		if (count > 0) { log.info(`${count} pronunciation override(s) loaded`); }
		return parsed;
	} catch (error) {
		log.warn(`Ignoring pronunciation.json: ${(error as Error).message}`);
		return undefined;
	}
}

export function formatClock(seconds: number): string {
	// Round first: taking the modulo before rounding turns 59.6s into "0:60".
	const total = Math.round(Math.max(0, seconds));
	return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}
