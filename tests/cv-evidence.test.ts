import { describe, expect, test } from "vitest";
import { getCV, getProjects } from "@/lib/content";
import { computeCVHash, formatCVForPrompt } from "@/lib/cv-evidence";

describe("formatCVForPrompt covers all CV evidence the matcher needs to see", () => {
  // This is the regression test for a real bug caught during Phase 3 pressure
  // testing: education was missing from the prompt, so the matcher told a JD
  // requiring a CS/ML degree that "no degree is mentioned anywhere on the CV".
  // That's false — Oliver has a Philosophy degree. The fix added education to
  // the prompt; this test prevents the same drift recurring.
  const cv = getCV();
  const projects = getProjects().projects;
  const prompt = formatCVForPrompt(cv, projects);

  test("includes every role bullet ID with the role: prefix", () => {
    for (const role of cv.roles) {
      for (const b of role.bullets) {
        expect(prompt, `bullet ${b.id} missing`).toContain(`[role:${b.id}]`);
      }
    }
  });

  test("includes every CV project slug with the project: prefix", () => {
    for (const slug of cv.projectSlugs) {
      expect(prompt, `project ${slug} missing`).toContain(`[project:${slug}]`);
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

  test("includes every bullet's prose verbatim", () => {
    for (const role of cv.roles) {
      for (const b of role.bullets) {
        expect(prompt).toContain(b.text);
      }
    }
  });
});

describe("computeCVHash is stable but version-bumps when evidence changes", () => {
  const cv = getCV();
  const projects = getProjects().projects;

  test("returns a 64-char hex digest", () => {
    const h = computeCVHash(cv, projects);
    expect(h).toHaveLength(64);
    expect(h).toMatch(/^[0-9a-f]+$/);
  });

  test("changes when a bullet's prose is modified", () => {
    const h1 = computeCVHash(cv, projects);
    const mutated = JSON.parse(JSON.stringify(cv));
    mutated.roles[0].bullets[0].text = `${mutated.roles[0].bullets[0].text} (mutated)`;
    const h2 = computeCVHash(mutated, projects);
    expect(h2).not.toBe(h1);
  });

  test("changes when education is added or modified", () => {
    const h1 = computeCVHash(cv, projects);
    const mutated = JSON.parse(JSON.stringify(cv));
    mutated.education[0].notes.push("New note");
    const h2 = computeCVHash(mutated, projects);
    expect(h2).not.toBe(h1);
  });

  test("changes when header.tagline is modified", () => {
    const h1 = computeCVHash(cv, projects);
    const mutated = JSON.parse(JSON.stringify(cv));
    mutated.header.tagline = `${mutated.header.tagline} (mutated)`;
    const h2 = computeCVHash(mutated, projects);
    expect(h2).not.toBe(h1);
  });

  test("changes when header.name is modified", () => {
    const h1 = computeCVHash(cv, projects);
    const mutated = JSON.parse(JSON.stringify(cv));
    mutated.header.name = `${mutated.header.name} (mutated)`;
    const h2 = computeCVHash(mutated, projects);
    expect(h2).not.toBe(h1);
  });

  test("changes when experienceOverview is modified", () => {
    const h1 = computeCVHash(cv, projects);
    const mutated = JSON.parse(JSON.stringify(cv));
    mutated.experienceOverview = `${mutated.experienceOverview} (mutated)`;
    const h2 = computeCVHash(mutated, projects);
    expect(h2).not.toBe(h1);
  });

  test("changes when a referenced project's summary is modified", () => {
    const h1 = computeCVHash(cv, projects);
    const mutated = JSON.parse(JSON.stringify(projects));
    mutated[0].summary = `${mutated[0].summary} (mutated)`;
    const h2 = computeCVHash(cv, mutated);
    expect(h2).not.toBe(h1);
  });
});
