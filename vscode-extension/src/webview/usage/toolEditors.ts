/**
 * Per-tool editor attribution for the unknown-tools banner and the pre-filled
 * "Report Unknown Tools" issue: which editor(s) each tool was seen in.
 */
export type ToolCallsByEditor = { [tool: string]: { [editor: string]: number } };

/** Keep only `{ tool: { editor: number } }` entries with finite positive counts. */
export function sanitizeToolCallsByEditor(raw: unknown): ToolCallsByEditor | undefined {
	if (!raw || typeof raw !== 'object') { return undefined; }
	const out: ToolCallsByEditor = {};
	for (const [tool, byEditor] of Object.entries(raw as Record<string, unknown>)) {
		if (!byEditor || typeof byEditor !== 'object') { continue; }
		for (const [editor, count] of Object.entries(byEditor as Record<string, unknown>)) {
			if (typeof count === 'number' && Number.isFinite(count) && count > 0) {
				(out[tool] ??= {})[editor] = count;
			}
		}
	}
	return out;
}

/** Editors a tool was seen in, most-used first, e.g. "Claude Code (CLI), VS Code". Empty when unknown. */
export function formatToolEditors(tool: string, toolCallsByEditor?: ToolCallsByEditor): string {
	const byEditor = toolCallsByEditor?.[tool];
	if (!byEditor) { return ''; }
	return Object.entries(byEditor).sort((a, b) => b[1] - a[1]).map(([editor]) => editor).join(', ');
}
