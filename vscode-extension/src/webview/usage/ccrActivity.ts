import { setHtml } from '../shared/domUtils';
import { escapeHtml } from '../shared/formatUtils';

/**
 * Inline "Check actual CCR activity" button + result placeholder for one reviewer-requested PR
 * detail row. On-demand only — see `handleCheckCcrActivity` in `extension.ts` for why this isn't
 * part of the bulk Repository PRs snapshot.
 */
export function renderCcrCheckButtonHtml(owner: string, repo: string, prNumber: number): string {
	const o = escapeHtml(owner);
	const r = escapeHtml(repo);
	return ` <button class="btn-check-ccr" data-owner="${o}" data-repo="${r}" data-pr="${prNumber}" style="font-size:10px; padding:1px 6px; cursor:pointer; background:var(--bg-tertiary); color:var(--text-secondary); border:1px solid var(--border-color); border-radius:4px;">Check actual CCR activity</button><span class="ccr-activity-result" data-ccr-result="${o}/${r}#${prNumber}" style="margin-left:6px; font-size:11px; color:var(--text-secondary);"></span>`;
}

/**
 * Delegated click handler for `.btn-check-ccr` buttons inside `containerId`. Attached once to the
 * persistent container element, so it keeps working across re-renders that replace the container's
 * innerHTML (e.g. `updateReposPrPanel`) without needing to be rewired.
 */
export function wireCcrActivityButtons(containerId: string, postMessage: (message: unknown) => void): void {
	document.getElementById(containerId)?.addEventListener('click', (e: MouseEvent) => {
		const btn = (e.target as HTMLElement).closest<HTMLElement>('.btn-check-ccr');
		if (!btn) { return; }
		const owner = btn.getAttribute('data-owner');
		const repo = btn.getAttribute('data-repo');
		const prNumber = Number(btn.getAttribute('data-pr'));
		if (!owner || !repo || !Number.isFinite(prNumber)) { return; }
		btn.setAttribute('disabled', 'true');
		const resultEl = document.querySelector<HTMLElement>(`[data-ccr-result="${owner}/${repo}#${prNumber}"]`);
		if (resultEl) { resultEl.textContent = 'Checking…'; }
		postMessage({ command: 'checkCcrActivity', owner, repo, prNumber });
	});
}

/** Renders the response of an on-demand `checkCcrActivity` lookup next to the button that triggered it. */
export function renderCcrActivityResult(owner: string, repo: string, prNumber: number, message: any): void {
	const resultEl = document.querySelector<HTMLElement>(`[data-ccr-result="${owner}/${repo}#${prNumber}"]`);
	const btn = document.querySelector<HTMLButtonElement>(`.btn-check-ccr[data-owner="${owner}"][data-repo="${repo}"][data-pr="${prNumber}"]`);
	btn?.removeAttribute('disabled');
	if (!resultEl) { return; }
	if (message.command === 'ccrActivityError') {
		resultEl.textContent = `⚠️ ${typeof message.error === 'string' ? message.error : 'Failed to load'}`;
		resultEl.style.color = 'var(--text-secondary)';
		return;
	}
	const reviews = Array.isArray(message.reviews) ? message.reviews : [];
	const requests = Array.isArray(message.requests) ? message.requests : [];
	if (reviews.length === 0) {
		resultEl.textContent = 'No completed Copilot reviews found on this PR yet.';
		return;
	}
	const requesterNames: string[] = requests.map((req: any) => String(req.requestedBy ?? 'unknown'));
	const requesters = [...new Set(requesterNames)];
	const requestedBy = requesters.length > 0 ? ` — requested by ${requesters.map((name) => escapeHtml(name)).join(', ')}` : '';
	const infoTitle = 'Not the AI-credit dollar cost — GitHub does not expose that to a non-admin user. '
		+ 'Each completed review is a billable CCR event; who actually pays for it depends on whether it '
		+ 'was requested manually (requester pays) or via repo-wide auto-review (PR author pays), which '
		+ "this API can't distinguish.";
	setHtml(resultEl, `${reviews.length} completed review${reviews.length === 1 ? '' : 's'}${requestedBy} <span title="${escapeHtml(infoTitle)}">ℹ️</span>`);
}
