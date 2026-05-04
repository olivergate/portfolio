import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Phase 4 — per-route, per-IP rate limiting for the retro demo.
 *
 * ADR-0010 chose cost-ceiling-as-primary defence and explicitly anticipated
 * "a rate limiter in front of the AI routes is a later, additive change."
 * This is that later. ADR-0022 records that this is *additive*, not
 * superseding — the cost ceiling still gates spend; this gates request rate
 * to handle DOS / abuse-pattern cases the ceiling alone can't.
 *
 * Sliding window (10 requests / 1 hour) via @upstash/ratelimit on the same
 * Upstash Redis instance the cache + cost-log already use. No new infra.
 */

const redis = Redis.fromEnv();

let cachedLimiter: Ratelimit | null = null;

export function getRetroLimiter(): Ratelimit {
  if (cachedLimiter) return cachedLimiter;
  cachedLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 h"),
    prefix: "ratelimit:retro",
    analytics: false,
  });
  return cachedLimiter;
}

/**
 * Best-effort client-IP extraction from a Vercel-fronted Request.
 *
 * Vercel injects `x-forwarded-for` (comma-separated; the first hop is the
 * actual client). `x-real-ip` is the fallback for non-Vercel topologies.
 * If neither header is present (test, local dev without proxy), we group
 * the request into the `unknown` bucket — strict by design: a misconfigured
 * environment shares one bucket and trips the limit instead of bypassing it.
 */
export function getClientIP(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}
