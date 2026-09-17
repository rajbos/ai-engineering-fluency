import * as https from 'https';
import { withTimeout } from './utils/promises';
import { attachRequestFailureHandling } from './githubApiConfig';
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
 * and unknown fields are ignored. Mark the UI surface as "Beta" while this relies on a beta
 * endpoint whose use for Vibe Code Web specifically is undocumented.
 */

/** Re-export shared types so callers import from one place. */
export type { MistralCloudConversation, MistralCloudSessionsResult };

/** Default REST base for la Plateforme. */
const MISTRAL_API_BASE = 'https://api.mistral.ai';

/** Maximum conversations to request per listing call. The API caps `page_size` at 100. */
const DEFAULT_PAGE_SIZE = 100;

/**
 * Hard cap on the number of pages fetched for a single listing. Real pagination has to stay
 * bounded: an account with an unusually large number of conversations, or a beta endpoint that
 * never signals a final short page, must not turn one refresh into an unbounded number of
 * requests. At the max page size this still covers 2000 conversations before truncating.
 */
const MAX_PAGES = 20;

/** Overall fetch timeout so a hung connection never blocks the webview indefinitely. */
const FETCH_TIMEOUT_MS = 20_000;

/**
 * Matches the wording `withTimeout`'s own `TimeoutError` produces for the same operation/deadline
 * (see collectMistralCloudSessions), so whichever of the two same-deadline timers — this one's
 * abort or withTimeout's rejection — happens to settle first, the user sees the same real timeout
 * message instead of an opaque "Aborted" if the abort path wins.
 */
