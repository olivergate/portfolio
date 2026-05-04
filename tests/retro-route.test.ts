import type Anthropic from "@anthropic-ai/sdk";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { RetroResponse } from "@/lib/retro-schemas";

// Mock pattern follows tests/jd-matcher-honesty.test.ts.

let mockMessageCreate: (() => Promise<Anthropic.Message>) | null = null;
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

vi.mock("@/lib/check-cost-ceiling", () => ({
  checkCostCeiling: async () => ({ ok: true, current: 0, limit: 30 }),
}));

vi.mock("@/lib/cost-log", () => ({
  logCost: async () => {},
}));

const cacheStore = new Map<string, unknown>();
vi.mock("@/lib/kv-cache", () => ({
  makeCacheKey: (parts: { endpoint: string; promptVersion: string; input: unknown }) =>
    `cache:${parts.endpoint}:${parts.promptVersion}:${JSON.stringify(parts.input).length}`,
  cacheGet: async (k: string) => cacheStore.get(k) ?? null,
  cacheSet: async (k: string, v: unknown) => {
    cacheStore.set(k, v);
  },
}));

// Default ratelimit: always allow.
let ratelimitAllow = true;
vi.mock("@/lib/ratelimit", () => ({
  getRetroLimiter: () => ({
    limit: async () => ({
      success: ratelimitAllow,
      limit: 10,
      remaining: ratelimitAllow ? 9 : 0,
      reset: Date.now() + 3600_000,
    }),
  }),
  getClientIP: () => "127.0.0.1",
}));

beforeEach(() => {
  cacheStore.clear();
  mockMessageCreate = null;
  anthropicCallCount = 0;
  ratelimitAllow = true;
});

afterEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

