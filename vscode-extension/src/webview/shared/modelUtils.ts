import { getWindowData } from './dataLoader';

type PricingEntry = { displayNames?: string[] };

// Build display name map from pricing JSON injected by the extension host as window.__MODEL_PRICING__.
// This is the single source of truth so it stays in sync with the nightly JSON refresh.
const _pricingData = getWindowData<{ pricing: Record<string, PricingEntry> }>('__MODEL_PRICING__');
const _modelNames: Record<string, string> = {};
for (const [modelId, pricing] of Object.entries((_pricingData?.pricing ?? {}) as Record<string, PricingEntry>)) {
    if (pricing.displayNames && pricing.displayNames.length > 0) {
        _modelNames[modelId] = pricing.displayNames[0];
    }
}

/**
 * Returns a human-friendly display name for a given model identifier.
 * If the model ID is not in the pricing JSON, it falls back to URI-decoding
 * the raw ID (e.g. unify-chat-provider names contain %20-encoded segments).
 */
export function getModelDisplayName(model: string): string {
    if (_modelNames[model]) { return _modelNames[model]; }
    try {
        return decodeURIComponent(model);
    } catch {
        return model;
    }
}