import { escapeHtml } from '../shared/formatUtils';

export type CustomizationTypeStatus = '✅' | '⚠️' | '❌';

/**
 * Returns a modern styled HTML badge for a status value, replacing plain emoji icons.
 * Pass/fresh → green ✓, warning/stale → amber !, fail/missing → red ✕
 */
export function statusBadgeHtml(status: CustomizationTypeStatus | string, label?: string): string {
	const titleAttr = label ? ` title="${escapeHtml(label)}"` : '';
	const base = 'display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:4px;font-weight:700;flex-shrink:0;';
	if (status === '✅') {
		return `<span style="${base}background:rgba(34,197,94,0.2);border:1px solid rgba(34,197,94,0.5);color:#4ade80;font-size:12px;"${titleAttr} aria-label="${escapeHtml(label ?? 'Present and fresh')}">✓</span>`;
	} else if (status === '⚠️') {
		return `<span style="${base}background:rgba(251,191,36,0.2);border:1px solid rgba(251,191,36,0.5);color:#fbbf24;font-size:12px;"${titleAttr} aria-label="${escapeHtml(label ?? 'Present but stale')}">!</span>`;
	} else {
		return `<span style="${base}background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.5);color:#f87171;font-size:12px;"${titleAttr} aria-label="${escapeHtml(label ?? 'Missing')}">✕</span>`;
	}
}
