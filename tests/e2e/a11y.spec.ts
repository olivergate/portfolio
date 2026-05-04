import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const SAMPLES = [
  { hash: "", label: "default" },
  { hash: "#d=0&p=0&h=1&m=0", label: "brutalist+dramatic+sparse+static" },
  { hash: "#d=1&p=1&h=0&m=1", label: "refined+flat+dense+kinetic" },
  { hash: "#d=0&p=1&h=1&m=1", label: "refined+dramatic+sparse+kinetic" },
  { hash: "#d=1&p=0&h=0&m=0", label: "brutalist+flat+dense+static" },
];

const ROUTES = [
  // After ADR-0028 (single-page consolidation) /tone redirects to /#tone.
  // The page itself is the same; axe still scopes to .cv-surface.
  { path: "/", label: "cv" },
  { path: "/#tone", label: "tone" },
] as const;

for (const route of ROUTES) {
  test.describe(`axe a11y on ${route.label} at representative slider positions`, () => {
    for (const sample of SAMPLES) {
      test(`no violations — ${route.label} | ${sample.label}`, async ({ page }) => {
        await page.goto(`${route.path}${sample.hash}`);
        await page.waitForFunction(() => document.querySelector(".cv-surface") !== null);
        // Kinetic mode reveals fire on IntersectionObserver with up to 600ms
        // stagger plus a 580ms fade-in transition. Wait long enough that all
        // visible reveals have fully resolved before axe samples colors —
        // otherwise it sees mid-fade opacity values and computes false-positive
        // contrast failures.
        await page.waitForTimeout(1600);

        // Scope axe to the CV surface — the slider deck is hardcoded dark and
        // not part of the WCAG AA check for the page content. The deck's own
        // a11y is verified by its keyboard/touch surface (the invisible <input
        // type=range>), not by contrast against itself.
        const results = await new AxeBuilder({ page }).include(".cv-surface").analyze();

        expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
      });
    }
  });
}

// Tone-state coverage on / across the same five representative slider
// positions. Each tone shifts role blurbs + experience bullets and (for
// absurd) shows the satire banner; axe verifies WCAG AA contrast and the
// ARIA tab pattern under every slider corner the rest of the page is
// already audited at. Pessimistic + Absurd only — Honest is the default,
// already covered by the SAMPLES loop above.
const TONES = [
  { id: "pessimistic", label: "Pessimistic" },
  { id: "absurd", label: "Absurd" },
] as const;

for (const tone of TONES) {
  test.describe(`axe a11y on cv (/) tone=${tone.id} at representative slider positions`, () => {
    for (const sample of SAMPLES) {
      test(`no violations — cv | tone=${tone.id} | ${sample.label}`, async ({ page }) => {
        await page.goto(`/${sample.hash}`);
        await page.waitForFunction(() => document.querySelector(".cv-surface") !== null);
        await page.waitForTimeout(200);

        await page.getByRole("tab", { name: tone.label }).click();
        // Crossfade (280ms) + kinetic reveal stagger (up to ~1200ms) settle.
        await page.waitForTimeout(1600);

        // Include the satire banner (sibling of .cv-surface) so axe sees its
        // contrast + role="status" semantics when absurd is active.
        const builder = new AxeBuilder({ page }).include(".cv-surface");
        if (tone.id === "absurd") builder.include(".satire-banner");
        const results = await builder.analyze();

        expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
      });
    }
  });
}
