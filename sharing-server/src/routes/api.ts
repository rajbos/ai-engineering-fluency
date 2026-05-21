import { Hono } from 'hono';
import { requireBearerAuth, checkUploadRateLimit, type AuthVariables } from '../auth.js';
import { upsertUpload, deleteUploadsForDays, getUploadsForUser, getDb, upsertUserFluencyScore, type UploadEntry } from '../db.js';
import { MAX_STRING_LENGTHS, MAX_TOKEN_VALUE, MAX_ENTRIES_PER_UPLOAD } from '../config.js';

// Fluency score payload limits
const MAX_FLUENCY_LABEL_LENGTH = 128;
const MAX_FLUENCY_CATEGORIES = 100;
const MAX_FLUENCY_CATEGORY_NAME_LENGTH = 128;
const MAX_FLUENCY_ICON_LENGTH = 64;
const MAX_FLUENCY_TIPS_PER_CATEGORY = 20;
const MAX_FLUENCY_TIP_LENGTH = 512;
const MAX_FLUENCY_SCORE_JSON_BYTES = 100_000; // 100 KB
const MAX_FLUENCY_METRICS_JSON_BYTES = 10_000; // 10 KB per entry

export const api = new Hono<{ Variables: AuthVariables }>();

// GET /health — no auth required (mounted at root level, not here)

/** POST /api/upload — Upload daily rollup data (one or more entries). */
api.post('/upload', requireBearerAuth, async (c) => {
	const user = c.get('user');

	if (!checkUploadRateLimit(user.id)) {
		return c.json({ error: 'Rate limit exceeded — max 100 uploads per hour.' }, 429);
	}

	let body: unknown;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ error: 'Invalid JSON body.' }, 400);
	}

	if (!Array.isArray(body)) {
		return c.json({ error: 'Body must be a JSON array of upload entries.' }, 400);
	}

	if (body.length === 0) {
		return c.json({ uploaded: 0 });
	}

	if (body.length > MAX_ENTRIES_PER_UPLOAD) {
		return c.json({ error: `Too many entries (max ${MAX_ENTRIES_PER_UPLOAD}).` }, 400);
	}

	let uploaded = 0;
	const errors: string[] = [];

	// Validate all entries first before touching the DB
	const validEntries: UploadEntry[] = [];
	for (let i = 0; i < body.length; i++) {
		const validationError = validateEntry(body[i]);
		if (validationError) {
			errors.push(`Entry ${i}: ${validationError}`);
		} else {
			validEntries.push(body[i] as UploadEntry);
		}
	}

	if (validEntries.length > 0) {
		// Group by dataset_id so we can delete-then-insert per dataset atomically
		const byDataset = new Map<string, UploadEntry[]>();
		for (const entry of validEntries) {
			const dsId = entry.datasetId ?? 'default';
			if (!byDataset.has(dsId)) byDataset.set(dsId, []);
			byDataset.get(dsId)!.push(entry);
		}

		for (const [datasetId, entries] of byDataset) {
			// Collect the unique days being uploaded for this dataset
			const days = [...new Set(entries.map(e => e.day))];
			try {
				// Run delete + insert in a single transaction so there's never a gap
				getDb().exec('BEGIN');
				deleteUploadsForDays(user.id, datasetId, days);
				for (const entry of entries) {
					upsertUpload(user.id, entry);
					uploaded++;
				}
				getDb().exec('COMMIT');
			} catch (err) {
				getDb().exec('ROLLBACK');
				errors.push(`Dataset "${datasetId}": ${String(err)}`);
			}
		}
	}

	return c.json({ uploaded, ...(errors.length > 0 ? { errors } : {}) });
});

/** GET /api/me — Return the authenticated user's GitHub profile info. */
api.get('/me', requireBearerAuth, (c) => {
	const user = c.get('user');
	return c.json({
		githubId: user.github_id,
		login: user.github_login,
		name: user.github_name,
		avatarUrl: user.avatar_url,
		createdAt: user.created_at,
	});
});

/** GET /api/data?days=30 — Return the authenticated user's own upload data. */
api.get('/data', requireBearerAuth, (c) => {
	const user = c.get('user');
	const daysRaw = c.req.query('days');
	const days = clampDays(daysRaw);
	const data = getUploadsForUser(user.id, days);
	return c.json(data);
});

