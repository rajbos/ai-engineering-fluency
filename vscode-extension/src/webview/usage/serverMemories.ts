/**
 * Copilot **server-side** repository memories — the Tools-tab section and its payload guard.
 *
 * Split out of `main.ts` rather than added to it: that file sits just under the repository's
 * 6000-line `max-lines` ceiling (see AGENTS.md), and a new section is exactly the kind of
 * growth that is supposed to become a module instead.
 *
 * See `src/copilotServerMemories.ts` for where this data comes from, and
 * `docs/features/COPILOT-SERVER-MEMORIES.md` for why it is analyzed rather than just listed.
 */
import type {
	ServerMemoriesAnalysisView,
	ServerMemoryDocumentedEntryView,
	ServerMemoryPromotionGroupView,
	ServerMemoryPromotionTarget,
} from '../../../../src/types';
import { escapeHtml, formatNumber } from '../shared/formatUtils';
import { localize, localizeFormat } from '../shared/localization';

/** Messages this section posts to the extension host; both already have analysis-panel handlers. */
export type ServerMemoriesMessage =
	| { command: 'draftCopilotChatWithPrompt'; prompt: string }
	| { command: 'openFile'; path: string };

const count = (value: unknown): number => (typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0);
const optionalString = (value: unknown): string | undefined => (typeof value === 'string' && value !== '' ? value : undefined);

function sanitizePromotionGroups(raw: unknown): ServerMemoryPromotionGroupView[] {
	if (!Array.isArray(raw)) { return []; }
	return raw
		.filter(group => group && typeof group.displaySubject === 'string' && typeof group.representativeFact === 'string')
		.map(group => {
			const view: ServerMemoryPromotionGroupView = {
				displaySubject: group.displaySubject,
				representativeFact: group.representativeFact,
				repeatCount: count(group.repeatCount),
				citationCount: count(group.citationCount),
			};
			const prompt = optionalString(group.prompt);
			if (prompt) { view.prompt = prompt; }
			return view;
		});
}

function sanitizeDocumentedMemories(raw: unknown): ServerMemoryDocumentedEntryView[] {
	if (!Array.isArray(raw)) { return []; }
	return raw
		.filter(entry => entry && typeof entry.subject === 'string' && typeof entry.fact === 'string')
		.map(entry => ({
			subject: entry.subject,
			fact: entry.fact,
			files: Array.isArray(entry.files)
				? entry.files
					.filter((file: unknown) => file && typeof (file as { path?: unknown }).path === 'string')
					.map((file: { path: string; absolutePath?: unknown }) => {
						const absolutePath = optionalString(file.absolutePath);
						return absolutePath ? { path: file.path, absolutePath } : { path: file.path };
					})
				: [],
		}));
}

function sanitizePromotionTarget(raw: unknown): ServerMemoryPromotionTarget | undefined {
	if (!raw || typeof raw !== 'object') { return undefined; }
	const target = raw as Partial<ServerMemoryPromotionTarget>;
	if (target.path !== 'AGENTS.md' && target.path !== '.github/copilot-instructions.md') { return undefined; }
	return { path: target.path, exists: target.exists === true };
}

/**
 * Normalize the optional server-memories projection so rendering never throws on a partial
 * payload. Unlike `_sanitizeMemoryFilesAnalysis` in `main.ts` an *empty* analysis is still kept:
 * a repository with memory switched off, or one whose store could not be read, has no
 * groups to show but does have a reason worth rendering.
 *
 * The scope, target and documented-list fields are optional, so a payload from an older
 * host (or cache) still renders — just without them.
 */