const ABORT_TIMEOUT_MESSAGE = `Mistral cloud sessions fetch timed out after ${FETCH_TIMEOUT_MS}ms`;

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
  signal?: AbortSignal,
): Promise<MistralJsonResult> {
  return new Promise((resolve) => {
    // Both the request and its response can fail independently (e.g. the response socket resets
    // after the response callback already fired), so guard against settling this promise twice.
    let settled = false;
    const settle = (result: MistralJsonResult) => {
      if (settled) { return; }
      settled = true;
      resolve(result);
    };
    if (signal?.aborted) { settle({ error: ABORT_TIMEOUT_MESSAGE }); return; }
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
        // Without this, Node delivers 'data' chunks as Buffers, and a multibyte UTF-8 character
        // split across chunk boundaries would get corrupted by naive string concatenation.
        res.setEncoding('utf8');
        let data = '';
        res.on('data', (chunk: string) => (data += chunk));
        res.on('end', () => {
          const statusCode = res.statusCode ?? 0;
          if (statusCode < 200 || statusCode >= 300) {
            settle({ statusCode, error: `HTTP ${statusCode}` });
            return;
          }
          try {
            settle({ body: JSON.parse(data), statusCode });
          } catch (e) {
            settle({ statusCode, error: String(e) });
          }
        });
        // The response stream can itself emit 'error' (e.g. a mid-body socket reset) after the
        // response callback has already started; without this handler that would surface as an
        // unhandled 'error' event instead of rejecting/settling this listing call.
        res.on('error', (e: Error) => {
          settle({ error: `Response stream error: ${e.message}` });
        });
      },
    );
    // `withTimeout` at the collectMistralCloudSessions level only rejects that outer promise; on
    // its own it never stops this request. Without destroying the socket here too, a response that
    // keeps trickling bytes without ending would keep accumulating in `data` and holding the
    // connection open indefinitely after the UI has already reported the timeout.
    // The abort timer and withTimeout's own rejection timer both fire at FETCH_TIMEOUT_MS, so
    // either can win the race; using the same wording as withTimeout's TimeoutError here means the
    // user sees a real timeout message either way instead of an opaque "Aborted" if this one wins.
    if (signal) {
      signal.addEventListener('abort', () => {
        req.destroy();
        settle({ error: ABORT_TIMEOUT_MESSAGE });
      }, { once: true });
    }
    attachRequestFailureHandling(req, FETCH_TIMEOUT_MS, (message) => settle({ error: message }));
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

/** Normalize one raw conversation entry into the typed shape consumed by the webview. */
function normalizeConversation(entry: unknown): MistralCloudConversation | undefined {
  if (entry === null || typeof entry !== 'object') { return undefined; }
  const raw = entry as RawConversation;
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
  /**
   * Number of entries the API actually returned for this page, before any were dropped for being
   * malformed/id-less. Used as the "was this the last page" signal instead of `conversations`'
   * length, since a page can be full on the wire but come up short after filtering.
   */
  rawCount?: number;
  totalCount?: number;
  /**
   * True when `totalCount` came from the API's own `total` field rather than falling back to this
   * page's own (post-filter) conversation count. Distinguishes a genuine "this is everything"
   * signal from a same-page fallback that happens to have no aggregate meaning across pages.
   */
  totalIsFromApi?: boolean;
  statusCode?: number;
  error?: string;
}

/** Result of `computeEffectiveTotal`: the total to report, and whether it's a genuine count or
 * merely a lower bound (the page cap was hit with no API-reported total to trust instead). */
interface EffectiveTotal {
  total: number;
  isLowerBound: boolean;
}

/**
 * Extracts the raw conversation list from a `/v1/conversations` response body. The API may return
 * a bare array, or an object envelope keyed `conversations` (the documented shape) or `data`;
 * tolerate all three. Any other top-level shape (a malformed body, an API error envelope such as
 * `{}`) is a parse error, not an empty listing — collapsing it to `[]` would silently erase a
 * previous result and hide schema drift from the caller.
 */
function extractRawConversationList(body: any): unknown[] | undefined {
  if (Array.isArray(body)) { return body; }
  if (Array.isArray(body?.conversations)) { return body.conversations; }
  if (Array.isArray(body?.data)) { return body.data; }
  return undefined;
}

/**
 * List one page of conversations from `GET /v1/conversations`. Exported so tests can inject a
 * fake transport and assert the request construction without a live network call.
 */
export async function listMistralConversations(
  apiKey: string,
  options: { pageSize?: number; page?: number; requestFn?: MistralRequestFn; signal?: AbortSignal } = {},
): Promise<MistralListResult> {
  const pageSize = Math.min(Math.max(options.pageSize ?? DEFAULT_PAGE_SIZE, 1), 100);
  const page = Math.max(options.page ?? 0, 0);
  const path = `/v1/conversations?page_size=${pageSize}${page > 0 ? `&page=${page}` : ''}`;
  const result = await requestMistralJson(path, apiKey, options.requestFn, options.signal);
  if (result.error) { return { error: result.error, statusCode: result.statusCode }; }
  const body = result.body;
  // Entries are `unknown` (not assumed to be objects) since a beta endpoint may include a
  // malformed entry.
  const rawList = extractRawConversationList(body);
  if (rawList === undefined) {
    return { error: 'Unexpected Mistral conversations response shape', statusCode: result.statusCode };
  }
  const conversations: MistralCloudConversation[] = [];
  for (const raw of rawList) {
    const conv = normalizeConversation(raw);
    if (conv) { conversations.push(conv); }
  }
  const totalIsFromApi = typeof body?.total === 'number';
  return {
    conversations,
    rawCount: rawList.length,
    totalCount: totalIsFromApi ? body.total : conversations.length,
    totalIsFromApi,
    statusCode: result.statusCode,
  };
}

/**
 * The total to report to the caller. An API-reported total is trusted outright — including when
 * it exactly equals what we fetched, which is a genuine "this is everything" signal, not something
 * to override with a synthetic bump. When the API never reported a total at all and the page cap
 * cut the listing short while the last fetched page was still full, `fetchedCount` is only a lower
 * bound, not an exact total — fabricating one more than what was fetched (e.g. an account with
 * exactly 2,000 conversations reporting "2000 of 2001") would be a false precise count instead of
 * an honest "at least this many"; `isLowerBound` lets the caller render it as such (e.g. "2000+").
 */
function computeEffectiveTotal(
  fetchedCount: number,
  apiTotal: number | undefined,
  apiTotalIsAuthoritative: boolean,
  hitPageCap: boolean,
): EffectiveTotal {
  if (apiTotalIsAuthoritative && apiTotal !== undefined) { return { total: apiTotal, isLowerBound: false }; }
  return { total: fetchedCount, isLowerBound: hitPageCap };
}

/**
 * Fetch every page of conversations, up to `MAX_PAGES`, aggregating them into one listing. Stops
 * as soon as a page's raw entry count (before any are dropped for being malformed/id-less) comes
 * back shorter than the requested page size (the API's usual signal that it was the last page) —
 * using the *normalized* count here would misfire and truncate the listing early whenever a full
 * page happened to contain even one malformed entry. A page-level error after at least one
 * successful page keeps the pages already gathered, surfaced via `partialError` so the caller
 * knows the listing did not finish; an error on the very first page still propagates as a hard
 * failure, matching the previous single-page behavior.
 */
async function listAllMistralConversations(
  apiKey: string,
  options: { pageSize?: number; requestFn?: MistralRequestFn; signal?: AbortSignal } = {},
): Promise<MistralListResult & { partialError?: string; totalIsLowerBound?: boolean }> {
  const pageSize = Math.min(Math.max(options.pageSize ?? DEFAULT_PAGE_SIZE, 1), 100);
  const conversations: MistralCloudConversation[] = [];
  let totalCount: number | undefined;
  let totalIsFromApi = false;
  let statusCode: number | undefined;
  let hitPageCap = false;
  let partialError: string | undefined;
  for (let page = 0; page < MAX_PAGES; page++) {
    const pageResult = await listMistralConversations(apiKey, { pageSize, page, requestFn: options.requestFn, signal: options.signal });
    if (pageResult.error) {
      if (page === 0) { return { error: pageResult.error, statusCode: pageResult.statusCode }; }
      partialError = `Refresh stopped after page ${page + 1}: ${pageResult.error}`;
      break;
    }
    statusCode = pageResult.statusCode;
    const pageConversations = pageResult.conversations ?? [];
    conversations.push(...pageConversations);
    // A page's own totalCount is only meaningful in aggregate when the API actually reported it
    // (totalIsFromApi, which listMistralConversations only sets alongside a numeric totalCount) —
    // otherwise it's that function's per-page fallback (the page's own conversation count), and
    // overwriting the running total with it on every page would make a short final page (e.g. 2
    // entries) clobber the true aggregate with that page's own count.
    if (pageResult.totalIsFromApi) {
      totalCount = pageResult.totalCount;
      totalIsFromApi = true;
    }
    // An authoritative total that's already been reached means the listing is complete even when
    // the last page happened to come back exactly `pageSize` long — without this, an exact-page
    // listing (e.g. total: 100 with a 100-entry first page) would probe one more, unnecessary page,
    // and an error on that page would misreport an already-complete listing as a partial failure.
    if (totalIsFromApi && totalCount !== undefined && conversations.length >= totalCount) { break; }
    if ((pageResult.rawCount ?? pageConversations.length) < pageSize) { break; }
    if (page === MAX_PAGES - 1) { hitPageCap = true; }
  }
  const effectiveTotal = computeEffectiveTotal(conversations.length, totalCount, totalIsFromApi, hitPageCap);
  return {
    conversations,
    totalCount: effectiveTotal.total,
    totalIsLowerBound: effectiveTotal.isLowerBound,
    statusCode,
    partialError,
  };
}

/**
 * Collect Mistral cloud conversations for the authenticated API key. This is the entry point the
 * extension calls; it owns the timeout envelope and the `MistralCloudSessionsResult` shape that
 * flows to the webview.
 */
export async function collectMistralCloudSessions(
  apiKey: string,
  options: { pageSize?: number; requestFn?: MistralRequestFn; signal?: AbortSignal } = {},
): Promise<MistralCloudSessionsResult> {
  const fetchedAt = new Date().toISOString();
  // withTimeout below only rejects this function's own promise when the deadline fires — on its
  // own it does nothing to the underlying HTTPS request. Without this, a response that keeps
  // trickling bytes without ending (or a request that otherwise never settles) would keep
  // accumulating data and holding the socket open indefinitely after the UI has already reported
  // the timeout. Abort it on the same deadline so the transport actually gets torn down.
  const abortController = new AbortController();
  const abortTimer = setTimeout(() => abortController.abort(), FETCH_TIMEOUT_MS);
  // The caller's own signal (e.g. the extension host cancelling a stale fetch after the API key
  // was cleared/changed mid-listing) also tears down the transport, not just this function's
  // timeout — otherwise a removed/replaced key could keep making up to MAX_PAGES sequential
  // requests in the background after the caller has stopped caring about the result.
  if (options.signal) {
    if (options.signal.aborted) { abortController.abort(); }
    else { options.signal.addEventListener('abort', () => abortController.abort(), { once: true }); }
  }
  try {
    const list = await withTimeout(
      listAllMistralConversations(apiKey, { ...options, signal: abortController.signal }),
      FETCH_TIMEOUT_MS,
      'Mistral cloud sessions fetch',
    );
    if (list.error) {
      return {
        conversations: [],
        totalCount: 0,
        totalIsLowerBound: false,
        authenticated: false,
        fetchedAt,
        // requestMistralJson's HTTP-status errors already read "HTTP <code>"; only append the
        // status code here when the message doesn't already carry it (e.g. a JSON parse failure
        // on an otherwise-2xx response), so the UI never shows something like "HTTP 401 (401)".
        error: list.statusCode && !list.error.includes(String(list.statusCode))
          ? `${list.error} (${list.statusCode})`
          : list.error,
      };
    }
    return {
      conversations: list.conversations ?? [],
      totalCount: list.totalCount ?? 0,
      totalIsLowerBound: !!list.totalIsLowerBound,
      authenticated: true,
      fetchedAt,
      // A later page can fail after earlier pages already succeeded (listAllMistralConversations
      // keeps what it fetched rather than discarding it); surface that as a partial-listing error
      // so the UI doesn't present an incomplete result as a complete one.
      error: list.partialError ?? '',
    };
  } catch (e) {
    return {
      conversations: [],
      totalCount: 0,
      totalIsLowerBound: false,
      authenticated: false,
      fetchedAt,
      error: e instanceof Error ? e.message : String(e),
    };
  } finally {
    clearTimeout(abortTimer);
    // Guarantee the transport is torn down on every exit path, not only when abortTimer itself
    // fires: if withTimeout's own rejection settles first (registration order between two
    // same-delay timers isn't guaranteed), clearing this timer here would otherwise skip the
    // abort() call entirely, leaving a slow response free to keep buffering data and issuing
    // further page requests after the caller has already moved on. Aborting an already-settled
    // or already-aborted controller is a no-op, so this is safe to call unconditionally.
    abortController.abort();
  }
}
