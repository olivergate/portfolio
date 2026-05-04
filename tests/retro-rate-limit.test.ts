import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { RetroResponse } from "@/lib/retro-schemas";

// Phase 4 + ADR-0022: per-IP sliding window (10 / 1 hour) blocks the 11th
// request. The block returns 429 with stage="ratelimit-blocked" plus a
// canned-response payload (per ADR-0025) so the demo still shows output.

vi.mock("@/lib/anthropic", () => ({
  getAnthropicClient: () => ({
    messages: {
      create: vi.fn(async () => {
        throw new Error("anthropic should not be called when ratelimit-blocked");
      }),
    },
  }),
}));

vi.mock("@/lib/check-cost-ceiling", () => ({
  checkCostCeiling: async () => ({ ok: true, current: 0, limit: 30 }),
}));

vi.mock("@/lib/cost-log", () => ({
  logCost: async () => {},
}));

vi.mock("@/lib/kv-cache", () => ({
  makeCacheKey: () => "ratelimit-test",
  cacheGet: async () => null,
  cacheSet: async () => {},
}));

// Block all requests in this suite.
vi.mock("@/lib/ratelimit", () => ({
  getRetroLimiter: () => ({
    limit: async () => ({
      success: false,
      limit: 10,
      remaining: 0,
      reset: Date.now() + 3600_000,
    }),
  }),
  getClientIP: () => "1.2.3.4",
}));

beforeEach(() => {});
afterEach(() => {
  vi.clearAllMocks();
});

describe("retro route — rate limit (ADR-0022)", () => {
  test("returns 429 with ratelimit-blocked stage + canned fallback when limit hit", async () => {
    const { POST } = await import("@/app/api/retro/route");
    const req = new Request("http://test/api/retro", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        transcript:
          "[09:14] User: prod deploy failing. ECONNREFUSED.\n[09:24] User: ship and document.",
      }),
    });
    const resp = await POST(req);
    expect(resp.status).toBe(429);
    const json = (await resp.json()) as {
      ok: boolean;
      stage?: string;
      fallback?: { sampleId: string; retro: RetroResponse };
    };
    expect(json.ok).toBe(false);
    expect(json.stage).toBe("ratelimit-blocked");
    expect(json.fallback).toBeDefined();
    expect(json.fallback?.retro.wentWell.length).toBeGreaterThan(0);
    expect(json.fallback?.retro.learnings.length).toBeGreaterThan(0);
  });
});
