import { escapeHtml } from '../shared/formatUtils';
import { localize, localizeFormat } from '../shared/localization';
import { PERIOD_LABELS } from '../shared/periodSelector';
import { socialShareButtonsHtml } from '../shared/socialShare';
import type { ShareCardPeriodData } from '../../shareCardData';
import { buildToolboxCardHtml } from './toolboxCard';

/** What the Share section currently acts on. */
export type ShareKind = 'score' | 'toolbox';

/** The score as the Share section shows it. The score always covers the last 30 days. */
export type ShareScore = { stage: number; label: string; description: string };

/** Id prefix of the section's social buttons. */
export const SHARE_ID_PREFIX = 'btn-share';

/** Plain-text version of the score, used by "Copy Summary Text". */
export function buildScoreSummaryText(score: ShareScore): string {
	return localizeFormat('share.score.summary', score.label, score.description);
}

function kindButtonHtml(kind: ShareKind): string {
	return `<button type="button" id="share-kind-${kind}" class="share-kind-btn" role="tab" aria-selected="false" aria-controls="share-panel-${kind}" data-share-kind="${kind}">${escapeHtml(localize(`share.kind.${kind}`))}</button>`;
}

function scorePanelHtml(score: ShareScore): string {
	const period = escapeHtml(PERIOD_LABELS.last30);
	return `
      <div class="share-description">${escapeHtml(localize('share.score.description'))}</div>
      <div class="toolbox-controls"><span class="toolbox-controls-label">${escapeHtml(localize('share.toolbox.period'))}</span><span class="share-period-fixed">${period}</span></div>
      <div class="score-share-card">
        <div class="toolbox-badge">${escapeHtml(localize('share.toolbox.badge'))}</div>
        <div class="toolbox-title">${escapeHtml(localize('share.exportTitle'))}</div>
        <div class="toolbox-subtitle">${period}</div>
        <div class="score-share-stage stage-${score.stage}">${escapeHtml(score.label)}</div>
        <div class="score-share-description">${escapeHtml(score.description)}</div>
      </div>`;
}

function toolboxPanelHtml(toolbox: ShareCardPeriodData | undefined): string {
	const body = toolbox
		? buildToolboxCardHtml(toolbox)
		: `<div class="share-description">${escapeHtml(localize('share.toolbox.unavailable'))}</div>`;
	return `
      <div class="share-description">${escapeHtml(localize('share.toolbox.description'))}</div>
      <div id="toolbox-body">${body}</div>`;
}

/** Copy, social and export actions. One row: they act on whichever kind the switch has selected. */
function actionsHtml(): string {
	return `
    <div class="share-buttons share-actions">
      <button id="btn-share-copy" class="share-btn share-btn-copy"><span>${escapeHtml(localize('share.toolbox.copy'))}</span></button>
      ${socialShareButtonsHtml(SHARE_ID_PREFIX)}
      <div class="export-dropdown-container">
        <button id="btn-export-toggle" class="share-btn share-btn-download"><span class="share-btn-icon">💾</span><span>${escapeHtml(localize('share.export.button'))}</span><span class="dropdown-arrow">▼</span></button>
        <div id="export-dropdown" class="export-dropdown-menu" style="display: none;">
          <button class="export-menu-item" data-export-type="png"><span class="export-menu-icon">🖼️</span><span>${escapeHtml(localize('share.export.png'))}</span></button>
          <button class="export-menu-item" data-export-type="pdf" data-score-only><span class="export-menu-icon">📄</span><span>${escapeHtml(localize('share.export.pdf'))}</span></button>
          <button class="export-menu-item" data-export-type="pptx" data-score-only><span class="export-menu-icon">📊</span><span>${escapeHtml(localize('share.export.pptx'))}</span></button>
        </div>
      </div>
    </div>`;
}

/**
 * The Fluency Score panel's Share section: a Score/Toolbox switch, one panel per
 * kind and one shared row of actions. Rendered with neither kind selected; call
 * {@link applyShareKind} once it is in the DOM.
 */
export function buildShareSectionHtml(score: ShareScore, toolbox: ShareCardPeriodData | undefined): string {
	return `
  <div class="share-section">
    <div class="share-header">
      <span class="share-icon">📢</span><span class="share-title">${escapeHtml(localize('share.section.title'))}</span>
      <div class="share-kind-switch" role="tablist" aria-label="${escapeHtml(localize('share.section.switchLabel'))}">${kindButtonHtml('score')}${kindButtonHtml('toolbox')}</div>
    </div>
    <div id="share-panel-score" class="share-panel" role="tabpanel" aria-labelledby="share-kind-score" hidden>${scorePanelHtml(score)}
    </div>
    <div id="share-panel-toolbox" class="share-panel toolbox-section" role="tabpanel" aria-labelledby="share-kind-toolbox" hidden>${toolboxPanelHtml(toolbox)}
    </div>${actionsHtml()}
  </div>`;
}

/**
 * Selects a kind: shows its panel, disables the actions when the toolbox has no
 * data to share, and limits the export menu to what the kind supports. PDF and
 * PowerPoint are multi-page score reports, so the toolbox card only exports as PNG.
 */
export function applyShareKind(kind: ShareKind, toolboxAvailable: boolean): void {
	document.querySelectorAll<HTMLElement>('.share-kind-btn').forEach((button) => {
		const selected = button.dataset.shareKind === kind;
		button.classList.toggle('active', selected);
		button.setAttribute('aria-selected', String(selected));
	});
	const scorePanel = document.getElementById('share-panel-score');
	const toolboxPanel = document.getElementById('share-panel-toolbox');
	if (scorePanel) { scorePanel.hidden = kind !== 'score'; }
	if (toolboxPanel) { toolboxPanel.hidden = kind !== 'toolbox'; }
	const nothingToShare = kind === 'toolbox' && !toolboxAvailable;
	document.querySelectorAll<HTMLButtonElement>('.share-actions .share-btn').forEach((button) => {
		button.disabled = nothingToShare;
	});
	document.querySelectorAll<HTMLElement>('.export-menu-item[data-score-only]').forEach((item) => {
		item.hidden = kind !== 'score';
	});
}
