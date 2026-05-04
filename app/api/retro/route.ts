import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAnthropicClient } from "@/lib/anthropic";
import {
  CANNED_RETROS,
  CANNED_SAMPLE_IDS,
  type CannedSampleId,
  pickCannedRetro,
} from "@/lib/canned-retros";
import { checkCostCeiling } from "@/lib/check-cost-ceiling";
import { getProjects } from "@/lib/content";
import { logCost } from "@/lib/cost-log";
import { cacheGet, cacheSet, makeCacheKey } from "@/lib/kv-cache";
import { calculateCostUSD, DEFAULT_MODEL } from "@/lib/pricing";
import { getClientIP, getRetroLimiter } from "@/lib/ratelimit";
import {
  extractToolInput,
  RETRO_PROMPT_VERSION,
  RETRO_SYSTEM,
  RETRO_TOOL,
} from "@/lib/retro-prompts";
import { RetroResponse } from "@/lib/retro-schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_TRANSCRIPT_CHARS = 8000;
const MAX_OUTPUT_TOKENS = 2000;

const RequestSchema = z.object({
  transcript: z.string().min(20).max(MAX_TRANSCRIPT_CHARS),
});

type ErrorResponse = {
  ok: false;
  stage: string;
  detail?: string;
  /** Set on infra failures that fire AFTER the Anthropic call has been billed
   *  (cost-log, cache-set). Lets the caller correlate spend with failure. */
  costUSD?: number;
  fallback?: { sampleId: CannedSampleId; retro: RetroResponse };
};

type SuccessResponse = {
  ok: true;
  cached: boolean;
  costUSD?: number;
  retro: RetroResponse;
};

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

  const transcript = body.transcript.trim();

  // ─── Cache (free; return early on hit) ──────────────────────────────────
  const cacheKey = makeCacheKey({
    endpoint: "/api/retro",
    promptVersion: RETRO_PROMPT_VERSION,
    input: { transcript },
  });

  let cached: RetroResponse | null = null;
  try {
    cached = await cacheGet<RetroResponse>(cacheKey);
  } catch (err) {
    return NextResponse.json(
      { ok: false, stage: "cache-get", detail: String(err) },
      { status: 500 },
    );
  }
  if (cached) {
    return NextResponse.json({ ok: true, cached: true, retro: cached });
  }

  // ─── Rate limit (additive to ADR-0010, per ADR-0022) ────────────────────
  const ip = getClientIP(req);
  const limiter = getRetroLimiter();
  let rl: Awaited<ReturnType<typeof limiter.limit>>;
  try {
    rl = await limiter.limit(ip);
  } catch (err) {
    return NextResponse.json(
      { ok: false, stage: "ratelimit-check", detail: String(err) },
      { status: 500 },
    );
  }
  if (!rl.success) {
    return NextResponse.json(
      {
        ok: false,
        stage: "ratelimit-blocked",
        detail: `IP rate limit hit: ${rl.remaining}/${rl.limit} remaining`,
        fallback: pickFallback(transcript),
      },
      { status: 429 },
    );
  }

  // ─── Cost ceiling ────────────────────────────────────────────────────────
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
        fallback: pickFallback(transcript),
      },
      { status: 429 },
    );
  }

  // ─── Anthropic client ────────────────────────────────────────────────────
  // No fallback on client-init failure: usually means ANTHROPIC_API_KEY is
  // missing, and the operator wants the loud error, not a canned response.
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
    resp = await client.messages.create(
      {
        model: DEFAULT_MODEL,
        max_tokens: MAX_OUTPUT_TOKENS,
        system: RETRO_SYSTEM,
        tools: [RETRO_TOOL],
        tool_choice: { type: "tool", name: "submit_retro" },
        messages: [{ role: "user", content: transcript }],
      },
      { signal: req.signal },
    );
  } catch (err) {
    if (err instanceof Anthropic.APIUserAbortError || (err as Error)?.name === "AbortError") {
      return NextResponse.json(
        { ok: false, stage: "client-abort", detail: "client aborted before response" },
        { status: 504 },
      );
    }
    return NextResponse.json(
      {
        ok: false,
        stage: "anthropic-call",
        detail: String(err),
        fallback: pickFallback(transcript),
      },
      { status: 502 },
    );
  }

  // CRITICAL: cost-log fires before any downstream failure can swallow the
  // billed call. Same pattern as /api/jd-match and /api/jd-parse.
  const costUSD = calculateCostUSD(resp.model, resp.usage.input_tokens, resp.usage.output_tokens);
  try {
    await logCost({
      endpoint: "/api/retro",
      model: resp.model,
      inputTokens: resp.usage.input_tokens,
      outputTokens: resp.usage.output_tokens,
      costUSD,
      promptVersion: RETRO_PROMPT_VERSION,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, stage: "cost-log", detail: String(err), costUSD },
      { status: 500 },
    );
  }

  // ─── Tool extract + schema validate ──────────────────────────────────────
  let raw: unknown;
  try {
    raw = extractToolInput(resp, "submit_retro");
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        stage: "tool-extract",
        detail: String(err),
        fallback: pickFallback(transcript),
      },
      { status: 502 },
    );
  }

  const parsed = RetroResponse.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        stage: "schema-validate",
        detail: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
        fallback: pickFallback(transcript),
      },
      { status: 502 },
    );
  }

  try {
    await cacheSet(cacheKey, parsed.data);
  } catch (err) {
    return NextResponse.json(
      { ok: false, stage: "cache-set", detail: String(err), costUSD },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, cached: false, costUSD, retro: parsed.data });
}

/**
 * Pick a canned retro for a transcript on a fallback path. Reads the
 * shipped sample transcripts from content/projects.json so the matching
 * stays in sync if Oliver edits a sample. ADR-0025.
 */
function pickFallback(transcript: string): { sampleId: CannedSampleId; retro: RetroResponse } {
  // FeaturedProject.samples[].id is constrained to CANNED_SAMPLE_IDS by the
  // Zod schema (lib/retro-schemas.ts) so this map is exhaustive by construction.
  const samples = getProjects().featured.samples;
  const sampleMap = {} as Record<CannedSampleId, string>;
  for (const s of samples) {
    sampleMap[s.id] = s.transcript;
  }
  // Defensive default for ids that didn't ship in projects.json — Zod prevents
  // this at load time, but the explicit fallback documents intent.
  for (const id of CANNED_SAMPLE_IDS) {
    if (!(id in sampleMap)) sampleMap[id] = "";
  }
  const sampleId = pickCannedRetro(transcript, sampleMap);
  return { sampleId, retro: CANNED_RETROS[sampleId] };
}
