// Tabs the extension host may activate via the 'switchTab' message. Guarded so a bogus tab
// name can never blank the dashboard by leaving every panel hidden.
export const SWITCHABLE_TABS: ReadonlySet<string> = new Set([
	'activity', 'sessions', 'tools', 'health', 'repos', 'agent', 'worktrees', 'insights', 'corrections'
]);

// Tab the webview should persist as active after a switchTab message: the requested tab when
// it is switchable, otherwise the current one. Persisting in module state (not just the DOM)
// matters because while the webview is in its loading state the tab bar doesn't exist, so
// clicking the tab button silently no-ops and the eventual renderLayout must still land on
// the requested tab — e.g. the worktree notification's "Show Me" action.
export function nextActiveTab(requested: unknown, current: string): string {
	const tab = String(requested);
	return SWITCHABLE_TABS.has(tab) ? tab : current;
}
