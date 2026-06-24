import type Anthropic from "@anthropic-ai/sdk";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// ─── Stub Anthropic SDK ────────────────────────────────────────────────────
// Tests drive the matcher route by injecting different model responses to
// verify the server-side honesty validator (ADR-0016) and the schema layer.

let mockMessageCreate: (() => Promise<Anthropic.Message>) | null = null;
// F3.1: track real Anthropic call count so we can assert cache-hit avoids
// a second hit. Incremented inside the SDK stub below; reset in beforeEach.
let anthropicCallCount = 0;

vi.mock("@/lib/anthropic", () => ({
  getAnthropicClient: () => ({
    messages: {
      create: vi.fn(async () => {
        if (!mockMessageCreate) throw new Error("mockMessageCreate not set");
        anthropicCallCount += 1;
        return mockMessageCreate();
      }),
    },
  }),
}));

// Stub the cost-ceiling check + cost log so we don't hit Redis.
// F3.2: this is the *default* mock — a per-test override lives below using
// vi.doMock to exercise the ceiling-blocked (429) path.
vi.mock("@/lib/check-cost-ceiling", () => ({
  checkCostCeiling: async () => ({ ok: true, current: 0, limit: 30 }),
}));

vi.mock("@/lib/cost-log", () => ({
  logCost: async () => {},
}));

// Stub KV cache so each test sees a fresh route.
const cacheStore = new Map<string, unknown>();
vi.mock("@/lib/kv-cache", () => ({
  makeCacheKey: (parts: { endpoint: string; promptVersion: string; input: unknown }) =>
    `cache:${parts.endpoint}:${parts.promptVersion}:${JSON.stringify(parts.input).length}`,
  cacheGet: async (k: string) => cacheStore.get(k) ?? null,
  cacheSet: async (k: string, v: unknown) => {
    cacheStore.set(k, v);
  },
}));

beforeEach(() => {
  cacheStore.clear();
  mockMessageCreate = null;
  anthropicCallCount = 0;
});

afterEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

// ─── Helpers ───────────────────────────────────────────────────────────────

function buildMatcherResponse(matches: unknown): Anthropic.Message {
  return {
    id: "msg_test",
    type: "message",
    role: "assistant",
    model: "claude-sonnet-4-6",
    content: [
      {
        type: "tool_use",
        id: "toolu_test",
        name: "submit_matches",
        input: { matches },
      } as Anthropic.ToolUseBlock,
    ],
    stop_reason: "tool_use",
    stop_sequence: null,
    usage: {
      input_tokens: 100,
      output_tokens: 50,
      cache_creation_input_tokens: 0,
      cache_read_input_tokens: 0,
      server_tool_use: null,
      service_tier: null,
    },
  } as unknown as Anthropic.Message;
}

async function callMatcher() {
  // Import lazily so vi.mock has installed by the time the route loads.
  // One call now scores all three readings (ADR-0042) — no stretchLevel input.
  const { POST } = await import("@/app/api/jd-match/route");
  const req = new Request("http://test/api/jd-match", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jdHash: "abc123",
      requirements: [
        { id: "r1", text: "React + TypeScript", category: "hard", weight: 1 },
        { id: "r2", text: "MCP servers", category: "nice", weight: 0.3 },
      ],
    }),
  });
  return await POST(req);
}

// ─── Tests ─────────────────────────────────────────────────────────────────

describe("matcher route — schema validation", () => {
  test("returns 400 when requirements is empty", async () => {
    const { POST } = await import("@/app/api/jd-match/route");
    const req = new Request("http://test/api/jd-match", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jdHash: "x", requirements: [] }),
    });
    const resp = await POST(req);
    expect(resp.status).toBe(400);
  });

  test("rejects malformed match input from the model", async () => {
    mockMessageCreate = async () =>
      buildMatcherResponse([
        // missing reasoning + invalid status
        { requirementId: "r1", baseStatus: "yes", cite: [] },
        { requirementId: "r2", baseStatus: "miss", cite: [], reasoning: "n/a" },
      ]);
    const resp = await callMatcher();
    expect(resp.status).toBe(502);
    const json = (await resp.json()) as { ok: boolean; stage?: string };
    expect(json.ok).toBe(false);
    expect(json.stage).toBe("schema-validate");
  });
});

