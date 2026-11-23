/**
 * Chart.js config for the stacked per-group estimated-cost bar chart, shared by the Chart view's
 * cost-by-provider, cost-by-editor and cost-by-model splits. Pure (no DOM, no Chart.js import),
 * so it is unit-testable; the caller casts the result to its Chart.js config type.
 */
import type { ChartDataset } from '../../../../src/types';

export type CostStackColors = { textColor: string; gridColor: string };

/** The parts of the shared base options this builder extends. */
export type CostStackBaseOptions = { plugins: { tooltip?: object } & Record<string, unknown> } & Record<string, unknown>;

type TooltipItem = { dataset: { label?: string }; parsed: { y: unknown } };

/** Tooltip line for one dataset: ` <label>: $<cost to 4 decimals>`. */
export function formatCostTooltipLabel(ctx: TooltipItem): string {
	return ` ${ctx.dataset.label}: $${Number(ctx.parsed.y).toFixed(4)}`;
}

/** Tooltip footer: the sum of every hovered dataset's cost; non-numeric values count as 0. */
export function formatCostTooltipFooter(items: TooltipItem[]): string {
	const total = items.reduce((sum: number, i) => sum + (Number(i.parsed.y) || 0), 0);
	return `Total: $${total.toFixed(4)}`;
}

/** Y-axis tick: a dollar amount to 2 decimals. */
export function formatCostTick(value: unknown): string {
	return `$${Number(value).toFixed(2)}`;
}

export function buildStackedCostViewConfig<B extends CostStackBaseOptions>(datasets: ChartDataset[], labels: string[], baseOptions: B, c: CostStackColors) {
	return {
		type: 'bar' as const,
		data: { labels, datasets },
		options: {
			...baseOptions,
			plugins: {
				...baseOptions.plugins,
				legend: { position: 'top' as const, labels: { color: c.textColor, font: { size: 11 } } },
				tooltip: {
					...baseOptions.plugins.tooltip,
					callbacks: {
						label: formatCostTooltipLabel,
						footer: formatCostTooltipFooter,
					}
				}
			},
			scales: {
				x: { stacked: true, grid: { color: c.gridColor }, ticks: { color: c.textColor, font: { size: 11 } } },
				y: { stacked: true, type: 'linear' as const, display: true, position: 'left' as const, grid: { color: c.gridColor }, ticks: { color: c.textColor, font: { size: 11 }, callback: formatCostTick }, title: { display: true, text: 'Estimated Cost (USD)', color: c.textColor, font: { size: 12, weight: 'bold' as const } } }
			}
		}
	};
}
