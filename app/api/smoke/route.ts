import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { getAnthropicClient } from "@/lib/anthropic";
import { checkCostCeiling } from "@/lib/check-cost-ceiling";
import { logCost } from "@/lib/cost-log";
import { cacheGet, cacheSet, makeCacheKey } from "@/lib/kv-cache";
import { calculateCostUSD, DEFAULT_MODEL } from "@/lib/pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PROMPT_VERSION = "smoke@v1";
const SMOKE_INPUT = "Reply with exactly the word OK and nothing else.";

type SmokeResult = {
  ok: boolean;
  stage: string;
  detail?: string;
  cached?: boolean;
  costUSD?: number;
  monthSpendUSD?: number;
};

export async function GET(): Promise<NextResponse<SmokeResult>> {
  const ceiling = await checkCostCeiling().catch((err: unknown) => {
    return { ok: false, current: 0, limit: 0, _err: err };
  });
  if ("_err" in ceiling) {
    return NextResponse.json(
      { ok: false, stage: "ceiling-check", detail: String(ceiling._err) },
      { status: 500 },
    );
  }
  if (!ceiling.ok) {
    return NextResponse.json(
      {
        ok: false,
        stage: "ceiling-blocked",
        detail: `month spend $${ceiling.current.toFixed(4)} >= limit $${ceiling.limit}`,
        monthSpendUSD: ceiling.current,
      },
      { status: 429 },
    );
  }

  const cacheKey = makeCacheKey({
    endpoint: "/api/smoke",
    promptVersion: PROMPT_VERSION,
    input: SMOKE_INPUT,
  });

  let cached: { text: string } | null = null;
  try {
    cached = await cacheGet<{ text: string }>(cacheKey);
  } catch (err) {
    return NextResponse.json(
      { ok: false, stage: "cache-get", detail: String(err) },
      { status: 500 },
    );
  }
  if (cached) {
    return NextResponse.json({
      ok: true,
      stage: "cache-hit",
      cached: true,
      detail: cached.text,
      monthSpendUSD: ceiling.current,
    });
  }

  let client: ReturnType<typeof getAnthropicClient>;
  try {
    client = getAnthropicClient();
  } catch (err) {
    return NextResponse.json(
      { ok: false, stage: "client-init", detail: String(err) },
      { status: 500 },
    );
  }

  let resp: Awaited<ReturnType<typeof client.messages.create>>;
  try {
    resp = await client.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 16,
      messages: [{ role: "user", content: SMOKE_INPUT }],
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, stage: "anthropic-call", detail: String(err) },
      { status: 502 },
    );
  }

  const text =
    resp.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("")
      .trim() || "(empty)";

  const costUSD = calculateCostUSD(resp.model, resp.usage.input_tokens, resp.usage.output_tokens);

  try {
    await logCost({
      endpoint: "/api/smoke",
      model: resp.model,
      inputTokens: resp.usage.input_tokens,
      outputTokens: resp.usage.output_tokens,
      costUSD,
      promptVersion: PROMPT_VERSION,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, stage: "cost-log", detail: String(err), costUSD },
      { status: 500 },
    );
  }

  try {
    await cacheSet(cacheKey, { text });
  } catch (err) {
    return NextResponse.json(
      { ok: false, stage: "cache-set", detail: String(err), costUSD },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    stage: "complete",
    cached: false,
    detail: text,
    costUSD,
    monthSpendUSD: ceiling.current + costUSD,
  });
}