export function sanitizeServerMemoriesAnalysis(raw: unknown): ServerMemoriesAnalysisView | null {
	if (!raw || typeof raw !== 'object') { return null; }
	const sm = raw as Partial<ServerMemoriesAnalysisView>;
	if (typeof sm.repo !== 'string') { return null; }
	return {
		repo: sm.repo,
		// Tri-state on purpose: `undefined` means the enablement check failed, which is not
		// the same as the repository having memory switched off.
		enabled: typeof sm.enabled === 'boolean' ? sm.enabled : undefined,
		error: typeof sm.error === 'string' ? sm.error : undefined,
		truncated: sm.truncated === true,
		totalMemories: count(sm.totalMemories),
		distinctSubjects: count(sm.distinctSubjects),
		documentedCount: count(sm.documentedCount),
		promotionCandidateCount: count(sm.promotionCandidateCount),
		repeatedGroupCount: count(sm.repeatedGroupCount),
		fullyStaleCount: count(sm.fullyStaleCount),
		topPromotionGroups: sanitizePromotionGroups(sm.topPromotionGroups),
		repoRoot: optionalString(sm.repoRoot),
		workspaceFolderCount: count(sm.workspaceFolderCount),
		promotionTarget: sanitizePromotionTarget(sm.promotionTarget),
		documentedMemories: sanitizeDocumentedMemories(sm.documentedMemories),
	};
}

/**
 * Localize a template and escape it, then splice in pre-built HTML for its placeholders —
 * so a value can be emphasized without letting the translation itself carry markup.
 */
function localizeWithHtml(key: string, ...htmlArgs: string[]): string {
	const marker = (i: number) => `\u0001${i}\u0001`;
	const escaped = escapeHtml(localizeFormat(key, ...htmlArgs.map((_, i) => marker(i))));
	return escaped.replace(/\u0001(\d+)\u0001/g, (match, index) => htmlArgs[Number(index)] ?? match);
}

const TH = 'padding:5px 8px; color:var(--text-primary); font-weight:600;';
const TD = 'padding:5px 8px; color:var(--text-primary);';
const BUTTON = 'font-size:11px; padding:2px 8px; cursor:pointer; white-space:nowrap;';

/** Which repository, which checkout, and why that is not "this workspace". */
function buildScopeHtml(analysis: ServerMemoriesAnalysisView): string {
	const repo = `<strong>${escapeHtml(analysis.repo)}</strong>`;
	const scope = analysis.repoRoot
		? localizeWithHtml('serverMemories.scope', repo, `<code>${escapeHtml(analysis.repoRoot)}</code>`)
		: localizeWithHtml('serverMemories.scopeNoPath', repo);
	const multiRoot = (analysis.workspaceFolderCount ?? 0) > 1
		? `<div>${escapeHtml(localizeFormat('serverMemories.multiRootNote', analysis.workspaceFolderCount ?? 0))}</div>`
		: '';
	return `<div class="server-memories-scope" style="margin-bottom:8px; font-size:12px; color:var(--text-secondary);">
		<div>${scope}</div>
		${multiRoot}
		<div>${escapeHtml(localize('serverMemories.localVsServer'))}</div>
	</div>`;
}

function buildPromoteBlockHtml(analysis: ServerMemoriesAnalysisView): string {
	if (analysis.topPromotionGroups.length === 0) { return ''; }
	const warn = 'var(--vscode-editorWarning-foreground, #cca700)';
	const target = analysis.promotionTarget;
	const hasActions = analysis.topPromotionGroups.some(group => group.prompt);
	const rows = analysis.topPromotionGroups.map(group => {
		// Only a repeat is worth calling out — a badge reading "re-learned 1x" would add
		// noise to every single-sighting row without saying anything.
		const badge = group.repeatCount > 1
			? ` <span style="color:${warn}; font-size:11px;">(${escapeHtml(localizeFormat('serverMemories.repeatBadge', group.repeatCount))})</span>`
			: '';
		// A row only gets the button when the host built a prompt for it, which it does only
		// for promotion groups — documented, user-input-only and fully stale memories never are.
		const action = group.prompt
			? `<button class="server-memory-draft-btn" data-prompt="${escapeHtml(group.prompt)}" style="${BUTTON}" title="${escapeHtml(localizeFormat('serverMemories.askCopilotTooltip', target?.path ?? 'AGENTS.md'))}">${escapeHtml(localize('serverMemories.askCopilot'))}</button>`
			: '';
		return `<tr style="border-bottom:1px solid var(--border-color);">
			<td style="${TD} white-space:nowrap;">${escapeHtml(group.displaySubject)}${badge}</td>
			<td style="${TD}">${escapeHtml(group.representativeFact)}</td>
			<td style="${TD} text-align:right;">${group.citationCount}</td>
			${hasActions ? `<td style="${TD} text-align:right;">${action}</td>` : ''}
		</tr>`;
	}).join('');
	const targetNote = target
		? ` ${localizeWithHtml(target.exists ? 'serverMemories.targetExisting' : 'serverMemories.targetNew', `<code>${escapeHtml(target.path)}</code>`)}`
		: '';
	return `
		<div style="margin-top:10px; font-size:13px; font-weight:600; color:var(--text-primary);">${escapeHtml(localize('serverMemories.promoteHeading'))}</div>
		<div style="margin-bottom:8px; font-size:12px; color:var(--text-secondary);">${escapeHtml(localize('serverMemories.promoteHint'))}${targetNote}</div>
		<div style="overflow-x:auto;">
			<table style="width:100%; border-collapse:collapse; font-size:12px;">
				<thead><tr style="border-bottom:1px solid var(--border-color);">
					<th style="${TH} text-align:left;">${escapeHtml(localize('serverMemories.table.subject'))}</th>
					<th style="${TH} text-align:left;">${escapeHtml(localize('serverMemories.table.fact'))}</th>
					<th style="${TH} text-align:right;">${escapeHtml(localize('serverMemories.table.sources'))}</th>
					${hasActions ? `<th style="${TH} text-align:right;">${escapeHtml(localize('serverMemories.table.action'))}</th>` : ''}
				</tr></thead>
				<tbody>${rows}</tbody>
			</table>
		</div>`;
}

