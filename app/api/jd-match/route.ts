import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAnthropicClient } from "@/lib/anthropic";
import { checkCostCeiling } from "@/lib/check-cost-ceiling";
import { getCV, getProjects } from "@/lib/content";
import { logCost } from "@/lib/cost-log";
import { computeCVHash, formatCVForPrompt } from "@/lib/cv-evidence";
import {
  extractToolInput,
  MATCHER_PROMPT_VERSION,
  MATCHER_SYSTEM,
  MATCHER_TOOL,
} from "@/lib/jd-prompts";
import {
  Match,
  type MatchResponse,
  ParsedRequirement,
  StretchLevel,
  statusAtLevel,
} from "@/lib/jd-schemas";
import { cacheGet, cacheSet, makeCacheKey } from "@/lib/kv-cache";
import { calculateCostUSD, DEFAULT_MODEL } from "@/lib/pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_OUTPUT_TOKENS = 4000;

const RequestSchema = z.object({
  jdHash: z.string().min(1),
  requirements: z.array(ParsedRequirement).min(1).max(20),
});

type ErrorResponse = { ok: false; stage: string; detail?: string };
type SuccessResponse = MatchResponse & { ok: true; cached: boolean; costUSD?: number };

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

  const cv = getCV();
  const projects = getProjects().projects;
  const cvHash = computeCVHash(cv, projects);

  // F2.5: jdHash is intentionally NOT in the cache key. The full `requirements`
  // array is the real entropy — a buggy/malicious client could send a mismatched
  // hash + requirements pair and poison the cache. The request schema still accepts
  // jdHash for API symmetry with the parser response, but caching depends only on
  // what the matcher actually reads (cvHash + requirements). Stretch level is no
  // longer part of the key — one call now scores all three readings (ADR-0042).
  const cacheKey = makeCacheKey({
    endpoint: "/api/jd-match",
    promptVersion: MATCHER_PROMPT_VERSION,
    input: {
      cvHash,
      requirements: body.requirements,
    },
  });

  let cached: MatchResponse | null = null;
  try {
    cached = await cacheGet<MatchResponse>(cacheKey);
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

  const cvText = formatCVForPrompt(cv, projects);
  const userMessage = [
    "## CV evidence",
    "",
    cvText,
    "",
    "## Requirements",
    "",
    JSON.stringify(body.requirements, null, 2),
  ].join("\n");

  let resp: Awaited<ReturnType<typeof client.messages.create>>;
  try {
    resp = await client.messages.create(
      {
        model: DEFAULT_MODEL,
        max_tokens: MAX_OUTPUT_TOKENS,
        system: MATCHER_SYSTEM,
        tools: [MATCHER_TOOL],
        tool_choice: { type: "tool", name: "submit_matches" },
        messages: [{ role: "user", content: userMessage }],
      },
      { signal: req.signal },
    );
  } catch (err) {
    // Client aborted before tokens came back — no usage to cost-log.
    if (err instanceof Anthropic.APIUserAbortError || (err as Error)?.name === "AbortError") {
      return NextResponse.json(
        { ok: false, stage: "client-abort", detail: "client aborted before response" },
        { status: 504 },
      );
    }
    return NextResponse.json(
      { ok: false, stage: "anthropic-call", detail: String(err) },
      { status: 502 },
    );
  }

  // CRITICAL: once we've paid Anthropic, log the cost no matter what comes next.
  // logCost runs before extractToolInput / zod / honesty-validate / cache-set so
  // any downstream failure still leaves a row in the cost table.
  const costUSD = calculateCostUSD(resp.model, resp.usage.input_tokens, resp.usage.output_tokens);
  try {
    await logCost({
      endpoint: "/api/jd-match",
      model: resp.model,
      inputTokens: resp.usage.input_tokens,
      outputTokens: resp.usage.output_tokens,
      costUSD,
      promptVersion: MATCHER_PROMPT_VERSION,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, stage: "cost-log", detail: String(err), costUSD },
      { status: 500 },
    );
  }

  let raw: { matches: unknown };
  try {
    raw = extractToolInput<{ matches: unknown }>(resp, "submit_matches");
  } catch (err) {
    return NextResponse.json(
      { ok: false, stage: "tool-extract", detail: String(err) },
      { status: 502 },
    );
  }

  const matchesParsed = z.array(Match).safeParse(raw.matches);
  if (!matchesParsed.success) {
    return NextResponse.json(
      {
        ok: false,
        stage: "schema-validate",
        detail: matchesParsed.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; "),
      },
      { status: 502 },
    );
  }

  const validation = validateMatches(matchesParsed.data, body.requirements, cv, projects);
  if (!validation.ok) {
    return NextResponse.json(
      { ok: false, stage: "honesty-validate", detail: validation.detail },
      { status: 502 },
    );
  }

  const payload: MatchResponse = { matches: matchesParsed.data };

  try {
    await cacheSet(cacheKey, payload);
  } catch (err) {
    return NextResponse.json(
      { ok: false, stage: "cache-set", detail: String(err), costUSD },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, cached: false, costUSD, ...payload });
}

