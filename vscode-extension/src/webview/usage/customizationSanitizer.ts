/**
 * Pure data-sanitization helper for WorkspaceCustomizationMatrix objects received via postMessage.
 * Extracted into its own module (no DOM / CSS dependencies) so it can be unit-tested in Node.js.
 */

export type CustomizationTypeStatus = '✅' | '⚠️' | '❌';

const VALID_STATUSES = new Set<string>(['✅', '⚠️', '❌']);

export interface SanitizedCustomizationType {
	id: string;
	icon: string;
	label: string;
}

export interface SanitizedCustomizationRow {
	workspacePath: string;
	workspaceName: string;
	sessionCount: number;
	interactionCount: number;
	typeStatuses: { [typeId: string]: CustomizationTypeStatus };
}

export interface SanitizedCustomizationMatrix {
	customizationTypes: SanitizedCustomizationType[];
	workspaces: SanitizedCustomizationRow[];
	totalWorkspaces: number;
	workspacesWithIssues: number;
}

function coerceNumber(value: unknown): number {
	const n = Number(value);
	return Number.isFinite(n) ? n : 0;
}

/**
 * Sanitizes a raw (untrusted) customization matrix from postMessage.
 * Returns undefined when the input is not a valid object.
 */
export function sanitizeCustomizationMatrix(rawMatrix: unknown): SanitizedCustomizationMatrix | undefined {
	if (!rawMatrix || typeof rawMatrix !== 'object') { return undefined; }
	const m = rawMatrix as Record<string, unknown>;

	const customizationTypes: SanitizedCustomizationType[] = Array.isArray(m.customizationTypes)
		? (m.customizationTypes as unknown[])
			.filter((t): t is Record<string, unknown> => !!t && typeof t === 'object')
			.map(t => ({
				id: typeof t.id === 'string' ? t.id : '',
				icon: typeof t.icon === 'string' ? t.icon : '',
				label: typeof t.label === 'string' ? t.label : '',
			}))
			.filter(t => t.id !== '')
		: [];

	const workspaces: SanitizedCustomizationRow[] = Array.isArray(m.workspaces)
		? (m.workspaces as unknown[])
			.filter((w): w is Record<string, unknown> => !!w && typeof w === 'object')
			.map(w => {
				const rawStatuses = (w.typeStatuses && typeof w.typeStatuses === 'object')
					? w.typeStatuses as Record<string, unknown>
					: {};
				const typeStatuses: { [typeId: string]: CustomizationTypeStatus } = {};
				for (const [key, val] of Object.entries(rawStatuses)) {
					typeStatuses[key] = VALID_STATUSES.has(val as string) ? (val as CustomizationTypeStatus) : '❌';
				}
				return {
					workspacePath: typeof w.workspacePath === 'string' ? w.workspacePath : '',
					workspaceName: typeof w.workspaceName === 'string' ? w.workspaceName : '',
					sessionCount: coerceNumber(w.sessionCount),
					interactionCount: coerceNumber(w.interactionCount),
					typeStatuses,
				};
			})
		: [];

	return {
		customizationTypes,
		workspaces,
		totalWorkspaces: coerceNumber(m.totalWorkspaces),
		workspacesWithIssues: coerceNumber(m.workspacesWithIssues),
	};
}