function buildDocumentedBlockHtml(analysis: ServerMemoriesAnalysisView): string {
	const entries = analysis.documentedMemories ?? [];
	if (entries.length === 0) { return ''; }
	const rows = entries.map(entry => {
		const files = entry.files.map(file => {
			// No "Open file" for a citation the host could not resolve inside this checkout.
			const open = file.absolutePath
				? ` <button class="server-memory-open-btn" data-path="${escapeHtml(file.absolutePath)}" style="${BUTTON}">${escapeHtml(localize('serverMemories.openFile'))}</button>`
				: '';
			return `<div><code>${escapeHtml(file.path)}</code>${open}</div>`;
		}).join('');
		return `<tr style="border-bottom:1px solid var(--border-color);">
			<td style="${TD} white-space:nowrap;">${escapeHtml(entry.subject)}</td>
			<td style="${TD}">${escapeHtml(entry.fact)}</td>
			<td style="${TD}">${files}</td>
		</tr>`;
	}).join('');
	const showing = analysis.documentedCount > entries.length
		? ` (${escapeHtml(localizeFormat('serverMemories.showingOf', formatNumber(entries.length), formatNumber(analysis.documentedCount)))})`
		: '';
	return `
		<div style="margin-top:14px; font-size:13px; font-weight:600; color:var(--text-primary);">${escapeHtml(localize('serverMemories.documentedHeading'))}${showing}</div>
		<div style="margin-bottom:8px; font-size:12px; color:var(--text-secondary);">${escapeHtml(localize('serverMemories.documentedHint'))}</div>
		<div style="overflow-x:auto;">
			<table class="server-memories-documented" style="width:100%; border-collapse:collapse; font-size:12px;">
				<thead><tr style="border-bottom:1px solid var(--border-color);">
					<th style="${TH} text-align:left;">${escapeHtml(localize('serverMemories.table.subject'))}</th>
					<th style="${TH} text-align:left;">${escapeHtml(localize('serverMemories.table.fact'))}</th>
					<th style="${TH} text-align:left;">${escapeHtml(localize('serverMemories.table.citedFile'))}</th>
				</tr></thead>
				<tbody>${rows}</tbody>
			</table>
		</div>`;
}

/**
 * Render this repository's server-side Copilot memories.
 *
 * The section leads with the promotion candidates rather than a full list of the store:
 * a live repository can hold hundreds of memories, and reading them all is what the
 * GitHub settings page is for. What this view adds is the part that page cannot show —
 * which facts the agent keeps re-deriving from code because no instruction file states
 * them, which are already written down, and which memories now cite files that are gone.
 *
 * Renders nothing at all when the workspace is not a GitHub repository (`analysis` is
 * null), but *does* render when the store is empty or unreadable, since "memory is off
 * for this repo" is itself the answer to the question the section asks.
 */
