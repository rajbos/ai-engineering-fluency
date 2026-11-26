/**
 * Team Server upload for the desktop app.
 *
 * Lets the tray app send its daily rollups to a self-hosted sharing server, like the VS Code
 * extension's `backend.sharingServer.*` settings do. Everything that decides *what* is uploaded
 * is shared: the rollup builder and the upload payload live in the repo-root
 * `src/teamServer/`, and each session is parsed by the CLI's own session processing. This file
 * only owns the desktop's settings file, its GitHub sign-in, and the sync schedule.
 */

import { app, safeStorage } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { DailyRollupBuilder } from '../../src/teamServer/dailyRollupBuilder';
import { buildTeamServerEntries, canonicalTeamServerUrl } from '../../src/teamServer/teamServerEntries';
import { SharingServerUploadService } from '../../src/teamServer/sharingServerUploadService';
import { buildFluencyScorePayload, type FluencyScoreSource } from '../../src/teamServer/fluencyScorePayload';
import { computeBackendSharingPolicy, parseBackendSharingProfile, type BackendSharingProfile } from '../../src/teamServer/sharingProfile';
import { estimateTokensFromText, getModelFromRequest } from '../../src/tokenEstimation';
import { discoverSessionFiles, getSessionFileCacheForRollups } from '../../cli/src/helpers';
import { modelPricing, statSessionFile, tokenEstimators } from '../../cli/src/sessionProcessing';

/** Sharing profiles a team server upload can use (`off` is expressed by `enabled: false`). */
export type TeamServerProfile = Exclude<BackendSharingProfile, 'off'>;

export interface TeamServerSettings {
    enabled: boolean;
    endpointUrl: string;
    datasetId: string;
    sharingProfile: TeamServerProfile;
    /** Workspace and machine names are only ever sent for profiles that allow them. */
    shareWorkspaceMachineNames: boolean;
    lookbackDays: number;
}

export interface TeamServerStatus {
    state: 'disabled' | 'signed-out' | 'idle' | 'syncing' | 'ok' | 'error';
    message?: string;
    lastSyncAt?: number;
    githubLogin?: string;
}

/**
 * GitHub OAuth App used for the device-flow sign-in. This is the *publisher's* app, registered
 * once and shipped in every build — the person installing the desktop app never sets it; they
 * only sign in, and uploads use their own token. OAuth client IDs are public (the device flow
 * has no client secret), so it lives in source. Register the app under
 * Settings → Developer settings → OAuth Apps with "Enable Device Flow" ticked, then paste its
 * client ID here. `AIEF_GITHUB_CLIENT_ID` overrides it for development only.
 */
const GITHUB_OAUTH_CLIENT_ID = '';

/** A GitHub request that has not answered by then is abandoned, so sign-in cannot hang on it. */
const GITHUB_REQUEST_TIMEOUT_MS = 30_000;

/** Same scope the extension requests: enough for the server to read the user's identity. */
const GITHUB_SCOPE = 'read:user';

/**
 * How often the desktop app uploads. Longer than the extension's 5-minute timer because the
 * desktop walks the session history on its main process.
 */
export const TEAM_SERVER_SYNC_INTERVAL_MS = 15 * 60 * 1000;
const INITIAL_SYNC_DELAY_MS = 60 * 1000;

export const DEFAULT_TEAM_SERVER_SETTINGS: TeamServerSettings = {
    enabled: false,
    endpointUrl: '',
    datasetId: 'default',
    sharingProfile: 'teamAnonymized',
    shareWorkspaceMachineNames: false,
    lookbackDays: 30,
};

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

function settingsPath(): string { return path.join(app.getPath('userData'), 'team-server.json'); }
function tokenPath(): string { return path.join(app.getPath('userData'), 'team-server-token.bin'); }

/**
 * Validate an endpoint URL: https, or http only for a server on this machine. A bearer GitHub
 * token must never be sent in the clear to another host.
 */
export function validateEndpointUrl(raw: string): string | undefined {
    const value = raw.trim();
    if (!value) { return 'Enter the team server URL.'; }
    let url: URL;
    try { url = new URL(value); } catch { return 'That is not a valid URL.'; }
    if (url.protocol === 'https:') { return undefined; }
    if (url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) { return undefined; }
    return 'Use an https:// URL (http:// is only allowed for localhost).';
}

