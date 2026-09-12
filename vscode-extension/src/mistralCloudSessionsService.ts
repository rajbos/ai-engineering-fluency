import * as https from 'https';
import { withTimeout } from './utils/promises';
import type { MistralCloudConversation, MistralCloudSessionsResult } from '../../src/types';

/**
 * BETA — Mistral Vibe cloud (web) sessions loader.
 *
 * Mistral does not yet document a public API for Vibe Code Web sessions. The closest available
 * surface is the beta Agents `/v1/conversations` listing on `api.mistral.ai`, which is what the
 * `mistralai` SDK's `conversations.list()` calls. This loader uses that listing to surface the
 * conversations associated with the configured Mistral API key.
 *
 * Everything here is best-effort and tolerant of API drift: the listing is parsed defensively
 * and unknown fields are ignored. Mark the UI surface as "Beta" while this relies on an
 * undocumented endpoint.
 */

/** Re-export shared types so callers import from one place. */
export type { MistralCloudConversation, MistralCloudSessionsResult };

/** Default REST base for la Plateforme. */
const MISTRAL_API_BASE = 'https://api.mistral.ai';

/** Maximum conversations to request per listing call. The API caps `page_size` at 100. */
const DEFAULT_PAGE_SIZE = 100;

/** Overall fetch timeout so a hung connection never blocks the webview indefinitely. */
const FETCH_TIMEOUT_MS = 20_000;

/** SecretStorage key under which the user's Mistral API key is stored. */
export const MISTRAL_API_KEY_SECRET = 'aiEngineeringFluency.mistral.apiKey';

/**
 * Raw JSON shape of one conversation from `GET /v1/conversations`. Only the fields we read are
 * declared; the rest is ignored so a server-side schema addition does not break parsing.
 */
interface RawConversation {
  id?: unknown;
  created_at?: unknown;
  updated_at?: unknown;
  agent_id?: unknown;
  name?: unknown;
  description?: unknown;
  agent_version?: unknown;
  metadata?: unknown;
  object?: unknown;
}

/** Result of the low-level HTTPS request, mirroring agentSessionsService's transport shape. */
export interface MistralJsonResult {
  body?: any;
  statusCode?: number;
  error?: string;
}

export type MistralRequestFn = typeof https.request;

/**
 * GET a Mistral REST path and parse the JSON body, mapping transport/HTTP errors into the result.
 * The `requestFn` is injectable so tests can drive the real request-creation path without network.
 */
export function requestMistralJson(
  path: string,
  apiKey: string,
  requestFn: MistralRequestFn = https.request,
): Promise<MistralJsonResult> {
  return new Promise((resolve) => {
    const url = new URL(path, MISTRAL_API_BASE);
    const req = requestFn(
      {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: 'application/json',
          'User-Agent': 'ai-engineering-fluency/mistral-cloud-sessions',
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk: string) => (data += chunk));
        res.on('end', () => {
          const statusCode = res.statusCode ?? 0;
          if (statusCode < 200 || statusCode >= 300) {
            resolve({ statusCode, error: `HTTP ${statusCode}` });
            return;
          }
          try {
            resolve({ body: JSON.parse(data), statusCode });
          } catch (e) {
            resolve({ statusCode, error: String(e) });
          }
        });
      },
    );
    req.on('error', (e) => resolve({ error: String(e) }));
    req.end();
  });
}

/** Coerce an arbitrary API value to a nullable string, mirroring the SDK's `OptionalNullable`. */
function optStr(v: unknown): string | null {
  return v === null || v === undefined ? null : String(v);
}

/** Coerce an arbitrary API value to a nullable ISO timestamp string. */
function optDate(v: unknown): string {
  return v === null || v === undefined ? '' : String(v);
}

/** Normalize one raw conversation object into the typed shape consumed by the webview. */
function normalizeConversation(raw: RawConversation): MistralCloudConversation | undefined {
  if (typeof raw.id !== 'string' || !raw.id) { return undefined; }
  return {
    id: raw.id,
    createdAt: optDate(raw.created_at),
    updatedAt: optDate(raw.updated_at),
    agentId: optStr(raw.agent_id) ?? '',
    name: optStr(raw.name),
    description: optStr(raw.description),
    agentVersion: optStr(raw.agent_version),
    metadata: raw.metadata && typeof raw.metadata === 'object'
      ? raw.metadata as Record<string, unknown>
      : null,
  };
}

/** Result of the listing call, before being shaped into `MistralCloudSessionsResult`. */
export interface MistralListResult {
  conversations?: MistralCloudConversation[];
  totalCount?: number;
  statusCode?: number;
  error?: string;
}

/**
 * List conversations from `GET /v1/conversations`. Exported so tests can inject a fake transport
 * and assert the request construction without a live network call.
 */
export async function listMistralConversations(
  apiKey: string,
  options: { pageSize?: number; requestFn?: MistralRequestFn } = {},
): Promise<MistralListResult> {
  const pageSize = Math.min(Math.max(options.pageSize ?? DEFAULT_PAGE_SIZE, 1), 100);
  const path = `/v1/conversations?page_size=${pageSize}`;
  const result = await requestMistralJson(path, apiKey, options.requestFn);
  if (result.error) { return { error: result.error, statusCode: result.statusCode }; }
  const body = result.body;
  // The API may return either a bare array or an object envelope; tolerate both.
  const rawList: RawConversation[] = Array.isArray(body)
    ? body
    : Array.isArray(body?.data) ? body.data : [];
  const conversations: MistralCloudConversation[] = [];
  for (const raw of rawList) {
    const conv = normalizeConversation(raw);
    if (conv) { conversations.push(conv); }
  }
  return {
    conversations,
    totalCount: typeof body?.total === 'number' ? body.total : conversations.length,
    statusCode: result.statusCode,
  };
}

/**
 * Collect Mistral cloud conversations for the authenticated API key. This is the entry point the
 * extension calls; it owns the timeout envelope and the `MistralCloudSessionsResult` shape that
 * flows to the webview.
 */
export async function collectMistralCloudSessions(
  apiKey: string,
  options: { pageSize?: number; requestFn?: MistralRequestFn } = {},
): Promise<MistralCloudSessionsResult> {
  const fetchedAt = new Date().toISOString();
  try {
    const list = await withTimeout(
      listMistralConversations(apiKey, options),
      FETCH_TIMEOUT_MS,
      'Mistral cloud sessions fetch',
    );
    if (list.error) {
      const authError = list.statusCode === 401 || list.statusCode === 403;
      return {
        conversations: [],
        totalCount: 0,
        authenticated: !authError,
        fetchedAt,
        error: list.statusCode ? `${list.error} (${list.statusCode})` : list.error,
      };
    }
    return {
      conversations: list.conversations ?? [],
      totalCount: list.totalCount ?? 0,
      authenticated: true,
      fetchedAt,
      error: '',
    };
  } catch (e) {
    return {
      conversations: [],
      totalCount: 0,
      authenticated: false,
      fetchedAt,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}
