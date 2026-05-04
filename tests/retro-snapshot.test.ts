import { describe, expect, test } from "vitest";
import { RETRO_PROMPT_VERSION, RETRO_SYSTEM, RETRO_TOOL } from "@/lib/retro-prompts";

// Phase 4: lock the retro prompt's shape and full text. Same pattern as
// tests/jd-matcher-snapshot.test.ts — any deliberate edit to the prompt or
// tool schema must bump RETRO_PROMPT_VERSION (per ADR-0009) and update the
// snapshot below. A drift without a version bump fails CI loudly rather than
// silently serving stale cached responses.

describe("retro prompt — snapshot lock (Phase 4)", () => {
  test("RETRO_PROMPT_VERSION follows retro@vN shape", () => {
    expect(RETRO_PROMPT_VERSION).toMatch(/^retro@v\d+$/);
  });

  test("RETRO_SYSTEM names the four sections in canonical order", () => {
    const sectionHeadings = RETRO_SYSTEM.split("\n")
      .map((line) => line.trim())
      .filter((line) => /^\d+\. (wentWell|slowed|learnings|additions) —/.test(line))
      .map((line) => line.split(" —")[0]);

    expect(sectionHeadings).toEqual(["1. wentWell", "2. slowed", "3. learnings", "4. additions"]);
  });

  test("RETRO_TOOL.input_schema requires the four section keys", () => {
    const schema = RETRO_TOOL.input_schema as { required: string[]; properties: object };
    expect(schema.required).toEqual(["wentWell", "slowed", "learnings", "additions"]);
    expect(Object.keys(schema.properties)).toEqual([
      "wentWell",
      "slowed",
      "learnings",
      "additions",
    ]);
  });

  test("RETRO_SYSTEM full text matches the locked snapshot", () => {
    expect(RETRO_SYSTEM).toMatchSnapshot();
  });

  test("RETRO_TOOL.input_schema matches the locked snapshot", () => {
    expect(RETRO_TOOL.input_schema).toMatchSnapshot();
  });
});
