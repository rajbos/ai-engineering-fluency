// The Efficiency view's headline banner. A pure builder with no DOM or CSS
// imports so its text is unit-testable directly in Node, like bucketDetail.ts.

import { escapeHtml } from '../shared/formatUtils';
import type { EfficiencyDelta } from '../../../../src/efficiencyAnalysis';

/**
 * Judges the Month vs Month deltas, so a banner that sends the reader to another
 * tab has to name that one: Cost Attribution compares rolling 30-day windows, and
 * would explain a different change than the calendar months counted here.
 */
export function computeVerdict(deltas: EfficiencyDelta[], prevWindow: string): { cls: string; icon: string; text: string } {
	const scored = deltas.filter(x => x.improved !== null);
	if (scored.length === 0) {
		return { cls: 'unknown', icon: '🔍', text: 'Not enough data yet to judge an efficiency trend — keep using AI-assisted sessions and check back after a few weeks.' };
	}
	const improved = scored.filter(x => x.improved).length;
	const share = improved / scored.length;
	const detail = `${improved} of ${scored.length} efficiency metrics improved vs. ${escapeHtml(prevWindow)}`;
	if (share >= 0.6) { return { cls: 'improving', icon: '🚀', text: `You are trending more efficient: ${detail}.` }; }
	if (share >= 0.4) { return { cls: 'mixed', icon: '⚖️', text: `Mixed picture: ${detail}. The Month vs Month tab shows which metrics moved.` }; }
	return { cls: 'declining', icon: '🧭', text: `Efficiency dipped: only ${detail}. The Month vs Month tab shows which metrics moved.` };
}
