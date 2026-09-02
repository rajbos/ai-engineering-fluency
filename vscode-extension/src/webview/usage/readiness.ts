export interface UsageWebviewReadyMessage {
	command: 'usageWebviewReady';
	/** Why readiness was announced — surfaced in the extension Output channel for diagnosis. */
	reason: UsageWebviewReadyReason;
	/** True when the GitHub activity containers exist in the DOM at announce time. */
	hasGitHubActivityContainers: boolean;
}

export type UsageWebviewReadyReason = 'listener-registered' | 'layout-rendered';

/**
 * Creates the readiness notifier for the extension-host replay channel.
 *
 * Readiness is announced more than once on purpose:
 *  - `listener-registered` fires at module evaluation, as early as the webview can receive
 *    anything at all, so state already sitting in the replay buffer is posted immediately.
 *  - `layout-rendered` fires after every layout render, once `#repos-pr-content` and
 *    `#agent-sessions-content` exist. The first announcement necessarily happens before
 *    `bootstrap()` has rendered anything, so a replay triggered by it lands in a DOM with no
 *    containers; without the second announcement the panel can sit on "Loading…" forever
 *    whenever the buffered state was never re-applied.
 *
 * Repeat announcements are cheap — the host just re-posts the latest message per feature — and
 * are what makes the handshake self-healing instead of one-shot.
 */
export function createUsageWebviewReadyNotifier(
	postMessage: (message: UsageWebviewReadyMessage) => void,
	hasContainers: () => boolean = defaultHasGitHubActivityContainers,
): (reason: UsageWebviewReadyReason) => void {
	return (reason) => {
		postMessage({
			command: 'usageWebviewReady',
			reason,
			hasGitHubActivityContainers: hasContainers(),
		});
	};
}

function defaultHasGitHubActivityContainers(): boolean {
	if (typeof document === 'undefined') { return false; }
	return Boolean(document.querySelector('#repos-pr-content') && document.querySelector('#agent-sessions-content'));
}

/** Reapply GitHub activity state that arrived before a render created its target containers. */
export function restoreGitHubActivityPanels<TRepo, TAgent>(
	repoData: TRepo | null,
	agentData: TAgent | null,
	renderRepo: (data: TRepo) => void,
	renderAgent: (data: TAgent) => void,
): void {
	if (repoData) { renderRepo(repoData); }
	if (agentData) { renderAgent(agentData); }
}
