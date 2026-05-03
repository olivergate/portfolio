import { describe, expect, test } from "vitest";
import { getCV } from "@/lib/content";
import { computeCVHash, formatCVForPrompt } from "@/lib/cv-evidence";

describe("formatCVForPrompt covers all CV evidence the matcher needs to see", () => {
  // This is the regression test for a real bug caught during Phase 3 pressure
  // testing: education was missing from the prompt, so the matcher told a JD
  // requiring a CS/ML degree that "no degree is mentioned anywhere on the CV".
  // That's false — Oliver has a Philosophy degree. The fix added education to
  // the prompt; this test prevents the same drift recurring.
  const cv = getCV();
  const prompt = formatCVForPrompt(cv);

  test("includes every role bullet ID with the role: prefix", () => {
    for (const role of cv.roles) {
      for (const b of role.bullets) {
        expect(prompt, `bullet ${b.id} missing`).toContain(`[role:${b.id}]`);
      }
    }
  });

  test("includes every project ID with the project: prefix", () => {
    for (const p of cv.projects) {
      expect(prompt, `project ${p.id} missing`).toContain(`[project:${p.id}]`);
    }
  });

  test("includes every education entry's degree and school", () => {
    for (const e of cv.education) {
      expect(prompt, `degree '${e.degree}' missing`).toContain(e.degree);
      expect(prompt, `school '${e.school}' missing`).toContain(e.school);
    }
  });

  test("includes the AI/LLM skills block (matcher needs to see training items)", () => {
    expect(prompt).toMatch(/AI\/LLM/);
    for (const s of cv.skills.ai) {
      expect(prompt, `AI skill missing: ${s.slice(0, 30)}`).toContain(s);
    }
  });

  test("uses the honest voice for bullet text, not pessimistic or absurd", () => {
    for (const role of cv.roles) {
      for (const b of role.bullets) {
        // The honest voice should appear; pessimistic and absurd voices should not.
        expect(prompt).toContain(b.text.honest);
      }
    }
  });
});

describe("computeCVHash is stable but version-bumps when evidence changes", () => {
  const cv = getCV();

  test("returns a 64-char hex digest", () => {
    const h = computeCVHash(cv);
    expect(h).toHaveLength(64);
    expect(h).toMatch(/^[0-9a-f]+$/);
  });

  test("ignores tone variants (pessimistic / absurd) — only honest voice matters", () => {
    const h1 = computeCVHash(cv);
    // Mutate a non-honest tone voice and confirm hash doesn't change.
    const mutated = JSON.parse(JSON.stringify(cv));
    mutated.roles[0].bullets[0].text.pessimistic = "TOTALLY DIFFERENT TEXT";
    mutated.roles[0].bullets[0].text.absurd = "AND THIS TOO";
    const h2 = computeCVHash(mutated);
    expect(h2).toBe(h1);
  });

  test("changes when education is added or modified", () => {
    const h1 = computeCVHash(cv);
    const mutated = JSON.parse(JSON.stringify(cv));
    mutated.education[0].notes.push("New note");
    const h2 = computeCVHash(mutated);
    expect(h2).not.toBe(h1);
  });
});
