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

export class SharingServerUploadService {
	/**
	 * How many entries of a batch the server confirmed it stored.
	 *
	 * Only a parsed `uploaded` number counts as evidence of delivery. A 2xx whose
	 * body will not parse, or that carries no `uploaded` count, is what a proxy or
	 * a misconfigured endpoint returns, so it contributes nothing and is recorded
	 * in `serverErrors`.
	 */
	private async readStoredCount(
		response: Response,
		batchSize: number,
		warn: (msg: string) => void,
		serverErrors: string[],
	): Promise<number> {
		let result: { uploaded?: number; errors?: string[] };
		try {
			result = await response.json() as { uploaded?: number; errors?: string[] };
		} catch {
			warn(`Sharing server upload: ${response.status} response is not JSON — treating the batch as not stored`);
			serverErrors.push(`Unparseable ${response.status} response`);
			return 0;
		}
		if (result.errors && result.errors.length > 0) {
			warn(`Sharing server upload: server rejected ${batchSize - (result.uploaded ?? 0)} entries: ${result.errors.slice(0, 3).join('; ')}`);
			serverErrors.push(...result.errors);
		}
		if (typeof result.uploaded !== 'number') {
			warn(`Sharing server upload: ${response.status} response has no "uploaded" count — treating the batch as not stored`);
			serverErrors.push(`${response.status} response without an "uploaded" count`);
			return 0;
		}
		return result.uploaded;
	}

	/**
	 * Upload daily rollup entries in batches.
	 *
	 * `success` means every entry was reported stored by the server. It is not a
	 * synonym for "got a 2xx": the upload endpoint returns HTTP 200 with
	 * `uploaded: 0` plus an `errors` array when entries fail validation or a
	 * dataset transaction rolls back, and a proxy or misconfigured endpoint can
	 * answer 200 with a body that is not an upload result at all. Only a parsed
	 * `uploaded` count is treated as evidence of delivery. Errors are reported
	 * through `warn` rather than thrown, so callers must check this result.
	 */
	async uploadRollups(
		endpointUrl: string,
		githubToken: string,
		entries: SharingServerEntry[],
		log: (msg: string) => void,
		warn: (msg: string) => void,
	): Promise<{ success: boolean; entriesUploaded: number; message: string }> {
		const baseUrl = endpointUrl.replace(/\/$/, '');
		const url = `${baseUrl}/api/upload`;

		try {
			let totalUploaded = 0;
			const serverErrors: string[] = [];
			for (let i = 0; i < entries.length; i += BATCH_SIZE) {
				const batch = entries.slice(i, i + BATCH_SIZE);
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

				// Read the actual stored count — a 2xx alone is not evidence of
				// delivery, so only a parsed `uploaded` number counts.
				totalUploaded += await this.readStoredCount(response, batch.length, warn, serverErrors);
			}

			// A 2xx response does not mean the data was stored. The server answers
			// HTTP 200 with `uploaded: 0` and an `errors` array when entries fail
			// validation or a dataset transaction rolls back, so anything short of
			// every entry landing has to be reported as a failed upload — otherwise
			// callers advance the "Last Sync" marker for data that never arrived.
			const stored = Math.min(totalUploaded, entries.length);
			if (stored < entries.length || serverErrors.length > 0) {
				const detail = serverErrors.length > 0 ? `: ${serverErrors.slice(0, 3).join('; ')}` : '';
				const message = `Server stored ${stored} of ${entries.length} entries${detail}`;
				warn(`Sharing server upload: ${message}`);
				return { success: false, entriesUploaded: stored, message };
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
	 *
	 * Returns whether the score actually reached the server. Failures are reported
	 * through `warn` rather than thrown, so a caller cannot use try/catch to tell
	 * success from failure and must check this value.
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