function buildRetroResponse(input: RetroResponse): Anthropic.Message {
  return {
    id: "msg_test",
    type: "message",
    role: "assistant",
    model: "claude-sonnet-4-6",
    content: [
      {
        type: "tool_use",
        id: "toolu_test",
        name: "submit_retro",
        input,
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

const VALID_RETRO: RetroResponse = {
  wentWell: ["Triaged the diff before the logs."],
  slowed: ["I didn't write the env-var contract test first."],
  learnings: [
    {
      title: "Env-var renames need a sweep",
      body: "PR diffs miss string references. Grep before merge.",
    },
  ],
  additions: [],
};

const TRANSCRIPT_BODY = JSON.stringify({
  transcript:
    "[09:14] User: prod deploy failing. CloudWatch is showing ECONNREFUSED from the worker after rollout.\n[09:21] Claude: env rename was missed in workers/jobs/index.ts:14.\n[09:24] User: ship and document.",
});

async function callRetro(body: string = TRANSCRIPT_BODY) {
  const { POST } = await import("@/app/api/retro/route");
  const req = new Request("http://test/api/retro", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
  return await POST(req);
}

describe("retro route — input validation", () => {
  test("returns 400 when transcript is missing", async () => {
    const resp = await callRetro(JSON.stringify({}));
    expect(resp.status).toBe(400);
    const json = (await resp.json()) as { ok: boolean; stage?: string };
    expect(json.ok).toBe(false);
    expect(json.stage).toBe("validate-input");
  });

  test("returns 400 when transcript is too short", async () => {
    const resp = await callRetro(JSON.stringify({ transcript: "too short" }));
    expect(resp.status).toBe(400);
  });

  test("returns 400 when transcript exceeds 8000 chars", async () => {
    const resp = await callRetro(JSON.stringify({ transcript: "x".repeat(8001) }));
    expect(resp.status).toBe(400);
  });
});

describe("retro route — happy path + caching", () => {
  test("accepts a valid response and caches it", async () => {
    mockMessageCreate = async () => buildRetroResponse(VALID_RETRO);
    const resp = await callRetro();
    expect(resp.status).toBe(200);
    const json = (await resp.json()) as { ok: boolean; cached: boolean; retro: RetroResponse };
    expect(json.ok).toBe(true);
    expect(json.cached).toBe(false);
    expect(json.retro.wentWell).toHaveLength(1);
    expect(anthropicCallCount).toBe(1);

    // Second call same input → cache hit; no second Anthropic call.
    const resp2 = await callRetro();
    const json2 = (await resp2.json()) as { ok: boolean; cached: boolean };
    expect(json2.cached).toBe(true);
    expect(anthropicCallCount).toBe(1);
  });
});

describe("retro route — schema validation", () => {
  test("rejects malformed retro from the model", async () => {
    mockMessageCreate = async () =>
      buildRetroResponse({
        // missing learnings field — invalid per schema
        wentWell: ["x"],
        slowed: ["y"],
        // @ts-expect-error testing schema reject
        learnings: undefined,
        additions: [],
      });
    const resp = await callRetro();
    expect(resp.status).toBe(502);
    const json = (await resp.json()) as {
      ok: boolean;
      stage?: string;
      fallback?: { sampleId: string; retro: RetroResponse };
    };
    expect(json.ok).toBe(false);
    expect(json.stage).toBe("schema-validate");
    expect(json.fallback?.retro).toBeDefined();
  });
});

describe("retro route — tool-extract failure", () => {
  test("returns 502 with stage='tool-extract' + fallback when model returns text instead of tool_use", async () => {
    mockMessageCreate = async () =>
      ({
        id: "msg_test",
        type: "message",
        role: "assistant",
        model: "claude-sonnet-4-6",
        content: [{ type: "text", text: "I refuse to use the tool." }],
        stop_reason: "end_turn",
        stop_sequence: null,
        usage: {
          input_tokens: 100,
          output_tokens: 50,
          cache_creation_input_tokens: 0,
          cache_read_input_tokens: 0,
          server_tool_use: null,
          service_tier: null,
        },
      }) as unknown as Anthropic.Message;
    const resp = await callRetro();
    expect(resp.status).toBe(502);
    const json = (await resp.json()) as {
      ok: boolean;
      stage?: string;
      fallback?: { sampleId: string; retro: RetroResponse };
    };
    expect(json.ok).toBe(false);
    expect(json.stage).toBe("tool-extract");
    expect(json.fallback?.retro).toBeDefined();
  });
});

describe("retro route — client abort", () => {
  test("returns 504 with stage='client-abort' when fetch is aborted before tokens land", async () => {
    // Anthropic SDK throws APIUserAbortError on signal abort; route must catch
    // and return 504 without cost-logging (no usage to log).
    const { default: AnthropicClass } = await import("@anthropic-ai/sdk");
    mockMessageCreate = async () => {
      throw new AnthropicClass.APIUserAbortError();
    };
    const resp = await callRetro();
    expect(resp.status).toBe(504);
    const json = (await resp.json()) as { ok: boolean; stage?: string };
    expect(json.ok).toBe(false);
    expect(json.stage).toBe("client-abort");
  });
});

describe("retro route — cost-log failure", () => {
  test("returns 500 with stage='cost-log' + costUSD when logCost throws AFTER paid Anthropic call", async () => {
    // The cost-log invariant: if logCost fails, we still want the costUSD
    // surfaced so the operator can correlate the billed call with the failure.
    vi.resetModules();
    vi.doMock("@/lib/anthropic", () => ({
      getAnthropicClient: () => ({
        messages: {
          create: vi.fn(async () => buildRetroResponse(VALID_RETRO)),
        },
      }),
    }));
    vi.doMock("@/lib/check-cost-ceiling", () => ({
      checkCostCeiling: async () => ({ ok: true, current: 0, limit: 30 }),
    }));
    vi.doMock("@/lib/cost-log", () => ({
      logCost: async () => {
        throw new Error("redis down");
      },
    }));
    vi.doMock("@/lib/kv-cache", () => ({
      makeCacheKey: () => "cost-log-test",
      cacheGet: async () => null,
      cacheSet: async () => {},
    }));
    vi.doMock("@/lib/ratelimit", () => ({
      getRetroLimiter: () => ({
        limit: async () => ({ success: true, limit: 10, remaining: 9, reset: 0 }),
      }),
      getClientIP: () => "127.0.0.1",
    }));

    const { POST } = await import("@/app/api/retro/route");
    const req = new Request("http://test/api/retro", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: TRANSCRIPT_BODY,
    });
    const resp = await POST(req);
    expect(resp.status).toBe(500);
    const json = (await resp.json()) as { ok: boolean; stage?: string; costUSD?: number };
    expect(json.ok).toBe(false);
    expect(json.stage).toBe("cost-log");
    expect(json.costUSD).toBeGreaterThan(0);
  });
});
