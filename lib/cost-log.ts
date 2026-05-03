import "server-only";
import { kv } from "@vercel/kv";
import { nanoid } from "nanoid";

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
  await kv.set(key, full);
}

export async function getMonthSpend(date = new Date()): Promise<number> {
  const pattern = `cost:${monthKey(date)}:*`;
  let cursor = 0;
  let total = 0;
  do {
    const [next, keys] = await kv.scan(cursor, { match: pattern, count: 100 });
    cursor = Number(next);
    if (keys.length > 0) {
      const entries = await kv.mget<CostEntry[]>(...keys);
      for (const e of entries) {
        if (e?.costUSD) total += e.costUSD;
      }
    }
  } while (cursor !== 0);
  return total;
}
