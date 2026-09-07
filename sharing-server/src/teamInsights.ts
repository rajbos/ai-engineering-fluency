import { getTeamUsageDays } from './db.js';

export type UsageCohort = 'Light' | 'Medium' | 'Heavy' | 'Very heavy';

export interface TeamMember {
	isSelf: boolean;
	inputTokens: number;
	outputTokens: number;
	totalTokens: number;
	interactions: number;
	daysActive: number;
	tokensPerActiveDay: number;
	sharePercent: number;
	rank: number | null;
	percentile: number | null;
	cohort: UsageCohort | null;
}

export interface TeamInsights {
	days: number;
	startDay: string;
	endDay: string;
	summary: {
		activeUsers: number;
		inputTokens: number;
		outputTokens: number;
		totalTokens: number;
		interactions: number;
		averageTokens: number;
		medianTokens: number;
	};
	members: TeamMember[];
	self: TeamMember;
	cohorts: Array<{ label: UsageCohort; members: number }>;
	daily: Array<{
		day: string;
		inputTokens: number;
		outputTokens: number;
		totalTokens: number;
		interactions: number;
		ownTokens: number;
		activeUsers: number;
	}>;
	quartiles: { q1: number; q2: number; q3: number };
}

export function parseTeamDays(raw: string | undefined): number {
	return raw === '7' ? 7 : raw === '90' ? 90 : 30;
}

function emptyMember(isSelf: boolean): TeamMember {
	return {
		isSelf, inputTokens: 0, outputTokens: 0, totalTokens: 0,
		interactions: 0, daysActive: 0, tokensPerActiveDay: 0, sharePercent: 0,
		rank: null, percentile: null, cohort: null,
	};
}

function quantile(sorted: number[], fraction: number): number {
	if (sorted.length === 0) return 0;
	const position = (sorted.length - 1) * fraction;
	const lower = Math.floor(position);
	return sorted[lower] + (sorted[Math.ceil(position)] - sorted[lower]) * (position - lower);
}

/** Explicit identity-free projection shared by bearer API and cookie-authenticated HTML. */
export function getTeamInsights(viewerId: number, days: number): TeamInsights {
	days = parseTeamDays(String(days));
	const end = new Date();
	end.setUTCHours(0, 0, 0, 0);
	const start = new Date(end);
	start.setUTCDate(start.getUTCDate() - days + 1);
	const startDay = start.toISOString().slice(0, 10);
	const endDay = end.toISOString().slice(0, 10);
	const daily: TeamInsights['daily'] = Array.from({ length: days }, (_, index) => {
		const date = new Date(start);
		date.setUTCDate(date.getUTCDate() + index);
		return {
			day: date.toISOString().slice(0, 10), inputTokens: 0, outputTokens: 0,
			totalTokens: 0, interactions: 0, ownTokens: 0, activeUsers: 0,
		};
	});
	const byDay = new Map(daily.map(day => [day.day, day]));
	const byUser = new Map<number, TeamMember>();
	for (const row of getTeamUsageDays(startDay, endDay)) {
		const day = byDay.get(row.day);
		if (!day) continue;
		let member = byUser.get(row.user_id);
		if (!member) {
			member = emptyMember(row.user_id === viewerId);
			byUser.set(row.user_id, member);
		}
		const total = row.input_tokens + row.output_tokens;
		member.inputTokens += row.input_tokens;
		member.outputTokens += row.output_tokens;
		member.totalTokens += total;
		member.interactions += row.interactions;
		member.daysActive++;
		day.inputTokens += row.input_tokens;
		day.outputTokens += row.output_tokens;
		day.totalTokens += total;
		day.interactions += row.interactions;
		day.activeUsers++;
		if (member.isSelf) day.ownTokens += total;
	}

	const members = [...byUser.values()].sort((a, b) => b.totalTokens - a.totalTokens);
	const ascendingTotals = members.map(member => member.totalTokens).reverse();
	const quartiles = {
		q1: quantile(ascendingTotals, 0.25),
		q2: quantile(ascendingTotals, 0.5),
		q3: quantile(ascendingTotals, 0.75),
	};
	const summary: TeamInsights['summary'] = {
		activeUsers: members.length,
		inputTokens: 0, outputTokens: 0, totalTokens: 0, interactions: 0,
		averageTokens: 0, medianTokens: quartiles.q2,
	};
	for (const member of members) {
		summary.inputTokens += member.inputTokens;
		summary.outputTokens += member.outputTokens;
		summary.totalTokens += member.totalTokens;
		summary.interactions += member.interactions;
	}
	summary.averageTokens = members.length ? summary.totalTokens / members.length : 0;
	const labels: UsageCohort[] = ['Light', 'Medium', 'Heavy', 'Very heavy'];
	const cohorts = labels.map(label => ({ label, members: 0 }));
	for (let first = 0; first < members.length;) {
		let after = first + 1;
		while (after < members.length && members[after].totalTokens === members[first].totalTokens) after++;
		for (let index = first; index < after; index++) {
			const member = members[index];
			const cohortIndex = member.totalTokens <= quartiles.q1 ? 0
				: member.totalTokens <= quartiles.q2 ? 1 : member.totalTokens <= quartiles.q3 ? 2 : 3;
			member.rank = first + 1;
			member.percentile = members.length > 1 ? (members.length - after) / (members.length - 1) * 100 : null;
			member.cohort = labels[cohortIndex];
			member.tokensPerActiveDay = member.totalTokens / member.daysActive;
			member.sharePercent = summary.totalTokens ? member.totalTokens / summary.totalTokens * 100 : 0;
			cohorts[cohortIndex].members++;
		}
		first = after;
	}

	return {
		days, startDay, endDay, summary, members,
		self: members.find(member => member.isSelf) ?? emptyMember(true),
		cohorts, daily, quartiles,
	};
}
