import { describe, expect, test } from "vitest";
import { stableStringify } from "@/lib/stable-stringify";

describe("stableStringify — cache key parity", () => {
  test("primitives stringify like JSON", () => {
    expect(stableStringify(null)).toBe("null");
    expect(stableStringify(42)).toBe("42");
    expect(stableStringify("hi")).toBe('"hi"');
    expect(stableStringify(true)).toBe("true");
  });

  test("object key order does not affect output", () => {
    const a = stableStringify({ jdText: "ml engineer", stretch: 0.5 });
    const b = stableStringify({ stretch: 0.5, jdText: "ml engineer" });
    expect(a).toBe(b);
  });

  test("nested object key order does not affect output", () => {
    const a = stableStringify({ outer: { x: 1, y: 2 }, k: 3 });
    const b = stableStringify({ k: 3, outer: { y: 2, x: 1 } });
    expect(a).toBe(b);
  });

  test("array order is preserved (semantic — order matters for arrays)", () => {
    expect(stableStringify([1, 2, 3])).not.toBe(stableStringify([3, 2, 1]));
  });

  test("array of objects: each object's keys sort, array order preserved", () => {
    const a = stableStringify([
      { b: 1, a: 2 },
      { d: 3, c: 4 },
    ]);
    const b = stableStringify([
      { a: 2, b: 1 },
      { c: 4, d: 3 },
    ]);
    expect(a).toBe(b);
  });

  test("regression: documents the original makeCacheKey bug", () => {
    // Original code:  JSON.stringify(parts, Object.keys(parts).sort())
    // The 2nd arg is a replacer/whitelist applied at EVERY level — so any
    // key inside `input` that isn't in the top-level whitelist gets stripped.
    // This means two completely different inputs produced the SAME cache key
    // because their `input` payload was wiped to `{}` before hashing.
    const partsA = { endpoint: "/x", promptVersion: "v1", input: { jdText: "ML" } };
    const partsB = { endpoint: "/x", promptVersion: "v1", input: { jdText: "Backend" } };
    const brokenA = JSON.stringify(partsA, Object.keys(partsA).sort());
    const brokenB = JSON.stringify(partsB, Object.keys(partsB).sort());
    // Different inputs collide under the broken serializer:
    expect(brokenA).toBe(brokenB);
    // The fix produces distinct strings for distinct logical values:
    expect(stableStringify(partsA)).not.toBe(stableStringify(partsB));
  });
});
