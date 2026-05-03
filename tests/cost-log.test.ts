import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

type MockEntry = { costUSD: number };

const mockStore = new Map<string, MockEntry>();

vi.mock("@upstash/redis", () => {
  return {
    Redis: {
      fromEnv: () => ({
        set: vi.fn(async (key: string, value: MockEntry) => {
          mockStore.set(key, value);
        }),
        scan: vi.fn(
          async (
            cursor: string | number,
            opts: { match: string; count: number },
          ): Promise<[string, string[]]> => {
            const start = typeof cursor === "string" ? Number.parseInt(cursor, 10) : cursor;
            const re = new RegExp(`^${opts.match.replace("*", ".*")}$`);
            const allKeys = [...mockStore.keys()].filter((k) => re.test(k));
            const next = start + opts.count;
            const slice = allKeys.slice(start, next);
            const cursorOut = next >= allKeys.length ? "0" : String(next);
            return [cursorOut, slice];
          },
        ),
        mget: vi.fn(async (...keys: string[]) => {
          return keys.map((k) => mockStore.get(k) ?? null);
        }),
      }),
    },
  };
});

beforeEach(() => {
  process.env.KV_REST_API_URL = "http://mock";
  process.env.KV_REST_API_TOKEN = "mock";
  mockStore.clear();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("getMonthSpend — string cursor scan loop", () => {
  test("returns 0 when no cost entries logged", async () => {
    const { getMonthSpend } = await import("@/lib/cost-log");
    expect(await getMonthSpend()).toBe(0);
  });

  test("sums costUSD across multiple entries in current month", async () => {
    const month = `${new Date().getUTCFullYear()}-${String(new Date().getUTCMonth() + 1).padStart(2, "0")}`;
    mockStore.set(`cost:${month}:a`, { costUSD: 0.001 });
    mockStore.set(`cost:${month}:b`, { costUSD: 0.002 });
    mockStore.set(`cost:${month}:c`, { costUSD: 0.005 });
    const { getMonthSpend } = await import("@/lib/cost-log");
    expect(await getMonthSpend()).toBeCloseTo(0.008);
  });

  test("scan loop terminates when cursor returns to '0' (the bug this exists to lock down)", async () => {
    const month = `${new Date().getUTCFullYear()}-${String(new Date().getUTCMonth() + 1).padStart(2, "0")}`;
    for (let i = 0; i < 250; i += 1) {
      mockStore.set(`cost:${month}:k${i}`, { costUSD: 0.001 });
    }
    const { getMonthSpend } = await import("@/lib/cost-log");
    expect(await getMonthSpend()).toBeCloseTo(0.25, 5);
  });

  test("ignores entries from other months", async () => {
    const month = `${new Date().getUTCFullYear()}-${String(new Date().getUTCMonth() + 1).padStart(2, "0")}`;
    mockStore.set(`cost:${month}:current`, { costUSD: 0.01 });
    mockStore.set("cost:1999-12:ancient", { costUSD: 999 });
    const { getMonthSpend } = await import("@/lib/cost-log");
    expect(await getMonthSpend()).toBeCloseTo(0.01);
  });
});
