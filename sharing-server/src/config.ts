/**
 * Centralized configuration constants for the sharing server.
 * Centralizes rate limits, cache TTLs, and other tunable parameters
 * so they can be adjusted in one place for deployment flexibility.
 */

// ── Auth / Token Cache ────────────────────────────────────────────────────────

/** How long (ms) a successfully validated GitHub token is cached. */
export const TOKEN_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/** How long (ms) an invalid/rejected token is cached (negative cache). */
export const NEGATIVE_CACHE_TTL_MS = 60 * 1000; // 1 minute

// ── Rate Limits ───────────────────────────────────────────────────────────────

/** Maximum upload requests allowed per user per UPLOAD_RATE_WINDOW_MS. */
export const UPLOAD_RATE_MAX = 100;

/** Duration (ms) of the per-user upload rate limit window. */
export const UPLOAD_RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

/** Maximum requests allowed per IP per IP_RATE_WINDOW_MS (pre-auth). */
export const IP_RATE_MAX = 200;

/** Duration (ms) of the per-IP rate limit window. */
export const IP_RATE_WINDOW_MS = 60 * 1000; // 1 minute

// ── Session / OAuth ───────────────────────────────────────────────────────────

/** How long (seconds) a session cookie remains valid. */
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

/** Max age (seconds) for the OAuth state CSRF cookie. */
export const OAUTH_STATE_MAX_AGE_SECONDS = 300; // 5 minutes

// ── API Validation ────────────────────────────────────────────────────────────

/** Maximum field lengths for upload entry string fields. */
export const MAX_STRING_LENGTHS = {
	model: 128,
	workspaceId: 256,
	workspaceName: 256,
	machineId: 256,
	machineName: 256,
	datasetId: 128,
	editor: 100,
} as const;

/** Maximum allowed value for token counts per upload entry. */
export const MAX_TOKEN_VALUE = 2_000_000_000; // 2B tokens — large agent sessions can exceed 100M in one day

/** Maximum number of entries allowed in a single upload request. */
export const MAX_ENTRIES_PER_UPLOAD = 500;

// ── Database / Backup ─────────────────────────────────────────────────────────

/** How often (ms) the database is backed up to Azure Files. */
export const BACKUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
