import { describe, expect, test } from "vitest";
import {
  levelFromPosition,
  Match,
  ParsedRequirement,
  positionFromLevel,
  SampleChip,
  SampleJDsSchema,
  type StretchLevel,
  statusAtLevel,
} from "@/lib/jd-schemas";

describe("StretchLevel boundaries (ADR-0017)", () => {
  test("levelFromPosition: <0.34 strict", () => {
    expect(levelFromPosition(0)).toBe("strict");
    expect(levelFromPosition(0.15)).toBe("strict");
    expect(levelFromPosition(0.339)).toBe("strict");
  });
  test("levelFromPosition: 0.34..0.66 balanced", () => {
    expect(levelFromPosition(0.34)).toBe("balanced");
    expect(levelFromPosition(0.5)).toBe("balanced");
    expect(levelFromPosition(0.66)).toBe("balanced");
  });
  test("levelFromPosition: >0.66 generous", () => {
    expect(levelFromPosition(0.661)).toBe("generous");
    expect(levelFromPosition(0.85)).toBe("generous");
    expect(levelFromPosition(1)).toBe("generous");
  });
  test("positionFromLevel round-trips through levelFromPosition", () => {
    const levels: StretchLevel[] = ["strict", "balanced", "generous"];
    for (const l of levels) {
      expect(levelFromPosition(positionFromLevel(l))).toBe(l);
    }
  });
});

describe("statusAtLevel preserves Miss across all levels (ADR-0016 / ADR-0017)", () => {
  test("a baseStatus Miss stays Miss at strict and generous if no override given", () => {
    const chip: SampleChip = SampleChip.parse({
      id: "x",
      text: "test",
      baseStatus: "miss",
      cite: [],
      reasoning: "n/a",
    });
    expect(statusAtLevel(chip, "strict")).toBe("miss");
    expect(statusAtLevel(chip, "balanced")).toBe("miss");
    expect(statusAtLevel(chip, "generous")).toBe("miss");
  });
  test("an override applies only at its level (Hit→Stretch at strict)", () => {
    const chip: SampleChip = SampleChip.parse({
      id: "x",
      text: "test",
      baseStatus: "hit",
      strictStatus: "stretch",
      cite: ["role:opensc-1"],
      reasoning: "n/a",
    });
    expect(statusAtLevel(chip, "strict")).toBe("stretch");
    expect(statusAtLevel(chip, "balanced")).toBe("hit");
    expect(statusAtLevel(chip, "generous")).toBe("hit");
  });
  test("rejects a chip that crosses the Stretch/Miss floor across readings (ADR-0017)", () => {
    // A base Miss must not soften to Stretch at generous — the floor is fixed.
    expect(
      SampleChip.safeParse({
        id: "x",
        text: "test",
        baseStatus: "miss",
        generousStatus: "stretch",
        cite: [],
        reasoning: "n/a",
        gapFraming: "honest.",
      }).success,
    ).toBe(false);
    // "miss" is not even a legal override value — a Stretch can't harden to a Miss.
    expect(
      SampleChip.safeParse({
        id: "x",
        text: "test",
        baseStatus: "stretch",
        strictStatus: "miss",
        cite: [],
        reasoning: "n/a",
      }).success,
    ).toBe(false);
  });
});

describe("Cite schema enforces role:/project: prefix (ADR-0016 & H2 fix)", () => {
  test("role:opensc-1 valid", () => {
    const r = Match.safeParse({
      requirementId: "r1",
      baseStatus: "hit",
      cite: ["role:opensc-1"],
      reasoning: "ok",
    });
    expect(r.success).toBe(true);
  });
  test("project:habit-forming-app valid", () => {
    const r = Match.safeParse({
      requirementId: "r1",
      baseStatus: "hit",
      cite: ["project:habit-forming-app"],
      reasoning: "ok",
    });
    expect(r.success).toBe(true);
  });
  test("bare opensc-1 (no prefix) rejected", () => {
    const r = Match.safeParse({
      requirementId: "r1",
      baseStatus: "hit",
      cite: ["opensc-1"],
      reasoning: "ok",
    });
    expect(r.success).toBe(false);
  });
  test("unknown prefix rejected", () => {
    const r = Match.safeParse({
      requirementId: "r1",
      baseStatus: "hit",
      cite: ["bullet:opensc-1"],
      reasoning: "ok",
    });
    expect(r.success).toBe(false);
  });
});

describe("ParsedRequirement bounds", () => {
  test("weight in [0, 1]", () => {
    expect(
      ParsedRequirement.safeParse({ id: "r1", text: "x", category: "hard", weight: -0.1 }).success,
    ).toBe(false);
    expect(
      ParsedRequirement.safeParse({ id: "r1", text: "x", category: "hard", weight: 1.01 }).success,
    ).toBe(false);
    expect(
      ParsedRequirement.safeParse({ id: "r1", text: "x", category: "hard", weight: 0.5 }).success,
    ).toBe(true);
  });
  test("category enum enforced", () => {
    expect(
      ParsedRequirement.safeParse({ id: "r1", text: "x", category: "must-have", weight: 1 })
        .success,
    ).toBe(false);
  });
});

describe("Sample-JDs content file is schema-clean and honest (ADR-0016)", () => {
  // This test re-validates the live content/sample-jds.json against the schema
  // and the structural honesty rule (Hits cite something) — across all three
  // stretch levels, since pre-baked chips bypass the runtime validator.
  test("content/sample-jds.json passes schema and Hit-must-cite at every level", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const raw = fs.readFileSync(path.join(process.cwd(), "content", "sample-jds.json"), "utf8");
    const parsed = SampleJDsSchema.safeParse(JSON.parse(raw));
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    const levels: StretchLevel[] = ["strict", "balanced", "generous"];
    for (const jd of parsed.data) {
      for (const chip of jd.chips) {
        for (const level of levels) {
          if (statusAtLevel(chip, level) === "hit") {
            expect(
              chip.cite.length,
              `${jd.key} chip ${chip.id} resolves to Hit at "${level}" but has no cite`,
            ).toBeGreaterThan(0);
          }
        }
      }
    }
  });

  test("F1.1 regression — a3, a4, r10 must not resolve to Hit at generous", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const raw = fs.readFileSync(path.join(process.cwd(), "content", "sample-jds.json"), "utf8");
    const parsed = SampleJDsSchema.safeParse(JSON.parse(raw));
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    const allChips = parsed.data.flatMap((jd) => jd.chips);
    const findChip = (id: string) => {
      const c = allChips.find((c) => c.id === id);
      expect(c, `chip ${id} not found in sample-jds.json`).toBeDefined();
      return c as SampleChip;
    };
    expect(statusAtLevel(findChip("a3"), "generous")).not.toBe("hit");
    expect(statusAtLevel(findChip("a4"), "generous")).not.toBe("hit");
    expect(statusAtLevel(findChip("r10"), "generous")).not.toBe("hit");
  });
});