/**
 * Server-side honesty validation — enforces the rules from ADR-0016 (and the
 * Miss-invariant from ADR-0017) even if the model drifts. The matcher now
 * scores all three readings in one call (ADR-0042), so the rules are checked
 * across every reading. Cheaper than re-prompting; surfaces drift as a 502 so
 * the client never sees a Hit-without-cite or a slid-out-of gap slip through.
 */
// Derived from the schema enum so the validator can never silently skip a
// reading if a level is ever added or renamed.
const STRETCH_READINGS = StretchLevel.options;

function validateMatches(
  matches: import("@/lib/jd-schemas").Match[],
  requirements: import("@/lib/jd-schemas").ParsedRequirement[],
  cv: import("@/lib/schemas").CV,
  projects: import("@/lib/retro-schemas").Project[],
): { ok: true } | { ok: false; detail: string } {
  const reqIds = new Set(requirements.map((r) => r.id));
  const roleBulletIds = new Set<string>();
  for (const r of cv.roles) for (const b of r.bullets) roleBulletIds.add(b.id);
  const projectIds = new Set(cv.projectSlugs.filter((s) => projects.some((p) => p.slug === s)));

  const seenReqs = new Set<string>();
  for (const m of matches) {
    if (!reqIds.has(m.requirementId)) {
      return { ok: false, detail: `unknown requirementId: ${m.requirementId}` };
    }
    if (seenReqs.has(m.requirementId)) {
      return { ok: false, detail: `duplicate match for: ${m.requirementId}` };
    }
    seenReqs.add(m.requirementId);

    const statuses = STRETCH_READINGS.map((reading) => statusAtLevel(m, reading));
    const isMiss = m.baseStatus === "miss";

    // The reading never moves a Miss: it's all-or-nothing across readings, so
    // the visitor can't slide into or out of an honest gap (ADR-0016/0017).
    if (statuses.includes("miss") && !statuses.every((s) => s === "miss")) {
      return {
        ok: false,
        detail: `Miss not consistent across readings for requirement ${m.requirementId} — violates ADR-0016`,
      };
    }
    // The cite array is shared across readings; a Hit at any reading needs one.
    if (statuses.includes("hit") && m.cite.length === 0) {
      return {
        ok: false,
        detail: `Hit without cite for requirement ${m.requirementId} — violates ADR-0016`,
      };
    }
    if (isMiss && !m.gapFraming) {
      return {
        ok: false,
        detail: `Miss without gapFraming for requirement ${m.requirementId} — violates ADR-0016`,
      };
    }
    if (isMiss && m.cite.length > 0) {
      return {
        ok: false,
        detail: `Miss with non-empty cite for requirement ${m.requirementId} — violates ADR-0016`,
      };
    }
    if (new Set(m.cite).size !== m.cite.length) {
      return {
        ok: false,
        detail: `Duplicate cites within match for requirement ${m.requirementId} — violates ADR-0016`,
      };
    }

    for (const ref of m.cite) {
      const [prefix, id] = ref.split(":");
      if (prefix === "role" && id && !roleBulletIds.has(id)) {
        return {
          ok: false,
          detail: `unknown role bullet cite "${ref}" for requirement ${m.requirementId}`,
        };
      }
      if (prefix === "project" && id && !projectIds.has(id)) {
        return {
          ok: false,
          detail: `unknown project cite "${ref}" for requirement ${m.requirementId}`,
        };
      }
    }
  }

  for (const r of requirements) {
    if (!seenReqs.has(r.id)) {
      return { ok: false, detail: `missing match for requirement ${r.id}` };
    }
  }

  return { ok: true };
}
