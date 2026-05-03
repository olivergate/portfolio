import "server-only";
import { getMonthSpend } from "./cost-log";

export type CostCeilingResult =
  | { ok: true; current: number; limit: number }
  | { ok: false; current: number; limit: number };

const DEFAULT_LIMIT_USD = 20;

function getLimit(): number {
  const raw = process.env.ANTHROPIC_MONTHLY_LIMIT_USD;
  if (!raw) return DEFAULT_LIMIT_USD;
  const parsed = Number.parseFloat(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_LIMIT_USD;
  return parsed;
}

export async function checkCostCeiling(): Promise<CostCeilingResult> {
  const limit = getLimit();
  const current = await getMonthSpend();
  return { ok: current < limit, current, limit };
}
