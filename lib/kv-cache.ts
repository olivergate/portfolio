import "server-only";
import { createHash } from "node:crypto";
import { kv } from "@vercel/kv";

export type CacheKeyParts = {
  endpoint: string;
  promptVersion: string;
  input: unknown;
};

export function makeCacheKey(parts: CacheKeyParts): string {
  const canonical = JSON.stringify(parts, Object.keys(parts).sort());
  const digest = createHash("sha256").update(canonical).digest("hex");
  return `cache:${parts.endpoint}:${parts.promptVersion}:${digest}`;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  return (await kv.get<T>(key)) ?? null;
}

export async function cacheSet<T>(key: string, value: T): Promise<void> {
  await kv.set(key, value);
}
