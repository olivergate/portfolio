import { describe, expect, test } from "vitest";
import { calculateCostUSD, PRICING, resolvePricing } from "@/lib/pricing";

describe("resolvePricing — model alias + dated suffix lookup", () => {
  test("exact alias match returns the entry", () => {
    expect(resolvePricing("claude-sonnet-4-6")).toBe(PRICING["claude-sonnet-4-6"]);
    expect(resolvePricing("claude-opus-4-7")).toBe(PRICING["claude-opus-4-7"]);
    expect(resolvePricing("claude-haiku-4-5")).toBe(PRICING["claude-haiku-4-5"]);
  });

  test("dated suffix matches alias by longest prefix (the bug this exists to lock down)", () => {
    expect(resolvePricing("claude-sonnet-4-6-20251201")).toBe(PRICING["claude-sonnet-4-6"]);
    expect(resolvePricing("claude-opus-4-7-20260115")).toBe(PRICING["claude-opus-4-7"]);
    expect(resolvePricing("claude-haiku-4-5-20251001")).toBe(PRICING["claude-haiku-4-5"]);
  });

  test("longest-prefix wins when multiple aliases could match", () => {
    expect(resolvePricing("claude-haiku-4-5")).toBe(PRICING["claude-haiku-4-5"]);
    expect(resolvePricing("claude-haiku-4-5-foo")).toBe(PRICING["claude-haiku-4-5"]);
  });

  test("unknown model returns undefined", () => {
    expect(resolvePricing("gpt-4")).toBeUndefined();
    expect(resolvePricing("claude-2")).toBeUndefined();
    expect(resolvePricing("")).toBeUndefined();
  });
});

describe("calculateCostUSD", () => {
  test("computes cost on exact alias", () => {
    const cost = calculateCostUSD("claude-sonnet-4-6", 1_000_000, 1_000_000);
    expect(cost).toBeCloseTo(3 + 15);
  });

  test("computes cost on dated model ID without throwing (cost-leakage fix)", () => {
    const cost = calculateCostUSD("claude-sonnet-4-6-20251201", 1_000_000, 1_000_000);
    expect(cost).toBeCloseTo(3 + 15);
  });

  test("throws on unknown model BEFORE billing happens", () => {
    expect(() => calculateCostUSD("gpt-4", 100, 100)).toThrow(/No pricing configured/);
  });

  test("zero tokens returns zero cost", () => {
    expect(calculateCostUSD("claude-sonnet-4-6", 0, 0)).toBe(0);
  });
});
