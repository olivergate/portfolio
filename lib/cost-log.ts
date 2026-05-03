import "server-only";
import { Redis } from "@upstash/redis";
import { nanoid } from "nanoid";

const redis = Redis.fromEnv();

export type CostEntry = {
  id: string;
  endpoint: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUSD: number;
  promptVersion: string;
  ts: number;
};

function monthKey(date = new Date()): string {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}`;
}

export async function logCost(entry: Omit<CostEntry, "id" | "ts">): Promise<void> {
  const ts = Date.now();
  const id = nanoid(12);
  const full: CostEntry = { ...entry, id, ts };
  const key = `cost:${monthKey(new Date(ts))}:${id}`;
  await redis.set(key, full);
}

export async function getMonthSpend(date = new Date()): Promise<number> {
  const pattern = `cost:${monthKey(date)}:*`;
  let cursor: string = "0";
  let total = 0;
  do {
    const [next, keys]: [string, string[]] = await redis.scan(cursor, {
      match: pattern,
      count: 100,
    });
    cursor = next;
    if (keys.length > 0) {
      const entries = await redis.mget<CostEntry[]>(...keys);
      for (const e of entries) {
        if (e?.costUSD) total += e.costUSD;
      }
    }
  } while (cursor !== "0");
  return total;
}