/**
 * POST /api/fluency-score — Store the extension's locally-computed fluency score.
 * Body: { overallStage, overallLabel, categories, computedAt }
 * This is the authoritative score: the server dashboard uses it directly instead of
 * re-computing from aggregated upload blobs.
 */
api.post('/fluency-score', requireBearerAuth, async (c) => {
	const user = c.get('user');

	let body: unknown;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ error: 'Invalid JSON body.' }, 400);
	}

	const validationError = validateFluencyScore(body);
	if (validationError) {
		return c.json({ error: validationError }, 400);
	}

	const scoreJson = JSON.stringify(body);
	upsertUserFluencyScore(user.id, scoreJson);
	return c.json({ ok: true });
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function clampDays(raw: string | undefined): number {
	const n = parseInt(raw ?? '30', 10);
	if (!Number.isFinite(n)) return 30;
	return Math.min(Math.max(n, 1), 90);
}

function validateEntry(entry: unknown): string | null {
	if (typeof entry !== 'object' || entry === null) {
		return 'must be an object';
	}
	const e = entry as Record<string, unknown>;

	if (typeof e.day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(e.day)) {
		return '"day" must be a YYYY-MM-DD string';
	}
	if (typeof e.model !== 'string' || e.model.length === 0) {
		return '"model" must be a non-empty string';
	}
	if (e.model.length > MAX_STRING_LENGTHS.model) {
		return `"model" too long (max ${MAX_STRING_LENGTHS.model})`;
	}
	if (typeof e.workspaceId !== 'string' || e.workspaceId.length === 0) {
		return '"workspaceId" must be a non-empty string';
	}
	if (e.workspaceId.length > MAX_STRING_LENGTHS.workspaceId) {
		return `"workspaceId" too long (max ${MAX_STRING_LENGTHS.workspaceId})`;
	}
	if (typeof e.machineId !== 'string' || e.machineId.length === 0) {
		return '"machineId" must be a non-empty string';
	}
	if (e.machineId.length > MAX_STRING_LENGTHS.machineId) {
		return `"machineId" too long (max ${MAX_STRING_LENGTHS.machineId})`;
	}
	if (!isNonNegativeInt(e.inputTokens) || (e.inputTokens as number) > MAX_TOKEN_VALUE) {
		return `"inputTokens" must be a non-negative integer ≤ ${MAX_TOKEN_VALUE.toLocaleString()}`;
	}
	if (!isNonNegativeInt(e.outputTokens) || (e.outputTokens as number) > MAX_TOKEN_VALUE) {
		return `"outputTokens" must be a non-negative integer ≤ ${MAX_TOKEN_VALUE.toLocaleString()}`;
	}
	if (!isNonNegativeInt(e.interactions) || (e.interactions as number) > 100_000) {
		return '"interactions" must be a non-negative integer ≤ 100,000';
	}

	// Optional string fields — truncate if too long (defensive, after length check)
	if (e.workspaceName !== undefined && e.workspaceName !== null) {
		if (typeof e.workspaceName !== 'string') return '"workspaceName" must be a string';
		if (e.workspaceName.length > MAX_STRING_LENGTHS.workspaceName) return `"workspaceName" too long (max ${MAX_STRING_LENGTHS.workspaceName})`;
	}
	if (e.machineName !== undefined && e.machineName !== null) {
		if (typeof e.machineName !== 'string') return '"machineName" must be a string';
		if (e.machineName.length > MAX_STRING_LENGTHS.machineName) return `"machineName" too long (max ${MAX_STRING_LENGTHS.machineName})`;
	}
	if (e.datasetId !== undefined && e.datasetId !== null) {
		if (typeof e.datasetId !== 'string') return '"datasetId" must be a string';
		if (e.datasetId.length > MAX_STRING_LENGTHS.datasetId) {
			return `"datasetId" too long (max ${MAX_STRING_LENGTHS.datasetId})`;
		}
	}
	if (e.editor !== undefined && e.editor !== null) {
		if (typeof e.editor !== 'string') return '"editor" must be a string';
		if (e.editor.length > MAX_STRING_LENGTHS.editor) {
			return `"editor" too long (max ${MAX_STRING_LENGTHS.editor})`;
		}
	}
	if (e.fluencyMetrics !== undefined && e.fluencyMetrics !== null) {
		if (typeof e.fluencyMetrics !== 'object' || Array.isArray(e.fluencyMetrics)) {
			return '"fluencyMetrics" must be an object';
		}
		if (Buffer.byteLength(JSON.stringify(e.fluencyMetrics), 'utf8') > MAX_FLUENCY_METRICS_JSON_BYTES) {
			return `"fluencyMetrics" too large (max ${MAX_FLUENCY_METRICS_JSON_BYTES} bytes)`;
		}
	}

	return null;
}

