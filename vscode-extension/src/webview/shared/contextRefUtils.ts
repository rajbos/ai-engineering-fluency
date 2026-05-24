/**
 * Shared utilities for working with context references across webviews
 */

export type ContextReferenceUsage = {
	file: number;
	selection: number;
	implicitSelection: number;
	symbol: number;
	codebase: number;
	workspace: number;
	terminal: number;
	vscode: number;
	terminalLastCommand: number;
	terminalSelection: number;
	clipboard: number;
	changes: number;
	outputPanel: number;
	problemsPanel: number;
	pullRequest: number; // #pr / #pullRequest references (Copilot PR chat, April 2026)
	byKind: { [kind: string]: number };
	copilotInstructions: number;
	agentsMd: number;
	byPath: { [path: string]: number };
};

/** A single customization file found in a workspace */
export type CustomizationFileEntry = {
	path: string;           // Absolute file path
	relativePath: string;   // Workspace-relative path for display
	type: string;           // From pattern definition (e.g., 'instructions', 'skill', 'agent')
	icon: string;           // Emoji icon from pattern definition
	label: string;          // Human-readable label from pattern definition
	name: string;           // Display name (e.g., skill directory name, or filename)
	lastModified: string | null;  // ISO date string, null if file not accessible
	isStale: boolean;       // true if lastModified > stalenessThresholdDays ago
};

/** Customization files summary for all workspaces found in sessions */
export type WorkspaceCustomizationSummary = {
	workspaces: {
		[workspacePath: string]: {
			name: string;                   // Workspace folder basename
			files: CustomizationFileEntry[];
		};
	};
	totalFiles: number;
	staleFiles: number;
};

/** Status of a customization type in a workspace */
export type CustomizationTypeStatus = '✅' | '⚠️' | '❌';

/** Matrix row data for one workspace */
export type WorkspaceCustomizationRow = {
	workspacePath: string;      // Full path (for uniqueness)
	workspaceName: string;      // Basename for display
	sessionCount: number;       // Number of sessions in last 30 days
	typeStatuses: {             // Status per customization type
		[typeId: string]: CustomizationTypeStatus;
	};
};

/** Matrix view data structure */
export type WorkspaceCustomizationMatrix = {
	customizationTypes: Array<{
		id: string;
		icon: string;
		label: string;
	}>;
	workspaces: WorkspaceCustomizationRow[];
	totalWorkspaces: number;
	workspacesWithIssues: number;
};

/**
 * Calculate the total number of context references.
 * This is the single source of truth for what constitutes a context reference.
 */
export function getTotalContextRefs(refs: ContextReferenceUsage): number {
	return refs.file + refs.selection + refs.implicitSelection + refs.symbol + refs.codebase +
		refs.workspace + refs.terminal + refs.vscode + refs.copilotInstructions + refs.agentsMd +
		(refs.terminalLastCommand || 0) + (refs.terminalSelection || 0) + (refs.clipboard || 0) +
		(refs.changes || 0) + (refs.outputPanel || 0) + (refs.problemsPanel || 0) + (refs.pullRequest || 0);
}

/**
 * Calculate the count of implicit (auto-attached) context references.
 * Implicit refs are not user-initiated: copilotInstructions, agentsMd, implicitSelection
 */
export function getImplicitContextRefs(refs: ContextReferenceUsage): number {
	return refs.copilotInstructions + refs.agentsMd + refs.implicitSelection;
}

/**
 * Calculate the count of explicit (user-initiated) context references.
 * Explicit refs are user-initiated: #file, #selection, #symbol, #codebase, @workspace, @terminal, @vscode,
 * #terminalLastCommand, #terminalSelection, #clipboard, #changes, #outputPanel, #problemsPanel, #pr
 */
export function getExplicitContextRefs(refs: ContextReferenceUsage): number {
	return refs.file + refs.selection + refs.symbol + refs.codebase +
		refs.workspace + refs.terminal + refs.vscode +
		(refs.terminalLastCommand || 0) + (refs.terminalSelection || 0) + (refs.clipboard || 0) +
		(refs.changes || 0) + (refs.outputPanel || 0) + (refs.problemsPanel || 0) + (refs.pullRequest || 0);
}

type RefLabelEntry = {
	key: keyof ContextReferenceUsage;
	full: string;
	abbr: string;
};

const REF_LABELS: RefLabelEntry[] = [
	{ key: 'file',                 full: '#file',                  abbr: '#file'    },
	{ key: 'selection',            full: '#selection',             abbr: '#sel'     },
	{ key: 'implicitSelection',    full: 'implicit',               abbr: 'impl'     },
	{ key: 'symbol',               full: '#symbol',                abbr: '#sym'     },
	{ key: 'codebase',             full: '#codebase',              abbr: '#cb'      },
	{ key: 'workspace',            full: '@workspace',             abbr: '@ws'      },
	{ key: 'terminal',             full: '@terminal',              abbr: '@term'    },
	{ key: 'vscode',               full: '@vscode',                abbr: '@vsc'     },
	{ key: 'terminalLastCommand',  full: '#terminalLastCommand',   abbr: '#termLC'  },
	{ key: 'terminalSelection',    full: '#terminalSelection',     abbr: '#termSel' },
	{ key: 'clipboard',            full: '#clipboard',             abbr: '#clip'    },
	{ key: 'changes',              full: '#changes',               abbr: '#chg'     },
	{ key: 'outputPanel',          full: '#outputPanel',           abbr: '#out'     },
	{ key: 'problemsPanel',        full: '#problemsPanel',         abbr: '#prob'    },
	{ key: 'pullRequest',          full: '#pr',                    abbr: '#pr'      },
	{ key: 'copilotInstructions',  full: '📋 instructions',        abbr: '📋 inst'  },
	{ key: 'agentsMd',             full: '🤖 agents',              abbr: '🤖 ag'    },
];

/**
 * Generate a summary string of context references.
 * @param refs - The context reference usage counts
 * @param abbreviated - If true, use short labels (e.g., '#sel' instead of '#selection')
 */
export function getContextRefsSummary(refs: ContextReferenceUsage, abbreviated = false): string {
	const parts: string[] = [];
	for (const entry of REF_LABELS) {
		const count = (refs[entry.key] as number) || 0;
		if (count > 0) {
			const label = abbreviated ? entry.abbr : entry.full;
			parts.push(`${label}: ${count}`);
		}
	}
	return parts.length > 0 ? parts.join(', ') : 'None';
}
