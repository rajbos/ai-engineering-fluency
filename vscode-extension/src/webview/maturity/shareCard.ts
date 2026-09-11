import { escapeHtml } from '../shared/formatUtils';

export const SHARE_CARD_BG = '#1b1b1e';

const SHARE_CARD_BASE_STYLE =
  'position:absolute;left:-9999px;top:0;width:1200px;background:#1b1b1e;padding:32px;border-radius:10px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;';

const TITLE_BLOCK_STYLE = 'text-align:center;margin-bottom:20px;';

/**
 * Builds the centered report header shown at the top of the PNG Fluency Score
 * export. Pure so it can be unit-tested without a DOM.
 *
 * The date is rendered through `escapeHtml` because it derives from the user's
 * session-log `lastUpdated` value, which is untrusted session-log data.
 */
export function buildShareCardHeaderHtml(lastUpdated: string): string {
  const when = new Date(lastUpdated).toLocaleString();
  return `<div style="${TITLE_BLOCK_STYLE}"><div style="font-size:28px;font-weight:800;color:#fff;margin-bottom:8px;">AI Engineering Fluency Score</div><div style="font-size:16px;color:#b8b8c8;">Report &middot; ${escapeHtml(when)}</div></div>`;
}

/**
 * The CSS text for the off-screen export card container. Kept as a constant so
 * the PNG export composes its card from a single, stable value that
 * snapshot-style assertions can pin.
 */
export function shareCardContainerStyle(): string {
  return SHARE_CARD_BASE_STYLE;
}
