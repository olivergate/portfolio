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

describe("statusAtLevel preserves Miss across all levels (ADR-0016)", () => {
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
  test("strictStatus override applies only at strict", () => {
    const chip: SampleChip = SampleChip.parse({
      id: "x",
      text: "test",
      baseStatus: "stretch",
      strictStatus: "miss",
      cite: [],
      reasoning: "n/a",
    });
    expect(statusAtLevel(chip, "strict")).toBe("miss");
    expect(statusAtLevel(chip, "balanced")).toBe("stretch");
    expect(statusAtLevel(chip, "generous")).toBe("stretch");
  });
});

describe("Cite schema enforces role:/project: prefix (ADR-0016 & H2 fix)", () => {
  test("role:opensc-1 valid", () => {
    const r = Match.safeParse({
      requirementId: "r1",
      status: "hit",
      cite: ["role:opensc-1"],
      reasoning: "ok",
    });
    expect(r.success).toBe(true);
  });
  test("project:claude-code-setup valid", () => {
    const r = Match.safeParse({
      requirementId: "r1",
      status: "hit",
      cite: ["project:claude-code-setup"],
      reasoning: "ok",
    });
    expect(r.success).toBe(true);
  });
  test("bare opensc-1 (no prefix) rejected", () => {
    const r = Match.safeParse({
      requirementId: "r1",
      status: "hit",
      cite: ["opensc-1"],
      reasoning: "ok",
    });
    expect(r.success).toBe(false);
  });
  test("unknown prefix rejected", () => {
    const r = Match.safeParse({
      requirementId: "r1",
      status: "hit",
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
  // and the structural honesty rule (Hits cite something).
  test("content/sample-jds.json passes schema and Hit-must-cite", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const raw = fs.readFileSync(path.join(process.cwd(), "content", "sample-jds.json"), "utf8");
    const parsed = SampleJDsSchema.safeParse(JSON.parse(raw));
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    for (const jd of parsed.data) {
      for (const chip of jd.chips) {
        if (chip.baseStatus === "hit") {
          expect(
            chip.cite.length,
            `${jd.key} chip ${chip.id} (Hit) must cite supporting evidence`,
          ).toBeGreaterThan(0);
        }
      }
    }
  });
});