describe("matcher route — honesty validator (ADR-0016)", () => {
  test("rejects a Hit with empty cite", async () => {
    mockMessageCreate = async () =>
      buildMatcherResponse([
        { requirementId: "r1", baseStatus: "hit", cite: [], reasoning: "I just feel it." },
        {
          requirementId: "r2",
          baseStatus: "miss",
          cite: [],
          reasoning: "n/a",
          gapFraming: "honest.",
        },
      ]);
    const resp = await callMatcher();
    expect(resp.status).toBe(502);
    const json = (await resp.json()) as { ok: boolean; stage?: string; detail?: string };
    expect(json.ok).toBe(false);
    expect(json.stage).toBe("honesty-validate");
    expect(json.detail).toContain("Hit without cite");
  });

  test("rejects a Miss without gapFraming", async () => {
    mockMessageCreate = async () =>
      buildMatcherResponse([
        {
          requirementId: "r1",
          baseStatus: "hit",
          cite: ["role:opensc-sole-frontend"],
          reasoning: "yes.",
        },
        { requirementId: "r2", baseStatus: "miss", cite: [], reasoning: "no MCP." },
      ]);
    const resp = await callMatcher();
    expect(resp.status).toBe(502);
    const json = (await resp.json()) as { ok: boolean; stage?: string; detail?: string };
    expect(json.ok).toBe(false);
    expect(json.stage).toBe("honesty-validate");
    expect(json.detail).toContain("Miss without gapFraming");
  });

  test("rejects a Hit citing a non-existent role bullet", async () => {
    mockMessageCreate = async () =>
      buildMatcherResponse([
        {
          requirementId: "r1",
          baseStatus: "hit",
          cite: ["role:totally-fake-bullet"],
          reasoning: "made up.",
        },
        {
          requirementId: "r2",
          baseStatus: "miss",
          cite: [],
          reasoning: "n/a",
          gapFraming: "honest.",
        },
      ]);
    const resp = await callMatcher();
    expect(resp.status).toBe(502);
    const json = (await resp.json()) as { ok: boolean; stage?: string; detail?: string };
    expect(json.ok).toBe(false);
    expect(json.stage).toBe("honesty-validate");
    expect(json.detail).toContain("unknown role bullet cite");
  });

  test("rejects a missing match for a requirement", async () => {
    mockMessageCreate = async () =>
      buildMatcherResponse([
        // r2 omitted
        {
          requirementId: "r1",
          baseStatus: "hit",
          cite: ["role:opensc-sole-frontend"],
          reasoning: "yes.",
        },
      ]);
    const resp = await callMatcher();
    expect(resp.status).toBe(502);
    const json = (await resp.json()) as { ok: boolean; stage?: string; detail?: string };
    expect(json.ok).toBe(false);
    expect(json.stage).toBe("honesty-validate");
    expect(json.detail).toContain("missing match");
  });

  test("accepts a valid response and caches it", async () => {
    mockMessageCreate = async () =>
      buildMatcherResponse([
        {
          requirementId: "r1",
          baseStatus: "hit",
          cite: ["role:opensc-sole-frontend"],
          reasoning: "Sole frontend on the OpenSC dashboard.",
        },
        {
          requirementId: "r2",
          baseStatus: "miss",
          cite: [],
          reasoning: "no MCP work.",
          gapFraming: "Have read the spec, haven't built one.",
        },
      ]);
    const resp = await callMatcher();
    expect(resp.status).toBe(200);
    const json = (await resp.json()) as { ok: boolean; matches: unknown[]; cached: boolean };
    expect(json.ok).toBe(true);
    expect(json.cached).toBe(false);
    expect(json.matches).toHaveLength(2);
    expect(anthropicCallCount).toBe(1);

    // Second call same args → cache hit.
    const resp2 = await callMatcher();
    const json2 = (await resp2.json()) as { ok: boolean; cached: boolean };
    expect(json2.cached).toBe(true);
    // F3.1: cache hit must NOT recall Anthropic. A regression where the route
    // re-hits the API on every request would otherwise pass the cached:true
    // check (because the route still sets cached=true for stale-on-error
    // paths). Lock the call count.
    expect(anthropicCallCount).toBe(1);
  });

  test("rejects a Hit citing a non-existent project (H2 fix mirrors role)", async () => {
    // F3.3: project: cites must be validated like role: cites. We already
    // test the role-bullet rejection above; mirror it for unknown projects.
    mockMessageCreate = async () =>
      buildMatcherResponse([
        {
          requirementId: "r1",
          baseStatus: "hit",
          cite: ["project:totally-fake-project"],
          reasoning: "made up project.",
        },
        {
          requirementId: "r2",
          baseStatus: "miss",
          cite: [],
          reasoning: "n/a",
          gapFraming: "honest.",
        },
      ]);
    const resp = await callMatcher();
    expect(resp.status).toBe(502);
    const json = (await resp.json()) as { ok: boolean; stage?: string; detail?: string };
    expect(json.ok).toBe(false);
    expect(json.stage).toBe("honesty-validate");
    expect(json.detail).toContain("unknown project cite");
  });

  test("accepts project-prefixed cite for Hits (H2 fix verification)", async () => {
    mockMessageCreate = async () =>
      buildMatcherResponse([
        {
          requirementId: "r1",
          baseStatus: "hit",
          cite: ["project:blob-life"],
          reasoning: "Cross-platform mobile habit tracker — BlobLife is in active development.",
        },
        {
          requirementId: "r2",
          baseStatus: "miss",
          cite: [],
          reasoning: "no MCP.",
          gapFraming: "Read the spec, haven't built one.",
        },
      ]);
    const resp = await callMatcher();
    expect(resp.status).toBe(200);
    const json = (await resp.json()) as { ok: boolean };
    expect(json.ok).toBe(true);
  });
});