export function buildServerMemoriesSectionHtml(analysis: ServerMemoriesAnalysisView | null | undefined): string {
	try {
		if (!analysis) { return ''; }

		const header = `
			<div class="section-title"><span>🧠</span><span>${escapeHtml(localize('serverMemories.sectionTitle'))}</span></div>
			<div class="section-subtitle" style="color:var(--text-primary); opacity:0.75;">${escapeHtml(localize('serverMemories.sectionSubtitle'))}</div>`;

		if (analysis.error) {
			return `<div id="section-server-memories" class="section">${header}
				<div style="font-size:13px; color:var(--text-secondary);">${escapeHtml(localizeFormat('serverMemories.unavailable', analysis.error))}</div>
			</div>`;
		}
		if (analysis.enabled === false) {
			return `<div id="section-server-memories" class="section">${header}
				<div style="font-size:13px; color:var(--text-secondary);">${escapeHtml(localize('serverMemories.disabled'))}</div>
			</div>`;
		}

		const warn = 'var(--vscode-editorWarning-foreground, #cca700)';
		return `
			<!-- Server Memories Section -->
			<div id="section-server-memories" class="section">
				${header}
				${buildScopeHtml(analysis)}
				<div style="margin-bottom:8px; font-size:13px; color:var(--text-primary);">
					${escapeHtml(localizeFormat('serverMemories.summary', formatNumber(analysis.totalMemories), formatNumber(analysis.distinctSubjects)))}
					${analysis.truncated ? ` · <span title="${escapeHtml(localize('serverMemories.truncatedTooltip'))}">${escapeHtml(localize('serverMemories.truncated'))}</span>` : ''}
					${analysis.documentedCount > 0 ? ` · ${escapeHtml(localizeFormat('serverMemories.documentedSummary', analysis.documentedCount))}` : ''}
					${analysis.fullyStaleCount > 0 ? ` · <span style="color:${warn};">${escapeHtml(localizeFormat('serverMemories.staleSummary', analysis.fullyStaleCount))}</span>` : ''}
				</div>
				${buildPromoteBlockHtml(analysis)}
				${buildDocumentedBlockHtml(analysis)}
			</div>`;
	} catch (error) {
		console.error(`[usage-webview] buildServerMemoriesSectionHtml failed: ${error instanceof Error ? error.message : String(error)}`);
		return `
			<div id="section-server-memories" class="section">
				<div class="section-title"><span>🧠</span><span>${escapeHtml(localize('serverMemories.sectionTitle'))}</span></div>
				<div class="section-subtitle" style="color:var(--text-primary); opacity:0.75;">${escapeHtml(localize('serverMemories.renderError'))}</div>
			</div>`;
	}
}

/**
 * Map a click inside the section to the host message it should send, or `null`. Split from
 * the listener so it can be unit-tested without a DOM event loop.
 *
 * The "Ask Copilot" button *drafts* the prompt (`draftCopilotChatWithPrompt`) rather than
 * submitting it: the prompt embeds agent-written memory text, so a person reviews it first.
 */
export function serverMemoriesMessageForClick(target: Element | null): ServerMemoriesMessage | null {
	const draft = target?.closest<HTMLElement>('.server-memory-draft-btn');
	const prompt = draft?.getAttribute('data-prompt');
	if (prompt) { return { command: 'draftCopilotChatWithPrompt', prompt }; }
	const open = target?.closest<HTMLElement>('.server-memory-open-btn');
	const path = open?.getAttribute('data-path');
	if (path) { return { command: 'openFile', path }; }
	return null;
}

/**
 * Wire the section's buttons with one delegated listener. Safe to call after every render:
 * a section element that is already wired is skipped (same `data-*` guard as
 * `wireCurationButtons` in `main.ts`), so a render that keeps the element cannot stack a
 * second listener and post every click twice. A rebuilt section is a new element and is
 * wired afresh.
 */
export function wireServerMemoriesButtons(postMessage: (message: ServerMemoriesMessage) => void): void {
	const section = document.getElementById('section-server-memories');
	if (!section || section.dataset.serverMemoriesWired === 'true') { return; }
	section.dataset.serverMemoriesWired = 'true';
	section.addEventListener('click', event => {
		const message = serverMemoriesMessageForClick(event.target as Element | null);
		if (message) { postMessage(message); }
	});
}