function isNonNegativeInt(value: unknown): boolean {
	return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

/**
 * Validates the fluency score payload.
 * Returns null if the body is valid, or an error message string describing
 * the first validation failure found.
 */
function validateFluencyScore(body: unknown): string | null {
	if (typeof body !== 'object' || body === null || Array.isArray(body)) {
		return 'Body must be a JSON object.';
	}

	const b = body as Record<string, unknown>;

	if (!Number.isInteger(b.overallStage) || (b.overallStage as number) < 1 || (b.overallStage as number) > 4) {
		return '"overallStage" must be an integer between 1 and 4.';
	}
	if (!Array.isArray(b.categories)) {
		return '"categories" must be an array.';
	}
	if (b.categories.length > MAX_FLUENCY_CATEGORIES) {
		return `"categories" too long (max ${MAX_FLUENCY_CATEGORIES} items).`;
	}
	if (b.overallLabel !== undefined && b.overallLabel !== null) {
		if (typeof b.overallLabel !== 'string') {
			return '"overallLabel" must be a string.';
		}
		if (b.overallLabel.length > MAX_FLUENCY_LABEL_LENGTH) {
			return `"overallLabel" too long (max ${MAX_FLUENCY_LABEL_LENGTH}).`;
		}
	}
	if (b.computedAt !== undefined && b.computedAt !== null) {
		if (typeof b.computedAt !== 'string') {
			return '"computedAt" must be a string.';
		}
		if (b.computedAt.length > 64) {
			return '"computedAt" too long (max 64 chars).';
		}
	}
	for (let i = 0; i < b.categories.length; i++) {
		const catErr = validateFluencyCategory(b.categories[i], i);
		if (catErr) {
			return catErr;
		}
	}

	if (Buffer.byteLength(JSON.stringify(body), 'utf8') > MAX_FLUENCY_SCORE_JSON_BYTES) {
		return `Fluency score payload too large (max ${MAX_FLUENCY_SCORE_JSON_BYTES} bytes).`;
	}

	return null;
}

function validateFluencyCategory(cat: unknown, index: number): string | null {
	if (typeof cat !== 'object' || cat === null || Array.isArray(cat)) {
		return `categories[${index}] must be an object`;
	}
	const c = cat as Record<string, unknown>;
	if (typeof c.category !== 'string' || c.category.length === 0) {
		return `categories[${index}].category must be a non-empty string`;
	}
	if (c.category.length > MAX_FLUENCY_CATEGORY_NAME_LENGTH) {
		return `categories[${index}].category too long (max ${MAX_FLUENCY_CATEGORY_NAME_LENGTH})`;
	}
	if (typeof c.icon !== 'string') {
		return `categories[${index}].icon must be a string`;
	}
	if (c.icon.length > MAX_FLUENCY_ICON_LENGTH) {
		return `categories[${index}].icon too long (max ${MAX_FLUENCY_ICON_LENGTH})`;
	}
	if (!Number.isInteger(c.stage) || (c.stage as number) < 1 || (c.stage as number) > 4) {
		return `categories[${index}].stage must be an integer between 1 and 4`;
	}
	if (!Array.isArray(c.tips)) {
		return `categories[${index}].tips must be an array`;
	}
	if (c.tips.length > MAX_FLUENCY_TIPS_PER_CATEGORY) {
		return `categories[${index}].tips too long (max ${MAX_FLUENCY_TIPS_PER_CATEGORY} items)`;
	}
	for (let j = 0; j < c.tips.length; j++) {
		if (typeof c.tips[j] !== 'string') {
			return `categories[${index}].tips[${j}] must be a string`;
		}
		if ((c.tips[j] as string).length > MAX_FLUENCY_TIP_LENGTH) {
			return `categories[${index}].tips[${j}] too long (max ${MAX_FLUENCY_TIP_LENGTH})`;
		}
	}
	return null;
}
