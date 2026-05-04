import { describe, expect, test } from "vitest";
import { CANNED_RETROS, CANNED_SAMPLE_IDS, pickCannedRetro } from "@/lib/canned-retros";
import { RetroResponse } from "@/lib/retro-schemas";

// Phase 4 — review fix #4: lock the canned fallback set against schema drift.
// Per ADR-0025, the canned retros render through the same component and Zod
// schema as live responses. Without this test, lengthening a canned bullet
// past 400 chars or adding a 9th wentWell would silently emit a fallback that
// fails RetroResponse.parse on the client.

describe("canned retros — schema lock (ADR-0025)", () => {
  for (const id of CANNED_SAMPLE_IDS) {
    test(`CANNED_RETROS["${id}"] passes RetroResponse schema`, () => {
      const result = RetroResponse.safeParse(CANNED_RETROS[id]);
      if (!result.success) {
        const issues = result.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; ");
        throw new Error(`canned retro "${id}" failed validation: ${issues}`);
      }
      expect(result.success).toBe(true);
    });
  }

  test("every CANNED_SAMPLE_ID has a corresponding entry in CANNED_RETROS", () => {
    for (const id of CANNED_SAMPLE_IDS) {
      expect(CANNED_RETROS[id]).toBeDefined();
    }
    expect(Object.keys(CANNED_RETROS).sort()).toEqual([...CANNED_SAMPLE_IDS].sort());
  });
});

describe("pickCannedRetro — verbatim ↔ default routing", () => {
  test("verbatim transcript match returns the keyed sample id", () => {
    const sampleMap = {
      refactor: "[18:02] auth flow",
      debug: "[09:14] deploy issue",
      feature: "[14:01] new feature",
    } as const;
    expect(pickCannedRetro("[09:14] deploy issue", sampleMap)).toBe("debug");
    expect(pickCannedRetro("[18:02] auth flow", sampleMap)).toBe("refactor");
    expect(pickCannedRetro("[14:01] new feature", sampleMap)).toBe("feature");
  });

  test("non-matching transcript falls back to refactor", () => {
    const sampleMap = {
      refactor: "[18:02] auth flow",
      debug: "[09:14] deploy issue",
      feature: "[14:01] new feature",
    } as const;
    expect(pickCannedRetro("something else entirely", sampleMap)).toBe("refactor");
  });

  test("whitespace-trimmed match still resolves", () => {
    const sampleMap = {
      refactor: "[18:02] auth flow",
      debug: "[09:14] deploy issue",
      feature: "[14:01] new feature",
    } as const;
    expect(pickCannedRetro("  [09:14] deploy issue  \n", sampleMap)).toBe("debug");
  });
});
