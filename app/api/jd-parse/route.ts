import "server-only";
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAnthropicClient } from "@/lib/anthropic";
import { checkCostCeiling } from "@/lib/check-cost-ceiling";
import { logCost } from "@/lib/cost-log";
import {
  extractToolInput,
  PARSER_PROMPT_VERSION,
  PARSER_SYSTEM,
  PARSER_TOOL,
} from "@/lib/jd-prompts";
import { ParsedRequirement, type ParseResponse } from "@/lib/jd-schemas";
import { cacheGet, cacheSet, makeCacheKey } from "@/lib/kv-cache";
import { calculateCostUSD, DEFAULT_MODEL } from "@/lib/pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_JD_CHARS = 10_000;
const MAX_OUTPUT_TOKENS = 1500;

const RequestSchema = z.object({
  jdText: z.string().min(20).max(MAX_JD_CHARS),
});

type ErrorResponse = { ok: false; stage: string; detail?: string };
type SuccessResponse = ParseResponse & { ok: true; cached: boolean; costUSD?: number };

export async function POST(req: Request): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  let body: z.infer<typeof RequestSchema>;
  try {
    body = RequestSchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { ok: false, stage: "validate-input", detail: String(err) },
      { status: 400 },
    );
  }

  const jdText = body.jdText.trim();
  const jdHash = createHash("sha256").update(jdText).digest("hex").slice(0, 32);

  const cacheKey = makeCacheKey({
    endpoint: "/api/jd-parse",
    promptVersion: PARSER_PROMPT_VERSION,
    input: { jdText },
  });

  let cached: ParseResponse | null = null;
  try {
    cached = await cacheGet<ParseResponse>(cacheKey);
  } catch (err) {
    return NextResponse.json(
      { ok: false, stage: "cache-get", detail: String(err) },
      { status: 500 },
    );
  }
  if (cached) {
    return NextResponse.json({ ok: true, cached: true, ...cached });
  }

  let ceiling: Awaited<ReturnType<typeof checkCostCeiling>>;
  try {
    ceiling = await checkCostCeiling();
  } catch (err) {
    return NextResponse.json(
      { ok: false, stage: "ceiling-check", detail: String(err) },
      { status: 500 },
    );
  }
  if (!ceiling.ok) {
    return NextResponse.json(
      {
        ok: false,
        stage: "ceiling-blocked",
        detail: `month spend $${ceiling.current.toFixed(4)} >= limit $${ceiling.limit}`,
      },
      { status: 429 },
    );
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
      max_tokens: MAX_OUTPUT_TOKENS,
      system: PARSER_SYSTEM,
      tools: [PARSER_TOOL],
      tool_choice: { type: "tool", name: "submit_requirements" },
      messages: [{ role: "user", content: jdText }],
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, stage: "anthropic-call", detail: String(err) },
      { status: 502 },
    );
  }

  let raw: { requirements: unknown };
  try {
    raw = extractToolInput<{ requirements: unknown }>(resp, "submit_requirements");
  } catch (err) {
    return NextResponse.json(
      { ok: false, stage: "tool-extract", detail: String(err) },
      { status: 502 },
    );
  }

  const reqsParsed = z.array(ParsedRequirement).safeParse(raw.requirements);
  if (!reqsParsed.success) {
    return NextResponse.json(
      {
        ok: false,
        stage: "schema-validate",
        detail: reqsParsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
      },
      { status: 502 },
    );
  }

  const costUSD = calculateCostUSD(resp.model, resp.usage.input_tokens, resp.usage.output_tokens);

  try {
    await logCost({
      endpoint: "/api/jd-parse",
      model: resp.model,
      inputTokens: resp.usage.input_tokens,
      outputTokens: resp.usage.output_tokens,
      costUSD,
      promptVersion: PARSER_PROMPT_VERSION,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, stage: "cost-log", detail: String(err) },
      { status: 500 },
    );
  }

  const payload: ParseResponse = { requirements: reqsParsed.data, jdHash };

  try {
    await cacheSet(cacheKey, payload);
  } catch (err) {
    return NextResponse.json(
      { ok: false, stage: "cache-set", detail: String(err) },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, cached: false, costUSD, ...payload });
}
