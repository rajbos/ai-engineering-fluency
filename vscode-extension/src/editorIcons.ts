/**
 * Single source of truth for editor display-name → emoji icon mappings.
 *
 * Imported by both the extension host (extension.ts) and the webview bundles
 * (webview/shared/formatUtils.ts, webview/diagnostics/main.ts) so there is
 * exactly one place to add or change an icon.
 */

export const EDITOR_ICON_MAP: Record<string, string> = {
	'VS Code': '💙',
	'VS Code Insiders': '💚',
	'VS Code Exploration': '🧪',
	'VS Code Server': '☁️',
	'VS Code Server (Insiders)': '☁️',
	'VSCodium': '🔷',
	'Cursor': '🖱️',
	'Copilot CLI': '🤖',
	'OpenCode': '🟢',
	'Visual Studio': '🪟',
	'Claude Code': '🟠',
	'Claude Desktop Cowork': '🟠',
	'Mistral Vibe': '🔥',
	'Gemini CLI': '💎',
	'Antigravity': '🚀',
	'JetBrains': '🧩',
	'Crush': '🦾',
	'Windsurf': '🏄',
	'Continue': '▶️',
	'Pi': 'π',
	'Unknown': '❓',
};

/** Returns the emoji icon for a known editor display name. Falls back to '📝'. */
export function getEditorIconByName(editor: string): string {
	return EDITOR_ICON_MAP[editor] ?? '📝';
}
