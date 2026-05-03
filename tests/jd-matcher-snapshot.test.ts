import { describe, expect, test } from "vitest";
import { MATCHER_PROMPT_VERSION, MATCHER_SYSTEM } from "@/lib/jd-prompts";

// Phase 3 spec, task 12: "Snapshot test of worked-example matcher outputs
// (catches drift)". The 7 worked examples in MATCHER_SYSTEM are the most
// load-bearing piece of the matcher prompt — drift here = matcher behaviour
// drifts. Lock them.
//
// Any deliberate edit to the matcher prompt should bump MATCHER_PROMPT_VERSION
// (so cache keys invalidate per ADR-0009), update the snapshot, and reference
// an ADR in the change.

describe("matcher prompt — snapshot lock (Phase 3 task 12)", () => {
  test("MATCHER_PROMPT_VERSION follows jd-matcher@vN shape", () => {
    expect(MATCHER_PROMPT_VERSION).toMatch(/^jd-matcher@v\d+$/);
  });

  test("MATCHER_SYSTEM contains exactly 7 numbered worked examples in canonical order", () => {
    const exampleHeadings = MATCHER_SYSTEM.split("\n")
      .map((line) => line.trim())
      .filter((line) => /^Example \d+ —/.test(line));

    expect(exampleHeadings).toMatchInlineSnapshot(`
      [
        "Example 1 — clear Hit:",
        "Example 2 — clear Stretch (adjacent):",
        "Example 3 — borderline Hit/Stretch (level matters):",
        "Example 4 — Miss stays Miss across levels:",
        "Example 5 — project-cited Hit:",
        "Example 6 — Stretch with no cite (skill-list adjacency):",
        "Example 7 — tech stack listed at role level but no bullet substantiates the claim:",
      ]
    `);
    expect(exampleHeadings).toHaveLength(7);
  });

  test("MATCHER_SYSTEM full text matches the locked snapshot", () => {
    // toMatchSnapshot writes to tests/__snapshots__/jd-matcher-snapshot.test.ts.snap
    // on first run and asserts equality on subsequent runs. Any prompt edit
    // without a snapshot update will fail loudly.
    expect(MATCHER_SYSTEM).toMatchSnapshot();
  });
});
