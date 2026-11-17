/** Day-key, timestamp and display-name constants shared by every team-server sync host. */

// ---------------------------------------------------------------------------
// Day key / date utility constants
// ---------------------------------------------------------------------------

/**
 * Regex pattern that a valid UTC day key (YYYY-MM-DD) must match.
 */
export const DAY_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Number of milliseconds in one day (24 h x 60 min x 60 s x 1000 ms).
 */
export const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Maximum number of days allowed in a single getDayKeysInclusive range.
 * Requests exceeding this limit are rejected to avoid runaway memory usage.
 */
export const MAX_DAYS_RANGE = 400;

// ---------------------------------------------------------------------------
// Timestamp normalisation
// ---------------------------------------------------------------------------

/**
 * Threshold used to distinguish Unix epoch-seconds from epoch-milliseconds.
 * Any numeric timestamp strictly below this value is assumed to be in seconds
 * and is multiplied by 1000.  Values at or above are assumed milliseconds.
 * (This threshold equals 2001-09-08T21:46:40.000Z in milliseconds.)
 */
export const EPOCH_SECONDS_THRESHOLD = 1_000_000_000_000;

// ---------------------------------------------------------------------------
// Display name / storage limits
// ---------------------------------------------------------------------------

/**
 * Maximum character length for a normalized display name before truncation.
 */
export const MAX_DISPLAY_NAME_LENGTH = 64;

// ---------------------------------------------------------------------------
// Workspace file constants
// ---------------------------------------------------------------------------

/**
 * File extension used by VS Code multi-root workspace files.
 */
export const CODE_WORKSPACE_EXTENSION = '.code-workspace';
