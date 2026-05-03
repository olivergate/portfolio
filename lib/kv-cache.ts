import "server-only";
import { createHash } from "node:crypto";
import { Redis } from "@upstash/redis";
import { stableStringify } from "@/lib/stable-stringify";

const redis = Redis.fromEnv();

export type CacheKeyParts = {
  endpoint: string;
  promptVersion: string;
  input: unknown;
};

export function makeCacheKey(parts: CacheKeyParts): string {
  const canonical = stableStringify(parts);
  const digest = createHash("sha256").update(canonical).digest("hex");
  return `cache:${parts.endpoint}:${parts.promptVersion}:${digest}`;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  return (await redis.get<T>(key)) ?? null;
}

export async function cacheSet<T>(key: string, value: T): Promise<void> {
  await redis.set(key, value);
}