describe("matcher route — multi-level honesty (ADR-0042)", () => {
  test("rejects a base Miss that gains a non-Miss override (can't slide out of a gap)", async () => {
    mockMessageCreate = async () =>
      buildMatcherResponse([
        {
          requirementId: "r1",
          baseStatus: "hit",
          cite: ["role:opensc-sole-frontend"],
          reasoning: "yes.",
        },
        // r2 is a Miss at balanced but illegally promotes to Hit at generous.
        {
          requirementId: "r2",
          baseStatus: "miss",
          generousStatus: "hit",
          cite: ["role:opensc-sole-frontend"],
          reasoning: "slid out of a gap.",
          gapFraming: "honest.",
        },
      ]);
    const resp = await callMatcher();
    expect(resp.status).toBe(502);
    const json = (await resp.json()) as { ok: boolean; stage?: string; detail?: string };
    expect(json.ok).toBe(false);
    expect(json.stage).toBe("honesty-validate");
    expect(json.detail).toContain("Miss not consistent across readings");
  });

  test("rejects a chip that is a Hit only at generous but carries no cite", async () => {
    mockMessageCreate = async () =>
      buildMatcherResponse([
        // Stretch at balanced, Hit at generous, but empty cite — a Hit at any
        // reading must carry evidence (cite is shared across readings).
        {
          requirementId: "r1",
          baseStatus: "stretch",
          generousStatus: "hit",
          cite: [],
          reasoning: "borderline.",
        },
        {
          requirementId: "r2",
          baseStatus: "miss",
          cite: [],
          reasoning: "n/a",
          gapFraming: "honest.",
        },
      ]);
    const resp = await callMatcher();
    expect(resp.status).toBe(502);
    const json = (await resp.json()) as { ok: boolean; stage?: string; detail?: string };
    expect(json.ok).toBe(false);
    expect(json.stage).toBe("honesty-validate");
    expect(json.detail).toContain("Hit without cite");
  });

  test("accepts a valid multi-level match (Stretch at balanced, Hit at generous)", async () => {
    mockMessageCreate = async () =>
      buildMatcherResponse([
        {
          requirementId: "r1",
          baseStatus: "stretch",
          generousStatus: "hit",
          cite: ["role:opensc-sole-frontend"],
          reasoning: "adjacent; a generous reading credits it directly.",
        },
        {
          requirementId: "r2",
          baseStatus: "miss",
          cite: [],
          reasoning: "no MCP.",
          gapFraming: "honest.",
        },
      ]);
    const resp = await callMatcher();
    expect(resp.status).toBe(200);
    const json = (await resp.json()) as { ok: boolean; matches: unknown[] };
    expect(json.ok).toBe(true);
    expect(json.matches).toHaveLength(2);
  });
});

describe("matcher route — cost ceiling (ADR-0010)", () => {
  // F3.2: this suite uses vi.doMock + vi.resetModules to override the
  // ceiling check per-test (the file-level vi.mock is hoisted and locks the
  // default to ok:true). Each test re-mocks the module and dynamically imports
  // the route AFTER the override is registered.
  test("returns 429 with stage='ceiling-blocked' when over budget; never calls Anthropic", async () => {
    vi.resetModules();
    vi.doMock("@/lib/check-cost-ceiling", () => ({
      checkCostCeiling: async () => ({ ok: false, current: 31, limit: 30 }),
    }));
    // Re-register the SDK + cost + cache stubs against the *new* module graph
    // produced by resetModules — vi.mock is hoisted only for the first import.
    vi.doMock("@/lib/anthropic", () => ({
      getAnthropicClient: () => ({
        messages: {
          create: vi.fn(async () => {
            anthropicCallCount += 1;
            return buildMatcherResponse([]);
          }),
        },
      }),
    }));
    vi.doMock("@/lib/cost-log", () => ({ logCost: async () => {} }));
    vi.doMock("@/lib/kv-cache", () => ({
      makeCacheKey: () => "ceiling-test",
      cacheGet: async () => null,
      cacheSet: async () => {},
    }));

    const { POST } = await import("@/app/api/jd-match/route");
    const req = new Request("http://test/api/jd-match", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jdHash: "abc",
        requirements: [{ id: "r1", text: "X", category: "hard", weight: 1 }],
      }),
    });
    const resp = await POST(req);
    expect(resp.status).toBe(429);
    const json = (await resp.json()) as { ok: boolean; stage?: string };
    expect(json.ok).toBe(false);
    expect(json.stage).toBe("ceiling-blocked");
    expect(anthropicCallCount).toBe(0);
  });
});
