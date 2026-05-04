import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { RetroResponse } from "@/lib/retro-schemas";

// Phase 4 + ADR-0025: when the cost ceiling is hit, the route returns 429
// with stage="ceiling-blocked" plus a canned response keyed by transcript →
// sample id. The exact-match transcript ↔ sample mapping is the contract:
// pasting a known sample and tripping the ceiling shows that sample's
// canned retro, not a default.

vi.mock("@/lib/anthropic", () => ({
  getAnthropicClient: () => ({
    messages: {
      create: vi.fn(async () => {
        throw new Error("anthropic should not be called when ceiling-blocked");
      }),
    },
  }),
}));

// Cost ceiling blocks every request.
vi.mock("@/lib/check-cost-ceiling", () => ({
  checkCostCeiling: async () => ({ ok: false, current: 31, limit: 30 }),
}));

vi.mock("@/lib/cost-log", () => ({
  logCost: async () => {},
}));

vi.mock("@/lib/kv-cache", () => ({
  makeCacheKey: () => "fallback-test",
  cacheGet: async () => null,
  cacheSet: async () => {},
}));

vi.mock("@/lib/ratelimit", () => ({
  getRetroLimiter: () => ({
    limit: async () => ({
      success: true,
      limit: 10,
      remaining: 9,
      reset: Date.now() + 3600_000,
    }),
  }),
  getClientIP: () => "127.0.0.1",
}));

beforeEach(() => {});
afterEach(() => {
  vi.clearAllMocks();
});

describe("retro route — graceful fallback (ADR-0025)", () => {
  test("ceiling-blocked returns 429 with canned response", async () => {
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
    expect(json.stage).toBe("ceiling-blocked");
    expect(json.fallback).toBeDefined();
    // Default fallback is "refactor" per pickCannedRetro when transcript
    // doesn't match a sample verbatim — confirm it returns one of the three
    // canned ids.
    expect(["refactor", "debug", "feature"]).toContain(json.fallback?.sampleId);
  });

  test("matches a verbatim sample transcript to its keyed canned retro", async () => {
    const { POST } = await import("@/app/api/retro/route");
    const { getProjects } = await import("@/lib/content");
    const debugSample = getProjects().featured.samples.find((s) => s.id === "debug");
    expect(debugSample).toBeDefined();
    const req = new Request("http://test/api/retro", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ transcript: debugSample?.transcript ?? "" }),
    });
    const resp = await POST(req);
    expect(resp.status).toBe(429);
    const json = (await resp.json()) as {
      ok: boolean;
      stage?: string;
      fallback?: { sampleId: string; retro: RetroResponse };
    };
    expect(json.fallback?.sampleId).toBe("debug");
  });
});
