// The badge's history chart as SVG, so the Badge setup view can show what a sync puts on the badge.
import { normalizeHexColor, UNIVERSE_BADGE_THEME, type BadgePayload } from '../../../../src/badgePayload';

const WIDTH = 320;
const HEIGHT = 120;
const MARGIN = 6;
const RECENT_DAYS = 7;
const TRACK = '#32264c';

/**
 * Bars for each day's tokens, tallest = the peak of the range. Like the badge, the last
 * week is drawn in the accent colour, earlier days in the "good" colour and empty days dim.
 */
export function badgeChartSvg(payload: Pick<BadgePayload, 'days' | 'theme'>, label: string): string {
	const accent = normalizeHexColor(payload.theme.accent) ?? UNIVERSE_BADGE_THEME.accent;
	const good = normalizeHexColor(payload.theme.good) ?? UNIVERSE_BADGE_THEME.good;
	const days = payload.days;
	const peak = Math.max(1, ...days.map((day) => day[1]));
	const step = (WIDTH - MARGIN * 2) / Math.max(1, days.length);
	const barWidth = Math.max(1.5, step - (step > 6 ? 2 : 1));
	const bars = days.map((day, index) => {
		const tokens = day[1];
		const height = tokens ? Math.max(2, ((HEIGHT - MARGIN * 2) * tokens) / peak) : 2;
		const fill = tokens === 0 ? TRACK : index >= days.length - RECENT_DAYS ? accent : good;
		return `<rect x="${(MARGIN + index * step).toFixed(1)}" y="${(HEIGHT - MARGIN - height).toFixed(1)}" width="${barWidth.toFixed(1)}" height="${height.toFixed(1)}" rx="1" fill="${fill}"/>`;
	}).join('');
	const safeLabel = label.replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char] ?? char);
	return `<svg class="badge-chart" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-label="${safeLabel}" preserveAspectRatio="none">${bars}</svg>`;
}