/** Coerce untrusted JSON (the settings file, or the settings page) into valid settings. */
export function normalizeTeamServerSettings(raw: unknown): TeamServerSettings {
    const input = (raw && typeof raw === 'object') ? raw as Record<string, unknown> : {};
    const profile = parseBackendSharingProfile(input.sharingProfile);
    const lookback = Number(input.lookbackDays);
    return {
        enabled: input.enabled === true,
        endpointUrl: typeof input.endpointUrl === 'string' ? input.endpointUrl.trim() : '',
        datasetId: (typeof input.datasetId === 'string' && input.datasetId.trim()) ? input.datasetId.trim() : DEFAULT_TEAM_SERVER_SETTINGS.datasetId,
        sharingProfile: profile && profile !== 'off' ? profile : DEFAULT_TEAM_SERVER_SETTINGS.sharingProfile,
        shareWorkspaceMachineNames: input.shareWorkspaceMachineNames === true,
        lookbackDays: Number.isFinite(lookback) ? Math.max(1, Math.min(90, Math.round(lookback))) : DEFAULT_TEAM_SERVER_SETTINGS.lookbackDays,
    };
}

interface StoredSettingsFile extends TeamServerSettings {
    /** Random per-install id used as the rollup machine dimension (hashed per dataset for team profiles). */
    machineId: string;
}

function readSettingsFile(): StoredSettingsFile {
    let raw: unknown = {};
    try { raw = JSON.parse(fs.readFileSync(settingsPath(), 'utf-8')); } catch { /* first run or unreadable: defaults */ }
    const machineId = (raw && typeof raw === 'object' && typeof (raw as { machineId?: unknown }).machineId === 'string')
        ? (raw as { machineId: string }).machineId
        : randomUUID();
    return { ...normalizeTeamServerSettings(raw), machineId };
}

function writeSettingsFile(file: StoredSettingsFile): void {
    fs.mkdirSync(path.dirname(settingsPath()), { recursive: true });
    fs.writeFileSync(settingsPath(), JSON.stringify(file, null, 2));
}

// ---------------------------------------------------------------------------
// GitHub token (encrypted at rest with the OS credential store)
// ---------------------------------------------------------------------------

let tokenInMemory: string | undefined;

function loadToken(): string | undefined {
    if (tokenInMemory) { return tokenInMemory; }
    try {
        if (!safeStorage.isEncryptionAvailable()) { return undefined; }
        tokenInMemory = safeStorage.decryptString(fs.readFileSync(tokenPath()));
        return tokenInMemory;
    } catch {
        return undefined;
    }
}

function storeToken(token: string | undefined): void {
    tokenInMemory = token;
    try {
        if (!token) { fs.rmSync(tokenPath(), { force: true }); return; }
        // Never write a GitHub token to disk unencrypted: without OS encryption it lives for
        // this session only and the user signs in again after a restart.
        if (safeStorage.isEncryptionAvailable()) {
            fs.writeFileSync(tokenPath(), safeStorage.encryptString(token));
        }
    } catch (err) {
        console.warn('[team-server] could not persist the GitHub token:', err);
    }
}

// ---------------------------------------------------------------------------
// GitHub device flow
// ---------------------------------------------------------------------------

export interface DeviceCodePrompt {
    userCode: string;
    verificationUri: string;
    expiresInSec: number;
}

function githubClientId(): string {
    return (process.env.AIEF_GITHUB_CLIENT_ID ?? '').trim() || GITHUB_OAUTH_CLIENT_ID;
}

export function isGitHubSignInConfigured(): boolean {
    return githubClientId() !== '';
}

async function postForm(url: string, body: Record<string, string>): Promise<Record<string, unknown>> {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(body).toString(),
        signal: AbortSignal.timeout(GITHUB_REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) { throw new Error(`GitHub returned HTTP ${response.status}`); }
    return await response.json() as Record<string, unknown>;
}

async function fetchGitHubLogin(token: string): Promise<string | undefined> {
    try {
        const response = await fetch('https://api.github.com/user', {
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github+json', 'User-Agent': 'ai-engineering-fluency-desktop' },
            signal: AbortSignal.timeout(GITHUB_REQUEST_TIMEOUT_MS),
        });
        if (!response.ok) { return undefined; }
        const user = await response.json() as { login?: unknown };
        return typeof user.login === 'string' ? user.login : undefined;
    } catch {
        return undefined;
    }
}

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

// ---------------------------------------------------------------------------
// Sync
// ---------------------------------------------------------------------------

export interface TeamServerSyncHooks {
    /** Called whenever the status changes, so the tray and settings page can update. */
    onStatusChange: (status: TeamServerStatus) => void;
    /** The fluency score the Fluency Score panel shows; uploaded to `/api/fluency-score` after the rollups. */
    getFluencyScore: () => Promise<FluencyScoreSource>;
}

export class DesktopTeamServerSync {
    private file: StoredSettingsFile = readSettingsFile();
    private status: TeamServerStatus = { state: 'disabled' };
    private githubLogin: string | undefined;
    private inFlight: Promise<TeamServerStatus> | undefined;
    private initialTimer: NodeJS.Timeout | undefined;
    private intervalTimer: NodeJS.Timeout | undefined;
    private signInAbort: { aborted: boolean } | undefined;
    private readonly uploader = new SharingServerUploadService();

