/**
 * Display labels shared between the AES report renderers (`aesWorkflowReportRenderer.ts`,
 * for the CLI's text/HTML export) and the VS Code webview section
 * (`vscode-extension/src/webview/maturity/aesSection.ts`).
 *
 * Kept in one place so the wording a team sees in the CLI's `--html` export
 * matches what they see in the Fluency Score view — divergent copy for the
 * same rating would read as two different assessments.
 */
import type { AesActivity, AesMode, AesPosture, AesStock, AesSupportingEvidence } from './types';

export const ACTIVITY_LABELS: Record<AesActivity, string> = {
	define: 'Define — decide what should happen',
	deliver: 'Deliver — make the change',
	detect: 'Detect — observe what happened',
};

export const MODE_LABELS: Record<AesMode, string> = {
	director: 'Director — sets direction',
	performer: 'Performer — carries out the work',
	assessor: 'Assessor — evaluates the result',
};

export const STOCK_LABELS: Record<AesStock, string> = {
	governance: 'Governance',
	sharedKnowledge: 'Shared knowledge',
	customerValue: 'Customer value',
};

export const DELEGATION_LABELS: Record<string, string> = {
	'human-only': 'Human-only',
	'agent-assisted': 'Agent-assisted',
	'agent-performed-reviewed': 'Agent-performed, human-reviewed',
	'agent-performed-autonomous': 'Agent-performed, autonomous',
};

export const RATING_LABELS: Record<string, string> = {
	strong: 'Strong',
	developing: 'Developing',
	weak: 'Weak',
	unknown: 'Unknown',
};

export const POSTURE_LABELS: Record<AesPosture, string> = {
	'healthy-agent-native': 'Healthy agent-native',
	'healthy-but-underused': 'Healthy but underused',
	'underdeveloped-foundations': 'Underdeveloped foundations',
	'stretched-agent-native': 'Stretched agent-native',
	unclear: 'Unclear — missing stock evidence',
};

export const EVIDENCE_STATE_ICON: Record<AesSupportingEvidence['state'], string> = {
	present: '✔',
	absent: '✘',
	unknown: '?',
};
