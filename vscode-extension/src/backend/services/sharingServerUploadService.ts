/**
 * Upload service for the self-hosted sharing server.
 * Sends daily rollup data to a configured endpoint using a GitHub Bearer token.
 */

import { safeStringifyError } from '../../../../src/utils/errors';

export interface SharingServerEntry {
	day: string;
	model: string;
	workspaceId: string;
	workspaceName?: string;
	machineId: string;
	machineName?: string;
	editor?: string;
	inputTokens: number;
	outputTokens: number;
	interactions: number;
	datasetId?: string;
	fluencyMetrics?: Record<string, unknown>;
}

/** Maximum number of entries per HTTP request (matches server-side limit). */
const BATCH_SIZE = 500;

/**
 * Packs entries into requests of at most `maxPerRequest` without ever splitting one
 * (dataset, day) across requests. The server replaces a user's rows for every day in a request
 * (delete, then insert), so a day spread over two requests would lose the first request's rows.
 * A single day larger than the limit cannot be sent atomically and is returned in `oversized`.
 */
export function packEntriesByDay<T extends { day: string; datasetId?: string }>(entries: T[], maxPerRequest: number): { batches: T[][]; oversized: Array<{ day: string; datasetId: string; count: number }> } {
	const byDay = new Map<string, T[]>();
	for (const entry of entries) {
		const key = `${entry.datasetId ?? 'default'}\u0000${entry.day}`;
		const group = byDay.get(key);
		if (group) { group.push(entry); } else { byDay.set(key, [entry]); }
	}
	const batches: T[][] = [];
	const oversized: Array<{ day: string; datasetId: string; count: number }> = [];
	let current: T[] = [];
	for (const group of byDay.values()) {
		if (group.length > maxPerRequest) {
			oversized.push({ day: group[0].day, datasetId: group[0].datasetId ?? 'default', count: group.length });
			continue;
		}
		if (current.length + group.length > maxPerRequest) {
			batches.push(current);
			current = [];
		}
		current.push(...group);
	}
	if (current.length > 0) { batches.push(current); }
	return { batches, oversized };
}

export class SharingServerUploadService {
	async uploadRollups(
		endpointUrl: string,
		githubToken: string,
		entries: SharingServerEntry[],
		log: (msg: string) => void,
		warn: (msg: string) => void,
	): Promise<{ success: boolean; entriesUploaded: number; message: string }> {
		const baseUrl = endpointUrl.replace(/\/$/, '');
		const url = `${baseUrl}/api/upload`;

		const { batches, oversized } = packEntriesByDay(entries, BATCH_SIZE);
		for (const o of oversized) {
			warn(`Sharing server upload: skipping ${o.day} (${o.count} entries exceeds the ${BATCH_SIZE}-entry request limit; uploading it in parts would overwrite itself)`);
		}

		try {
			let totalUploaded = 0;
			for (const batch of batches) {
				const response = await fetch(url, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${githubToken}`,
					},
					body: JSON.stringify(batch),
				});

				if (!response.ok) {
					const errorText = await response.text().catch(() => '');
					const message = `HTTP ${response.status}: ${errorText}`;
					warn(`Sharing server upload: ${message}`);
					return { success: false, entriesUploaded: totalUploaded, message };
				}

				// Read actual uploaded count — server may reject entries that fail validation
				let serverUploaded = batch.length;
				try {
					const result = await response.json() as { uploaded?: number; errors?: string[] };
					if (typeof result.uploaded === 'number') { serverUploaded = result.uploaded; }
					if (result.errors && result.errors.length > 0) {
						warn(`Sharing server upload: server rejected ${batch.length - serverUploaded} entries: ${result.errors.slice(0, 3).join('; ')}`);
					}
				} catch { /* response not JSON, use batch.length */ }
				totalUploaded += serverUploaded;
			}

			if (oversized.length > 0) {
				const message = `Uploaded ${totalUploaded} entries; skipped ${oversized.length} day(s) over the ${BATCH_SIZE}-entry request limit: ${oversized.map(o => o.day).join(', ')}`;
				warn(`Sharing server upload: ${message}`);
				return { success: false, entriesUploaded: totalUploaded, message };
			}
			const message = `Uploaded ${totalUploaded} entries`;
			log(`Sharing server upload: ${message}`);
			return { success: true, entriesUploaded: totalUploaded, message };
		} catch (e: unknown) {
			const message = `Upload failed: ${safeStringifyError(e)}`;
			warn(`Sharing server upload: ${message}`);
			return { success: false, entriesUploaded: 0, message };
		}
	}

	/**
	 * Upload the extension's locally-computed fluency score so the server dashboard
	 * shows the exact same result as the extension's AI Fluency Score panel.
	 * Resolves `true` only when the server accepted the score; failures are logged, not thrown.
	 */
	async uploadFluencyScore(
		endpointUrl: string,
		githubToken: string,
		score: Record<string, unknown>,
		log: (msg: string) => void,
		warn: (msg: string) => void,
	): Promise<boolean> {
		const baseUrl = endpointUrl.replace(/\/$/, '');
		const url = `${baseUrl}/api/fluency-score`;
		try {
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${githubToken}`,
				},
				body: JSON.stringify(score),
			});
			if (!response.ok) {
				const errorText = await response.text().catch(() => '');
				warn(`Sharing server fluency-score upload: HTTP ${response.status}: ${errorText}`);
				return false;
			}
			log('Sharing server fluency-score upload: ok');
			return true;
		} catch (e: unknown) {
			warn(`Sharing server fluency-score upload failed: ${safeStringifyError(e)}`);
			return false;
		}
	}
}