    constructor(private readonly hooks: TeamServerSyncHooks) {
        // Persist the generated machine id on first run so it stays stable.
        writeSettingsFile(this.file);
    }

    getSettings(): TeamServerSettings {
        const { machineId: _machineId, ...settings } = this.file;
        return settings;
    }

    getStatus(): TeamServerStatus { return this.status; }

    isSignedIn(): boolean { return !!loadToken(); }

    /** Load the signed-in login (best-effort) and start the schedule. */
    async start(): Promise<void> {
        const token = loadToken();
        if (token) { this.githubLogin = await fetchGitHubLogin(token); }
        this.reschedule();
    }

    stop(): void {
        if (this.initialTimer) { clearTimeout(this.initialTimer); this.initialTimer = undefined; }
        if (this.intervalTimer) { clearInterval(this.intervalTimer); this.intervalTimer = undefined; }
        if (this.signInAbort) { this.signInAbort.aborted = true; }
    }

    /** Validate and save settings from the settings page. Returns an error message, or undefined. */
    saveSettings(raw: unknown): string | undefined {
        const next = normalizeTeamServerSettings(raw);
        if (next.enabled) {
            const urlError = validateEndpointUrl(next.endpointUrl);
            if (urlError) { return urlError; }
        }
        this.file = { ...next, machineId: this.file.machineId };
        writeSettingsFile(this.file);
        this.reschedule();
        return undefined;
    }

    /**
     * Start a GitHub device-flow sign-in. Resolves with the code to show once GitHub issued it;
     * polling for the token continues in the background and ends in a status change.
     */
    async beginSignIn(openUrl: (url: string) => void): Promise<DeviceCodePrompt> {
        const clientId = githubClientId();
        if (!clientId) { throw new Error('GitHub sign-in is not configured in this build.'); }
        if (this.signInAbort) { this.signInAbort.aborted = true; }
        const abort = { aborted: false };
        this.signInAbort = abort;
        const code = await postForm('https://github.com/login/device/code', { client_id: clientId, scope: GITHUB_SCOPE });
        const deviceCode = String(code.device_code ?? '');
        const userCode = String(code.user_code ?? '');
        const verificationUri = String(code.verification_uri ?? 'https://github.com/login/device');
        const expiresInSec = Number(code.expires_in) || 900;
        let intervalSec = Number(code.interval) || 5;
        if (!deviceCode || !userCode) { throw new Error('GitHub did not return a device code.'); }
        openUrl(verificationUri);
        void (async () => {
            const deadline = Date.now() + expiresInSec * 1000;
            while (!abort.aborted && Date.now() < deadline) {
                await sleep(intervalSec * 1000);
                if (abort.aborted) { return; }
                let result: Record<string, unknown>;
                try {
                    result = await postForm('https://github.com/login/oauth/access_token', {
                        client_id: clientId,
                        device_code: deviceCode,
                        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
                    });
                } catch {
                    continue; // transient network error: keep polling until the code expires
                }
                if (typeof result.access_token === 'string' && result.access_token) {
                    storeToken(result.access_token);
                    this.githubLogin = await fetchGitHubLogin(result.access_token);
                    this.setStatus(this.baseStatus());
                    this.reschedule();
                    return;
                }
                if (result.error === 'authorization_pending') { continue; }
                if (result.error === 'slow_down') { intervalSec += 5; continue; }
                this.setStatus({ state: 'error', message: `GitHub sign-in failed: ${String(result.error_description ?? result.error ?? 'unknown error')}` });
                return;
            }
            if (!abort.aborted) { this.setStatus({ state: 'error', message: 'GitHub sign-in timed out. Try again.' }); }
        })();
        return { userCode, verificationUri, expiresInSec };
    }

    signOut(): void {
        if (this.signInAbort) { this.signInAbort.aborted = true; }
        storeToken(undefined);
        this.githubLogin = undefined;
        this.reschedule();
    }

    /** Upload now. A sync already running is joined rather than started twice. */
    syncNow(): Promise<TeamServerStatus> {
        if (this.inFlight) { return this.inFlight; }
        const run = this.runSync().finally(() => { this.inFlight = undefined; });
        this.inFlight = run;
        return run;
    }

    private baseStatus(): TeamServerStatus {
        if (!this.file.enabled || !this.file.endpointUrl) { return { state: 'disabled' }; }
        if (!loadToken()) { return { state: 'signed-out', message: 'Sign in with GitHub to upload.' }; }
        const keep = this.status.state === 'ok' || this.status.state === 'error' ? this.status : { state: 'idle' as const };
        return { ...keep, githubLogin: this.githubLogin };
    }

