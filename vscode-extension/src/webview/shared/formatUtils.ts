// @ts-ignore
import tokenEstimatorsJson from '../../tokenEstimators.json';
import type { TokenEstimator } from '../../types';

const tokenEstimators: Record<string, TokenEstimator> = tokenEstimatorsJson.estimators;
let currentLocale: string | undefined;
let compactNumbersEnabled = true;

/**
 * Sets an optional locale used by format helpers.
 * When undefined, runtime default locale is used.
 */
export function setFormatLocale(locale?: string): void {
	currentLocale = locale;
}

/**
 * Sets whether compact number formatting (K/M suffixes) is enabled.
 * When disabled, formatCompact falls back to formatNumber.
 */
export function setCompactNumbers(enabled: boolean): void {
	compactNumbersEnabled = enabled;
}

/**
 * Returns an icon for a given editor name.
 */
export function getEditorIcon(editor: string): string {
	const icons: Record<string, string> = {
		'VS Code': '💙',
		'VS Code Insiders': '💚',
		'VS Code Exploration': '🧪',
		'VS Code Server': '☁️',
		'VS Code Server (Insiders)': '☁️',
		'VSCodium': '🔷',
		'Cursor': '⚡',
		'Copilot CLI': '🤖',
		'OpenCode': '🟢',
            'Visual Studio': '🪟',
		'Claude Code': '🟠',
		'Claude Desktop Cowork': '🟠',
		'Mistral Vibe': '🔥',
		'Gemini CLI': '💎',
		'Unknown': '❓'
	};
	return icons[editor] || '📝';
}

/**
 * Returns the approximate characters per token for a given model.
 */
export function getCharsPerToken(model: string): number {
	const ratio = tokenEstimators[model] ?? 0.25;
	return 1 / ratio;
}

/**
 * Formats a number to a fixed number of decimal places.
 */
export function formatFixed(value: number, digits: number): string {
	return new Intl.NumberFormat(currentLocale, {
		minimumFractionDigits: digits,
		maximumFractionDigits: digits
	}).format(value);
}

/**
 * Formats a number as a percentage with one decimal place.
 */
export function formatPercent(value: number, digits = 1): string {
	return `${formatFixed(value, digits)}%`;
}

/**
 * Formats a number with locale-specific thousand separators.
 */
export function formatNumber(value: number): string {
	return value.toLocaleString(currentLocale);
}

/**
 * Formats a number with K/M suffixes for compact display (e.g. 1,500 → 1.5K, 1,200,000 → 1.2M).
 * Numbers below 1,000 are shown without a suffix.
 * Falls back to formatNumber when compact numbers are disabled via setCompactNumbers(false).
 */
export function formatCompact(value: number): string {
	if (!compactNumbersEnabled) {
		return formatNumber(value);
	}
	return new Intl.NumberFormat(currentLocale, {
		notation: 'compact',
		maximumFractionDigits: 1
	}).format(value);
}

/**
 * Formats a number as a USD cost with 2 decimal places.
 */
export function formatCost(value: number): string {
	return new Intl.NumberFormat(currentLocale, {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(value);
}

/**
 * Escapes HTML special characters in a string to prevent XSS.
 */
export function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

/**
 * Formats a byte count as a human-readable file size string.
 */
export function formatFileSize(bytes: number): string {
	const numericBytes = Number(bytes);
	if (!Number.isFinite(numericBytes) || numericBytes < 0) {
		return 'N/A';
	}
	if (numericBytes < 1024) {
		return `${numericBytes} B`;
	}
	if (numericBytes < 1024 * 1024) {
		return `${(numericBytes / 1024).toFixed(1)} KB`;
	}
	return `${(numericBytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Returns a human-readable "time since" string for an ISO timestamp.
 */
export function getTimeSince(isoString: string): string {
	try {
		const now = Date.now();
		const then = new Date(isoString).getTime();
		const diffMs = now - then;

		if (diffMs < 0) {
			return 'Just now';
		}

		const seconds = Math.floor(diffMs / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);

		if (days > 0) {
			return `${days} day${days !== 1 ? 's' : ''} ago`;
		}
		if (hours > 0) {
			return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
		}
		if (minutes > 0) {
			return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
		}
		return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
	} catch {
		return 'Unknown';
	}
}

/**
 * Converts markdown links to HTML anchor tags while escaping other HTML.
 * Converts [text](url) to <a href="url" target="_blank" rel="noopener noreferrer">text</a>
 */
export function markdownToHtml(text: string): string {
	let escaped = escapeHtml(text);
	escaped = escaped.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
	return escaped;
}

/** Maps stage number (1–4) to its display label. */
export const STAGE_LABELS: Record<number, string> = {
	1: 'Stage 1: AI Skeptic',
	2: 'Stage 2: AI Explorer',
	3: 'Stage 3: AI Collaborator',
	4: 'Stage 4: AI Strategist'
};

/** Maps stage number (1–4) to a one-line description of that stage. */
export const STAGE_DESCRIPTIONS: Record<number, string> = {
	1: 'Rarely uses AI tools or uses only basic features',
	2: 'Exploring AI capabilities with occasional use',
	3: 'Regular, purposeful use across multiple features',
	4: 'Strategic, advanced use leveraging the full AI ecosystem'
};
