import { setHtml } from '../shared/domUtils';
import { localize } from '../shared/localization';
import { buildDarkFactorySectionHtml } from '../maturity/darkFactorySection';
import { buildAgenticMatrixHtml, sanitizeAgenticMatrix } from './agenticMatrixSection';
import type { AgenticMatrix, DarkFactoryReport } from '../../../../src/types';

type ReadinessMessage = { command: string; requestId?: unknown; report?: unknown; matrix?: unknown };

export class DarkFactoryTab {
	private report: DarkFactoryReport | undefined;
	private matrix: AgenticMatrix | null = null;
	private status: 'idle' | 'loading' | 'loaded' | 'error' = 'idle';
	private requestId = 0;
	private available = false;

	constructor(
		private readonly postMessage: (message: { command: 'loadReadiness'; requestId: number }) => void,
		private readonly trace: (stage: string, details: Record<string, unknown>) => void,
	) {}

	setAvailable(available: boolean): void {
		this.available = available;
	}

	button(activeTab: string): string {
		if (!this.available) { return ''; }
		return `<button class="tab-button ${activeTab === 'readiness' ? 'active' : ''}" data-tab="readiness"><span class="codicon codicon-shield"></span> ${localize('nav.btnReadiness')}</button>`;
	}

	panel(activeTab: string): string {
		if (!this.available) { return ''; }
		return `<div id="tab-panel-readiness" class="tab-panel"${activeTab !== 'readiness' ? ' style="display:none"' : ''}>
			<div class="section">
				<div class="section-title"><span class="codicon codicon-shield"></span><span>${localize('nav.btnReadiness')}</span></div>
				<button class="button secondary" id="btn-refresh-readiness">${localize('nav.btnRefresh')}</button>
				<div id="readiness-content"></div>
			</div>
		</div>`;
	}

	attach(): void {
		document.getElementById('btn-refresh-readiness')?.addEventListener('click', () => this.requestScan());
		this.render();
	}

	render(): void {
		const content = document.getElementById('readiness-content');
		if (!content) { return; }
		const html = this.status === 'loaded' && this.report
			? buildAgenticMatrixHtml(this.matrix) + buildDarkFactorySectionHtml(this.report)
			: this.status === 'error'
				? `<div class="df-error" role="alert">${localize('readiness.scanFailed')}</div>`
				: `<div class="df-empty" role="status">${localize('readiness.loading')}</div>`;
		setHtml(content, html);
	}

	startIfNeeded(): void {
		if (this.available && this.status === 'idle') { this.requestScan(); }
	}

	requestScan(): void {
		if (!this.available || this.status === 'loading') { return; }
		this.status = 'loading';
		this.render();
		this.postMessage({ command: 'loadReadiness', requestId: ++this.requestId });
	}

	invalidate(): void {
		this.status = 'idle';
		this.requestId++;
	}

	handleMessage(message: ReadinessMessage): boolean {
		if (message.command !== 'readinessLoaded' && message.command !== 'readinessScanFailed') { return false; }
		if (message.requestId !== this.requestId) { return true; }
		this.matrix = null;
		if (message.command === 'readinessScanFailed') {
			this.report = undefined;
			this.status = 'error';
		} else if (!message.report || typeof message.report !== 'object' || !Array.isArray((message.report as DarkFactoryReport).repos)) {
			this.trace('readinessLoaded.invalidReport', { hasReport: !!message.report });
			this.report = undefined;
			this.status = 'error';
		} else {
			this.report = message.report as DarkFactoryReport;
			// The matrix is optional: a malformed one is dropped, the readiness report still renders.
			this.matrix = sanitizeAgenticMatrix(message.matrix);
			this.status = 'loaded';
		}
		this.render();
		return true;
	}
}