    private setStatus(next: TeamServerStatus): void {
        this.status = { ...next, githubLogin: next.githubLogin ?? this.githubLogin };
        this.hooks.onStatusChange(this.status);
    }

    private reschedule(): void {
        this.stop();
        this.setStatus(this.baseStatus());
        if (this.status.state === 'disabled' || this.status.state === 'signed-out') { return; }
        this.initialTimer = setTimeout(() => { void this.syncNow(); }, INITIAL_SYNC_DELAY_MS);
        this.intervalTimer = setInterval(() => { void this.syncNow(); }, TEAM_SERVER_SYNC_INTERVAL_MS);
    }

    private async runSync(): Promise<TeamServerStatus> {
        const base = this.baseStatus();
        if (base.state === 'disabled' || base.state === 'signed-out') {
            this.setStatus(base);
            return this.status;
        }
        const token = loadToken()!;
        const settings = this.file;
        this.setStatus({ ...this.status, state: 'syncing', message: 'Uploading…' });
        // The rollups and the fluency score are separate POSTs with separate outcomes, as in the
        // extension: a failing score must not hide a failing rollup upload, or the reverse.
        let rollupMessage: string | undefined;
        let rollupError: string | undefined;
        try {
            rollupMessage = await uploadToTeamServer(settings, token, this.uploader);
        } catch (err) {
            rollupError = err instanceof Error ? err.message : String(err);
        }
        const scoreError = await this.uploadFluencyScore(settings, token);
        if (rollupError || scoreError) {
            const message = [rollupError, scoreError && `Fluency score: ${scoreError}`].filter(Boolean).join(' ');
            this.setStatus({ state: 'error', message, lastSyncAt: this.status.lastSyncAt });
        } else {
            this.setStatus({ state: 'ok', message: `${rollupMessage} Fluency score uploaded.`, lastSyncAt: Date.now() });
        }
        return this.status;
    }

    /** Upload the fluency score. Returns an error message, or undefined on success. */
    private async uploadFluencyScore(settings: StoredSettingsFile, token: string): Promise<string | undefined> {
        let payload;
        try {
            payload = buildFluencyScorePayload(await this.hooks.getFluencyScore());
        } catch (err) {
            return `could not compute it (${err instanceof Error ? err.message : String(err)})`;
        }
        const stored = await this.uploader.uploadFluencyScore(canonicalTeamServerUrl(settings.endpointUrl), token, payload, log, warn);
        return stored ? undefined : 'the server did not store it (see the log).';
    }
}

const log = (msg: string) => console.log(`[team-server] ${msg}`);
const warn = (msg: string) => console.warn(`[team-server] ${msg}`);

/**
 * One upload: build the rollups with the shared builder, shape them with the shared entry
 * builder, POST them. Throws on any failure so the caller records it.
 */
async function uploadToTeamServer(settings: StoredSettingsFile, token: string, uploader: SharingServerUploadService): Promise<string> {
    const builder = new DailyRollupBuilder({
        logger: { log, warn },
        sessionHandlers: {
            getCopilotSessionFiles: discoverSessionFiles,
            estimateTokensFromText: (text, model) => estimateTokensFromText(text, model, tokenEstimators),
            getModelFromRequest: (request) => getModelFromRequest(request as Parameters<typeof getModelFromRequest>[0], modelPricing),
            getSessionFileDataCached: getSessionFileCacheForRollups,
            statSessionFile,
        },
        getMachineId: () => settings.machineId,
    });
    const { rollups, workspaceNamesById, machineNamesById, filesFailed } = await builder.computeRollups({
        lookbackDays: settings.lookbackDays,
        includeEditorDimension: true,
    });
    if (rollups.size === 0) {
        if (filesFailed > 0) { throw new Error(`Nothing to upload, but ${filesFailed} session file(s) could not be read.`); }
        return 'No usage in the lookback window — nothing to upload.';
    }
    const sharingPolicy = computeBackendSharingPolicy({
        enabled: true,
        profile: settings.sharingProfile,
        shareWorkspaceMachineNames: settings.shareWorkspaceMachineNames,
    });
    const entries = buildTeamServerEntries(rollups, {
        datasetId: settings.datasetId,
        sharingPolicy,
        workspaceNamesById,
        machineNamesById,
        pricing: modelPricing,
        clientVersion: `desktop-${app.getVersion()}`,
        getDefaultEditor: () => 'Unknown',
    });
    const result = await uploader.uploadRollups(canonicalTeamServerUrl(settings.endpointUrl), token, entries, log, warn);
    if (!result.success) {
        throw new Error(result.message.startsWith('HTTP 401') ? 'The team server rejected the GitHub token (401). Sign in again.' : result.message);
    }
    const failedNote = filesFailed > 0 ? ` (${filesFailed} session file(s) could not be read)` : '';
    return `${result.message}${failedNote}`;
}
