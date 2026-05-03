import "server-only";

/**
 * Anthropic pricing in USD per million tokens.
 * Update via ADR when pricing changes.
 *
 * Source: https://www.anthropic.com/pricing — current as of 2026-05-03.
 *
 * Default model for Phase 3+ JD matcher: claude-sonnet-4-6 (cheap + fast).
 * The /tone manifesto in Phase 2 doesn't make API calls.
 */

export type PricingEntry = {
  inputPerMillion: number;
  outputPerMillion: number;
  cachedInputPerMillion?: number;
  cacheWritePerMillion?: number;
};

export const PRICING: Record<string, PricingEntry> = {
  "claude-opus-4-7": {
    inputPerMillion: 15,
    outputPerMillion: 75,
    cachedInputPerMillion: 1.5,
    cacheWritePerMillion: 18.75,
  },
  "claude-sonnet-4-6": {
    inputPerMillion: 3,
    outputPerMillion: 15,
    cachedInputPerMillion: 0.3,
    cacheWritePerMillion: 3.75,
  },
  "claude-haiku-4-5": {
    inputPerMillion: 1,
    outputPerMillion: 5,
    cachedInputPerMillion: 0.1,
    cacheWritePerMillion: 1.25,
  },
};

export const DEFAULT_MODEL = "claude-sonnet-4-6";

export function calculateCostUSD(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = PRICING[model];
  if (!pricing) {
    throw new Error(`No pricing configured for model "${model}". Update lib/pricing.ts.`);
  }
  const input = (inputTokens / 1_000_000) * pricing.inputPerMillion;
  const output = (outputTokens / 1_000_000) * pricing.outputPerMillion;
  return input + output;
}
