import type { ModelPricing, SessionUsageAnalysis } from '../types';
import { applyModelTierClassification } from '../usageAnalysis';

/**
 * Fills `analysis.modelSwitching` from the ordered list of per-request model ids
 * (unique models, request count, number of switches between consecutive requests)
 * and applies the model tier classification. Shared by the editor adapters whose
 * `analyzeUsage` collects a flat `models` list.
 */
export function applyModelSwitchingStats(
	analysis: SessionUsageAnalysis,
	models: string[],
	modelPricing: { [key: string]: ModelPricing }
): void {
	const uniqueModels = [...new Set(models)];
	analysis.modelSwitching.uniqueModels = uniqueModels;
	analysis.modelSwitching.modelCount = uniqueModels.length;
	analysis.modelSwitching.totalRequests = models.length;
	let switchCount = 0;
	for (let i = 1; i < models.length; i++) {
		if (models[i] !== models[i - 1]) { switchCount++; }
	}
	analysis.modelSwitching.switchCount = switchCount;
	applyModelTierClassification(modelPricing, uniqueModels, models, analysis);
}
