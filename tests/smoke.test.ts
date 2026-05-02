import { describe, expect, it } from "vitest";
import cvJson from "@/content/cv.json";
import { CVSchema } from "@/lib/schemas";

describe("content/cv.json", () => {
  it("matches the CV schema", () => {
    const result = CVSchema.safeParse(cvJson);
    expect(result.success).toBe(true);
  });

  it("has stable bullet IDs unique within each role", () => {
    const cv = CVSchema.parse(cvJson);
    for (const role of cv.roles) {
      const ids = role.bullets.map((b) => b.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});

describe("style-tokens", () => {
  it("has DEFAULT_STYLE with all four axes at 0.5", async () => {
    const { DEFAULT_STYLE } = await import("@/lib/style-tokens");
    expect(DEFAULT_STYLE).toEqual({
      density: 0.5,
      polish: 0.5,
      hierarchy: 0.5,
      motion: 0.5,
    });
  });
});
